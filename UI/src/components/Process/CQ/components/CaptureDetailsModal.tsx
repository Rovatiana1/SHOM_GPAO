import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capture } from '../../../../types/Image';
import Icons from './Icons';

interface CaptureDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    captures: Capture[];
    onDeleteCapture: (index: number) => void;
}

const CaptureDetailsModal: React.FC<CaptureDetailsModalProps> = ({
    isOpen,
    onClose,
    captures,
    onDeleteCapture,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Effet pour gérer la touche "Échap" pour fermer la visionneuse
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
                                {captures.map((capture, index) => (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                                        <div className="ml-4 flex-grow">
                                            <p className="font-semibold text-gray-800 truncate" title={capture.filename}>{capture.filename}</p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Type:</span> {capture.type}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Nature:</span> {capture.nature}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onDeleteCapture(index)}
                                            className="ml-4 p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                            title="Supprimer cette capture"
                                        >
                                            <Icons.Trash2 />
                                        </button>
                                    </div>
                                ))}
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
                        // FIX: Property 'initial' does not exist on type 'IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>'.
                        // Wrapped framer-motion props in a spread object to resolve typing issue.
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                        }}
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
                            // FIX: Property 'layoutId' does not exist on type 'IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>'.
                            // Wrapped framer-motion props in a spread object to resolve typing issue.
                            {...{ layoutId: selectedImage }}
                            onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur l'image
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