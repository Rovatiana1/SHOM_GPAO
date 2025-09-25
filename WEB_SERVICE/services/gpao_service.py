import requests
import os
from WEB_SERVICE.models.lot_model import Lot

class GpaoService:
    BASE_URL = "http://10.128.1.100:5001/api"  # API GPAO distante
    BASE_PATH = r"\\10.128.1.10\005822\PRODUCTION\LOT6"  # Chemin réseau de base

    @staticmethod
    def post(endpoint: str, payload: dict, token: str):
        """
        Méthode générique pour poster vers l'API GPAO externe.
        Utilise les paramètres en query string au lieu du body JSON.
        """
        url = f"{GpaoService.BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        try:
            # Envoi en query params
            response = requests.post(url, params=payload, headers=headers, timeout=10)

            if response.status_code != 200:
                print(f"[GpaoService] Erreur {response.status_code} sur {endpoint} : {response.text}")
                return None

            # Retourne le JSON si possible
            try:
                json_data = response.json()
                print(f"[GpaoService] Réponse reçue de {endpoint} : {json_data}")
                return json_data
            except ValueError:
                return {"status": "ok"}  # Réponse vide mais succès

        except requests.exceptions.RequestException as e:
            print(f"[GpaoService] Exception lors de l'appel {endpoint} : {e}")
            return None

    # === Fonctions métiers GPAO ===
    @staticmethod
    def get_lot(data: dict, token: str):
        result = GpaoService.post("/Lot/get-lot", data, token)

        if not result or "lot" not in result:
            return result

        lot = result["lot"]
        base = GpaoService.BASE_PATH
        client = lot.get("libelleLotClient")
        libelle = lot.get("libelle")
        print(f"[GpaoService] Traitement du lot : {lot}")
        
        # Vérifier et enlever l'extension .tif si elle existe
        if libelle and libelle.lower().endswith(".tif"):
            libelle = os.path.splitext(libelle)[0]

        # Construction des chemins
        lot["paths"] = {
            "basePath": base,            
            "IN_CQ": r"D:\0000__work_space\0000_PROJECTS\SHOM\0000_DEV\GPAO\uploads\cherbourg 19620305-livrable.csv",
            # "IN_CQ": os.path.join(base, "SAISIE", client, libelle, f"{libelle}.csv"),
            "OUT_CQ": os.path.join(base, "CQ", client, libelle, f"{libelle}.csv"),
            "IN_CQ_ISO": os.path.join(base, "CQ", client, libelle, f"{libelle}.csv"),
            "OUT_CQ_ISO": os.path.join(base, "CQ_ISO", client, libelle, f"{libelle}.csv")
        }
        
        # Recherche de l'utilisateur en base
        lotGpao = Lot.query.filter_by(id_lot=lot.get("idLot")).first()
        if not lotGpao:
            print(f"[GpaoService] Lot {lot.get('idLot')} introuvable dans p_lot")
            return None
        
        # ajouter idEtape depuis p_lot
        lot["idEtape"] = lotGpao.id_etape

        return result

    @staticmethod
    def start_ldt(data: dict, token: str):
        return GpaoService.post("/Ldt/start", data, token)

    @staticmethod
    def end_ldt(data: dict, token: str):
        return GpaoService.post("/Ldt/end", data, token)

    @staticmethod
    def inject_next_etape(data: dict, token: str):
        return GpaoService.post("/Lot/inject-next-etape", data, token)

    @staticmethod
    def update_lot(data: dict, token: str):
        return GpaoService.post("/Lot/update-lot", data, token)
