from WEB_SERVICE.db import db
from WEB_SERVICE.models.etat_model import Etat
from sqlalchemy.exc import SQLAlchemyError


class EtatService:
    """Service CRUD pour la gestion des états (p_etat)."""

    # -----------------------
    # 🔹 Récupérer tous les états
    # -----------------------
    @staticmethod
    def get_all():
        try:
            etats = Etat.query.order_by(Etat.id_etat.asc()).all()
            return [e.to_dict() for e in etats]
        except SQLAlchemyError as e:
            print(f"[ERREUR] get_all() - {e}")
            return []

    # -----------------------
    # 🔹 Récupérer un état par ID
    # -----------------------
    @staticmethod
    def get_by_id(id_etat: int):
        try:
            etat = Etat.query.get(id_etat)
            return etat.to_dict() if etat else None
        except SQLAlchemyError as e:
            print(f"[ERREUR] get_by_id({id_etat}) - {e}")
            return None

    # -----------------------
    # 🔹 Créer un nouvel état
    # -----------------------
    @staticmethod
    def create(data: dict):
        try:
            # Validation minimale
            libelle = data.get("libelle")
            if not libelle:
                raise ValueError("Le champ 'libelle' est requis")

            etat = Etat(libelle=libelle)
            db.session.add(etat)
            db.session.commit()
            return etat.to_dict()

        except (SQLAlchemyError, ValueError) as e:
            db.session.rollback()
            print(f"[ERREUR] create() - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Mettre à jour un état existant
    # -----------------------
    @staticmethod
    def update(id_etat: int, data: dict):
        try:
            etat = Etat.query.get(id_etat)
            if not etat:
                return {"error": f"État {id_etat} introuvable"}

            # On ne met à jour que les champs autorisés
            libelle = data.get("libelle")
            if libelle:
                etat.libelle = libelle

            db.session.commit()
            return etat.to_dict()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[ERREUR] update({id_etat}) - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Supprimer un état
    # -----------------------
    @staticmethod
    def delete(id_etat: int):
        try:
            etat = Etat.query.get(id_etat)
            if not etat:
                return {"error": f"État {id_etat} introuvable"}

            db.session.delete(etat)
            db.session.commit()
            return {"message": f"État {id_etat} supprimé avec succès"}

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[ERREUR] delete({id_etat}) - {e}")
            return {"error": str(e)}
