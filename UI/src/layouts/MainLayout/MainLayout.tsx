import React, { useEffect } from 'react';
import Header from '../Menu/Header/Header';
import Sidebar from '../Menu/Sidebar/Sidebar';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { User } from '../../types/Users';

interface MainLayoutProps {
  user: User;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user }) => {
  const location = useLocation();
  const showSidebar = location.pathname.startsWith('/');

  return (
    <div className="flex flex-col h-screen">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden bg-gray-100 text-black">
        {showSidebar && (
          <Sidebar user={user} />
        )}
        <div
          className={`flex-1 flex flex-col overflow-y-auto p-2 ${showSidebar ? 'ml-0' : 'mx-auto max-w-7xl'
            }`}
        >
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
