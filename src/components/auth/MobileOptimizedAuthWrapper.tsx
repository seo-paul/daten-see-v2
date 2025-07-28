'use client';

import { ReactNode } from 'react';

interface MobileOptimizedAuthWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

/**
 * Mobile-Optimized Authentication Wrapper
 * Provides consistent mobile-first layout for all auth flows
 */
export function MobileOptimizedAuthWrapper({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  className = ''
}: MobileOptimizedAuthWrapperProps): React.ReactElement {
  return (
    <div className={`min-h-screen bg-[#FEFCF9] flex flex-col ${className}`}>
      {/* Mobile-optimized header */}
      <div className="safe-area-inset-top bg-[#FDF9F3] shadow-sm border-b border-[#E6D7B8]">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {showBackButton && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 -ml-2 text-[#3d3d3d]/60 hover:text-[#3d3d3d] hover:bg-[#F6F0E0] rounded-md transition-colors touch-manipulation"
                aria-label="Zurück"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div className={`${showBackButton ? 'flex-1 text-center' : ''}`}>
              <h1 className="text-lg sm:text-xl font-semibold text-[#3d3d3d]">{title}</h1>
              {subtitle && (
                <p className="text-sm text-[#5d5d5d] mt-1">{subtitle}</p>
              )}
            </div>
            
            {showBackButton && <div className="w-9" />} {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm sm:max-w-md">
          {children}
        </div>
      </div>

      {/* Mobile-safe bottom area */}
      <div className="safe-area-inset-bottom h-safe-area-inset-bottom" />
    </div>
  );
}

/**
 * Mobile-optimized form container
 */
export function MobileAuthFormContainer({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div className={`bg-[#FDF9F3] rounded-lg shadow-sm border border-[#E6D7B8] p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized input field
 */
export function MobileAuthInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  autoComplete,
  autoFocus = false,
  className = ''
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
}): React.ReactElement {
  const inputId = `mobile-auth-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[#3d3d3d]"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`
          w-full px-3 py-3 sm:py-2.5 
          text-base sm:text-sm 
          border rounded-md shadow-sm 
          placeholder-[#3d3d3d]/50 
          focus:outline-none focus:ring-2 focus:ring-[#2F4F73] focus:border-[#2F4F73]
          disabled:bg-[#F6F0E0] disabled:cursor-not-allowed
          ${error ? 'border-red-300 text-red-900' : 'border-[#E6D7B8]'}
          transition-colors
        `}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * Mobile-optimized button
 */
export function MobileAuthButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  className = ''
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}): React.ReactElement {
  const baseClasses = `
    w-full flex items-center justify-center 
    px-4 py-3 sm:py-2.5 
    text-base sm:text-sm font-medium 
    rounded-md shadow-sm 
    transition-colors 
    touch-manipulation
    disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantClasses = {
    primary: `
      text-white bg-[#2F4F73] hover:bg-[#365C83] 
      focus:ring-[#2F4F73] 
      disabled:bg-[#3d3d3d]/40
    `,
    secondary: `
      text-[#3d3d3d] bg-[#FDF9F3] border border-[#E6D7B8] hover:bg-[#F6F0E0] 
      focus:ring-[#2F4F73] 
      disabled:bg-[#F6F0E0] disabled:text-[#3d3d3d]/40
    `,
    danger: `
      text-white bg-red-600 hover:bg-red-700 
      focus:ring-red-500 
      disabled:bg-[#3d3d3d]/40
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}