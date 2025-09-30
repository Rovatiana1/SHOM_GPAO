import React from 'react';
import { ChevronLeft, ChevronRight, Check, X, Flag, Power } from 'lucide-react';

interface ValidationControlsProps {
    currentPointIndex: number;
    totalPoints: number;
    onPrevious: () => void;
    onNext: () => void;
    onValidate: () => void;
    onInvalidate: () => void;
    onFinish: () => void;
    onExit: () => void;
}

const ValidationControls: React.FC<ValidationControlsProps> = ({
    currentPointIndex,
    totalPoints,
    onPrevious,
    onNext,
    onValidate,
    onInvalidate,
    onFinish,
    onExit,
}) => {
    const isFirstPoint = currentPointIndex === 0;
    const isLastPoint = currentPointIndex === totalPoints - 1;

    return (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl p-3 flex items-center gap-4 z-20 border border-gray-200">
             <button
                onClick={onExit}
                className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                title="Quitter la validation"
            >
                <Power size={20} />
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevious}
                    disabled={isFirstPoint}
                    className="p-2 rounded-full enabled:hover:bg-gray-100 transition-colors disabled:opacity-40"
                    aria-label="Point précédent"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="font-mono text-sm text-gray-700 whitespace-nowrap w-24 text-center">
                    {currentPointIndex + 1} / {totalPoints}
                </span>
                <button
                    onClick={onNext}
                    disabled={isLastPoint}
                    className="p-2 rounded-full enabled:hover:bg-gray-100 transition-colors disabled:opacity-40"
                    aria-label="Point suivant"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onInvalidate}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-all transform hover:scale-105"
                    aria-label="Marquer comme erreur"
                >
                    <X size={18} />
                    <span>Erreur</span>
                </button>
                <button
                    onClick={onValidate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-all transform hover:scale-105"
                    aria-label="Marquer comme valide"
                >
                    <Check size={18} />
                    <span>Valide</span>
                </button>
            </div>
             <div className="w-px h-8 bg-gray-200"></div>
            <button
                onClick={onFinish}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
                title="Terminer et voir le résumé"
            >
                <Flag size={18} />
                <span>Terminer</span>
            </button>
        </div>
    );
};

export default ValidationControls;
