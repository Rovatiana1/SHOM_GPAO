import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search, X, Loader } from 'lucide-react';

interface SearchableSelectProps<T> {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
    fetchOptions: () => Promise<T[]>;
    optionValue: (option: T) => number;
    optionLabel: (option: T) => string;
    placeholder?: string;
}

const SearchableSelect = <T,>({
    label,
    value,
    onChange,
    fetchOptions,
    optionValue,
    optionLabel,
    placeholder = 'Sélectionner...',
}: SearchableSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setLoading(true);
                const data = await fetchOptions();
                setOptions(Array.isArray(data) ? data : []);
                setError(null);
            } catch (e) {
                setError('Impossible de charger les données.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadOptions();
    }, [fetchOptions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = useMemo(() => options.find(opt => optionValue(opt) === value), [options, value, optionValue]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt =>
            optionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm, optionLabel]);

    const handleSelect = (option: T) => {
        onChange(optionValue(option));
        setIsOpen(false);
        setSearchTerm('');
    };
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div ref={dropdownRef} className="relative mt-1">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                    <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                        {selectedOption ? optionLabel(selectedOption) : placeholder}
                    </span>
                    {value !== null && (
                         <span className="absolute inset-y-0 right-5 flex items-center pr-2">
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" onClick={handleClear} />
                         </span>
                    )}
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                    </span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                        >
                            <div className="p-2">
                                <div className="relative">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center p-4 text-gray-500">
                                    <Loader className="animate-spin h-5 w-5 mr-2" /> Chargement...
                                </div>
                            ) : error ? (
                                <div className="p-4 text-red-600">{error}</div>
                            ) : filteredOptions.length === 0 ? (
                                <div className="p-4 text-gray-500">Aucun résultat.</div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelect(option)}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-green-100"
                                    >
                                        <span className={`block truncate ${optionValue(option) === value ? 'font-semibold' : 'font-normal'}`}>
                                            {optionLabel(option)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SearchableSelect;