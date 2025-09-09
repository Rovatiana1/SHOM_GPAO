

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
import ProcessAdmin from '../../components/Process/ProcessAdmin';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

const Process: React.FC = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('common.unconnected')}</div>;
  }

  return (
    <SocketProvider>
      <DashboardLayout user={user}>
        <Outlet />
      </DashboardLayout>
    </SocketProvider>
  );
};

export default Process;
