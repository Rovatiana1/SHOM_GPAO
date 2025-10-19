from WEB_SERVICE.models.lot_client_model import LotClient
from WEB_SERVICE.db import db
from sqlalchemy.exc import SQLAlchemyError

class LotClientService:
    """Service de gestion des lots clients."""

    # --- Mapping camelCase → snake_case ---
    @staticmethod
    def _map_data_to_model(data):
        """Convertit les clés camelCase du frontend en snake_case pour le modèle SQLAlchemy"""
        mapping = {
            "idLotClient": "id_lotclient",
            "idDossier": "id_dossier",
            "libelle": "libelle",
            "idPers": "id_pers",
            "idEtat": "id_etat",
            "idCategorie": "id_categorie",
            "cibleA": "cible_a",
            "cibleB": "cible_b",
            "cibleC": "cible_c",
            "cibleD": "cible_d",
            "vitesseEquilibre": "vitesse_equilibre",
            "commentaires": "commentaires",
            "idCae": "id_cae",
            "idCae2": "id_cae_2",
            "idCaeProjet": "id_cae_projet",
        }
        return {mapping.get(k, k): v for k, v in data.items()}

    # ----------------------------------------------------------------------
    # 🔹 CRUD
    # ----------------------------------------------------------------------

    @staticmethod
    def get_all():
        try:
            lots = LotClient.query.all()
            return [lot.to_dict() for lot in lots]
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotClientService.get_all] Erreur : {e}")
            return []

    @staticmethod
    def get_by_id(id_lotclient):
        try:
            lot = LotClient.query.get(id_lotclient)
            return lot.to_dict() if lot else None
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotClientService.get_by_id] Erreur : {e}")
            return None

    @staticmethod
    def create(data):
        """Crée un nouveau lot client avec mapping et conversion des types."""
        try:
            print(f"[LotClientService.create] Données reçues : {data}")
            # Récupérer le max id_lotclient existant
            max_id = db.session.query(db.func.max(LotClient.id_lotclient)).scalar() or 0
            data["id_lotclient"] = max_id + 1
            # 🔹 Mapping camelCase → snake_case
            mapped_data = LotClientService._map_data_to_model(data)

            # 🔹 Conversion des types
            numeric_fields = ["cible_a", "cible_b", "cible_c", "cible_d", "vitesse_equilibre",
                            "id_categorie", "id_cae", "id_cae_2", "id_cae_projet"]
            for field in numeric_fields:
                if field in mapped_data and mapped_data[field] != "":
                    if field.startswith("cible") or field == "vitesse_equilibre":
                        mapped_data[field] = float(mapped_data[field])
                    else:
                        mapped_data[field] = int(mapped_data[field])
                else:
                    mapped_data[field] = None

            lot = LotClient(**mapped_data)
            db.session.add(lot)
            db.session.commit()
            return lot.to_dict()

        except Exception as e:
            db.session.rollback()
            print(f"[LotClientService.create] Erreur : {e}")
            return {"error": str(e)}

    @staticmethod
    def update(id_lotclient, data):
        try:
            lot = LotClient.query.get(id_lotclient)
            if not lot:
                return {"error": f"LotClient {id_lotclient} introuvable."}

            mapped_data = LotClientService._map_data_to_model(data)
            for key, value in mapped_data.items():
                if hasattr(lot, key):
                    setattr(lot, key, value)

            db.session.commit()
            return lot.to_dict()
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotClientService.update] Erreur : {e}")
            return {"error": str(e)}

    @staticmethod
    def delete(id_lotclient):
        try:
            lot = LotClient.query.get(id_lotclient)
            if not lot:
                return {"error": f"LotClient {id_lotclient} introuvable."}

            db.session.delete(lot)
            db.session.commit()
            return {"success": True, "message": f"LotClient {id_lotclient} supprimé avec succès."}
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotClientService.delete] Erreur : {e}")
            return {"error": str(e)}
