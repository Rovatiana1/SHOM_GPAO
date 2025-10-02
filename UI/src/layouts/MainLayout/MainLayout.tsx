import React from 'react';
import Header from '../Menu/Header/Header';
import Sidebar from '../Menu/Sidebar/Sidebar';
import { useLocation, Outlet } from 'react-router-dom';
import { User } from '../../types/Users';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import PausedOverlay from '../../components/Process/PausedOverlay';
import { resumeCurrentLot } from '../../store/slices/processSlice';

const MainLayout: React.FC<{ user: User }> = ({ user }) => {
  const location = useLocation();
  const showSidebar = location.pathname.startsWith('/');
  const dispatch: AppDispatch = useDispatch();

  const { isProcessing, currentLot, pauseReason } = useSelector((state: RootState) => state.process);
  const isPaused = !isProcessing && !!currentLot;

  const handleResume = () => {
    dispatch(resumeCurrentLot());
  };

  return (
    <div className="flex flex-col h-screen">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden bg-gray-100 text-black">
        {showSidebar && <Sidebar user={user} />}
        <div
          className={`flex-1 flex flex-col overflow-y-auto p-2 ${showSidebar ? 'ml-0' : 'mx-auto max-w-7xl'
            }`}
        >
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      {isPaused && <PausedOverlay onResume={handleResume} reason={pauseReason} />}
    </div>
  );
};

export default MainLayout;