#!/bin/bash

# === CONFIGURATION ===
export FLASK_APP=WEB_SERVICE.app
export PYTHONPATH="/d/0000_ROVA/0000_PROJECTS"

# === ACTIVATION DE L'ENV VIRTUEL ===
source venv/Scripts/activate

# === MIGRATIONS ===
echo "📁 Initialisation des migrations..."
flask db init

echo "🛠️  Génération du script de migration..."
flask db migrate -m "auto migration"

echo "🚀 Application des migrations à la base..."
flask db upgrade

echo "✅ Migration terminée avec succès"
