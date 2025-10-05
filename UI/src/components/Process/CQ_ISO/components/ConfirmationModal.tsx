import React from 'react';
import { Point } from '../../../../types/Image';
import Icons from './Icons';

interface ConfirmationModalProps {
    points: Point[];
    onConfirm: () => void;
    onClose: () => void;
    validationStats: { valid: number; error: number; pending: number };
    totalPoints: number;
    onReject?: () => void; // ✅ ajout callback rejet
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ points, onConfirm, onClose, validationStats, totalPoints, onReject }) => {
    const errorPoints = points.map((p, i) => ({ ...p, originalIndex: i })).filter(p => p.validationStatus === 'error');

    const { valid } = validationStats;
    const validRate = totalPoints > 0 ? (valid / totalPoints) * 100 : 0;
    const errorRate = totalPoints > 0 ? (errorPoints.length / totalPoints) * 100 : 0;

    const SUCCESS_THRESHOLD = 98.5;
    const isSuccessRateMet = validRate >= SUCCESS_THRESHOLD;

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Confirmer l'export final</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Icons.Close />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">

                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Résumé de la validation</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Taux de points valides</p>
                                <p className={`text-2xl font-bold ${isSuccessRateMet ? 'text-green-600' : 'text-red-600'}`}>
                                    {validRate.toFixed(2)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Taux de points en erreur</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {errorRate.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                        {!isSuccessRateMet && (
                            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                                Le taux de validation de {SUCCESS_THRESHOLD}% n'est pas atteint. La correction des points est recommandée avant l'export final.
                            </div>
                        )}
                    </div>

                    {errorPoints.length > 0 ? (
                        <div>
                            <p className="text-gray-600 mb-4">Détail des points marqués comme erreurs :</p>
                            <div className="border rounded-md">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3"># Point</th>
                                            <th scope="col" className="px-6 py-3">Coordonnée X</th>
                                            <th scope="col" className="px-6 py-3">Coordonnée Y</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {errorPoints.map((point) => (
                                            <tr key={point.originalIndex} className="bg-white border-b hover:bg-red-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {point.originalIndex + 1}
                                                </th>
                                                <td className="px-6 py-4">{point.x.toFixed(2)}</td>
                                                <td className="px-6 py-4">{point.y.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center py-4">Aucune erreur n'a été marquée. Vous pouvez enregistrer.</p>
                    )}
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition-colors"
                    >
                        Annuler
                    </button>
                    {isSuccessRateMet ? (
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                        >
                            Confirmer et Enregistrer
                        </button>
                    ) : (
                        <button
                            onClick={onReject}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                        >
                            Rejeter en CQ cible
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;