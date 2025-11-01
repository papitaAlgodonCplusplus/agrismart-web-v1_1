import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsUser(page);
  });

  test('should display dashboard with statistics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dashboard.*AgriSmart/i })).toBeVisible();

    // Check for statistic cards - use more specific selectors to avoid strict mode violations
    await expect(page.locator('.card-category').filter({ hasText: /Fincas/i }).first()).toBeVisible();
    await expect(page.locator('.card-category').filter({ hasText: /Cultivos/i }).first()).toBeVisible();
    await expect(page.locator('.card-category').filter({ hasText: /Dispositivos/i }).first()).toBeVisible();
  });

  test('should navigate to Farms page from quick actions', async ({ page }) => {
    // Click on the Farms quick action card
    const farmsCard = page.locator('.quick-action-card:has-text("Fincas")').first();
    await farmsCard.click();

    // Wait for navigation
    await page.waitForURL('**/farms', { timeout: 10000 });
    await expect(page).toHaveURL(/farms/);
  });

  test('should navigate to Crops page from quick actions', async ({ page }) => {
    const cropsCard = page.locator('.quick-action-card:has-text("Catálogo de Cultivos")').first();
    await cropsCard.click();

    await page.waitForURL('**/crops', { timeout: 10000 });
    await expect(page).toHaveURL(/crops/);
  });

  test('should navigate to Devices page from quick actions', async ({ page }) => {
    const devicesCard = page.locator('.quick-action-card:has-text("Dispositivos")').first();
    await devicesCard.click();

    await page.waitForURL('**/devices', { timeout: 10000 });
    await expect(page).toHaveURL(/devices/);
  });

  test('should navigate to Water Chemistry page', async ({ page }) => {
    const waterCard = page.locator('.quick-action-card:has-text("Análisis de Agua")').first();
    await waterCard.click();

    await page.waitForURL('**/water-chemistry', { timeout: 10000 });
    await expect(page).toHaveURL(/water-chemistry/);
  });

  test('should navigate to Fertilizers page', async ({ page }) => {
    const fertilizerButton = page.locator('text=/Fertilizantes/i').first();
    await fertilizerButton.click();

    await page.waitForURL('**/fertilizers', { timeout: 10000 });
    await expect(page).toHaveURL(/fertilizers/);
  });

  test('should navigate to Irrigation Design page', async ({ page }) => {
    const irrigationButton = page.locator('text=/Diseño de Riego/i').first();
    await irrigationButton.click();

    await page.waitForURL('**/irrigation-engineering-design', { timeout: 10000 });
    await expect(page).toHaveURL(/irrigation-engineering-design/);
  });
});
