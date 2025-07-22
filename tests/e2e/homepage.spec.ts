import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage correctly', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/Daten See/);
    
    // Check for essential elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no console errors (except known Next.js development warnings)
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Allow time for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Filter out known Next.js development warnings
    const criticalErrors = logs.filter(log => 
      !log.includes('Hydration') && 
      !log.includes('Warning:') &&
      !log.includes('Download the React DevTools')
    );
    
    expect(criticalErrors).toEqual([]);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if content is still accessible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for horizontal scroll (should not exist)
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 1); // +1 for rounding
  });

  test('should handle navigation correctly', async ({ page, isMobile }) => {
    // On mobile, first open the menu
    if (isMobile) {
      const menuButton = page.locator('button[aria-label="Menü öffnen"]');
      await menuButton.click();
      
      // Wait for menu to be visible
      await page.waitForSelector('nav.md\\:hidden', { state: 'visible' });
    }
    
    // Test basic navigation if navigation elements exist
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Click first navigation link if it exists
      await navLinks.first().click();
      
      // Should still be on the domain
      expect(page.url()).toContain('localhost:3000');
    }
  });
});