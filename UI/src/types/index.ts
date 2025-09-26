export enum LotStatus {
  EnCours = "en-cours",
  Termine = "termine",
  EnAttente = "en-attente",
  Erreur = "erreur",
}

export interface Lot {
  id: string;
  name: string;
  status: LotStatus;
  start: string | null;
  end: string | null;
  quantity: number | null;
}

export interface LotPaths {
  basePath: string;
  IN_CQ: string;
  OUT_CQ: string;
  IMAGE_OPT_PATH: string;
  IMAGE_TIF_PATH: string;
  IN_CQ_ISO: string;
  OUT_CQ_ISO: string;
}

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
  paths: LotPaths | null; // ✅ objet bien typé
}
