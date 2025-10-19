from flask import Blueprint
from WEB_SERVICE.controllers.lot_controller import LotController

lot_bp = Blueprint("lot", __name__)

lot_bp.route("", methods=["GET"])(LotController.get_all)
lot_bp.route("/<int:id_lot>", methods=["GET"])(LotController.get_by_id)
lot_bp.route("", methods=["POST"])(LotController.create)
lot_bp.route("/<int:id_lot>", methods=["PUT"])(LotController.update)
lot_bp.route("/<int:id_lot>", methods=["DELETE"])(LotController.delete)
