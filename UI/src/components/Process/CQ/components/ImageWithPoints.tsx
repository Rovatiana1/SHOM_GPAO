import React, { useEffect, useRef, useState } from "react";

// 🔹 Interface des données reçues depuis ton backend Flask
interface ParseCsvResponse {
  image: string; // Image encodée en base64 (clé "image")
  points: number[][]; // Tableau des coordonnées [[x, y], [x2, y2], ...]
}

interface Props {
  apiUrl: string; // Ex: "http://localhost:5000/parse_csv"
}

const ImageWithPoints: React.FC<Props> = ({ apiUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageData, setImageData] = useState<ParseCsvResponse | null>(null);

  // Charger les données depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        setImageData(data);
      } catch (err) {
        console.error("Erreur de chargement de l'image :", err);
      }
    };
    fetchData();
  }, [apiUrl]);

  // Dessiner l'image + points sur le canvas
  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = `data:image/png;base64,${imageData.image}`;

    img.onload = () => {
      // Redimensionner le canevas selon l’image
      canvas.width = img.width;
      canvas.height = img.height;

      // Dessiner l’image
      ctx.drawImage(img, 0, 0);

      // Dessiner les points rouges
      ctx.fillStyle = "red";
      for (const [x, y] of imageData.points) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
  }, [imageData]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-lg font-semibold mb-2">Aperçu image avec points</h2>
      {imageData ? (
        <canvas ref={canvasRef} className="border rounded shadow-lg" />
      ) : (
        <p className="text-gray-500">Chargement en cours...</p>
      )}
    </div>
  );
};

export default ImageWithPoints;
