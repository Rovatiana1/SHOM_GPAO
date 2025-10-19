from flask import request, jsonify
from WEB_SERVICE.services.lot_service import LotService

class LotController:
    @staticmethod
    def get_all():
        return jsonify(LotService.get_all()), 200

    @staticmethod
    def get_by_id(id_lot):
        lot = LotService.get_by_id(id_lot)
        if not lot:
            return jsonify({"error": "Lot non trouvé"}), 404
        return jsonify(lot), 200

    @staticmethod
    def create():
        data = request.get_json()
        new_lot = LotService.create(data)
        return jsonify(new_lot), 201

    @staticmethod
    def update(id_lot):
        data = request.get_json()
        updated = LotService.update(id_lot, data)
        if not updated:
            return jsonify({"error": "Lot non trouvé"}), 404
        return jsonify(updated), 200

    @staticmethod
    def delete(id_lot):
        success = LotService.delete(id_lot)
        if not success:
            return jsonify({"error": "Lot non trouvé"}), 404
        return jsonify({"message": "Lot supprimé"}), 200
