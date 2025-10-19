from flask import request, jsonify
from WEB_SERVICE.services.etape_service import EtapeService

class EtapeController:
    @staticmethod
    def get_all():
        return jsonify(EtapeService.get_all()), 200

    @staticmethod
    def get_by_id(id_etape):
        etape = EtapeService.get_by_id(id_etape)
        if not etape:
            return jsonify({"error": "Étape non trouvée"}), 404
        return jsonify(etape), 200

    @staticmethod
    def create():
        data = request.get_json()
        new_etape = EtapeService.create(data)
        return jsonify(new_etape), 201

    @staticmethod
    def update(id_etape):
        data = request.get_json()
        updated = EtapeService.update(id_etape, data)
        if not updated:
            return jsonify({"error": "Étape non trouvée"}), 404
        return jsonify(updated), 200

    @staticmethod
    def delete(id_etape):
        success = EtapeService.delete(id_etape)
        if not success:
            return jsonify({"error": "Étape non trouvée"}), 404
        return jsonify({"message": "Étape supprimée"}), 200
