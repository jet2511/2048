import { test, expect } from '@playwright/test';

test.describe('2048 Modernized - E2E Playwright Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean initial state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should render main game layout correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/2048/i);
    await expect(page.locator('.title')).toContainText('2048');
    await expect(page.locator('.grid-container')).toBeVisible();
    await expect(page.locator('.score-container')).toBeVisible();
    await expect(page.locator('.best-container')).toBeVisible();

    // Verify 16 grid cells exist for 4x4 default grid
    const gridCells = page.locator('.grid-cell');
    await expect(gridCells).toHaveCount(16);
  });

  test('should handle keyboard moves and spawn tiles', async ({ page }) => {
    // Check initial tiles
    const initialTiles = page.locator('.tile');
    await expect(initialTiles).toHaveCount(2);

    // Make moves
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // After valid moves, tiles should exist
    const tilesAfterMoves = page.locator('.tile');
    const count = await tilesAfterMoves.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should execute Undo move correctly', async ({ page }) => {
    // Perform a move
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const undoBtn = page.locator('.above-game .undo-button');
    await expect(undoBtn).toBeVisible();

    // Click Undo
    await undoBtn.click();
    await page.waitForTimeout(200);

    // Score should be 0 (with 100 penalty clamped at 0)
    const scoreText = await page.locator('.score-container').textContent();
    expect(parseInt(scoreText || '0')).toBe(0);
  });

  test('should toggle dark mode theme', async ({ page }) => {
    // Open settings modal
    await page.locator('.settings-toggle').click();
    const modal = page.locator('#settingsModal');
    await expect(modal).toHaveClass(/is-open/);

    // Click dark mode toggle
    const themeToggle = page.locator('.theme-toggle');
    await themeToggle.click();

    // Verify dark-mode class on body
    await expect(page.locator('body')).toHaveClass(/dark-mode/);

    // Close modal
    await modal.locator('.modal-close-x').click();
    await expect(modal).not.toHaveClass(/is-open/);
  });

  test('should switch language to Vietnamese', async ({ page }) => {
    // Open settings modal
    await page.locator('.settings-toggle').click();
    
    // Select VI language
    const viOption = page.locator('.lang-option[data-lang="vi"]');
    await viOption.click();

    // Verify translated elements
    await expect(page.locator('[data-i18n="undo"]')).toHaveText('Hoàn tác');
    await expect(page.locator('[data-i18n="newGame"]')).toHaveText('Chơi lại');
  });

  test('should switch game size (3x3 grid)', async ({ page }) => {
    await page.locator('.settings-toggle').click();
    
    // Select 3x3 size
    const size3Option = page.locator('.size-option[data-size="3"]');
    await size3Option.click();

    // Close settings
    await page.locator('#settingsModal .modal-close-x').click();

    // Grid should now have 9 cells
    await expect(page.locator('.grid-cell')).toHaveCount(9);
  });

});
