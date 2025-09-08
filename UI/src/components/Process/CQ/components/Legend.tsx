
import React from 'react';
import { DateInfo } from '../types';

interface LegendProps {
    uniqueDates: DateInfo[];
    selectedDate: string | null;
    onSelectDate: (date: string | null) => void;
}

const Legend: React.FC<LegendProps> = ({ uniqueDates, selectedDate, onSelectDate }) => {
    
    const handleDateClick = (date: string) => {
        onSelectDate(selectedDate === date ? null : date);
    };

    return (
        <div className="mt-4 flex-grow">
            <h2 className="font-semibold text-lg text-gray-700 mb-2">Legend</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                {uniqueDates.map(({ date, color }) => {
                    const isSelected = date === selectedDate;
                    return (
                        <div
                            key={date}
                            onClick={() => handleDateClick(date)}
                            className={`flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                isSelected ? 'bg-blue-100 border-blue-400 border-2' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                        >
                            <span
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: color }}
                            ></span>
                            <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>
                                {date}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Legend;
