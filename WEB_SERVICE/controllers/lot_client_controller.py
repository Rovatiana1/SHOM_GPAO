from flask import request, jsonify
from WEB_SERVICE.services.lot_client_service import LotClientService

class LotClientController:
    @staticmethod
    def get_all():
        return jsonify(LotClientService.get_all()), 200

    @staticmethod
    def get_by_id(id_lotclient):
        lc = LotClientService.get_by_id(id_lotclient)
        if not lc:
            return jsonify({"error": "Lot client non trouvé"}), 404
        return jsonify(lc), 200

    @staticmethod
    def create():
        data = request.get_json()
        new_lc = LotClientService.create(data)
        return jsonify(new_lc), 200

    @staticmethod
    def update(id_lotclient):
        data = request.get_json()
        updated = LotClientService.update(id_lotclient, data)
        if not updated:
            return jsonify({"error": "Lot client non trouvé"}), 404
        return jsonify(updated), 200

    @staticmethod
    def delete(id_lotclient):
        success = LotClientService.delete(id_lotclient)
        if not success:
            return jsonify({"error": "Lot client non trouvé"}), 404
        return jsonify({"message": "Lot client supprimé"}), 200
