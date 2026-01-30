/**
 * Frontend Types Index
 *
 * Re-exports shared types and adds frontend-specific types.
 */

// Re-export all shared types
export * from '@ceslar/shared-types';

// ============================================
// FRONTEND-SPECIFIC TYPES
// ============================================

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  index?: boolean;
}

/**
 * Navigation item
 */
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

/**
 * Toast/Notification types
 */
export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  autoHideDuration?: number;
}

/**
 * Form field state
 */
export interface FieldState<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}

/**
 * Dialog state
 */
export interface DialogState {
  open: boolean;
  data?: unknown;
}

/**
 * Loading state for async operations
 */
export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Redux store types
 */
export interface RootState {
  auth: AuthSliceState;
  preferences: PreferencesSliceState;
  ui: UISliceState;
  [key: string]: unknown;
}

/**
 * Auth slice state
 */
export interface AuthSliceState {
  user: import('@ceslar/shared-types').AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Preferences slice state
 */
export interface PreferencesSliceState {
  language: import('@ceslar/shared-types').Language;
  theme: import('@ceslar/shared-types').ThemeMode;
}

/**
 * UI slice state
 */
export interface UISliceState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toasts: ToastMessage[];
}
