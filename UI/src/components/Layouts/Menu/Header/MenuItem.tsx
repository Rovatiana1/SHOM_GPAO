// components/Layout/Topbar/MenuItem.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuItem as MenuItemType } from "../../../../types/Menu";
import { useAppContext } from "../../../../context/AppContext";
import { useTranslation } from "react-i18next";

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTitlePage } = useAppContext();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const hasSubMenu = !!(item.items && item.items.length > 0);
  const isActive = (path: string) => location.pathname === path;

  const handleClick = () => {
    setTitlePage(t(item.titlePage));
    if (!hasSubMenu && item.to) {
      navigate(item.to);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => hasSubMenu && setIsOpen(true)}
      onMouseLeave={() => hasSubMenu && setIsOpen(false)}
    >
      {/* Item principal */}
      <div
        role="button"
        onClick={handleClick}
        className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
          isActive(item.to || "") ? "text-green-600 font-bold" : "text-gray-700 hover:text-green-500"
        }`}
      >
        {/* Icône */}
        <i className={`${item.icon} mr-2 text-lg`} />
        <span>{t(item.title)}</span>
        {/* Chevron si sous-menu */}
        {hasSubMenu && (
          <i className={`fas fa-chevron-down ml-1 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>

      {/* Sous-menu dropdown */}
      {hasSubMenu && isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {item.items!.map((subItem) => (
            <Link
              key={subItem.to}
              to={subItem.to!}
              onClick={() => setTitlePage(t(subItem.titlePage))}
              className={`block px-4 py-2 text-sm transition-colors ${
                isActive(subItem.to!) ? "bg-green-50 text-green-600" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <i className={`${subItem.icon} mr-2`} />
              {t(subItem.title)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
