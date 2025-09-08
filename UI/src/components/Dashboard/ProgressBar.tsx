
import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
    label: string;
    percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, percentage }) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Trigger the animation
        const timer = setTimeout(() => setWidth(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    return (
        <div>
            <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-green-600 h-2 rounded-full progress-bar" 
                    style={{ width: `${width}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
