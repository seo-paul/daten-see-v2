import { appLogger } from '../logger.config';

// Mock console methods to avoid actual logging during tests
const consoleSpy = {
  debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
  info: jest.spyOn(console, 'info').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
};

// Mock Sentry to avoid actual error tracking during tests
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn(),
}));

describe('appLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('debug method', () => {
    it('should exist and be callable', () => {
      expect(typeof appLogger.debug).toBe('function');
      
      // Should not throw when called
      expect(() => {
        appLogger.debug('Test debug message');
      }).not.toThrow();
    });

    it('should handle context parameter', () => {
      expect(() => {
        appLogger.debug('Test debug message', { userId: 'test-123' });
      }).not.toThrow();
    });
  });

  describe('info method', () => {
    it('should exist and be callable', () => {
      expect(typeof appLogger.info).toBe('function');
      
      expect(() => {
        appLogger.info('Test info message');
      }).not.toThrow();
    });
  });

  describe('warn method', () => {
    it('should exist and be callable', () => {
      expect(typeof appLogger.warn).toBe('function');
      
      expect(() => {
        appLogger.warn('Test warning message');
      }).not.toThrow();
    });
  });

  describe('error method', () => {
    it('should exist and be callable', () => {
      expect(typeof appLogger.error).toBe('function');
      
      expect(() => {
        appLogger.error('Test error message');
      }).not.toThrow();
    });

    it('should handle error context', () => {
      expect(() => {
        appLogger.error('Test error message', { 
          error: new Error('test'), 
          userId: 'test-123' 
        });
      }).not.toThrow();
    });
  });

  // Basic logging functionality tests cover core requirements
  // Additional methods (performance, userAction, apiCall) are tested through integration
});