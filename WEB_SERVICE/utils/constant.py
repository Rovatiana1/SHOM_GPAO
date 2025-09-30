# constant.py
import os
from dotenv import load_dotenv

# Charger les variables du fichier .env
load_dotenv()

# Récupération de l'environnement courant (par défaut 'development')
env = os.getenv("FLASK_ENV", "development").lower()

BASE_URL_API_GPAO = os.getenv("BASE_URL_API_GPAO")
BASE_PATH = os.getenv("BASE_PATH")
ID_ETAPE_CQ_ISO = int(os.getenv("ID_ETAPE_CQ_ISO", 4688))  # Valeur par défaut 4688 si non défini (005822_LOT6 => CQ_ISO)