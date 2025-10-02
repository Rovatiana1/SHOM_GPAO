
import React from 'react';
import { Coffee, Utensils, Hand, Users, Briefcase, Car, ShieldQuestion } from 'lucide-react';

interface PauseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectReason: (reason: { id: number, label: string }) => void;
}

const pauseReasons = [
    { id: 4, label: 'PAUSE: DEJEUNER', icon: Utensils, color: 'bg-orange-500' },
    { id: 1, label: 'PAUSE: MATIN/APREM', icon: Coffee, color: 'bg-yellow-500' },
    { id: 9, label: 'ABSENCE: PAUSE TOILETTE', icon: Hand, color: 'bg-blue-500' },
    { id: 8, label: 'ABSENCE: DELEGUE DU PERSONNEL', icon: Users, color: 'bg-purple-500' },
    { id: 11, label: 'ABSENCE: FUNHENCE INTERNE', icon: Briefcase, color: 'bg-teal-500' },
    { id: 26, label: 'ABSENCE: FUNHENCE EXTERNE', icon: Car, color: 'bg-cyan-500' },
    { id: 14, label: 'PERMISSION', icon: ShieldQuestion, color: 'bg-indigo-500' },
];

const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onClose, onSelectReason }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl m-4 transform transition-all duration-300 ease-out" data-aos="zoom-in-up">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Choisir un motif de pause</h3>
                    <p className="text-sm text-gray-500 mt-1">Sélectionnez la raison de votre interruption.</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pauseReasons.map(reason => {
                            const Icon = reason.icon;
                            return (
                                <button
                                    key={reason.id}
                                    onClick={() => onSelectReason(reason)}
                                    className={`group flex items-center w-full text-left p-4 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${reason.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-gray-800">{reason.label}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 text-right rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PauseModal;