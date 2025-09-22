
import authService from './AuthService';

const API_BASE_URL = 'http://localhost:6003/api';

class LdtService {
    private async post(endpoint: string, body: object) {
        const token = authService.getToken();
        if (!token) {
            throw new Error("Utilisateur non authentifié");
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message || 'API request failed');
        }
        
        // Gérer les réponses sans contenu JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return {}; // Retourner un objet vide pour les réponses non-JSON
        }
    }

    getLot(idDossier: number, idEtape: number, idPers: number, idLotClient: number) {
        return this.post('/Lot/get-lot', {
            _idDossier: idDossier,
            _idEtape: idEtape,
            _idPers: idPers,
            _idLotClient: idLotClient,
        });
    }

    startNewLdt(params: { _idDossier: number; _idEtape: number; _idPers: number; _idLotClient: number; _idLot: number; _idTypeLdt: number; }) {
        return this.post('/Ldt/start', params);
    }
    
    endLdt(params: { _idDossier: number; _idEtape: number; _idPers: number; _idLotClient: number; _idLot: number; _idTypeLdt: number; _commentaire: string; }) {
        return this.post('/Ldt/end', params);
    }

    injectNextEtape(params: { _idDossier: number; _idEtape: number; _idLotClient: number; _libelle: string; _qte: string; }) {
        return this.post('/Lot/inject-next-etape', params);
    }

    updateLot(params: { _idLot: number; _idEtat: number; _qte: number; }) {
        return this.post('/Lot/update-lot', params);
    }
}

export default new LdtService();
