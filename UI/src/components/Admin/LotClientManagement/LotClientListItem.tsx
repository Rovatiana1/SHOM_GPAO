import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { LotClient } from '../../../types/LotClient';

interface LotClientListItemProps {
  lotClient: LotClient;
  isSelected: boolean;
  onSelect: (lotClient: LotClient) => void;
  onEdit: (lotClient: LotClient) => void;
  onDelete: (lotClient: LotClient) => void;
}

const LotClientListItem: React.FC<LotClientListItemProps> = ({ lotClient, isSelected, onSelect, onEdit, onDelete }) => {
  
  const getStatusBadge = (statusId: number | null) => {
    switch(statusId) {
        case 1: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Nouveau</span>;
        case 2: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
        case 3: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En Pause</span>;
        case 4: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Terminé</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(lotClient);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(lotClient);
  };
  
  return (
    <tr 
      onClick={() => onSelect(lotClient)}
      className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{lotClient.libelle}</div>
        <div className="text-sm text-gray-500">ID: {lotClient.idLotClient}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lotClient.dossierNum || `ID: ${lotClient.idDossier}` || 'N/A'}
      </td>
       <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(lotClient.idEtat)}
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

export default LotClientListItem;
