from sqlalchemy.exc import SQLAlchemyError
from WEB_SERVICE.db import db
from WEB_SERVICE.models.ldt_model import Ldt

class LdtService:
    """Service CRUD pour la table p_ldt avec mapping camelCase → snake_case et auto-increment manuel."""

    # 🔹 Mapping camelCase → snake_case
    @staticmethod
    def _map_data_to_model(data: dict):
        mapping = {
            "idLdt": "id_ldt",
            "idPers": "id_pers",
            "idDossier": "id_dossier",
            "idLotClient": "id_lotclient",
            "idLot": "id_lot",
            "idEtat": "id_etat",
            "idEtape": "id_etape",
            "idTypeLdt": "id_type_ldt",
            "machine": "machine",
            "hDeb": "h_deb",
            "hFin": "h_fin",
            "quantite": "quantite",
            "nbreErreur": "nbre_erreur",
            "commentaire": "commentaire",
            "dateDebLdt": "date_deb_ldt",
            "lotOp": "lot_op",
            "dateFinLdt": "date_fin_ldt",
            "addressIp": "address_ip",
            "ver": "ver",
            "mac": "mac",
            "idLdtNeocles": "id_ldt_neocles",
            "modifBatch": "modif_batch",
            "idAlmSousSousSpe": "id_alm_sous_sous_spe",
            "heureSup": "heure_sup",
            "byExcelTeletravail": "by_excel_teletravail",
            "dureeLdt": "duree_ldt",
            "hDebTmstp": "h_deb_tmstp",
            "hFinTmstp": "h_fin_tmstp",
        }
        return {mapping.get(k, k): v for k, v in data.items()}

    # -----------------------
    # 🔹 Récupérer tous les LDT
    # -----------------------
    @staticmethod
    def get_all():
        try:
            ldts = Ldt.query.order_by(Ldt.id_ldt.desc()).all()
            return [ldt.to_dict() for ldt in ldts]
        except SQLAlchemyError as e:
            print(f"[ERREUR] LdtService.get_all() - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Récupérer un LDT par ID
    # -----------------------
    @staticmethod
    def get_by_id(id_ldt: int):
        try:
            ldt = Ldt.query.get(id_ldt)
            return ldt.to_dict() if ldt else None
        except SQLAlchemyError as e:
            print(f"[ERREUR] LdtService.get_by_id({id_ldt}) - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Créer une nouvelle LDT
    # -----------------------
    @staticmethod
    def create(data: dict):
        try:
            if not data.get("idPers"):
                raise ValueError("Le champ 'idPers' est obligatoire")

            formatted_data = LdtService._map_data_to_model(data)

            # --- Auto-increment manuel pour SQLite ---
            max_id = db.session.query(db.func.max(Ldt.id_ldt)).scalar() or 0
            formatted_data["id_ldt"] = max_id + 1

            ldt = Ldt(**formatted_data)
            db.session.add(ldt)
            db.session.commit()
            return ldt.to_dict()

        except (SQLAlchemyError, ValueError) as e:
            db.session.rollback()
            print(f"[ERREUR] LdtService.create() - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Mettre à jour un LDT existant
    # -----------------------
    @staticmethod
    def update(id_ldt: int, data: dict):
        try:
            ldt = Ldt.query.get(id_ldt)
            if not ldt:
                return None

            mapped_data = LdtService._map_data_to_model(data)
            for key, value in mapped_data.items():
                if hasattr(ldt, key):
                    setattr(ldt, key, value)

            db.session.commit()
            return ldt.to_dict()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[ERREUR] LdtService.update({id_ldt}) - {e}")
            return {"error": str(e)}

    # -----------------------
    # 🔹 Supprimer un LDT
    # -----------------------
    @staticmethod
    def delete(id_ldt: int):
        try:
            ldt = Ldt.query.get(id_ldt)
            if not ldt:
                return None

            db.session.delete(ldt)
            db.session.commit()
            return {"success": True}

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"[ERREUR] LdtService.delete({id_ldt}) - {e}")
            return {"error": str(e)}
