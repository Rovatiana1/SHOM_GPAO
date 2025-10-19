from flask import jsonify
from WEB_SERVICE.services.user_service import UserService

class UserController:
    @staticmethod
    def get_all():
        try:
            users = UserService.get_all()
            return jsonify(users), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_by_id(user_id):
        try:
            user = UserService.get_by_id(user_id)
            if not user:
                return jsonify({"error": "Utilisateur introuvable"}), 404
            return jsonify(user), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create(data):
        try:
            user = UserService.create(data)
            return jsonify(user), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update(user_id, data):
        try:
            user = UserService.update(user_id, data)
            if not user:
                return jsonify({"error": "Utilisateur introuvable"}), 404
            return jsonify(user), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete(user_id):
        try:
            success = UserService.delete(user_id)
            if not success:
                return jsonify({"error": "Utilisateur introuvable"}), 404
            return jsonify({"message": "Utilisateur supprimé"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
