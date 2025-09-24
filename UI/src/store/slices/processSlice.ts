import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LotDetails } from '../../types';
import gpaoService from '../../services/GpaoService';
import { RootState } from '../store';

interface ProcessState {
    currentLot: LotDetails | null;
    isProcessing: boolean;
    startTime: number | null; // Timestamp of when processing started
    loading: boolean;
    error: string | null;
    paths: { in: string; out: string } | null;
}

const initialState: ProcessState = {
    currentLot: null,
    isProcessing: false,
    startTime: null,
    loading: false,
    error: null,
    paths: null,
};

const buildPathsForLot = (lotName: string) => {
    const basePath = "\\\\10.128.1.10\\005822\\PRODUCTION\\LOT6";
    const commonSubPath = `TEST_DEV\\${lotName}\\${lotName}.csv`;
    const inPath = `${basePath}\\SAISIE\\${commonSubPath}`;
    const outPath = `${basePath}\\CQ_CIBLE\\${commonSubPath}`;
    return { in: inPath, out: outPath };
};

// Async Thunks
export const fetchCurrentLot = createAsyncThunk<any, number, { state: RootState }>(
    'process/fetchCurrentLot',
    async (userId, { getState, rejectWithValue }) => {
        const { currentLot, loading } = getState().process;
        if (currentLot || loading) {
            return; // Already have a lot or loading, no need to fetch
        }
        try {
            const response = await gpaoService.getCurrentLotForUser(userId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getAndStartNextLot = createAsyncThunk<any, void, { state: RootState }>(
    'process/getAndStartNextLot',
    async (_, { getState, rejectWithValue }) => {
        const { user } = getState().auth; // Assuming auth slice exists and holds the user
        if (!user) {
            return rejectWithValue("Utilisateur non authentifié.");
        }
        try {
            const lotData = await gpaoService.getLot(918, 4674, parseInt(user.userId, 10), 30752);
            if (!lotData || !lotData.lot) {
                throw new Error("Aucun lot disponible à traiter.");
            }
            return lotData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const pauseCurrentLot = createAsyncThunk<void, void, { state: RootState }>(
    'process/pauseCurrentLot',
    async (_, { getState, rejectWithValue }) => {
        const { currentLot } = getState().process;
        const { user } = getState().auth;
        if (!currentLot || !user) return rejectWithValue('No lot or user');
        try {
            const params = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
                _qte: 500,
            };
            await gpaoService.endLdt(params);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const resumeCurrentLot = createAsyncThunk<void, void, { state: RootState }>(
    'process/resumeCurrentLot',
    async (_, { getState, rejectWithValue }) => {
        const { currentLot } = getState().process;
        const { user } = getState().auth;
        if (!currentLot || !user) return rejectWithValue('No lot or user');
        try {
            const params = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
            };
            await gpaoService.startNewLdt(params);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);


export const completeAndMoveToNextStep = createAsyncThunk<void, void, { state: RootState }>(
    'process/completeAndMoveToNextStep',
    async (_, { getState, rejectWithValue }) => {
        const { currentLot } = getState().process;
        const { user } = getState().auth;
        if (!currentLot || !user) return rejectWithValue('No lot or user');

        try {
             const endParams = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
                _qte: 500,
            };
            await gpaoService.endLdt(endParams);

            const nextEtapeParams = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idLotClient: currentLot.idLotClient!,
                _libelle: currentLot.libelle!,
                _qte: currentLot.qte!.toString(),
            };
            await gpaoService.injectNextEtape(nextEtapeParams);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const processSlice = createSlice({
    name: 'process',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Generic loading/error handlers
        builder
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action: PayloadAction<string>) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );

        // Specific fulfilled handlers
        builder
            .addCase(fetchCurrentLot.fulfilled, (state, action) => {
                if (action.payload && action.payload.lot) {
                    state.currentLot = action.payload.lot;
                    state.startTime = new Date(action.payload.startTime).getTime();
                    state.isProcessing = true;
                    state.paths = buildPathsForLot(action.payload.lot.libelle);
                }
                state.loading = false;
            })
            .addCase(getAndStartNextLot.fulfilled, (state, action) => {
                state.currentLot = action.payload.lot;
                state.isProcessing = true;
                state.startTime = Date.now();
                state.paths = buildPathsForLot(action.payload.lot.libelle);
                state.loading = false;
            })
            .addCase(pauseCurrentLot.fulfilled, (state) => {
                state.isProcessing = false;
                state.loading = false;
            })
            .addCase(resumeCurrentLot.fulfilled, (state) => {
                state.isProcessing = true;
                state.loading = false;
            })
            .addCase(completeAndMoveToNextStep.fulfilled, (state) => {
                return initialState; // Reset state
            });
    },
});

export const { clearError } = processSlice.actions;

export default processSlice.reducer;
