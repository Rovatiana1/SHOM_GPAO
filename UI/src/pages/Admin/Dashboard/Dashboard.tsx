// pages/Dashboard.tsx
import React from 'react';

// Composants de contenu spécifiques aux rôles
import DashboardLayout from '../../../layouts/Dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import DashboardAdmin from '../../../components/Dashboard/DashboardAdmin';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('common.unconnected')}</div>;
  }

  const getDashboardContent = () => {
    return <DashboardAdmin />;
  };

  return (
      <DashboardLayout user={user}>
        {getDashboardContent()}
      </DashboardLayout>
  );
};

export default Dashboard;
