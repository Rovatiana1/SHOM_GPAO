import env from '../config/env';
import authService from './AuthService';

const API_BASE_URL = env.BASE_URL + '/api/gpao';

class GpaoService {
    private async get(endpoint: string, requireAuth: boolean = true) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Ajout du token uniquement si requis
        if (requireAuth) {
            const token = authService.getToken();
            if (!token) throw new Error("Utilisateur non authentifié");
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message || 'API request failed');
        }

        return response.json();
    }

    private async post(endpoint: string, body: object, requireAuth: boolean = true) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Ajout du token uniquement si requis
        if (requireAuth) {
            const token = authService.getToken();
            if (!token) throw new Error("Utilisateur non authentifié");
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message || 'API request failed');
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return {};
        }
    }

    // === 🟢 METHODES GPAO ===

    /**
     * Récupère les lots client d’un dossier (aucune authentification requise)
     */
    getClientLots(idDossier: number) {
        return this.post('/lot/get-client-lots', { idDossier }, false);
    }

    getCurrentLotForUser(idDossier: number, idEtape: number, idPers: number, idLotClient: number) {
        return this.post('/lot/get-lot', {
            _idDossier: idDossier,
            _idEtape: idEtape,
            _idPers: idPers,
            _idLotClient: idLotClient,
        });
    }

    getLot(idDossier: number, idEtape: number, idPers: number, idLotClient: number) {
        return this.post('/lot/get-lot', {
            _idDossier: idDossier,
            _idEtape: idEtape,
            _idPers: idPers,
            _idLotClient: idLotClient,
        });
    }

    startNewLdt(params: { _idDossier: number; _idEtape: number; _idPers: number; _idLotClient: number; _idLot: number; _idTypeLdt: number; }) {
        return this.post('/ldt/start', params);
    }
    
    endLdt(params: { _idDossier: number; _idEtape: number; _idPers: number; _idLotClient: number; _idLot: number; _idTypeLdt: number; _qte: number; }) {
        return this.post('/ldt/end', params);
    }

    injectNextEtape(params: { _idDossier: number; _idNextEtape: number; _idLotClient: number; _libelle: string; _qte: number; }) {
        return this.post('/lot/inject-next-etape', params);
    }

    updateLot(params: { _idLot: number; _idEtat: number; _qte: number; }) {
        return this.post('/lot/update-lot', params);
    }
}

export default new GpaoService();
