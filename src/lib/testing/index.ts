/**
 * Testing Utilities Index
 * Central export for all testing utilities (cleaned up)
 */

// TanStack Query testing utilities
export {
  TestQueryWrapper,
  createTestQueryClient,
  withQueryClient,
} from './query-wrapper';

// Enhanced Auth testing utilities with DI support
export {
  BaseAuthWrapper,
  UnauthenticatedWrapper,
  AuthenticatedWrapper,
  AdminWrapper,
  ExpiredTokenWrapper,
  CustomTokenManagerWrapper,
  UniversalAuthWrapper,
} from './auth-wrapper';

// Token Manager Mock Scenarios
export { TokenManagerMockScenarios, createMockTokenManager } from './token-manager-mock';

// Re-export types for convenience
export type { TestQueryWrapperProps } from './query-wrapper';
export type { AuthWrapperProps, AuthTestScenario } from './auth-wrapper';