import React from 'react';
import DossierListItem from './DossierListItem';
import { Dossier } from '../../../types/Dossier';
import { Folder } from 'lucide-react';

interface DossierListProps {
  dossiers: Dossier[];
  selectedDossier: Dossier | null;
  onSelectDossier: (dossier: Dossier) => void;
  onEdit: (dossier: Dossier) => void;
  onDelete: (dossier: Dossier) => void;
}

const DossierList: React.FC<DossierListProps> = ({ dossiers, selectedDossier, onSelectDossier, onEdit, onDelete }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossier</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atelier</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dossiers.length > 0 ? (
            dossiers.map(dossier => (
              <DossierListItem 
                key={dossier.idDossier} 
                dossier={dossier} 
                isSelected={selectedDossier?.idDossier === dossier.idDossier}
                onSelect={onSelectDossier}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Folder className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucun dossier trouvé</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter un nouveau dossier.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DossierList;