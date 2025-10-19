import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LotDetails } from "../../types";
import gpaoService from "../../services/GpaoService";
import CQService from "../../services/CQService";
import { RootState } from "../store";

interface ProcessState {
  currentLot: LotDetails | null;
  isProcessing: boolean;
  startTime: number | null; // Timestamp of when processing started
  loading: boolean;
  error: string | null;
  paths: { in: string; out: string } | null;
  pauseReason: { id: number, label: string } | null;
}

const initialState: ProcessState = {
  currentLot: null,
  isProcessing: false,
  startTime: null,
  loading: false,
  error: null,
  paths: null,
  pauseReason: null, // Initialize
};

// Async Thunks
export const fetchCurrentLot = createAsyncThunk(
  "process/fetchCurrentLot",
  async (_, { getState, rejectWithValue }) => {
    const { currentLot, loading } = (getState() as RootState).process;
    const { user } = (getState() as RootState).auth;

    if (currentLot || loading) {
      return;
    }
    if (!user) {
      return rejectWithValue("User not authenticated for fetchCurrentLot");
    }

    try {
      const response = await gpaoService.getCurrentLotForUser(
        918, // 005822_LOT6
        user.idEtape,
        parseInt(user.userId, 10),
        user.idLotClient
      );
      return {
        response,
        userEtape: user.idEtape,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAndStartNextLot = createAsyncThunk(
  "process/getAndStartNextLot",
  async (_, { getState, rejectWithValue }) => {
    const { user } = (getState() as RootState).auth;

    if (!user) return rejectWithValue("Utilisateur non authentifié.");
    if (!user.idEtape)
      return rejectWithValue("Type de traitement (idEtape) non défini pour l'utilisateur.");
    if (!user.idLotClient)
      return rejectWithValue("Lot Client (idLotClient) non défini pour l'utilisateur.");

    try {
      const lotData = await gpaoService.getLot(
        918, // ex: 005822_LOT6
        user.idEtape,
        parseInt(user.userId, 10),
        user.idLotClient
      );

      if (!lotData || !lotData.lot) {
        return rejectWithValue("Aucun lot disponible à traiter.");
      }

      return { lotData, userEtape: user.idEtape };
    } catch (error: any) {
      return rejectWithValue(error.message || "Erreur de récupération du lot.");
    }
  }
);

export const pauseCurrentLot = createAsyncThunk(
  "process/pauseCurrentLot",
  async (
    reason: { id: number; label: string },
    { getState, rejectWithValue }
  ) => {
    const { currentLot } = (getState() as RootState).process;
    const { user } = (getState() as RootState).auth;
    if (!currentLot || !user) return rejectWithValue("No lot or user");

    try {
      // pour terminer la ligne prod en cours
      const paramsEndLdt = {
        _idDossier: currentLot?.idDossier!,
        _idEtape: currentLot?.idEtape!,
        _idPers: parseInt(user.userId, 10),
        _idLotClient: currentLot?.idLotClient!,
        _idLot: currentLot?.idLot!,
        _idTypeLdt: 0, // 0 pour temps de travail standard
        _qte: 1,
      };
      await gpaoService.endLdt(paramsEndLdt);

      // pour créer une nouvelle ligne de temps de type pause
      const paramsStartLdtPause = {
        _idDossier: currentLot?.idDossier!,
        _idEtape: currentLot?.idEtape!,
        _idPers: parseInt(user.userId, 10),
        _idLotClient: currentLot?.idLotClient!,
        _idLot: currentLot?.idLot!,
        _idTypeLdt: reason.id,
        _qte: 1,
      };
      await gpaoService.startNewLdt(paramsStartLdtPause);
      return reason; // Pass full reason object to fulfilled action
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const resumeCurrentLot = createAsyncThunk(
  "process/resumeCurrentLot",
  async (_, { getState, rejectWithValue }) => {
    const { currentLot, pauseReason } = (getState() as RootState).process;
    const { user } = (getState() as RootState).auth;
    if (!currentLot || !user || !pauseReason) return rejectWithValue("Missing data to resume");
    
    try {
      // End the pause timeline
      const paramsEndLdt = {
        _idDossier: currentLot?.idDossier!,
        _idEtape: currentLot?.idEtape!,
        _idPers: parseInt(user.userId, 10),
        _idLotClient: currentLot?.idLotClient!,
        _idLot: currentLot?.idLot!,
        _idTypeLdt: pauseReason.id, // Use the stored pause reason ID
        _qte: 1,
      };
      await gpaoService.endLdt(paramsEndLdt);

      // Start a new standard work timeline
      const params = {
        _idDossier: currentLot?.idDossier!,
        _idEtape: currentLot?.idEtape!,
        _idPers: parseInt(user.userId, 10),
        _idLotClient: currentLot?.idLotClient!,
        _idLot: currentLot?.idLot!,
        _idTypeLdt: 0, // 0 for standard work time
      };
      await gpaoService.startNewLdt(params);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const completeAndMoveToNextStep = createAsyncThunk(
  "process/completeAndMoveToNextStep",
  async (_, { getState, rejectWithValue }) => {
    const { currentLot } = (getState() as RootState).process;
    const { user } = (getState() as RootState).auth;
    if (!currentLot || !user) return rejectWithValue("No lot or user");
    try {
      const endParams = {
        _idDossier: currentLot?.idDossier!,
        _idEtape: currentLot?.idEtape!,
        _idPers: parseInt(user.userId, 10),
        _idLotClient: currentLot?.idLotClient!,
        _idLot: currentLot?.idLot!,
        _idTypeLdt: 0,
        _qte: 1,
      };
      await gpaoService.endLdt(endParams);

      const updateLotParams = {
        _idLot: currentLot?.idLot!,
        _idEtat: 2,
        _qte: 1,
      };
      await gpaoService.updateLot(updateLotParams);

      if (user.idEtape !== 4688) {
        const nextEtapeParams = {
          _idDossier: currentLot?.idDossier!,
          _idNextEtape: currentLot?.idNextEtape!,
          _idLotClient: currentLot?.idLotClient!,
          _libelle: currentLot?.libelle!,
          _qte: 1,
        };
        await gpaoService.injectNextEtape(nextEtapeParams);
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectToRepriseCQ = createAsyncThunk(
  "process/rejectToRepriseCQ",
  async (_, { getState, rejectWithValue }) => {
    const { currentLot } = (getState() as RootState).process;
    const { user } = (getState() as RootState).auth;
    if (!currentLot || !user) return rejectWithValue("No lot or user");
    try {
      const endParams = {
        _idDossier: currentLot?.idDossier!,
        _idEtape: currentLot?.idEtape!,
        _idPers: parseInt(user.userId, 10),
        _idLotClient: currentLot?.idLotClient!,
        _idLot: currentLot?.idLot!,
        _idTypeLdt: 0,
        _qte: 1,
      };
      await gpaoService.endLdt(endParams);

      const updateLotParams = {
        _idLot: currentLot?.idLot!,
        _idEtat: 6,
        _qte: 1,
      };
      await gpaoService.updateLot(updateLotParams);

      const nextEtapeParams = {
        _idDossier: currentLot?.idDossier!,
        // _idNextEtape: currentLot?.idNextEtape!,
        _idNextEtape: 14356, // rejeter en Reprise CQ cible
        _idLotClient: currentLot?.idLotClient!,
        _libelle: currentLot?.libelle!,
        _qte: 1,
      };
      await gpaoService.injectNextEtape(nextEtapeParams);

    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


export const savePointsFinal = createAsyncThunk(
  "process/savePointsFinal",
  async (
    {
      idLot,
      points,
      dates,
      metadata,
      precision,
      outPath,
    }: {
      idLot: number;
      points: any[];
      dates: string[];
      metadata: any;
      precision: number;
      outPath: string;
    },
    { getState, rejectWithValue, dispatch }
  ) => {
    const { user } = (getState() as RootState).auth;
    const { currentLot } = (getState() as RootState).process;

    if (!user || !currentLot) {
      return rejectWithValue("Utilisateur ou lot introuvable.");
    }

    try {
      // Appel du service CQ
      const response = await CQService.savePointsFinal(
        idLot,
        points,
        dates,
        metadata,
        precision,
        outPath
      );

      if (response.status === "success") {
        // Si succès → on déclenche ensuite l’étape suivante comme dans handleConfirmExport
        await dispatch(completeAndMoveToNextStep());
        return response;
      } else {
        return rejectWithValue(
          response.message || "Erreur lors de l’export CSV."
        );
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Erreur inattendue lors de l’export CSV.");
    }
  }
);

const processSlice = createSlice({
  name: "process",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentLot.fulfilled, (state, action) => {
        state.pauseReason = null;
        if (
          action.payload &&
          action.payload.response &&
          action.payload.response.lot
        ) {
          const { response, userEtape } = action.payload;
          const lot = response.lot;
          state.currentLot = lot;
          state.startTime = new Date(response.startTime).getTime();
          state.isProcessing = true;

          if (lot.paths) {
            if (userEtape === 4688) {
              state.paths = {
                in: lot.paths.IN_CQ_ISO,
                out: lot.paths.OUT_CQ_ISO,
              };
            } else if (userEtape === 14356) {
              state.paths = {
                in: lot.paths.IN_CQ_ISO,
                out: lot.paths.OUT_CQ,
              };
            } else {
              state.paths = {
                in: lot.paths.IN_CQ,
                out: lot.paths.OUT_CQ,
              };
            }
          } else {
            state.paths = null;
          }
        }
        state.loading = false;
      })
      .addCase(getAndStartNextLot.fulfilled, (state, action) => {
        const { lotData, userEtape } = action.payload;
        const lot = lotData.lot;
        state.currentLot = lot;
        state.isProcessing = true;
        state.startTime = Date.now();
        state.pauseReason = null;

        if (lot.paths) {
          if (userEtape === 4688) {
            state.paths = {
              in: lot.paths.IN_CQ_ISO,
              out: lot.paths.OUT_CQ_ISO,
            };
          } else if (userEtape === 14356) {
              state.paths = {
                in: lot.paths.IN_CQ_ISO,
                out: lot.paths.OUT_CQ,
              };
            } else {
            state.paths = {
              in: lot.paths.IN_CQ,
              out: lot.paths.OUT_CQ,
            };
          }
        } else {
          state.paths = null;
        }
        state.loading = false;
      })
      .addCase(pauseCurrentLot.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.loading = false;
        state.pauseReason = action.payload; // Set the reason object
      })
      .addCase(resumeCurrentLot.fulfilled, (state) => {
        state.isProcessing = true;
        state.loading = false;
        state.pauseReason = null; // Clear reason on resume
        state.startTime = Date.now();
      })
      .addCase(completeAndMoveToNextStep.fulfilled, (state) => {
        state.currentLot = null;
        state.isProcessing = false;
        state.startTime = null;
        state.loading = false;
        state.error = null;
        state.paths = null;
        state.pauseReason = null;
      })
      .addCase(rejectToRepriseCQ.fulfilled, (state) => {
        state.currentLot = null;
        state.isProcessing = false;
        state.startTime = null;
        state.loading = false;
        state.error = null;
        state.paths = null;
        state.pauseReason = null;
      })
      .addCase(savePointsFinal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePointsFinal.fulfilled, (state, action) => {
        state.loading = false;
        state.isProcessing = false;
        state.currentLot = null;
        state.paths = null;
        state.startTime = null;
        state.error = null;
        state.pauseReason = null;
        // Optionnel : tu peux stocker le dernier fichier exporté si besoin
        console.log("Export CSV réussi :", action.payload);
      })
      .addCase(savePointsFinal.rejected, (state, action) => {
        state.loading = false;
        state.error = null;
      });

    builder
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError } = processSlice.actions;

export default processSlice.reducer;