import secrets
import requests
from WEB_SERVICE.db import db
from WEB_SERVICE.models.user_model import User


class AuthService:
    @staticmethod
    def authenticate(login, password):
        """
        Authentifie l’utilisateur via l’API LDAP distante,
        puis enrichit la réponse avec les infos locales (r_personnel).
        """
        url = "http://10.128.1.100:5001/api/Auth/ldaps"
        payload = {
            "login": login,
            "password": password
        }
        headers = {
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)

            if response.status_code != 200:
                print(f"[AuthService] Erreur {response.status_code} : {response.text}")
                return None

            data = response.json()
            token = data.get("token", secrets.token_hex(32))

            # Recherche de l'utilisateur en base
            user = User.query.filter_by(ldap_name=login).first()
            if not user:
                print(f"[AuthService] Utilisateur {login} introuvable dans r_personnel")
                return None

            # Retourne la réponse attendue
            return {
                "token": token,
                "userId": user.id_pers,
                "userName": user.username,
                "roles": user.roles
            }

        except requests.exceptions.RequestException as e:
            print(f"[AuthService] Exception lors de l'appel API : {e}")
            return None
