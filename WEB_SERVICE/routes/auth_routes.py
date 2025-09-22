from flask import Blueprint, request
from WEB_SERVICE.controllers.auth_controller import AuthController

auth_bp = Blueprint("auth", __name__)

# POST /api/auth/ldaps
@auth_bp.route("/ldaps", methods=["POST"])
def login():
    data = request.get_json()
    return AuthController.login(data)
