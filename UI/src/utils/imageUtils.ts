// utils/imageUtils.ts
export interface Metadata {
  origin_px: [number, number];
  origin_value: [number, number] | number[];
  x_max_px: [number, number];
  y_max_px: [number, number];
  x_max_value: number;
  y_max_value: number;
  Img_path: string;
  [key: string]: any; // Pour d'autres clés possibles
}

export interface Point {
  x: number;
  y: number;
  date?: string;
}

export interface ParsedCSVResult {
  metadata: Metadata;
  data: Array<Record<string, any>>;
}

/**
 * Analyse le contenu CSV et retourne les métadonnées et les données
 */
export const parseMetadataAndData = (csvContent: string): ParsedCSVResult => {
  // TODO: Implémenter la logique d'analyse du CSV
  // Retour attendu : { metadata: {...}, data: [...] }
  return {
    metadata: {} as Metadata,
    data: [],
  };
};

/**
 * Dessine les points sur l'image et retourne l'image modifiée et les coordonnées
 */
export const drawPointsOnImage = (
  imagePath: string,
  data: Array<Point>,
  metadata: Metadata
): { image: any; pointCoords: Point[]; dateList: string[] } => {
  // TODO: Implémenter la logique de dessin des points sur l'image
  return {
    image: null,
    pointCoords: [],
    dateList: [],
  };
};

/**
 * Convertit une image en base64
 */
export const imageToBase64 = (image: any): string => {
  // TODO: Implémenter la conversion de l'image en base64
  return '';
};
