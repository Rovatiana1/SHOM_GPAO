
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { LotStatus } from '../../types';
// import Timeline from './Timeline';
// import StatusBadge from '../Dashboard/StatusBagde';

// const mockLots = [
//     { id: 'LOT-1245', name: 'Export Mars 2023', status: LotStatus.EnCours },
//     { id: 'LOT-1244', name: 'Export Février 2023', status: LotStatus.Termine },
//     { id: 'LOT-1243', name: 'Export Janvier 2023', status: LotStatus.Termine },
//     { id: 'LOT-1246', name: 'Export Avril 2023', status: LotStatus.EnAttente },
// ];

// const ProcessAdmin: React.FC = () => {
//     const { t } = useTranslation();

//     return (
//         <div id="traitement-page">
//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-800">{t('pages.process.title')}</h1>
//                 <p className="text-gray-600">{t('pages.process.subtitle')}</p>
//             </div>
            
//             <Timeline />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white shadow rounded-lg overflow-hidden">
//                     <div className="px-6 py-4 border-b border-gray-100">
//                         <h2 className="text-lg font-medium text-gray-800">{t('pages.process.dates.title')}</h2>
//                     </div>
//                     <div className="p-6">
//                         <form>
//                             <div className="mb-4">
//                                 <label htmlFor="lot-id" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.dates.lotId')}</label>
//                                 <input type="text" id="lot-id" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border bg-gray-50" defaultValue="LOT-1245" readOnly />
//                             </div>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                                 <div>
//                                     <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.dates.start')}</label>
//                                     <input type="datetime-local" id="start-date" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="2023-04-12T09:30" />
//                                 </div>
                                
//                                 <div>
//                                     <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.dates.end')}</label>
//                                     <input type="datetime-local" id="end-date" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" />
//                                 </div>
//                             </div>
                            
//                             <div className="mb-4">
//                                 <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.dates.quantity')}</label>
//                                 <input type="number" id="quantity" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" placeholder={t('pages.process.dates.quantityPlaceholder')} />
//                             </div>
                            
//                             <div className="flex justify-end">
//                                 <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
//                                     {t('pages.process.dates.save')}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
                
//                 <div className="bg-white shadow rounded-lg overflow-hidden">
//                     <div className="px-6 py-4 border-b border-gray-100">
//                         <h2 className="text-lg font-medium text-gray-800">{t('pages.process.statusUpdate.title')}</h2>
//                     </div>
//                     <div className="p-6">
//                         <form>
//                             <div className="mb-4">
//                                 <label htmlFor="status-lot" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.statusUpdate.selectLot')}</label>
//                                 <select id="status-lot" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border">
//                                     {mockLots.map(lot => (
//                                         <option key={lot.id} value={lot.id}>{`${lot.id} - ${lot.name}`}</option>
//                                     ))}
//                                 </select>
//                             </div>
                            
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.statusUpdate.currentStatus')}</label>
//                                 <div className="p-3 bg-gray-50 rounded-md">
//                                     <StatusBadge status={LotStatus.EnCours} />
//                                 </div>
//                             </div>
                            
//                             <div className="mb-4">
//                                 <label htmlFor="new-status" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.process.statusUpdate.newStatus')}</label>
//                                 <select id="new-status" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border">
//                                     <option value="en-cours">{t('status.inProgress')}</option>
//                                     <option value="termine">{t('status.completed')}</option>
//                                     <option value="en-attente">{t('status.pending')}</option>
//                                     <option value="erreur">{t('status.error')}</option>
//                                 </select>
//                             </div>
                            
//                             <div className="flex justify-end">
//                                 <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
//                                     {t('pages.process.statusUpdate.update')}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProcessAdmin;



import React from 'react';
import { useTranslation } from 'react-i18next';
import Timeline from './Timeline';
import { useProcessContext } from '../../context/ProcessContext';
import ToastNotification from '../../utils/components/ToastNotification';

const ProcessAdmin: React.FC = () => {
    const { t } = useTranslation();
    const { 
        currentLot, 
        isProcessing, 
        getAndStartNextLot, 
        completeAndMoveToNextStep, 
        loading, 
        error, 
        clearError 
    } = useProcessContext();

    return (
        <div id="traitement-page">
            {error && <ToastNotification message={error} onClose={clearError} type="error" />}

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('pages.process.title')}</h1>
                    <p className="text-gray-600">{t('pages.process.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    {!currentLot ? (
                        <button 
                            onClick={getAndStartNextLot} 
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'} mr-2`}></i>
                            {loading ? t('pages.process.loadingLot') : t('pages.process.startNextLot')}
                        </button>
                    ) : (
                        <button 
                            onClick={completeAndMoveToNextStep}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                             <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-check-double'} mr-2`}></i>
                            {t('pages.process.completeAndContinue')}
                        </button>
                    )}
                </div>
            </div>

            {currentLot ? (
                <Timeline lot={currentLot} isProcessing={isProcessing} />
            ) : (
                 <div className="text-center p-8 bg-white rounded-lg shadow">
                    <p className="text-gray-600">{t('pages.process.noLot')}</p>
                </div>
            )}
        </div>
    );
};

export default ProcessAdmin;
