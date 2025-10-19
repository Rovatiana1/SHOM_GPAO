// Toolbar.tsx
import React, { useRef } from 'react';
import Legend from './Legend';
import Icons from './Icons';
import { DateInfo, DisplayMode, Point } from '../../../../types/Image';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { XCircle } from 'lucide-react';

interface ToolbarProps {
    onFileChange: (csvFile: File) => void;
    uniqueDates: DateInfo[];
    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
    onExport: () => void;
    onReset: () => void;
    onShowChart: () => void;
    onStartAddingPoint: () => void;
    onStartSettingOrigin: () => void;
    hasData: boolean;
    error: string | null;
    autoLoadedFilename: string | null;
    csvFile: File | null;
    setCsvFile: (file: File | null) => void;
    onStartCapture: () => void;
    onExportCaptures: () => void;
    captureCount: number;
    onViewCaptures: () => void;
    isExportingCaptures: boolean;
    isExporting: boolean;
    onPreview: () => void;
    isPreviewMode: boolean;
    onExitPreviewMode: () => void;
    isPreviewLoading: boolean;
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
    onStartSettingOrigin,
    autoLoadedFilename,
    csvFile,
    setCsvFile,
    onStartCapture,
    onExportCaptures,
    captureCount,
    onViewCaptures,
    isExportingCaptures,
    isExporting,
    onPreview,
    isPreviewMode,
    onExitPreviewMode,
    isPreviewLoading,
}) => {
    const { isProcessing, loading: processLoading } = useSelector((state: RootState) => state.process);
    const { user } = useSelector((state: RootState) => state.auth);
    const isEditingDisabled = !isProcessing || processLoading || isPreviewMode;
    const isAdmin = user?.roles.includes('ADMIN');

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
    const importDisabled = !csvFile || isAutoLoaded || ((!isProcessing || processLoading) && !isAdmin);

    return (
        <aside className="w-80 bg-white h-[90vh] shadow-lg p-4 flex flex-col overflow-y-auto overflow-x-hidden">
            <h1 className="text-base font-bold text-gray-800 mb-4">Éditeur d'images</h1>

            <div className="border-t border-b border-gray-200 py-4">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-600">CSV File</label>
                    <div
                        className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg bg-green-50 hover:bg-green-100 transition cursor-pointer"
                    >
                        {displayName ? (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mx-auto w-[75%] truncate">{displayName}</p>
                                {displaySize ? <p className="text-xs text-gray-500 mt-1">{(displaySize / 1024).toFixed(2)} KB</p> : null}
                                <p className="text-xs text-green-600 mt-2">
                                    {isAutoLoaded ? 'Chargé automatiquement' : 'Cliquez pour changer de fichier'}
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
                        disabled={importDisabled}
                        className={`w-full py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${!importDisabled
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
                    <div className="mt-4 border-b border-gray-200 pb-4">
                        <h2 className="font-semibold text-lg text-gray-700 mb-2">Options d'affichage</h2>
                        <div>
                            <label htmlFor="displayMode" className="text-sm font-medium text-gray-600">Mode</label>
                            <select
                                id="displayMode"
                                value={displayMode}
                                onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                                disabled={isPreviewMode}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="points">Points</option>
                                <option value="cross">Cross</option>
                                <option value="line">Line</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button onClick={onStartAddingPoint} disabled={isEditingDisabled} className="bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <Icons.Add /> Nouveau
                        </button>
                        <button onClick={onStartSettingOrigin} disabled={isEditingDisabled} className="bg-yellow-500 text-white py-2 px-3 rounded-md hover:bg-yellow-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <Icons.Settings /> Repère
                        </button>
                        <button onClick={onShowChart} disabled={isEditingDisabled} className="bg-purple-500 text-white py-2 px-3 rounded-md hover:bg-purple-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <Icons.Chart /> Courbes
                        </button>
                        <button onClick={onReset} disabled={isEditingDisabled} className="bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <Icons.Reset /> Reset
                        </button>
                    </div>

                    <div className="mt-4 border-t border-gray-200 py-2">
                        <h2 className="font-semibold text-lg text-gray-700 mb-2">Exports</h2>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                                onClick={isPreviewMode ? onExitPreviewMode : onPreview}
                                disabled={(!isProcessing || processLoading) || isPreviewLoading}
                                className={`transition-colors py-2 px-3 rounded-md flex items-center justify-center gap-2 ${isPreviewMode
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                            >
                                {isPreviewLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin" />
                                        <span className='ml-2'>Calcul en cours...</span>
                                    </>
                                ) : isPreviewMode ? (
                                    <>
                                        <XCircle size={18} /> Quitter
                                    </>
                                ) : (
                                    <>
                                        <Icons.Eye /> Prévisualiser
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onExport}
                                disabled={isEditingDisabled || isExporting}
                                className="bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2" />
                                        <span>Export en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icons.Download /> Export
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h2 className="font-semibold text-lg text-gray-700 mb-2">Capture d'écran</h2>
                        <div className="space-y-2">
                             <button onClick={onStartCapture} disabled={isEditingDisabled} className="w-full bg-teal-500 text-white py-2 px-3 rounded-md hover:bg-teal-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Icons.Camera /> Nouvelle Capture
                            </button>
                            <button
                                onClick={onViewCaptures}
                                disabled={isEditingDisabled || captureCount === 0}
                                className="w-full relative bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <Icons.List /> Gérer les Captures
                                {captureCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {captureCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={onExportCaptures}
                                disabled={isEditingDisabled || captureCount === 0 || isExportingCaptures}
                                className="w-full mt-2 relative bg-cyan-600 text-white py-2 px-3 rounded-md hover:bg-cyan-700 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isExportingCaptures ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2" />
                                        <span>Export en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icons.Download /> Exporter les Captures
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <Legend uniqueDates={uniqueDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </>
            )}
        </aside>
    );
};

export default Toolbar;