import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locale/en/translation';
import translationFR from './locale/fr/translation';

// Définition du type pour les ressources
const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
} as const; 

i18n
  .use(LanguageDetector) // détecte la langue automatiquement
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // langue par défaut
    interpolation: {
      escapeValue: false, // React échappe déjà par défaut
    },
    detection: {
      // Config optionnelle pour LanguageDetector
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
