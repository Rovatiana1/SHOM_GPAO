// FIX: Replaced incorrect JSX content with the correct 'Dossier' type definition.
export interface Dossier {
  idDossier: number;
  numDossier: string;
  atelier: string | null;
  alias: string | null;
  corresp: string | null;
  volumePrevue: string | null;
  idEtat: number | null;
}
