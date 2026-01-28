/**
 * Redux Store Configuration
 *
 * This module configures the Redux store with:
 * - RTK Query middleware for API caching
 * - Redux Persist for auth and preferences persistence
 * - DevTools integration (development only)
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
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
import rootReducer from './rootReducer';
import { baseApi } from './api/baseApi';

// Persist configuration
const persistConfig = {
  key: 'ceslar-root',
  version: 1,
  storage,
  whitelist: ['auth', 'preferences'], // Only persist these slices
  blacklist: [baseApi.reducerPath], // Never persist API cache
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

// Enable refetch on focus/reconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

export default store;
