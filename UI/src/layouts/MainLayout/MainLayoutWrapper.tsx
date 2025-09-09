// components/Layouts/MainLayout/MainLayoutWrapper.tsx
import React from "react";
import MainLayout from "./MainLayout";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../context/AuthContext";
import ProtectedRoute from "../../routes/ProtectedRoute";

const MainLayoutWrapper: React.FC = () => {
  const { user, loading } = useAuthContext();
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('common.unauthenticated')}</div>; // Ou redirection
  }

  return (
    <ProtectedRoute>
      <MainLayout user={user} />
    </ProtectedRoute>
  );
};

export default MainLayoutWrapper;
