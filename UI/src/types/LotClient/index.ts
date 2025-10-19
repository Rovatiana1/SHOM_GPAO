// types/LotClient/index.ts
export interface LotClient {
  idLotClient: number;
  idDossier: number | null;
  libelle: string | null;
  idPers: number | null;
  idEtat: number | null;
  idCategorie: number | null;
  cibleA: number | null;
  cibleB: number | null;
  cibleC: number | null;
  cibleD: number | null;
  vitesseEquilibre: number | null;
  commentaires: any | null; // JSON can be any type
  idCae: number | null;
  idCae2: number | null;
  idCaeProjet: number | null;

  // Joined data for display
  dossierNum?: string;
  userName?: string;
}
