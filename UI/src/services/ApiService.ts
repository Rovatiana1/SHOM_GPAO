import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:6003/api';

/**
 * Classe de base pour tous les services API
 * Fournit des méthodes génériques (GET, POST, PUT, DELETE)
 */
class ApiService {
  protected api: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    // 🔹 Création de l’instance Axios
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 🔹 Intercepteur pour les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erreur API :', error.response || error.message);
        return Promise.reject(error);
      }
    );
  }

  // --- Méthodes génériques ---

  protected get = async (url: string, params?: any): Promise<any> => {
    const response = await this.api.get(url, { params });
    return response.data;
  };

  protected post = async (url: string, data?: any): Promise<any> => {
    const response = await this.api.post(url, data);
    return response.data;
  };

  protected put = async (url: string, data?: any): Promise<any> => {
    const response = await this.api.put(url, data);
    return response.data;
  };

  protected del = async (url: string): Promise<any> => {
    const response = await this.api.delete(url);
    return response.data;
  };
}

export default ApiService;