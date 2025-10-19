import React, { useState, useEffect, useMemo } from 'react';
import EtatService from '../../services/EtatService';
import EtatManagementHeader from './EtatManagement/EtatManagementHeader';
import SearchBar from './EtatManagement/SearchBar';
import EtatList from './EtatManagement/EtatList';
import CrudPanel from './EtatManagement/CrudPanel';
import { Etat } from '../../types/Etat';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newEtat' | 'viewEtat' | 'editEtat' | 'deleteEtat';

const EtatManagement: React.FC = () => {
    const [etats, setEtats] = useState<Etat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedEtat, setSelectedEtat] = useState<Etat | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchEtats = async () => {
        try {
            setLoading(true);
            const data = await EtatService.getEtats();
            setEtats(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setEtats([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEtats();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectEtat = (etat: Etat) => {
        setSelectedEtat(etat);
        setPanelState('viewEtat');
    };
    
    const handleAddNew = () => {
        setSelectedEtat(null);
        setPanelState('newEtat');
    };

    const handleEdit = (etat: Etat) => {
        setSelectedEtat(etat);
        setPanelState('editEtat');
    };
    
    const handleDelete = (etat: Etat) => {
        setSelectedEtat(etat);
        setPanelState('deleteEtat');
    };

    const handleCancel = () => {
        if(panelState === 'editEtat' || panelState === 'deleteEtat') {
            setPanelState('viewEtat');
        } else {
            setSelectedEtat(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (etatData: Partial<Etat>) => {
        try {
            let savedEtat: any;
            const isNew = panelState === 'newEtat';
            if (isNew) {
                savedEtat = await EtatService.createEtat(etatData);
            } else if(selectedEtat) {
                savedEtat = await EtatService.updateEtat(selectedEtat.idEtat, etatData);
            }
            await fetchEtats();
            setToast({ message: `État ${isNew ? 'créé' : 'modifié'} avec succès.`, type: 'success' });
            
            const freshEtats = await EtatService.getEtats();
            const fullSavedEtat = Array.isArray(freshEtats) ? freshEtats.find(e => e.idEtat === (savedEtat.idEtat || selectedEtat?.idEtat)) : savedEtat;

            setSelectedEtat(fullSavedEtat || null);
            setPanelState('viewEtat');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedEtat) return;
        try {
            await EtatService.deleteEtat(selectedEtat.idEtat);
            await fetchEtats();
            setToast({ message: 'État supprimé avec succès.', type: 'success' });
            setSelectedEtat(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredEtats = useMemo(() => {
        if (!searchTerm) return etats;
        return etats.filter(etat =>
            etat.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [etats, searchTerm]);

    const paginatedEtats = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEtats.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEtats, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <EtatManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des états...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                         <div className="overflow-y-auto flex-1">
                            <EtatList 
                                etats={paginatedEtats} 
                                selectedEtat={selectedEtat}
                                onSelectEtat={handleSelectEtat}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredEtats.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
            
            <CrudPanel
                panelState={panelState}
                etat={selectedEtat}
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

export default EtatManagement;