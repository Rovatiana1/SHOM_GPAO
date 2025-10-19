from flask import request, jsonify
from WEB_SERVICE.services.etat_service import EtatService

class EtatController:
    @staticmethod
    def get_all():
        return jsonify(EtatService.get_all()), 200

    @staticmethod
    def get_by_id(id_etat):
        etat = EtatService.get_by_id(id_etat)
        if not etat:
            return jsonify({"error": "État non trouvé"}), 404
        return jsonify(etat), 200

    @staticmethod
    def create():
        data = request.get_json()
        new_etat = EtatService.create(data)
        return jsonify(new_etat), 201

    @staticmethod
    def update(id_etat):
        data = request.get_json()
        updated = EtatService.update(id_etat, data)
        if not updated:
            return jsonify({"error": "État non trouvé"}), 404
        return jsonify(updated), 200

    @staticmethod
    def delete(id_etat):
        success = EtatService.delete(id_etat)
        if not success:
            return jsonify({"error": "État non trouvé"}), 404
        return jsonify({"message": "État supprimé"}), 200
