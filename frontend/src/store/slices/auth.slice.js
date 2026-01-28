/**
 * Auth Slice
 *
 * Manages authentication state in Redux:
 * - User information and authentication status
 * - Loading and error states
 * - Role-based selectors
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
    },

    /**
     * Set loading state
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set error state
     */
    setError: (state, action) => {
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
    updateUserClaims: (state, action) => {
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
    updateUserProfile: (state, action) => {
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
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Role selectors
export const selectSystemRole = (state) => state.auth.user?.systemRole || 'user';
export const selectIsSystemAdmin = (state) => state.auth.user?.systemRole === 'system_admin';
export const selectChurchRoles = (state) => state.auth.user?.churchRoles || {};
export const selectPermissions = (state) => state.auth.user?.permissions || [];

// User info selectors
export const selectUserEmail = (state) => state.auth.user?.email;
export const selectUserDisplayName = (state) => state.auth.user?.displayName;
export const selectUserPhotoURL = (state) => state.auth.user?.photoURL;
export const selectEmailVerified = (state) => state.auth.user?.emailVerified || false;

export default authSlice.reducer;
