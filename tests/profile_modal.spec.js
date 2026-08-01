import { test, expect } from '@playwright/test';

test.describe('Unified Profile & Leaderboard Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open Profile Modal when clicking leaderboard toggle button', async ({ page }) => {
    const leaderboardBtn = page.locator('.leaderboard-toggle');
    await expect(leaderboardBtn).toBeVisible();
    await leaderboardBtn.click();

    const profileModal = page.locator('#profileModal');
    await expect(profileModal).toHaveClass(/is-open/);

    const globalTab = page.locator('#global-leaderboard-tab');
    await expect(globalTab).toHaveClass(/active/);
  });

  test('should switch between all 3 tabs (Account, Global, Local)', async ({ page }) => {
    await page.locator('.leaderboard-toggle').click();

    // Switch to Local Leaderboard tab
    const localTabBtn = page.locator('.tab-btn[data-tab="local-leaderboard-tab"]');
    await localTabBtn.click();
    const localTab = page.locator('#local-leaderboard-tab');
    await expect(localTab).toHaveClass(/active/);

    // Switch to Global Leaderboard tab
    const globalTabBtn = page.locator('.tab-btn[data-tab="global-leaderboard-tab"]');
    await globalTabBtn.click();
    const globalTab = page.locator('#global-leaderboard-tab');
    await expect(globalTab).toHaveClass(/active/);

    // Switch back to Account tab
    const accountTabBtn = page.locator('.tab-btn[data-tab="account-tab"]');
    await accountTabBtn.click();
    const accountTab = page.locator('#account-tab');
    await expect(accountTab).toHaveClass(/active/);
  });
});
