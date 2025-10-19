import ApiService from './ApiService';

class EtatService extends ApiService {
    // --- Gestion des États ---

    /**
     * Récupère tous les états
     */
    getEtats = () => this.get('/etats');

    /**
     * Crée un nouvel état
     * @param data Données de l'état
     */
    createEtat = (data: any) => this.post('/etats', data);

    /**
     * Met à jour un état existant
     * @param id ID de l'état
     * @param data Nouvelles données de l'état
     */
    updateEtat = (id: number, data: any) => this.put(`/etats/${id}`, data);

    /**
     * Supprime un état
     * @param id ID de l'état
     */
    deleteEtat = (id: number) => this.del(`/etats/${id}`);
}

export default new EtatService();
