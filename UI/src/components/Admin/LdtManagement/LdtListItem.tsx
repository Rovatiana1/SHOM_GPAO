import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Ldt } from '../../../types/Ldt';

interface LdtListItemProps {
  ldt: Ldt;
  isSelected: boolean;
  onSelect: (ldt: Ldt) => void;
  onEdit: (ldt: Ldt) => void;
  onDelete: (ldt: Ldt) => void;
}

const LdtListItem: React.FC<LdtListItemProps> = ({ ldt, isSelected, onSelect, onEdit, onDelete }) => {
  const formatDateTime = (dateStr: string | null, timeStr: string | null) => {
    if (!dateStr || !timeStr) return 'N/A';
    try {
        // Assuming date is YYYYMMDD and time is HH:MM:SS
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}T${timeStr}`);
        return date.toLocaleString('fr-FR');
    } catch (e) {
        return 'Date invalide';
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(ldt);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(ldt);
  };

  return (
    <tr 
        onClick={() => onSelect(ldt)}
        className={`transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 truncate" title={ldt.lotLibelle || ''}>{ldt.lotLibelle || `Lot ID: ${ldt.idLot}`}</div>
        <div className="text-sm text-gray-500">Dossier: {ldt.dossierNum || `ID: ${ldt.idDossier}`}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ldt.lotClientLibelle || `ID: ${ldt.idLotClient}`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ldt.userName || `User ID: ${ldt.idPers}`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ldt.typeLdtLibelle || `Type ID: ${ldt.idTypeLdt}`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDateTime(ldt.dateDebLdt, ldt.hDeb)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ldt.dureeLdt ?? 'N/A'}
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

export default LdtListItem;