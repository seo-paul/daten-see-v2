'use client';

import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useMockLoginMutation } from '@/hooks/auth/useAuthMutations';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

/**
 * Login Form Component
 * Demonstrates authentication with Context + TanStack Query
 */
export function LoginForm({ onSuccess, className = '' }: LoginFormProps): React.ReactElement {
  const { error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Use mock login mutation for development
  const loginMutation = useMockLoginMutation();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Clear any existing errors
    clearError();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // Call success callback
      onSuccess?.();
    } catch {
      // Error is already handled by the mutation's onError
      // Silently handle as error is already logged
    }
  };

  const handleInputChange = (field: 'email' | 'password') => 
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const isLoading = loginMutation.isPending;
  const error = authError || (loginMutation.error ? loginMutation.error.message : null);

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <LogIn className="mx-auto h-12 w-12 text-blue-600 mb-3" />
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-2">Access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Development Note */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-600">
              <strong>Development Mode:</strong> Any email/password will work. 
              Use &quot;error@test.com&quot; to test error handling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}