import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capture } from '../../../../types/Image';
import Icons from './Icons';

interface CaptureDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    captures: Capture[];
    onDeleteCapture: (index: number) => void;
    onArchiveCapture: (captureId: number) => void;
}

const CaptureDetailsModal: React.FC<CaptureDetailsModalProps> = ({
    isOpen,
    onClose,
    captures,
    onDeleteCapture,
    onArchiveCapture,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedImage(null);
            }
        };

        if (selectedImage) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedImage]);


    if (!isOpen) return null;

    const getStatusInfo = (status: 'pending' | 'valid' | 'rejected' | undefined) => {
        switch (status) {
            case 'valid':
                return { text: 'Validé', className: 'bg-green-100 text-green-800', icon: <Icons.Check className="w-4 h-4 mr-1.5" /> };
            case 'rejected':
                return { text: 'Rejeté', className: 'bg-red-100 text-red-800', icon: <Icons.X className="w-4 h-4 mr-1.5" /> };
            default: // pending or undefined
                return { text: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: <div className="w-2.5 h-2.5 mr-2 rounded-full bg-yellow-500 flex-shrink-0" /> };
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            Détails des captures ({captures.length})
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <Icons.Close />
                        </button>
                    </div>
                    <div className="p-6 flex-grow overflow-y-auto">
                        {captures.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                Aucune capture n'a été enregistrée pour le moment.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {captures.map((capture, index) => {
                                    const statusInfo = !capture.isNew ? getStatusInfo(capture.status) : null;
                                    return (
                                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <button
                                                onClick={() => setSelectedImage(capture.imageData)}
                                                className="flex-shrink-0 w-24 h-24 rounded-md border bg-white overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <img
                                                    src={capture.imageData}
                                                    alt={`Capture ${index + 1}`}
                                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </button>
                                            <div className="ml-4 flex-grow min-w-0">
                                                <p className="font-semibold text-gray-800 truncate" title={capture.filename}>{capture.filename}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Type:</span> {capture.type}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Nature:</span> {capture.nature}
                                                </p>
                                                 {statusInfo && (
                                                    <div className="mt-2 flex items-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                                                            {statusInfo.icon}
                                                            {statusInfo.text}
                                                        </span>
                                                    </div>
                                                )}
                                                {!capture.isNew && capture.status === 'rejected' && capture.rejectionReason && (
                                                    <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-300 text-red-800 rounded-r-md">
                                                        <p className="text-xs font-semibold">Motif du Rejet:</p>
                                                        <p className="text-xs mt-1 whitespace-pre-wrap">{capture.rejectionReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 ml-4 self-center">
                                                {capture.isNew ? (
                                                    <button
                                                        onClick={() => onDeleteCapture(index)}
                                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                        title="Supprimer cette capture"
                                                    >
                                                        <Icons.Trash2 />
                                                    </button>
                                                ) : (
                                                     <button
                                                        onClick={() => onArchiveCapture(capture.id!)}
                                                        disabled={capture.isArchived}
                                                        className="p-2 rounded-full transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={capture.isArchived ? "Cette capture est archivée" : "Archiver cette capture"}
                                                    >
                                                        <Icons.Archive className={capture.isArchived ? 'text-blue-600' : ''} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 cursor-pointer"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                            aria-label="Fermer l'aperçu"
                        >
                            <Icons.Close />
                        </button>
                        <motion.div
                            layoutId={selectedImage}
                            onClick={(e) => e.stopPropagation()}
                            className="relative cursor-default"
                        >
                            <img
                                src={selectedImage}
                                alt="Aperçu de la capture"
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CaptureDetailsModal;