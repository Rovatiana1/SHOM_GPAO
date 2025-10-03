
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProfilDropdown from './ProfilDropdown';
import MenuItem from './MenuItem';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { User } from '../../../types/Users';
import { getFilteredMenu } from '../../../config/menu/menuConfig';
import i18n from '../../../i18n';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { completeAndMoveToNextStep, getAndStartNextLot, pauseCurrentLot } from '../../../store/slices/processSlice';
import PauseModal from '../../../components/Process/PauseModal';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const Header: React.FC<{ user: User }> = ({ user }) => {
  const { collapsed } = useAppContext();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const filteredMenu = getFilteredMenu(user);

  const { isProcessing, startTime, currentLot, loading: processLoading } = useSelector((state: RootState) => state.process);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPauseModalOpen, setPauseModalOpen] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isProcessing && startTime) {
      const calculateElapsed = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed > 0 ? elapsed : 0);
      };
      calculateElapsed();
      interval = setInterval(calculateElapsed, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, startTime]);

  const handleSelectPauseReason = (reason: { id: number, label: string }) => {
    dispatch(pauseCurrentLot(reason));
    setPauseModalOpen(false);
  };

  const handlePauseClick = () => {
    if (isProcessing) {
      setPauseModalOpen(true);
    }
  };

  const [language] = useState<string>(localStorage.getItem('app_language') || 'fr');

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const handleGetAndStartNextLot = () => {
    dispatch(getAndStartNextLot());
  };

  const handleCompleteAndMoveToNextStep = () => {
    dispatch(completeAndMoveToNextStep());
  };


  const getTreatmentType = (idEtape: number) => {
    switch (idEtape) {
      case 4674:
        return 'CQ cible';
      case 4688:
        return 'CQ ISO';
      default:
        return null;
    }
  };

  const treatmentType = getTreatmentType(user.idEtape);

  return (
    <>
      <header className="bg-white border-b border-gray-200 z-20">
        <div className="flex items-center justify-between px-4 py-3 max-w-[80vw] mx-auto">
          <div className='flex justify-center items-center gap-4'>
            {/* <div className={`flex-shrink-0 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
              <Link to="/" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center">
                  <i className={`fas fa-database text-white text-lg`}></i>
                </div>
                {!collapsed && <span className="font-bold text-gray-800">GPAO</span>}
              </Link>
            </div>
            <div className="text-black">/</div> */}

            {treatmentType && (
              <span className="bg-indigo-100 text-indigo-800 text-lg font-bold px-2.5 py-0.5 rounded-lg">{treatmentType}</span>
            )}
            {/* <nav className="flex-1 overflow-y-auto px-2 space-y-2">
              <div className='flex items-center gap-1 justify-center text-xs font-bold'>
                {filteredMenu.map((section) => (
                  <div key={section.title}>
                    {section.items.map((item) => (
                      <MenuItem key={item.title} item={item} />
                    ))}
                  </div>
                ))}
              </div>
            </nav> */}
          </div>
          <div className="flex items-center space-x-4">
            {currentLot && (
              <div className="flex items-center gap-2">
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md text-gray-700 text-center">
                  {currentLot && currentLot.libelle}
                </div>
                {/* <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md text-gray-700 w-24 text-center">
                  {formatTime(elapsedTime)}
                </div> */}
                <button
                  type="button"
                  onClick={handlePauseClick}
                  disabled={processLoading || !isProcessing}
                  className={`relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed
                    bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400
                  `}
                >
                  <div className='flex items-center gap-2'>
                    <i className="fas fa-pause"></i> {t('header.pause')}
                  </div>
                </button>
              </div>
            )}

            <div className="flex items-center gap-4">
              {!currentLot ? (
                <button
                  onClick={handleGetAndStartNextLot}
                  disabled={processLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  <i className={`fas ${processLoading ? 'fa-spinner fa-spin' : 'fa-play'} mr-2`}></i>
                  {processLoading ? t('pages.process.loadingLot') : t('pages.process.startNextLot')}
                </button>
              ) : (
                <button
                  onClick={handleCompleteAndMoveToNextStep}
                  disabled={processLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  <i className={`fas ${processLoading ? 'fa-spinner fa-spin' : 'fa-check-double'} mr-2`}></i>
                  {t('pages.process.completeAndContinue')}
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200"></div>
            <ProfilDropdown />
          </div>
        </div>
      </header>
      <PauseModal
        isOpen={isPauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        onSelectReason={handleSelectPauseReason}
      />
    </>
  );
};

export default Header;

