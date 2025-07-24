import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils/cn';

// Button variants with DATEN-SEE specific pressed-shadow effect
const buttonVariants = cva(
  // Base styles - all buttons share these
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 border-2 relative',
  {
    variants: {
      variant: {
        // PRIMARY: Beige background with dark blue text/border - HAUPT-BUTTONS
        primary: [
          'bg-[#F9F4EA] border-[#2F4F73] text-[#2F4F73] border-2',
          'hover:bg-[#F6F0E0] hover:border-[#2F4F73]',
          'active:bg-[#F3EBD6] active:border-[#2F4F73]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4F73] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ],
        
        // SECONDARY: Light blue background with white text - für Page Buttons (3px/5px mit hellblauem shadow)
        secondary: [
          'bg-[#6B9AC4] border-transparent text-white border-2',
          'hover:bg-[#5A89B3] hover:border-transparent',
          'active:bg-[#4A7BA2] active:border-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9AC4] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Override shadow for secondary buttons with light blue
          'shadow-[3px_5px_0px_0px_#A4C5E1]',
          'hover:shadow-none active:shadow-none',
        ],

        // Ghost button (transparent)
        ghost: [
          'bg-transparent border-transparent text-text-primary',
          'hover:bg-surface-secondary hover:border-transparent',
          'active:bg-surface-tertiary active:border-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ],

        // Destructive button
        destructive: [
          'bg-danger border-danger text-white border-2',
          'hover:bg-red-600 hover:border-red-600',
          'active:bg-red-700 active:border-red-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ],
      },
      
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',     // Standard size from design reference
        lg: 'h-12 px-6 text-lg',
      },
      
      // Context determines shadow offset (from your specifications)
      context: {
        navbar: [
          // Navbar buttons: 2px/3px shadow offset (dunkelblau für primary buttons)
          'shadow-[2px_3px_0px_0px_#2F4F73]',
          'hover:transform hover:translate-x-[2px] hover:translate-y-[3px] hover:shadow-none',
          'active:transform active:translate-x-[2px] active:translate-y-[3px] active:shadow-none',
        ],
        footer: [
          // Footer buttons: 2px/3px shadow offset (same as navbar)
          'shadow-[2px_3px_0px_0px_#2F4F73]',
          'hover:transform hover:translate-x-[2px] hover:translate-y-[3px] hover:shadow-none',
          'active:transform active:translate-x-[2px] active:translate-y-[3px] active:shadow-none',
        ],
        page: [
          // Page content buttons: 3px/5px shadow offset
          // Primary buttons: dunkelblau shadow
          // Secondary buttons: hellblau shadow (handled by individual variants)
          'shadow-[3px_5px_0px_0px_#2F4F73]',
          'hover:transform hover:translate-x-[3px] hover:translate-y-[5px] hover:shadow-none',
          'active:transform active:translate-x-[3px] active:translate-y-[5px] active:shadow-none',
        ],
        none: [], // No shadow effect
      },
      
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      context: 'page',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * DATEN-SEE Button Component
 * Features the signature "pressed button" shadow effect from design reference
 * 
 * Context determines shadow behavior:
 * - navbar/footer: 2px/4px offset
 * - page: 3px/5px offset  
 * - none: no shadow
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    context,
    fullWidth,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        )}
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </>
    );

    return (
      <button
        className={cn(buttonVariants({ variant, size, context, fullWidth }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Icon Button - square button for icons only with shadow effect
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, context = 'page', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 p-0',
      md: 'h-10 w-10 p-0', 
      lg: 'h-12 w-12 p-0',
    };

    return (
      <Button
        ref={ref}
        size={size}
        context={context}
        className={cn(sizeClasses[size || 'md'], className)}
        {...props}
      >
        <span className="flex items-center justify-center">
          {icon}
        </span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Pre-configured button variants for common use cases
 */

// Navbar buttons (Primary buttons mit navbar shadow 2px/3px)
export const NavbarButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'context'>>(
  (props, ref) => <Button ref={ref} context="navbar" variant="primary" {...props} />
);
NavbarButton.displayName = 'NavbarButton';

// Page action buttons (sekundäre buttons mit 3px/5px shadow)
export const PageButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'context'>>(
  (props, ref) => <Button ref={ref} context="page" variant="secondary" {...props} />
);
PageButton.displayName = 'PageButton';

// Widget control buttons (smaller, for widget interfaces)
export const WidgetButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'context' | 'size'>>(
  (props, ref) => <Button ref={ref} context="page" size="sm" variant="secondary" {...props} />
);
WidgetButton.displayName = 'WidgetButton';

export default Button;