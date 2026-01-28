/**
 * Test Utilities
 *
 * Custom render function that wraps components with necessary providers.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { lightTheme } from '../theme';
import rootReducer from '../store/rootReducer';
import { baseApi } from '../store/api/baseApi';

/**
 * Create a test store with optional preloaded state
 */
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(baseApi.middleware),
    preloadedState,
  });
}

/**
 * Custom render function that wraps components with providers
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = '/',
    ...renderOptions
  } = {}
) {
  // Set initial route
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={lightTheme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Create mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    ...overrides,
  };
}

/**
 * Create mock auth state
 */
export function createMockAuthState(overrides = {}) {
  return {
    auth: {
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      loading: false,
      error: null,
      ...overrides,
    },
  };
}

/**
 * Create authenticated auth state
 */
export function createAuthenticatedState(userOverrides = {}) {
  const user = createMockUser(userOverrides);
  return createMockAuthState({
    user,
    isAuthenticated: true,
  });
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingToFinish() {
  // Wait for any loading states to resolve
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
