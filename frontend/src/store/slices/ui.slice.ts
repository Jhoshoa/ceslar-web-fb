/**
 * UI Slice
 *
 * Manages UI state in Redux:
 * - Sidebar state (open/collapsed)
 * - Modal state
 * - Snackbar notifications
 * - In-app notifications
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Snackbar severity levels
 */
export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * Sidebar state
 */
export interface SidebarState {
  open: boolean;
  collapsed: boolean;
}

/**
 * Modal state
 */
export interface ModalState {
  open: boolean;
  type: string | null;
  data: unknown | null;
}

/**
 * Snackbar state
 */
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  autoHideDuration: number;
}

/**
 * Notification item
 */
export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type?: string;
  timestamp: string;
  read: boolean;
}

/**
 * UI state
 */
export interface UIState {
  sidebar: SidebarState;
  modal: ModalState;
  snackbar: SnackbarState;
  notifications: NotificationItem[];
  isLoading: boolean;
  loadingMessage: string;
}

const initialState: UIState = {
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
    severity: 'info',
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
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.open = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },

    // Modal actions
    openModal: (
      state,
      action: PayloadAction<{ type: string; data?: unknown }>
    ) => {
      state.modal.open = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.type = null;
      state.modal.data = null;
    },
    setModalData: (state, action: PayloadAction<unknown>) => {
      state.modal.data = action.payload;
    },

    // Snackbar actions
    showSnackbar: (
      state,
      action: PayloadAction<{
        message: string;
        severity?: SnackbarSeverity;
        autoHideDuration?: number;
      }>
    ) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity || 'info';
      state.snackbar.autoHideDuration = action.payload.autoHideDuration ?? 6000;
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },

    // Convenience snackbar actions
    showSuccess: (state, action: PayloadAction<string>) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'success';
      state.snackbar.autoHideDuration = 4000;
    },
    showError: (state, action: PayloadAction<string>) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'error';
      state.snackbar.autoHideDuration = 8000;
    },
    showWarning: (state, action: PayloadAction<string>) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'warning';
      state.snackbar.autoHideDuration = 6000;
    },
    showInfo: (state, action: PayloadAction<string>) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'info';
      state.snackbar.autoHideDuration = 6000;
    },

    // Notification actions
    addNotification: (
      state,
      action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp' | 'read'>>
    ) => {
      state.notifications.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
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
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Loading actions
    setLoading: (
      state,
      action: PayloadAction<boolean | { loading: boolean; message?: string }>
    ) => {
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
interface RootStateWithUI {
  ui: UIState;
}

export const selectSidebar = (state: RootStateWithUI): SidebarState => state.ui.sidebar;
export const selectSidebarOpen = (state: RootStateWithUI): boolean => state.ui.sidebar.open;
export const selectSidebarCollapsed = (state: RootStateWithUI): boolean =>
  state.ui.sidebar.collapsed;
export const selectModal = (state: RootStateWithUI): ModalState => state.ui.modal;
export const selectSnackbar = (state: RootStateWithUI): SnackbarState => state.ui.snackbar;
export const selectNotifications = (state: RootStateWithUI): NotificationItem[] =>
  state.ui.notifications;
export const selectUnreadNotifications = (state: RootStateWithUI): NotificationItem[] =>
  state.ui.notifications.filter((n) => !n.read);
export const selectUnreadCount = (state: RootStateWithUI): number =>
  state.ui.notifications.filter((n) => !n.read).length;
export const selectIsLoading = (state: RootStateWithUI): boolean => state.ui.isLoading;
export const selectLoadingMessage = (state: RootStateWithUI): string =>
  state.ui.loadingMessage;

export default uiSlice.reducer;
