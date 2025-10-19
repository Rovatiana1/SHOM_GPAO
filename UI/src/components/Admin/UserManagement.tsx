import React, { useState, useEffect, useMemo } from 'react';
import UsersService from '../../services/UsersService';
import UserManagementHeader from './UserManagement/UserManagementHeader';
import SearchBar from './UserManagement/SearchBar';
import UserList from './UserManagement/UserList';
import CrudPanel from './UserManagement/CrudPanel';
import { ManagedUser } from '../../types/Users';
import ToastNotification, { ToastType } from '../../utils/components/ToastNotification';
import Pagination from '../../shared/Pagination';

const ITEMS_PER_PAGE = 10;
type PanelState = 'idle' | 'newUser' | 'viewUser' | 'editUser' | 'deleteUser';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Panel states
    const [panelState, setPanelState] = useState<PanelState>('idle');
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UsersService.getUsers();
            const sortedData = Array.isArray(data) ? data.sort((a, b) => a.nom.localeCompare(b.nom)) : [];
            setUsers(sortedData);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectUser = (user: ManagedUser) => {
        setSelectedUser(user);
        setPanelState('viewUser');
    };
    
    const handleAddNew = () => {
        setSelectedUser(null);
        setPanelState('newUser');
    };

    const handleEdit = (user: ManagedUser) => {
        setSelectedUser(user);
        setPanelState('editUser');
    };
    
    const handleDelete = (user: ManagedUser) => {
        setSelectedUser(user);
        setPanelState('deleteUser');
    };

    const handleCancel = () => {
        if(panelState === 'editUser' || panelState === 'deleteUser') {
            setPanelState('viewUser');
        } else {
            setSelectedUser(null);
            setPanelState('idle');
        }
    };

    const handleSave = async (userData: Partial<ManagedUser>) => {
        try {
            let savedUser: any;
            const isNew = panelState === 'newUser';
            if (isNew) {
                savedUser = await UsersService.createUser(userData);
            } else if(selectedUser) {
                savedUser = await UsersService.updateUser(selectedUser.id_pers, userData);
            }
            await fetchUsers(); // Refresh the list
            setToast({ message: `Utilisateur ${isNew ? 'créé' : 'modifié'} avec succès.`, type: 'success' });
            
            // After refetch, find the full user object to display it
            const freshUsers = await UsersService.getUsers();
            const fullSavedUser = Array.isArray(freshUsers) ? freshUsers.find(u => u.id_pers === (savedUser.id_pers || selectedUser?.id_pers)) : savedUser;
            
            setSelectedUser(fullSavedUser || null);
            setPanelState('viewUser');
            return true;
        } catch (err: any) {
            setToast({ message: err.message || 'Une erreur est survenue.', type: 'error' });
            return false;
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        try {
            await UsersService.deleteUser(selectedUser.id_pers);
            await fetchUsers();
            setToast({ message: 'Utilisateur supprimé avec succès.', type: 'success' });
            setSelectedUser(null);
            setPanelState('idle');
        } catch (err: any) {
            setToast({ message: err.message || 'La suppression a échoué.', type: 'error' });
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.ldap_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    return (
        <div className="flex h-[90vh] -m-8">
            {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <UserManagementHeader />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {loading && <div className="text-center py-10">Chargement des utilisateurs...</div>}
                {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Erreur: {error}</div>}

                {!loading && !error && (
                    <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <UserList 
                                users={paginatedUsers} 
                                selectedUser={selectedUser}
                                onSelectUser={handleSelectUser}
                                onEditUser={handleEdit}
                                onDeleteUser={handleDelete}
                            />
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <CrudPanel
                panelState={panelState}
                user={selectedUser}
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

export default UserManagementPage;