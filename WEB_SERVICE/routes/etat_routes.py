from flask import Blueprint
from WEB_SERVICE.controllers.etat_controller import EtatController

etat_bp = Blueprint("etat", __name__)

etat_bp.route("", methods=["GET"])(EtatController.get_all)
etat_bp.route("/<int:id_etat>", methods=["GET"])(EtatController.get_by_id)
etat_bp.route("", methods=["POST"])(EtatController.create)
etat_bp.route("/<int:id_etat>", methods=["PUT"])(EtatController.update)
etat_bp.route("/<int:id_etat>", methods=["DELETE"])(EtatController.delete)
