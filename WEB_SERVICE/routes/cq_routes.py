# WEB_SERVICE/routes/cq_routes.py

from flask import Blueprint
from WEB_SERVICE.controllers.cq_controller import (
    index,
    parse_csv_api,
    save_points,
    export_csv,
    update_metadata,
    get_file_from_path   # ⬅️ importer la nouvelle fonction
)

cq_bp = Blueprint("cq", __name__)

# Routes CQ existantes
cq_bp.route("/", methods=["GET", "POST"])(index)
cq_bp.route("/parse_csv", methods=["POST"])(parse_csv_api)
cq_bp.route("/save_points", methods=["POST"])(save_points)
cq_bp.route("/export", methods=["POST"])(export_csv)
cq_bp.route("/update_metadata", methods=["POST"])(update_metadata)

# Nouvelle route
cq_bp.route("/get_file_from_path", methods=["GET", "POST"])(get_file_from_path)
