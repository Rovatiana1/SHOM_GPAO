// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import Toolbar from './components/Toolbar';
// import CanvasComponent from './components/CanvasComponent';
// import ChartModal from './components/ChartModal';
// import { DateInfo, DisplayMode, Metadata, Point } from '../../../types/Image';
// // FIX: Import `savePoints` to be used in the `handleExport` function.
// import { parseCsvFile, getFileFromPath, savePoints } from '../../../services/CQService';
// import { useAppContext } from "../../../context/AppContext";
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../store/store';

// const CQ_ISO: React.FC = () => {
//     const [points, setPoints] = useState<Point[]>([]);
//     const [originalPoints, setOriginalPoints] = useState<Point[]>([]);
//     const [dates, setDates] = useState<string[]>([]);
//     const [originalDates, setOriginalDates] = useState<string[]>([]);
//     const [uniqueDates, setUniqueDates] = useState<DateInfo[]>([]);

//     const [metadata, setMetadata] = useState<Metadata | null>(null);
//     const [originalMetadata, setOriginalMetadata] = useState<Metadata | null>(null);

//     const [imageData, setImageData] = useState<string | null>(null);
//     const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

//     const [selectedDate, setSelectedDate] = useState<string | null>(null);
//     const [displayMode, setDisplayMode] = useState<DisplayMode>('points');

//     const [error, setError] = useState<string | null>(null);
//     const [isChartVisible, setChartVisible] = useState(false);
//     const [autoLoadedFilename, setAutoLoadedFilename] = useState<string | null>(null);

//     const [csvFile, setCsvFile] = useState<File | null>(null);
//     const isAutoLoading = useRef(false);

//     const { setCollapsed } = useAppContext();
//     const { currentLot, paths, loading: processLoading } = useSelector((state: RootState) => state.process);
//     const processedLotId = useRef<number | null>(null);
//     const [imageLoading, setImageLoading] = useState(false);

//     const resetState = useCallback(() => {
//         setPoints([]);
//         setOriginalPoints([]);
//         setDates([]);
//         setOriginalDates([]);
//         setUniqueDates([]);
//         setMetadata(null);
//         setOriginalMetadata(null);
//         setImageData(null);
//         setImageElement(null);
//         setSelectedDate(null);
//         setDisplayMode('points');
//         setError(null);
//         setAutoLoadedFilename(null);
//         setCsvFile(null);
//         isAutoLoading.current = false;
//     }, []);

//     const processParsedData = useCallback((data: { metadata: Metadata; points: [number, number][]; dates: string[]; image: string }) => {
//         const { metadata, points, dates, image } = data;

//         setMetadata(metadata);
//         setOriginalMetadata(JSON.parse(JSON.stringify(metadata)));

//         setCollapsed(true);
//         const baseColors = [
//             "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
//             "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
//             "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
//             "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
//         ];
//         const img = new Image();
//         img.onload = () => {
//             setImageElement(img);
//             setImageData(`data:image/png;base64,${image}`);

//             const imagePoints = points.map(([x, y]: [number, number]) => ({
//                 x,
//                 y,
//                 logicalX: 0,
//                 logicalY: 0,
//             }));

//             setPoints(imagePoints);
//             setOriginalPoints(JSON.parse(JSON.stringify(imagePoints)));
//             setDates(dates);
//             setOriginalDates(JSON.parse(JSON.stringify(dates)));
//             const uniqueDatesArray = Array.from(new Set<string>(dates));
//             setUniqueDates(
//                 uniqueDatesArray.map((d, index): DateInfo => ({
//                     date: d,
//                     color: baseColors[index % baseColors.length]!,
//                 }))
//             );
            
//             setImageLoading(false); // 👉 stop une fois que l'image est bien chargée
//         };
//         img.onerror = () => {
//             setError("Erreur lors du chargement de l’image.");
//             setImageLoading(false);
//         };
//         img.src = `data:image/png;base64,${image}`;
//     }, [setCollapsed]);

//     const handleFileChange = useCallback(async (file: File) => {
//         setError(null);
//         setImageLoading(true); // 👉 on commence à charger l'image

//         console.log('Processing file:', file.name, file, currentLot);
//         try {
//             const data = await parseCsvFile(file, currentLot.paths.IMAGE_PATH);
//             processParsedData(data);
//         } catch (err) {
//             console.error(err);
//             setError("Impossible de parser le fichier CSV.");
//             setImageLoading(false); // 👉 stop si erreur
//         } finally {
//             isAutoLoading.current = false;
//         }
//     }, [processParsedData]);

//     const handleManualFileSelect = (file: File | null) => {
//         setAutoLoadedFilename(null);
//         isAutoLoading.current = false;
//         setCsvFile(file);
//     };

//     useEffect(() => {
//         if (currentLot && paths && currentLot.idLot !== processedLotId.current) {
//             resetState();
//             processedLotId.current = currentLot.idLot;
//             isAutoLoading.current = true;

//             const autoLoadAndProcess = async (path: string) => {
//                 setError(null);
//                 try {
//                     const { name, content } = await getFileFromPath(path);
//                     const newFile = new File([content], name, { type: 'text/csv' });
//                     setAutoLoadedFilename(name);
//                     setCsvFile(newFile);
//                 } catch (err) {
//                     const errorMessage = err instanceof Error ? err.message : String(err);
//                     console.error(err);
//                     setError(`Erreur lors du chargement automatique: ${errorMessage}`);
//                     isAutoLoading.current = false;
//                 }
//             };

//             autoLoadAndProcess(paths.in);
//         }

//         if (!currentLot) {
//             resetState();
//             processedLotId.current = null;
//         }
//     }, [currentLot, paths, resetState]);

//     useEffect(() => {
//         if (csvFile && isAutoLoading.current) {
//             handleFileChange(csvFile);
//         }
//     }, [csvFile, handleFileChange]);

//     const handleReset = useCallback(() => {
//         setPoints(JSON.parse(JSON.stringify(originalPoints)));
//         setDates(JSON.parse(JSON.stringify(originalDates)));
//         setMetadata(JSON.parse(JSON.stringify(originalMetadata)));
//     }, [originalPoints, originalDates, originalMetadata]);

//     const handleExport = async (durationMinutes: number) => {
//         if (!metadata || points.length === 0) {
//             alert("No data to export.");
//             return;
//         }

//         try {
//             const response = await savePoints(points, dates, metadata, durationMinutes);
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.setAttribute("download", `export_${new Date().toISOString().slice(0, 10)}.csv`);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         } catch (e) {
//             console.error(e);
//             alert("Erreur lors de l’export CSV");
//         }
//     };

//     const addPoint = useCallback((point: { x: number; y: number }) => {
//         if (selectedDate) {
//             const newPoint: Point = { ...point, logicalX: 0, logicalY: 0 };
//             setPoints(prev => [...prev, newPoint]);
//             setDates(prev => [...prev, selectedDate]);
//         }
//     }, [selectedDate]);

//     const [addingPoint, setAddingPoint] = useState(false);
//     const [tempPoint, setTempPoint] = useState<{ x: number; y: number } | null>(null);

//     const startAddingPoint = () => {
//         if (!selectedDate) {
//             alert("Veuillez sélectionner une date avant d'ajouter un repère.");
//             return;
//         }
//         setAddingPoint(true);
//         setTempPoint(null);
//     };

//     const cancelAddingPoint = () => {
//         setAddingPoint(false);
//         setTempPoint(null);
//     };

//     const savePoint = (point: { x: number; y: number }) => {
//         if (!selectedDate) return;
//         const newPoint: Point = { ...point, logicalX: 0, logicalY: 0 };
//         setPoints(prev => [...prev, newPoint]);
//         setDates(prev => [...prev, selectedDate]);
//         setAddingPoint(false);
//         setTempPoint(null);
//     };

//     return (
//         <div className="flex h-full w-full font-sans">
//             <Toolbar
//                 onFileChange={handleFileChange}
//                 uniqueDates={uniqueDates}
//                 selectedDate={selectedDate}
//                 setSelectedDate={setSelectedDate}
//                 displayMode={displayMode}
//                 setDisplayMode={setDisplayMode}
//                 onExport={handleExport}
//                 onReset={handleReset}
//                 onShowChart={() => setChartVisible(true)}
//                 metadata={metadata}
//                 setMetadata={setMetadata}
//                 setPoints={setPoints}
//                 points={points}
//                 imageElement={imageElement}
//                 hasData={!!imageElement}
//                 error={error}
//                 onStartAddingPoint={startAddingPoint}
//                 autoLoadedFilename={autoLoadedFilename}
//                 csvFile={csvFile}
//                 setCsvFile={handleManualFileSelect}
//             />
//             <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
//                 {(processLoading || imageLoading) && (
//                     <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50">
//                         <div className="flex flex-col items-center">
//                             <svg
//                                 className="animate-spin h-10 w-10 text-white mb-3"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <circle
//                                     className="opacity-25"
//                                     cx="12"
//                                     cy="12"
//                                     r="10"
//                                     stroke="currentColor"
//                                     strokeWidth="4"
//                                 ></circle>
//                                 <path
//                                     className="opacity-75"
//                                     fill="currentColor"
//                                     d="M4 12a8 8 0 018-8v8H4z"
//                                 ></path>
//                             </svg>
//                             <span className="text-white text-lg">Chargement de l’image...</span>
//                         </div>
//                     </div>
//                 )}
//                 {imageElement ? (
//                     <CanvasComponent
//                         image={imageElement}
//                         points={points}
//                         setPoints={setPoints}
//                         dates={dates}
//                         setDates={setDates}
//                         uniqueDates={uniqueDates}
//                         selectedDate={selectedDate}
//                         displayMode={displayMode}
//                         metadata={metadata}
//                         setMetadata={setMetadata}
//                         addPoint={addPoint}
//                         addingPoint={addingPoint}
//                         setAddingPoint={setAddingPoint}
//                         setTempPoint={setTempPoint}
//                         tempPoint={tempPoint}
//                         cancelAddingPoint={cancelAddingPoint}
//                         savePoint={savePoint}
//                     />
//                 ) : (
//                     <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-lg bg-white">
//                         <h2 className="text-2xl font-semibold text-gray-700">Welcome</h2>
//                         <p className="mt-2 text-gray-500">Please upload a CSV and an Image file using the toolbar to begin.</p>
//                     </div>
//                 )}
//             </main>
//             {isChartVisible && imageElement && (
//                 <ChartModal
//                     points={points}
//                     dates={dates}
//                     uniqueDates={uniqueDates}
//                     onClose={() => setChartVisible(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default CQ_ISO;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/CanvasComponent';
import ChartModal from './components/ChartModal';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../types/Image';
import { parseCsvFile, getFileFromPath, savePoints } from '../../../services/CQService';
import { useAppContext } from "../../../context/AppContext";
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import ValidationControls from './components/ValidationControls';
import ConfirmationModal from './components/ConfirmationModal';

const CQ_ISO: React.FC = () => {
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

    // State for new validation feature
    const [isValidationMode, setIsValidationMode] = useState(false);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const resetState = useCallback((keepValidationMode = false) => {
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

        if (!keepValidationMode) {
            setIsValidationMode(false);
            setCurrentPointIndex(0);
            setIsConfirmationModalOpen(false);
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
            setImageData(`data:image/png;base64,${image}`);

            const imagePoints: Point[] = points.map(([x, y]: [number, number]) => ({
                x,
                y,
                logicalX: 0,
                logicalY: 0,
                validationStatus: 'pending', // Initialize for validation
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
    
    // Point manipulation functions (add, cancel, save)
    const [addingPoint, setAddingPoint] = useState(false);
    const [tempPoint, setTempPoint] = useState<{ x: number; y: number } | null>(null);

    const addPoint = useCallback((point: { x: number; y: number }) => {
        if (selectedDate) {
            const newPoint: Point = { ...point, logicalX: 0, logicalY: 0, validationStatus: 'pending' };
            setPoints(prev => [...prev, newPoint]);
            setDates(prev => [...prev, selectedDate]);
        }
    }, [selectedDate]);

    const startAddingPoint = () => {
        if (isValidationMode) return;
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
        addPoint(point);
        setAddingPoint(false);
        setTempPoint(null);
    };

    // --- Validation Mode Functions ---
    const handleStartValidation = () => {
        if (points.length > 0) {
            setIsValidationMode(true);
            setCurrentPointIndex(0);
        }
    };

    const handleNavigatePoint = (direction: 'next' | 'prev') => {
        setCurrentPointIndex(prev => {
            if (direction === 'next' && prev < points.length - 1) return prev + 1;
            if (direction === 'prev' && prev > 0) return prev - 1;
            return prev;
        });
    };

    const handleValidatePoint = (status: 'valid' | 'error') => {
        setPoints(prevPoints =>
            prevPoints.map((p, index) =>
                index === currentPointIndex ? { ...p, validationStatus: status } : p
            )
        );
        if (currentPointIndex === points.length - 1) {
            setIsConfirmationModalOpen(true);
        } else {
            handleNavigatePoint('next');
        }
    };

    const handleFinishValidation = () => {
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmSave = () => {
        console.log("Saving validated points:", points);
        // Here you would typically send the data to a backend
        alert("Les résultats de la validation ont été enregistrés (voir console).");
        setIsConfirmationModalOpen(false);
        setIsValidationMode(false);
    };

    const handleCancelValidation = () => {
        setIsConfirmationModalOpen(false);
    };

    const handleExitValidation = () => {
        // Reset validation status on all points
        setPoints(prev => prev.map(p => ({...p, validationStatus: 'pending'})));
        setIsValidationMode(false);
        setCurrentPointIndex(0);
    }

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
                autoLoadedFilename={autoLoadedFilename}
                csvFile={csvFile}
                setCsvFile={handleManualFileSelect}
                isValidationMode={isValidationMode}
                onStartValidation={handleStartValidation}
            />
            <main className="relative flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-hidden h-[90vh]">
                {(processLoading || imageLoading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                            <span className="text-white text-lg">Chargement de l’image...</span>
                        </div>
                    </div>
                )}
                {isValidationMode && (
                    <ValidationControls
                        currentPointIndex={currentPointIndex}
                        totalPoints={points.length}
                        onPrevious={() => handleNavigatePoint('prev')}
                        onNext={() => handleNavigatePoint('next')}
                        onValidate={() => handleValidatePoint('valid')}
                        onInvalidate={() => handleValidatePoint('error')}
                        onFinish={handleFinishValidation}
                        onExit={handleExitValidation}
                    />
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
                        currentPointIndex={isValidationMode ? currentPointIndex : null}
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
            {isConfirmationModalOpen && (
                <ConfirmationModal
                    points={points}
                    onConfirm={handleConfirmSave}
                    onClose={handleCancelValidation}
                />
            )}
        </div>
    );
};

export default CQ_ISO;
