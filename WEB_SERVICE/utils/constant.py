
import os

# Récupération de l'environnement courant (par défaut 'development')
env = os.getenv("FLASK_ENV", "development").lower()

# Sélection de la clé API selon l'environnement
if env == "production":
    UPLOAD_FOLDER_JPG = os.getenv("UPLOAD_FOLDER_JPG_DEPOT", "/Depot")
elif env == "testing":
    UPLOAD_FOLDER_JPG = os.getenv("UPLOAD_FOLDER_JPG_DEPOT_TEST", "/Depot2")
else:  # development et autres environnements    
    UPLOAD_FOLDER_JPG = os.getenv("UPLOAD_FOLDER_JPG", "./uploads/jpg")
    
    
# 📂 Configuration via variables d'environnement (inchangé)
UPLOAD_FOLDER_PDF = os.getenv("UPLOAD_FOLDER_JPG", "./uploads/pdf")
REPORT_FOLDER = os.getenv("REPORT_FOLDER", "./report")
MD5_LIST_FILE = os.path.join(REPORT_FOLDER, os.getenv("MD5_LIST_FILE", "md5_list.txt"))
LOG_FILE = os.path.join(REPORT_FOLDER, os.getenv("LOG_FILE", "actions.log"))

# Création dossier et fichier si absents (inchangé)
os.makedirs(UPLOAD_FOLDER_PDF, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_JPG, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)
if not os.path.exists(MD5_LIST_FILE):
    with open(MD5_LIST_FILE, 'w') as f:
        pass
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, 'w') as f:
        pass
    
# Valeurs par défaut en cas d'absence de num_facture ou num_ps (par sécurité)
FACTURE_PAR_DEFAUT = os.getenv("FACTURE_PAR_DEFAUT", "FACTURE_PAR_DEFAUT")
PS_PAR_DEFAUT = os.getenv("PS_PAR_DEFAUT", "PS_PAR_DEFAUT")

# LOCK file pour éviter les démarrages multiples
LOCK_FILE = ".startup.lock"