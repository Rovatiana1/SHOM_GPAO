import React, { useEffect } from 'react';
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

    // 🔹 Reset loading au montage
    useEffect(() => {
        dispatch(clearError());
        // Si nécessaire, tu pourrais créer une action `resetProcess` dans ton slice
        // pour tout remettre à zéro, y compris loading.
    }, [dispatch]);

    const handleClearError = () => {
        dispatch(clearError());
    };

    return (
        <div id="traitement-page">
            {error && <ToastNotification message={error} onClose={handleClearError} type="error" />}
            <CQ />
        </div>
    );
};

export default ProcessAdmin;
