import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { ManagedUser, UserRole } from '../../../types/Users';

interface UserListItemProps {
  user: ManagedUser;
  isSelected: boolean;
  onSelect: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-yellow-100 text-yellow-800',
    USER: 'bg-blue-100 text-blue-800',
};

const UserListItem: React.FC<UserListItemProps> = ({ user, isSelected, onSelect, onEdit, onDelete }) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection when clicking button
    onEdit(user);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(user);
  };

  return (
    <tr 
        onClick={() => onSelect(user)} 
        className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-green-200' : 'bg-gray-100'}`}>
              <span className={`font-bold ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>{getInitials(user.prenom, user.nom)}</span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.prenom} {user.nom}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
       <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
            {user.roles && user.roles.map(role => (
                <span key={role} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
                    {role}
                </span>
            ))}
             {!user.roles || user.roles.length === 0 && (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    N/A
                </span>
            )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        {user.ldap_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={handleEditClick} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Modifier">
          <Edit size={20} />
        </button>
        <button onClick={handleDeleteClick} className="ml-4 text-red-600 hover:text-red-900 transition-colors" title="Supprimer">
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
};

export default UserListItem;