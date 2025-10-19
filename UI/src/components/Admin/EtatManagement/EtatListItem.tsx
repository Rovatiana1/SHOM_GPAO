import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Etat } from '../../../types/Etat';

interface EtatListItemProps {
  etat: Etat;
  isSelected: boolean;
  onSelect: (etat: Etat) => void;
  onEdit: (etat: Etat) => void;
  onDelete: (etat: Etat) => void;
}

const EtatListItem: React.FC<EtatListItemProps> = ({ etat, isSelected, onSelect, onEdit, onDelete }) => {

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(etat);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(etat);
  };

  return (
    <tr 
        onClick={() => onSelect(etat)}
        className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
        {etat.idEtat}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{etat.libelle}</div>
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

export default EtatListItem;