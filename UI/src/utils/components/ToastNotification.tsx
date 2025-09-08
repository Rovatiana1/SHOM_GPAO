import { JSX, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import React from 'react';

// Types pour le toast
type ToastType = 'success' | 'error' | 'info';

interface ToastNotificationProps {
  message: string | object;
  onClose: () => void;
  type?: ToastType;
}

// Icônes typées
const icons: Record<ToastType, JSX.Element> = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-400',
  error: 'bg-red-50 border-red-400',
  info: 'bg-blue-50 border-blue-400',
};

const textColors: Record<ToastType, string> = {
  success: 'text-green-700',
  error: 'text-red-700',
  info: 'text-blue-700',
};

// Fonction utilitaire pour vérifier si une chaîne est JSON
function isJsonString(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object';
  } catch {
    return false;
  }
}

// Composant principal
const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose, type = 'info' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // 10 secondes

    return () => clearTimeout(timer);
  }, [onClose]);

  const renderMessage = () => {
    if (typeof message === 'object') {
      return (
        <pre className="text-xs text-gray-800 bg-white p-2 rounded-md overflow-x-auto">
          {JSON.stringify(message, null, 2)}
        </pre>
      );
    }

    if (typeof message === 'string' && isJsonString(message)) {
      const parsed = JSON.parse(message);
      return (
        <pre className="text-xs text-gray-800 bg-white p-2 rounded-md overflow-x-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    }

    return <p className={`text-sm ${textColors[type]}`}>{message}</p>;
  };

  return (
    <div className="fixed top-4 right-4 z-30 animate-slide-in">
      <div className={`max-w-sm w-full border-l-4 shadow-lg rounded-md p-4 ${bgColors[type]}`}>
        <div className="flex items-start space-x-3">
          <div>{icons[type]}</div>
          <div className="flex-1">{renderMessage()}</div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
