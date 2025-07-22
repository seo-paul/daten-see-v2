import { test, expect } from '@playwright/test';

test.describe('Dashboard Management System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboards');
  });

  test('should load and display mock dashboards', async ({ page }) => {
    // Wait for the page to fully load and client-side rendering to complete
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard data to load (mock has 500ms delay)
    await page.waitForTimeout(1000);
    
    // Check if mock dashboards are displayed
    await expect(page.getByText('Sales Analytics')).toBeVisible();
    await expect(page.getByText('Marketing Dashboard')).toBeVisible();
    await expect(page.getByText('Operations Monitor')).toBeVisible();
    
    // Check dashboard count indicator
    await expect(page.getByText('3 Dashboards verfügbar')).toBeVisible();
  });

  test('should navigate to individual dashboard', async ({ page }) => {
    // Wait for dashboards to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click on Sales Analytics dashboard
    await page.getByText('Sales Analytics').click();
    
    // Should navigate to dashboard detail page
    await expect(page).toHaveURL(/\/dashboard\/dash-1/);
    
    // Wait for dashboard detail to load (300ms delay)
    await page.waitForTimeout(500);
    
    // Should display dashboard content
    await expect(page.getByText('Sales Analytics')).toBeVisible();
    await expect(page.getByText('Zurück zur Übersicht')).toBeVisible();
  });

  test('should show create dashboard modal', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Click create new dashboard button
    await page.getByText('Neues Dashboard').click();
    
    // Should show modal
    await expect(page.getByText('Neues Dashboard erstellen')).toBeVisible();
    await expect(page.getByPlaceholder('z.B. Sales Analytics')).toBeVisible();
    
    // Close modal
    await page.getByText('Abbrechen').click();
    await expect(page.getByText('Neues Dashboard erstellen')).not.toBeVisible();
  });

  test('should create new dashboard', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open create modal
    await page.getByText('Neues Dashboard').click();
    
    // Fill form
    await page.getByPlaceholder('z.B. Sales Analytics').fill('Test Dashboard');
    await page.getByPlaceholder('Beschreibe das Dashboard und seinen Zweck...').fill('This is a test dashboard created by E2E tests');
    
    // Submit form
    await page.getByRole('button', { name: 'Dashboard erstellen' }).click();
    
    // Should close modal and show new dashboard
    await expect(page.getByText('Neues Dashboard erstellen')).not.toBeVisible();
    
    // Wait for creation (800ms delay) and refresh
    await page.waitForTimeout(1000);
    
    // Should show the new dashboard
    await expect(page.getByRole('heading', { name: 'Test Dashboard' })).toBeVisible();
    await expect(page.getByText('4 Dashboards verfügbar')).toBeVisible();
  });

  test('should show empty state initially on fresh load', async ({ page }) => {
    // Check initial empty state before data loads
    await expect(page.getByText('Neues Dashboard')).toBeVisible();
    
    // Should show loading or empty state initially
    const hasEmptyState = await page.getByText('Noch keine Dashboards erstellt').isVisible();
    const hasLoadingState = await page.getByText('Lade Dashboard').isVisible();
    
    expect(hasEmptyState || hasLoadingState).toBeTruthy();
  });
});