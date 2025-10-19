from flask import Blueprint
from WEB_SERVICE.controllers.ldt_controller import LdtController

ldt_bp = Blueprint("ldt", __name__)

ldt_bp.route("", methods=["GET"])(LdtController.get_all)
ldt_bp.route("/<int:id_ldt>", methods=["GET"])(LdtController.get_by_id)
ldt_bp.route("", methods=["POST"])(LdtController.create)
ldt_bp.route("/<int:id_ldt>", methods=["PUT"])(LdtController.update)
ldt_bp.route("/<int:id_ldt>", methods=["DELETE"])(LdtController.delete)
