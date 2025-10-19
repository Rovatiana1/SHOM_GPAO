import React from 'react';
import LotListItem from './LotListItem';
import { Lot } from '../../../types/Lot';
import { Layers } from 'lucide-react';

interface LotListProps {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
  onEdit: (lot: Lot) => void;
  onDelete: (lot: Lot) => void;
}

const LotList: React.FC<LotListProps> = ({ lots, selectedLot, onSelectLot, onEdit, onDelete }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Client</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lots.length > 0 ? (
            lots.map(lot => (
              <LotListItem 
                key={lot.idLot} 
                lot={lot}
                isSelected={selectedLot?.idLot === lot.idLot}
                onSelect={onSelectLot}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Layers className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucun lot trouvé</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter un nouveau lot.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LotList;
