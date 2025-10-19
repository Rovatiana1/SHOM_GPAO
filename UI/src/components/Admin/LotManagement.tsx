import React, { useState, useEffect, useMemo } from 'react';
import LotService from '../../services/LotService';
import LotManagementHeader from './LotManagement/LotManagementHeader';
import SearchBar from './LotManagement/SearchBar';
import LotList from './LotManagement/LotList';
import CrudPanel from './LotManagement/CrudPanel';
import { Lot } from '../../types/Lot';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newLot' | 'viewLot' | 'editLot' | 'deleteLot';

const LotManagement: React.FC = () => {
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchLots = async () => {
        try {
            setLoading(true);
            const data = await LotService.getLots();
            setLots(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setLots([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLots();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectLot = (lot: Lot) => {
        setSelectedLot(lot);
        setPanelState('viewLot');
    };
    
    const handleAddNew = () => {
        setSelectedLot(null);
        setPanelState('newLot');
    };

    const handleEdit = (lot: Lot) => {
        setSelectedLot(lot);
        setPanelState('editLot');
    };
    
    const handleDelete = (lot: Lot) => {
        setSelectedLot(lot);
        setPanelState('deleteLot');
    };

    const handleCancel = () => {
        if(panelState === 'editLot' || panelState === 'deleteLot') {
            setPanelState('viewLot');
        } else {
            setSelectedLot(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (lotData: Partial<Lot>) => {
        try {
            let savedLot: any;
            const isNew = panelState === 'newLot';
            if (isNew) {
                savedLot = await LotService.createLot(lotData);
            } else if(selectedLot) {
                savedLot = await LotService.updateLot(selectedLot.idLot, lotData);
            }
            await fetchLots();
            setToast({ message: `Lot ${isNew ? 'créé' : 'modifié'} avec succès.`, type: 'success' });
            
            const freshLots = await LotService.getLots();
            const fullSavedLot = Array.isArray(freshLots) ? freshLots.find(l => l.idLot === (savedLot.idLot || selectedLot?.idLot)) : savedLot;
            
            setSelectedLot(fullSavedLot || null);
            setPanelState('viewLot');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedLot) return;
        try {
            await LotService.deleteLot(selectedLot.idLot);
            await fetchLots();
            setToast({ message: 'Lot supprimé avec succès.', type: 'success' });
            setSelectedLot(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredLots = useMemo(() => {
        if (!searchTerm) return lots;
        return lots.filter(lot =>
            lot.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [lots, searchTerm]);

    const paginatedLots = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLots.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLots, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <LotManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des lots...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <LotList 
                                lots={paginatedLots}
                                selectedLot={selectedLot}
                                onSelectLot={handleSelectLot}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredLots.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
            
            <CrudPanel
                panelState={panelState}
                lot={selectedLot}
                onAddNew={handleAddNew}
                onCancel={handleCancel}
                onSave={handleSave}
                onDelete={handleConfirmDelete}
                onEdit={handleEdit}
                onConfirmDelete={handleDelete}
            />
        </div>
    );
};

export default LotManagement;
