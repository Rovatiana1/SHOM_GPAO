from flask import request, jsonify
from WEB_SERVICE.services.gpao_service import GpaoService

def get_lot(data):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    result = GpaoService.get_lot(data, token)
    return jsonify(result or {"error": "Impossible de récupérer le lot"}), 200 if result else 400

def start_ldt(data):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    result = GpaoService.start_ldt(data, token)
    return jsonify(result or {"error": "Impossible de démarrer le LDT"}), 200 if result else 400

def end_ldt(data):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    result = GpaoService.end_ldt(data, token)
    return jsonify(result or {"error": "Impossible de terminer le LDT"}), 200 if result else 400

def inject_next_etape(data):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    result = GpaoService.inject_next_etape(data, token)
    return jsonify(result or {"error": "Impossible d’injecter l’étape suivante"}), 200 if result else 400

def update_lot(data):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    result = GpaoService.update_lot(data, token)
    return jsonify(result or {"error": "Impossible de mettre à jour le lot"}), 200 if result else 400
