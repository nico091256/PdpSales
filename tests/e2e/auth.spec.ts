import { test, expect } from '@playwright/test';

/**
 * Enterprise Auth Flow Tests
 * Covers: Login, Protected Routes, Logout
 */

test.describe('Authentication Flow', () => {
  
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors on invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid email
    await page.getByPlaceholder('name@company.com').fill('invalid-email');
    await page.getByPlaceholder('••••••••••••').fill('short');
    await page.getByRole('button', { name: /Enter Dashboard/i }).click();

    // Should stay on login and show toast (handled by toast, hard to select directly without ID)
    // But we can check if we are still on /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle successful login and logout', async ({ page }) => {
    // Note: These credentials must match your local dev environment/seed data
    const EMAIL = 'ceo@pdp.uz';
    const PASSWORD = 'Password123!';
    const SLUG = 'pdp';

    await page.goto('/login');
    
    await page.getByPlaceholder('your-company-slug').fill(SLUG);
    await page.getByPlaceholder('name@company.com').fill(EMAIL);
    await page.getByPlaceholder('••••••••••••').fill(PASSWORD);
    
    await page.getByRole('button', { name: /Enter Dashboard/i }).click();

    // Check redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check if user name is visible (assuming it is in the sidebar/header)
    // await expect(page.locator('text=CEO')).toBeVisible();

    // Perform Logout
    // 1. Find logout button in sidebar
    const logoutBtn = page.getByRole('button', { name: /Log Out/i });
    await logoutBtn.click();

    // 2. Confirm redirection back to login
    await expect(page).toHaveURL(/\/login/);
    
    // 3. Verify private route is locked again
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Protected Routes', () => {
  const routes = ['/dashboard', '/users', '/call-logs', '/appointments', '/profile'];

  for (const route of routes) {
    test(`should protect ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});
