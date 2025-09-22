import React from "react";
import { useTranslation } from "react-i18next";
import { FaCog, FaSignOutAlt, FaPalette, FaBell } from "react-icons/fa";
import Dropdown from "../../../shared/Dropdown";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePersonalization = (option: string) => console.log("Option:", option);

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    const nameParts = name.trim().split(' ').filter(part => part);
    if (nameParts.length === 0) return "?";
    
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? (nameParts[nameParts.length - 1]?.[0] || '') : '';
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const initials = getInitials(user?.userName);

  return (
    <Dropdown
      button={
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-sm font-bold text-green-600">{initials}</span>
          </div>
        </div>
      }
      width="16rem"
      className="rounded-lg"
      showIcon
    >
      {/* User Info Header */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800 truncate" title={user.userName}>{user.userName}</p>
            <p className="text-xs text-gray-500">{user.roles.join(', ')}</p>
        </div>
      )}

      {/* Settings */}
      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded mt-1">
        <FaCog /> {t('header.settings')}
      </button>

      {/* Section Personalization */}
      <div className="border-t my-2 mx-4"></div>
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

      {/* Logout */}
      <div className="border-t my-2 mx-4"></div>
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