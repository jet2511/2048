import { test, expect } from '@playwright/test';

test.describe('Profile & Leaderboard Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open Profile Modal when clicking profile toggle button', async ({ page }) => {
    const profileBtn = page.locator('.profile-toggle');
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    const profileModal = page.locator('#profileModal');
    await expect(profileModal).toHaveClass(/is-open/);

    const googleBtn = page.locator('#googleLoginBtn');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Sign in with Google');
  });

  test('should switch tabs inside Profile Modal', async ({ page }) => {
    await page.locator('.profile-toggle').click();

    const leaderboardTabBtn = page.locator('.tab-btn[data-tab="global-leaderboard-tab"]');
    await leaderboardTabBtn.click();

    const leaderboardContent = page.locator('#global-leaderboard-tab');
    await expect(leaderboardContent).toHaveClass(/active/);
  });
});
