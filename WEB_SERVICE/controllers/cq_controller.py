from flask import request, render_template, jsonify, session, send_file
import os, json, io, sys
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from WEB_SERVICE.services.cq_service import (
    parse_metadata_and_data,
    draw_points_on_image,
    image_to_base64,
    clean_and_validate_metadata,
    pixel_to_logical,
    build_and_export_csv
)

# GET / POST /
def index():
    if request.method == 'POST':
        file = request.files['csvfile']
        if file and file.filename.endswith('.csv'):
            os.makedirs("uploads", exist_ok=True)
            csv_path = os.path.join("uploads", file.filename)
            file.save(csv_path)

            try:
                metadata, df = parse_metadata_and_data(csv_path)
                session["metadata"] = json.dumps(metadata)

                image_path = metadata["Img_path"]
                df['date_str'] = df.apply(lambda row: f"{int(row['Année']):04d}-{int(row['Mois']):02d}-{int(row['Jour']):02d}", axis=1)
                img_with_points, point_coords, date_list = draw_points_on_image(image_path, df, metadata)

                encoded_image = image_to_base64(img_with_points)

                return render_template("index.html",
                                       image_data=encoded_image,
                                       point_list=point_coords,
                                       date_list=date_list,
                                       metadata0=json.dumps(metadata))
            except Exception as e:
                return render_template("index.html", error=str(e))
    return render_template("index.html")

# POST /parse_csv
def parse_csv_api():
    try:
        # Récupérer le fichier CSV
        file = request.files.get('csvfile')

        # Récupérer les query params
        image_path = request.args.get("image_path")

        print(f"Received image_path: {image_path}")

        # Vérifier que le CSV est bien fourni
        if file and file.filename.endswith('.csv'):
            os.makedirs("uploads", exist_ok=True)
            csv_path = os.path.join("uploads", file.filename)
            file.save(csv_path)

            try:
                # Extraire métadonnées et dataframe
                metadata, df = parse_metadata_and_data(csv_path)

                # Utiliser soit metadata, soit les query params
                image_path_metadata = metadata.get("Img_path") or image_path

                img_with_points, point_coords, date_list = draw_points_on_image(image_path, image_path_metadata, df, metadata)
                encoded_image = image_to_base64(img_with_points)

                return jsonify({
                    "metadata": metadata,
                    "points": point_coords,
                    "dates": date_list,
                    "image": encoded_image
                })

            except Exception as e:
                print(f"Error processing CSV: {e}", file=sys.stderr)
                return jsonify({"error": str(e)}), 500

        return jsonify({"error": "Invalid CSV"}), 400

    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

# POST /save_points
# def save_points():
#     try:
#         data = request.get_json(silent=True)
#         print("data non clean:", data)
#         metadata = clean_and_validate_metadata(data.get("metadata", {}))
#         session["metadata"] = json.dumps(metadata)        

#         print("metadata save_points:", metadata)
#         export_path = build_and_export_csv(data, metadata)
        
#         # # exporter le fichier csv dans le repertoire OUT_CQ
#         # if not export_path or not os.path.exists(export_path):
#         #     raise FileNotFoundError(f"❌ Échec de l'exportation du CSV à {export_path}")
        
        
#         # print(f"✅ CSV exporté avec succès à {export_path}")

#         # # Envoie le CSV au client
#         # return send_file(
#         #     export_path,
#         #     mimetype="text/csv",
#         #     as_attachment=True,
#         #     download_name=os.path.basename(export_path)
#         # )
#         return jsonify({
#             "status": "success",
#             "message": f"✅ CSV exporté avec succès à {export_path}",
#             "file_path": export_path
#         })
        
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500
    

# POST /save_points
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

# POST /export
# def export_csv():
#     data = request.json
#     points = data.get("points", [])
#     interval = int(data.get("interval", 5))  # minutes
#     base_date = data.get("base_date", "1980-07-16")  # format ISO

#     if len(points) < 2:
#         return jsonify({"error": "Pas assez de points pour interpoler"}), 400

#     # Convertit les points en tableau numpy trié par X
#     sorted_pts = sorted(points, key=lambda p: p[0])
#     xs = np.array([p[0] for p in sorted_pts])
#     ys = np.array([p[1] for p in sorted_pts])

#     # Interpolation linéaire entre les points
#     x_min, x_max = int(xs[0]), int(xs[-1])
#     interval_px = (interval / 60) * (x_max - x_min) / ((xs[-1] - xs[0]) / 60)
#     x_interp = np.arange(x_min, x_max + 1, interval_px)
#     y_interp = np.interp(x_interp, xs, ys)

#     # Conversion temps + hauteur
#     origin_time = datetime.strptime(base_date + " 00:00:00", "%Y-%m-%d %H:%M:%S")
#     total_duration = x_max - x_min
#     time_step = timedelta(seconds=interval * 60)

#     rows = []
#     for i, x in enumerate(x_interp):
#         delta_ratio = (x - x_min) / (x_max - x_min)
#         timestamp = origin_time + (delta_ratio * (x_max - x_min)) * timedelta(seconds=1)
#         y_val = y_interp[i]
#         rows.append([
#             timestamp.year,
#             timestamp.month,
#             timestamp.day,
#             timestamp.hour,
#             timestamp.minute,
#             timestamp.second,
#             round(float(y_val), 3)
#         ])

#     # Export CSV dans un fichier en mémoire
#     output = io.StringIO()
#     output.write("Année;Mois;Jour;Heure;Minute;Seconde;Hauteur d'eau (m)\n")
#     for row in rows:
#         output.write(";".join(map(str, row)).replace('.', ',') + "\n")
#     output.seek(0)

#     return send_file(
#         io.BytesIO(output.getvalue().encode("utf-8")),
#         mimetype="text/csv",
#         as_attachment=True,
#         download_name="export.csv"
#     )

# POST /export
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
    
# POST /update_metadata
def update_metadata():
    data = request.get_json()
    session["metadata"] = json.dumps(data)
    return jsonify({"status": "ok"})

# GET /get_file_from_path
def get_file_from_path():
    """
    Charge un fichier CSV depuis un chemin réseau et renvoie son contenu en JSON.
    """
    try:
        file_path = request.args.get("path")
        if not file_path and request.is_json:
            file_path = request.json.get("path")

        if not file_path:
            return jsonify({"error": "Le paramètre 'path' est requis"}), 400

        file_path = os.path.normpath(file_path)

        if not os.path.exists(file_path):
            return jsonify({"error": f"Fichier introuvable : {file_path}"}), 404

        if not file_path.lower().endswith(".csv"):
            return jsonify({"error": "Seuls les fichiers CSV sont supportés"}), 400

        # Lire le contenu du CSV
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        return jsonify({
            "name": os.path.basename(file_path),
            "content": content
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500