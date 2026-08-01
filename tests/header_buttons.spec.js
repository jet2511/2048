import { test, expect } from '@playwright/test';

test.describe('Header Toolbar 3-Buttons Consolidation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render exactly 3 header action buttons in tools container', async ({ page }) => {
    const buttons = page.locator('.tools-container > a');
    await expect(buttons).toHaveCount(3);

    const leaderboardBtn = page.locator('.leaderboard-toggle');
    const muteBtn = page.locator('.mute-toggle');
    const settingsBtn = page.locator('.settings-toggle');

    await expect(leaderboardBtn).toBeVisible();
    await expect(muteBtn).toBeVisible();
    await expect(settingsBtn).toBeVisible();
  });

  test('should open Profile & Leaderboard modal on 🏆 button click', async ({ page }) => {
    await page.locator('.leaderboard-toggle').click();
    const profileModal = page.locator('#profileModal');
    await expect(profileModal).toHaveClass(/is-open/);
  });

  test('should toggle sound mute status on 🔊 button click', async ({ page }) => {
    const muteBtn = page.locator('.mute-toggle');
    const unmutedIcon = muteBtn.locator('.icon-unmuted');
    const mutedIcon = muteBtn.locator('.icon-muted');

    await expect(unmutedIcon).toBeVisible();
    await expect(mutedIcon).toBeHidden();

    await muteBtn.click();

    await expect(unmutedIcon).toBeHidden();
    await expect(mutedIcon).toBeVisible();
  });

  test('should open Settings modal with embedded Save/Load slots on ⚙️ button click', async ({ page }) => {
    await page.locator('.settings-toggle').click();
    const settingsModal = page.locator('#settingsModal');
    await expect(settingsModal).toHaveClass(/is-open/);

    const saveSlots = settingsModal.locator('.save-slots .slot');
    await expect(saveSlots).toHaveCount(3);
  });
});
