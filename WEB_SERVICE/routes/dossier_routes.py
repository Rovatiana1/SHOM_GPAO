from flask import Blueprint
from WEB_SERVICE.controllers.dossier_controller import DossierController

dossier_bp = Blueprint("dossier", __name__)

dossier_bp.route("", methods=["GET"])(DossierController.get_all)
dossier_bp.route("/<int:id_dossier>", methods=["GET"])(DossierController.get_by_id)
dossier_bp.route("", methods=["POST"])(DossierController.create)
dossier_bp.route("/<int:id_dossier>", methods=["PUT"])(DossierController.update)
dossier_bp.route("/<int:id_dossier>", methods=["DELETE"])(DossierController.delete)
