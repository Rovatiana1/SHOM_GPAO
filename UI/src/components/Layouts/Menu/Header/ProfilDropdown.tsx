import React from "react";
import { useTranslation } from "react-i18next";
import { FaUser, FaCog, FaSignOutAlt, FaPalette, FaBell } from "react-icons/fa";
import Dropdown from "../../../../shared/Dropdown";

const ProfilDropdown: React.FC = () => {
  const { t } = useTranslation();
  const handleLogout = () => console.log("Déconnexion...");
  const handlePersonalization = (option: string) => console.log("Option:", option);

  return (
    <Dropdown
      button={
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <FaUser className="text-green-600" />
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700">Admin</span>
        </div>
      }
      width="14rem"
      className="rounded-lg"
      showIcon
    >
      {/* Profil */}
      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded">
        <FaUser /> {t('header.profile')}
      </button>

      {/* Paramètres */}
      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded">
        <FaCog /> {t('header.settings')}
      </button>

      {/* Section Personnalisation */}
      <div className="border-t my-2"></div>
      <span className="px-4 py-1 text-xs text-gray-500 uppercase">{t('header.personalization')}</span>
      <button
        onClick={() => handlePersonalization("theme")}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded"
      >
        <FaPalette /> {t('header.theme')}
      </button>
      <button
        onClick={() => handlePersonalization("notifications")}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded"
      >
        <FaBell /> {t('header.notifications')}
      </button>

      {/* Déconnexion */}
      <div className="border-t my-2"></div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition rounded"
      >
        <FaSignOutAlt /> {t('header.logout')}
      </button>
    </Dropdown>
  );
};

export default ProfilDropdown;
