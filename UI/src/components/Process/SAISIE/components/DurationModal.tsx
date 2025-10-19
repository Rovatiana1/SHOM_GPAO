
import React, { useState } from 'react';
import Icons from './Icons';

interface DurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (duration: number) => void;
}

const durationOptions = [
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '30 minutes', value: 30 },
    { label: '1 heure', value: 60 },
];

const DurationModal: React.FC<DurationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedDuration, setSelectedDuration] = useState<number>(30); // Default to 30 minutes

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm(selectedDuration);
    };

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-out">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">Choisissez une durée :</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Icons.Close />
                    </button>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {durationOptions.map((option) => (
                            <label key={option.value} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="duration"
                                    value={option.value}
                                    checked={selectedDuration === option.value}
                                    onChange={() => setSelectedDuration(option.value)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-4 text-md font-medium text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DurationModal;
