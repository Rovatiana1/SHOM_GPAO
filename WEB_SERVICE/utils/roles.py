from functools import wraps
from flask import Response, jsonify, request
from flask_jwt_extended import get_jwt

def role_required(required_role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Obtenez le rôle de l'utilisateur depuis le token JWT
            claims = get_jwt()
            role = claims.get('role')
            # Si le rôle ne correspond pas, on interdit l'accès
            if required_role[0] == "*" or role in required_role:
                # Si le rôle est suffisant, on appelle la fonction d'origine
                return fn(*args, **kwargs)
            # Sinon, on appelle la fonction d'origine
            message = "Accès interdit"
            return Response(message, status=403, mimetype='application/json')
        return wrapper
    return decorator

def csrf_protected(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        csrf_token = request.headers.get('X-CSRF-Token')

        # Si le token CSRF est manquant ou invalide, retourner une erreur
        if not csrf_token:
            return jsonify({"message": "CSRF token is missing"}), 400

        # Vous pouvez ajouter ici des vérifications plus avancées, par exemple,
        # pour comparer avec un token stocké côté serveur ou dans une base de données.
        # En général, vous pouvez valider ce token contre celui stocké dans un cookie sécurisé.
        # Cela dépend de la manière dont vous gérez le CSRF dans votre application.

        # Si tout est ok, on appelle la fonction de la vue
        return func(*args, **kwargs)
    
    return wrapper