import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ChartModal from './components/ChartModal';
import CaptureModal from './components/CaptureModal';
import CaptureDetailsModal from './components/CaptureDetailsModal';
import DurationModal from './components/DurationModal';
import PreviewCanvasComponent from './components/PreviewCanvasComponent';
import { DateInfo, DisplayMode, Metadata, Point, ReperePoint, Capture } from '../../../types/Image';
import CQService from '../../../services/CQService';
import GpaoService from '../../../services/GpaoService';
import { useAppContext } from "../../../context/AppContext";
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import ToastNotification, { ToastType } from '../../../utils/components/ToastNotification';
import { generatePreviewData, InterpolatedRow, linearInterpolate, logicalToPixel, pixelToLogical } from '../../../services/InterpolationService';

const SAISIE: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const [originalPoints, setOriginalPoints] = useState<Point[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [originalDates, setOriginalDates] = useState<string[]>([]);
    const [uniqueDates, setUniqueDates] = useState<DateInfo[]>([]);
    const [selectedPointIndices, setSelectedPointIndices] = useState<number[]>([]);

    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [originalMetadata, setOriginalMetadata] = useState<Metadata | null>(null);

    const [imageData, setImageData] = useState<string | null>(null);
    const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('points');

    const [error, setError] = useState<string | null>(null);
    const [isChartVisible, setChartVisible] = useState(false);
    const [autoLoadedFilename, setAutoLoadedFilename] = useState<string | null>(null);

    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const isAutoLoading = useRef(false);

    const { setCollapsed } = useAppContext();
    const { currentLot, paths, loading: processLoading } = useSelector((state: RootState) => state.process);
    const { user } = useSelector((state: RootState) => state.auth);
    const processedLotId = useRef<number | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    const [isSettingOrigin, setIsSettingOrigin] = useState(false);

    // Date management state
    const [saisieDate, setSaisieDate] = useState<Date | null>(null);

    // Screen Capture State
    const [isCaptureMode, setIsCaptureMode] = useState(false);
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [isCaptureDetailsModalOpen, setIsCaptureDetailsModalOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [nextCaptureInfo, setNextCaptureInfo] = useState<{ baseName: string; correspondante: string; } | null>(null);
    const [isExportingCaptures, setIsExportingCaptures] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Modal states
    const [isDurationModalOpen, setDurationModalOpen] = useState(false);
    const [isPreviewDurationModalOpen, setPreviewDurationModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Preview Mode State
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<InterpolatedRow[] | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // Interpolation loading state
    const [isInterpolating, setIsInterpolating] = useState(false);
    const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);

    const handleSaisieDateChange = (dateString: string) => {
        if (dateString) {
            const [year, month, day] = dateString.split('-').map(Number);
            setSaisieDate(new Date(Date.UTC(year, month - 1, day)));
        } else {
            setSaisieDate(null);
        }
    };

    const handleNextDate = () => {
        if (saisieDate) {
            const nextDay = new Date(saisieDate);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            setSaisieDate(nextDay);
        }
    };

    const handleStopSaisie = () => {
        setSaisieDate(null);
        setSelectedDate(null); // Also deselect the current date
    };

    useEffect(() => {
        if (saisieDate) {
            const dateString = saisieDate.toISOString().split('T')[0];
            setSelectedDate(dateString);

            setUniqueDates(prev => {
                if (prev.some(d => d.date === dateString)) {
                    return prev;
                }
                const baseColors = [
                    "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
                    "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
                    "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
                    "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
                ];
                const newColor = baseColors[prev.length % baseColors.length]!;
                const newDates = [...prev, { date: dateString, color: newColor }];
                return newDates.sort((a, b) => a.date.localeCompare(b.date));
            });
        } else {
            setSelectedDate(null);
        }
    }, [saisieDate]);


    const handleInterpolationTrigger = useCallback(() => {
        if (!selectedDate || !metadata) {
            setToast({ message: "Veuillez sélectionner une date et définir un repère.", type: 'info' });
            return;
        }

        const pointsForDateIndices = dates.reduce((acc, date, i) => {
            if (date === selectedDate) {
                acc.push(i);
            }
            return acc;
        }, [] as number[]);

        if (pointsForDateIndices.length < 2) {
            setToast({ message: "Il faut au moins deux points pour la date sélectionnée pour utiliser l'auto-traçage.", type: 'info' });
            return;
        }

        setIsInterpolating(true);

        setTimeout(() => {
            try {
                const pointsForDate = pointsForDateIndices.map(i => points[i]!);

                const logicalPoints = pointsForDate.map(p => {
                    const [logical_x, logical_y] = pixelToLogical(p.x, p.y, metadata);
                    return { logical_x, logical_y };
                }).filter(p => !isNaN(p.logical_x) && !isNaN(p.logical_y))
                    .sort((a, b) => a.logical_x - b.logical_x);

                if (logicalPoints.length < 2) {
                    setToast({ message: "Erreur de conversion des coordonnées. Vérifiez le repère.", type: 'error' });
                    setIsInterpolating(false);
                    return;
                }

                const x_known = logicalPoints.map(p => p.logical_x);
                const y_known = logicalPoints.map(p => p.logical_y);

                const min_x = x_known[0]!;
                const max_x = x_known[x_known.length - 1]!;

                const intervalMinutes = 5;
                const intervalHours = intervalMinutes / 60;

                const newLogicalPoints: { x: number; y: number }[] = [];

                for (let current_x = min_x; current_x <= max_x; current_x += intervalHours) {
                    const interpolated_y = linearInterpolate(x_known, y_known, current_x);
                    if (!isNaN(interpolated_y)) {
                        newLogicalPoints.push({ x: current_x, y: interpolated_y });
                    }
                }

                const lastGeneratedX = newLogicalPoints.length > 0 ? newLogicalPoints[newLogicalPoints.length - 1]!.x : -1;
                if (Math.abs(max_x - lastGeneratedX) > 1e-6) {
                    const interpolated_y = linearInterpolate(x_known, y_known, max_x);
                    if (!isNaN(interpolated_y)) {
                        newLogicalPoints.push({ x: max_x, y: interpolated_y });
                    }
                }

                const newPixelPoints = newLogicalPoints.map(p => {
                    const [px, py] = logicalToPixel(p.x, p.y, metadata);
                    return { x: px, y: py, logicalX: 0, logicalY: 0 };
                }).filter(p => !isNaN(p.x) && !isNaN(p.y));


                if (newPixelPoints.length === 0) {
                    setToast({ message: "Aucun point n'a pu être généré.", type: 'error' });
                    return;
                }

                const indicesToRemove = new Set(pointsForDateIndices);
                const remainingPoints = points.filter((_, i) => !indicesToRemove.has(i));
                const remainingDates = dates.filter((_, i) => !indicesToRemove.has(i));

                const newDates = Array(newPixelPoints.length).fill(selectedDate);

                setPoints([...remainingPoints, ...newPixelPoints]);
                setDates([...remainingDates, ...newDates]);

                setToast({ message: `${newPixelPoints.length} points tracés avec succès !`, type: 'success' });
            } finally {
                setIsInterpolating(false);
            }
        }, 10);
    }, [points, dates, selectedDate, metadata, setPoints, setDates, setToast]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                handleInterpolationTrigger();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleInterpolationTrigger]);

    const resetState = useCallback(() => {
        setPoints([]);
        setOriginalPoints([]);
        setDates([]);
        setOriginalDates([]);
        setUniqueDates([]);
        setMetadata(null);
        setOriginalMetadata(null);
        setImageData(null);
        setImageElement(null);
        setSelectedDate(null);
        setDisplayMode('points');
        setError(null);
        setAutoLoadedFilename(null);
        setCsvFile(null);
        setImageFile(null);
        isAutoLoading.current = false;
        setIsSettingOrigin(false);
        setCaptures([]);
        setIsCaptureModalOpen(false);
        setIsCaptureDetailsModalOpen(false);
        setCapturedImage(null);
        setIsCaptureMode(false);
        setPreviewData(null);
        setIsPreviewMode(false);
        setSelectedPointIndices([]);
        setSaisieDate(null);
    }, []);

    const handleImageChange = useCallback((file: File) => {
        setImageFile(file);
        setError(null);
        setImageLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setImageElement(img);
                setImageData(e.target?.result as string);
                setImageLoading(false);

                if (!csvFile) {
                    setPoints([]);
                    setOriginalPoints([]);
                    setDates([]);
                    setOriginalDates([]);
                    setUniqueDates([]);
                    setMetadata(null);
                    setOriginalMetadata(null);
                    setSaisieDate(null);

                    const defaultMetadata: Metadata = {
                        Img_path: file.name,
                        origin_px: [img.width * 0.1, img.height * 0.9],
                        origin_value: [0, 0],
                        x_max_px: [img.width * 0.9, img.height * 0.9],
                        x_max_value: 24,
                        y_max_px: [img.width * 0.1, img.height * 0.1],
                        y_max_value: 5,
                    };
                    setMetadata(defaultMetadata);
                    setOriginalMetadata(JSON.parse(JSON.stringify(defaultMetadata)));
                }

                setCollapsed(true);
            };
            img.onerror = () => {
                setError("Erreur lors du chargement de l'image sélectionnée.");
                setImageLoading(false);
            };
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            setError("Erreur lors de la lecture du fichier image.");
            setImageLoading(false);
        };
        reader.readAsDataURL(file);
    }, [setCollapsed, csvFile]);

    const handleManualFileSelect = (file: File | null) => {
        setAutoLoadedFilename(null);
        isAutoLoading.current = false;
        setCsvFile(file);
    };

    const handleFileChange = useCallback(async (file: File) => {
        setError(null);

        if (currentLot && user) {
            try {
                const startLdtParams = {
                    _idDossier: currentLot.idDossier,
                    _idEtape: currentLot.idEtape!,
                    _idPers: parseInt(user.userId, 10),
                    _idLotClient: currentLot.idLotClient,
                    _idLot: currentLot.idLot,
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

        try {
            const data = await CQService.parseCsvFile(file, currentLot.paths.IMAGE_PATH);
            const { metadata, points, dates, image } = data;

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
            const uniqueDatesArray = Array.from(new Set<string>(dates));
            setUniqueDates(
                uniqueDatesArray.map((d, index): DateInfo => ({
                    date: d,
                    color: baseColors[index % baseColors.length]!,
                }))
            );

            const imagePoints = points.map(([x, y]: [number, number]) => ({ x, y, logicalX: 0, logicalY: 0 }));

            setPoints(imagePoints);
            setOriginalPoints(JSON.parse(JSON.stringify(imagePoints)));
            setDates(dates);
            setOriginalDates(JSON.parse(JSON.stringify(dates)));

            if (!imageFile) {
                const img = new Image();
                img.onload = () => {
                    setImageElement(img);
                    setImageData(`data:image/png;base64,${image}`);
                };
                img.src = `data:image/png;base64,${image}`;
            }

            if (currentLot && user) {
                try {
                    const endLdtParams = { _idDossier: currentLot.idDossier, _idEtape: currentLot.idEtape!, _idPers: parseInt(user.userId, 10), _idLotClient: currentLot.idLotClient, _idLot: currentLot.idLot, _idTypeLdt: 39, _qte: 1, };
                    await GpaoService.endLdt(endLdtParams);
                    const startLdtParams = { _idDossier: currentLot.idDossier, _idEtape: currentLot.idEtape!, _idPers: parseInt(user.userId, 10), _idLotClient: currentLot.idLotClient, _idLot: currentLot.idLot, _idTypeLdt: 0, _qte: 1, };
                    await GpaoService.startNewLdt(startLdtParams);
                } catch (err) {
                    console.error("Failed to manage LDTs after CSV processing", err);
                }
            }

        } catch (err) {
            console.error(err);
            setError("Impossible de parser le fichier CSV.");
            if (currentLot && user) {
                try {
                    const endLdtParams = { _idDossier: currentLot.idDossier, _idEtape: currentLot.idEtape!, _idPers: parseInt(user.userId, 10), _idLotClient: currentLot.idLotClient, _idLot: currentLot.idLot, _idTypeLdt: 39, _qte: 1, };
                    await GpaoService.endLdt(endLdtParams);
                } catch (endErr) {
                    console.error("Failed to end inter-file LDT after CSV parse error", endErr);
                }
            }
        } finally {
            setImageLoading(false);
            isAutoLoading.current = false;
        }
    }, [currentLot, user, imageFile, setCollapsed]);

    useEffect(() => {
        if (currentLot && paths && currentLot.idLot !== processedLotId.current) {
            resetState();
            processedLotId.current = currentLot.idLot;
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

            autoLoadAndProcess(currentLot.paths.IN_CQ);
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

    const handleReset = useCallback(() => {
        setPoints(JSON.parse(JSON.stringify(originalPoints)));
        setDates(JSON.parse(JSON.stringify(originalDates)));
        setMetadata(JSON.parse(JSON.stringify(originalMetadata)));
        setSelectedPointIndices([]);
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
        if (!metadata || points.length === 0 || !currentLot || !currentLot.paths) {
            setToast({ message: `Données de lot manquantes pour l'export.`, type: 'error' });
            return;
        }
        setIsExporting(true);
        try {
            const response = await CQService.savePoints(currentLot.lotCQ.idLot, points, dates, metadata, durationMinutes, currentLot.paths.OUT_CQ);
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
            } catch (e) {
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
            setError("L'ancien repère n'est pas valide (axes colinéaires).");
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

    const handleDeleteSelected = () => {
        if (selectedPointIndices.length === 0) return;
        const indicesToDelete = new Set(selectedPointIndices);
        setPoints(prev => prev.filter((_, i) => !indicesToDelete.has(i)));
        setDates(prev => prev.filter((_, i) => !indicesToDelete.has(i)));
        setSelectedPointIndices([]);
    };

    const handleStartCapture = () => {
        setIsCaptureMode(true);
    };

    const handleViewCaptures = () => {
        setIsCaptureDetailsModalOpen(true);
    };


    const handleDeleteCapture = (indexToDelete: number) => {
        setCaptures(prevCaptures => {
            const updatedCaptures = prevCaptures.filter((_, index) => index !== indexToDelete);
            const mcCounter = { count: 1 };
            const anCounter = { count: 1 };

            return updatedCaptures.map(capture => {
                const parts = capture.filename.replace(/\.jpg$/, '').split('_');
                if (parts.length < 3) return capture;

                const baseName = parts.slice(0, -2).join('_');
                let newFilename = '';

                if (capture.type === 'Metadonnée contextuelle') {
                    const newIndex = (mcCounter.count++).toString().padStart(3, '0');
                    newFilename = `${baseName}_MC_${newIndex}.jpg`;
                } else { // Anomalie
                    const newIndex = (anCounter.count++).toString().padStart(3, '0');
                    newFilename = `${baseName}_AN_${newIndex}.jpg`;
                }
                return { ...capture, filename: newFilename };
            });

        });
    };

    const handleCaptureComplete = (dataUrl: string) => {
        setIsCaptureMode(false);

        if (!metadata || !currentLot) {
            setError("Impossible de sauvegarder la capture : métadonnées ou informations sur le lot manquantes.");
            return;
        }

        const correspondante = currentLot.libelle;
        const baseName = correspondante.replace(/\.tif$/, '');

        setNextCaptureInfo({
            baseName: baseName,
            correspondante: correspondante
        });
        setCapturedImage(dataUrl);
        setIsCaptureModalOpen(true);
    };

    const handleCaptureCancel = () => {
        setIsCaptureMode(false);
    };

    const handleSaveCapture = (type: string, nature: string) => {
        if (!capturedImage || !metadata || !nextCaptureInfo) return;

        const { baseName } = nextCaptureInfo;
        const countForType = captures.filter(c => c.type === type).length;
        const newIndexStr = (countForType + 1).toString().padStart(3, '0');

        const suffix = type === "Anomalie" ? "AN" : "MC";
        const filename = `${baseName}_${suffix}_${newIndexStr}.jpg`;

        setCaptures(prev => [...prev, { imageData: capturedImage, type, nature, filename }]);
        setIsCaptureModalOpen(false);
        setCapturedImage(null);
        setNextCaptureInfo(null);
    };
    const handleCancelSavedCapture = () => {
        setIsCaptureModalOpen(false);
        setCapturedImage(null);
        setNextCaptureInfo(null);
    };

    const handleExportCaptures = async () => {
        if (captures.length === 0 || !metadata || !currentLot || !paths?.out) {
            setToast({ message: "Aucune capture à exporter, métadonnées ou chemin de sortie manquants.", type: 'error' });
            return;
        }

        setIsExportingCaptures(true);
        setToast(null);

        const mainImageName = currentLot.libelle;
        let csvContent = "image correspondante;nom de l'image;type;nature\n";
        captures.forEach(capture => {
            csvContent += `${mainImageName};${capture.filename};"${capture.type}";"${capture.nature}"\n`;
        });

        try {
            const response = await CQService.saveCaptures(
                csvContent,
                captures,
                paths.out,
                currentLot.idLot,
                mainImageName
            );
            setToast({ message: `Captures exportées avec succès : ${response.message}`, type: 'success' });
            setCaptures([]);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : String(e);
            setToast({ message: `Erreur lors de l'export des captures: ${errorMessage}`, type: 'error' });
        } finally {
            setIsExportingCaptures(false);
        }
    };

    return (
        <div className="flex h-full w-full font-sans">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {isInterpolating && mousePosition && (
                <div
                    className="fixed pointer-events-none z-50"
                    style={{ left: mousePosition.x + 15, top: mousePosition.y + 15 }}
                >
                    <i className="fas fa-spinner fa-spin text-blue-500 text-3xl" style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.5))' }}></i>
                </div>
            )}
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
                metadata={metadata}
                setMetadata={setMetadata}
                setPoints={setPoints}
                points={points}
                imageElement={imageElement}
                hasData={!!imageElement}
                error={error}
                onStartAddingPoint={startAddingPoint}
                onStartSettingOrigin={startSettingOrigin}
                autoLoadedFilename={autoLoadedFilename}
                csvFile={csvFile}
                setCsvFile={handleManualFileSelect}
                onStartCapture={handleStartCapture}
                onViewCaptures={handleViewCaptures}
                onExportCaptures={handleExportCaptures}
                captureCount={captures.length}
                onPreview={handleEnterPreviewMode}
                isExportingCaptures={isExportingCaptures}
                isExporting={isExporting}
                isPreviewMode={isPreviewMode}
                onExitPreviewMode={handleExitPreviewMode}
                isPreviewLoading={isPreviewLoading}
                selectedPointIndices={selectedPointIndices}
                onDeleteSelected={handleDeleteSelected}
                imageFile={imageFile}
                setImageFile={setImageFile}
                onImageFileChange={handleImageChange}
                saisieDate={saisieDate}
                onSaisieDateChange={handleSaisieDateChange}
                onNextDate={handleNextDate}
                onStopSaisie={handleStopSaisie}
            />
            <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
                {(imageLoading || isPreviewLoading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-40">
                        <div className="flex flex-col items-center">
                            <svg
                                className="animate-spin h-10 w-10 text-white mb-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
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
                        setMetadata={setMetadata}
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
                        selectedPointIndices={selectedPointIndices}
                        setSelectedPointIndices={setSelectedPointIndices}
                        onDeleteSelected={handleDeleteSelected}
                    />
                ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-lg bg-white">
                        <h2 className="text-2xl font-semibold text-gray-700">Bienvenue à la Saisie</h2>
                        <p className="mt-2 text-gray-500">Veuillez charger une image pour commencer la saisie.</p>
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
                    onClose={handleCancelSavedCapture}
                    onSave={handleSaveCapture}
                    imageData={capturedImage}
                    imageCorrespondante={nextCaptureInfo.correspondante}
                    baseFilename={nextCaptureInfo.baseName}
                    captures={captures}
                />
            )}
            {isCaptureDetailsModalOpen && (
                <CaptureDetailsModal
                    isOpen={isCaptureDetailsModalOpen}
                    onClose={() => setIsCaptureDetailsModalOpen(false)}
                    captures={captures}
                    onDeleteCapture={handleDeleteCapture}
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

export default SAISIE;