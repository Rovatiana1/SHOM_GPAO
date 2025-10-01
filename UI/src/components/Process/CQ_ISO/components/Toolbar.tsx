
// Toolbar.tsx
import React, { useRef } from 'react';
import Icons from './Icons';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../../types/Image';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';

interface ToolbarProps {
    onFileChange: (csvFile: File) => void;
    uniqueDates: DateInfo[];
    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
    onExport: (duration: number) => void;
    onReset: () => void;
    onShowChart: () => void;
    onStartAddingPoint: () => void;
    metadata: Metadata | null;
    setMetadata: React.Dispatch<React.SetStateAction<Metadata | null>>;
    points: Point[];
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
    imageElement: HTMLImageElement | null;
    hasData: boolean;
    error: string | null;
    autoLoadedFilename: string | null;
    csvFile: File | null;
    setCsvFile: (file: File | null) => void;
    isValidationMode?: boolean;
    onStartValidation?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onFileChange,
    uniqueDates,
    selectedDate,
    setSelectedDate,
    displayMode,
    setDisplayMode,
    onExport,
    onReset,
    onShowChart,
    hasData,
    error,
    onStartAddingPoint,
    autoLoadedFilename,
    csvFile,
    setCsvFile,
    isValidationMode,
    onStartValidation,
}) => {
    const { isProcessing, loading: processLoading } = useSelector((state: RootState) => state.process);
    const isDisabled = isProcessing || processLoading || isValidationMode;

    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleImport = () => {
        if (csvFile) {
            onFileChange(csvFile);
        }
    };

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCsvFile(file);
    };
    
    const displayName = csvFile?.name;
    const displaySize = csvFile?.size;
    const isAutoLoaded = autoLoadedFilename && displayName === autoLoadedFilename;

    return (
        <aside className="w-80 bg-white h-[90vh] shadow-lg p-4 flex flex-col overflow-y-auto">
            <h1 className="text-base font-bold text-gray-800 mb-4">Image Editor</h1>

            <div className="border-t border-b border-gray-200 py-4">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-600">CSV File</label>
                    <div
                        className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg bg-green-50 hover:bg-green-100 transition"
                    >
                        {displayName ? (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mx-auto w-[75%] truncate">{displayName}</p>
                                {displaySize ? <p className="text-xs text-gray-500 mt-1">{(displaySize / 1024).toFixed(2)} KB</p> : null}
                                <p className="text-xs text-green-600 mt-2">
                                    {isAutoLoaded ? 'Chargé automatiquement' : 'Fichier sélectionné'}
                                </p>
                            </div>
                        ) : (
                             <p className="text-sm text-gray-600 text-center">
                                <span className="font-bold">Cliquez</span> ou <span className="font-bold">glissez-déposez</span> un fichier CSV
                            </p>
                        )}
                        <input
                            ref={csvInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelection}
                            className="hidden"
                        />
                    </div>
                    <button
                        onClick={handleImport}
                        disabled={!csvFile || isAutoLoaded || isDisabled}
                        className={`w-full py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${
                            csvFile && !isAutoLoaded && !isDisabled
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                    >
                        <Icons.Upload /> Import
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mt-4"><p className="font-bold">Error</p><p>{error}</p></div>}

            {hasData && (
                <>
                    {!isValidationMode && onStartValidation && (
                         <div className="mt-4 border-b border-gray-200 pb-4">
                             <button onClick={onStartValidation} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors">
                                 <i className="fas fa-search-plus"></i> Démarrer la validation
                             </button>
                         </div>
                    )}
                </>
            )}
        </aside>
    );
};

export default Toolbar;
