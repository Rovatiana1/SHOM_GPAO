import requests

class GpaoService:
    BASE_URL = "http://10.128.1.100:5001/api"  # API GPAO distante

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
                return response.json()
            except ValueError:
                return {"status": "ok"}  # Réponse vide mais succès

        except requests.exceptions.RequestException as e:
            print(f"[GpaoService] Exception lors de l'appel {endpoint} : {e}")
            return None

    # === Fonctions métiers GPAO ===
    @staticmethod
    def get_lot(data: dict, token: str):
        return GpaoService.post("/Lot/get-lot", data, token)

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
