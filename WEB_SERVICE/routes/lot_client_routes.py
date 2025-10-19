from flask import Blueprint
from WEB_SERVICE.controllers.lot_client_controller import LotClientController

lot_client_bp = Blueprint("lot_client", __name__)

lot_client_bp.route("", methods=["GET"])(LotClientController.get_all)
lot_client_bp.route("/<int:id_lotclient>", methods=["GET"])(LotClientController.get_by_id)
lot_client_bp.route("", methods=["POST"])(LotClientController.create)
lot_client_bp.route("/<int:id_lotclient>", methods=["PUT"])(LotClientController.update)
lot_client_bp.route("/<int:id_lotclient>", methods=["DELETE"])(LotClientController.delete)
