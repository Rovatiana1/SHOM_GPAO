Voici un **guide complet et structuré** sur l’utilisation de **Flask-Migrate + Alembic** pour gérer les migrations avec SQLAlchemy dans un projet Flask, adapté à ta structure (`WEB_SERVICE`), incluant :

---

# 📘 Guide complet Flask-Migrate / Alembic pour la gestion de migration

---

## 🔧 1. Prérequis

### ✅ Avoir installé dans ton environnement :

```bash
pip install flask flask-sqlalchemy flask-migrate
```

### ✅ Avoir une structure comme :

```
SWISSLIFE/
├── WEB_SERVICE/
│   ├── app.py              # ou __init__.py avec Flask app
│   ├── models/
│   ├── migrations/         # sera généré ici
│   └── ...
├── requirements.txt
```

---

## 🚀 2. Initialisation des migrations

### ✅ Exporter la variable d'environnement

```bash
export FLASK_APP=WEB_SERVICE.app
```

> Si c’est `__init__.py` qui contient `app = Flask(...)`, alors `FLASK_APP=WEB_SERVICE` suffit.

### ✅ Initialiser le répertoire de migration

```bash
python -m flask db init --directory=WEB_SERVICE/migrations
```

Cela crée :

```
WEB_SERVICE/migrations/
├── env.py
├── README
├── script.py.mako
├── versions/
└── alembic.ini
```

---

## ✏️ 3. Modifier les modèles

Ajoute ou modifie des champs dans un modèle SQLAlchemy, par exemple :

```python
# ConversionJobModel
progress = db.Column(db.Integer, default=0)
page_done = db.Column(db.Integer)
total_pages = db.Column(db.Integer)
message = db.Column(db.Text)
```

---

## ⚙️ 4. Générer la migration

Toujours depuis la racine du projet :

```bash
python -m flask db migrate -m "Ajout des colonnes de suivi pour les jobs" --directory=WEB_SERVICE/migrations
```

Cela génère un fichier dans :

```
WEB_SERVICE/migrations/versions/
```

Tu peux l’ouvrir pour voir les commandes `op.add_column(...)`.

---

## 🧪 5. Vérifier avant d’appliquer

Inspecte le fichier généré. Exemple :

```python
def upgrade():
    op.add_column('conversion_jobs', sa.Column('progress', sa.Integer(), nullable=True))
    op.add_column('conversion_jobs', sa.Column('page_done', sa.Integer(), nullable=True))
    ...
```

---

## ⬆️ 6. Appliquer la migration

```bash
python -m  flask db upgrade --directory=WEB_SERVICE/migrations
```

✅ Cela **modifie la structure de la base de données** sans supprimer les données existantes.

---

## ❗ Est-ce que ça supprime les données existantes ❓

**Non.**
Les migrations générées par `flask db migrate` via **Alembic** sont **non destructives par défaut** :

* Elles **ajoutent des colonnes**, des index, etc.
* Elles ne suppriment jamais de table ou de colonne existante sauf si **tu l’écris manuellement** dans le script de migration (via `op.drop_column` par exemple).

> ✅ Tes données existantes dans `conversion_jobs` restent intactes.

---

## 🔁 7. Mettre à jour en prod (recommandations)

* **Toujours versionner le dossier `migrations/` dans Git**.
* Tester la migration sur un environnement de test avant de l'exécuter en production.
* Faire une **sauvegarde de la base** si la migration touche des colonnes critiques ou des relations.

---

## ♻️ 8. Autres commandes utiles

| Commande                  | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `flask db current`        | Voir la version actuelle                       |
| `flask db history`        | Voir l’historique                              |
| `flask db downgrade`      | Revenir à la version précédente                |
| `flask db stamp head`     | Synchroniser Alembic avec la DB sans migration |
| `flask db merge -m "..."` | Fusionner plusieurs branches de migration      |

---

## 📌 Extrait à ajouter dans ton `requirements.txt`

```
Flask
Flask-Migrate
Flask-SQLAlchemy
```

