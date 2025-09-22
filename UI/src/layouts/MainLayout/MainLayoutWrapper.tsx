// // components/Layouts/MainLayout/MainLayoutWrapper.tsx
// import React from "react";
// import MainLayout from "./MainLayout";
// import { useTranslation } from "react-i18next";
// import { useAuthContext } from "../../context/AuthContext";
// import ProtectedRoute from "../../routes/ProtectedRoute";

// const MainLayoutWrapper: React.FC = () => {
//   const { user, loading } = useAuthContext();
//   const { t } = useTranslation();

//   if (!user) {
//     return <div>{t('common.unauthenticated')}</div>; // Ou redirection
//   }

//   return (
//     <ProtectedRoute>
//       <MainLayout user={user} />
//     </ProtectedRoute>
//   );
// };

// export default MainLayoutWrapper;


// components/Layouts/MainLayout/MainLayoutWrapper.tsx
import React from "react";
import MainLayout from "./MainLayout";
import { useAuthContext } from "../../context/AuthContext";

const MainLayoutWrapper: React.FC = () => {
  const { user } = useAuthContext();

  // The parent ProtectedRoute ensures user is not null here.
  // This is a type guard for TypeScript and a safeguard.
  if (!user) {
    return null; 
  }

  return <MainLayout user={user} />;
};

export default MainLayoutWrapper;
