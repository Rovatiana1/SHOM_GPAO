// export async function parseCsvFile(csvFile: File) {
//   const formData = new FormData();
//   formData.append("csvfile", csvFile);

//   const response = await fetch("http://localhost:6003/api/cq/parse_csv", {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) throw new Error("Erreur lors du traitement CSV");
//   return await response.json(); // { metadata, points, dates, image }
// }

// export async function savePoints(points: any[], dates: string[], metadata: any, duration: number) {
//   const response = await fetch("http://localhost:6003/api/cq/save_points", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ points, dates, metadata, duration }),
//   });

//   if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
//   return response; // c’est un CSV à télécharger
// }

// export async function updateMetadata(metadata: any) {
//   const response = await fetch("http://localhost:6003/api/cq/update_metadata", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(metadata),
//   });
//   return await response.json();
// }

// export async function exportCsv(points: any[], interval: number, base_date: string) {
//   const response = await fetch("http://localhost:6003/api/cq/export", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ points, interval, base_date }),
//   });

//   if (!response.ok) throw new Error("Erreur export CSV");
//   return response; // CSV à télécharger
// }



export async function parseCsvFile(csvFile: File) {
  const formData = new FormData();
  formData.append("csvfile", csvFile);

  const response = await fetch("http://localhost:6003/api/cq/parse_csv", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors du traitement CSV");
  return await response.json(); // { metadata, points, dates, image }
}

export async function parseCsvFromPath(path: string) {
    const response = await fetch("http://localhost:6003/api/cq/parse_csv_from_path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
    });

    if (!response.ok) throw new Error("Erreur lors du traitement CSV depuis le chemin");
    return await response.json();
}

export async function savePoints(points: any[], dates: string[], metadata: any, duration: number) {
  const response = await fetch("http://localhost:6003/api/cq/save_points", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points, dates, metadata, duration }),
  });

  if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
  return response; // c’est un CSV à télécharger
}

export async function updateMetadata(metadata: any) {
  const response = await fetch("http://localhost:6003/api/cq/update_metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  return await response.json();
}

export async function exportCsv(points: any[], interval: number, base_date: string) {
  const response = await fetch("http://localhost:6003/api/cq/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points, interval, base_date }),
  });

  if (!response.ok) throw new Error("Erreur export CSV");
  return response; // CSV à télécharger
}
