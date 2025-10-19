from WEB_SERVICE.db import db
from WEB_SERVICE.models.user_model import User

class UserService:
    @staticmethod
    def get_all():
        """Retourne la liste de tous les utilisateurs"""
        users = User.query.all()
        return [user.to_dict() for user in users]

    @staticmethod
    def get_by_id(user_id):
        """Retourne un utilisateur par ID"""
        user = User.query.get(user_id)
        return user.to_dict() if user else None

    @staticmethod
    def create(data):
        """Crée un nouvel utilisateur"""
        new_user = User(
            ldap_name=data.get("ldap_name"),
            prenom=data.get("prenom"),
            nom=data.get("nom"),
            email=data.get("email"),
            id_droit=data.get("id_droit", 3),  # 3 = utilisateur normal par défaut
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user.to_dict()

    @staticmethod
    def update(user_id, data):
        """Met à jour un utilisateur existant"""
        user = User.query.get(user_id)
        if not user:
            return None
        user.ldap_name = data.get("ldap_name", user.ldap_name)
        user.prenom = data.get("prenom", user.prenom)
        user.nom = data.get("nom", user.nom)
        user.email = data.get("email", user.email)
        user.id_droit = data.get("id_droit", user.id_droit)
        db.session.commit()
        return user.to_dict()

    @staticmethod
    def delete(user_id):
        """Supprime un utilisateur"""
        user = User.query.get(user_id)
        if not user:
            return False
        db.session.delete(user)
        db.session.commit()
        return True
