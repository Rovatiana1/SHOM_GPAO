// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { LotDetails } from '../../types';
// import gpaoService from '../../services/GpaoService';
// import { RootState } from '../store';

// interface ProcessState {
//     currentLot: LotDetails | null;
//     isProcessing: boolean;
//     startTime: number | null; // Timestamp of when processing started
//     loading: boolean;
//     error: string | null;
//     paths: { in: string; out: string } | null;
// }

// const initialState: ProcessState = {
//     currentLot: null,
//     isProcessing: false,
//     startTime: null,
//     loading: false,
//     error: null,
//     paths: null,
// };

// // Async Thunks
// // FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
// // This allows AppDispatch to be inferred correctly. `getState` is now cast to `RootState` within the thunk.
// export const fetchCurrentLot = createAsyncThunk(
//     'process/fetchCurrentLot',
//     async (userId: number, { getState, rejectWithValue }) => {
//         const { currentLot, loading } = (getState() as RootState).process;
//         if (currentLot || loading) {
//             return; // Already have a lot or loading, no need to fetch
//         }
//         try {
//             const response = await gpaoService.getCurrentLotForUser(userId);
//             return response;
//         } catch (error: any) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// // FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
// export const getAndStartNextLot = createAsyncThunk(
//     'process/getAndStartNextLot',
//     async (_, { getState, rejectWithValue }) => {
//         const { user } = (getState() as RootState).auth; // Assuming auth slice exists and holds the user
        
//         console.log("getAndStartNextLot called", user);
        
//         if (!user) {
//             return rejectWithValue("Utilisateur non authentifié.");
//         }
//         if (!user.idEtape) {
//             return rejectWithValue("Type de traitement (idEtape) non défini pour l'utilisateur.");
//         }
//         try {
//             const lotData = await gpaoService.getLot(918, user.idEtape, parseInt(user.userId, 10), 30752); // par defaut ce sera 918 pour dossier
//             if (!lotData || !lotData.lot) {
//                 throw new Error("Aucun lot disponible à traiter.");
//             }
//             return lotData;
//         } catch (error: any) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// // FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
// export const pauseCurrentLot = createAsyncThunk(
//     'process/pauseCurrentLot',
//     async (_, { getState, rejectWithValue }) => {
//         const { currentLot } = (getState() as RootState).process;
//         const { user } = (getState() as RootState).auth;
//         if (!currentLot || !user) return rejectWithValue('No lot or user');

//         console.log("pauseCurrentLot called", currentLot, user);
//         try {
//             const params = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idPers: parseInt(user.userId, 10),
//                 _idLotClient: currentLot.idLotClient!,
//                 _idLot: currentLot.idLot!,
//                 _idTypeLdt: 0,
//                 _qte: 1,
//             };
//             await gpaoService.endLdt(params);
//         } catch (err: any) {
//             return rejectWithValue(err.message);
//         }
//     }
// );

// // FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
// export const resumeCurrentLot = createAsyncThunk(
//     'process/resumeCurrentLot',
//     async (_, { getState, rejectWithValue }) => {
//         const { currentLot } = (getState() as RootState).process;
//         const { user } = (getState() as RootState).auth;
//         if (!currentLot || !user) return rejectWithValue('No lot or user');
//         console.log("resumeCurrentLot called", currentLot, user);
//         try {
//             const params = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idPers: parseInt(user.userId, 10),
//                 _idLotClient: currentLot.idLotClient!,
//                 _idLot: currentLot.idLot!,
//                 _idTypeLdt: 0,
//             };
//             await gpaoService.startNewLdt(params);
//         } catch (err: any) {
//             return rejectWithValue(err.message);
//         }
//     }
// );


// // FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
// export const completeAndMoveToNextStep = createAsyncThunk(
//     'process/completeAndMoveToNextStep',
//     async (_, { getState, rejectWithValue }) => {
//         const { currentLot } = (getState() as RootState).process;
//         const { user } = (getState() as RootState).auth;
//         if (!currentLot || !user) return rejectWithValue('No lot or user');
//         console.log("completeAndMoveToNextStep called", currentLot, user);
//         try {
//             // End current LDT
//              const endParams = {
//                 _idDossier: currentLot.idDossier!,
//                 _idEtape: currentLot.idEtape!,
//                 _idPers: parseInt(user.userId, 10),
//                 _idLotClient: currentLot.idLotClient!,
//                 _idLot: currentLot.idLot!,
//                 _idTypeLdt: 0,
//                 _qte: 1,
//             };
//             await gpaoService.endLdt(endParams);

//             // Update lot status to "termine" (2)
//             const updateLotParams = {
//                 _idLot: currentLot.idLot!,
//                 _idEtat: 2,
//                 _qte: 1,
//             };
//             await gpaoService.updateLot(updateLotParams);

//             // Inject into next step
//             const nextEtapeParams = {
//                 _idDossier: currentLot.idDossier!,
//                 _idNextEtape: currentLot.idNextEtape!,
//                 _idLotClient: currentLot.idLotClient!,
//                 _libelle: currentLot.libelle!,
//                 _qte: 1,
//             };
//             await gpaoService.injectNextEtape(nextEtapeParams);
//         } catch (err: any) {
//             return rejectWithValue(err.message);
//         }
//     }
// );

// const processSlice = createSlice({
//     name: 'process',
//     initialState,
//     reducers: {
//         clearError(state) {
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {
//         // Specific fulfilled handlers
//         builder
//             .addCase(fetchCurrentLot.fulfilled, (state, action) => {
//                 if (action.payload && action.payload.lot) {
//                     const lot = action.payload.lot;
//                     state.currentLot = lot;
//                     state.startTime = new Date(action.payload.startTime).getTime();
//                     state.isProcessing = true;
//                     if (lot.paths) {
//                         state.paths = {
//                             in: lot.paths.IN_CQ,
//                             out: lot.paths.OUT_CQ,
//                         };
//                     } else {
//                         state.paths = null;
//                     }
//                 }
//                 state.loading = false;
//             })
//             .addCase(getAndStartNextLot.fulfilled, (state, action) => {
//                 const lot = action.payload.lot;
//                 state.currentLot = lot;
//                 state.isProcessing = true;
//                 state.startTime = Date.now();
//                  if (lot.paths) {
//                     state.paths = {
//                         in: lot.paths.IN_CQ,
//                         out: lot.paths.OUT_CQ,
//                     };
//                 } else {
//                     state.paths = null;
//                 }
//                 state.loading = false;
//             })
//             .addCase(pauseCurrentLot.fulfilled, (state) => {
//                 state.isProcessing = false;
//                 state.loading = false;
//             })
//             .addCase(resumeCurrentLot.fulfilled, (state) => {
//                 state.isProcessing = true;
//                 state.loading = false;
//             })
//             .addCase(completeAndMoveToNextStep.fulfilled, (state) => {
//                 return initialState; // Reset state
//             });
            
//         // Generic loading/error handlers
//         builder
//             .addMatcher(
//                 (action) => action.type.endsWith('/pending'),
//                 (state) => {
//                     state.loading = true;
//                     state.error = null;
//                 }
//             )
//             .addMatcher(
//                 (action) => action.type.endsWith('/rejected'),
//                 (state, action: PayloadAction<string>) => {
//                     state.loading = false;
//                     state.error = action.payload;
//                 }
//             );
//     },
// });

// export const { clearError } = processSlice.actions;

// export default processSlice.reducer;



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

// Async Thunks
// FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
// This allows AppDispatch to be inferred correctly. `getState` is now cast to `RootState` within the thunk.
export const fetchCurrentLot = createAsyncThunk(
    'process/fetchCurrentLot',
    async (userId: number, { getState, rejectWithValue }) => {
        const { currentLot, loading } = (getState() as RootState).process;
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

// FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
export const getAndStartNextLot = createAsyncThunk(
    'process/getAndStartNextLot',
    async (_, { getState, rejectWithValue }) => {
        const { user } = (getState() as RootState).auth; // Assuming auth slice exists and holds the user
        
        console.log("getAndStartNextLot called", user);
        
        if (!user) {
            return rejectWithValue("Utilisateur non authentifié.");
        }
        if (!user.idEtape) {
            return rejectWithValue("Type de traitement (idEtape) non défini pour l'utilisateur.");
        }
        if (!user.idLotClient) {
            return rejectWithValue("Lot Client (idLotClient) non défini pour l'utilisateur.");
        }
        try {
            const lotData = await gpaoService.getLot(918, user.idEtape, parseInt(user.userId, 10), user.idLotClient);
            if (!lotData || !lotData.lot) {
                throw new Error("Aucun lot disponible à traiter.");
            }
            return lotData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
export const pauseCurrentLot = createAsyncThunk(
    'process/pauseCurrentLot',
    async (_, { getState, rejectWithValue }) => {
        const { currentLot } = (getState() as RootState).process;
        const { user } = (getState() as RootState).auth;
        if (!currentLot || !user) return rejectWithValue('No lot or user');

        console.log("pauseCurrentLot called", currentLot, user);
        try {
            const params = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
                _qte: 1,
            };
            await gpaoService.endLdt(params);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
export const resumeCurrentLot = createAsyncThunk(
    'process/resumeCurrentLot',
    async (_, { getState, rejectWithValue }) => {
        const { currentLot } = (getState() as RootState).process;
        const { user } = (getState() as RootState).auth;
        if (!currentLot || !user) return rejectWithValue('No lot or user');
        console.log("resumeCurrentLot called", currentLot, user);
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


// FIX: Removed explicit state type from createAsyncThunk generics to break a circular dependency with the store.
export const completeAndMoveToNextStep = createAsyncThunk(
    'process/completeAndMoveToNextStep',
    async (_, { getState, rejectWithValue }) => {
        const { currentLot } = (getState() as RootState).process;
        const { user } = (getState() as RootState).auth;
        if (!currentLot || !user) return rejectWithValue('No lot or user');
        console.log("completeAndMoveToNextStep called", currentLot, user);
        try {
            // End current LDT
             const endParams = {
                _idDossier: currentLot.idDossier!,
                _idEtape: currentLot.idEtape!,
                _idPers: parseInt(user.userId, 10),
                _idLotClient: currentLot.idLotClient!,
                _idLot: currentLot.idLot!,
                _idTypeLdt: 0,
                _qte: 1,
            };
            await gpaoService.endLdt(endParams);

            // Update lot status to "termine" (2)
            const updateLotParams = {
                _idLot: currentLot.idLot!,
                _idEtat: 2,
                _qte: 1,
            };
            await gpaoService.updateLot(updateLotParams);

            // Inject into next step
            const nextEtapeParams = {
                _idDossier: currentLot.idDossier!,
                _idNextEtape: currentLot.idNextEtape!,
                _idLotClient: currentLot.idLotClient!,
                _libelle: currentLot.libelle!,
                _qte: 1,
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
        // Specific fulfilled handlers
        builder
            .addCase(fetchCurrentLot.fulfilled, (state, action) => {
                if (action.payload && action.payload.lot) {
                    const lot = action.payload.lot;
                    state.currentLot = lot;
                    state.startTime = new Date(action.payload.startTime).getTime();
                    state.isProcessing = true;
                    if (lot.paths) {
                        state.paths = {
                            in: lot.paths.IN_CQ,
                            out: lot.paths.OUT_CQ,
                        };
                    } else {
                        state.paths = null;
                    }
                }
                state.loading = false;
            })
            .addCase(getAndStartNextLot.fulfilled, (state, action) => {
                const lot = action.payload.lot;
                state.currentLot = lot;
                state.isProcessing = true;
                state.startTime = Date.now();
                 if (lot.paths) {
                    state.paths = {
                        in: lot.paths.IN_CQ,
                        out: lot.paths.OUT_CQ,
                    };
                } else {
                    state.paths = null;
                }
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
    },
});

export const { clearError } = processSlice.actions;

export default processSlice.reducer;
