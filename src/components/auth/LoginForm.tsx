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
    <div className={`max-w-md mx-auto px-4 sm:px-0 ${className}`}>
      <div className="bg-[#FDF9F3] rounded-lg shadow-md p-4 sm:p-6">
        <div className="text-center mb-6">
          <LogIn className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[#2F4F73] mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#3d3d3d]">Anmeldung</h2>
          <p className="text-sm sm:text-base text-[#3d3d3d]/70 mt-2">Zugriff auf Ihr Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3d3d3d] mb-1">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-[#E6D7B8] rounded-md shadow-sm placeholder-[#3d3d3d]/50 focus:outline-none focus:ring-[#2F4F73] focus:border-[#2F4F73] disabled:bg-[#F6F0E0] disabled:cursor-not-allowed"
              placeholder="Ihre E-Mail eingeben"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#3d3d3d] mb-1">
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                className="w-full px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm border border-[#E6D7B8] rounded-md shadow-sm placeholder-[#3d3d3d]/50 focus:outline-none focus:ring-[#2F4F73] focus:border-[#2F4F73] disabled:bg-[#F6F0E0] disabled:cursor-not-allowed"
                placeholder="Ihr Passwort eingeben"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-[#3d3d3d]/50" />
                ) : (
                  <Eye className="h-4 w-4 text-[#3d3d3d]/50" />
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
            className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-[#2F4F73] hover:bg-[#365C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F4F73] disabled:bg-[#3d3d3d]/40 disabled:cursor-not-allowed touch-manipulation"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Anmeldung läuft...
              </span>
            ) : (
              'Anmelden'
            )}
          </button>
        </form>

        {/* Development Note */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-[#FBF5ED] border border-[#E6D7B8] rounded-md">
            <p className="text-xs sm:text-xs leading-relaxed text-[#2F4F73]">
              <strong>Development Mode:</strong> Any email/password will work. 
              Use &quot;error@test.com&quot; to test error handling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}