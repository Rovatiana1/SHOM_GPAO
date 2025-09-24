import { User } from '../../types/Users';

// This is a placeholder to define the shape of the auth state.
// You can expand this into a full slice later if you move auth management to Redux.
export interface AuthState {
  user: User | null;
}
