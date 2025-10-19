from flask import request, jsonify
from WEB_SERVICE.services.ldt_service import LdtService

class LdtController:
    @staticmethod
    def get_all():
        return jsonify(LdtService.get_all()), 200

    @staticmethod
    def get_by_id(id_ldt):
        ldt = LdtService.get_by_id(id_ldt)
        if not ldt:
            return jsonify({"error": "LDT non trouvé"}), 404
        return jsonify(ldt), 200

    @staticmethod
    def create():
        data = request.get_json()
        new_ldt = LdtService.create(data)
        return jsonify(new_ldt), 201

    @staticmethod
    def update(id_ldt):
        data = request.get_json()
        updated = LdtService.update(id_ldt, data)
        if not updated:
            return jsonify({"error": "LDT non trouvé"}), 404
        return jsonify(updated), 200

    @staticmethod
    def delete(id_ldt):
        success = LdtService.delete(id_ldt)
        if not success:
            return jsonify({"error": "LDT non trouvé"}), 404
        return jsonify({"message": "LDT supprimé"}), 200
