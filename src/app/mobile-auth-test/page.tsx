'use client';

import { useState } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';
import { MobileOptimizedAuthWrapper, MobileAuthFormContainer, MobileAuthInput, MobileAuthButton } from '@/components/auth/MobileOptimizedAuthWrapper';

/**
 * Mobile Authentication Test Page
 * Demonstrates mobile-responsive authentication flows
 */
export default function MobileAuthTestPage(): React.ReactElement {
  const [activeView, setActiveView] = useState<'overview' | 'login' | 'register' | 'mobile-demo'>('overview');
  const [demoFormData, setDemoFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleDemoInputChange = (field: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDemoFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (activeView === 'login') {
    return (
      <div className="min-h-screen bg-[#FEFCF9]">
        <div className="p-4">
          <button
            onClick={() => setActiveView('overview')}
            className="mb-4 px-4 py-2 text-[#2F4F73] bg-[#FBF5ED] rounded-md hover:bg-[#F6F0E0] transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
        <div className="flex items-center justify-center px-4">
          <LoginForm />
        </div>
      </div>
    );
  }

  if (activeView === 'mobile-demo') {
    return (
      <MobileOptimizedAuthWrapper
        title="Mobile Demo"
        subtitle="Testing mobile-optimized components"
        showBackButton
        onBack={() => setActiveView('overview')}
      >
        <MobileAuthFormContainer>
          <div className="space-y-4">
            <MobileAuthInput
              label="Email Address"
              type="email"
              value={demoFormData.email}
              onChange={handleDemoInputChange('email')}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
            
            <MobileAuthInput
              label="Password"
              type="password"
              value={demoFormData.password}
              onChange={handleDemoInputChange('password')}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            
            <MobileAuthInput
              label="Confirm Password"
              type="password"
              value={demoFormData.confirmPassword}
              onChange={handleDemoInputChange('confirmPassword')}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />
            
            <div className="space-y-3 pt-2">
              <MobileAuthButton
                type="submit"
                variant="primary"
              >
                Create Account
              </MobileAuthButton>
              
              <MobileAuthButton
                variant="secondary"
                onClick={() => setActiveView('overview')}
              >
                Cancel
              </MobileAuthButton>
            </div>
          </div>
        </MobileAuthFormContainer>
      </MobileOptimizedAuthWrapper>
    );
  }

  // Overview page
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Header */}
      <div className="bg-[#FDF9F3] shadow-sm border-b border-[#E6D7B8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3d3d3d]">Mobile Authentication Test</h1>
          <p className="text-sm sm:text-base text-[#5d5d5d] mt-2">
            Testing mobile responsiveness for all authentication flows
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Existing LoginForm */}
          <div className="bg-[#FDF9F3] rounded-lg shadow-sm border border-[#E6D7B8] p-6">
            <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">Existing LoginForm</h2>
            <p className="text-sm text-[#5d5d5d] mb-4">
              Enhanced with mobile-responsive improvements
            </p>
            <ul className="text-xs text-[#3d3d3d]/70 space-y-1 mb-4">
              <li>• Responsive padding and sizing</li>
              <li>• Touch-friendly button targets</li>
              <li>• Mobile-optimized text sizes</li>
              <li>• Improved form spacing</li>
            </ul>
            <button
              onClick={() => setActiveView('login')}
              className="w-full px-4 py-2 bg-[#2F4F73] text-white rounded-md hover:bg-[#365C83] transition-colors text-sm"
            >
              Test LoginForm
            </button>
          </div>

          {/* Mobile-Optimized Components */}
          <div className="bg-[#FDF9F3] rounded-lg shadow-sm border border-[#E6D7B8] p-6">
            <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">Mobile Components</h2>
            <p className="text-sm text-[#5d5d5d] mb-4">
              New mobile-first authentication components
            </p>
            <ul className="text-xs text-[#3d3d3d]/70 space-y-1 mb-4">
              <li>• Safe area support</li>
              <li>• Native mobile patterns</li>
              <li>• Optimized touch targets</li>
              <li>• Consistent spacing</li>
            </ul>
            <button
              onClick={() => setActiveView('mobile-demo')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Test Mobile Demo
            </button>
          </div>

          {/* Mobile Testing Guide */}
          <div className="bg-[#FDF9F3] rounded-lg shadow-sm border border-[#E6D7B8] p-6">
            <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">Testing Guide</h2>
            <p className="text-sm text-[#5d5d5d] mb-4">
              How to test mobile responsiveness
            </p>
            <ul className="text-xs text-[#3d3d3d]/70 space-y-1 mb-4">
              <li>• Open DevTools (F12)</li>
              <li>• Toggle device toolbar</li>
              <li>• Test iPhone/Android sizes</li>
              <li>• Check touch interactions</li>
              <li>• Verify text readability</li>
            </ul>
            <div className="space-y-2">
              <div className="text-xs text-[#3d3d3d]/50">
                Recommended test sizes:
              </div>
              <div className="text-xs text-[#3d3d3d]/70 space-y-1">
                <div>• iPhone SE: 375×667</div>
                <div>• iPhone 12: 390×844</div>
                <div>• Android: 360×640</div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-[#FBF5ED] border border-[#E6D7B8] rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#2F4F73] mb-3">📱 Mobile Responsiveness Status</h3>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-[#2F4F73] text-sm mb-2">✅ Completed</h4>
                <ul className="text-xs text-[#3d3d3d] space-y-1">
                  <li>• LoginForm mobile optimization</li>
                  <li>• Auth demo page responsiveness</li>
                  <li>• TopNavigation mobile menu</li>
                  <li>• ProtectedRoute loading states</li>
                  <li>• MainLayout mobile adjustments</li>
                  <li>• Viewport meta configuration</li>
                  <li>• Mobile component library</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-[#2F4F73] text-sm mb-2">🎯 Key Features</h4>
                <ul className="text-xs text-[#3d3d3d] space-y-1">
                  <li>• Touch-friendly 44px+ targets</li>
                  <li>• Responsive text sizing</li>
                  <li>• Safe area support</li>
                  <li>• Mobile-first breakpoints</li>
                  <li>• Optimized form spacing</li>
                  <li>• Proper viewport config</li>
                  <li>• Accessibility compliance</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-[#FDF9F3] rounded p-3 border border-[#E6D7B8]">
              <h4 className="font-medium text-[#2F4F73] text-sm mb-2">🧪 Test Checklist</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-[#3d3d3d]">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>iPhone portrait/landscape</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Android device testing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Touch interaction areas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Text readability</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Form field accessibility</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Navigation usability</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}