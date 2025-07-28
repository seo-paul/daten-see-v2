import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { TokenManagerMockScenarios } from '@/lib/testing/token-manager-mock';

import { MainLayout } from '../MainLayout';

// Mock TopNavigation component
jest.mock('../TopNavigation', () => ({
  TopNavigation: () => <nav data-testid="top-navigation">Top Navigation</nav>,
}));

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/monitoring/logger.config', () => ({
  appLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const mockTokenManager = TokenManagerMockScenarios.authenticatedUser();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider tokenManager={mockTokenManager}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('MainLayout', () => {
  it('should render with authenticated user', () => {
    render(
      <TestWrapper>
        <MainLayout>
          <div data-testid="main-content">Test Content</div>
        </MainLayout>
      </TestWrapper>
    );

    expect(screen.getByTestId('top-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('should render children in main element', () => {
    render(
      <TestWrapper>
        <MainLayout>
          <h1>Test Content</h1>
        </MainLayout>
      </TestWrapper>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toContainElement(screen.getByRole('heading'));
  });

  it('should apply custom className to main element', () => {
    render(
      <TestWrapper>
        <MainLayout className="custom-class">
          <div>Content</div>
        </MainLayout>
      </TestWrapper>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('custom-class');
  });
});