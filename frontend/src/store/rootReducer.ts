/**
 * Root Reducer
 *
 * Combines all Redux slices and RTK Query API into a single root reducer.
 */

import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer, { AuthState } from './slices/auth.slice';
import uiReducer, { UIState } from './slices/ui.slice';
import preferencesReducer, { PreferencesState } from './slices/preferences.slice';

/**
 * Root state type
 */
export interface RootState {
  [baseApi.reducerPath]: ReturnType<typeof baseApi.reducer>;
  auth: AuthState;
  ui: UIState;
  preferences: PreferencesState;
}

const rootReducer = combineReducers({
  // RTK Query API
  [baseApi.reducerPath]: baseApi.reducer,

  // Regular slices
  auth: authReducer,
  ui: uiReducer,
  preferences: preferencesReducer,
});

export default rootReducer;
