/**
 * Testing Utilities Index
 * Central export for all testing utilities
 */

// TanStack Query testing utilities
export {
  TestQueryWrapper,
  createTestQueryClient,
  withQueryClient,
} from './query-wrapper';

// Context provider testing utilities
export {
  TestContextWrapper,
  MinimalTestWrapper,
  AuthTestWrapper,
} from './context-wrapper';

// Custom hook testing utilities
export {
  renderHookWithQuery,
  renderHookWithContext,
  waitForQuery,
  mockTestData,
} from './custom-hooks';

// MSW (Mock Service Worker) utilities
export {
  handlers,
  authHandlers,
  dashboardHandlers,
  errorHandlers,
  resetMockData,
} from './msw-handlers';

export {
  server,
  worker,
  setupMSWForTests,
  setupMSWForBrowser,
  startMSW,
} from './msw-setup';

// Re-export types for convenience
export type { TestQueryWrapperProps } from './query-wrapper';
export type { TestContextWrapperProps } from './context-wrapper';
export type { RenderHookWithQueryOptions } from './custom-hooks';