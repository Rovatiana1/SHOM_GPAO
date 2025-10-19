import os

# Chargement du type de base de données
db_engine = os.getenv("DB_ENGINE", "postgres").lower()

if db_engine == "sqlite":
    # SQLite local
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SQLITE_PATH = os.path.join(BASE_DIR, "sqlite.db")
    postgresqlConfig = f"sqlite:///{SQLITE_PATH}"
else:
    # PostgreSQL
    postgresql = {
        'host': os.getenv("DB_HOST", "localhost"),
        'port': int(os.getenv("DB_PORT", 5432)),
        'user': os.getenv("DB_USER", "postgres"),
        'passwd': os.getenv("DB_PASSWORD", "password"),
        'db': os.getenv("DB_NAME", "postgres"),
    }

    postgresqlConfig = (
        f"postgresql+psycopg2://{postgresql['user']}:{postgresql['passwd']}@"
        f"{postgresql['host']}:{postgresql['port']}/{postgresql['db']}"
    )

print(f"✅ Base de données utilisée : {db_engine}")
