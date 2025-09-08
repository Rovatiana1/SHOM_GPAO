// components/Layout/SidebarItem.tsx
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../../context/AppContext";
import { MenuItem } from "../../../../types/Menu";
import { useTranslation } from "react-i18next";

interface SidebarItemProps {
  item: MenuItem;
  isOpen: boolean; // sous-menu ouvert ?
  toggleSubMenu: (title: string) => void; // fonction pour ouvrir/fermer
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isOpen, toggleSubMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, setCollapsed, setTitlePage } = useAppContext();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;
  const hasSubMenu = !!(item.items && item.items.length > 0);

  useEffect(() => {
    if (location.pathname == "/") {
      setTitlePage(t("menu.dashboard"))
    } else {
      if (hasSubMenu) {
        const currentItem = item.items?.find(subItem => subItem.to === location.pathname);
        if (currentItem) {
          setTitlePage(t(currentItem.titlePage));
        }
      } else if (item.to === location.pathname) {
        setTitlePage(t(item.titlePage));
      }
    }
  }, [location, t, hasSubMenu, item, setTitlePage])

  const handleClick = () => {
    setTitlePage(t(item.titlePage));

    if (hasSubMenu) {
      if (collapsed) {
        setCollapsed(false);
        toggleSubMenu(item.title);
      } else {
        toggleSubMenu(item.title);
      }
    } else if (item.to) {
      navigate(item.to);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const translatedTitle = t(item.title);

  return (
    <div>
      {/* Bouton principal */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`group flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-3 rounded-md cursor-pointer transition-colors 
          ${isActive(item.to || "") ? "bg-green-100 text-green-600" : "hover:bg-gray-100 text-gray-700"}`}
      >
        {/* Icône + tooltip */}
        <div className="relative flex items-center">
          <i
            className={`${item.icon} text-lg ${isActive(item.to || "") ? "text-green-600" : "text-gray-600"
              }`}
          />
          {collapsed && (
            <span
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                bg-gray-800 text-white text-[11px] leading-none px-2 py-1 rounded-md shadow
                opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap"
            >
              {translatedTitle}
            </span>
          )}
          {!collapsed && <span className="w-3" />}
        </div>

        {/* Titre si non-collapsed */}
        {!collapsed && (
          item.to && !hasSubMenu
            ? <Link to={item.to} className="flex-1 font-bold">{translatedTitle}</Link>
            : <span className="flex-1 font-bold">{translatedTitle}</span>
        )}

        {/* Chevron si sous-menu */}
        {hasSubMenu && !collapsed && (
          <i className={`fas fa-chevron-${isOpen ? "down" : "right"} text-gray-500 text-sm`} />
        )}
      </div>

      {/* Sous-menu */}
      {hasSubMenu && isOpen && !collapsed && (
        <div className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {item.items!.map((subItem) => (
            <Link
              key={subItem.to}
              to={subItem.to!}
              onClick={() => setTitlePage(t(subItem.titlePage))}
              className={`block px-3 py-2 font-bold rounded-md text-sm transition-colors 
                ${isActive(subItem.to!) ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <i className={`${subItem.icon} mr-2 text-base`} />
              {t(subItem.title)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
