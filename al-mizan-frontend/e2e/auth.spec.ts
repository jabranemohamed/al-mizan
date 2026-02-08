import { test, expect } from '@playwright/test';

test.describe('Al-Mizan — Auth Flow', () => {

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h2')).toContainText('Connexion');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('a[href="/auth/register"]');
    await expect(page).toHaveURL(/.*auth\/register/);
    await expect(page.locator('h2')).toContainText('Inscription');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
  });
});
