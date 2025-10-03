import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ConfirmationModal from './components/ConfirmationModal';
import ValidationControls from './components/ValidationControls';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../types/Image';
import { parseCsvFile, getFileFromPath, savePoints } from '../../../services/CQService';
import { useAppContext } from "../../../context/AppContext";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { getSampledPoints } from '../../../services/SamplingService';
import { rejectToCQ } from '../../../store/slices/processSlice';
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

    const { setCollapsed } = useAppContext();
    const dispatch: AppDispatch = useDispatch();
    const { currentLot, paths, loading: processLoading } = useSelector((state: RootState) => state.process);
    const processedLotId = useRef<number | null>(null);
    const isAutoLoading = useRef(false);

    // --- State Reset and Data Processing ---
    const resetState = useCallback((fullReset = true) => {
        setIsValidationMode(false);
        setSampledPoints([]);
        setCurrentPointIndexInSample(0);
        setConfirmationModalVisible(false);
        setValidationStats({ valid: 0, error: 0, pending: 0 });

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

    const processParsedData = useCallback((data: { metadata: Metadata; points: [number, number][]; dates: string[]; image: string }) => {
        const { metadata, points, dates, image } = data;
        setMetadata(metadata);
        setOriginalMetadata(JSON.parse(JSON.stringify(metadata)));
        setCollapsed(true);

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
        };
        img.onerror = () => {
            setError("Erreur lors du chargement de l’image.");
            setImageLoading(false);
        };
        img.src = `data:image/png;base64,${image}`;
    }, [setCollapsed]);

    // --- File Handling and Auto-loading ---
    const handleFileChange = useCallback(async (file: File) => {
        setError(null);
        setImageLoading(true);
        if (!currentLot || !currentLot.paths) {
            setError("Les chemins pour le lot courant ne sont pas définis.");
            setImageLoading(false);
            return;
        }
        try {
            const data = await parseCsvFile(file, currentLot.paths.IMAGE_PATH);
            processParsedData(data);
        } catch (err) {
            console.error(err);
            setError("Impossible de parser le fichier CSV.");
            setImageLoading(false);
        } finally {
            isAutoLoading.current = false;
        }
    }, [processParsedData, currentLot]);

    const handleManualFileSelect = (file: File | null) => {
        setAutoLoadedFilename(null);
        isAutoLoading.current = false;
        setCsvFile(file);
    };

    useEffect(() => {
        if (currentLot && paths && currentLot.idLot !== processedLotId.current) {
            resetState(true);
            processedLotId.current = currentLot.idLot;
            isAutoLoading.current = true;
            const autoLoadAndProcess = async (path: string) => {
                setError(null);
                try {
                    const { name, content } = await getFileFromPath(path);
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
        setConfirmationModalVisible(false);
        if (!metadata || points.length === 0 || !currentLot) {
            alert("Données manquants pour l'export.");
            return;
        }
        try {
            // const response = await savePoints(points, dates, metadata, 5, currentLot.paths.OUT_CQ_ISO); // Duration is 5 mins for now
            console.log("metadata for export ==> ", metadata);
            console.log("points for export ==> ", points);
            console.log("currentLot.paths.OUT_CQ_ISO for export ==> ", currentLot.paths.OUT_CQ_ISO);
            const response = await savePoints(points, dates, metadata, 5, currentLot.paths.OUT_CQ_ISO);
            const result = await response.json();
            if (result.status === "success") {
                alert(`Fichier exporté avec succès : ${result.file_path}`);
                setIsValidationMode(false); // Reset validation mode
            } else {
                alert(`Erreur lors de l’export: ${result.message || 'Erreur inconnue'}`);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            alert(`Erreur lors de l’export CSV: ${errorMessage}`);
        }
    };

    // --- Validation Logic ---
    const handleStartValidation = () => {
        const sample = getSampledPoints(points, dates);
        if (sample.length === 0) {
            alert("Aucun point à valider.");
            return;
        }
        setSampledPoints(sample);
        setCurrentPointIndexInSample(0);
        setIsValidationMode(true);
        setValidationStats({ valid: 0, error: 0, pending: sample.length });
    };

    const handleFinishValidation = () => {
        setConfirmationModalVisible(true);
    };

    const updatePointStatus = useCallback((status: 'valid' | 'error') => {
        const currentSampledPoint = sampledPoints[currentPointIndexInSample];
        if (!currentSampledPoint) return;

        // Update main points array
        const updatedPoints = [...points];
        const pointToUpdate = updatedPoints[currentSampledPoint.originalIndex];
        if (pointToUpdate) {
            // Update stats only if status changes
            if (pointToUpdate.validationStatus !== status) {
                setValidationStats(prevStats => {
                    const newStats = { ...prevStats };
                    if (pointToUpdate.validationStatus === 'valid') newStats.valid--;
                    if (pointToUpdate.validationStatus === 'error') newStats.error--;
                    if (pointToUpdate.validationStatus === 'pending') newStats.pending--;

                    if (status === 'valid') newStats.valid++;
                    if (status === 'error') newStats.error++;

                    return newStats;
                });
            }
            pointToUpdate.validationStatus = status;
            setPoints(updatedPoints);
        }

        // Move to next point
        if (currentPointIndexInSample < sampledPoints.length - 1) {
            setCurrentPointIndexInSample(prev => prev + 1);
        }
    }, [currentPointIndexInSample, sampledPoints, points]);

    const handleValidateCurrentPoint = useCallback(() => updatePointStatus('valid'), [updatePointStatus]);
    const handleErrorCurrentPoint = useCallback(() => updatePointStatus('error'), [updatePointStatus]);

    const handleNextPoint = () => {
        if (currentPointIndexInSample < sampledPoints.length - 1) {
            setCurrentPointIndexInSample(prev => prev + 1);
        }
    };

    const handlePreviousPoint = () => {
        if (currentPointIndexInSample > 0) {
            setCurrentPointIndexInSample(prev => prev - 1);
        }
    };


    // Keyboard shortcuts effect
    useEffect(() => {
        if (!isValidationMode) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === 'v') {
                handleValidateCurrentPoint();
            } else if (key === 'e') {
                handleErrorCurrentPoint();
            } else if (key === 'arrowright') {
                handleNextPoint();
            } else if (key === 'arrowleft') {
                handlePreviousPoint();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isValidationMode, handleValidateCurrentPoint, handleErrorCurrentPoint, handleNextPoint, handlePreviousPoint]);

    const handleExitValidation = () => {
        // Reset validation status on all points
        setPoints(prev => prev.map(p => ({ ...p, validationStatus: 'pending' })));
        setIsValidationMode(false);
        setCurrentPointIndexInSample(0);
    };

    const currentValidationPoint = isValidationMode ? sampledPoints[currentPointIndexInSample] : null;

    // const handleRejectToCQ = () => {
    //     dispatch(rejectToCQ());
    // };


    const handleRejectToCQ = () => {
        dispatch(rejectToCQ()).then((result) => {
            if (rejectToCQ.fulfilled.match(result)) {
                setToast({ message: "Lot rejeté et renvoyé en CQ Cible avec succès.", type: 'success' });
            } else {
                const errorMessage = typeof result.payload === 'string' ? result.payload : "Échec du rejet du lot.";
                setToast({ message: errorMessage, type: 'error' });
            }
            setConfirmationModalVisible(false);
        });
    };

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
            />
            <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
                {(processLoading || imageLoading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-40">
                        {/* Loading Spinner */}
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
                        <h2 className="text-2xl font-semibold text-gray-700">Welcome to CQ ISO</h2>
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
                    onReject={handleRejectToCQ}
                />
            )}
        </div>
    );
};

export default CQ_ISO;