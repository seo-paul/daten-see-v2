const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Memory optimization settings
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  
  // Coverage settings - strategic coverage only
  collectCoverageFrom: [
    'src/**/*.(js|jsx|ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/index.(js|ts)',
    '!src/**/*.stories.(js|jsx|ts|tsx)',
    '!src/components/ui/**', // Skip trivial UI components
    '!src/**/*.config.(js|ts)',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  
  // Module mapping for Next.js
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Enable manual mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Transform settings
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // Memory & performance optimizations
  testTimeout: 15000,
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Test execution optimizations
  testSequencer: '<rootDir>/node_modules/@jest/test-sequencer/build/index.js',
  verbose: false,
};

module.exports = createJestConfig(config);