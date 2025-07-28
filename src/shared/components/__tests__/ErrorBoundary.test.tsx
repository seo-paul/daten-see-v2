import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ErrorBoundary } from '../ErrorBoundary';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback) => {
    const mockScope = {
      setTag: jest.fn(),
      setLevel: jest.fn(),
      setContext: jest.fn(),
    };
    callback(mockScope);
    return 'mock-error-id';
  }),
  captureException: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/monitoring/logger.config', () => ({
  appLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected error tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Etwas ist schiefgelaufen')).toBeInTheDocument();
    expect(screen.getByText('Seite neu laden')).toBeInTheDocument();
  });

  it('should handle retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Etwas ist schiefgelaufen')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Seite neu laden'));

    // Simulate component not throwing error after retry
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should capture error in Sentry', () => {
    const sentry = require('@sentry/nextjs');
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' })
    );
  });
});