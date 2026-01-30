/**
 * Auth Slice
 *
 * Manages authentication state in Redux:
 * - User information and authentication status
 * - Loading and error states
 * - Role-based selectors
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SystemRole, ChurchRole, Permission } from '@ceslar/shared-types';

/**
 * Auth user type stored in Redux
 */
export interface AuthUserState {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  systemRole: SystemRole;
  churchRoles: Record<string, ChurchRole>;
  permissions: Permission[];
}

/**
 * Auth slice state
 */
export interface AuthState {
  user: AuthUserState | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set the authenticated user
     */
    setUser: (state, action: PayloadAction<AuthUserState | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error state
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Handle logout
     */
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // Keep isInitialized true
    },

    /**
     * Update user's custom claims
     */
    updateUserClaims: (state, action: PayloadAction<Partial<AuthUserState>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },

    /**
     * Update user profile
     */
    updateUserProfile: (state, action: PayloadAction<Partial<AuthUserState>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

// Export actions
export const {
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
  updateUserClaims,
  updateUserProfile,
} = authSlice.actions;

// Selectors
interface RootStateWithAuth {
  auth: AuthState;
}

export const selectUser = (state: RootStateWithAuth) => state.auth.user;
export const selectIsAuthenticated = (state: RootStateWithAuth) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: RootStateWithAuth) => state.auth.isInitialized;
export const selectAuthLoading = (state: RootStateWithAuth) => state.auth.loading;
export const selectAuthError = (state: RootStateWithAuth) => state.auth.error;

// Role selectors
export const selectSystemRole = (state: RootStateWithAuth): SystemRole =>
  state.auth.user?.systemRole || 'user';
export const selectIsSystemAdmin = (state: RootStateWithAuth) =>
  state.auth.user?.systemRole === 'system_admin';
export const selectChurchRoles = (state: RootStateWithAuth): Record<string, ChurchRole> =>
  state.auth.user?.churchRoles || {};
export const selectPermissions = (state: RootStateWithAuth): Permission[] =>
  state.auth.user?.permissions || [];

// User info selectors
export const selectUserEmail = (state: RootStateWithAuth) => state.auth.user?.email;
export const selectUserDisplayName = (state: RootStateWithAuth) => state.auth.user?.displayName;
export const selectUserPhotoURL = (state: RootStateWithAuth) => state.auth.user?.photoURL;
export const selectEmailVerified = (state: RootStateWithAuth) =>
  state.auth.user?.emailVerified || false;

export default authSlice.reducer;
