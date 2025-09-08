
import React from 'react';
import { useTranslation } from 'react-i18next';

const TimelineItem: React.FC<{item: { title: string; description: string; time?: string; completed: boolean; progress?: number; } }> = ({ item }) => (
    <div className="timeline-item">
        <div className={`timeline-dot ${!item.completed ? 'bg-gray-300' : ''}`}></div>
        <div className={`bg-gray-50 rounded-lg p-4 ${!item.completed ? 'opacity-70' : ''}`}>
            <h3 className="font-medium text-gray-800">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            {item.time && (
                <div className="mt-2 text-xs text-gray-500">
                    <i data-feather="clock" className="h-3 w-3 inline mr-1"></i> {item.time}
                </div>
            )}
            {item.progress && (
                <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{item.progress}%</span>
                </div>
            )}
        </div>
    </div>
);

const Timeline: React.FC = () => {
    const { t } = useTranslation();

    const timelineData = [
        { title: t('pages.process.timeline.step1.title'), description: t('pages.process.timeline.step1.description', { lotId: 'LOT-1245' }), time: '12/04/2023 09:30:15', completed: true },
        { title: t('pages.process.timeline.step2.title'), description: t('pages.process.timeline.step2.description'), time: '12/04/2023 09:31:05', completed: true },
        { title: t('pages.process.timeline.step3.title'), description: t('pages.process.timeline.step3.description'), time: '12/04/2023 09:35:22', completed: true },
        { title: t('pages.process.timeline.step4.title'), description: t('pages.process.timeline.step4.description'), progress: 65, completed: true },
        { title: t('pages.process.timeline.step5.title'), description: t('pages.process.timeline.step5.description'), completed: false },
        { title: t('pages.process.timeline.step6.title'), description: t('pages.process.timeline.step6.description'), completed: false },
        { title: t('pages.process.timeline.step7.title'), description: t('pages.process.timeline.step7.description'), completed: false },
        { title: t('pages.process.timeline.step8.title'), description: t('pages.process.timeline.step8.description'), completed: false },
    ];

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-800">{t('pages.process.timeline.title')}</h2>
            </div>
            <div className="p-6">
                <div className="relative">
                    {timelineData.map((item, index) => (
                        <TimelineItem key={index} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
