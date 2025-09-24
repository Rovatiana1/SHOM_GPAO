
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

// Représente la structure détaillée d'un lot retourné par l'API
// export interface LotDetails {
//   _idLot: number;
//   _idDossier: number;
//   _idEtape: number;
//   _idLotClient: number;
//   _idTypeLdt: number;
//   libelle: string;
//   qte: number;
// }


export interface LotDetails {
  estPrio: boolean | null;
  idAlmSousSousSpe: number | null;
  idDetRef: number | null;
  idDossier: number;
  idEtat: number;
  idLot: number;
  idLotClient: number;
  idPers: number;
  libelle: string;
  libelleLotClient: string;
  libelleDossier: string | null;
  nbreErreur: number | null;
  ordre: number | null;
  ordrePriorite: number | null;
  priority: number;
  type: string | null;
  idEtape: number | null;
  idTypeLdt: number | null;
  qte: number | null;
}

