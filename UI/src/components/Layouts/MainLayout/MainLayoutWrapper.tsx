// components/Layouts/MainLayout/MainLayoutWrapper.tsx
import React from "react";
import MainLayout from "./MainLayout";
import ProtectedRoute from "../../../routes/ProtectedRoute";
import { useAuthContext } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

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
