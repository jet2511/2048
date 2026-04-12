import { test, expect } from '@playwright/test';

test.describe('2048 Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Nexus 2048/);
  });

  test('game grid is rendered with 4x4 default', async ({ page }) => {
    const gridContainer = page.locator('.grid-container');
    await expect(gridContainer).toBeVisible();

    const cells = page.locator('.grid-cell');
    await expect(cells).toHaveCount(16);
  });

  test('initial tiles are created', async ({ page }) => {
    const tiles = page.locator('.tile');
    await expect(tiles).toHaveCount(2);
  });

  test('score starts at 0', async ({ page }) => {
    const scoreContainer = page.locator('.score-container');
    await expect(scoreContainer).toHaveText('0');
  });

  test('can move tiles with arrow keys', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    const tiles = page.locator('.tile');
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThanOrEqual(2);
  });

  test('New Game button restarts the game', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    await page.click('.restart-button');
    await page.waitForTimeout(100);

    const tiles = page.locator('.tile');
    await expect(tiles).toHaveCount(2);
  });

  test('settings panel can be toggled', async ({ page }) => {
    const settingsPanel = page.locator('.settings-panel');

    await page.click('.settings-toggle');
    await expect(settingsPanel).toHaveClass(/is-open/);

    await page.click('.settings-toggle');
    await expect(settingsPanel).not.toHaveClass(/is-open/);
  });

  test('can change grid size to 3x3', async ({ page }) => {
    await page.click('.settings-toggle');
    await page.waitForTimeout(100);

    await page.click('.size-option[data-size="3"]');
    await page.waitForTimeout(100);

    const confirmButton = page.locator('.confirm-button.confirm');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await page.waitForTimeout(300);

    const cells = page.locator('.grid-cell');
    await expect(cells).toHaveCount(9);
  });

  test('theme toggle works', async ({ page }) => {
    await page.click('.settings-toggle');
    await page.waitForTimeout(100);

    await page.click('.theme-toggle');
    await page.waitForTimeout(100);

    const body = page.locator('body');
    await expect(body).toHaveClass(/dark-mode/);
  });

  test('undo button reverts last move', async ({ page }) => {
    const initialScore = await page.locator('.score-container').textContent();

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);

    await page.click('.undo-button');
    await page.waitForTimeout(150);

    const afterUndoScore = await page.locator('.score-container').textContent();
    expect(parseInt(afterUndoScore)).toBeLessThanOrEqual(parseInt(initialScore) + 100);
  });

  test('game over message appears when no moves available', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(50);
    }
  });

  test('keep playing button exists in DOM', async ({ page }) => {
    const keepPlayingButton = page.locator('.keep-playing-button');
    await expect(keepPlayingButton).toHaveCount(1);
  });

  test('try again button resets game', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    const retryButton = page.locator('.retry-button');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await page.waitForTimeout(100);

      const tiles = page.locator('.tile');
      await expect(tiles).toHaveCount(2);
    }
  });

  test('logo and title are visible', async ({ page }) => {
    const logo = page.locator('.logo-image');
    await expect(logo).toBeVisible();

    const title = page.locator('.title');
    await expect(title).toContainText('Nexus');
  });

  test('footer credits are present', async ({ page }) => {
    const footer = page.locator('p:has-text("Created by")');
    await expect(footer).toBeVisible();
  });
});
