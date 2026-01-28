/**
 * Auth Slice Tests
 */

import { describe, it, expect } from 'vitest';
import authReducer, {
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
  updateUserClaims,
  updateUserProfile,
  selectUser,
  selectIsAuthenticated,
  selectIsInitialized,
  selectAuthLoading,
  selectAuthError,
  selectSystemRole,
  selectIsSystemAdmin,
  selectChurchRoles,
  selectPermissions,
} from '../../store/slices/auth.slice';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    loading: false,
    error: null,
  };

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    systemRole: 'user',
    churchRoles: { 'church-1': 'member' },
    permissions: ['read:public'],
  };

  describe('Reducer', () => {
    it('should return initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('setUser', () => {
      it('should set user and mark as authenticated', () => {
        const state = authReducer(initialState, setUser(mockUser));

        expect(state.user).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isInitialized).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });

      it('should set user to null and mark as unauthenticated', () => {
        const authenticatedState = {
          ...initialState,
          user: mockUser,
          isAuthenticated: true,
        };

        const state = authReducer(authenticatedState, setUser(null));

        expect(state.user).toBe(null);
        expect(state.isAuthenticated).toBe(false);
        expect(state.isInitialized).toBe(true);
      });
    });

    describe('setLoading', () => {
      it('should set loading to true', () => {
        const state = authReducer(initialState, setLoading(true));
        expect(state.loading).toBe(true);
      });

      it('should set loading to false', () => {
        const loadingState = { ...initialState, loading: true };
        const state = authReducer(loadingState, setLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error and stop loading', () => {
        const loadingState = { ...initialState, loading: true };
        const error = 'Authentication failed';

        const state = authReducer(loadingState, setError(error));

        expect(state.error).toBe(error);
        expect(state.loading).toBe(false);
      });
    });

    describe('clearError', () => {
      it('should clear error', () => {
        const errorState = { ...initialState, error: 'Some error' };
        const state = authReducer(errorState, clearError());
        expect(state.error).toBe(null);
      });
    });

    describe('logout', () => {
      it('should clear user but keep isInitialized', () => {
        const authenticatedState = {
          user: mockUser,
          isAuthenticated: true,
          isInitialized: true,
          loading: false,
          error: null,
        };

        const state = authReducer(authenticatedState, logout());

        expect(state.user).toBe(null);
        expect(state.isAuthenticated).toBe(false);
        expect(state.isInitialized).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('updateUserClaims', () => {
      it('should update user claims when user exists', () => {
        const authenticatedState = {
          ...initialState,
          user: mockUser,
          isAuthenticated: true,
        };

        const state = authReducer(
          authenticatedState,
          updateUserClaims({ systemRole: 'system_admin' })
        );

        expect(state.user.systemRole).toBe('system_admin');
      });

      it('should do nothing when user is null', () => {
        const state = authReducer(
          initialState,
          updateUserClaims({ systemRole: 'system_admin' })
        );

        expect(state.user).toBe(null);
      });
    });

    describe('updateUserProfile', () => {
      it('should update user profile when user exists', () => {
        const authenticatedState = {
          ...initialState,
          user: mockUser,
          isAuthenticated: true,
        };

        const state = authReducer(
          authenticatedState,
          updateUserProfile({ displayName: 'New Name' })
        );

        expect(state.user.displayName).toBe('New Name');
        expect(state.user.email).toBe(mockUser.email); // Other fields unchanged
      });
    });
  });

  describe('Selectors', () => {
    const stateWithUser = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isInitialized: true,
        loading: false,
        error: null,
      },
    };

    const stateWithoutUser = {
      auth: initialState,
    };

    describe('Basic selectors', () => {
      it('selectUser should return user', () => {
        expect(selectUser(stateWithUser)).toEqual(mockUser);
        expect(selectUser(stateWithoutUser)).toBe(null);
      });

      it('selectIsAuthenticated should return authentication status', () => {
        expect(selectIsAuthenticated(stateWithUser)).toBe(true);
        expect(selectIsAuthenticated(stateWithoutUser)).toBe(false);
      });

      it('selectIsInitialized should return initialization status', () => {
        expect(selectIsInitialized(stateWithUser)).toBe(true);
        expect(selectIsInitialized(stateWithoutUser)).toBe(false);
      });

      it('selectAuthLoading should return loading status', () => {
        expect(selectAuthLoading(stateWithUser)).toBe(false);
        expect(selectAuthLoading({ auth: { ...initialState, loading: true } })).toBe(true);
      });

      it('selectAuthError should return error', () => {
        expect(selectAuthError(stateWithUser)).toBe(null);
        expect(selectAuthError({ auth: { ...initialState, error: 'Error' } })).toBe('Error');
      });
    });

    describe('Role selectors', () => {
      it('selectSystemRole should return system role or default', () => {
        expect(selectSystemRole(stateWithUser)).toBe('user');
        expect(selectSystemRole(stateWithoutUser)).toBe('user');
      });

      it('selectIsSystemAdmin should return true for system_admin', () => {
        expect(selectIsSystemAdmin(stateWithUser)).toBe(false);

        const adminState = {
          auth: {
            ...stateWithUser.auth,
            user: { ...mockUser, systemRole: 'system_admin' },
          },
        };
        expect(selectIsSystemAdmin(adminState)).toBe(true);
      });

      it('selectChurchRoles should return church roles or empty object', () => {
        expect(selectChurchRoles(stateWithUser)).toEqual({ 'church-1': 'member' });
        expect(selectChurchRoles(stateWithoutUser)).toEqual({});
      });

      it('selectPermissions should return permissions or empty array', () => {
        expect(selectPermissions(stateWithUser)).toEqual(['read:public']);
        expect(selectPermissions(stateWithoutUser)).toEqual([]);
      });
    });
  });
});
