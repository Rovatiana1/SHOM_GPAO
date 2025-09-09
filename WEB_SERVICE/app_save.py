from flask import Flask, jsonify, request, send_from_directory
from flask_restful import Api
from flask_cors import CORS
from flask_compress import Compress
from dotenv import load_dotenv
import traceback
import secrets
import os
from cryptography.fernet import Fernet
import base64
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from Crypto.Cipher import AES

# --- Chargement des modules locaux ---
from WEB_SERVICE.config import postgresqlConfig
from WEB_SERVICE.resources.file import FileUpload, FileReconvert, FileHash
from WEB_SERVICE.resources.conversion_status import ConversionStatus, ConversionJobList
from WEB_SERVICE.db import db, migrate
from WEB_SERVICE.extensions import socketio
from WEB_SERVICE.utils.constant import LOCK_FILE

# ---------------------------------------------------------
# Chargement de l'environnement et des variables associées
# ---------------------------------------------------------
load_dotenv()
env = os.getenv("FLASK_ENV", "development").lower()

# Définition des configurations selon l'environnement
def load_config(env):
    env_config = {
        "production": {
            "URL_PREFIXE": "/ws",
            "API_KEY": os.getenv("API_KEY_PROD"),
            "PORT": int(os.getenv("PORT_PROD", 6000)),
            "REACT_BUILD": "../UI/build-prod"
        },
        "testing": {
            "URL_PREFIXE": "/ws-test",
            "API_KEY": os.getenv("API_KEY_TEST"),
            "PORT": int(os.getenv("PORT_TEST", 5000)),
            "REACT_BUILD": "../UI/build-test"
        },
        "development": {
            "URL_PREFIXE": "/ws-dev",
            "API_KEY": os.getenv("API_KEY_DEV"),
            "PORT": int(os.getenv("PORT_DEV", 5000)),
            "REACT_BUILD": "../UI/build-dev"
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
migrate.init_app(app, db)
socketio.init_app(app, cors_allowed_origins="*", async_mode='threading', path=config["URL_PREFIXE"] + "/socket")

# ---------------------------------------------------------
# Import des modèles (pour les migrations)
# ---------------------------------------------------------
from WEB_SERVICE.models import (
    etat, facture, flux, lot, storage_file,
    storage_log, conversion_jobs, conversion_job_reconvert_log
)

# ---------------------------------------------------------
# Middleware de vérification de clé API
# ---------------------------------------------------------
@app.before_request
def check_api_key():
    if request.method == 'OPTIONS':
        return
    if request.path.startswith(config["URL_PREFIXE"] + "/api/"):
        api_key = request.headers.get("X-API-Key")
        if api_key != config["API_KEY"]:
            return jsonify({"error": "Unauthorized: Invalid or missing X-API-Key."}), 401

# ---------------------------------------------------------
# Routes API protégées
# ---------------------------------------------------------
api = Api(app)

# Fichiers
api.add_resource(FileUpload, f'{config["URL_PREFIXE"]}/api/file/upload-received')
api.add_resource(FileReconvert, f'{config["URL_PREFIXE"]}/api/file/reconvert-received/<string:job_id>')
api.add_resource(FileHash, f'{config["URL_PREFIXE"]}/api/file/generate-md5')

# Suivi des conversions
api.add_resource(ConversionStatus, f'{config["URL_PREFIXE"]}/api/conversion-status/<string:job_id>')
api.add_resource(ConversionJobList, f'{config["URL_PREFIXE"]}/api/conversion-jobs')


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
# Traitement des jobs inachevés au redémarrage
# ---------------------------------------------------------
def handle_failed_jobs_on_restart():
    if os.path.exists(LOCK_FILE):
        print("🔁 Server already initialized, no pending jobs processed.")
        return

    print("🧹 Restart detected: cleaning up unfinished jobs...")

    from WEB_SERVICE.models.conversion_jobs import ConversionJobModel
    from WEB_SERVICE.events.websocket_events import notify_job_status
    from datetime import datetime

    with app.app_context():
        unfinished_jobs = ConversionJobModel.query.filter(
            ConversionJobModel.status.in_(["queued", "processing"])
        ).all()

        for job in unfinished_jobs:
            job.status = "error"
            job.error_message = "Processing was interrupted due to a server shutdown. Please manually restart the services after the server has restarted."
            job.end_time = datetime.utcnow()
            db.session.add(job)
            notify_job_status(job.job_id, "error", error=job.error_message)

        db.session.commit()
        print(f"🛑 {len(unfinished_jobs)} jobs marked as failed after restart.")

    with open(LOCK_FILE, "w") as f:
        f.write("initialized")

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
from WEB_SERVICE.events.websocket_handlers import *

if __name__ == '__main__':
    handle_failed_jobs_on_restart()
    socketio.run(
        app, 
        host='0.0.0.0', 
        port=config["PORT"], 
        debug=(env == 'development'),
        allow_unsafe_werkzeug=True
    )