/**
 * Mock Exports for Auth Module
 * Centralized exports for all auth-related mocks
 */

export {
  tokenManager,
  createMockTokenManager,
  createAuthenticatedMockState,
  createUnauthenticatedMockState,
  createExpiredTokenMockState,
  type MockTokenManager,
} from './token';

// Re-export types from the real module for testing
export type { TokenData, StoredTokenInfo } from '../token';