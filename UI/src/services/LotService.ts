import ApiService from './ApiService';

class LotService extends ApiService {
    // --- Gestion des Lots ---

    /**
     * Récupère tous les lots
     */
    getLots = () => this.get('/lots');

    /**
     * Crée un nouveau lot
     * @param data Données du lot
     */
    createLot = (data: any) => this.post('/lots', data);

    /**
     * Modifier un lot
     * @param id ID du lot
     */
    updateLot = (id: number, data: any) => this.put(`/lots/${id}`, data);

    /**
     * Supprime un lot
     * @param id ID du lot
     */
    deleteLot = (id: number) => this.del(`/lots/${id}`); 
}

export default new LotService();
