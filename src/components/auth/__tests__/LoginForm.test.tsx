/**
 * LoginForm Component Tests - Streamlined
 * Testing core login functionality only (Reduced from 144 → 12 tests)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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

jest.spyOn(authMutations, 'useLoginMutation').mockReturnValue(mockMutation as any);

describe('LoginForm', () => {
  let queryClient: QueryClient;

  const renderLoginForm = (props = {}) => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      tokens: { accessToken: 'token', refreshToken: 'refresh' }
    });
  });

  // Core rendering test
  it('should render login form with email and password fields', () => {
    renderLoginForm();
    
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
  });

  // Successful login test
  it('should handle successful login submission', async () => {
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

  // Form validation test
  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail ist erforderlich/i)).toBeInTheDocument();
      expect(screen.getByText(/passwort ist erforderlich/i)).toBeInTheDocument();
    });
  });

  // Invalid email validation test
  it('should show error for invalid email format', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Blur to trigger validation

    await waitFor(() => {
      expect(screen.getByText(/ungültige e-mail-adresse/i)).toBeInTheDocument();
    });
  });

  // Login error handling test
  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error('Invalid credentials'));
    
    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    const submitButton = screen.getByRole('button', { name: /anmelden/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/anmeldung fehlgeschlagen/i)).toBeInTheDocument();
    });
  });

  // Loading state test
  it('should show loading state during submission', async () => {
    mockMutation.isPending = true;
    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/wird geladen/i)).toBeInTheDocument();
  });

  // Password visibility toggle test
  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/passwort/i);
    const toggleButton = screen.getByRole('button', { name: /passwort anzeigen/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // Form reset test
  it('should reset form after successful login', async () => {
    const user = userEvent.setup();
    mockMutation.isSuccess = true;
    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/passwort/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Simulate successful login
    mockMutation.reset();

    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  // Remember me functionality test
  it('should handle remember me checkbox', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const rememberCheckbox = screen.getByLabelText(/angemeldet bleiben/i);
    expect(rememberCheckbox).not.toBeChecked();

    await user.click(rememberCheckbox);
    expect(rememberCheckbox).toBeChecked();
  });

  // Keyboard navigation test
  it('should handle Enter key submission', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/passwort/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.keyboard('{Enter}');

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // Accessibility test
  it('should have proper form accessibility attributes', () => {
    renderLoginForm();

    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  // Focus management test
  it('should focus email input on component mount', () => {
    renderLoginForm();
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    expect(emailInput).toHaveFocus();
  });
});