from WEB_SERVICE.models.lot_model import Lot
from WEB_SERVICE.db import db
from sqlalchemy.exc import SQLAlchemyError

class LotService:
    """Service de gestion des lots de production avec mapping camelCase → snake_case."""

    # 🔹 Mapping camelCase → snake_case
    @staticmethod
    def _map_data_to_model(data):
        mapping = {
            "idLot": "id_lot",
            "idLotClient": "id_lotclient",
            "idEtat": "id_etat",
            "idEtape": "id_etape",
            "libelle": "libelle",
            "qte": "qte",
            "idPers": "id_pers",
            "nbreErreur": "nbre_erreur",
            "priority": "priority",
            "duree": "duree",
            "idDossier": "id_dossier",
            "qteOp": "qte_op",
            "dateDeb": "date_deb",
            "hDeb": "h_deb",
            "idAlmSousSousSpe": "id_alm_sous_sous_spe",
            "idDetRef": "id_det_ref",
            "dureeMax": "duree_max",
            "qteReele": "qte_reele",
            "verifQte": "verifqte",
        }
        return {mapping.get(k, k): v for k, v in data.items()}

    # ----------------------------------------------------------------------
    # 🔹 CRUD
    # ----------------------------------------------------------------------

    @staticmethod
    def create(data):
        """Crée un nouveau lot avec conversion camelCase → snake_case"""
        try:
            # Récupérer le max id_lot existant
            max_id = db.session.query(db.func.max(Lot.id_lot)).scalar() or 0
            data["id_lot"] = max_id + 1
            
            mapped_data = LotService._map_data_to_model(data)
            lot = Lot(**mapped_data)
            db.session.add(lot)
            db.session.commit()
            return {"success": True, "lot": lot.to_dict()}
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotService.create] Erreur : {e}")
            return {"error": str(e)}

    @staticmethod
    def update(id_lot, data):
        """Met à jour un lot existant avec conversion camelCase → snake_case"""
        try:            
            lot = Lot.query.get(id_lot)
            if not lot:
                return {"error": f"Lot {id_lot} introuvable."}

            mapped_data = LotService._map_data_to_model(data)
            for key, value in mapped_data.items():
                if hasattr(lot, key):
                    setattr(lot, key, value)

            db.session.commit()
            return {"success": True, "lot": lot.to_dict()}

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotService.update] Erreur : {e}")
            return {"error": str(e)}

    @staticmethod
    def get_all():
        try:
            lots = Lot.query.all()
            return [lot.to_dict() for lot in lots]
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotService.get_all] Erreur : {e}")
            return {"error": str(e)}

    @staticmethod
    def get_by_id(id_lot):
        try:
            lot = Lot.query.get(id_lot)
            return lot.to_dict() if lot else None
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotService.get_by_id] Erreur : {e}")
            return {"error": str(e)}

    @staticmethod
    def delete(id_lot):
        try:
            lot = Lot.query.get(id_lot)
            if not lot:
                return {"error": f"Lot {id_lot} introuvable."}

            db.session.delete(lot)
            db.session.commit()
            return {"success": True, "message": f"Lot {id_lot} supprimé avec succès."}
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[LotService.delete] Erreur : {e}")
            return {"error": str(e)}
