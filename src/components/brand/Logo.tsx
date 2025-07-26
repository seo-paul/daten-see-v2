import React from 'react';

import { designTokens } from '@/lib/design/tokens';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'default' | 'white' | 'brand-primary';
}

/**
 * DATEN-SEE Logo Component
 * Professional logo system based on assets/logo.svg
 */
export function Logo({ 
  variant = 'full', 
  size = 'md', 
  className = '',
  color = 'default'
}: LogoProps): React.ReactElement {
  
  // Size mappings
  const sizeClasses = {
    sm: 'h-6',      // 24px
    md: 'h-8',      // 32px - default header size  
    lg: 'h-12',     // 48px
    xl: 'h-16',     // 64px
  };

  // Color mappings for SVG
  const colorStyles = {
    default: {
      primary: '#365c83',    // Original logo colors
      secondary: '#4375a2',
      tertiary: '#4a82b1', 
      accent: '#3d6992',
    },
    white: {
      primary: '#ffffff',
      secondary: '#f1f5f9',
      tertiary: '#e2e8f0',
      accent: '#cbd5e1',
    },
    'brand-primary': {
      primary: designTokens.colors.brand.primary,
      secondary: designTokens.colors.brand.primary,
      tertiary: designTokens.colors.brand.primary,
      accent: designTokens.colors.brand.primary,
    },
  };

  const colors = colorStyles[color];

  // Logo Icon (from assets/logo.svg)
  const LogoIcon = ({ className: iconClassName = '' }: { className?: string }): React.ReactElement => (
    <svg 
      className={iconClassName}
      viewBox="0 0 488.26 381.45" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DATEN-SEE Logo"
    >
      <path 
        fill={colors.primary}
        d="M487.94,379.51c-110.38-16.6-298.19-74.34-403.91-24.43l-29.44-37.16c104.41-76.89,294.93-47.89,408.19-30.17l25.16,91.76Z"
      />
      <path 
        fill={colors.accent}
        d="M430.18,266.06c-120.7-29.45-314.36-34-396.8,45.36L1.71,242.86c92.65-107.62,304.29-65.69,417.89-32.98l10.58,56.18Z"
      />
      <path 
        fill={colors.secondary}
        d="M64.57,173.57c120.17-32.76,313.37-13.33,395.11,33.6l4.09-89.44c-98.22-67.97-272.37-35.26-386.53-10.52l-12.67,66.36Z"
      />
      <path 
        fill={colors.tertiary}
        d="M42.17,103.22c117.91-44.19,318.93-61.76,399.87-16.99l-3.1-38.9C337.01-11.03,160.7-8.63,48.32,26.98l-6.15,76.24Z"
      />
    </svg>
  );

  // Logo Text
  const LogoText = ({ className: textClassName = '' }: { className?: string }): React.ReactElement => (
    <span 
      className={`font-display font-black tracking-tight ${textClassName}`}
      style={{ color: colors.primary }}
    >
      DATEN-SEE
    </span>
  );

  // Render based on variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <LogoIcon className={sizeClasses[size]} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <LogoText className={
          size === 'sm' ? 'text-lg' :
          size === 'md' ? 'text-xl' :
          size === 'lg' ? 'text-2xl' :
          'text-3xl'
        } />
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <LogoIcon className={sizeClasses[size]} />
      <LogoText className={
        size === 'sm' ? 'text-lg' :
        size === 'md' ? 'text-xl' :
        size === 'lg' ? 'text-2xl' :
        'text-3xl'
      } />
    </div>
  );
}

/**
 * Compact Logo for mobile/small spaces
 */
export function LogoCompact({ 
  size = 'md', 
  className = '',
  color = 'default'
}: Omit<LogoProps, 'variant'>): React.ReactElement {
  return <Logo variant="icon" size={size} className={className} color={color} />;
}

/**
 * Logo with link wrapper for navigation
 */
interface LogoLinkProps extends LogoProps {
  href?: string;
  onClick?: () => void;
}

export function LogoLink({ 
  href = '/', 
  onClick,
  ...logoProps 
}: LogoLinkProps): React.ReactElement {
  const handleClick = (e: React.MouseEvent): void => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className="inline-flex items-center hover:opacity-80 transition-opacity duration-200"
      aria-label="DATEN-SEE Homepage"
    >
      <Logo {...logoProps} />
    </a>
  );
}

export default Logo;