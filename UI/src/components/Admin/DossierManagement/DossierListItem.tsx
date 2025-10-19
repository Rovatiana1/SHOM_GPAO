import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Dossier } from '../../../types/Dossier';

interface DossierListItemProps {
  dossier: Dossier;
  isSelected: boolean;
  onSelect: (dossier: Dossier) => void;
  onEdit: (dossier: Dossier) => void;
  onDelete: (dossier: Dossier) => void;
}

const DossierListItem: React.FC<DossierListItemProps> = ({ dossier, isSelected, onSelect, onEdit, onDelete }) => {
  
  const getStatusBadge = (statusId: number | null) => {
    switch(statusId) {
        case 1: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Nouveau</span>;
        case 2: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
        case 3: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En Pause</span>;
        case 4: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Terminé</span>;
        case 5: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Erreur</span>;
        case 6: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Rejeté</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inconnu ({statusId})</span>;
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(dossier);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(dossier);
  };

  return (
    <tr 
        onClick={() => onSelect(dossier)}
        className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
           <div className="flex-shrink-0 h-10 w-10">
            <div className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors ${isSelected ? 'bg-green-200' : 'bg-gray-100'}`}>
              <span className={`font-bold text-xs ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>D{dossier.idDossier}</span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{dossier.numDossier}</div>
            <div className="text-sm text-gray-500">{dossier.alias || 'N/A'}</div>
          </div>
        </div>
      </td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {dossier.atelier || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(dossier.idEtat)}
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

export default DossierListItem;