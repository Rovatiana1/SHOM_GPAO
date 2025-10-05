// import { Point } from "../types/Image";

// export async function parseCsvFile(csvFile: File, imagePath: string) {
//   const formData = new FormData();
//   formData.append("csvfile", csvFile);

//   const response = await fetch(
//     `http://localhost:6003/api/cq/parse_csv?image_path=${imagePath}`,
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   if (!response.ok) throw new Error("Erreur lors du traitement CSV");
//   return await response.json(); // { metadata, points, dates, image }
// }

// export async function getFileFromPath(
//   path: string
// ): Promise<{ name: string; content: string }> {
//   console.log("getFileFromPath path ==> ", path);
//   const response = await fetch(
//     "http://localhost:6003/api/cq/get_file_from_path",
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ path }),
//     }
//   );

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Erreur lors de la récupération du fichier : ${errorText}`);
//   }
//   return await response.json();
// }

// export async function savePoints(
//   points: any[],
//   dates: string[],
//   metadata: any,
//   duration: number,
//   export_path: string
// ) {
//   console.log("metadata ==> ", metadata);
  
//   let metadataWithTuple = metadata;
//   if(metadata.origin_px[0]){
//     metadataWithTuple = {
//       ...metadata,
//       origin_px: `(${metadata.origin_px[0]}, ${metadata.origin_px[1]})`,
//       origin_value: metadata.origin_value ?? "(0, 0)",
//       x_max_px: `(${metadata.x_max_px[0]}, ${metadata.x_max_px[1]})`,
//       y_max_px: `(${metadata.y_max_px[0]}, ${metadata.y_max_px[1]})`,
//     };
//   }

//   console.log("metadataWithTuple ==> ", metadataWithTuple);

//   const payload = {
//     points,
//     dates,
//     metadata: metadataWithTuple,
//     duration,
//     export_path,
//   };

//   const response = await fetch("http://localhost:6003/api/cq/save_points", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
//   return response; // tu récupéreras du JSON {status, file_path}
// }

// export async function updateMetadata(metadata: any) {
//   const response = await fetch("http://localhost:6003/api/cq/update_metadata", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(metadata),
//   });
//   return await response.json();
// }

// export async function exportCsv(
//   points: any[],
//   interval: number,
//   base_date: string
// ) {
//   const response = await fetch("http://localhost:6003/api/cq/export", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ points, interval, base_date }),
//   });

//   if (!response.ok) throw new Error("Erreur export CSV");
//   return response; // CSV à télécharger
// }

// export async function saveCaptures(csvContent: string, captures: Array<{ imageData: string; filename: string }>, outputPath: string) {
//     const formData = new FormData();
//     // Use the lot name for the CSV filename, following the pattern
//     const csvFilename = captures[0]!.filename.replace(/_MC_\d{3}\.jpg$/, '_MM_MC.csv');
//     formData.append('csv_report', new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), csvFilename);
    
//     for (const capture of captures) {
//         const response = await fetch(capture.imageData);
//         const blob = await response.blob();
//         formData.append('images', blob, capture.filename);
//     }

//     formData.append('outputPath', outputPath);

//     const response = await fetch("http://localhost:6003/api/cq/save_captures", {
//         method: "POST",
//         body: formData,
//     });

//     if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Erreur lors de la sauvegarde des captures: ${errorText}`);
//     }
//     return await response.json();
// }

// src/services/CQService.ts

import authService from './AuthService';

const API_BASE_URL = 'http://localhost:6003/api/cq';

class CQService {
  /**
   * Méthode générique pour envoyer des requêtes POST avec token JWT
   */
  private async post(endpoint: string, body: object | FormData, isFormData: boolean = false) {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const headers: HeadersInit = isFormData
      ? { Authorization: `Bearer ${token}` }
      : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
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
    return this.post(`/parse_csv?image_path=${encodeURIComponent(imagePath)}`, formData, true);
  }

  /**
   * Récupère un fichier via son chemin
   */
  async getFileFromPath(path: string): Promise<{ name: string; content: string }> {
    return this.post('/get_file_from_path', { path });
  }

  /**
   * Sauvegarde les points analysés avec leurs métadonnées et durée
   */
  async savePoints(
    points: any[],
    dates: string[],
    metadata: any,
    duration: number,
    export_path: string
  ) {
    console.log("metadata ==> ", metadata);

    // Conversion des tuples [x, y] en chaîne "(x, y)" si nécessaire
    let metadataWithTuple = metadata;
    if (metadata.origin_px?.[0]) {
      metadataWithTuple = {
        ...metadata,
        origin_px: `(${metadata.origin_px[0]}, ${metadata.origin_px[1]})`,
        origin_value: metadata.origin_value ?? "(0, 0)",
        x_max_px: `(${metadata.x_max_px[0]}, ${metadata.x_max_px[1]})`,
        y_max_px: `(${metadata.y_max_px[0]}, ${metadata.y_max_px[1]})`,
      };
    }

    const payload = {
      points,
      dates,
      metadata: metadataWithTuple,
      duration,
      export_path,
    };

    return this.post('/save_points', payload);
  }

  /**
   * Met à jour les métadonnées dans le fichier JSON
   */
  async updateMetadata(metadata: any) {
    return this.post('/update_metadata', metadata);
  }

  /**
   * Exporte les points sous format CSV
   */
  async exportCsv(points: any[], interval: number, base_date: string) {
    const response = await this.post('/export', { points, interval, base_date });
    return response; // CSV téléchargeable côté serveur
  }

  /**
   * Sauvegarde les captures et le rapport CSV dans un dossier
   */
  async saveCaptures(
    csvContent: string,
    captures: Array<{ imageData: string; filename: string }>,
    outputPath: string
  ) {
    const formData = new FormData();

    // Utilise le nom du lot pour le rapport CSV
    const csvFilename = captures[0]!.filename.replace(/_MC_\d{3}\.jpg$/, '_MM_MC.csv');
    formData.append('csv_report', new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), csvFilename);

    // Ajoute toutes les images
    for (const capture of captures) {
      const response = await fetch(capture.imageData);
      const blob = await response.blob();
      formData.append('images', blob, capture.filename);
    }

    formData.append('outputPath', outputPath);

    return this.post('/save_captures', formData, true);
  }
}

export default new CQService();
