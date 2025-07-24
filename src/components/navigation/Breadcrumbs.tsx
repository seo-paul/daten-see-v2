'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';

import { useNavigation } from '@/contexts/NavigationContext';

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

/**
 * Breadcrumbs Component
 * Uses NavigationContext for state (no Zustand)
 */
export function Breadcrumbs({ 
  className = '', 
  showHome = true 
}: BreadcrumbsProps): React.ReactElement {
  const { breadcrumbs } = useNavigation();

  if (breadcrumbs.length === 0) {
    return <div className={className}></div>;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHome = breadcrumb.href === '/';

          return (
            <li key={breadcrumb.href} className="flex items-center">
              {/* Separator (not for first item) */}
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}

              {/* Breadcrumb Link */}
              {isLast ? (
                // Active/current page - no link
                <span 
                  className="font-medium text-gray-900 flex items-center"
                  aria-current="page"
                >
                  {isHome && showHome && <Home className="h-4 w-4 mr-1" />}
                  {breadcrumb.label}
                </span>
              ) : (
                // Clickable breadcrumb
                <Link
                  href={breadcrumb.href as Route}
                  className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                >
                  {isHome && showHome && <Home className="h-4 w-4 mr-1" />}
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Compact Breadcrumbs - shows only last 2 levels
 */
export function CompactBreadcrumbs({ className = '' }: { className?: string }): React.ReactElement {
  const { breadcrumbs } = useNavigation();

  // Show only last 2 breadcrumbs
  const compactBreadcrumbs = breadcrumbs.slice(-2);

  if (compactBreadcrumbs.length === 0) {
    return <div className={className}></div>;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Show ellipsis if we're truncating */}
        {breadcrumbs.length > 2 && (
          <li className="text-gray-400">
            <span>...</span>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 inline" />
          </li>
        )}

        {compactBreadcrumbs.map((breadcrumb, index) => {
          const isLast = index === compactBreadcrumbs.length - 1;

          return (
            <li key={breadcrumb.href} className="flex items-center">
              {/* Separator (not for first item) */}
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}

              {/* Breadcrumb Link */}
              {isLast ? (
                <span 
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href as Route}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}