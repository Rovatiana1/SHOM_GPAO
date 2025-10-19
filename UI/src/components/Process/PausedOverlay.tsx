

import React from 'react';
import { PlayCircle, PauseCircle } from 'lucide-react';

interface PausedOverlayProps {
  onResume: () => void;
  reason: { id: number, label: string } | null;
}

const PausedOverlay: React.FC<PausedOverlayProps> = ({ onResume, reason }) => {
  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-lg z-50 flex flex-col items-center justify-center text-white"
      aria-hidden="true" 
    >
      <div className="text-center" data-aos="fade-up">
        <PauseCircle size={64} className="mx-auto mb-6 text-yellow-400" />
        <h1 className="text-4xl font-bold mb-3">Application en Pause</h1>
        {reason && (
          <p className="text-xl text-yellow-200 mb-2">
            Motif : <span className="font-semibold">{reason.label}</span>
          </p>
        )}
        <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">Cliquez sur le bouton ci-dessous pour reprendre votre travail.</p>
        <button
          onClick={onResume}
          className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
        >
          <PlayCircle className="w-6 h-6 mr-3" />
          Reprendre le travail
        </button>
      </div>
    </div>
  );
};

export default PausedOverlay;