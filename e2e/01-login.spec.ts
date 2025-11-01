import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/AgriSmart/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    await page.fill('input[type="email"]', 'csolano@iapcr.com');
    await page.fill('input[type="password"]', '123');

    // Click login button and wait for navigation
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 30000 }), // Increased timeout
      page.click('button[type="submit"]')
    ]);

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: /Dashboard.*AgriSmart/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait a bit for error message
    await page.waitForTimeout(2000);

    // Should stay on login page or show error
    const url = page.url();
    const hasError = await page.locator('.alert-danger, .error-message, text=/error/i').isVisible().catch(() => false);

    expect(url.includes('/login') || hasError).toBeTruthy();
  });
});
