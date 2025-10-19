import React, { useState, useEffect, useMemo } from 'react';
import LotClientService from '../../services/LotClientService';
import LotClientManagementHeader from './LotClientManagement/LotClientManagementHeader';
import SearchBar from './LotClientManagement/SearchBar';
import LotClientList from './LotClientManagement/LotClientList';
import CrudPanel from './LotClientManagement/CrudPanel';
import { LotClient } from '../../types/LotClient';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newLotClient' | 'viewLotClient' | 'editLotClient' | 'deleteLotClient';

const LotClientManagement: React.FC = () => {
    const [lotClients, setLotClients] = useState<LotClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedLotClient, setSelectedLotClient] = useState<LotClient | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchLotClients = async () => {
        try {
            setLoading(true);
            const data = await LotClientService.getLotClients();
            setLotClients(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setLotClients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLotClients();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectLotClient = (lotClient: LotClient) => {
        setSelectedLotClient(lotClient);
        setPanelState('viewLotClient');
    };

    const handleAddNew = () => {
        setSelectedLotClient(null);
        setPanelState('newLotClient');
    };

    const handleEdit = (lotClient: LotClient) => {
        setSelectedLotClient(lotClient);
        setPanelState('editLotClient');
    };

    const handleDelete = (lotClient: LotClient) => {
        setSelectedLotClient(lotClient);
        setPanelState('deleteLotClient');
    };

    const handleCancel = () => {
        if (panelState === 'editLotClient' || panelState === 'deleteLotClient') {
            setPanelState('viewLotClient');
        } else {
            setSelectedLotClient(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (lotClientData: Partial<LotClient>) => {
        try {
            let savedLotClient: any;
            const isNew = panelState === 'newLotClient';
            console.log("lotClientData ==> ", lotClientData)
            if (isNew) {
                savedLotClient = await LotClientService.createLotClient(lotClientData);
            } else if (selectedLotClient) {
                savedLotClient = await LotClientService.updateLotClient(selectedLotClient.idLotClient, lotClientData);
            }
            await fetchLotClients();
            setToast({ message: `Lot Client ${isNew ? 'créé' : 'modifié'} avec succès.`, type: 'success' });

            const freshLotClients = await LotClientService.getLotClients();
            const fullSavedLotClient = Array.isArray(freshLotClients) ? freshLotClients.find(lc => lc.idLotClient === (savedLotClient.idLotClient || selectedLotClient?.idLotClient)) : savedLotClient;

            setSelectedLotClient(fullSavedLotClient || null);
            setPanelState('viewLotClient');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedLotClient) return;
        try {
            await LotClientService.deleteLotClient(selectedLotClient.idLotClient);
            await fetchLotClients();
            setToast({ message: 'Lot Client supprimé avec succès.', type: 'success' });
            setSelectedLotClient(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredLotClients = useMemo(() => {
        if (!searchTerm) return lotClients;
        return lotClients.filter(lotClient =>
            lotClient.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [lotClients, searchTerm]);

    const paginatedLotClients = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLotClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLotClients, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <LotClientManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des lots client...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <LotClientList
                                lotClients={paginatedLotClients}
                                selectedLotClient={selectedLotClient}
                                onSelectLotClient={handleSelectLotClient}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredLotClients.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <CrudPanel
                panelState={panelState}
                lotClient={selectedLotClient}
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

export default LotClientManagement;
