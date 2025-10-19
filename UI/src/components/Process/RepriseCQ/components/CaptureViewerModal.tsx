import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaptureReviewItem } from '../../../../types/Image';
import Icons from './Icons';

interface CaptureViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    captures: CaptureReviewItem[];
}

const CaptureViewerModal: React.FC<CaptureViewerModalProps> = ({
    isOpen,
    onClose,
    captures,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentCapture = useMemo(() => captures[currentIndex], [captures, currentIndex]);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight' && currentIndex < captures.length - 1) {
                goToNext();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                goToPrevious();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, captures.length]);


    const goToNext = () => {
        if (currentIndex < captures.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (!isOpen) return null;

    if (captures.length === 0) {
        return (
             <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            Visualisation des Captures
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <Icons.Close />
                        </button>
                    </div>
                    <div className="p-10 text-center text-gray-600">
                        Aucune capture n'est associée à ce lot.
                    </div>
                     <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    const statusInfo = {
        valid: { text: 'Validée', icon: <Icons.Check />, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
        rejected: { text: 'Rejetée', icon: <Icons.X />, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
        pending: { text: 'En attente', icon: <div className="w-4 h-4 rounded-full bg-gray-400" />, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
    };

    const currentStatusInfo = statusInfo[currentCapture!.status] || statusInfo.pending;

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[80vw] h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        Visualisation des Captures ({currentIndex + 1} / {captures.length})
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Icons.Close />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto flex flex-col md:flex-row gap-6">
                    <div className="flex-1 md:w-2/3 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentIndex}
                                src={currentCapture!.imageData}
                                alt="Capture d'écran"
                                className="max-w-full max-h-full object-contain"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            />
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 md:w-1/3 space-y-4">
                        <div className={`p-3 border rounded-md ${currentStatusInfo.bg} ${currentStatusInfo.border}`}>
                            <h3 className="font-semibold text-gray-700 mb-2">Statut de la capture</h3>
                            <div className={`flex items-center gap-2 font-bold ${currentStatusInfo.color}`}>
                                {currentStatusInfo.icon}
                                <span>{currentStatusInfo.text}</span>
                            </div>
                        </div>
                        
                        {currentCapture!.status === 'rejected' && currentCapture!.rejectionReason && (
                            <div className="p-3 border rounded-md bg-red-50 border-red-200">
                                <label className="block text-sm font-bold text-red-800">Motif du Rejet</label>
                                <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{currentCapture!.rejectionReason}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-black">Type</label>
                            <p className="mt-1 text-sm text-gray-800">{currentCapture!.type}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black">Nature</label>
                            <p className="mt-1 text-sm text-gray-800">{currentCapture!.nature}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black">Nom du fichier</label>
                            <p className="mt-1 text-sm text-gray-800 font-semibold truncate" title={currentCapture!.filename}>{currentCapture!.filename}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black">Image Correspondante</label>
                            <p className="mt-1 text-sm text-gray-800">{currentCapture!.imageCorrespondante}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={goToPrevious} disabled={currentIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-100">
                        <Icons.ChevronLeft /> Précédent
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        Fermer
                    </button>
                    <button onClick={goToNext} disabled={currentIndex === captures.length - 1} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-100">
                        Suivant <Icons.ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaptureViewerModal;