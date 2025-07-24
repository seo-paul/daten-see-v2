'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Menu, X, Settings, LogOut, User, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Logo, LogoCompact } from '@/components/brand/Logo';
import { NavbarButton, IconButton } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';


// Header variants for different page contexts
const headerVariants = cva(
  // Base styles - warm beige background from design system v2.3
  'bg-[#F9F4EA] border-b border-[#E6D7B8] shadow-sm',
  {
    variants: {
      variant: {
        // Standard header for most pages
        default: 'h-16',
        
        // Compact header for focused workflows
        compact: 'h-12',
        
        // Extended header with additional navigation
        extended: 'h-20',
      },
      
      position: {
        static: 'relative',
        sticky: 'sticky top-0 z-40',
        fixed: 'fixed top-0 left-0 right-0 z-50',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'sticky',
    },
  }
);

export interface HeaderLayoutProps extends VariantProps<typeof headerVariants> {
  className?: string;
  showNavigation?: boolean;
  showUserMenu?: boolean;
  customActions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

/**
 * DATEN-SEE Adaptive Header System v2.3
 * Features:
 * - Warm beige background (#F9F4EA) from design system v2.3
 * - Auth-integrated user menu
 * - Responsive mobile navigation
 * - Flexible variants for different page types
 * - Uses navbar button context (2px/3px shadow)
 */
const HeaderLayout = React.forwardRef<HTMLElement, HeaderLayoutProps>(({
  variant,
  position,
  className,
  showNavigation = true,
  showUserMenu = true,
  customActions,
  breadcrumbs,
}, _ref): React.ReactElement => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login' as any);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    { href: '/dashboards', label: 'Dashboards', icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/community', label: 'Community', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className={cn(headerVariants({ variant, position }), className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0">
              <Logo size="sm" className="hidden sm:block" />
              <LogoCompact size="sm" className="block sm:hidden" />
            </Link>
            
            {/* Breadcrumbs (if provided) */}
            {breadcrumbs && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-[#3d3d3d]">
                <span>/</span>
                {breadcrumbs}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href as any}>
                  <NavbarButton leftIcon={item.icon}>
                    {item.label}
                  </NavbarButton>
                </Link>
              ))}
            </nav>
          )}

          {/* Actions Section */}
          <div className="flex items-center space-x-3">
            
            {/* Custom Actions */}
            {customActions && (
              <div className="hidden sm:flex items-center space-x-2">
                {customActions}
              </div>
            )}

            {/* User Menu (Desktop) */}
            {showUserMenu && user && (
              <div className="hidden sm:flex items-center space-x-2">
                <NavbarButton 
                  leftIcon={<Settings className="w-4 h-4" />}
                  variant="secondary"
                >
                  Settings
                </NavbarButton>
                
                <NavbarButton 
                  leftIcon={<LogOut className="w-4 h-4" />}
                  variant="secondary"
                  onClick={handleLogout}
                >
                  Logout
                </NavbarButton>
              </div>
            )}

            {/* Login Button (if not authenticated) */}
            {showUserMenu && !user && (
              <Link href={'/login' as any} className="hidden sm:block">
                <NavbarButton leftIcon={<User className="w-4 h-4" />}>
                  Login
                </NavbarButton>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              context="navbar"
              variant="secondary"
              size="md"
              icon={mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden"
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#F9F4EA] border-b border-[#E6D7B8] shadow-lg z-50">
            <div className="px-4 py-4 space-y-3">
              
              {/* Mobile Navigation Items */}
              {showNavigation && navigationItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <NavbarButton 
                    leftIcon={item.icon}
                    fullWidth
                    variant="secondary"
                  >
                    {item.label}
                  </NavbarButton>
                </Link>
              ))}

              {/* Mobile Custom Actions */}
              {customActions && (
                <div className="border-t border-[#E6D7B8] pt-3 space-y-2">
                  {customActions}
                </div>
              )}

              {/* Mobile User Menu */}
              {showUserMenu && user && (
                <div className="border-t border-[#E6D7B8] pt-3 space-y-2">
                  <NavbarButton 
                    leftIcon={<Settings className="w-4 h-4" />}
                    variant="secondary"
                    fullWidth
                  >
                    Settings
                  </NavbarButton>
                  
                  <NavbarButton 
                    leftIcon={<LogOut className="w-4 h-4" />}
                    variant="secondary"
                    fullWidth
                    onClick={handleLogout}
                  >
                    Logout
                  </NavbarButton>
                </div>
              )}

              {/* Mobile Login Button */}
              {showUserMenu && !user && (
                <div className="border-t border-[#E6D7B8] pt-3">
                  <Link href={'/login' as any} onClick={() => setMobileMenuOpen(false)}>
                    <NavbarButton 
                      leftIcon={<User className="w-4 h-4" />}
                      fullWidth
                    >
                      Login
                    </NavbarButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
});
HeaderLayout.displayName = 'HeaderLayout';

/**
 * Pre-configured header variants for common use cases
 */

// Standard page header
export const StandardHeader = React.forwardRef<HTMLElement, Omit<HeaderLayoutProps, 'variant'>>((props, ref) => (
  <HeaderLayout ref={ref} variant="default" {...props} />
));
StandardHeader.displayName = 'StandardHeader';

// Compact header for dashboards
export const CompactHeader = React.forwardRef<HTMLElement, Omit<HeaderLayoutProps, 'variant'>>((props, ref) => (
  <HeaderLayout ref={ref} variant="compact" {...props} />
));
CompactHeader.displayName = 'CompactHeader';

// Extended header with more navigation
export const ExtendedHeader = React.forwardRef<HTMLElement, Omit<HeaderLayoutProps, 'variant'>>((props, ref) => (
  <HeaderLayout ref={ref} variant="extended" {...props} />
));
ExtendedHeader.displayName = 'ExtendedHeader';

export default HeaderLayout;