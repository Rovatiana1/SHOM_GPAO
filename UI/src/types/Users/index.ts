// types/index.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  userId: string;
  userName: string;
  roles: UserRole[];  
  idEtape: number;
  idLotClient: number;
}