import React from 'react';

const LotManagementHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des Lots</h1>
      <p className="mt-1 text-gray-500">Créez, modifiez et gérez les lots de traitement.</p>
    </div>
  );
};

export default LotManagementHeader;