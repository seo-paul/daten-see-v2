/**
 * E2E Tests for Authentication Flows
 * Tests complete user authentication journey
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login form when user is not authenticated', async ({ page }) => {
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login|anmelden/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByPlaceholder('Email').fill('invalid@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid|fehler|ungültig/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in valid test credentials
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    
    // Submit form
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**');
    
    // Check dashboard is loaded
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    await page.waitForURL('**/dashboard**');
    
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /logout|abmelden/i });
    await logoutButton.click();
    
    // Wait for redirect to login
    await page.waitForURL('/');
    
    // Check login form is visible again
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected dashboard route directly
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await page.waitForURL('/');
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    await page.waitForURL('**/dashboard**');
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    await expect(page.url()).toContain('dashboard');
  });

  test('should show loading state during authentication', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/api/auth/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Fill credentials and submit
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    
    // Check for loading state
    await expect(page.getByText(/loading|lädt/i)).toBeVisible();
  });
});

test.describe('Route Protection', () => {
  test('should protect dashboard routes when not authenticated', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/create',
      '/dashboard/settings',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should be redirected to login
      await page.waitForURL('/');
      await expect(page.getByPlaceholder('Email')).toBeVisible();
    }
  });

  test('should allow access to dashboard routes when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    await page.waitForURL('**/dashboard**');
    
    // Navigate to protected routes
    await page.goto('/dashboard/create');
    await expect(page.url()).toContain('/dashboard/create');
    
    await page.goto('/dashboard');
    await expect(page.url()).toContain('/dashboard');
  });
});

test.describe('Authentication State Management', () => {
  test('should handle token expiration gracefully', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    await page.waitForURL('**/dashboard**');
    
    // Mock expired token response
    await page.route('**/api/**', async route => {
      if (route.request().url().includes('/api/auth/me')) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Token expired' }),
        });
      } else {
        await route.continue();
      }
    });
    
    // Trigger an API call that would check auth
    await page.reload();
    
    // Should be redirected to login
    await page.waitForURL('/');
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('should handle network errors during authentication', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/login', async route => {
      await route.abort('failed');
    });
    
    // Try to login
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: /login|anmelden/i }).click();
    
    // Should show network error
    await expect(page.getByText(/network|verbindung|fehler/i)).toBeVisible();
  });
});