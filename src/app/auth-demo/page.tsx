'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Authentication Demo Page
 * Demonstrates the complete authentication flow
 */
export default function AuthDemoPage(): React.ReactElement {
  const { user, isAuthenticated, isLoading, logout, getAccessToken } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#3d3d3d]/70">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#3d3d3d] mb-2">Authentication Demo</h1>
            <p className="text-[#3d3d3d]/70">Testing the Modern Stack Authentication</p>
          </div>
          
          <LoginForm onSuccess={() => {
            // Login successful - redirecting...
          }} />
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#FDF9F3] rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#3d3d3d] mb-4">Authentication Success! 🎉</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Info */}
            <div>
              <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">User Information</h2>
              <div className="space-y-2">
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> <span className="px-2 py-1 bg-[#F9F2E7] text-[#3d3d3d] rounded text-sm">{user?.role}</span></p>
              </div>
            </div>

            {/* Auth Status */}
            <div>
              <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">Authentication Status</h2>
              <div className="space-y-2">
                <p><strong>Status:</strong> <span className="text-green-600">✅ Authenticated</span></p>
                <p><strong>Token:</strong> <span className="text-xs text-[#3d3d3d]/60">{getAccessToken()?.substring(0, 20)}...</span></p>
                <p><strong>Loading:</strong> {isLoading ? '⏳ Loading' : '✅ Ready'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E6D7B8]">
            <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">Actions</h2>
            <div className="flex space-x-4">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
              
              <button
                onClick={() => {
                  const token = getAccessToken();
                  if (token) {
                    navigator.clipboard.writeText(token);
                    alert('Token copied to clipboard!');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Copy Token
              </button>
            </div>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-[#FBF5ED] border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#3d3d3d] mb-2">🔧 Development Info</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Authentication uses React Context (no Zustand)</li>
              <li>• Token management with localStorage</li>
              <li>• TanStack Query mutations for login/logout</li>
              <li>• Auto token refresh every 5 minutes</li>
              <li>• Mock API responses for development</li>
            </ul>
            
            <div className="mt-4 p-3 bg-[#FDF9F3] rounded border">
              <h4 className="font-semibold text-[#3d3d3d] mb-2">🔍 Check DevTools:</h4>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• F12 → Application → Local Storage → auth tokens</li>
                <li>• F12 → React Query tab → mutations & queries</li>
                <li>• Console → auth-related logs</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}