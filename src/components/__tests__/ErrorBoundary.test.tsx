import { render, screen } from '@testing-library/react';
import { TestQueryWrapper } from '@/lib/testing';

import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <TestQueryWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestQueryWrapper>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <TestQueryWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestQueryWrapper>
    );

    // Check for error message
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/We apologize for the inconvenience/i)).toBeInTheDocument();
  });

  it('shows retry button in error state', () => {
    render(
      <TestQueryWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestQueryWrapper>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';

    render(
      <TestQueryWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestQueryWrapper>
    );

    // In development, should show more details
    expect(screen.getByText(/Error Details/i)).toBeInTheDocument();

    (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv;
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <TestQueryWrapper>
        <ErrorBoundary className="custom-error-class">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestQueryWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-error-class');
  });
});