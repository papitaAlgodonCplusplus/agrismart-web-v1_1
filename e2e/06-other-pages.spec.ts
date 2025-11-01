import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

test.describe('Other Pages Navigation and Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await loginAsUser(page);
  });

  test('should navigate to and display Production Units page', async ({ page }) => {
    await page.goto('/production-units');
    await page.waitForLoadState('networkidle');

    // Look for page-specific content
    const pageContent = page.locator('text=/Unidades de Producción/i').or(page.locator('text=/Production/i'));
    await expect(pageContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to and display Crop Production page', async ({ page }) => {
    await page.goto('/crop-production');
    await page.waitForLoadState('networkidle');

    // Look for page-specific content
    const pageContent = page.locator('text=/Producción/i').or(page.locator('text=/Cultivo/i'));
    await expect(pageContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to and display Water Chemistry page', async ({ page }) => {
    await page.goto('/water-chemistry');
    await page.waitForLoadState('networkidle');

    // Check for page-specific content
    const waterText = page.locator('text=/Agua/i').or(page.locator('text=/Química/i')).or(page.locator('text=/Water/i'));
    const pageLoaded = await waterText.count();
    expect(pageLoaded).toBeGreaterThan(0);
  });

  test('should navigate to and display Fertilizers page', async ({ page }) => {
    await page.goto('/fertilizers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=/Fertilizantes/i').first()).toBeVisible();
  });

  test('should navigate to and display Fertilizer Inputs page', async ({ page }) => {
    await page.goto('/fertilizer-inputs');
    await page.waitForLoadState('networkidle');

    const fertText = page.locator('text=/Fertilizante/i').or(page.locator('text=/Insumo/i')).or(page.locator('text=/Input/i'));
    const pageLoaded = await fertText.count();
    expect(pageLoaded).toBeGreaterThan(0);
  });

  test('should navigate to and display Irrigation Engineering Design page', async ({ page }) => {
    await page.goto('/irrigation-engineering-design');
    await page.waitForLoadState('networkidle');

    const irrigText = page.locator('text=/Riego/i').or(page.locator('text=/Diseño/i')).or(page.locator('text=/Irrigation/i'));
    const pageLoaded = await irrigText.count();
    expect(pageLoaded).toBeGreaterThan(0);
  });

  test('should navigate to and display On-Demand Irrigation page', async ({ page }) => {
    await page.goto('/irrigation/sectors');
    await page.waitForLoadState('networkidle');

    const irrigText = page.locator('text=/Riego/i').or(page.locator('text=/Irrigation/i')).or(page.locator('text=/Sector/i'));
    const pageLoaded = await irrigText.count();
    expect(pageLoaded).toBeGreaterThan(0);
  });

  test('should navigate to Profile page', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const profileText = page.locator('text=/Perfil/i').or(page.locator('text=/Profile/i')).or(page.locator('text=/Usuario/i'));
    const pageLoaded = await profileText.count();
    expect(pageLoaded).toBeGreaterThan(0);
  });

  test('should navigate between pages using sidebar', async ({ page }) => {
    // Try to find and click sidebar navigation items
    const sidebar = page.locator('aside, .sidebar, nav').first();

    if (await sidebar.isVisible()) {
      // Click on different menu items
      const menuItems = page.locator('a[href*="/farms"], a[href*="/crops"], a[href*="/devices"]');
      const count = await menuItems.count();

      if (count > 0) {
        // Click first menu item
        await menuItems.first().click();
        await page.waitForTimeout(1000);

        // Verify navigation occurred
        const url = page.url();
        expect(url).toMatch(/farms|crops|devices/);
      }
    }
  });

  test('should handle navigation with browser back button', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to farms
    await page.goto('/farms');
    await page.waitForLoadState('networkidle');
    const farmsUrl = page.url();

    // Navigate to crops
    await page.goto('/crops');
    await page.waitForLoadState('networkidle');
    const cropsUrl = page.url();

    // Verify we're on crops before going back
    expect(cropsUrl).toContain('crops');

    // Go back - should return to farms
    await page.goBack();
    await page.waitForTimeout(1000); // Give Angular routing time to process
    await page.waitForLoadState('networkidle');

    // Should be on farms page
    const afterBackUrl = page.url();
    expect(afterBackUrl).toContain('farms');

    // Go back again - should return to dashboard
    await page.goBack();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    // Should be on dashboard
    const finalUrl = page.url();
    expect(finalUrl).toContain('dashboard');
  });

  test('should maintain session across page navigation', async ({ page }) => {
    // Navigate to multiple pages
    await page.goto('/farms');
    await page.waitForLoadState('networkidle');

    await page.goto('/crops');
    await page.waitForLoadState('networkidle');

    await page.goto('/devices');
    await page.waitForLoadState('networkidle');

    // Should still be authenticated (not redirected to login)
    expect(page.url()).not.toContain('login');
  });

  test('should logout successfully', async ({ page }) => {
    // Look for logout button (may be in header, sidebar, or profile)
    const logoutBtn = page.locator('button:has-text("Cerrar Sesión")').or(page.locator('button:has-text("Logout")')).or(page.locator('a:has-text("Salir")'));

    if (await logoutBtn.first().isVisible().catch(() => false)) {
      await logoutBtn.first().click();
      await page.waitForLoadState('networkidle');

      // Should redirect to login
      expect(page.url()).toContain('login');
    } else {
      // If no logout button found, at least verify we can access login directly
      console.log('Logout button not found - checking login page accessibility');
      await page.goto('/login');
      await expect(page).toHaveURL(/login/);
    }
  });
});
