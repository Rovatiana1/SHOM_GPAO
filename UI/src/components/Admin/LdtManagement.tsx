import React, { useState, useEffect, useMemo } from 'react';
import LdtService from '../../services/LdtService';
import LdtManagementHeader from './LdtManagement/LdtManagementHeader';
import SearchBar from './LdtManagement/SearchBar';
import LdtList from './LdtManagement/LdtList';
import CrudPanel from './LdtManagement/CrudPanel';
import { Ldt } from '../../types/Ldt';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newLdt' | 'viewLdt' | 'editLdt' | 'deleteLdt';

const LdtManagement: React.FC = () => {
    const [ldts, setLdts] = useState<Ldt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedLdt, setSelectedLdt] = useState<Ldt | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchLdts = async () => {
        try {
            setLoading(true);
            const data = await LdtService.getLdts();
            setLdts(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setLdts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLdts();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
    
    const handleSelectLdt = (ldt: Ldt) => {
        setSelectedLdt(ldt);
        setPanelState('viewLdt');
    };

    const handleAddNew = () => {
        setSelectedLdt(null);
        setPanelState('newLdt');
    };

    const handleEdit = (ldt: Ldt) => {
        setSelectedLdt(ldt);
        setPanelState('editLdt');
    };
    
    const handleDelete = (ldt: Ldt) => {
        setSelectedLdt(ldt);
        setPanelState('deleteLdt');
    };

    const handleCancel = () => {
        if(panelState === 'editLdt' || panelState === 'deleteLdt') {
            setPanelState('viewLdt');
        } else {
            setSelectedLdt(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (ldtData: Partial<Ldt>) => {
        try {
            let savedLdt: any;
            const isNew = panelState === 'newLdt';
            if (isNew) {
                savedLdt = await LdtService.createLdt(ldtData);
            } else if(selectedLdt) {
                savedLdt = await LdtService.updateLdt(selectedLdt.idLdt, ldtData);
            }
            await fetchLdts();
            setToast({ message: `Ligne de temps ${isNew ? 'créée' : 'modifiée'} avec succès.`, type: 'success' });
            
            const freshLdts = await LdtService.getLdts();
            const fullSavedLdt = Array.isArray(freshLdts) ? freshLdts.find(l => l.idLdt === (savedLdt.idLdt || selectedLdt?.idLdt)) : savedLdt;
            
            setSelectedLdt(fullSavedLdt || null);
            setPanelState('viewLdt');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedLdt) return;
        try {
            await LdtService.deleteLdt(selectedLdt.idLdt);
            await fetchLdts();
            setToast({ message: 'Ligne de temps supprimée avec succès.', type: 'success' });
            setSelectedLdt(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredLdts = useMemo(() => {
        if (!searchTerm) return ldts;
        return ldts.filter(ldt =>
            ldt.lotLibelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ldt.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ldt.typeLdtLibelle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [ldts, searchTerm]);

    const paginatedLdts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLdts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLdts, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <LdtManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des lignes de temps...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                         <div className="overflow-y-auto flex-1">
                            <LdtList 
                                ldts={paginatedLdts} 
                                selectedLdt={selectedLdt}
                                onSelectLdt={handleSelectLdt}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredLdts.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
            
            <CrudPanel
                panelState={panelState}
                ldt={selectedLdt}
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

export default LdtManagement;