# WEB_SERVICE/create_fake_users.py
"""
Insertion d'utilisateurs fake dans r_personnel.
Idempotent : n'ajoute que les ldap_name qui n'existent pas.
Peut être appelé depuis app.py ou en standalone.
"""

import secrets
from WEB_SERVICE.db import db
from WEB_SERVICE.models.user_model import User

FAKE_USERS = [
    ("dev_admin", "Alice", "Admin", 1, "alice.admin@example.local"),
    ("dev_manager1", "Bruno", "Gestion", 2, "bruno.gestion@example.local"),
    ("dev_manager2", "Carole", "Manager", 2, "carole.manager@example.local"),
    ("dev_user1", "David", "Utilisateur", 3, "david.user@example.local"),
    ("dev_user2", "Elise", "Test", 3, "elise.test@example.local"),
    ("dev_user3", "Fabien", "Exemple", 3, "fabien.ex@example.local"),
]

def create_fake_users(flask_app=None):
    """
    Crée les utilisateurs fake si inexistants.
    flask_app : instance de Flask (optionnelle)
    Retourne un tuple : (created_list, skipped_list)
    """
    created = []
    skipped = []

    if flask_app:
        ctx = flask_app.app_context()
        ctx.push()
    try:
        for ldap_name, prenom, nom, id_droit, email in FAKE_USERS:
            existing = User.query.filter_by(ldap_name=ldap_name).first()
            if existing:
                skipped.append(ldap_name)
                continue

            mdp = secrets.token_hex(16)
            user = User(
                ldap_name=ldap_name,
                mdp=mdp,
                prenom=prenom,
                nom=nom,
                id_droit=id_droit,
                email=email
            )
            db.session.add(user)
            created.append((ldap_name, mdp))

        if created:
            db.session.commit()
    finally:
        if flask_app:
            ctx.pop()

    return created, skipped

# Exécution standalone (SQLite ou si contexte déjà géré)
if __name__ == "__main__":
    from WEB_SERVICE.app import app  # Import ici seulement pour l’exécution standalone
    created, skipped = create_fake_users(app)
    print("=== Résultat ===")
    for ldap_name, mdp in created:
        print(f"Créé : {ldap_name}, mdp local : {mdp}")
    if skipped:
        print(f"Ignorés (existant) : {', '.join(skipped)}")
