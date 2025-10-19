# WEB_SERVICE/services/dossier_service.py
from WEB_SERVICE.models.dossier_model import Dossier
from WEB_SERVICE.db import db

class DossierService:
    # --- Conversion camelCase → snake_case ---
    @staticmethod
    def _map_data_to_model(data):
        """Convertit les clés camelCase du frontend en snake_case pour le modèle SQLAlchemy"""
        mapping = {
            "idDossier": "id_dossier",
            "numDossier": "num_dossier",
            "atelier": "atelier",
            "corresp": "corresp",
            "demarrage": "demarrage",
            "delai": "delai",
            "dateLivr": "date_livr",
            "vitesseEstime": "vitesse_estime",
            "vitesseReelle": "vitesse_reelle",
            "volumePrevue": "volume_prevue",
            "resourceOp": "resource_op",
            "resourceCp": "resource_cp",
            "idPersCp": "id_pers_cp",
            "idEquipe": "id_equipe",
            "idCl": "id_cl",
            "idEtat": "id_etat",
            "idAtelier": "id_atelier",
            "creditHeure": "credit_heure",
            "heureConsome": "heure_consome",
            "alias": "alias",
            "volumeRecu": "volume_recu",
            "idCae": "id_cae",
            "idCae2": "id_cae_2",
            "idCaeProjet": "id_cae_projet",
        }

        return {mapping.get(k, k): v for k, v in data.items()}

    # --- CRUD ---
    @staticmethod
    def get_all():
        """Retourne la liste de tous les dossiers"""
        dossiers = Dossier.query.all()
        return [dossier.to_dict() for dossier in dossiers]

    @staticmethod
    def get_by_id(id_dossier):
        dossier = Dossier.query.get(id_dossier)
        return dossier.to_dict() if dossier else None

    @staticmethod
    def create(data):
        """Crée un nouveau dossier"""
        mapped_data = DossierService._map_data_to_model(data)
        dossier = Dossier(**mapped_data)
        db.session.add(dossier)
        db.session.commit()
        return dossier.to_dict()

    @staticmethod
    def update(id_dossier, data):
        """Met à jour un dossier existant"""
        dossier = Dossier.query.get(id_dossier)
        if not dossier:
            return None

        mapped_data = DossierService._map_data_to_model(data)
        for key, value in mapped_data.items():
            if hasattr(dossier, key):
                setattr(dossier, key, value)
        db.session.commit()
        return dossier.to_dict()

    @staticmethod
    def delete(id_dossier):
        """Supprime un dossier"""
        dossier = Dossier.query.get(id_dossier)
        if not dossier:
            return False
        db.session.delete(dossier)
        db.session.commit()
        return True
