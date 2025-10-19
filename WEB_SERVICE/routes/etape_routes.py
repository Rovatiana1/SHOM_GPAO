from flask import Blueprint
from WEB_SERVICE.controllers.etape_controller import EtapeController

etape_bp = Blueprint("etape", __name__)

etape_bp.route("", methods=["GET"])(EtapeController.get_all)
etape_bp.route("/<int:id_etape>", methods=["GET"])(EtapeController.get_by_id)
etape_bp.route("", methods=["POST"])(EtapeController.create)
etape_bp.route("/<int:id_etape>", methods=["PUT"])(EtapeController.update)
etape_bp.route("/<int:id_etape>", methods=["DELETE"])(EtapeController.delete)
