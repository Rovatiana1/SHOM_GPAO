from flask import Flask, render_template, request,session,send_from_directory 
from flask_cors import CORS  # ✅ Importer CORS
import pandas as pd
import cv2
import base64
import os
import json
import numpy as np
from datetime import datetime, timedelta
import math
from scipy.interpolate import interp1d
import re
import os
import sys
import openpyxl
import socket
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# ✅ Activer CORS pour toutes les routes
CORS(app)


from flask import jsonify, send_file
import io
from datetime import datetime, timedelta
import numpy as np
import secrets

app.secret_key = secrets.token_hex(32)
global_metadata =[]
@app.route('/export', methods=['POST'])
def export_csv():
    data = request.json
    points = data.get("points", [])
    interval = int(data.get("interval", 5))  # minutes
    base_date = data.get("base_date", "1980-07-16")  # format ISO

    if len(points) < 2:
        return jsonify({"error": "Pas assez de points pour interpoler"}), 400

    # Convertit les points en tableau numpy trié par X
    sorted_pts = sorted(points, key=lambda p: p[0])
    xs = np.array([p[0] for p in sorted_pts])
    ys = np.array([p[1] for p in sorted_pts])

    # Interpolation linéaire entre les points
    x_min, x_max = int(xs[0]), int(xs[-1])
    interval_px = (interval / 60) * (x_max - x_min) / ((xs[-1] - xs[0]) / 60)
    x_interp = np.arange(x_min, x_max + 1, interval_px)
    y_interp = np.interp(x_interp, xs, ys)

    # Conversion temps + hauteur
    origin_time = datetime.strptime(base_date + " 00:00:00", "%Y-%m-%d %H:%M:%S")
    total_duration = x_max - x_min
    time_step = timedelta(seconds=interval * 60)

    rows = []
    for i, x in enumerate(x_interp):
        delta_ratio = (x - x_min) / (x_max - x_min)
        timestamp = origin_time + (delta_ratio * (x_max - x_min)) * timedelta(seconds=1)
        y_val = y_interp[i]
        rows.append([
            timestamp.year,
            timestamp.month,
            timestamp.day,
            timestamp.hour,
            timestamp.minute,
            timestamp.second,
            round(float(y_val), 3)
        ])

    # Export CSV dans un fichier en mémoire
    output = io.StringIO()
    output.write("Année;Mois;Jour;Heure;Minute;Seconde;Hauteur d'eau (m)\n")
    for row in rows:
        output.write(";".join(map(str, row)).replace('.', ',') + "\n")
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name="export.csv"
    )

def parse_metadata_and_data(csv_path):
    metadata = {}
    header_index = None

    with open(csv_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if line.strip().startswith("#"):
                key_value = line[1:].strip().split(":", 1)
                if len(key_value) == 2:
                    key, value = key_value[0].strip(), key_value[1].strip()
                    metadata[key] = value
            elif "Année" in line:
                header_index = i
                break

    if header_index is None:
        raise Exception("❌ En-tête de données non trouvée dans le fichier CSV.")

    df = pd.read_csv(csv_path, sep=';', skiprows=header_index, decimal=',')
    
    return metadata, df

def draw_points_on_image(image_path, df, metadata):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"❌ Image introuvable : {image_path}")
    point_coords = []
    date_list = []

    origin_x, origin_y = eval(metadata["origin_px"])
    x_max_x, _ = eval(metadata["x_max_px"])
    _, y_max_y = eval(metadata["y_max_px"])
    x_max_value = float(metadata["x_max_value"])
    y_max_value = float(metadata["y_max_value"])

    for _, row in df.iterrows():
        heure = int(row["Heure"])
        minute = int(row["Minute"])
        hauteur = float(row["Hauteur d'eau (m)"])
        heure_dec = heure + minute / 60.0

        x = origin_x + (heure_dec / x_max_value) * (x_max_x - origin_x)
        y = origin_y - (hauteur / y_max_value) * (origin_y - y_max_y)

        x, y = int(round(x)), int(round(y))
        point_coords.append([x, y])

        # Construit la date au format "YYYY-MM-DD"
        date_str = f"{int(row['Année']):04d}-{int(row['Mois']):02d}-{int(row['Jour']):02d}"
        date_list.append(date_str)

    return img, point_coords, date_list  # on retourne aussi la liste des dates

@app.route("/update_metadata", methods=["POST"])
def update_metadata():
    data = request.get_json()
    session["metadata"] = json.dumps(data)
    print("✅ Metadata reçue du frontend :", data)
    return jsonify({"status": "ok"})

def image_to_base64(image):
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

def clean_and_validate_metadata(raw_metadata):
    """
    Prend un dictionnaire de métadonnées brutes (avec des chaînes de tuples/listes/nombres)
    et les convertit en types Python appropriés (tuples, listes, nombres), puis les valide.
    """
    cleaned_metadata = {}

    for key, value_str in raw_metadata.items():
        # Si la valeur n'est pas une chaîne, on la garde telle quelle
        if not isinstance(value_str, str):
            cleaned_metadata[key] = value_str
            continue

        # Regex pour les formats (X, Y) ou [X, Y]
        # On capture les parenthèses ou crochets de début/fin pour déterminer le type final
        match_tuple_or_list = re.match(r"([\[\(])(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)([\]\)])", value_str)
        
        if match_tuple_or_list:
            opener = match_tuple_or_list.group(1) # '(' ou '['
            closer = match_tuple_or_list.group(4) # ')' ou ']'
            num1_str = match_tuple_or_list.group(2)
            num2_str = match_tuple_or_list.group(3)

            # Vérifier que les parenthèses/crochets sont bien appariés
            if (opener == '(' and closer == ')') or \
               (opener == '[' and closer == ']'):
                try:
                    num1 = float(num1_str)
                    num2 = float(num2_str)

                    # Si le format original était un tuple, on crée un tuple
                    if opener == '(':
                        value = (num1, num2)
                    # Si le format original était une liste, on crée une liste
                    else: # opener == '['
                        value = [num1, num2]

                except ValueError:
                    raise ValueError(f"Impossible de convertir les nombres dans le tuple/liste pour la clé '{key}': '{value_str}'")
            else:
                raise ValueError(f"Parenthèses/crochets mal appariés pour la clé '{key}': '{value_str}'")
        else:
            # Si ce n'est pas un format (X,Y) ou [X,Y], on essaie de convertir en nombre simple
            try:
                value = float(value_str)
                if value.is_integer(): # Si c'est un entier comme '24.0', on peut le garder en int
                    value = int(value)
            except ValueError:
                # Si ce n'est ni un tuple/liste, ni un nombre, on garde la string (ex: chemin de fichier)
                value = value_str
        
        cleaned_metadata[key] = value
    
    # --- Assertions pour valider la structure et les types après conversion ---
    # Ces assertions s'adapteront car 'origin_value' sera maintenant une liste si c'était '[X,Y]'
    required_keys = ['origin_px', 'origin_value', 'x_max_px', 'y_max_px', 'x_max_value', 'y_max_value', 'Img_path']
    for key in required_keys:
        assert key in cleaned_metadata, f"Clé '{key}' manquante dans les métadonnées après nettoyage."

    # Asserts sur les types spécifiques
    # Pour 'origin_px', 'x_max_px', 'y_max_px', on peut généralement s'attendre à des tuples
    assert isinstance(cleaned_metadata['origin_px'], tuple) and len(cleaned_metadata['origin_px']) == 2, \
        f"origin_px doit être un tuple de 2 éléments, type actuel: {type(cleaned_metadata['origin_px'])}, valeur: {cleaned_metadata['origin_px']}"
    assert isinstance(cleaned_metadata['x_max_px'], tuple) and len(cleaned_metadata['x_max_px']) == 2, \
        f"x_max_px doit être un tuple de 2 éléments, type actuel: {type(cleaned_metadata['x_max_px'])}, valeur: {cleaned_metadata['x_max_px']}"
    assert isinstance(cleaned_metadata['y_max_px'], tuple) and len(cleaned_metadata['y_max_px']) == 2, \
        f"y_max_px doit être un tuple de 2 éléments, type actuel: {type(cleaned_metadata['y_max_px'])}, valeur: {cleaned_metadata['y_max_px']}"
    
    # Pour 'origin_value', l'assertion doit accepter LISTE ou TUPLE
    assert isinstance(cleaned_metadata['origin_value'], (list, tuple)) and len(cleaned_metadata['origin_value']) == 2, \
        f"origin_value doit être un tuple ou une liste de 2 éléments, type actuel: {type(cleaned_metadata['origin_value'])}, valeur: {cleaned_metadata['origin_value']}"
    
    assert isinstance(cleaned_metadata['x_max_value'], (int, float)), \
        f"x_max_value doit être un nombre, type actuel: {type(cleaned_metadata['x_max_value'])}, valeur: {cleaned_metadata['x_max_value']}"
    assert isinstance(cleaned_metadata['y_max_value'], (int, float)), \
        f"y_max_value doit être un nombre, type actuel: {type(cleaned_metadata['y_max_value'])}, valeur: {cleaned_metadata['y_max_value']}"

    assert isinstance(cleaned_metadata['Img_path'], str), \
        f"Img_path doit être une chaîne de caractères, type actuel: {type(cleaned_metadata['Img_path'])}, valeur: {cleaned_metadata['Img_path']}"

    return cleaned_metadata

def check_port_in_use(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", port))
        s.close()
        return False  # Port libre
    except socket.error:
        return True   # Port occupé

# if check_port_in_use(5000):
#     print("Une instance est déjà en cours.")
#     sys.exit(0)

def pixel_to_logical(px, py, metadata):
    
    origin_x, origin_y = (metadata["origin_px"])
    x_max_x, _ = (metadata["x_max_px"])
    _, y_max_y = (metadata["y_max_px"])

    
    origin_value = (metadata["origin_value"])
    origin_x_value = float((origin_value)[0])
    origin_y_value = float((origin_value)[1])
    


    x_end_value = float(metadata["x_max_value"]) 
    # y_max_value représente la VALEUR FINALE de l'axe Y (Ex: 3.0 pour 3 mètres)
    y_end_value = float(metadata["y_max_value"])

    
    logical_x_range_length = x_end_value - origin_x_value
    # La plage réelle de l'axe Y est (y_end_value - origin_y_value)
    logical_y_range_length = y_end_value - origin_y_value

    # Calculer les différences en pixels
    dx_pixels = x_max_x - origin_x
    # Pour Y, l'axe est inversé, donc la différence est origin_y - y_max_y
    dy_pixels = origin_y - y_max_y


    delta_x = logical_x_range_length / dx_pixels if dx_pixels != 0 else 0 
    delta_y = logical_y_range_length / dy_pixels if dy_pixels != 0 else 0 


    logical_x = (px - origin_x) * delta_x + origin_x_value
    logical_y = (origin_y - py) * delta_y + origin_y_value
    
    return round(logical_x, 2), round(logical_y, 2)

@app.route('/save_points', methods=['POST'])
def save_points():
    data = {}
    json_data = request.get_json(silent=True)
    
    if json_data:
        data = json_data
    elif request.form.get('data'):
        try:
            data = json.loads(request.form.get('data'))
        except json.JSONDecodeError:
            return jsonify({"status": "error", "message": "Format de données invalide dans le formulaire."}), 400
    else:
        return jsonify({"status": "error", "message": "Aucune donnée valide reçue."}), 400

    duration = float(data.get('duration'))  # en minutes
    points = data.get('points', [])
    dates = data.get('dates', [])
    metadata = data.get('metadata', {})
    metadata = clean_and_validate_metadata(metadata)
    session["metadata"] = json.dumps(metadata) # Stocke les métadonnées nettoyées dans la session
    
    df = pd.DataFrame(points, columns=['x', 'y'])
    
    
    df['date'] = pd.to_datetime(dates)
    
    logical_coords = df.apply(lambda row: pixel_to_logical(row['x'], row['y'], metadata), axis=1)
    df['x_logical'] = logical_coords.apply(lambda t: round(t[0], 4))
    df['y_logical'] = logical_coords.apply(lambda t: round(t[1], 4))

    df_initial_size = len(df)
    df.drop_duplicates(subset=['date', 'x_logical', 'y_logical'], inplace=True)
    if len(df) < df_initial_size:
        print(f"⚠️ {df_initial_size - len(df)} doublons initiaux supprimés")
    # Récupérer les valeurs de l'origine et de x_max
    origin_x_value = float(metadata["origin_value"][0])
    x_end_value = float(metadata["x_max_value"])

    # Définir les bornes min et max pour le filtrage
    
    x_min_bound = min(origin_x_value, x_end_value)
    x_max_bound = max(origin_x_value, x_end_value)

    # Filtrer le DataFrame
    initial_filtered_size = len(df)
    df = df[(df['x_logical'] >= x_min_bound) & (df['x_logical'] <= x_max_bound)].copy()
    if len(df) < initial_filtered_size:
        print(f"⚠️ {initial_filtered_size - len(df)} points hors de la plage X logique [{x_min_bound:.2f}, {x_max_bound:.2f}] supprimés.")
    df = df.sort_values(by=['date', 'x_logical']).reset_index(drop=True)

    if df.empty:
        return jsonify({"status": "error", "message": "Aucun point reçu."})

    interval_hours = duration / 60  # Conversion minutes -> heures
    all_export_dfs = []
    df.to_excel("debug.xlsx")
    for current_date, group in df.groupby('date'):
        x_vals = group['x_logical'].values # Heures décimales des points de cette date
        y_vals = group['y_logical'].values

        epsilon = 1e-6
        first_x_current_group = x_vals.min()
        end_x_current_group = x_vals.max()

        if interval_hours == 0:  # Éviter division par zéro
            x_grid = [first_x_current_group]
        else:
            x_grid = [first_x_current_group]  # Toujours inclure le premier point réel

            # Calculer le premier multiple de interval_hours >= first_x_current_group
            next_grid_point = math.ceil(first_x_current_group / interval_hours) * interval_hours

            # Ajouter tous les multiples entre next_grid_point et end_x_current_group
            while next_grid_point < end_x_current_group - epsilon:
                x_grid.append(next_grid_point)
                next_grid_point += interval_hours

            # Ajouter le dernier point réel si ce n'est pas déjà présent
            if abs(end_x_current_group - x_grid[-1]) > epsilon:
                x_grid.append(end_x_current_group)

        # Tri et arrondi pour éviter les problèmes de flottants
        x_grid = sorted(set([round(val, 6) for val in x_grid]))


        x_grid_np = np.array(x_grid)
        
        # S'assurer que les x_vals sont uniques et triés pour interp1d
        unique_x_indices = np.argsort(x_vals)
        x_vals_unique = x_vals[unique_x_indices]
        y_vals_unique = y_vals[unique_x_indices]
        
        # Dédoublonnage robuste pour l'interpolation si nécessaire (sur X)
        unique_interp_mask = np.ones(len(x_vals_unique), dtype=bool)
        if len(x_vals_unique) > 1:
            unique_interp_mask[1:] = np.diff(x_vals_unique) > 1e-6
        x_vals_unique = x_vals_unique[unique_interp_mask]
        y_vals_unique = y_vals_unique[unique_interp_mask]

        # Interpolation
        if len(x_vals_unique) < 2:
            if len(x_vals_unique) == 1:
                y_grid = np.full_like(x_grid_np, y_vals_unique[0])
            else:
                y_grid = np.array([])
        else:
            # Assurez-vous que scipy.interpolate.interp1d est importé en haut du fichier
            interpolator = interp1d(x_vals_unique, y_vals_unique, kind='linear', fill_value='extrapolate')
            y_grid = interpolator(x_grid_np)

        # Combinaison et tri final
        x_combined = x_grid_np
        y_combined = y_grid
        
        sort_indices = np.argsort(x_combined)
        x_combined = x_combined[sort_indices]
        y_combined = y_combined[sort_indices]
        
        unique_mask = np.ones(len(x_combined), dtype=bool)
        if len(x_combined) > 1:
            unique_mask[1:] = np.diff(x_combined) > 1e-6 

        x_combined = x_combined[unique_mask]
        y_combined = y_combined[unique_mask]

        # Conversion heures décimales -> datetime
        full_datetimes = []
        for dec_hour in x_combined:
            hours = int(dec_hour)
            remaining = dec_hour - hours
            minutes = int(round(remaining * 60))
            seconds = int(round((remaining * 60 - minutes) * 60))
            
            if minutes >= 60:
                hours += 1
                minutes = 0
            if seconds >= 60:
                minutes += 1
                seconds = 0
            
            dt = current_date.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(
                hours=hours, 
                minutes=minutes,
                seconds=seconds
            )
            full_datetimes.append(dt)

        export_df = pd.DataFrame({
            'DateTime': full_datetimes,
            'Hauteur d\'eau (m)': np.round(y_combined, 2)
        })

        export_df['Année'] = export_df['DateTime'].dt.year 
        export_df['Mois'] = export_df['DateTime'].dt.strftime('%m')
        export_df['Jour'] = export_df['DateTime'].dt.strftime('%d')
        export_df['Heure'] = export_df['DateTime'].dt.strftime('%H')
        export_df['Minute'] = export_df['DateTime'].dt.strftime('%M')
        export_df['Seconde'] = export_df['DateTime'].dt.strftime('%S')

        all_export_dfs.append(export_df)

    final_export_df = pd.concat(all_export_dfs, ignore_index=True)
    final_export_df = final_export_df[
        ['Année', 'Mois', 'Jour', 'Heure', 'Minute', 'Seconde', "Hauteur d'eau (m)"]
    ].drop_duplicates()
    
    img_path = metadata.get('Img_path')
    if img_path and os.path.exists(img_path): # Ajoutez une vérification que le chemin existe vraiment
        img_filename = os.path.basename(img_path)
        csv_base_name = os.path.splitext(img_filename)[0]
        filename = f"{csv_base_name}.csv" 
    else:
        filename = f"mesure_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        print(f"⚠️ 'Img_path' non trouvé ou invalide dans les métadonnées. Utilisation du nom par défaut : {filename}")

    if getattr(sys, 'frozen', False):
        # Si l'application est "gelée" par PyInstaller, le répertoire de base est celui de l'exécutable.
        application_base_path = os.path.dirname(sys.executable)
    else:
        # Sinon, c'est le répertoire du script Python.
        application_base_path = os.path.dirname(os.path.abspath(__file__))

    export_dir = os.path.join(application_base_path, "exports") # Vous pouvez renommer en "exports" si vous préférez

    # 3. Créer le dossier d'exportation s'il n'existe pas déjà.
    os.makedirs(export_dir, exist_ok=True) 
    
    # 4. Construire le chemin complet du fichier CSV à sauvegarder.
    export_path = os.path.join(export_dir, filename)

    # 5. Appliquer la transformation de format de nombre juste avant l'exportation.
    final_export_df_copy = final_export_df.copy() # Travaille sur une copie pour éviter de modifier le DataFrame original
    final_export_df_copy['Hauteur d\'eau (m)'] = final_export_df_copy['Hauteur d\'eau (m)'].map(lambda x: f"{x:.2f}".replace('.', ','))
    
    # 6. Sauvegarder le CSV de manière permanente sur le disque.
    try:
        final_export_df_copy.to_csv(export_path, index=False, sep=';')
        print(f"✅ Fichier CSV sauvegardé de manière permanente sur le serveur à : {export_path}")
    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde du fichier CSV à {export_path}: {e}")
        return jsonify({"status": "error", "message": f"Erreur serveur lors de la sauvegarde du fichier : {e}"}), 500

    print(metadata) # Utile pour le débogage
    
    # 7. Envoyer le fichier au navigateur de l'utilisateur.
    # send_file lira le fichier depuis l'emplacement permanent que vous avez spécifié.
    response = send_file(
        path_or_file=export_path,
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename # C'est le nom suggéré au navigateur pour le téléchargement
    )

    # 8. (Optionnel) Un log pour confirmer l'envoi, sans supprimer le fichier.
    @response.call_on_close
    def log_file_sent():
        print(f"Fichier '{filename}' envoyé au client depuis '{export_path}' (et conservé sur le serveur).")

    return response

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        file = request.files['csvfile']
        if file and file.filename.endswith('.csv'):
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            csv_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(csv_path)

            try:
                metadata, df = parse_metadata_and_data(csv_path)
                print(metadata)
                session["metadata"] = json.dumps(metadata)
                image_path = metadata["Img_path"]
                df['date_str'] = df.apply(lambda row: f"{int(row['Année']):04d}-{int(row['Mois']):02d}-{int(row['Jour']):02d}", axis=1)
                img_with_points, point_coords, date_list = draw_points_on_image(image_path, df, metadata)
                df_coords = pd.DataFrame(point_coords, columns=['x', 'y'])
                df_merged = pd.concat([df.reset_index(drop=True), df_coords], axis=1)
                
                encoded_image = image_to_base64(img_with_points)
                point_coords_with_date = [
                    [x, y, date]
                    for (x, y), date in zip(point_coords, df['date_str'])
                ]
                return render_template("index.html",
                                       image_data=encoded_image,
                                       point_list=point_coords,
                                       date_list=date_list,
                                       metadata0=json.dumps(metadata))
            except Exception as e:
                return render_template("index.html", error=str(e))

    return render_template("index.html")

# app.py

@app.route('/parse_csv', methods=['POST'])
def parse_csv_api():
    file = request.files['csvfile']
    if file and file.filename.endswith('.csv'):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        csv_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(csv_path)

        try:
            metadata, df = parse_metadata_and_data(csv_path)
            image_path = metadata["Img_path"]
            img_with_points, point_coords, date_list = draw_points_on_image(image_path, df, metadata)
            encoded_image = image_to_base64(img_with_points)

            return jsonify({
                "metadata": metadata,
                "points": point_coords,      # liste [[x,y], ...]
                "dates": date_list,          # liste ["YYYY-MM-DD", ...]
                "image": encoded_image       # base64 PNG
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid CSV"}), 400

if __name__ == '__main__':
    app.run(debug=True)
