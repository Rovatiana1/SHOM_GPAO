from WEB_SERVICE.db import db
from WEB_SERVICE.models.etape_model import Etape
from sqlalchemy.exc import SQLAlchemyError


class EtapeService:
    """Service CRUD pour la gestion des étapes (p_etape)."""

    # -----------------------
    # 🔹 Récupérer toutes les étapes
    # -----------------------
    @staticmethod
    def get_all():
        try:
            etapes = Etape.query.order_by(Etape.id_etape.asc()).all()
            return [e.to_dict() for e in etapes]
        except SQLAlchemyError as e:
            print(f"[ERREUR] get_all() - {e}")
            return []

    # -----------------------
    # 🔹 Récupérer une étape par ID
    # -----------------------
    @staticmethod
    def get_by_id(id_etape: int):
        try:
            etape = Etape.query.get(id_etape)
            return etape.to_dict() if etape else None
        except SQLAlchemyError as e:
            print(f"[ERREUR] get_by_id({id_etape}) - {e}")
            return None

    # -----------------------
    # 🔹 Créer une nouvelle étape
    # -----------------------
    @staticmethod
    def create(data: dict):
        try:
            # Validation minimale
            if "libelle" not in data or not data["libelle"]:
                raise ValueError("Le champ 'libelle' est requis")

            etape = Etape(
                libelle=data.get("libelle"),
                parent_etape=data.get("parentEtape")  # camelCase depuis le front
            )
            db.session.add(etape)
            db.session.commit()
            return etape.to_dict()

        except (SQLAlchemyError, ValueError) as e:
            db.session.rollback()
            print(f"[ERREUR] create() - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Mettre à jour une étape existante
    # -----------------------
    @staticmethod
    def update(id_etape: int, data: dict):
        try:
            etape = Etape.query.get(id_etape)
            if not etape:
                return {"error": f"Étape {id_etape} introuvable"}

            # Mise à jour uniquement des champs existants
            for key, value in data.items():
                # Conversion camelCase → snake_case pour compatibilité
                if key == "parentEtape":
                    key = "parent_etape"
                if hasattr(etape, key):
                    setattr(etape, key, value)

            db.session.commit()
            return etape.to_dict()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[ERREUR] update({id_etape}) - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Supprimer une étape
    # -----------------------
    @staticmethod
    def delete(id_etape: int):
        try:
            etape = Etape.query.get(id_etape)
            if not etape:
                return {"error": f"Étape {id_etape} introuvable"}

            db.session.delete(etape)
            db.session.commit()
            return {"message": f"Étape {id_etape} supprimée avec succès"}

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[ERREUR] delete({id_etape}) - {e}")
            return {"error": str(e)}
