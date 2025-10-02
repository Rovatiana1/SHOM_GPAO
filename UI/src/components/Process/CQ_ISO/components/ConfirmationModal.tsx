import React from 'react';
import { Point } from '../../../../types/Image';
import Icons from './Icons';

interface ConfirmationModalProps {
    points: Point[];
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ points, onConfirm, onClose }) => {
    const totalPoints = points.length;
    const errorPoints = points.map((p, i) => ({ ...p, originalIndex: i })).filter(p => p.validationStatus === 'error');
    const validPoints = points.filter(p => p.validationStatus === 'valid');
    const pendingPoints = points.filter(p => p.validationStatus === 'pending' || !p.validationStatus);
    
    const validatedCount = validPoints.length + errorPoints.length;
    const errorRate = validatedCount > 0 ? (errorPoints.length / validatedCount) * 100 : 0;

    const validPercentage = totalPoints > 0 ? (validPoints.length / totalPoints) * 100 : 0;
    const errorPercentage = totalPoints > 0 ? (errorPoints.length / totalPoints) * 100 : 0;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Confirmer et Exporter</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Icons.Close />
                    </button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3">Résumé du lot</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{totalPoints}</p>
                                <p className="text-sm text-gray-500">Total Points</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{validPoints.length}</p>
                                <p className="text-sm text-gray-500">Valides</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{errorPoints.length}</p>
                                <p className="text-sm text-gray-500">Erreurs</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-yellow-600">{errorRate.toFixed(1)}%</p>
                                <p className="text-sm text-gray-500">Taux d'erreur</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mt-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${validPercentage}%` }}></div>
                            <div className="absolute top-0 h-full bg-red-500" style={{ left: `${validPercentage}%`, width: `${errorPercentage}%`}}></div>
                        </div>
                    </div>

                    {errorPoints.length > 0 ? (
                        <div>
                            <h4 className="text-gray-600 mb-2 font-semibold">Détails des points en erreur :</h4>
                            <div className="border rounded-md max-h-64 overflow-y-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
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
                        <div className="text-center py-8">
                             <div className="mx-auto h-12 w-12 text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 mt-4">Aucune erreur n'a été marquée. Prêt pour l'export.</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Icons.Download /> Confirmer et Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;