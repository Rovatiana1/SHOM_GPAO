from flask import Blueprint, request
from WEB_SERVICE.controllers.user_controller import UserController

user_bp = Blueprint("users", __name__)

# GET /api/users
@user_bp.route("", methods=["GET"])
def get_users():
    return UserController.get_all()

# GET /api/users/<id>
@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    return UserController.get_by_id(user_id)

# POST /api/users
@user_bp.route("", methods=["POST"])
def create_user():
    data = request.get_json()
    return UserController.create(data)

# PUT /api/users/<id>
@user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    return UserController.update(user_id, data)

# DELETE /api/users/<id>
@user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    return UserController.delete(user_id)
