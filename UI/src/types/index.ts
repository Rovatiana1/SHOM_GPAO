export enum LotStatus {
  EnCours = 'en-cours',
  Termine = 'termine',
  EnAttente = 'en-attente',
  Erreur = 'erreur',
}

export interface Lot {
  id: string;
  name: string;
  status: LotStatus;
  start: string | null;
  end: string | null;
  quantity: number | null;
}
