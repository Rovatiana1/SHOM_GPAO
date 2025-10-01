
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ChartModal from './components/ChartModal';
import { DateInfo, DisplayMode, Metadata, Point, ReperePoint } from '../../../types/Image';
// FIX: Import `savePoints` to be used in the `handleExport` function.
import { parseCsvFile, getFileFromPath, savePoints } from '../../../services/CQService';
import { useAppContext } from "../../../context/AppContext";
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

const CQ: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const [originalPoints, setOriginalPoints] = useState<Point[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [originalDates, setOriginalDates] = useState<string[]>([]);
    const [uniqueDates, setUniqueDates] = useState<DateInfo[]>([]);

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
    const isAutoLoading = useRef(false);

    const { setCollapsed } = useAppContext();
    const { currentLot, paths, loading: processLoading } = useSelector((state: RootState) => state.process);
    const processedLotId = useRef<number | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    
    const [isSettingOrigin, setIsSettingOrigin] = useState(false);

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
        isAutoLoading.current = false;
        setIsSettingOrigin(false);
    }, []);

    const processParsedData = useCallback((data: { metadata: Metadata; points: [number, number][]; dates: string[]; image: string }) => {
        const { metadata, points, dates, image } = data;

        // Helper to sanitize coordinate data from strings like "(x, y)" to [x, y]
        const parseCoords = (coord: any): ReperePoint => {
            if (Array.isArray(coord) && coord.length === 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number') {
                return coord as ReperePoint;
            }
            const match = String(coord).match(/\(?\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*\)?/);
            if (!match) return [0, 0];
            return [parseFloat(match[1]!), parseFloat(match[2]!)];
        };

        // Sanitize metadata to ensure coordinates are always arrays of numbers
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
            setImageData(`data:image/png;base64,${image}`);

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
        };
        img.onerror = () => {
            setError("Erreur lors du chargement de l’image.");
            setImageLoading(false);
        };
        img.src = `data:image/png;base64,${image}`;
    }, [setCollapsed]);

    const handleFileChange = useCallback(async (file: File) => {
        setError(null);
        setImageLoading(true);

        console.log('Processing file:', file.name, file, currentLot);
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
            resetState();
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
                    console.error(err);
                    setError(`Erreur lors du chargement automatique: ${errorMessage}`);
                    isAutoLoading.current = false;
                }
            };

            autoLoadAndProcess(paths.in);
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
    }, [originalPoints, originalDates, originalMetadata]);

    const handleExport = async (durationMinutes: number) => {
        if (!metadata || points.length === 0) {
            alert("No data to export.");
            return;
        }

        try {
            const response = await savePoints(points, dates, metadata, durationMinutes);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l’export CSV");
        }
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
            alert("Veuillez sélectionner une date avant d'ajouter un repère.");
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
    
        // 1. Define old basis from original metadata (now guaranteed to be [number, number])
        const O_old = originalMetadata.origin_px;
        const X_max_old = originalMetadata.x_max_px;
        const Y_max_old = originalMetadata.y_max_px;
    
        const VX_old = [X_max_old[0] - O_old[0], X_max_old[1] - O_old[1]];
        const VY_old = [Y_max_old[0] - O_old[0], Y_max_old[1] - O_old[1]];
    
        // 2. Define new basis from user input
        const O_new = [newRepere.origin.x, newRepere.origin.y];
        const X_max_new = [newRepere.xAxis.x, newRepere.xAxis.y];
        const Y_max_new = [newRepere.yAxis.x, newRepere.yAxis.y];
    
        const VX_new = [X_max_new[0]! - O_new[0]!, X_max_new[1]! - O_new[1]!];
        const VY_new = [Y_max_new[0]! - O_new[0]!, Y_max_new[1]! - O_new[1]!];
    
        // 3. Calculate inverse of the old transformation matrix determinant
        const det_old = VX_old[0]! * VY_old[1]! - VY_old[0]! * VX_old[1]!;
        if (Math.abs(det_old) < 1e-6) {
            setError("L'ancien repère n'est pas valide (axes colinéaires).");
            setIsSettingOrigin(false);
            return;
        }
    
        // 4. Transform each original point
        const newPoints = originalPoints.map(p_orig => {
            const p_vec = [p_orig.x - O_old[0], p_orig.y - O_old[1]];
    
            // Solve for logical coordinates (u, v) where P-O = u*VX + v*VY
            const u = (p_vec[0]! * VY_old[1]! - p_vec[1]! * VY_old[0]!) / det_old;
            const v = (p_vec[1]! * VX_old[0]! - p_vec[0]! * VX_old[1]!) / det_old;
    
            // Apply new transformation
            const newX = O_new[0]! + u * VX_new[0]! + v * VY_new[0]!;
            const newY = O_new[1]! + u * VX_new[1]! + v * VY_new[1]!;
    
            return { ...p_orig, x: newX, y: newY };
        });
    
        setPoints(newPoints);
    
        // 5. Update metadata
        const newMetadata: Metadata = JSON.parse(JSON.stringify(metadata));
        newMetadata.origin_px = [newRepere.origin.x, newRepere.origin.y];
        newMetadata.x_max_px = [newRepere.xAxis.x, newRepere.xAxis.y];
        newMetadata.y_max_px = [newRepere.yAxis.x, newRepere.yAxis.y];
        setMetadata(newMetadata);
    
        setIsSettingOrigin(false);
    };


    return (
        <div className="flex h-full w-full font-sans">
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
            />
            <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
                {(processLoading || imageLoading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50">
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
                    />
                ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-lg bg-white">
                        <h2 className="text-2xl font-semibold text-gray-700">Welcome</h2>
                        <p className="mt-2 text-gray-500">Please upload a CSV and an Image file using the toolbar to begin.</p>
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
        </div>
    );
};

export default CQ;