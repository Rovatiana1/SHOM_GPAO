export interface Lot {
  idLot: number;
  idLotClient: number | null;
  idDossier: number | null;
  idEtat: number | null;
  idEtape: number | null;
  libelle: string | null;
  qte: string | null;
  idPers: number | null;
  nbreErreur: string | null;
  priority: number | null;
  duree: number | null;
  qteOp: string | null;
  dateDeb: string | null;
  hDeb: string | null;
  idAlmSousSousSpe: number | null;
  idDetRef: number | null;
  dureeMax: number | null;
  qteReele: number | null;
  verifQte: boolean | null;

  // Joined data for display
  lotClientLibelle?: string;
  dossierNum?: string;
}
