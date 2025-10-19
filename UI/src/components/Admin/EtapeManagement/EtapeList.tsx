import React from 'react';
import EtapeListItem from './EtapeListItem';
import { Etape } from '../../../types/Etape';
import { Flag } from 'lucide-react';

interface EtapeListProps {
  etapes: Etape[];
  selectedEtape: Etape | null;
  onSelectEtape: (etape: Etape) => void;
  onEdit: (etape: Etape) => void;
  onDelete: (etape: Etape) => void;
}

const EtapeList: React.FC<EtapeListProps> = ({ etapes, selectedEtape, onSelectEtape, onEdit, onDelete }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full max-h-[40vh] overflow-y-auto divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étape</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étape Parente</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {etapes.length > 0 ? (
            etapes.map(etape => (
              <EtapeListItem 
                key={etape.idEtape} 
                etape={etape} 
                isSelected={selectedEtape?.idEtape === etape.idEtape}
                onSelect={onSelectEtape}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Flag className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucune étape trouvée</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter une nouvelle étape.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EtapeList;