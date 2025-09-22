from flask import jsonify
from WEB_SERVICE.services.auth_service import AuthService

class AuthController:
    @staticmethod
    def login(data):
        try:
            login = data.get("login")
            password = data.get("password")

            if not login or not password:
                return jsonify({"error": "Missing login or password"}), 400

            dataUserConnected = AuthService.authenticate(login, password)
            if not dataUserConnected:
                return jsonify({"error": "Invalid credentials"}), 401

            return jsonify(dataUserConnected), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500
