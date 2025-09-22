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
    file = request.files['csvfile']
    if file and file.filename.endswith('.csv'):
        os.makedirs("uploads", exist_ok=True)
        csv_path = os.path.join("uploads", file.filename)
        file.save(csv_path)

        try:
            metadata, df = parse_metadata_and_data(csv_path)
            image_path = metadata["Img_path"]
            img_with_points, point_coords, date_list = draw_points_on_image(image_path, df, metadata)
            encoded_image = image_to_base64(img_with_points)

            return jsonify({
                "metadata": metadata,
                "points": point_coords,
                "dates": date_list,
                "image": encoded_image
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Invalid CSV"}), 400


# POST /save_points
def save_points():
    try:
        data = request.get_json(silent=True)
        metadata = clean_and_validate_metadata(data.get("metadata", {}))
        session["metadata"] = json.dumps(metadata)

        response = build_and_export_csv(data, metadata)
        return response
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
