import React from 'react';

const UserManagementHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
      <p className="mt-1 text-gray-500">Créez, modifiez et gérez les accès des utilisateurs.</p>
    </div>
  );
};

export default UserManagementHeader;