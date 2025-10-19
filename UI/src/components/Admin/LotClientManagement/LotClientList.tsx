import React from 'react';
import LotClientListItem from './LotClientListItem';
import { LotClient } from '../../../types/LotClient';
import { Briefcase } from 'lucide-react';

interface LotClientListProps {
  lotClients: LotClient[];
  selectedLotClient: LotClient | null;
  onSelectLotClient: (lotClient: LotClient) => void;
  onEdit: (lotClient: LotClient) => void;
  onDelete: (lotClient: LotClient) => void;
}

const LotClientList: React.FC<LotClientListProps> = ({ lotClients, selectedLotClient, onSelectLotClient, onEdit, onDelete }) => {
  return (
    <div className="align-middle inline-block min-w-full">
      <table className="min-w-full max-h-[40vh] overflow-y-auto divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Client</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossier</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lotClients.length > 0 ? (
            lotClients.map(lotClient => (
              <LotClientListItem 
                key={lotClient.idLotClient} 
                lotClient={lotClient}
                isSelected={selectedLotClient?.idLotClient === lotClient.idLotClient}
                onSelect={onSelectLotClient}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucun lot client trouvé</h3>
                  <p className="text-sm">Essayez d'ajuster votre recherche ou d'ajouter un nouveau lot client.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LotClientList;
