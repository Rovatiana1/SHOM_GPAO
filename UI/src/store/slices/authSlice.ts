
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types/Users';
import AuthService from '../../services/AuthService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }: { username: string, password: string }, { rejectWithValue }) => {
    try {
      await AuthService.login(username, password);
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error("Login successful but user data not found.");
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkInitialAuth = createAsyncThunk(
  'auth/checkInitialAuth',
  (_, { rejectWithValue }) => {
    try {
      const user = AuthService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  () => {
    AuthService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Check Initial Auth
      .addCase(checkInitialAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkInitialAuth.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(checkInitialAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
