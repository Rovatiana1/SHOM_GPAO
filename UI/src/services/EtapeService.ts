// 📁 src/services/EtapeService.ts

import ApiService from './ApiService'; // <-- ton service principal pour les requêtes HTTP

class EtapeService extends ApiService {
  // --- Étape Management ---

  /**
   * Récupère toutes les étapes
   */
  getEtapes = () => this.get('/etapes');

  /**
   * Crée une nouvelle étape
   * @param data Données de la nouvelle étape
   */
  createEtape = (data: any) => this.post('/etapes', data);

  /**
   * Met à jour une étape existante
   * @param id ID de l’étape à modifier
   * @param data Nouvelles données de l’étape
   */
  updateEtape = (id: number, data: any) => this.put(`/etapes/${id}`, data);

  /**
   * Supprime une étape
   * @param id ID de l’étape à supprimer
   */
  deleteEtape = (id: number) => this.del(`/etapes/${id}`);

  // --- Optionnel : Gestion des étapes par dossier ---

  /**
   * Récupère les étapes d’un dossier spécifique
   * @param dossierId ID du dossier
   */
  getEtapesByDossier = (dossierId: number) => this.get(`/dossiers/${dossierId}/etapes`);
}

// Export d’une instance unique du service
export default new EtapeService();
