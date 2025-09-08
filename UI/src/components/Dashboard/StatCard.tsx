
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: 'green' | 'blue' | 'yellow' | 'red';
}

const colorClasses = {
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    const classes = colorClasses[color];

    return (
        <div className="bg-white rounded-lg shadow card-hover p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${classes.bg}`}>
                    <i className={`${icon} ${classes.text} text-xl`}></i>
                </div>
                <div className="ml-4">
                    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                    <p className="text-md font-semibold text-gray-500">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;