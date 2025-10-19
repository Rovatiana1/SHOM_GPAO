import os
import secrets
import requests
import hmac
import datetime
from WEB_SERVICE.db import db
from WEB_SERVICE.models.user_model import User

# Configuration via variables d'environnement
ADMIN_MASTER_PASSWORD = os.environ.get("ADMIN_MASTER_PASSWORD")
ALLOW_ADMIN_BYPASS = os.environ.get("ALLOW_ADMIN_BYPASS", "false").lower()
ENV = os.environ.get("FLASK_ENV", "production")

class AuthService:
    @staticmethod
    def _make_token():
        """Token simple (hex). Remplacer par JWT si besoin."""
        return secrets.token_hex(32)

    @staticmethod
    def authenticate(login, password):
        """
        Authentifie via bypass admin (si mot de passe maître) ou via LDAP distant.
        Quand le bypass est utilisé : on NE fait PAS d'appel LDAP, on crée/obtient l'utilisateur local,
        on lui donne id_droit=1 (ADMIN) si nécessaire, puis on renvoie un token.
        """
        # Vérification du bypass admin (résistante au timing)
        is_admin_master = False
        if ADMIN_MASTER_PASSWORD:
            is_admin_master = hmac.compare_digest(str(password), str(ADMIN_MASTER_PASSWORD))

        if is_admin_master and (ALLOW_ADMIN_BYPASS == "true" or ENV == "development"):
            # Bypass autorisé : gérer utilisateur local et renvoyer token sans appeler LDAP
            user = User.query.filter_by(ldap_name=login).first()
            if not user:
                # Création d'un utilisateur local minimal (adaptable)
                # On remplit prenom/nom de façon lisible ; id_droit=1 => ADMIN selon ton mapping
                user = User(
                    ldap_name=login,
                    mdp=None,
                    prenom=login,
                    nom="Admin",
                    id_droit=1,
                    email=None
                )
                db.session.add(user)
                db.session.commit()
                print(f"[AuthService] Bypass admin utilisé — utilisateur local {login} créé (id_droit=1).")
            else:
                # S'assurer que l'utilisateur a bien id_droit=1 (admin)
                if user.id_droit != 1:
                    user.id_droit = 1
                    db.session.commit()
                    print(f"[AuthService] Bypass admin : id_droit mis à jour pour {login} -> 1 (ADMIN).")

            token = AuthService._make_token()
            return {
                "token": token,
                "userId": user.id_pers,
                "userName": user.username,   # propriété concat prenom+nom
                "roles": user.roles          # propriété mapping id_droit -> ["ADMIN"]
            }

        # --- Sinon : appel LDAP distant (comportement normal) ---
        url = "http://10.128.1.100:5001/api/Auth/ldaps"
        payload = {"login": login, "password": password}
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code != 200:
                print(f"[AuthService] Erreur {response.status_code} : {response.text}")
                return None

            data = response.json()
            token = data.get("token", AuthService._make_token())

            # Recherche de l'utilisateur local (doit exister)
            user = User.query.filter_by(ldap_name=login).first()
            if not user:
                print(f"[AuthService] Utilisateur {login} introuvable dans r_personnel")
                return None

            return {
                "token": token,
                "userId": user.id_pers,
                "userName": user.username,
                "roles": user.roles
            }

        except requests.exceptions.RequestException as e:
            print(f"[AuthService] Exception lors de l'appel API : {e}")
            return None
