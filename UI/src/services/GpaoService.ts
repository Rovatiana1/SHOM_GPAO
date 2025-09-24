import authService from './AuthService';

const API_BASE_URL = 'http://localhost:6003/api/gpao';

class GpaoService {
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
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return {};
        }
    }

    getCurrentLotForUser(idPers: number) {
        // This new endpoint should find if there's an active LDT for the user
        // and return the lot details along with the LDT start time.
        return this.post('/lot/get-current', { _idPers: idPers });
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

    injectNextEtape(params: { _idDossier: number; _idEtape: number; _idLotClient: number; _libelle: string; _qte: string; }) {
        return this.post('/lot/inject-next-etape', params);
    }

    updateLot(params: { _idLot: number; _idEtat: number; _qte: number; }) {
        return this.post('/lot/update-lot', params);
    }
}

export default new GpaoService();
