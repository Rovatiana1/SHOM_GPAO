export async function parseCsvFile(csvFile: File, imagePath: string) {
  const formData = new FormData();
  formData.append("csvfile", csvFile);

  const response = await fetch(`http://localhost:6003/api/cq/parse_csv?image_path=${imagePath}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors du traitement CSV");
  return await response.json(); // { metadata, points, dates, image }
}

export async function getFileFromPath(path: string): Promise<{ name: string; content: string }> {
    const response = await fetch("http://localhost:6003/api/cq/get_file_from_path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la récupération du fichier : ${errorText}`);
    }
    return await response.json();
}

export async function savePoints(points: any[], dates: string[], metadata: any, duration: number) {
  console.log("{ points, dates, metadata, duration }payload ==> ", points, dates, metadata, duration);
  const metadataWithTuple = {
    ...metadata,
    origin_px: `(${metadata.origin_px[0]}, ${metadata.origin_px[1]})`,
    origin_value: metadata.origin_value ?? '(0, 0)', // 👈 valeur par défaut (ou calculée)
    x_max_px: `(${metadata.x_max_px[0]}, ${metadata.x_max_px[1]})`,
    y_max_px: `(${metadata.y_max_px[0]}, ${metadata.y_max_px[1]})`,
  };

  const payload = { points, dates, metadata: metadataWithTuple, duration };

  console.log("{ points, dates, metadata, duration }payload ==> ", payload);

  const response = await fetch("http://localhost:6003/api/cq/save_points", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
  return response; // CSV à télécharger
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