/**
 * Root Reducer
 *
 * Combines all Redux slices and RTK Query API into a single root reducer.
 */

import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './slices/auth.slice';
import uiReducer from './slices/ui.slice';
import preferencesReducer from './slices/preferences.slice';

const rootReducer = combineReducers({
  // RTK Query API
  [baseApi.reducerPath]: baseApi.reducer,

  // Regular slices
  auth: authReducer,
  ui: uiReducer,
  preferences: preferencesReducer,
});

export default rootReducer;
