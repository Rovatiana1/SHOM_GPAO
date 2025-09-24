from flask import Blueprint, request, jsonify
import WEB_SERVICE.controllers.gpao_controller as controller

gpao_bp = Blueprint("gpao", __name__)

# Récupérer le prochain lot disponible
@gpao_bp.route("/lot/get-lot", methods=["POST"])
def get_lot():
    data = request.json
    return controller.get_lot(data)

# Démarrer un LDT
@gpao_bp.route("/ldt/start", methods=["POST"])
def start_ldt():
    data = request.json
    return controller.start_ldt(data)

# Terminer un LDT
@gpao_bp.route("/ldt/end", methods=["POST"])
def end_ldt():
    data = request.json
    return controller.end_ldt(data)

# Injecter étape suivante
@gpao_bp.route("/lot/inject-next-etape", methods=["POST"])
def inject_next_etape():
    data = request.json
    return controller.inject_next_etape(data)

# Mise à jour d’un lot
@gpao_bp.route("/lot/update-lot", methods=["POST"])
def update_lot():
    data = request.json
    return controller.update_lot(data)
