# constant.py
import os
from dotenv import load_dotenv

# Charger les variables du fichier .env
load_dotenv()

# Récupération de l'environnement courant (par défaut 'development')
env = os.getenv("FLASK_ENV", "development").lower()

BASE_URL_API_GPAO = os.getenv("BASE_URL_API_GPAO")
BASE_PATH = os.getenv("BASE_PATH")
