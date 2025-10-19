import React from 'react';
import EtatListItem from './EtatListItem';
import { Etat } from '../../../types/Etat';
import { Shield } from 'lucide-react';

interface EtatListProps {
  etats: Etat[];
  selectedEtat: Etat | null;
  onSelectEtat: (etat: Etat) => void;
  onEdit: (etat: Etat) => void;
  onDelete: (etat: Etat) => void;
}

const EtatList: React.FC<EtatListProps> = ({ etats, selectedEtat, onSelectEtat, onEdit, onDelete }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full max-h-[40vh] overflow-y-auto divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {etats.length > 0 ? (
            etats.map(etat => (
              <EtatListItem 
                key={etat.idEtat} 
                etat={etat} 
                isSelected={selectedEtat?.idEtat === etat.idEtat}
                onSelect={onSelectEtat}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Shield className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucun état trouvé</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter un nouvel état.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EtatList;