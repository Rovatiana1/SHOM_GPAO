
// import React from 'react';
// import { useTranslation } from 'react-i18next';

// const TimelineItem: React.FC<{item: { title: string; description: string; time?: string; completed: boolean; progress?: number; } }> = ({ item }) => (
//     <div className="timeline-item">
//         <div className={`timeline-dot ${!item.completed ? 'bg-gray-300' : ''}`}></div>
//         <div className={`bg-gray-50 rounded-lg p-4 ${!item.completed ? 'opacity-70' : ''}`}>
//             <h3 className="font-medium text-gray-800">{item.title}</h3>
//             <p className="text-sm text-gray-600 mt-1">{item.description}</p>
//             {item.time && (
//                 <div className="mt-2 text-xs text-gray-500">
//                     <i data-feather="clock" className="h-3 w-3 inline mr-1"></i> {item.time}
//                 </div>
//             )}
//             {item.progress && (
//                 <div className="flex items-center mt-2">
//                     <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
//                         <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
//                     </div>
//                     <span className="text-xs text-gray-500">{item.progress}%</span>
//                 </div>
//             )}
//         </div>
//     </div>
// );

// const Timeline: React.FC = () => {
//     const { t } = useTranslation();

//     const timelineData = [
//         { title: t('pages.process.timeline.step1.title'), description: t('pages.process.timeline.step1.description', { lotId: 'LOT-1245' }), time: '12/04/2023 09:30:15', completed: true },
//         { title: t('pages.process.timeline.step2.title'), description: t('pages.process.timeline.step2.description'), time: '12/04/2023 09:31:05', completed: true },
//         { title: t('pages.process.timeline.step3.title'), description: t('pages.process.timeline.step3.description'), time: '12/04/2023 09:35:22', completed: true },
//         { title: t('pages.process.timeline.step4.title'), description: t('pages.process.timeline.step4.description'), progress: 65, completed: true },
//         { title: t('pages.process.timeline.step5.title'), description: t('pages.process.timeline.step5.description'), completed: false },
//         { title: t('pages.process.timeline.step6.title'), description: t('pages.process.timeline.step6.description'), completed: false },
//         { title: t('pages.process.timeline.step7.title'), description: t('pages.process.timeline.step7.description'), completed: false },
//         { title: t('pages.process.timeline.step8.title'), description: t('pages.process.timeline.step8.description'), completed: false },
//     ];

//     return (
//         <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//             <div className="px-6 py-4 border-b border-gray-100">
//                 <h2 className="text-lg font-medium text-gray-800">{t('pages.process.timeline.title')}</h2>
//             </div>
//             <div className="p-6">
//                 <div className="relative">
//                     {timelineData.map((item, index) => (
//                         <TimelineItem key={index} item={item} />
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Timeline;



import React from 'react';
import { useTranslation } from 'react-i18next';
import { LotDetails } from '../../types';

// Fix: Define an interface for the timeline steps to include optional 'inProgress' and 'progress' properties.
// This resolves TypeScript errors related to accessing these properties on the 'baseSteps' array elements.
interface TimelineStep {
    id: string;
    completed: boolean;
    inProgress?: boolean;
    progress?: number;
}

const TimelineItem: React.FC<{ item: { title: string; description: string; time?: string; completed: boolean; inProgress?: boolean; progress?: number; } }> = ({ item }) => (
    <div className="timeline-item">
        <div className={`timeline-dot ${item.inProgress ? 'bg-yellow-500 animate-pulse' : !item.completed ? 'bg-gray-300' : ''}`}></div>
        <div className={`bg-gray-50 rounded-lg p-4 ${!item.completed && !item.inProgress ? 'opacity-70' : ''}`}>
            <h3 className="font-medium text-gray-800">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            {item.time && (
                <div className="mt-2 text-xs text-gray-500">
                    <i data-feather="clock" className="h-3 w-3 inline mr-1"></i> {item.time}
                </div>
            )}
            {typeof item.progress !== 'undefined' && (
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

interface TimelineProps {
    lot: LotDetails;
    isProcessing: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ lot, isProcessing }) => {
    const { t } = useTranslation();

    const getTimelineData = () => {
        const lotId = lot?._idLot ?? 'N/A';
        const baseSteps: TimelineStep[] = [
            { id: 'retrieve', completed: true },
            { id: 'build_paths', completed: true },
            { id: 'load_data', completed: true },
            { id: 'extract_points', completed: false, inProgress: false },
            { id: 'schedule_data', completed: false },
            { id: 'machine_times', completed: false },
            { id: 'export_data', completed: false },
            { id: 'create_new', completed: false },
        ];

        if(isProcessing) {
            const currentStepIndex = baseSteps.findIndex(step => !step.completed);
            if (currentStepIndex !== -1) {
                baseSteps[currentStepIndex]!.inProgress = true;
                baseSteps[currentStepIndex]!.progress = 50; // Example progress
            }
        }

        return [
            { title: t('pages.process.timeline.step1.title'), description: t('pages.process.timeline.step1.description', { lotId }), completed: baseSteps[0]!.completed, inProgress: baseSteps[0]!.inProgress },
            { title: t('pages.process.timeline.step2.title'), description: t('pages.process.timeline.step2.description'), completed: baseSteps[1]!.completed, inProgress: baseSteps[1]!.inProgress },
            { title: t('pages.process.timeline.step3.title'), description: t('pages.process.timeline.step3.description'), completed: baseSteps[2]!.completed, inProgress: baseSteps[2]!.inProgress },
            { title: t('pages.process.timeline.step4.title'), description: t('pages.process.timeline.step4.description'), completed: baseSteps[3]!.completed, inProgress: baseSteps[3]!.inProgress, progress: baseSteps[3]!.progress },
            { title: t('pages.process.timeline.step5.title'), description: t('pages.process.timeline.step5.description'), completed: baseSteps[4]!.completed, inProgress: baseSteps[4]!.inProgress },
            { title: t('pages.process.timeline.step6.title'), description: t('pages.process.timeline.step6.description'), completed: baseSteps[5]!.completed, inProgress: baseSteps[5]!.inProgress },
            { title: t('pages.process.timeline.step7.title'), description: t('pages.process.timeline.step7.description'), completed: baseSteps[6]!.completed, inProgress: baseSteps[6]!.inProgress },
            { title: t('pages.process.timeline.step8.title'), description: t('pages.process.timeline.step8.description'), completed: baseSteps[7]!.completed, inProgress: baseSteps[7]!.inProgress },
        ];
    };

    const timelineData = getTimelineData();

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