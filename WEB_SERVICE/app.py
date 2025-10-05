from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_compress import Compress
from dotenv import load_dotenv
import traceback
import secrets
import os
import WEB_SERVICE.seed_data

# --- Chargement des modules locaux ---
from WEB_SERVICE.config import postgresqlConfig
from WEB_SERVICE.db import db

# Import et enregistrement des routes
from WEB_SERVICE.routes.auth_routes import auth_bp
from WEB_SERVICE.routes.cq_routes import cq_bp
from WEB_SERVICE.routes.gpao_routes import gpao_bp

# ---------------------------------------------------------
# Chargement de l'environnement et des variables associées
# ---------------------------------------------------------
load_dotenv()
env = os.getenv("FLASK_ENV", "development").lower()

# Définition des configurations selon l'environnement
def load_config(env):
    env_config = {
        "development": {
            "URL_PREFIXE": "/",
            "API_KEY": os.getenv("API_KEY"),
            "PORT": int(os.getenv("PORT", 5000)),
            "REACT_BUILD": "../UI/build"
        }
    }
    return env_config.get(env)

config = load_config(env)
if not config or not config["API_KEY"]:
    raise ValueError(f"API key non définie pour l'environnement : {env}")

print(f"Using API key for {env} environment: {config['API_KEY']}")
print(f"Using URL prefix: {config['URL_PREFIXE']}")
print(f"Using port: {config['PORT']}")
print(f"Using static file: {config['REACT_BUILD']}")

# ---------------------------------------------------------
# Création de l'application Flask
# ---------------------------------------------------------
app = Flask(
    __name__,
    static_folder=config["REACT_BUILD"],
    static_url_path=config["URL_PREFIXE"]
)
app.secret_key = secrets.token_urlsafe(32)


# Configuration Flask
app.config.update({
    'SECRET_KEY': 'dev.byos.secret.key',
    'SQLALCHEMY_DATABASE_URI': postgresqlConfig,
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'SEND_FILE_MAX_AGE_DEFAULT': 0  # Désactive le cache pour le développement
})

# Initialisation des extensions
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
Compress(app)
db.init_app(app)


# Création automatique des tables pour SQLite
with app.app_context():
    if "sqlite" in postgresqlConfig:
        print("🧩 Création des tables SQLite (si non existantes)...")
        db.create_all()


# ---------------------------------------------------------
# Routes API protégées
# ---------------------------------------------------------
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(cq_bp, url_prefix="/api/cq")
app.register_blueprint(gpao_bp, url_prefix="/api/gpao")

# ---------------------------------------------------------
# Routes pour servir l'application React
# ---------------------------------------------------------
@app.route(config['URL_PREFIXE'])
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# ---------------------------------------------------------
# Gestion des erreurs
# ---------------------------------------------------------
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith(config["URL_PREFIXE"] + "/api/"):
        return jsonify(error="Resource not found"), 404
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(500)
def handle_internal_error(e):
    return jsonify(error="Internal Server Error", message=traceback.format_exc()), 500


# ---------------------------------------------------------
# Configuration pour React
# ---------------------------------------------------------
@app.after_request
def add_header(response):
    """
    Ajoute des headers pour empêcher la mise en cache pendant le développement
    """
    if env == 'development':
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
    return response

# ---------------------------------------------------------
# Lancement de l'application
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=config["PORT"],
        debug=(env == 'development')
    )
