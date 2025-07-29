import type { Metadata } from 'next';

import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { appLogger } from '@/lib/monitoring/logger.config';
import { QueryProvider } from '@/lib/query/provider';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

import './globals.css';

export const metadata: Metadata = {
  title: 'Daten See - Analytics Dashboard',
  description: 'SaaS Analytics Dashboard with Google API integrations',
  keywords: ['analytics', 'dashboard', 'google analytics', 'google ads', 'saas'],
  authors: [{ name: 'Daten See Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // For notched devices
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  // Log application startup
  if (typeof window === 'undefined') {
    appLogger.info('Application layout rendered', {
      component: 'root-layout',
      metadata: {
        userAgent: process.env.NODE_ENV,
      },
    });
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <NavigationProvider>
              <ErrorBoundary level="page" context={{ layout: 'root' }}>
                {children}
              </ErrorBoundary>
            </NavigationProvider>
          </AuthProvider>
        </QueryProvider>
        
        {/* Auto-Testing System for Development */}
        {process.env.NODE_ENV === 'development' && (
          <script src="/auto-testing-loader.js" async />
        )}
        
        {/* Development error overlay */}
        {process.env.NODE_ENV === 'development' && (
          <div id="development-overlay" className="fixed bottom-4 right-4 z-50">
            <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
              🚧 Development Mode - Auto-Testing Active
            </div>
          </div>
        )}
      </body>
    </html>
  );
}