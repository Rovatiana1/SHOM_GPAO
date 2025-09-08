#!/bin/bash

# === Lancer l'application ===
export PYTHONPATH=$(pwd)
export FLASK_ENV=development

# Supprimer le fichier lock
rm -rf .startup.lock

# Lancer l'application Flask
exec python -m WEB_SERVICE.app