import React from 'react';
import { Point } from '../../../../types/Image';
import Icons from './Icons';

interface ConfirmationModalProps {
    points: Point[];
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ points, onConfirm, onClose }) => {
    const errorPoints = points.map((p, i) => ({ ...p, originalIndex: i })).filter(p => p.validationStatus === 'error');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Confirmer les erreurs</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Icons.Close />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {errorPoints.length > 0 ? (
                        <div>
                            <p className="text-gray-600 mb-4">Veuillez confirmer la liste des points marqués comme erreurs avant de sauvegarder :</p>
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
                        <p className="text-gray-700 text-center py-8">Aucune erreur n'a été marquée. Vous pouvez enregistrer.</p>
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
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                    >
                        Confirmer et Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
