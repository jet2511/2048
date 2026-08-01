# Remove Manual Save/Load Slots Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove the legacy manual Save/Load game slots feature from HTML UI, CSS, and JS engine now that Firebase Cloud Sync automatically persists game state.

**Architecture:** Remove `.save-slots` HTML elements inside `#settingsModal`, purge `saveSlot`, `loadSlot`, and `getGameSlotInfo` methods from `HTMLActuator`, `GameManager`, `KeyboardInputManager`, and `LocalStorageManager`, and update E2E tests.

**Tech Stack:** JavaScript (ES Modules), HTML5, CSS3, Playwright (E2E Tests).

---

### Task 1: Remove Save/Load HTML Markup from Settings Modal

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Delete Save/Load subsection from `#settingsModal`**

Remove `<hr>`, `<h3 data-i18n="saveLoad">Save / Load Game</h3>`, and `<div class="save-slots">` from `index.html`.

---

### Task 2: Remove Save/Load CSS & JS Handlers

**Files:**
- Modify: `assets/css/ui.css`
- Modify: `assets/js/html_actuator.js`
- Modify: `assets/js/keyboard_input_manager.js`
- Modify: `assets/js/game_manager.js`
- Modify: `assets/js/local_storage_manager.js`

- [ ] **Step 1: Clean up unused Save/Load CSS in `assets/css/ui.css`**
- [ ] **Step 2: Remove `showSaveLoad` and update `toggleSettings` in `assets/js/html_actuator.js`**
- [ ] **Step 3: Remove `saveSlot`, `loadSlot`, and `toggleSaveLoad` in `assets/js/keyboard_input_manager.js`**
- [ ] **Step 4: Remove `saveSlot`, `loadSlot`, and `toggleSaveLoad` in `assets/js/game_manager.js`**
- [ ] **Step 5: Clean up slot methods in `assets/js/local_storage_manager.js`**

---

### Task 3: Update Playwright E2E Tests & Verify

**Files:**
- Modify: `tests/header_buttons.spec.js`

- [ ] **Step 1: Update `tests/header_buttons.spec.js`**

Remove assertion checking for `.save-slots .slot` inside Settings modal.

- [ ] **Step 2: Run build and all tests to verify clean execution**

Run: `npm run build`
Run: `npx playwright test`
Expected: All tests PASS cleanly.
