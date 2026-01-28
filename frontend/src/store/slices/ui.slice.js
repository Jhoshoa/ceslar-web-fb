/**
 * UI Slice
 *
 * Manages UI state in Redux:
 * - Sidebar state (open/collapsed)
 * - Modal state
 * - Snackbar notifications
 * - In-app notifications
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebar: {
    open: true,
    collapsed: false,
  },
  modal: {
    open: false,
    type: null,
    data: null,
  },
  snackbar: {
    open: false,
    message: '',
    severity: 'info', // 'success' | 'info' | 'warning' | 'error'
    autoHideDuration: 6000,
  },
  notifications: [],
  isLoading: false,
  loadingMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },
    setSidebarOpen: (state, action) => {
      state.sidebar.open = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebar.collapsed = action.payload;
    },

    // Modal actions
    openModal: (state, action) => {
      state.modal.open = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.type = null;
      state.modal.data = null;
    },
    setModalData: (state, action) => {
      state.modal.data = action.payload;
    },

    // Snackbar actions
    showSnackbar: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity || 'info';
      state.snackbar.autoHideDuration = action.payload.autoHideDuration ?? 6000;
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },

    // Convenience snackbar actions
    showSuccess: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'success';
      state.snackbar.autoHideDuration = 4000;
    },
    showError: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'error';
      state.snackbar.autoHideDuration = 8000;
    },
    showWarning: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'warning';
      state.snackbar.autoHideDuration = 6000;
    },
    showInfo: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'info';
      state.snackbar.autoHideDuration = 6000;
    },

    // Notification actions
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Loading actions
    setLoading: (state, action) => {
      if (typeof action.payload === 'boolean') {
        state.isLoading = action.payload;
        state.loadingMessage = '';
      } else {
        state.isLoading = action.payload.loading;
        state.loadingMessage = action.payload.message || '';
      }
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setModalData,
  showSnackbar,
  hideSnackbar,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  setLoading,
} = uiSlice.actions;

// Selectors
export const selectSidebar = (state) => state.ui.sidebar;
export const selectSidebarOpen = (state) => state.ui.sidebar.open;
export const selectSidebarCollapsed = (state) => state.ui.sidebar.collapsed;
export const selectModal = (state) => state.ui.modal;
export const selectSnackbar = (state) => state.ui.snackbar;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) =>
  state.ui.notifications.filter((n) => !n.read);
export const selectUnreadCount = (state) =>
  state.ui.notifications.filter((n) => !n.read).length;
export const selectIsLoading = (state) => state.ui.isLoading;
export const selectLoadingMessage = (state) => state.ui.loadingMessage;

export default uiSlice.reducer;
