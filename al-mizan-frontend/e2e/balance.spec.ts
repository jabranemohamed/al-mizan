import { test, expect } from '@playwright/test';

test.describe('Al-Mizan — Balance Page', () => {

  // Helper to login before each test
  test.beforeEach(async ({ page }) => {
    // This assumes a test user exists — in CI, seed the DB first
    await page.goto('/auth/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/balance', { timeout: 5000 }).catch(() => {});
  });

  test('should display the balance page with scale', async ({ page }) => {
    await page.goto('/balance');
    // Check for key elements
    await expect(page.locator('h1')).toContainText('الميزان');
    await expect(page.locator('app-scale')).toBeVisible();
  });

  test('should display the navbar with navigation links', async ({ page }) => {
    await page.goto('/balance');
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.locator('a[href="/balance"]')).toBeVisible();
    await expect(page.locator('a[href="/history"]')).toBeVisible();
    await expect(page.locator('a[href="/advice"]')).toBeVisible();
  });

  test('should navigate to history page', async ({ page }) => {
    await page.goto('/balance');
    await page.click('a[href="/history"]');
    await expect(page).toHaveURL(/.*history/);
  });

  test('should navigate to advice page', async ({ page }) => {
    await page.goto('/balance');
    await page.click('a[href="/advice"]');
    await expect(page).toHaveURL(/.*advice/);
  });
});
