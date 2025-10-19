import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Lot } from '../../../types/Lot';

interface LotListItemProps {
  lot: Lot;
  isSelected: boolean;
  onSelect: (lot: Lot) => void;
  onEdit: (lot: Lot) => void;
  onDelete: (lot: Lot) => void;
}

const LotListItem: React.FC<LotListItemProps> = ({ lot, isSelected, onSelect, onEdit, onDelete }) => {
  
  const getStatusBadge = (statusId: number | null) => {
    switch(statusId) {
        case 1: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Nouveau</span>;
        case 2: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
        case 3: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En Pause</span>;
        case 4: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Terminé</span>;
        case 5: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Erreur</span>;
        case 6: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Rejeté</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(lot);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(lot);
  };

  return (
    <tr 
      onClick={() => onSelect(lot)}
      className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 truncate" title={lot.libelle || ''}>{lot.libelle}</div>
        <div className="text-sm text-gray-500">Dossier: {lot.dossierNum || lot.idDossier || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lot.lotClientLibelle || `ID: ${lot.idLotClient}` || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lot.qte || '0'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-gray-600">
        {lot.priority ?? 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(lot.idEtat)}
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

export default LotListItem;
