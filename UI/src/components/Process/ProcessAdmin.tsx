import React from 'react';
import { useTranslation } from 'react-i18next';
import ToastNotification from '../../utils/components/ToastNotification';
import CQ from './CQ/CQ';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAndStartNextLot, completeAndMoveToNextStep, clearError } from '../../store/slices/processSlice';

const ProcessAdmin: React.FC = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const { currentLot, loading, error } = useSelector((state: RootState) => state.process);

    const handleGetAndStartNextLot = () => {
        dispatch(getAndStartNextLot());
    };

    const handleCompleteAndMoveToNextStep = () => {
        dispatch(completeAndMoveToNextStep());
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    return (
        <div id="traitement-page">
            {error && <ToastNotification message={error} onClose={handleClearError} type="error" />}

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('pages.process.title')}</h1>
                    <p className="text-gray-600">{t('pages.process.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    {!currentLot ? (
                        <button 
                            onClick={handleGetAndStartNextLot} 
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'} mr-2`}></i>
                            {loading ? t('pages.process.loadingLot') : t('pages.process.startNextLot')}
                        </button>
                    ) : (
                        <button 
                            onClick={handleCompleteAndMoveToNextStep}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                             <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-check-double'} mr-2`}></i>
                            {t('pages.process.completeAndContinue')}
                        </button>
                    )}
                </div>
            </div>
            <CQ />
        </div>
    );
};

export default ProcessAdmin;
