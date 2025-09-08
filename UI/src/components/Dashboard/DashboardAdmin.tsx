import React from 'react';
import StatCard from './StatCard';
import ProgressBar from './ProgressBar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

const progressItems = [
  { id: 'LOT-1245', percentage: 65 },
  { id: 'LOT-1246', percentage: 30 },
  { id: 'LOT-1247', percentage: 10 },
];

// Corresponds to StatCard colors: green, blue, yellow, red
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']; 

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Do not render label for very small slices

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DashboardAdmin: React.FC = () => {
  const { t } = useTranslation();

  const recentActivities = [
    { icon: 'fas fa-play', color: 'green', text: t('pages.dashboard.activity.item1', { lotId: 'LOT-1245' }), time: t('pages.dashboard.activity.time.minutesAgo', { count: 2 }) },
    { icon: 'fas fa-check', color: 'blue', text: t('pages.dashboard.activity.item2', { lotId: 'LOT-1244' }), time: t('pages.dashboard.activity.time.minutesAgo', { count: 15 }) },
    { icon: 'fas fa-pause', color: 'yellow', text: t('pages.dashboard.activity.item3'), time: t('pages.dashboard.activity.time.minutesAgo', { count: 30 }) },
  ];

  const chartData = [
    { name: t('status.inProgress'), value: 12 },
    { name: t('status.completed'), value: 48 },
    { name: t('status.pending'), value: 5 },
    { name: t('status.error'), value: 2 },
  ];

  return (
    <div id="dashboard-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('pages.dashboard.title')}</h1>
        <p className="text-gray-600">{t('pages.dashboard.subtitle')}</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={t('pages.dashboard.stats.inProgress')} value="12" icon="fas fa-box-open" color="green" />
        <StatCard title={t('pages.dashboard.stats.completed')} value="48" icon="fas fa-check-circle" color="blue" />
        <StatCard title={t('pages.dashboard.stats.pending')} value="5" icon="fas fa-clock" color="yellow" />
        <StatCard title={t('pages.dashboard.stats.errors')} value="2" icon="fas fa-exclamation-triangle" color="red" />
      </div>

      {/* Progression, Chart, and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">{t('pages.dashboard.progress.title')}</h2>
          </div>
          <div className="p-6 space-y-4">
            {progressItems.map((item) => (
              <ProgressBar key={item.id} label={item.id} percentage={item.percentage} />
            ))}
          </div>
        </div>
        
        {/* Chart Répartition */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-800">{t('pages.dashboard.distribution.title')}</h2>
            </div>
            <div className="p-4" style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={85}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} ${t('pages.dashboard.distribution.tooltip')}`} />
                        <Legend iconSize={10} iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">{t('pages.dashboard.activity.title')}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center">
                  <div className={`bg-${activity.color}-100 flex items-center justify-center p-2 w-10 h-10 rounded-full`}>
                    <i className={`${activity.icon} text-${activity.color}-600 text-sm`}></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-800">{activity.text}</h3>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardAdmin;
