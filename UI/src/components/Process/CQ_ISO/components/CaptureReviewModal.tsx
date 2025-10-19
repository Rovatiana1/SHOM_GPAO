import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaptureReviewItem } from '../../../../types/Image';
import Icons from './Icons';

interface CaptureReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    captures: CaptureReviewItem[];
    onUpdateCaptureStatus: (index: number, status: 'valid' | 'rejected', reason?: string) => void;
    onFinalize: () => Promise<void>;
}

const CaptureReviewModal: React.FC<CaptureReviewModalProps> = ({
    isOpen,
    onClose,
    captures,
    onUpdateCaptureStatus,
    onFinalize,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const currentCapture = useMemo(() => captures[currentIndex], [captures, currentIndex]);
    const canFinalize = useMemo(() => {
        if (captures.length === 0) return false;
        return captures.every(c => c.status === 'valid');
    }, [captures]);

    useEffect(() => {
        if (isOpen) {
            const firstPending = captures.findIndex(c => c.status === 'pending');
            setCurrentIndex(firstPending !== -1 ? firstPending : 0);
            setIsRejecting(false);
            setRejectionReason('');
        }
    }, [isOpen, captures]);

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

    const resetRejection = () => {
        setIsRejecting(false);
        setRejectionReason('');
    };

    const goToNext = () => {
        if (currentIndex < captures.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetRejection();
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            resetRejection();
        }
    };

    const handleValidate = () => {
        onUpdateCaptureStatus(currentIndex, 'valid');
        goToNext();
    };

    const handleReject = () => {
        if (rejectionReason.trim() === '') {
            alert('Veuillez fournir un motif de rejet.');
            return;
        }
        onUpdateCaptureStatus(currentIndex, 'rejected', rejectionReason);
        goToNext();
    };
    
    const handleFinalizeClick = async () => {
        if (!canFinalize) return;
        setIsFinalizing(true);
        try {
            await onFinalize();
        } finally {
            setIsFinalizing(false);
        }
    };

    if (!isOpen || !currentCapture) return null;

    const statusInfo = {
        valid: { text: 'Validée', icon: <Icons.Check />, color: 'text-green-500' },
        rejected: { text: 'Rejetée', icon: <Icons.X />, color: 'text-red-500' },
        pending: { text: 'En attente', icon: <div className="w-4 h-4 rounded-full bg-gray-400" />, color: 'text-gray-500' },
    };

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[80vw] h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        Vérification des Captures ({currentIndex + 1} / {captures.length})
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
                                src={currentCapture.imageData}
                                alt="Capture d'écran"
                                className="max-w-full max-h-full object-contain"
                                {...{
                                    initial: { opacity: 0, scale: 0.95 },
                                    animate: { opacity: 1, scale: 1 },
                                    exit: { opacity: 0, scale: 0.95 },
                                    transition: { duration: 0.2 },
                                }}
                            />
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 md:w-1/3 space-y-4">
                        <div className="p-3 border rounded-md bg-gray-50">
                            <h3 className="font-semibold text-gray-700 mb-2">Statut de la capture</h3>
                            <div className={`flex items-center gap-2 font-bold ${statusInfo[currentCapture.status].color}`}>
                                {statusInfo[currentCapture.status].icon}
                                <span>{statusInfo[currentCapture.status].text}</span>
                            </div>
                        </div>
                        
                        {currentCapture.status === 'rejected' && currentCapture.rejectionReason && (
                            <div className="p-3 border rounded-md bg-red-50 border-red-200">
                                <label className="block text-sm font-bold text-red-800">Motif du Rejet</label>
                                <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{currentCapture.rejectionReason}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-black">Type</label>
                            <p className="mt-1 text-sm text-gray-800">{currentCapture.type}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black">Nature</label>
                            <p className="mt-1 text-sm text-gray-800">{currentCapture.nature}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black">Nom du fichier</label>
                            <p className="mt-1 text-sm text-gray-800 font-semibold truncate" title={currentCapture.filename}>{currentCapture.filename}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black">Image Correspondante</label>
                            <p className="mt-1 text-sm text-gray-800">{currentCapture.imageCorrespondante}</p>
                        </div>
                        <div className="pt-4 border-t">
                            {isRejecting ? (
                                <div className="space-y-2">
                                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Motif du rejet</label>
                                    <textarea
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="Expliquez pourquoi cette capture est rejetée..."
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">Confirmer le rejet</button>
                                        <button onClick={resetRejection} className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setIsRejecting(true)} className="flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 font-semibold rounded-md hover:bg-red-200 transition-colors">
                                        <Icons.X /> Rejeter
                                    </button>
                                    <button onClick={handleValidate} className="flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 font-semibold rounded-md hover:bg-green-200 transition-colors">
                                        <Icons.Check /> Valider
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={goToPrevious} disabled={currentIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-100">
                        <Icons.ChevronLeft /> Précédent
                    </button>
                    <div className="flex items-center gap-3">
                         <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Fermer
                        </button>
                        <button
                            onClick={handleFinalizeClick}
                            disabled={!canFinalize || isFinalizing}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isFinalizing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin" />
                                    <span className="ml-2">Copie en cours ...</span>
                                </>
                            ) : (
                                'Terminer et copier les captures vers CQ ISO'
                            )}
                        </button>
                    </div>
                    <button onClick={goToNext} disabled={currentIndex === captures.length - 1} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-100">
                        Suivant <Icons.ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaptureReviewModal;