/**
 * Preferences Slice
 *
 * Manages user preferences in Redux:
 * - Language preference
 * - Theme preference
 * - Notification preferences
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'es', // 'es' | 'en' | 'pt'
  theme: 'light', // 'light' | 'dark' | 'system'
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  // Accessibility
  reducedMotion: false,
  fontSize: 'medium', // 'small' | 'medium' | 'large'
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    /**
     * Set language preference
     */
    setLanguage: (state, action) => {
      const validLanguages = ['es', 'en', 'pt'];
      if (validLanguages.includes(action.payload)) {
        state.language = action.payload;
      }
    },

    /**
     * Set theme preference
     */
    setTheme: (state, action) => {
      const validThemes = ['light', 'dark', 'system'];
      if (validThemes.includes(action.payload)) {
        state.theme = action.payload;
      }
    },

    /**
     * Toggle theme between light and dark
     */
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    /**
     * Set notification preferences
     */
    setNotificationPreference: (state, action) => {
      const { type, enabled } = action.payload;
      if (type in state.notifications) {
        state.notifications[type] = enabled;
      }
    },

    /**
     * Update all notification preferences
     */
    setNotificationPreferences: (state, action) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
    },

    /**
     * Set reduced motion preference
     */
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload;
    },

    /**
     * Set font size preference
     */
    setFontSize: (state, action) => {
      const validSizes = ['small', 'medium', 'large'];
      if (validSizes.includes(action.payload)) {
        state.fontSize = action.payload;
      }
    },

    /**
     * Reset all preferences to defaults
     */
    resetPreferences: () => initialState,

    /**
     * Load preferences from user profile
     */
    loadPreferences: (state, action) => {
      const prefs = action.payload;
      if (prefs.language) state.language = prefs.language;
      if (prefs.theme) state.theme = prefs.theme;
      if (prefs.notifications) {
        state.notifications = { ...state.notifications, ...prefs.notifications };
      }
      if (typeof prefs.reducedMotion === 'boolean') {
        state.reducedMotion = prefs.reducedMotion;
      }
      if (prefs.fontSize) state.fontSize = prefs.fontSize;
    },
  },
});

// Export actions
export const {
  setLanguage,
  setTheme,
  toggleTheme,
  setNotificationPreference,
  setNotificationPreferences,
  setReducedMotion,
  setFontSize,
  resetPreferences,
  loadPreferences,
} = preferencesSlice.actions;

// Selectors
export const selectLanguage = (state) => state.preferences.language;
export const selectTheme = (state) => state.preferences.theme;
export const selectNotificationPreferences = (state) => state.preferences.notifications;
export const selectReducedMotion = (state) => state.preferences.reducedMotion;
export const selectFontSize = (state) => state.preferences.fontSize;
export const selectAllPreferences = (state) => state.preferences;

export default preferencesSlice.reducer;
