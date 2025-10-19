import React, { useState, useEffect, useMemo } from 'react';
import EtapeService from '../../services/EtapeService';
import EtapeManagementHeader from './EtapeManagement/EtapeManagementHeader';
import SearchBar from './EtapeManagement/SearchBar';
import EtapeList from './EtapeManagement/EtapeList';
import CrudPanel from './EtapeManagement/CrudPanel';
import { Etape } from '../../types/Etape';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newEtape' | 'viewEtape' | 'editEtape' | 'deleteEtape';

const EtapeManagement: React.FC = () => {
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedEtape, setSelectedEtape] = useState<Etape | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchEtapes = async () => {
        try {
            setLoading(true);
            const data = await EtapeService.getEtapes();
            setEtapes(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setEtapes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEtapes();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectEtape = (etape: Etape) => {
        setSelectedEtape(etape);
        setPanelState('viewEtape');
    };
    
    const handleAddNew = () => {
        setSelectedEtape(null);
        setPanelState('newEtape');
    };

    const handleEdit = (etape: Etape) => {
        setSelectedEtape(etape);
        setPanelState('editEtape');
    };
    
    const handleDelete = (etape: Etape) => {
        setSelectedEtape(etape);
        setPanelState('deleteEtape');
    };

    const handleCancel = () => {
        if(panelState === 'editEtape' || panelState === 'deleteEtape') {
            setPanelState('viewEtape');
        } else {
            setSelectedEtape(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (etapeData: Partial<Etape>) => {
        try {
            let savedEtape: any;
            const isNew = panelState === 'newEtape';
            if (isNew) {
                savedEtape = await EtapeService.createEtape(etapeData);
            } else if(selectedEtape) {
                savedEtape = await EtapeService.updateEtape(selectedEtape.idEtape, etapeData);
            }
            await fetchEtapes();
            setToast({ message: `Étape ${isNew ? 'créée' : 'modifiée'} avec succès.`, type: 'success' });
            
            const freshEtapes = await EtapeService.getEtapes();
            const fullSavedEtape = Array.isArray(freshEtapes) ? freshEtapes.find(e => e.idEtape === (savedEtape.idEtape || selectedEtape?.idEtape)) : savedEtape;
            
            setSelectedEtape(fullSavedEtape || null);
            setPanelState('viewEtape');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedEtape) return;
        try {
            await EtapeService.deleteEtape(selectedEtape.idEtape);
            await fetchEtapes();
            setToast({ message: 'Étape supprimée avec succès.', type: 'success' });
            setSelectedEtape(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredEtapes = useMemo(() => {
        if (!searchTerm) return etapes;
        return etapes.filter(etape =>
            etape.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            etape.parentEtape?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [etapes, searchTerm]);

    const paginatedEtapes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEtapes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEtapes, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <EtapeManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des étapes...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                         <div className="overflow-y-auto flex-1">
                            <EtapeList 
                                etapes={paginatedEtapes} 
                                selectedEtape={selectedEtape}
                                onSelectEtape={handleSelectEtape}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredEtapes.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
            
            <CrudPanel
                panelState={panelState}
                etape={selectedEtape}
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

export default EtapeManagement;