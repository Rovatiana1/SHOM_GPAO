import React, { useState, useRef } from 'react';
import Legend from './Legend';
import Icons from './Icons';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../../types/Image';

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
    metadata: Metadata | null;
    setMetadata: React.Dispatch<React.SetStateAction<Metadata | null>>;
    points: Point[];
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
    imageElement: HTMLImageElement | null;
    hasData: boolean;
    error: string | null;
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
}) => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isExportModalOpen, setExportModalOpen] = useState(false);

    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleImport = () => {
        if (csvFile) {
            onFileChange(csvFile);
        } else {
            alert('Please select a CSV file.');
        }
    };

    const handleFileChange = (file: File | null) => {
        setCsvFile(file);
    };

    const handleExportClick = () => {
        setExportModalOpen(true);
    };

    const handleDurationSubmit = (duration: number) => {
        onExport(duration);
        setExportModalOpen(false);
    };

    return (
        <aside className="w-80 bg-white h-full shadow-lg p-4 flex flex-col overflow-y-auto">
            <h1 className="text-base font-bold text-gray-800 mb-4">Image Editor</h1>

            <div className="border-t border-b border-gray-200 py-4">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-600">CSV File</label>
                    <div
                        className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg bg-green-50 hover:bg-green-100 transition cursor-pointer"
                        onClick={() => csvInputRef.current?.click()}
                    >
                        {csvFile ? (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mx-auto w-[75%] truncate">{csvFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(csvFile.size / 1024).toFixed(2)} KB
                                </p>
                                <p className="text-xs text-green-600 mt-2">Cliquez pour changer de fichier</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-bold">Cliquez</span> ou{" "}
                                <span className="font-bold">glissez-déposez</span> un fichier CSV
                            </p>
                        )}
                        <input
                            ref={csvInputRef}
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={!csvFile}
                        className={`w-full py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${csvFile
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Icons.Upload /> Import
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mt-4" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}

            {hasData && (
                <>
                    <div className="mt-4 border-b border-gray-200 pb-4">
                        <h2 className="font-semibold text-lg text-gray-700 mb-2">Display Options</h2>
                        <div>
                            <label htmlFor="displayMode" className="text-sm font-medium text-gray-600">Mode</label>
                            <select id="displayMode" value={displayMode} onChange={(e) => setDisplayMode(e.target.value as DisplayMode)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="points">Points</option>
                                <option value="cross">Cross</option>
                                <option value="line">Line</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 border-b border-gray-200 pb-4">
                        <h2 className="font-semibold text-lg text-gray-700 mb-2">Actions</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleExportClick} className="bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"><Icons.Download /> Export</button>
                            <button onClick={onReset} className="bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition flex items-center justify-center gap-2"><Icons.Reset /> Reset</button>
                            <button onClick={onShowChart} className="col-span-2 bg-purple-500 text-white py-2 px-3 rounded-md hover:bg-purple-600 transition flex items-center justify-center gap-2"><Icons.Chart /> Show Curves</button>
                        </div>
                    </div>
                    <Legend uniqueDates={uniqueDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </>
            )}

            {isExportModalOpen && <ExportModal onSubmit={handleDurationSubmit} onCancel={() => setExportModalOpen(false)} />}
        </aside>
    );
};

const ExportModal: React.FC<{ onSubmit: (duration: number) => void, onCancel: () => void }> = ({ onSubmit, onCancel }) => {
    const [duration, setDuration] = useState(5);

    const durations = [
        { label: '1 minute', value: 1 },
        { label: '5 minutes', value: 5 },
        { label: '10 minutes', value: 10 },
        { label: '30 minutes', value: 30 },
        { label: '1 hour', value: 60 },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Choose an export duration:</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(duration); }}>
                    <div className="space-y-2">
                        {durations.map(d => (
                            <label key={d.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input type="radio" name="duration" value={d.value} checked={duration === d.value} onChange={() => setDuration(d.value)} className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" />
                                <span className="text-gray-700">{d.label}</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Validate</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Toolbar;