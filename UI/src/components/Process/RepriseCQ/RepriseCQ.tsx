import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ChartModal from './components/ChartModal';
import DurationModal from './components/DurationModal';
import CaptureModal from './components/CaptureModal';
import CaptureDetailsModal from './components/CaptureDetailsModal';
import PreviewCanvasComponent from '../CQ/components/PreviewCanvasComponent';
import { DateInfo, DisplayMode, Metadata, Point, ReperePoint, Capture, CaptureReviewItem } from '../../../types/Image';
import CQService from '../../../services/CQService';
import GpaoService from '../../../services/GpaoService';
import { useAppContext } from "../../../context/AppContext";
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import ToastNotification, { ToastType } from '../../../utils/components/ToastNotification';
import { generatePreviewData, InterpolatedRow } from '../../../services/InterpolationService';

const RepriseCQ: React.FC = () => {
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
    const isAutoLoading = useRef(false);

    const { setCollapsed } = useAppContext();
    const { currentLot, paths, loading: processLoading } = useSelector((state: RootState) => state.process);
    const { user } = useSelector((state: RootState) => state.auth);
    const processedLotId = useRef<number | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    const [isSettingOrigin, setIsSettingOrigin] = useState(false);

    // Unified capture state for both existing and new captures
    const [allCaptures, setAllCaptures] = useState<Capture[]>([]);

    // State for modals and capture flow
    const [isCaptureMode, setIsCaptureMode] = useState(false);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [isCaptureDetailsModalOpen, setIsCaptureDetailsModalOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [nextCaptureInfo, setNextCaptureInfo] = useState<{ baseName: string; correspondante: string; } | null>(null);
    const [isExportingCaptures, setIsExportingCaptures] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isDurationModalOpen, setDurationModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Preview Mode State
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<InterpolatedRow[] | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPreviewDurationModalOpen, setPreviewDurationModalOpen] = useState(false);

    const resetState = useCallback(() => {
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
        setIsSettingOrigin(false);
        setAllCaptures([]);
        setIsCaptureMode(false);
        setPreviewData(null);
        setIsPreviewMode(false);
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

        try {
            const response = await CQService.getCapturesForReview(idLot);
            if (response && response.images && Array.isArray(response.images)) {
                 const existingCaptures: Capture[] = response.images.map((c: CaptureReviewItem) => ({
                    id: c.id,
                    imageData: c.imageData,
                    type: c.type,
                    nature: c.nature,
                    filename: c.filename,
                    isNew: false, // Mark as existing
                    isArchived: false, // Will be updated on action
                    status: c.status,
                    rejectionReason: c.rejectionReason,
                    imageCorrespondante: c.imageCorrespondante,
                }));
                setAllCaptures(existingCaptures);
            } else {
                setAllCaptures([]);
            }
        } catch (captureError) {
            console.error("Failed to fetch captures for review:", captureError);
            setError("Impossible de charger les captures associées.");
            setAllCaptures([]);
        }

        const parseCoords = (coord: any): ReperePoint => {
            if (Array.isArray(coord) && coord.length === 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number') {
                return coord as ReperePoint;
            }
            const match = String(coord).match(/\(?\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*\)?/);
            if (!match) return [0, 0];
            return [parseFloat(match[1]!), parseFloat(match[2]!)];
        };

        const sanitizedMetadata: Metadata = {
            ...metadata,
            origin_px: parseCoords(metadata.origin_px),
            x_max_px: parseCoords(metadata.x_max_px),
            y_max_px: parseCoords(metadata.y_max_px),
        };

        setMetadata(sanitizedMetadata);
        setOriginalMetadata(JSON.parse(JSON.stringify(sanitizedMetadata)));

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
            const imagePoints = points.map(([x, y]: [number, number]) => ({
                x,
                y,
                logicalX: 0,
                logicalY: 0,
            }));

            setPoints(imagePoints);
            setOriginalPoints(JSON.parse(JSON.stringify(imagePoints)));
            setDates(dates);
            setOriginalDates(JSON.parse(JSON.stringify(dates)));
            const uniqueDatesArray = Array.from(new Set<string>(dates));
            setUniqueDates(
                uniqueDatesArray.map((d, index): DateInfo => ({
                    date: d,
                    color: baseColors[index % baseColors.length]!,
                }))
            );

            setImageLoading(false);
            endInterFileAndStartProdLdt();
        };
        img.onerror = () => {
            setError("Erreur lors du chargement de l’image.");
            setImageLoading(false);
            endInterFileAndStartProdLdt();
        };
        img.src = `data:image/png;base64,${image}`;
    }, [setCollapsed, user, currentLot]);

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

        if (!currentLot || !currentLot?.paths || !currentLot?.lotCQ) {
            setError("Les informations du lot sont incomplètes pour charger les données.");
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
            resetState();
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
                    console.error(err);
                    setError(`Erreur lors du chargement automatique: ${errorMessage}`);
                    isAutoLoading.current = false;
                }
            };

            autoLoadAndProcess(currentLot?.paths.IN_CQ_ISO);
        }

        if (!currentLot) {
            resetState();
            processedLotId.current = null;
        }
    }, [currentLot, paths, resetState]);

    useEffect(() => {
        if (csvFile && isAutoLoading.current) {
            handleFileChange(csvFile);
        }
    }, [csvFile, handleFileChange]);

    const getReindexedCaptures = (currentCaptures: Capture[]): Capture[] => {
        const archivedCaptures = currentCaptures.filter(c => c.isArchived);
        const activeCaptures = currentCaptures.filter(c => !c.isArchived);

        const reindexGroup = (captures: Capture[], type: 'Metadonnée contextuelle' | 'Anomalie', suffix: 'MC' | 'AN') => {
            const group = captures.filter(c => c.type === type);
            
            // Sort by original index parsed from filename to maintain a stable order.
            // New captures without a filename will be sorted to the end.
            group.sort((a, b) => {
                const indexA = parseInt(a.filename.match(/_(?:MC|AN)_(\d{3})\.jpg$/)?.[1] || '999', 10);
                const indexB = parseInt(b.filename.match(/_(?:MC|AN)_(\d{3})\.jpg$/)?.[1] || '999', 10);
                return indexA - indexB;
            });
    
            const baseName = currentLot?.libelle.replace(/\.tif$/, '') || '';

            return group.map((capture, i) => {
                const newIndex = i + 1;
                const newFilename = `${baseName}_${suffix}_${newIndex.toString().padStart(3, '0')}.jpg`;
                return { ...capture, filename: newFilename };
            });
        };
    
        const reindexedMC = reindexGroup(activeCaptures, 'Metadonnée contextuelle', 'MC');
        const reindexedAN = reindexGroup(activeCaptures, 'Anomalie', 'AN');
    
        return [...archivedCaptures, ...reindexedMC, ...reindexedAN];
    };

    const handleReset = useCallback(() => {
        setPoints(JSON.parse(JSON.stringify(originalPoints)));
        setDates(JSON.parse(JSON.stringify(originalDates)));
        setMetadata(JSON.parse(JSON.stringify(originalMetadata)));
    }, [originalPoints, originalDates, originalMetadata]);

    const handleOpenExportModal = () => {
        if (!metadata || points.length === 0) {
            setToast({ message: `No data to export.`, type: 'error' });
            return;
        }
        setDurationModalOpen(true);
    };

    const handleConfirmExport = async (durationMinutes: number) => {
        setDurationModalOpen(false);
        if (!metadata || points.length === 0 || !currentLot || !currentLot?.paths) {
            setToast({ message: `Données de lot manquantes pour l'export.`, type: 'error' });
            return;
        }
        setIsExporting(true);
        try {
            const response = await CQService.savePointsReprise(currentLot?.lotCQ.idLot, points, dates, metadata, durationMinutes, currentLot?.paths.OUT_CQ);
            if (response.status === "success") {
                setToast({ message: `Fichier exporté avec succès !!`, type: 'success' });
            } else {
                setToast({ message: `Erreur lors de l’export CSV: ${response.message || 'Erreur inconnue'}`, type: 'error' });
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Erreur lors de l’export CSV";
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleEnterPreviewMode = () => {
        if (!metadata || points.length === 0) {
            setToast({ message: "Aucune donnée à prévisualiser.", type: 'info' });
            return;
        }
        setPreviewDurationModalOpen(true);
    };
    
    const handleConfirmPreview = (durationMinutes: number) => {
        setPreviewDurationModalOpen(false);
        if (!metadata) return;
        
        setIsPreviewLoading(true);

        setTimeout(() => {
            try {
                const data = generatePreviewData(points, dates, durationMinutes, metadata);
                setPreviewData(data);
                setIsPreviewMode(true);
            } catch(e) {
                const err = e as Error;
                setToast({ message: `Erreur de prévisualisation: ${err.message}`, type: 'error' });
            } finally {
                setIsPreviewLoading(false);
            }
        }, 10);
    };

    const handleExitPreviewMode = () => {
        setIsPreviewMode(false);
        setPreviewData(null);
    };

    const addPoint = useCallback((point: { x: number; y: number }) => {
        if (selectedDate) {
            const newPoint: Point = { ...point, logicalX: 0, logicalY: 0 };
            setPoints(prev => [...prev, newPoint]);
            setDates(prev => [...prev, selectedDate]);
        }
    }, [selectedDate]);

    const [addingPoint, setAddingPoint] = useState(false);
    const [tempPoint, setTempPoint] = useState<{ x: number; y: number } | null>(null);

    const startAddingPoint = () => {
        if (!selectedDate) {
            setToast({ message: "Veuillez sélectionner une date avant d'ajouter un repère.", type: 'info' });
            return;
        }
        setAddingPoint(true);
        setTempPoint(null);
    };

    const cancelAddingPoint = () => {
        setAddingPoint(false);
        setTempPoint(null);
    };

    const savePoint = (point: { x: number; y: number }) => {
        if (!selectedDate) return;
        const newPoint: Point = { ...point, logicalX: 0, logicalY: 0 };
        setPoints(prev => [...prev, newPoint]);
        setDates(prev => [...prev, selectedDate]);
        setAddingPoint(false);
        setTempPoint(null);
    };

    const startSettingOrigin = () => {
        setIsSettingOrigin(true);
    };

    const saveNewOrigin = (newRepere: { origin: Point; xAxis: Point; yAxis: Point }) => {
        if (!originalMetadata || !originalPoints || !metadata) return;

        const O_old = originalMetadata.origin_px;
        const X_max_old = originalMetadata.x_max_px;
        const Y_max_old = originalMetadata.y_max_px;

        const VX_old = [X_max_old[0] - O_old[0], X_max_old[1] - O_old[1]];
        const VY_old = [Y_max_old[0] - O_old[0], Y_max_old[1] - O_old[1]];

        const O_new = [newRepere.origin.x, newRepere.origin.y];
        const X_max_new = [newRepere.xAxis.x, newRepere.xAxis.y];
        const Y_max_new = [newRepere.yAxis.x, newRepere.yAxis.y];

        const VX_new = [X_max_new[0]! - O_new[0]!, X_max_new[1]! - O_new[1]!];
        const VY_new = [Y_max_new[0]! - O_new[0]!, Y_max_new[1]! - O_new[1]!];

        const det_old = VX_old[0]! * VY_old[1]! - VY_old[0]! * VX_old[1]!;
        if (Math.abs(det_old) < 1e-6) {
            setError("L'ancien repère n'est pas valide.");
            setIsSettingOrigin(false);
            return;
        }

        const newPoints = originalPoints.map(p_orig => {
            const p_vec = [p_orig.x - O_old[0], p_orig.y - O_old[1]];
            const u = (p_vec[0]! * VY_old[1]! - p_vec[1]! * VY_old[0]!) / det_old;
            const v = (p_vec[1]! * VX_old[0]! - p_vec[0]! * VX_old[1]!) / det_old;
            const newX = O_new[0]! + u * VX_new[0]! + v * VY_new[0]!;
            const newY = O_new[1]! + u * VX_new[1]! + v * VY_new[1]!;
            return { ...p_orig, x: newX, y: newY };
        });

        setPoints(newPoints);

        const newMetadata: Metadata = JSON.parse(JSON.stringify(metadata));
        newMetadata.origin_px = [newRepere.origin.x, newRepere.origin.y];
        newMetadata.x_max_px = [newRepere.xAxis.x, newRepere.xAxis.y];
        newMetadata.y_max_px = [newRepere.yAxis.x, newRepere.yAxis.y];
        setMetadata(newMetadata);

        setIsSettingOrigin(false);
    };

    // --- Capture Handlers ---
    const handleStartCapture = () => setIsCaptureMode(true);
    const handleCaptureCancel = () => setIsCaptureMode(false);

    const handleCaptureComplete = (dataUrl: string) => {
        setIsCaptureMode(false);
        if (!metadata || !currentLot) {
            setError("Métadonnées ou informations sur le lot manquantes.");
            return;
        }
        const correspondante = currentLot?.libelle;
        const baseName = correspondante.replace(/\.tif$/, '');
        setNextCaptureInfo({ baseName, correspondante });
        setCapturedImage(dataUrl);
        setIsCaptureModalOpen(true);
    };
    
    const handleSaveCapture = (type: string, nature: string) => {
        if (!capturedImage || !nextCaptureInfo) return;
        
        const newCapture: Capture = {
            imageData: capturedImage, type, nature, filename: '', // Filename is temporary, will be set by re-indexing
            isNew: true, isArchived: false, imageCorrespondante: nextCaptureInfo.correspondante,
        };

        setAllCaptures(prev => getReindexedCaptures([...prev, newCapture]));

        setIsCaptureModalOpen(false);
        setCapturedImage(null);
        setNextCaptureInfo(null);
    };
    
    const handleDeleteCapture = (indexToDelete: number) => {
        const captureToDelete = allCaptures[indexToDelete];
        if (!captureToDelete?.isNew) {
            setToast({ message: "Seules les nouvelles captures peuvent être supprimées.", type: 'error' });
            return;
        }
        setAllCaptures(prevCaptures => {
            const remaining = prevCaptures.filter((_, i) => i !== indexToDelete);
            return getReindexedCaptures(remaining);
        });
    };

    const handleExportCaptures = async () => {
        const capturesToExport = allCaptures.filter(c => !c.isArchived);
        if (capturesToExport.length === 0) {
            setToast({ message: "Aucune capture active à exporter.", type: 'info' });
            return;
        }
        if (!currentLot || !paths?.out) {
            setToast({ message: "Chemin de sortie ou informations du lot manquantes.", type: 'error' });
            return;
        }
    
        setIsExportingCaptures(true);
        const mainImageName = currentLot?.libelle;
    
        let csvContent = "image correspondante;nom de l'image;type;nature\n";
        capturesToExport.forEach(c => {
            csvContent += `${mainImageName};${c.filename};"${c.type}";"${c.nature}"\n`;
        });
    
        try {
            const response = await CQService.saveCaptures(csvContent, capturesToExport, paths.out, currentLot?.lotCQ.idLot, mainImageName);
            setToast({ message: `Captures exportées: ${response.message}`, type: 'success' });
            // After successful export, all exported captures are no longer "new"
            setAllCaptures(prev => prev.filter(c => !c.isArchived).map(c => ({ ...c, isNew: false })));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setToast({ message: `Erreur d'export: ${errorMessage}`, type: 'error' });
        } finally {
            setIsExportingCaptures(false);
        }
    };

    const handleArchiveCapture = async (captureId: number) => {
        if (!currentLot || !currentLot?.lotCQ) {
            setToast({ message: "Impossible d'archiver: informations sur le lot manquantes.", type: 'error' });
            return;
        }
        try {
            await CQService.archiveCapture(currentLot?.lotCQ.idLot, captureId);
            setAllCaptures(prevCaptures => {
                const updated = prevCaptures.map(c => 
                    c.id === captureId ? { ...c, isArchived: true } : c
                );
                return getReindexedCaptures(updated);
            });
            setToast({ message: "Capture archivée avec succès.", type: 'success' });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Erreur lors de l'archivage";
            setToast({ message: errorMessage, type: 'error' });
        }
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
                onExport={handleOpenExportModal}
                onReset={handleReset}
                onShowChart={() => setChartVisible(true)}
                hasData={!!imageElement}
                error={error}
                onStartAddingPoint={startAddingPoint}
                onStartSettingOrigin={startSettingOrigin}
                autoLoadedFilename={autoLoadedFilename}
                csvFile={csvFile}
                setCsvFile={handleManualFileSelect}
                onViewCaptures={() => setIsCaptureDetailsModalOpen(true)}
                captureCount={allCaptures.filter(c => !c.isArchived).length}
                onStartCapture={handleStartCapture}
                onExportCaptures={handleExportCaptures}
                isExportingCaptures={isExportingCaptures}
                isExporting={isExporting}
                onPreview={handleEnterPreviewMode}
                isPreviewMode={isPreviewMode}
                onExitPreviewMode={handleExitPreviewMode}
                isPreviewLoading={isPreviewLoading}
            />
            <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
                {(imageLoading || isPreviewLoading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-40">
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span className="text-white text-lg">{imageLoading ? 'Chargement de l’image...' : "Calcul de l'interpolation en cours..."}</span>
                        </div>
                    </div>
                )}
                {isPreviewMode && previewData && imageElement && metadata ? (
                    <PreviewCanvasComponent
                        image={imageElement}
                        metadata={metadata}
                        previewData={previewData}
                        uniqueDates={uniqueDates}
                        selectedDate={selectedDate}
                        onExit={handleExitPreviewMode}
                        displayMode={displayMode}
                    />
                ) : imageElement ? (
                    <CanvasComponent
                        image={imageElement}
                        points={points}
                        setPoints={setPoints}
                        dates={dates}
                        setDates={setDates}
                        uniqueDates={uniqueDates}
                        selectedDate={selectedDate}
                        displayMode={displayMode}
                        metadata={metadata}
                        setMetadata={() => {}}
                        addPoint={addPoint}
                        addingPoint={addingPoint}
                        setAddingPoint={setAddingPoint}
                        setTempPoint={setTempPoint}
                        tempPoint={tempPoint}
                        cancelAddingPoint={cancelAddingPoint}
                        savePoint={savePoint}
                        isSettingOrigin={isSettingOrigin}
                        setIsSettingOrigin={setIsSettingOrigin}
                        saveNewOrigin={saveNewOrigin}
                        isCaptureMode={isCaptureMode}
                        onCapture={handleCaptureComplete}
                        onCancelCapture={handleCaptureCancel}
                    />
                ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-lg bg-white">
                        <h2 className="text-2xl font-semibold text-gray-700">Bienvenue Chez Reprise CQ</h2>
                        <p className="mt-2 text-gray-500">Veuillez télécharger un fichier CSV pour commencer la correction.</p>
                    </div>
                )}
            </main>
            {isChartVisible && imageElement && (
                <ChartModal
                    points={points}
                    dates={dates}
                    uniqueDates={uniqueDates}
                    onClose={() => setChartVisible(false)}
                />
            )}
            {isCaptureModalOpen && capturedImage && nextCaptureInfo && (
                <CaptureModal
                    isOpen={isCaptureModalOpen}
                    onClose={() => setIsCaptureModalOpen(false)}
                    onSave={handleSaveCapture}
                    imageData={capturedImage}
                    imageCorrespondante={nextCaptureInfo.correspondante}
                    baseFilename={nextCaptureInfo.baseName}
                    captures={allCaptures}
                />
            )}
            {isCaptureDetailsModalOpen && (
                <CaptureDetailsModal
                    isOpen={isCaptureDetailsModalOpen}
                    onClose={() => setIsCaptureDetailsModalOpen(false)}
                    captures={allCaptures}
                    onDeleteCapture={handleDeleteCapture}
                    onArchiveCapture={handleArchiveCapture}
                />
            )}
            <DurationModal
                isOpen={isDurationModalOpen}
                onClose={() => setDurationModalOpen(false)}
                onConfirm={handleConfirmExport}
            />
            <DurationModal
                isOpen={isPreviewDurationModalOpen}
                onClose={() => setPreviewDurationModalOpen(false)}
                onConfirm={handleConfirmPreview}
            />
        </div>
    );
};

export default RepriseCQ;