
import React, { useState, useEffect } from "react";
import Icons from "./Icons";
import { Capture } from "../../../../types/Image";

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: string, nature: string) => void;
  imageData: string;
  imageCorrespondante: string;
  baseFilename: string;
  captures: Capture[];
}

const natureOptions: Record<string, string[]> = {
  "Metadonnée contextuelle": [
    "Commentaires de l'Observateur",
    "Information sur le repérage temporel du marégraphe",
    "Point de contraste sur le document",
    "Feuille de contrôle du marégramme",
    "Point de contrôle sur le document",
    "Information sur le zéro du marégraphe / zéro hydrographique",
    "Information sur le système horaire",
    "Information sur le réglage vertical du marégraphe",
    "Information sur le réglage temporel du marégraphe",
    "Explication sur Anomalie/lacune de mesures",
    "Information sur les conditions météo-marines"
  ],
  "Anomalie": ["Page Déchirée", "Tâche d'encre"],
};

const typeOptions = ["Metadonnée contextuelle", "Anomalie"];

const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  imageData,
  imageCorrespondante,
  baseFilename,
  captures,
}) => {
  const [type, setType] = useState(typeOptions[0]);
  const [nature, setNature] = useState(natureOptions[type!]![0]);
  const [filename, setFilename] = useState('');

  useEffect(() => {
    const countForType = captures.filter(c => c.type === type).length;
    const newIndex = (countForType + 1).toString().padStart(3, '0');
    
    const suffix = type === 'Anomalie' ? 'AN' : 'MC';
    setFilename(`${baseFilename}_${suffix}_${newIndex}.jpg`);
  }, [type, baseFilename, captures]);


  if (!isOpen) return null;

  const handleSave = () => {
    if (type && nature) {
      onSave(type, nature);
    } else {
      alert("Veuillez sélectionner un type et une nature.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Gérer la capture d'écran
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Image Preview */}
          <div className="flex-1 md:w-2/3 border rounded-lg overflow-hidden">
            <img
              src={imageData}
              alt="Screen Capture"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Form */}
          <div className="flex-1 md:w-1/3 space-y-4">
            <div className="pt-2 border-t">
              <label
                htmlFor="capture-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id="capture-type"
                value={type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setType(newType);
                  setNature(natureOptions[newType]![0]); // reset la nature par défaut
                }}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="capture-nature"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nature
              </label>
              <select
                id="capture-nature"
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {natureOptions[type!]!.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Correspondante
              </label>
              <p
                className="mt-1 block w-full p-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm sm:text-sm text-gray-600 truncate"
                title={imageCorrespondante}
              >
                {imageCorrespondante}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'image capturée
              </label>
              <p
                className="mt-1 block w-full p-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm sm:text-sm text-gray-600 truncate"
                title={filename}
              >
                {filename}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
          >
            Enregistrer la capture
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
