import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ConfirmationModal from './components/ConfirmationModal';
import ValidationControls from './components/ValidationControls';
import CaptureReviewModal from './components/CaptureReviewModal';
import { DateInfo, DisplayMode, Metadata, Point, CaptureReviewItem } from '../../../types/Image';
import CQService from '../../../services/CQService';
import GpaoService from '../../../services/GpaoService';
import { useAppContext } from "../../../context/AppContext";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { getSampledPoints } from '../../../services/SamplingService';
import { completeAndMoveToNextStep, rejectToRepriseCQ, savePointsFinal } from '../../../store/slices/processSlice';
import ToastNotification, { ToastType } from '../../../utils/components/ToastNotification';

const CQ_ISO: React.FC = () => {
    // States from CQ
    const [points, setPoints] = useState<Point[]>([]);
    const [originalPoints, setOriginalPoints] = useState<Point[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [originalDates, setOriginalDates] = useState<string[]>([]);
    const [uniqueDates, setUniqueDates] = useState<DateInfo[]>([]);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [originalMetadata, setOriginalMetadata] = useState<Metadata | null>(null);
    const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('points');
    const [error, setError] = useState<string | null>(null);
    const [isChartVisible, setChartVisible] = useState(false);
    const [autoLoadedFilename, setAutoLoadedFilename] = useState<string | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // States for validation
    const [isValidationMode, setIsValidationMode] = useState(false);
    const [sampledPoints, setSampledPoints] = useState<Array<{ point: Point; originalIndex: number }>>([]);
    const [currentPointIndexInSample, setCurrentPointIndexInSample] = useState(0);
    const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [validationStats, setValidationStats] = useState({ valid: 0, error: 0, pending: 0 });
    const [isFetchingSamples, setIsFetchingSamples] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // State lock for validation actions

    // States for capture review
    const [capturesToReview, setCapturesToReview] = useState<CaptureReviewItem[]>([]);
    const [isCaptureReviewModalOpen, setCaptureReviewModalOpen] = useState(false);

    const { setCollapsed } = useAppContext();
    const dispatch: AppDispatch = useDispatch();
    const { currentLot, paths, loading: processLoading } = useSelector((state: RootState) => state.process);
    const { user } = useSelector((state: RootState) => state.auth);
    const processedLotId = useRef<number | null>(null);
    const isAutoLoading = useRef(false);

    // --- State Reset and Data Processing ---
    const resetState = useCallback((fullReset = true) => {
        setIsValidationMode(false);
        setSampledPoints([]);
        setCurrentPointIndexInSample(0);
        setConfirmationModalVisible(false);
        setValidationStats({ valid: 0, error: 0, pending: 0 });
        setCapturesToReview([]);
        setCaptureReviewModalOpen(false);

        if (fullReset) {
            setPoints([]);
            setOriginalPoints([]);
            setDates([]);
            setOriginalDates([]);
            setUniqueDates([]);
            setMetadata(null);
            setOriginalMetadata(null);
            setImageElement(null);
            setSelectedDate(null);
            setDisplayMode('points');
            setError(null);
            setAutoLoadedFilename(null);
            setCsvFile(null);
            isAutoLoading.current = false;
        }
    }, []);



    const processParsedData = useCallback(async (data: { metadata: Metadata; points: [number, number][]; dates: string[]; image: string }, idLot: number) => {
        const { metadata, points, dates, image } = data;

        const endInterFileAndStartProdLdt = async () => {
            if (currentLot && user) {
                try {
                    const endLdtParams = {
                        _idDossier: currentLot?.idDossier,
                        _idEtape: currentLot?.idEtape!,
                        _idPers: parseInt(user.userId, 10),
                        _idLotClient: currentLot?.idLotClient,
                        _idLot: currentLot?.idLot,
                        _idTypeLdt: 39,
                        _qte: 1,
                    };
                    await GpaoService.endLdt(endLdtParams);
                    const startLdtParams = {
                        _idDossier: currentLot?.idDossier,
                        _idEtape: currentLot?.idEtape!,
                        _idPers: parseInt(user.userId, 10),
                        _idLotClient: currentLot?.idLotClient,
                        _idLot: currentLot?.idLot,
                        _idTypeLdt: 0,
                        _qte: 1,
                    };
                    await GpaoService.startNewLdt(startLdtParams);
                } catch (err) {
                    console.error("Failed to manage LDTs", err);
                }
            }
        };

        setMetadata(metadata);
        setOriginalMetadata(JSON.parse(JSON.stringify(metadata)));
        setCollapsed(true);

        try {
            const response = await CQService.getCapturesForReview(idLot);

            // CORRECTION : Accéder à la propriété 'images' de la réponse
            if (response && response.images && Array.isArray(response.images)) {
                const capturesForReview: CaptureReviewItem[] = response.images.map((c: CaptureReviewItem) => ({
                    id: c.id,
                    imageData: c.imageData,
                    type: c.type,
                    nature: c.nature,
                    filename: c.filename,
                    imageCorrespondante: c.imageCorrespondante,
                    status: c.status, // Ajouter le statut par défaut
                    rejectionReason: c.rejectionReason, // Ajouter le statut par défaut
                }));

                console.log("etototot =>  ", capturesForReview);
                setCapturesToReview(capturesForReview);
                console.log(`✅ ${capturesForReview.length} captures chargées pour la revue`);
            } else {
                console.warn("getCapturesForReview ne contient pas de tableau images:", response);
                setCapturesToReview([]);
            }
        } catch (captureError) {
            console.error("Failed to fetch captures for review:", captureError);
            setError("Impossible de charger les captures à vérifier.");
            setCapturesToReview([]);
        }

        const baseColors = [
            "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
            "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
            "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
            "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
        ];

        const img = new Image();
        img.onload = () => {
            setImageElement(img);
            const imagePoints: Point[] = points.map(([x, y]) => ({ x, y, logicalX: 0, logicalY: 0, validationStatus: 'pending' }));
            setPoints(imagePoints);
            setOriginalPoints(JSON.parse(JSON.stringify(imagePoints)));
            setDates(dates);
            setOriginalDates(JSON.parse(JSON.stringify(dates)));

            const uniqueDatesArray = Array.from(new Set<string>(dates));
            setUniqueDates(
                uniqueDatesArray.map((d, index) => ({
                    date: d,
                    color: baseColors[index % baseColors.length]!,
                }))
            );
            setImageLoading(false);
            endInterFileAndStartProdLdt();
        };
        img.onerror = () => {
            setError("Erreur lors du chargement de l'image.");
            setImageLoading(false);
            endInterFileAndStartProdLdt();
        };
        img.src = `data:image/png;base64,${image}`;
    }, [setCollapsed, user, currentLot]);


    // --- File Handling and Auto-loading ---
    const handleFileChange = useCallback(async (file: File) => {
        setError(null);

        if (currentLot && user) {
            try {
                const startLdtParams = {
                    _idDossier: currentLot?.idDossier,
                    _idEtape: currentLot?.idEtape!,
                    _idPers: parseInt(user.userId, 10),
                    _idLotClient: currentLot?.idLotClient,
                    _idLot: currentLot?.idLot,
                    _idTypeLdt: 39, // Inter-fichier
                };
                await GpaoService.startNewLdt(startLdtParams);
            } catch (err) {
                const msg = `Erreur au démarrage du chrono inter-fichier: ${err instanceof Error ? err.message : String(err)}`;
                console.error(msg);
                setToast({ message: msg, type: 'error' });
            }
        }
        setImageLoading(true);
        if (!currentLot || !currentLot?.paths || !currentLot?.idLot) {
            setError("Les chemins ou l'ID pour le lot courant ne sont pas définis.");
            setImageLoading(false);
            return;
        }
        try {
            const data = await CQService.parseCsvFile(file, currentLot?.paths.IMAGE_PATH);
            await processParsedData(data, currentLot?.lotCQ.idLot);
        } catch (err) {
            console.error(err);
            setError("Impossible de parser le fichier CSV.");
            setImageLoading(false);

            if (currentLot && user) {
                try {
                    const endLdtParams = {
                        _idDossier: currentLot?.idDossier,
                        _idEtape: currentLot?.idEtape!,
                        _idPers: parseInt(user.userId, 10),
                        _idLotClient: currentLot?.idLotClient,
                        _idLot: currentLot?.idLot,
                        _idTypeLdt: 39,
                        _qte: 1,
                    };
                    await GpaoService.endLdt(endLdtParams);
                } catch (endErr) {
                    console.error("Failed to end inter-file LDT after CSV parse error", endErr);
                }
            }

        } finally {
            isAutoLoading.current = false;
        }
    }, [processParsedData, currentLot, user]);

    const handleManualFileSelect = (file: File | null) => {
        setAutoLoadedFilename(null);
        isAutoLoading.current = false;
        setCsvFile(file);
    };

    useEffect(() => {
        if (currentLot && paths && currentLot?.idLot !== processedLotId.current) {
            resetState(true);
            processedLotId.current = currentLot?.idLot;
            isAutoLoading.current = true;
            const autoLoadAndProcess = async (path: string) => {
                setError(null);
                try {
                    const { name, content } = await CQService.getFileFromPath(path);
                    const newFile = new File([content], name, { type: 'text/csv' });
                    setAutoLoadedFilename(name);
                    setCsvFile(newFile);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    setError(`Erreur lors du chargement automatique: ${errorMessage}`);
                    isAutoLoading.current = false;
                }
            };
            if (paths && paths.in) {
                autoLoadAndProcess(paths.in);
            } else {
                setError("Le chemin d'entrée n'est pas défini pour ce lot.");
            }
        } else if (!currentLot) {
            resetState(true);
            processedLotId.current = null;
        }
    }, [currentLot, paths, resetState]);

    useEffect(() => {
        if (csvFile && isAutoLoading.current) {
            handleFileChange(csvFile);
        }
    }, [csvFile, handleFileChange]);


    // --- Core Actions (Reset, Export) ---
    const handleReset = useCallback(() => {
        setPoints(JSON.parse(JSON.stringify(originalPoints)));
        setDates(JSON.parse(JSON.stringify(originalDates)));
        setMetadata(JSON.parse(JSON.stringify(originalMetadata)));
        resetState(false);
    }, [originalPoints, originalDates, originalMetadata, resetState]);

    const handleExport = () => setConfirmationModalVisible(true);

    const handleConfirmExport = async () => {
        if (!metadata || points.length === 0 || !currentLot || !currentLot?.paths) {
            setToast({ message: "Données manquantes pour l'export.", type: 'error' });
            return;
        }

        dispatch(
            savePointsFinal({
                idLot: currentLot?.lotCQ.idLot,
                points,
                dates,
                metadata,
                precision: 5,
                outPath: currentLot?.paths.OUT_CQ_ISO,
            })
        ).then((result) => {
            if (savePointsFinal.fulfilled.match(result)) {
                setToast({ message: "Fichier exporté avec succès.", type: "success" });
                setConfirmationModalVisible(false);
            } else {
                const errorMessage = typeof result.payload === 'string' ? result.payload : "Erreur lors de l’export CSV.";
                setToast({ message: errorMessage, type: "error" });
            }
        });
    };

    const handleStartValidation = async () => {
        if (!currentLot || !currentLot?.lotCQ) {
            setToast({ message: "ID du lot de CQ manquant.", type: "error" });
            return;
        }

        setIsFetchingSamples(true);
        try {
            const data = await CQService.getSampledPoints(currentLot?.lotCQ.idLot);

            console.log("data ===> ", data)
            if (data.status === "success") {
                setSampledPoints(data.sampled_points);
                setCurrentPointIndexInSample(0);
                setIsValidationMode(true);
                setValidationStats({
                    valid: 0,
                    error: 0,
                    pending: data.total_points,
                });
            } else {
                setToast({ message: data.message, type: "error" });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des échantillons:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la récupération des points à valider.";
            setToast({ message: errorMessage, type: "error" });
        } finally {
            setIsFetchingSamples(false);
        }
    };

    // --- Validation Logic ---
    const updatePointStatus = useCallback((status: 'valid' | 'error') => {
        const currentSampledPoint = sampledPoints[currentPointIndexInSample];
        if (!currentSampledPoint) {
            setIsUpdating(false);
            return;
        }

        setPoints(prevPoints => {
            const newPoints = [...prevPoints];
            const pointToUpdate = newPoints[currentSampledPoint.originalIndex];
            if (!pointToUpdate) return prevPoints;

            const oldStatus = pointToUpdate.validationStatus;
            pointToUpdate.validationStatus = status;

            // Mettre à jour validationStats ici, mais séparément
            setValidationStats(prev => {
                const updated = { ...prev };
                if (oldStatus === 'valid') updated.valid--;
                else if (oldStatus === 'error') updated.error--;
                else if (oldStatus === 'pending') updated.pending--;

                if (status === 'valid') updated.valid++;
                else if (status === 'error') updated.error++;

                return updated;
            });

            return newPoints;
        });

        if (currentPointIndexInSample < sampledPoints.length - 1) {
            setCurrentPointIndexInSample(prev => prev + 1);
        }

        setTimeout(() => setIsUpdating(false), 0);
    }, [currentPointIndexInSample, sampledPoints]);

    const handleValidateCurrentPoint = useCallback(() => {
        if (isUpdating) return;
        setIsUpdating(true);
        updatePointStatus('valid');
    }, [isUpdating, updatePointStatus]);

    const handleErrorCurrentPoint = useCallback(() => {
        if (isUpdating) return;
        setIsUpdating(true);
        updatePointStatus('error');
    }, [isUpdating, updatePointStatus]);

    const handleNextPoint = () => { if (!isUpdating && currentPointIndexInSample < sampledPoints.length - 1) setCurrentPointIndexInSample(p => p + 1); };
    const handlePreviousPoint = () => { if (!isUpdating && currentPointIndexInSample > 0) setCurrentPointIndexInSample(p => p - 1); };

    const handleFinishValidation = () => setConfirmationModalVisible(true);

    useEffect(() => {
        if (!isValidationMode) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === 'v') handleValidateCurrentPoint();
            else if (key === 'e') handleErrorCurrentPoint();
            else if (key === 'arrowright') handleNextPoint();
            else if (key === 'arrowleft') handlePreviousPoint();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isValidationMode, handleValidateCurrentPoint, handleErrorCurrentPoint, handleNextPoint, handlePreviousPoint]);

    const handleExitValidation = () => {
        setPoints(prev => prev.map(p => ({ ...p, validationStatus: 'pending' })));
        setIsValidationMode(false);
        setCurrentPointIndexInSample(0);
    };

    const currentValidationPoint = isValidationMode ? sampledPoints[currentPointIndexInSample] : null;

    const handleRejectToRepriseCQ = () => {
        if (window.confirm("Êtes-vous sûr de vouloir rejeter ce lot et le renvoyer en Reprise CQ ?")) {
            dispatch(rejectToRepriseCQ()).then((result) => {
                if (rejectToRepriseCQ.fulfilled.match(result)) {
                    setToast({ message: "Lot rejeté et renvoyé en CQ Cible avec succès.", type: 'success' });
                    setConfirmationModalVisible(false);
                } else {
                    const errorMessage = typeof result.payload === 'string' ? result.payload : "Échec du rejet du lot.";
                    setToast({ message: errorMessage, type: 'error' });
                }
            });
        }
    };

    // --- Capture Review Logic ---
    const handleReviewCaptures = () => {
        setCaptureReviewModalOpen(true);
    };


    const handleUpdateCaptureStatus = async (index: number, status: 'valid' | 'rejected', reason?: string) => {
        const captureToUpdate = capturesToReview[index];
        if (!captureToUpdate || !currentLot || !currentLot?.lotCQ) {
            setToast({ message: "Données de capture ou de lot manquantes.", type: 'error' });
            return;
        }

        try {
            await CQService.updateCaptureStatus(
                captureToUpdate.id,
                currentLot?.lotCQ.idLot,
                captureToUpdate.filename,
                status,
                reason
            );

            // Update local state on success
            setCapturesToReview(prev => {
                const newCaptures = [...prev];
                const capture = newCaptures[index];
                if (capture) {
                    capture.status = status;
                    capture.rejectionReason = reason!;
                }
                return newCaptures;
            });

            setToast({ message: `Capture "${captureToUpdate.filename}" mise à jour.`, type: 'success' });

        } catch (e) {
            console.error("Failed to update capture status:", e);
            const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
            setToast({ message: `Échec de la mise à jour du statut de la capture: ${errorMessage}`, type: 'error' });
        }
    };

    const handleFinalizeReview = async () => {
        if (!currentLot || !currentLot?.lotCQ) {
            setToast({ message: "ID du lot manquant pour finaliser.", type: 'error' });
            return;
        }
        try {
            console.log("currentLot ==+> ", currentLot);
            console.log("Finalizing capture review for lot:", currentLot?.lotCQ.idLot, currentLot?.paths.IN_CQ_ISO, currentLot?.paths.OUT_CQ_ISO);
            await CQService.finalizeCaptureReview(currentLot?.lotCQ.idLot, currentLot?.paths.OUT_CQ, currentLot?.paths.OUT_CQ_ISO);
            setToast({ message: "Vérification des captures terminée avec succès. Les fichiers ont été déplacés.", type: 'success' });
            setCaptureReviewModalOpen(false);
            setCapturesToReview([]);
        } catch (e) {
            console.error("Failed to finalize capture review:", e);
            const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
            setToast({ message: `Échec de la finalisation : ${errorMessage}`, type: 'error' });
        }
    };

    const pendingCapturesCount = capturesToReview.filter(c => c.status === 'pending').length;


    return (
        <div className="flex h-full w-full font-sans">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Toolbar
                onFileChange={handleFileChange}
                uniqueDates={uniqueDates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                onExport={handleExport}
                onReset={handleReset}
                onShowChart={() => setChartVisible(true)}
                onStartAddingPoint={() => { }}
                metadata={metadata}
                setMetadata={setMetadata}
                points={points}
                setPoints={setPoints}
                imageElement={imageElement}
                hasData={!!imageElement}
                error={error}
                autoLoadedFilename={autoLoadedFilename}
                csvFile={csvFile}
                setCsvFile={handleManualFileSelect}
                isValidationMode={isValidationMode}
                onStartValidation={handleStartValidation}
                pendingCapturesCount={pendingCapturesCount}
                onReviewCaptures={handleReviewCaptures}
                imageLoading={imageLoading}
                isFetchingSamples={isFetchingSamples}
            />
            <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
                {(imageLoading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-40">
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span className="text-white text-lg">Chargement de l’image...</span>
                        </div>
                    </div>
                )}
                {imageElement ? (
                    <CanvasComponent
                        image={imageElement}
                        points={points}
                        setPoints={setPoints}
                        dates={dates}
                        setDates={() => { }}
                        uniqueDates={uniqueDates}
                        selectedDate={selectedDate}
                        displayMode={displayMode}
                        metadata={metadata}
                        setMetadata={setMetadata}
                        addPoint={() => { }}
                        addingPoint={false}
                        setAddingPoint={() => { }}
                        tempPoint={null}
                        setTempPoint={() => { }}
                        cancelAddingPoint={() => { }}
                        savePoint={() => { }}
                        currentPointIndex={currentValidationPoint?.originalIndex!}
                    />
                ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-lg bg-white">
                        <h2 className="text-2xl font-semibold text-gray-700">CQ ISO</h2>
                        <p className="mt-2 text-gray-500">Please upload a CSV file to begin the validation process.</p>
                    </div>
                )}
                {isValidationMode && currentValidationPoint && (
                    <ValidationControls
                        currentPointIndex={currentPointIndexInSample}
                        totalPoints={sampledPoints.length}
                        pointData={currentValidationPoint}
                        onValidate={handleValidateCurrentPoint}
                        onError={handleErrorCurrentPoint}
                        onNext={handleNextPoint}
                        onPrevious={handlePreviousPoint}
                        onFinish={handleFinishValidation}
                        validationStats={validationStats}
                        onExit={handleExitValidation}
                        isUpdating={isUpdating}
                    />
                )}
            </main>
            {isConfirmationModalVisible && (
                <ConfirmationModal
                    points={points}
                    onConfirm={handleConfirmExport}
                    onClose={() => setConfirmationModalVisible(false)}
                    validationStats={validationStats}
                    totalPoints={sampledPoints.length}
                    onReject={handleRejectToRepriseCQ}
                    isLoading={processLoading}
                />
            )}
            {isCaptureReviewModalOpen && (
                <CaptureReviewModal
                    isOpen={isCaptureReviewModalOpen}
                    onClose={() => setCaptureReviewModalOpen(false)}
                    captures={capturesToReview}
                    onUpdateCaptureStatus={handleUpdateCaptureStatus}
                    onFinalize={handleFinalizeReview}
                />
            )}
        </div>
    );
};

export default CQ_ISO;