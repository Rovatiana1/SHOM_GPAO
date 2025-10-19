
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icons from './Icons';
import { DateInfo, Point } from '../../../../types/Image';

interface ChartModalProps {
    points: Point[];
    dates: string[];
    uniqueDates: DateInfo[];
    onClose: () => void;
}

const ChartModal: React.FC<ChartModalProps> = ({ points, dates, uniqueDates, onClose }) => {
    const dateColorMap = React.useMemo(() => {
        const map = new Map<string, string>();
        uniqueDates.forEach(d => map.set(d.date, d.color));
        return map;
    }, [uniqueDates]);

    const chartData = React.useMemo(() => {
        return points
            .map((p, i) => ({ ...p, date: dates[i] }))
            .sort((a, b) => {
                if (a.date! < b.date!) return -1;
                if (a.date! > b.date!) return 1;
                return a.x - b.x;
            });
    }, [points, dates]);

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-full max-h-[80vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Courbes chronologiques</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Icons.Close />
                    </button>
                </div>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} label={{ value: 'X Coordinate', position: 'insideBottom', offset: -5 }} />
                            <YAxis reversed={true} label={{ value: 'Y Coordinate', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                labelFormatter={(label) => `X: ${label.toFixed(2)}`}
                                formatter={(value: number, name, props) => [`Y: ${props.payload.y.toFixed(2)}`, `Date: ${props.payload.date}`]}
                            />
                            <Legend />
                            {uniqueDates.map(d => (
                                <Line
                                    key={d.date}
                                    type="monotone"
                                    dataKey="y"
                                    data={chartData.filter(p => p.date === d.date)}
                                    name={d.date}
                                    stroke={d.color}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ChartModal;
