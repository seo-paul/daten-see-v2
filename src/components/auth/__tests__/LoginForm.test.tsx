/**
 * LoginForm Component Tests - Simplified
 * Testing actual LoginForm functionality only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import * as authMutations from '@/hooks/auth/useAuthMutations';

import { LoginForm } from '../LoginForm';

// Mock Sentry to avoid errors in tests
jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
  getCurrentScope: jest.fn(() => ({ setTag: jest.fn(), setContext: jest.fn() })),
}));

// Mock logger to avoid console output in tests
jest.mock('@/lib/monitoring/logger.config', () => ({
  appLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the auth mutations hook
const mockMutateAsync = jest.fn();
const mockMutation = {
  mutateAsync: mockMutateAsync,
  isPending: false,
  error: null,
  isError: false,
  isSuccess: false,
  reset: jest.fn(),
};

// Mock the entire module to avoid property redefinition issues
jest.mock('@/hooks/auth/useAuthMutations', () => ({
  useLoginMutation: jest.fn(),
  useMockLoginMutation: jest.fn(),
}));

describe('LoginForm', (): void => {
  let queryClient: QueryClient;

  const renderLoginForm = (props = {}): any => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginForm {...props} />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  beforeEach((): void => {
    jest.clearAllMocks();
    
    // Setup the mock return value for useMockLoginMutation (which is used in LoginForm)
    (authMutations.useMockLoginMutation as jest.Mock).mockReturnValue(mockMutation);
    
    mockMutateAsync.mockResolvedValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      tokens: { accessToken: 'token', refreshToken: 'refresh' }
    });
  });

  // Core rendering test
  it('should render login form with email and password fields', (): void => {
    renderLoginForm();
    
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
  });

  // Successful login test
  it('should handle successful login submission', async (): Promise<void> => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    const submitButton = screen.getByRole('button', { name: /anmelden/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // Password visibility toggle test
  it('should toggle password visibility', async (): Promise<void> => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/passwort/i);
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(btn => btn !== screen.getByRole('button', { name: /anmelden/i }));

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });
});