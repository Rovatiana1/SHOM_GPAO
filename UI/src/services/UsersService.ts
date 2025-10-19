import ApiService from './ApiService'; // <-- ton service principal pour les requêtes HTTP


class UsersService extends ApiService {
    // --- Méthodes CRUD utilisateurs ---
    getUsers = () => this.get('/users');
    getUser = (id: number) => this.get(`/users/${id}`);
    createUser = (data: any) => this.post('/users', data);
    updateUser = (id: number, data: any) => this.put(`/users/${id}`, data);
    deleteUser = (id: number) => this.del(`/users/${id}`);
}

export default new UsersService();
