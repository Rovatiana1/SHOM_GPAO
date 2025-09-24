// Fix: The `combineReducers` utility is imported from `redux` instead of `@reduxjs/toolkit`
// to resolve an issue where it might not be exported from `@reduxjs/toolkit` in older versions or specific project setups.
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import processReducer from './slices/processSlice';
import { AuthState } from './slices/authSlice'; // Import this if you create an auth slice

// Define AuthState placeholder if it doesn't exist yet to avoid TS errors
// This is a temporary solution until you create a proper auth slice.
const initialAuth: AuthState = { user: null };
const authReducer = (state = initialAuth) => state;


const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['process'], // Only persist the process slice
};

const rootReducer = combineReducers({
  process: processReducer,
  auth: authReducer, // Placeholder auth reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;