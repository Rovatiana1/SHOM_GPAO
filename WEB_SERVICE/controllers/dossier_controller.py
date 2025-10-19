from flask import request, jsonify
from WEB_SERVICE.services.dossier_service import DossierService

class DossierController:
    @staticmethod
    def get_all():
        return jsonify(DossierService.get_all()), 200

    @staticmethod
    def get_by_id(id_dossier):
        dossier = DossierService.get_by_id(id_dossier)
        if not dossier:
            return jsonify({"error": "Dossier non trouvé"}), 404
        return jsonify(dossier), 200

    @staticmethod
    def create():
        try:
            data = request.get_json()
            print("📥 Données reçues :", data)
            new_dossier = DossierService.create(data)
            return jsonify(new_dossier), 201
        except Exception as e:
            print("❌ Erreur création dossier :", e)
            return jsonify({"error": str(e)}), 500


    @staticmethod
    def update(id_dossier):
        data = request.get_json()
        updated = DossierService.update(id_dossier, data)
        if not updated:
            return jsonify({"error": "Dossier non trouvé"}), 404
        return jsonify(updated), 200

    @staticmethod
    def delete(id_dossier):
        success = DossierService.delete(id_dossier)
        if not success:
            return jsonify({"error": "Dossier non trouvé"}), 404
        return jsonify({"message": "Dossier supprimé"}), 200
