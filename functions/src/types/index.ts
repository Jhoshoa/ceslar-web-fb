/**
 * Functions Types Index
 *
 * Re-exports shared types and function-specific types.
 */

// Re-export all shared types
export * from '@ceslar/shared-types';

// Export Express extensions
export type {
  AuthenticatedUser,
  AuthenticatedRequest,
  RequiredAuthRequest,
} from './express';
