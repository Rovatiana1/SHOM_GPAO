import requests
import os
from WEB_SERVICE.models.lot_model import Lot
from WEB_SERVICE.utils.constant import BASE_PATH, BASE_URL_API_GPAO, ID_ETAPE_CQ_ISO

class GpaoService:
    
    @staticmethod
    def post(endpoint: str, payload: dict, token: str):
        """
        Méthode générique pour poster vers l'API GPAO externe.
        Utilise les paramètres en query string au lieu du body JSON.
        """
        url = f"{BASE_URL_API_GPAO}{endpoint}"
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
        client = lot.get("libelleLotClient")
        libelle = lot.get("libelle")
        libelle_without_extension = ""
        print(f"[GpaoService] Traitement du lot : {lot}")
        
        # Vérifier et enlever l'extension .tif si elle existe
        if libelle and libelle.lower().endswith(".tif"):
            libelle_without_extension = os.path.splitext(libelle)[0]

        # Construction des chemins
        lot["paths"] = {
            "basePath": BASE_PATH,
            "IN_CQ": f"{BASE_PATH}/SAISIE/{client}/{libelle_without_extension}/{libelle_without_extension}.csv",
            "OUT_CQ": f"{BASE_PATH}/CQ_CIBLE/{client}/{libelle_without_extension}",   # dossier uniquement
            "IMAGE_PATH": f"{BASE_PATH}/IMAGE/{client}/{libelle}",
            "IN_CQ_ISO": f"{BASE_PATH}/CQ_CIBLE/{client}/{libelle_without_extension}/{libelle_without_extension}.csv",
            "OUT_CQ_ISO": f"{BASE_PATH}/CQ_ISO/{client}/{libelle_without_extension}",
        }

        
        # Recherche de l'utilisateur en base
        lotGpao = Lot.query.filter_by(id_lot=lot.get("idLot")).first()
        if not lotGpao:
            print(f"[GpaoService] Lot {lot.get('idLot')} introuvable dans p_lot")
            return None
        
        # ajouter idEtape depuis p_lot
        lot["idEtape"] = lotGpao.id_etape
        lot["idNextEtape"] = ID_ETAPE_CQ_ISO  # Préparer pour l'injection dans l'étape suivante (idEtape CQ_ISO)

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
