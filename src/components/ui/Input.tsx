import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// Input variants following DATEN-SEE design system
const inputVariants = cva(
  // Base input styles
  [
    'block w-full px-3 py-2 border rounded-lg transition-all duration-200',
    'bg-surface-primary text-text-primary placeholder-text-tertiary',
    'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
    'disabled:bg-surface-secondary disabled:text-text-disabled disabled:cursor-not-allowed',
    'disabled:border-border-primary disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        default: 'border-border-primary',
        error: 'border-danger focus:ring-danger focus:border-danger',
        success: 'border-success focus:ring-success focus:border-success',
      },
      size: {
        sm: 'h-8 text-sm px-2',
        md: 'h-10 text-base px-3',
        lg: 'h-12 text-lg px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  label?: string;
}

/**
 * DATEN-SEE Input Component
 * Professional input field with icons, validation states, and helper text
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    leftIcon,
    rightIcon,
    error,
    helperText,
    label,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const hasError = Boolean(error);
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-tertiary">{leftIcon}</span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant: finalVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-text-tertiary">{rightIcon}</span>
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <p className={cn(
            'mt-1 text-sm',
            hasError ? 'text-danger' : 'text-text-tertiary'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof inputVariants>, 'size'> {
  error?: string;
  helperText?: string;
  label?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant,
    error,
    helperText,
    label,
    id,
    resize = 'vertical',
    rows = 3,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const hasError = Boolean(error);
    const finalVariant = hasError ? 'error' : variant;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x', 
      both: 'resize',
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            inputVariants({ variant: finalVariant, size: 'md' }),
            'min-h-[80px] py-2',
            resizeClasses[resize],
            className
          )}
          {...props}
        />

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <p className={cn(
            'mt-1 text-sm',
            hasError ? 'text-danger' : 'text-text-tertiary'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;