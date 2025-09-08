import React from 'react';
import { useTranslation } from 'react-i18next';
import { LotStatus } from '../../types';

interface StatusBadgeProps {
    status: LotStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const { t } = useTranslation();

    const statusConfig = {
        [LotStatus.EnCours]: { text: t('status.inProgress'), className: 'status-en-cours' },
        [LotStatus.Termine]: { text: t('status.completed'), className: 'status-termine' },
        [LotStatus.EnAttente]: { text: t('status.pending'), className: 'status-en-attente' },
        [LotStatus.Erreur]: { text: t('status.error'), className: 'status-erreur' },
    };

    const { text, className } = statusConfig[status];
    return <span className={`status-badge ${className}`}>{text}</span>;
};

export default StatusBadge;
