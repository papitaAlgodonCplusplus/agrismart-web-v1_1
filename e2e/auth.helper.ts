import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email: string = 'csolano@iapcr.com', password: string = '123') {
  await page.goto('/login');

  // Fill in login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click login button and wait for navigation
  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 30000 }),
    page.click('button[type="submit"]')
  ]);

  // Wait for dashboard to be fully loaded
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Ignore if networkidle times out, as long as we're on dashboard
  });
}
