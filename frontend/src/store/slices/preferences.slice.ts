/**
 * Preferences Slice
 *
 * Manages user preferences in Redux:
 * - Language preference
 * - Theme preference
 * - Notification preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Language, ThemeMode } from '@ceslar/shared-types';

/**
 * Notification preferences
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

/**
 * Font size options
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * Preferences state
 */
export interface PreferencesState {
  language: Language;
  theme: ThemeMode;
  notifications: NotificationSettings;
  reducedMotion: boolean;
  fontSize: FontSize;
}

const initialState: PreferencesState = {
  language: 'es',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  reducedMotion: false,
  fontSize: 'medium',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    /**
     * Set language preference
     */
    setLanguage: (state, action: PayloadAction<Language>) => {
      const validLanguages: Language[] = ['es', 'en', 'pt'];
      if (validLanguages.includes(action.payload)) {
        state.language = action.payload;
      }
    },

    /**
     * Set theme preference
     */
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      const validThemes: ThemeMode[] = ['light', 'dark', 'system'];
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
    setNotificationPreference: (
      state,
      action: PayloadAction<{ type: keyof NotificationSettings; enabled: boolean }>
    ) => {
      const { type, enabled } = action.payload;
      if (type in state.notifications) {
        state.notifications[type] = enabled;
      }
    },

    /**
     * Update all notification preferences
     */
    setNotificationPreferences: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>
    ) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
    },

    /**
     * Set reduced motion preference
     */
    setReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.reducedMotion = action.payload;
    },

    /**
     * Set font size preference
     */
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      const validSizes: FontSize[] = ['small', 'medium', 'large'];
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
    loadPreferences: (state, action: PayloadAction<Partial<PreferencesState>>) => {
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
interface RootStateWithPreferences {
  preferences: PreferencesState;
}

export const selectLanguage = (state: RootStateWithPreferences): Language =>
  state.preferences.language;
export const selectTheme = (state: RootStateWithPreferences): ThemeMode =>
  state.preferences.theme;
export const selectNotificationPreferences = (
  state: RootStateWithPreferences
): NotificationSettings => state.preferences.notifications;
export const selectReducedMotion = (state: RootStateWithPreferences): boolean =>
  state.preferences.reducedMotion;
export const selectFontSize = (state: RootStateWithPreferences): FontSize =>
  state.preferences.fontSize;
export const selectAllPreferences = (state: RootStateWithPreferences): PreferencesState =>
  state.preferences;

export default preferencesSlice.reducer;
