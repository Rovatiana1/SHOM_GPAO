from dotenv import load_dotenv
import os

load_dotenv()  # Charge les variables depuis le .env

# Configuration locale
# Récupération de l'environnement
env = os.getenv("FLASK_ENV", "development").lower()

print(f"Current environment: {env}")
# Configuration dynamique
if env == "production":
    postgresql = {
        'host': os.getenv("DB_HOST_PROD"),
        'port': int(os.getenv("DB_PORT_PROD")),
        'user': os.getenv("DB_USER_PROD"),
        'passwd': os.getenv("DB_PASSWORD_PROD"),
        'db': os.getenv("DB_NAME_PROD"),
    }
elif env == "testing":
    postgresql = {
        'host': os.getenv("DB_HOST_TEST"),
        'port': int(os.getenv("DB_PORT_TEST")),
        'user': os.getenv("DB_USER_TEST"),
        'passwd': os.getenv("DB_PASSWORD_TEST"),
        'db': os.getenv("DB_NAME_TEST"),
    }
else:  # development
    postgresql = {
        'host': os.getenv("DB_HOST_DEV"),
        'port': int(os.getenv("DB_PORT_DEV")),
        'user': os.getenv("DB_USER_DEV"),
        'passwd': os.getenv("DB_PASSWORD_DEV"),
        'db': os.getenv("DB_NAME_DEV"),
    }

## CONFIGURATION SERVEUR
postgresqlConfig = "postgresql+psycopg2://{}:{}@{}/{}".format(postgresql['user'], postgresql['passwd'], postgresql['host'], postgresql['db'])
