// src/services/CQService.ts

import env from "../config/env";
import authService from "./AuthService";

const API_BASE_URL = env.BASE_URL + "/api/cq";

class CQService {
  /**
   * Méthode générique pour envoyer des requêtes POST avec token JWT
   */
  private async post(
    endpoint: string,
    body: object | FormData,
    isFormData: boolean = false
  ) {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const headers: HeadersInit = isFormData
      ? { Authorization: `Bearer ${token}` }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API CQ (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return {};
  }

  /**
   * Analyse un fichier CSV et extrait les données des points, dates et métadonnées
   */
  async parseCsvFile(csvFile: File, imagePath: string) {
    const formData = new FormData();
    formData.append("csvfile", csvFile);
    return this.post(
      `/parse_csv?image_path=${encodeURIComponent(imagePath)}`,
      formData,
      true
    );
  }

  /**
   * Récupère un fichier via son chemin
   */
  async getFileFromPath(
    path: string
  ): Promise<{ name: string; content: string }> {
    return this.post("/get_file_from_path", { path });
  }

  /**
   * Sauvegarde les points analysés avec leurs métadonnées et durée
   */
  async savePoints(
    idLot: number,
    points: any[],
    dates: string[],
    metadata: any,
    duration: number,
    export_path: string
  ) {
    console.log("metadata ==> ", metadata);

    // Conversion des tuples [x, y] en chaîne "(x, y)" si nécessaire
    let metadataWithTuple = metadata;

    // Vérifier si origin_px est un tableau (array) et non une string
    if (Array.isArray(metadata.origin_px) && metadata.origin_px.length >= 2) {
      console.log("metadata.origin_px est un array ==> ", metadata.origin_px);
      metadataWithTuple = {
        ...metadata,
        origin_px: `(${metadata.origin_px[0]}, ${metadata.origin_px[1]})`,
        x_max_px: Array.isArray(metadata.x_max_px)
          ? `(${metadata.x_max_px[0]}, ${metadata.x_max_px[1]})`
          : metadata.x_max_px,
        y_max_px: Array.isArray(metadata.y_max_px)
          ? `(${metadata.y_max_px[0]}, ${metadata.y_max_px[1]})`
          : metadata.y_max_px,
      };
    }

    console.log("metadataWithTuple ==> ", metadataWithTuple);
    const payload = {
      idLot,
      points,
      dates,
      metadata: metadataWithTuple,
      duration,
      export_path,
    };

    return this.post("/save_points", payload);
  }

  /**
   * Sauvegarde les points analysés avec leurs métadonnées et durée
   */
  async savePointsReprise(
    idLot: number,
    points: any[],
    dates: string[],
    metadata: any,
    duration: number,
    export_path: string
  ) {
    console.log("metadata ==> ", metadata);

    // Conversion des tuples [x, y] en chaîne "(x, y)" si nécessaire
    let metadataWithTuple = metadata;

    // Vérifier si origin_px est un tableau (array) et non une string
    if (Array.isArray(metadata.origin_px) && metadata.origin_px.length >= 2) {
      console.log("metadata.origin_px est un array ==> ", metadata.origin_px);
      metadataWithTuple = {
        ...metadata,
        origin_px: `(${metadata.origin_px[0]}, ${metadata.origin_px[1]})`,
        x_max_px: Array.isArray(metadata.x_max_px)
          ? `(${metadata.x_max_px[0]}, ${metadata.x_max_px[1]})`
          : metadata.x_max_px,
        y_max_px: Array.isArray(metadata.y_max_px)
          ? `(${metadata.y_max_px[0]}, ${metadata.y_max_px[1]})`
          : metadata.y_max_px,
      };
    }

    console.log("metadataWithTuple ==> ", metadataWithTuple);
    const payload = {
      idLot,
      points,
      dates,
      metadata: metadataWithTuple,
      duration,
      export_path,
    };

    return this.post("/save_points_reprise", payload);
  }

  /**
   * Sauvegarde les points analysés avec leurs métadonnées et durée
   */
  async savePointsFinal(
    idLot: number,
    points: any[],
    dates: string[],
    metadata: any,
    duration: number,
    export_path: string
  ) {
    console.log("metadata ==> ", metadata);

    // Conversion des tuples [x, y] en chaîne "(x, y)" si nécessaire
    let metadataWithTuple = metadata;

    // Vérifier si origin_px est un tableau (array) et non une string
    if (Array.isArray(metadata.origin_px) && metadata.origin_px.length >= 2) {
      console.log("metadata.origin_px est un array ==> ", metadata.origin_px);
      metadataWithTuple = {
        ...metadata,
        origin_px: `(${metadata.origin_px[0]}, ${metadata.origin_px[1]})`,
        x_max_px: Array.isArray(metadata.x_max_px)
          ? `(${metadata.x_max_px[0]}, ${metadata.x_max_px[1]})`
          : metadata.x_max_px,
        y_max_px: Array.isArray(metadata.y_max_px)
          ? `(${metadata.y_max_px[0]}, ${metadata.y_max_px[1]})`
          : metadata.y_max_px,
      };
    }

    console.log("metadataWithTuple ==> ", metadataWithTuple);
    const payload = {
      idLot,
      points,
      dates,
      metadata: metadataWithTuple,
      duration,
      export_path,
    };

    return this.post("/save_points_final", payload);
  }

  /**
   * Met à jour les métadonnées dans le fichier JSON
   */
  async updateMetadata(metadata: any) {
    return this.post("/update_metadata", metadata);
  }

  /**
   * Exporte les points sous format CSV
   */
  async exportCsv(points: any[], interval: number, base_date: string) {
    const response = await this.post("/export", {
      points,
      interval,
      base_date,
    });
    return response; // CSV téléchargeable côté serveur
  }

  /**
   * Sauvegarde les captures et le rapport CSV dans un dossier
   */
  async saveCaptures(
    csvContent: string,
    captures: Array<{
      imageData: string;
      filename: string;
      type: string;
      nature: string;
    }>,
    outputPath: string,
    idLot: number,
    imageCorrespondant: string
  ) {
    console.log("csvContent", csvContent);
    console.log("captures", captures);
    console.log("outputPath", outputPath);
    console.log("idLot", idLot);
    console.log("imageCorrespondant", imageCorrespondant);

    const formData = new FormData();

    // Utilise le nom du lot pour le rapport CSV
    const csvFilename = captures[0]!.filename.replace(
      /_(MC|AN)_\d{3}\.jpg$/,
      "_MM_MC.csv"
    );
    formData.append(
      "csv_report",
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
      csvFilename
    );

    // Ajoute toutes les images AVEC leurs métadonnées
    for (const capture of captures) {
      const response = await fetch(capture.imageData);
      const blob = await response.blob();
      formData.append("images", blob, capture.filename);

      // NOUVEAU : Ajouter les métadonnées de chaque image
      formData.append("image_types", capture.type);
      formData.append("image_natures", capture.nature);
      formData.append("image_filenames", capture.filename);
    }

    // AJOUT DES CHAMPS
    formData.append("outputPath", outputPath);
    formData.append("id_lot", idLot.toString());
    formData.append("image_correspondant", imageCorrespondant);

    // Debug: afficher tous les champs FormData
    console.log("=== FormData contents ===");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    return this.post("/save_captures", formData, true);
  }
  /**
   * Récupère les captures d'écran à valider pour un lot donné en CQ_ISO
   */
  async getCapturesForReview(idLot: number) {
    const payload = { idLot };
    return this.post(`/images/${idLot}`, payload);
  }

  /**
   * Archive une capture d'écran existante.
   */
  async archiveCapture(idLot: number, captureId: number) {
    return this.post(`/images/archive`, { idLot, id: captureId });
  }
  
  /**
   * Met à jour le statut d'une capture (validée ou rejetée)
   */
  async updateCaptureStatus(
    id: number,
    idLot: number,
    filename: string,
    status: "valid" | "rejected",
    rejectionReason?: string
  ) {
    const payload = {
      id,
      idLot,
      filename,
      status,
      rejectionReason,
    };

    console.log("Payload pour updateCaptureStatus:", payload);
    return this.post(`/images/update_status`, payload);
  }

  /**
   * Finalise la revue des captures pour un lot donné.
   * Le backend doit vérifier que toutes les captures sont validées avant de procéder.
   */
  async finalizeCaptureReview(
    idLot: number,
    source_path: string,
    target_path: string
  ) {
    const payload = { idLot, source_path, target_path };
    return this.post(`/images/finalize`, payload);
  }

  /**
   * Récupère les points échantillonnés (échantillons) d’un lot donné
   */
  async getSampledPoints(idLot: number) {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/echantillons/${idLot}`, {
      method: "GET",
      headers,
    });

    // Vérifie le statut HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `La requête a échoué avec le statut ${response.status}`,
      }));
      throw new Error(
        errorData.message || "Échec de la récupération des échantillons"
      );
    }

    return await response.json();
  }
}

export default new CQService();
