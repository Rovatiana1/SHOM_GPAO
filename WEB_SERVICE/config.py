import os

postgresql = {
    'host': os.getenv("DB_HOST", "localhost"),
    'port': int(os.getenv("DB_PORT", 5432)),  # défaut = 5432
    'user': os.getenv("DB_USER", "postgres"),
    'passwd': os.getenv("DB_PASSWORD", "password"),
    'db': os.getenv("DB_NAME", "postgres"),
}

## CONFIGURATION SERVEUR
postgresqlConfig = "postgresql+psycopg2://{}:{}@{}:{}/{}".format(
    postgresql['user'],
    postgresql['passwd'],
    postgresql['host'],
    postgresql['port'],
    postgresql['db']
)
