import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Définition du type du composant
const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-green-800 text-white px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">{t('pages.notFound.title')}</h2>
        <p className="text-lg mb-6">
          {t('pages.notFound.message')}
        </p>
        <Link
          to="/"
          className="inline-block bg-white text-green-700 hover:bg-green-100 px-6 py-3 rounded-full font-semibold transition duration-300"
        >
          {t('pages.notFound.goHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
