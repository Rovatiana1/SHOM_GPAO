import React from 'react';
import LdtListItem from './LdtListItem';
import { Ldt } from '../../../types/Ldt';
import { Clock } from 'lucide-react';

interface LdtListProps {
  ldts: Ldt[];
  selectedLdt: Ldt | null;
  onSelectLdt: (ldt: Ldt) => void;
  onEdit: (ldt: Ldt) => void;
  onDelete: (ldt: Ldt) => void;
}

const LdtList: React.FC<LdtListProps> = ({ ldts, selectedLdt, onSelectLdt, onEdit, onDelete }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Client</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée (min)</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ldts.length > 0 ? (
            ldts.map(ldt => (
              <LdtListItem 
                key={ldt.idLdt} 
                ldt={ldt} 
                isSelected={selectedLdt?.idLdt === ldt.idLdt}
                onSelect={onSelectLdt}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Clock className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucune ligne de temps trouvée</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter une nouvelle ligne de temps.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LdtList;