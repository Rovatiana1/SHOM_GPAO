
// pages/Dashboard.tsx
import React from 'react';

// Composants de contenu spécifiques aux rôles
import DashboardLayout from '../../layouts/Dashboard/DashboardLayout';
// import DashboardAdmin from '../../components/Dashboard/DashboardAdmin';
// import DashboardCoach from '../../components/Dashboard/DashboardCoach';
// import DashboardManager from '../../components/Dashboard/DashboardManager';
// import DashboardStudent from '../../components/Dashboard/DashboardStudent';
import { SocketProvider } from '../../context/SocketContext';
import { useAuthContext } from '../../context/AuthContext';
import ConfigurationAdmin from '../../components/Configuration/ConfigurationAdmin';
import { useTranslation } from 'react-i18next';

const Configuration: React.FC = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('common.unconnected')}</div>;
  }

  const getDashboardContent = () => {
    return <ConfigurationAdmin />;
  };

  return (
    <SocketProvider>
      <DashboardLayout user={user}>
        {getDashboardContent()}
      </DashboardLayout>
    </SocketProvider>
  );
};

export default Configuration;
