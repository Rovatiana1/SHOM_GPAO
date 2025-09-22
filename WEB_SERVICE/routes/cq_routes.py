from flask import Blueprint
from WEB_SERVICE.controllers.cq_controller import (
    index,
    parse_csv_api,
    save_points,
    export_csv,
    update_metadata
)

# Définition du blueprint
cq_bp = Blueprint("cq", __name__)

# Routes CQ
cq_bp.route("/", methods=["GET", "POST"])(index)
cq_bp.route("/parse_csv", methods=["POST"])(parse_csv_api)
cq_bp.route("/save_points", methods=["POST"])(save_points)
cq_bp.route("/export", methods=["POST"])(export_csv)
cq_bp.route("/update_metadata", methods=["POST"])(update_metadata)
