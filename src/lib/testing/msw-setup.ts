/**
 * MSW (Mock Service Worker) Setup
 * Browser and Node.js server configuration
 */

import { setupServer } from 'msw/node';
import { setupWorker } from 'msw/browser';
import { handlers } from './msw-handlers';

// Server for Node.js (tests)
export const server = setupServer(...handlers);

// Worker for browser (development/storybook)
export const worker = setupWorker(...handlers);

/**
 * Setup MSW for test environment
 * Call in jest.setup.js or test files
 */
export function setupMSWForTests(): void {
  // Start server before all tests
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'warn',
    });
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });

  // Close server after all tests
  afterAll(() => {
    server.close();
  });
}

/**
 * Setup MSW for browser environment
 * Call in development or storybook
 */
export async function setupMSWForBrowser(): Promise<void> {
  if (typeof window !== 'undefined') {
    await worker.start({
      onUnhandledRequest: 'warn',
    });
  }
}

/**
 * Start MSW based on environment
 */
export async function startMSW(): Promise<void> {
  if (typeof window === 'undefined') {
    // Node.js environment (tests)
    setupMSWForTests();
  } else {
    // Browser environment
    await setupMSWForBrowser();
  }
}

export default {
  server,
  worker,
  setupMSWForTests,
  setupMSWForBrowser,
  startMSW,
};