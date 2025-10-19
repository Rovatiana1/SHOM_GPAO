import ApiService from './ApiService';

class LdtService extends ApiService {
    // --- Gestion des LDT ---

    /**
     * Récupère toutes les LDT
     */
    getLdts = () => this.get('/ldts');

    /**
     * Crée une nouvelle LDT
     * @param data Données de la LDT
     */
    createLdt = (data: any) => this.post('/ldts', data);

    /**
     * Met à jour une LDT existante
     * @param id ID de la LDT
     * @param data Nouvelles données de la LDT
     */
    updateLdt = (id: number, data: any) => this.put(`/ldts/${id}`, data);

    /**
     * Supprime une LDT
     * @param id ID de la LDT
     */
    deleteLdt = (id: number) => this.del(`/ldts/${id}`);
}

export default new LdtService();
