
import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfigurationAdmin: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div id="configuration-page">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t('pages.configuration.title')}</h1>
                <p className="text-gray-600">{t('pages.configuration.subtitle')}</p>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800">{t('pages.configuration.paths.title')}</h2>
                </div>
                <div className="p-6">
                    <form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="input-path" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.paths.input')}</label>
                                <div className="relative">
                                    <input type="text" id="input-path" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="/data/input" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-green-600 hover:text-green-800">
                                        <i className="fas fa-folder"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="output-path" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.paths.output')}</label>
                                <div className="relative">
                                    <input type="text" id="output-path" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="/data/output" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-green-600 hover:text-green-800">
                                        <i className="fas fa-folder"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                {t('pages.configuration.paths.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800">{t('pages.configuration.database.title')}</h2>
                </div>
                <div className="p-6">
                    <form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="db-host" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.database.host')}</label>
                                <input type="text" id="db-host" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="localhost" />
                            </div>
                            <div>
                                <label htmlFor="db-port" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.database.port')}</label>
                                <input type="number" id="db-port" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="5432" />
                            </div>
                            <div>
                                <label htmlFor="db-name" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.database.name')}</label>
                                <input type="text" id="db-name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="gestion_lots" />
                            </div>
                            <div>
                                <label htmlFor="db-user" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.database.user')}</label>
                                <input type="text" id="db-user" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" defaultValue="admin" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="db-password" className="block text-sm font-medium text-gray-700 mb-1">{t('pages.configuration.database.password')}</label>
                                <input type="password" id="db-password" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" placeholder="••••••••" />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3">
                                {t('pages.configuration.database.testConnection')}
                            </button>
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                {t('pages.configuration.database.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationAdmin;
