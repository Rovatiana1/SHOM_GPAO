

// // pages/Dashboard.tsx
// import React from 'react';

// // Composants de contenu spécifiques aux rôles
// import DashboardLayout from '../../layouts/Dashboard/DashboardLayout';
// import { useAuthContext } from '../../context/AuthContext';
// import ProcessAdmin from '../../components/Process/ProcessAdmin';
// import { useTranslation } from 'react-i18next';
// import { Outlet } from 'react-router-dom';

// const Process: React.FC = () => {
//   const { user } = useAuthContext();
//   const { t } = useTranslation();

//   if (!user) {
//     return <div>{t('common.unconnected')}</div>;
//   }

//   return (
//     <DashboardLayout user={user}>
//       <Outlet />
//     </DashboardLayout>
//   );
// };

// export default Process;




// pages/Dashboard.tsx
import React from 'react';

// Composants de contenu spécifiques aux rôles
import DashboardLayout from '../../layouts/Dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

const Process: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('common.unconnected')}</div>;
  }

  return (
    <DashboardLayout user={user}>
      <Outlet />
    </DashboardLayout>
  );
};

export default Process;
