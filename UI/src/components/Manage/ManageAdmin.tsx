
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lot, LotStatus } from '../../types';
import StatusBadge from '../Dashboard/StatusBagde';

const mockLots: Lot[] = [
    { id: 'LOT-1245', name: 'Export Mars 2023', status: LotStatus.EnCours, start: '12/04/2023 09:30', end: null, quantity: 1245 },
    { id: 'LOT-1244', name: 'Export Février 2023', status: LotStatus.Termine, start: '11/04/2023 14:15', end: '11/04/2023 16:40', quantity: 987 },
    { id: 'LOT-1243', name: 'Export Janvier 2023', status: LotStatus.Termine, start: '10/04/2023 10:05', end: '10/04/2023 12:30', quantity: 1532 },
    { id: 'LOT-1246', name: 'Export Avril 2023', status: LotStatus.EnAttente, start: null, end: null, quantity: null },
];

const ManageAdmin: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div id="lots-page">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t('pages.manage.title')}</h1>
                <p className="text-gray-600">{t('pages.manage.subtitle')}</p>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">{t('pages.manage.list.title')}</h2>
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <i className="fas fa-refresh h-4 w-4 mr-2"></i> {t('pages.manage.list.getLot')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.id')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.name')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.status')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.start')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.end')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.quantity')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pages.manage.list.headers.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockLots.map(lot => (
                                <tr key={lot.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lot.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={lot.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.start || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.end || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.quantity?.toLocaleString() || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {lot.status === LotStatus.EnAttente ? (
                                            <>
                                                <button className="text-green-600 hover:text-green-900 mr-3">{t('common.start')}</button>
                                                <button className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="text-green-600 hover:text-green-900 mr-3">{t('common.details')}</button>
                                                {lot.status === LotStatus.EnCours && <button className="text-red-600 hover:text-red-900">{t('common.stop')}</button>}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-800">{t('pages.manage.load.title')}</h2>
                    </div>
                    <div className="p-6">
                        <div className="mb-4">
                            <label htmlFor="selected-lot" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.manage.load.selectLot')}</label>
                            <select id="selected-lot" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border">
                                <option value="">{t('pages.manage.load.selectDefault')}</option>
                                {mockLots.map(lot => (
                                    <option key={lot.id} value={lot.id}>{`${lot.id} - ${lot.name}`}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.manage.load.sourcePath')}</label>
                                <div className="flex items-center p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                                    <i data-feather="folder" className="h-4 w-4 mr-2 text-gray-400"></i>
                                    /data/input/LOT-1245
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.manage.load.destPath')}</label>
                                <div className="flex items-center p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                                    <i data-feather="folder" className="h-4 w-4 mr-2 text-gray-400"></i>
                                    /data/output/LOT-1245
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                <i className="fas fa-upload mr-2"></i> {t('pages.manage.load.loadData')}
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default ManageAdmin;
