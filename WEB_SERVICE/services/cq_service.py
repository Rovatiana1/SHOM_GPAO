import pandas as pd
import cv2
import base64
import numpy as np
import os, re, io, sys   # 👈 ajouter sys ici
from datetime import datetime, timedelta
from flask import send_file, jsonify
import math
from scipy.interpolate import interp1d
from WEB_SERVICE.utils.helpers import pixel_to_logical, clean_and_validate_metadata


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

def draw_points_on_image(image_path, image_path_metadata, df, metadata):
    img = None
    tried_paths = []

    # Essayer d'abord image via le lot recuperer
    if image_path:
        img = cv2.imread(image_path)
        tried_paths.append(image_path)

    # Si pas d'image, essayer image metadata
    if img is None and image_path_metadata:
        img = cv2.imread(image_path_metadata)
        tried_paths.append(image_path_metadata)

    print(f"Chemins testés : {tried_paths}")
    # Si toujours None → erreur
    if img is None:
        raise FileNotFoundError(f"❌ Impossible de charger une image. Chemins testés : {tried_paths}")

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

        # Construire la date au format "YYYY-MM-DD"
        date_str = f"{int(row['Année']):04d}-{int(row['Mois']):02d}-{int(row['Jour']):02d}"
        date_list.append(date_str)

    return img, point_coords, date_list # on retourne aussi la liste des dates

def image_to_base64(image):
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

def build_and_export_csv(data: dict, metadata: dict):
    """
    Transforme les points et dates en CSV interpolé,
    sauvegarde le CSV sur le serveur et retourne le chemin pour téléchargement.
    """
    
    print("metadata non clean:", metadata)
    # 1️⃣ Nettoyage des métadonnées
    metadata = clean_and_validate_metadata(metadata)
    
    print("metadata icic:", metadata)
    
    points = data.get('points', [])
    dates = data.get('dates', [])
    duration = float(data.get('duration', 0))  # en minutes
    
    if len(points) < 1 or len(dates) < 1:
        raise ValueError("Aucun point ou date valide fourni.")

    # 2️⃣ Création DataFrame
    df = pd.DataFrame(points, columns=['x', 'y'])
    df['date'] = pd.to_datetime(dates)

    # 3️⃣ Conversion pixels -> logique
    logical_coords = df.apply(lambda row: pixel_to_logical(row['x'], row['y'], metadata), axis=1)
    df['x_logical'] = logical_coords.apply(lambda t: round(t[0], 4))
    df['y_logical'] = logical_coords.apply(lambda t: round(t[1], 4))

    # 4️⃣ Suppression des doublons
    df_initial_size = len(df)
    df.drop_duplicates(subset=['date', 'x_logical', 'y_logical'], inplace=True)
    # 5️⃣ Filtrage par bornes X logiques
    origin_x = float(metadata["origin_value"][0])
    x_end = float(metadata["x_max_value"])
    x_min_bound, x_max_bound = min(origin_x, x_end), max(origin_x, x_end)
    df = df[(df['x_logical'] >= x_min_bound) & (df['x_logical'] <= x_max_bound)].copy()
    
    df = df.sort_values(by=['date', 'x_logical']).reset_index(drop=True)
    if df.empty:
        raise ValueError("Aucun point après filtrage.")

    # 6️⃣ Interpolation pour chaque date
    interval_hours = duration / 60
    all_export_dfs = []

    for current_date, group in df.groupby('date'):
        x_vals = group['x_logical'].values
        y_vals = group['y_logical'].values

        epsilon = 1e-6
        first_x, end_x = x_vals.min(), x_vals.max()

        # Construire la grille d'interpolation
        x_grid = [first_x]
        next_point = math.ceil(first_x / interval_hours) * interval_hours if interval_hours else first_x
        while next_point < end_x - epsilon:
            x_grid.append(next_point)
            next_point += interval_hours
        if abs(end_x - x_grid[-1]) > epsilon:
            x_grid.append(end_x)
        x_grid = np.array(sorted(set([round(val, 6) for val in x_grid])))

        # Interpolation linéaire
        unique_indices = np.argsort(x_vals)
        x_unique, y_unique = x_vals[unique_indices], y_vals[unique_indices]
        mask_unique = np.ones(len(x_unique), dtype=bool)
        if len(x_unique) > 1:
            mask_unique[1:] = np.diff(x_unique) > 1e-6
        x_unique, y_unique = x_unique[mask_unique], y_unique[mask_unique]

        if len(x_unique) < 2:
            y_grid = np.full_like(x_grid, y_unique[0]) if len(x_unique) == 1 else np.array([])
        else:
            interpolator = interp1d(x_unique, y_unique, kind='linear', fill_value='extrapolate')
            y_grid = interpolator(x_grid)

        # Conversion en datetime
        full_datetimes = []
        for dec_hour in x_grid:
            hours = int(dec_hour)
            remaining = dec_hour - hours
            minutes = int(round(remaining * 60))
            seconds = int(round((remaining * 60 - minutes) * 60))
            dt = current_date.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(
                hours=hours, minutes=minutes, seconds=seconds
            )
            full_datetimes.append(dt)

        export_df = pd.DataFrame({
            'DateTime': full_datetimes,
            'Hauteur d\'eau (m)': np.round(y_grid, 2)
        })
        export_df['Année'] = export_df['DateTime'].dt.year
        export_df['Mois'] = export_df['DateTime'].dt.strftime('%m')
        export_df['Jour'] = export_df['DateTime'].dt.strftime('%d')
        export_df['Heure'] = export_df['DateTime'].dt.strftime('%H')
        export_df['Minute'] = export_df['DateTime'].dt.strftime('%M')
        export_df['Seconde'] = export_df['DateTime'].dt.strftime('%S')

        all_export_dfs.append(export_df)

    final_df = pd.concat(all_export_dfs, ignore_index=True)
    final_df = final_df[['Année', 'Mois', 'Jour', 'Heure', 'Minute', 'Seconde', "Hauteur d'eau (m)"]].drop_duplicates()

    # 7️⃣ Construction du nom de fichier et dossier d'export
    img_path = metadata.get('Img_path')
    filename = f"{os.path.splitext(os.path.basename(img_path))[0]}.csv" if img_path and os.path.exists(img_path) \
        else f"mesure_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    base_path = os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))
    export_dir = os.path.join(base_path, "exports")
    os.makedirs(export_dir, exist_ok=True)
    export_path = os.path.join(export_dir, filename)

    # 8️⃣ Sauvegarde CSV avec format numérique correct
    df_to_save = final_df.copy()
    df_to_save['Hauteur d\'eau (m)'] = df_to_save['Hauteur d\'eau (m)'].map(lambda x: f"{x:.2f}".replace('.', ','))
    df_to_save.to_csv(export_path, index=False, sep=';')

    # 9️⃣ Retourne le chemin pour l'envoi via Flask
    return export_path