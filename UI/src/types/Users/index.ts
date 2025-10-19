// types/index.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  userId: string;
  userName: string;
  roles: UserRole[];  
  idEtape: number;
  idLotClient: number | null;
}

// Nouveau type pour la gestion des utilisateurs
export interface ManagedUser {
  id_pers: number;
  nom: string;
  prenom: string;
  ldap_name: string;
  email: string;
  id_droit: number;
  roles: UserRole[];
}
