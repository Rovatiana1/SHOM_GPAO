import ApiService from "./ApiService";

class DossiersService extends ApiService {
  // --- Dossier Management ---
  getDossiers = () => this.get("/dossiers");
  getDossier = (id: number) => this.get(`/dossiers/${id}`);
  createDossier = (data: any) => {
    console.log("data, ", data);
    return this.post("/dossiers", data);
  };
  updateDossier = (id: number, data: any) => this.put(`/dossiers/${id}`, data);
  deleteDossier = (id: number) => this.del(`/dossiers/${id}`);
}

export default new DossiersService();
