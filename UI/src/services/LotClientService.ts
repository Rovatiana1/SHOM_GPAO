import ApiService from './ApiService';

class LotClientService extends ApiService {
    // --- Gestion des Lots Clients ---

    /**
     * Récupère tous les lots clients
     */
    getLotClients = () => this.get('/lot-clients');

    /**
     * Crée un nouveau lot client
     * @param data Données du lot client
     */
    createLotClient = (data: any) => this.post('/lot-clients', data);

    /**
     * Met à jour un lot client existant
     * @param id ID du lot client
     * @param data Nouvelles données du lot client
     */
    updateLotClient = (id: number, data: any) => this.put(`/lot-clients/${id}`, data);

    /**
     * Supprime un lot client
     * @param id ID du lot client
     */
    deleteLotClient = (id: number) => this.del(`/lot-clients/${id}`);
}

export default new LotClientService();
