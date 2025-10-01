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
def save_points():
    try:
        data = request.get_json(silent=True)
        print("data non clean:", data)
        metadata = clean_and_validate_metadata(data.get("metadata", {}))
        session["metadata"] = json.dumps(metadata)

        print("metadata save_points:", metadata)
        export_path = build_and_export_csv(data, metadata)

        # Envoie le CSV au client
        return send_file(
            export_path,
            mimetype="text/csv",
            as_attachment=True,
            download_name=os.path.basename(export_path)
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    
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