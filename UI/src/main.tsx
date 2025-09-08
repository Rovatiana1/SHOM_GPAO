import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import './i18n'; // Import i18n configuration

// Vérifie que l'élément existe avant de créer la racine
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppProvider>
    </React.StrictMode>
  );
}

// Active le service worker pour permettre l'installation
serviceWorkerRegistration.register();
