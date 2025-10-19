import React from 'react';
import UserListItem from './UserListItem';
import { ManagedUser } from '../../../types/Users';
import { Users } from 'lucide-react';

interface UserListProps {
  users: ManagedUser[];
  selectedUser: ManagedUser | null;
  onSelectUser: (user: ManagedUser) => void;
  onEditUser: (user: ManagedUser) => void;
  onDeleteUser: (user: ManagedUser) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUser, onSelectUser, onEditUser, onDeleteUser }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full max-h-[40vh] overflow-y-auto divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôles</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login LDAP</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map(user => (
              <UserListItem 
                key={user.id_pers} 
                user={user} 
                isSelected={selectedUser?.id_pers === user.id_pers}
                onSelect={onSelectUser}
                onEdit={onEditUser} 
                onDelete={onDeleteUser} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Users className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucun utilisateur trouvé</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter un nouvel utilisateur.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;