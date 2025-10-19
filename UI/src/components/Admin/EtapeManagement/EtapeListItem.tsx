import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Etape } from '../../../types/Etape';

interface EtapeListItemProps {
  etape: Etape;
  isSelected: boolean;
  onSelect: (etape: Etape) => void;
  onEdit: (etape: Etape) => void;
  onDelete: (etape: Etape) => void;
}

const EtapeListItem: React.FC<EtapeListItemProps> = ({ etape, isSelected, onSelect, onEdit, onDelete }) => {

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(etape);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(etape);
  };

  return (
    <tr 
        onClick={() => onSelect(etape)}
        className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{etape.libelle}</div>
        <div className="text-sm text-gray-500">ID: {etape.idEtape}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {etape.parentEtape || 'N/A'}
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

export default EtapeListItem;