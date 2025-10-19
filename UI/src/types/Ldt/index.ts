export interface Ldt {
  idLdt: number;
  idPers: number | null;
  idDossier: number | null;
  idLotClient: number | null;
  idLot: number | null;
  idEtat: number | null;
  idEtape: number | null;
  idTypeLdt: number | null;
  machine: string | null;
  hDeb: string | null;
  hFin: string | null;
  quantite: string | null;
  nbreErreur: string | null;
  commentaire: string | null;
  dateDebLdt: string | null;
  lotOp: string | null;
  dateFinLdt: string | null;
  addressIp: string | null;
  ver: number | null;
  mac: string | null;
  idLdtNeocles: number | null;
  modifBatch: boolean | null;
  idAlmSousSousSpe: number | null;
  heureSup: boolean | null;
  byExcelTeletravail: boolean | null;
  dureeLdt: number | null;
  hDebTmstp: string | null; // ISO string
  hFinTmstp: string | null; // ISO string

  // Joined data for display
  userName?: string;
  dossierNum?: string;
  lotClientLibelle?: string;
  lotLibelle?: string;
  etapeLibelle?: string;
  etatLibelle?: string;
  typeLdtLibelle?: string;
}
