// components/Layout/Header.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProfilDropdown from './ProfilDropdown';
import MenuItem from './MenuItem';
import LanguageDropdown from './LanguageDropdown';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { User } from '../../../types/Users';
import { getFilteredMenu } from '../../../config/menu/menuConfig';
import i18n from '../../../i18n';
interface HeaderProps {
  user: User;
}


const Header: React.FC<HeaderProps> = ({ user }) => {
  const { collapsed } = useAppContext();
  const { t } = useTranslation();
  const filteredMenu = getFilteredMenu(user.role);
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Récupérer la langue du localStorage ou fallback à 'fr'
  const [language, setLanguage] = useState<string>(
    localStorage.getItem('app_language') || 'fr'
  );

  useEffect(() => {
    i18n.changeLanguage(language); // Met à jour la langue à chaque changement
  }, [language]);

  return (

    <header className="bg-white border-b border-gray-200 z-20">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className='flex justify-center items-center gap-4'>
          {/* Header */}
          <div className={`flex-shrink-0 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
            <Link to="/" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center">
                <i className={`fas fa-database text-white text-lg`}></i>
              </div>
              {!collapsed && <span className="font-bold text-gray-800">GPAO</span>}
            </Link>
          </div>

          <div className="text-black">/</div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-2">
            <div className='flex items-center gap-1 justify-center text-xs font-bold'>
              {filteredMenu.map((section) => (
                <div key={section.title}>
                  {section.items.map((item) => (
                    <MenuItem
                      key={item.title}
                      item={item}
                    />
                  ))}
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex items-center space-x-4">

          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={togglePause}
              className={`relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isPaused
                ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
            >
              {isPaused ? (
                <div className='flex items-center gap-2'>
                  <i className="fas fa-play"></i> {t('header.resume')}
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <i className="fas fa-pause"></i> {t('header.pause')}
                </div>
              )}
            </button>
          </div>

          {/* <LanguageDropdown /> */}
          <div className="w-px h-6 bg-gray-200"></div>
          <ProfilDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
