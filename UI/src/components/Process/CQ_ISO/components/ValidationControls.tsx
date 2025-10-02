// import React from 'react';
// import { ChevronLeft, ChevronRight, Check, X, Flag, Power } from 'lucide-react';

// interface ValidationControlsProps {
//     currentPointIndex: number;
//     totalPoints: number;
//     onPrevious: () => void;
//     onNext: () => void;
//     onValidate: () => void;
//     onInvalidate: () => void;
//     onFinish: () => void;
//     onExit: () => void;
// }

// const ValidationControls: React.FC<ValidationControlsProps> = ({
//     currentPointIndex,
//     totalPoints,
//     onPrevious,
//     onNext,
//     onValidate,
//     onInvalidate,
//     onFinish,
//     onExit,
// }) => {
//     const isFirstPoint = currentPointIndex === 0;
//     const isLastPoint = currentPointIndex === totalPoints - 1;

//     return (
//         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl p-3 flex items-center gap-4 z-20 border border-gray-200">
//              <button
//                 onClick={onExit}
//                 className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
//                 title="Quitter la validation"
//             >
//                 <Power size={20} />
//             </button>
//             <div className="w-px h-8 bg-gray-200"></div>
//             <div className="flex items-center gap-2">
//                 <button
//                     onClick={onPrevious}
//                     disabled={isFirstPoint}
//                     className="p-2 rounded-full enabled:hover:bg-gray-100 transition-colors disabled:opacity-40"
//                     aria-label="Point précédent"
//                 >
//                     <ChevronLeft size={24} />
//                 </button>
//                 <span className="font-mono text-sm text-gray-700 whitespace-nowrap w-24 text-center">
//                     {currentPointIndex + 1} / {totalPoints}
//                 </span>
//                 <button
//                     onClick={onNext}
//                     disabled={isLastPoint}
//                     className="p-2 rounded-full enabled:hover:bg-gray-100 transition-colors disabled:opacity-40"
//                     aria-label="Point suivant"
//                 >
//                     <ChevronRight size={24} />
//                 </button>
//             </div>
//             <div className="w-px h-8 bg-gray-200"></div>
//             <div className="flex items-center gap-3">
//                 <button
//                     onClick={onInvalidate}
//                     className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-all transform hover:scale-105"
//                     aria-label="Marquer comme erreur"
//                 >
//                     <X size={18} />
//                     <span>Erreur</span>
//                 </button>
//                 <button
//                     onClick={onValidate}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-all transform hover:scale-105"
//                     aria-label="Marquer comme valide"
//                 >
//                     <Check size={18} />
//                     <span>Valide</span>
//                 </button>
//             </div>
//              <div className="w-px h-8 bg-gray-200"></div>
//             <button
//                 onClick={onFinish}
//                 className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
//                 title="Terminer et voir le résumé"
//             >
//                 <Flag size={18} />
//                 <span>Terminer</span>
//             </button>
//         </div>
//     );
// };

// export default ValidationControls;


import React from 'react';
import { Point } from '../../../../types/Image';
import { ChevronLeft, ChevronRight, Check, X, Flag } from 'lucide-react';

interface ValidationControlsProps {
    currentPointIndex: number;
    totalPoints: number;
    pointData: { point: Point; originalIndex: number } | null;
    onValidate: () => void;
    onError: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onFinish: () => void;
    validationStats: { valid: number; error: number; pending: number };
    onExit: () => void;
}

const ValidationControls: React.FC<ValidationControlsProps> = ({
    currentPointIndex,
    totalPoints,
    pointData,
    onValidate,
    onError,
    onNext,
    onPrevious,
    onFinish,
    validationStats,
    onExit
}) => {
    if (!pointData) return null;

    const progressPercentage = totalPoints > 0 ? ((currentPointIndex + 1) / totalPoints) * 100 : 0;
    const { valid, error } = validationStats;
    const validatedCount = valid + error;

    const validPercentage = totalPoints > 0 ? (valid / totalPoints) * 100 : 0;
    const errorPercentage = totalPoints > 0 ? (error / totalPoints) * 100 : 0;


    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-10 border-t border-gray-200">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <button
                    onClick={onExit}
                    className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Quitter la validation"
                >
                    <Power size={20} />
                </button>
                {/* Progress and Info */}
                <div className="flex items-center gap-6">
                    <div>
                        <span className="text-lg font-bold text-gray-800">Validation des points</span>
                        <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${validPercentage}%` }}></div>
                            <div className="absolute top-0 h-full bg-red-500" style={{ left: `${validPercentage}%`, width: `${errorPercentage}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-600 font-semibold">Valides: {valid}</span>
                            <span className="text-red-600 font-semibold">Erreurs: {error}</span>
                            <span className="text-gray-500">Restants: {totalPoints - validatedCount}</span>
                        </div>
                    </div>
                    <div className="border-l pl-6">
                        <p className="text-sm text-gray-500">Index du point: <span className="font-semibold text-gray-800">{pointData.originalIndex + 1}</span></p>
                        <p className="text-sm text-gray-500">Coordonnées: <span className="font-semibold text-gray-800">X: {pointData.point.x.toFixed(2)}, Y: {pointData.point.y.toFixed(2)}</span></p>
                        <p className="text-sm text-gray-500">Progression échantillon: <span className="font-bold text-indigo-600">{currentPointIndex + 1} / {totalPoints}</span></p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onPrevious}
                        disabled={currentPointIndex === 0}
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Point précédent"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                        onClick={onNext}
                        disabled={currentPointIndex === totalPoints - 1}
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Point suivant"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>

                    <div className="w-px h-8 bg-gray-300 mx-2"></div>

                    <button
                        onClick={onError}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
                        aria-label="Marquer comme erreur (E)"
                    >
                        <X className="w-4 h-4" /> Erreur <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-red-500 bg-white rounded-md border border-red-200">E</kbd>
                    </button>
                    <button
                        onClick={onValidate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
                        aria-label="Valider le point (V)"
                    >
                        <Check className="w-4 h-4" /> Valide <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-green-500 bg-white rounded-md border border-green-200">V</kbd>
                    </button>

                    <div className="w-px h-8 bg-gray-300 mx-2"></div>

                    <button
                        onClick={onFinish}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                        aria-label="Terminer la validation"
                    >
                        <Flag className="w-4 h-4" /> Terminer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationControls;