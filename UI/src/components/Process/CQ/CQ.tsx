import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ChartModal from './components/ChartModal';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../types/Image';
import { parseCsvFile, savePoints, parseCsvFromPath } from '../../../services/CQService';
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

    const { setCollapsed } = useAppContext();
    const { currentLot, paths } = useSelector((state: RootState) => state.process);
    const processedLotId = useRef<number | null>(null);

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
        };
        img.src = `data:image/png;base64,${image}`;
    }, [setCollapsed]);

    const handleFileChange = async (csvFile: File) => {
        setError(null);
        try {
            const data = await parseCsvFile(csvFile);
            processParsedData(data);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger le fichier");
        }
    };

    const handleLoadFromPath = useCallback(async (path: string) => {
        setError(null);
        try {
            const data = await parseCsvFromPath(path);
            processParsedData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(err);
            setError(`Erreur lors du chargement des données: ${errorMessage}`);
        }
    }, [processParsedData]);

    useEffect(() => {
        if (currentLot && paths && currentLot.idLot !== processedLotId.current) {
            resetState();
            processedLotId.current = currentLot.idLot;
            handleLoadFromPath(paths.in);
        }

        if (!currentLot) {
            resetState();
            processedLotId.current = null;
        }
    }, [currentLot, paths, handleLoadFromPath, resetState]);

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
            />
            <main className="flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden">
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
