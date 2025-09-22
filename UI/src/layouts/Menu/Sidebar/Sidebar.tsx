// // components/Layout/Sidebar.tsx
// import React, { useState } from 'react';
// import SidebarItem from './SidebarItem';
// import { useLocation } from 'react-router-dom';
// import { User } from '../../../types/Users';
// import { getFilteredMenu } from '../../../config/menu/menuConfig';
// import { useAppContext } from '../../../context/AppContext';

// interface SidebarProps {
//   user: User;
// }

// const Sidebar: React.FC<SidebarProps> = ({ user }) => {
//   const location = useLocation();
//   const fullMenu = getFilteredMenu(user.roles[0]!);

//   // Find the menu section corresponding to the current path to get its sidebar config
//   const currentSection = fullMenu.find(section =>
//     section.items.some(item => location.pathname.startsWith(item.to || '___'))
//   );

//   const sidebarMenu = currentSection?.sidebar;

//   const { collapsed, toggleCollapsed } = useAppContext();
//   const [openMenus, setOpenMenus] = useState<string[]>([]);

//   const toggleSubMenu = (title: string) => {
//     if (collapsed) return;
//     setOpenMenus((prev) =>
//       prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
//     );
//   };

//   if (!sidebarMenu) {
//     return null; // Don't render a sidebar if no specific config is found
//   }

//   return (
//     <aside
//       className={`relative z-20 h-full overflow-hidden bg-white border-r border-gray-200 shadow-sm transition-all flex flex-col ${collapsed ? "w-22" : "w-60"
//         }`}
//     >
//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto mt-4 px-2 space-y-2">
//         {sidebarMenu.map((section) => (
//           <div key={section.title}>
//             {!collapsed && (
//               <div className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                 {section.title}
//               </div>
//             )}
//             {section.items.map((item) => (
//               <SidebarItem
//                 key={item.title}
//                 item={item}
//                 isOpen={openMenus.includes(item.title)}
//                 toggleSubMenu={toggleSubMenu}
//               />
//             ))}
//           </div>
//         ))}
//       </nav>

//       {/* Footer */}
//       <div className={`flex-shrink-0 border-t border-gray-200 bg-white px-3 py-3 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
//         {!collapsed && (
//           <button
//             className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
//             aria-label="Help"
//           >
//             <i className="fas fa-question-circle text-gray-500 text-lg"></i>
//           </button>
//         )}

//         {/* Bouton collapse */}
//         <button
//           onClick={toggleCollapsed} // utilisation du context
//           className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
//           aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           <i className={`fas fa-chevron-${collapsed ? "right" : "left"} text-gray-600 text-base`}></i>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


// components/Layout/Sidebar.tsx
import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { User } from '../../../types/Users';
import { getFilteredMenu } from '../../../config/menu/menuConfig';
import { useAppContext } from '../../../context/AppContext';

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const fullMenu = getFilteredMenu(user.roles);

  // Find the menu section corresponding to the current path to get its sidebar config
  const currentSection = fullMenu.find(section =>
    section.items.some(item => location.pathname.startsWith(item.to || '___'))
  );

  const sidebarMenu = currentSection?.sidebar;

  const { collapsed, toggleCollapsed } = useAppContext();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleSubMenu = (title: string) => {
    if (collapsed) return;
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  if (!sidebarMenu) {
    return null; // Don't render a sidebar if no specific config is found
  }

  return (
    <aside
      className={`relative z-20 h-full overflow-hidden bg-white border-r border-gray-200 shadow-sm transition-all flex flex-col ${collapsed ? "w-22" : "w-60"
        }`}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2 space-y-2">
        {sidebarMenu.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isOpen={openMenus.includes(item.title)}
                toggleSubMenu={toggleSubMenu}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`flex-shrink-0 border-t border-gray-200 bg-white px-3 py-3 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Help"
          >
            <i className="fas fa-question-circle text-gray-500 text-lg"></i>
          </button>
        )}

        {/* Bouton collapse */}
        <button
          onClick={toggleCollapsed} // utilisation du context
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fas fa-chevron-${collapsed ? "right" : "left"} text-gray-600 text-base`}></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;