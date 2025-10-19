import React, { useState, useEffect, useMemo } from 'react';
import DossiersService from '../../services/DossiersService';
import DossierManagementHeader from './DossierManagement/DossierManagementHeader';
import SearchBar from './DossierManagement/SearchBar';
import DossierList from './DossierManagement/DossierList';
import CrudPanel from './DossierManagement/CrudPanel';
import { Dossier } from '../../types/Dossier';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newDossier' | 'viewDossier' | 'editDossier' | 'deleteDossier';

const DossierManagement: React.FC = () => {
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchDossiers = async () => {
        try {
            setLoading(true);
            const data = await DossiersService.getDossiers();
            setDossiers(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setDossiers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDossiers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectDossier = (dossier: Dossier) => {
        setSelectedDossier(dossier);
        setPanelState('viewDossier');
    };
    
    const handleAddNew = () => {
        setSelectedDossier(null);
        setPanelState('newDossier');
    };

    const handleEdit = (dossier: Dossier) => {
        setSelectedDossier(dossier);
        setPanelState('editDossier');
    };
    
    const handleDelete = (dossier: Dossier) => {
        setSelectedDossier(dossier);
        setPanelState('deleteDossier');
    };

    const handleCancel = () => {
        if(panelState === 'editDossier' || panelState === 'deleteDossier') {
            setPanelState('viewDossier');
        } else {
            setSelectedDossier(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (dossierData: Partial<Dossier>) => {
        try {
            let savedDossier: any;
            const isNew = panelState === 'newDossier';
            if (isNew) {
                savedDossier = await DossiersService.createDossier(dossierData);
            } else if(selectedDossier) {
                savedDossier = await DossiersService.updateDossier(selectedDossier.idDossier, dossierData);
            }
            await fetchDossiers(); // Refresh the list
            setToast({ message: `Dossier ${isNew ? 'créé' : 'modifié'} avec succès.`, type: 'success' });
            
            const freshDossiers = await DossiersService.getDossiers();
            const fullSavedDossier = Array.isArray(freshDossiers) ? freshDossiers.find(d => d.idDossier === (savedDossier.idDossier || selectedDossier?.idDossier)) : savedDossier;
            
            setSelectedDossier(fullSavedDossier || null);
            setPanelState('viewDossier');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedDossier) return;
        try {
            await DossiersService.deleteDossier(selectedDossier.idDossier);
            await fetchDossiers();
            setToast({ message: 'Dossier supprimé avec succès.', type: 'success' });
            setSelectedDossier(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredDossiers = useMemo(() => {
        if (!searchTerm) return dossiers;
        return dossiers.filter(dossier =>
            dossier.numDossier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dossier.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dossier.atelier?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [dossiers, searchTerm]);

    const paginatedDossiers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDossiers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredDossiers, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <DossierManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des dossiers...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                         <div className="overflow-y-auto flex-1">
                            <DossierList 
                                dossiers={paginatedDossiers} 
                                selectedDossier={selectedDossier}
                                onSelectDossier={handleSelectDossier}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredDossiers.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
            
            <CrudPanel
                panelState={panelState}
                dossier={selectedDossier}
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

export default DossierManagement;