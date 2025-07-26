/**
 * MSW (Mock Service Worker) Setup
 * Browser and Node.js server configuration
 */

import { setupServer } from 'msw/node';

import { handlers } from './msw-handlers';

// Server for Node.js (tests)
export const server = setupServer(...handlers);

// Worker for browser will be created only when needed

/**
 * Setup MSW for test environment
 * Call in jest.setup.js or test files
 */
export function setupMSWForTests(): void {
  // For jest.setup.js - start server immediately
  server.listen({
    onUnhandledRequest: 'bypass',
  });
}

/**
 * Setup MSW for browser environment
 * Call in development or storybook
 */
export async function setupMSWForBrowser(): Promise<void> {
  if (typeof window !== 'undefined') {
    const { setupWorker } = await import('msw');
    const worker = setupWorker(...handlers);
    await worker.start({
      onUnhandledRequest: 'bypass',
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

/**
 * Individual test file setup
 * Use when you need MSW in specific test files
 */
export function setupMSWForTestFile(): void {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });
  
  beforeEach(() => {
    server.resetHandlers();
  });
  
  afterAll(() => {
    server.close();
  });
}

const mswUtils = {
  server,
  setupMSWForTests,
  setupMSWForBrowser,
  startMSW,
};

export default mswUtils;