
import React, { useState, useCallback } from 'react';
import { parseCsv } from './services/csvHelper';
import { generateCsvContent } from './services/exportHelper';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ChartModal from './components/ChartModal';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../types/Image';
import { parseCsvFile, savePoints } from './services/api';
import { useAppContext } from "../../../context/AppContext";

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

    const handleFileChange = async (csvFile: File) => {
        try {
            const { metadata, points, dates, image } = await parseCsvFile(csvFile);

            setMetadata(metadata);
            setOriginalMetadata(JSON.parse(JSON.stringify(metadata)));

            setCollapsed(true);
            // Crée mapping date -> couleur
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
                // Attribution des couleurs aux dates uniques
                const uniqueDatesArray = Array.from(new Set<string>(dates));
                setUniqueDates(
                    uniqueDatesArray.map((d, index): DateInfo => ({
                        date: d,
                        color: baseColors[index % baseColors.length]!, // rotation si plus de dates que de couleurs
                    }))
                );
            };
            img.src = `data:image/png;base64,${image}`;
        } catch (err) {
            console.error(err);
            setError("Impossible de charger le fichier");
        }
    };

    const resetState = () => {
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
    };

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
