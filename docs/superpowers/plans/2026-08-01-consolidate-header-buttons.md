# Consolidate Header Toolbar Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce header toolbar buttons from 5 down to 3 (🏆 Leaderboard & Profile, 🔊 Mute Sound, ⚙️ Settings & Save/Load) for a clean, compact UI.

**Architecture:** Remove `.profile-toggle` and `.save-load-toggle` from `.tools-container` in `index.html`. Route 🏆 button to the 3-tab Modal, move Save/Load slots into `#settingsModal`, and update UI actuator.

**Tech Stack:** JavaScript (ES Modules), HTML5, CSS3, Playwright (E2E Tests).

---

### Task 1: Update HTML Markup (index.html)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Consolidate `.tools-container` into 3 buttons**

Remove `.profile-toggle` and `.save-load-toggle` from `.tools-container`.
The `.tools-container` will contain exactly 3 buttons:
1. `.leaderboard-toggle` (🏆 Leaderboard & Account)
2. `.mute-toggle` (🔊 Sound Toggle)
3. `.settings-toggle` (⚙️ Settings & Save/Load)

- [ ] **Step 2: Embed Save / Load Game slots into `#settingsModal`**

Add a `<div class="setting-item save-load-setting-item">` inside `#settingsModal` with save/load slots. Remove standalone `#saveLoadModal`.

---

### Task 2: Update CSS Styles (assets/css/ui.css)

**Files:**
- Modify: `assets/css/ui.css`

- [ ] **Step 1: Update button selectors and Save/Load settings styling**

Clean up unused button class selectors. Add styling for embedded Save/Load slot controls inside Settings modal.

---

### Task 3: Update HTMLActuator & GameManager

**Files:**
- Modify: `assets/js/html_actuator.js`
- Modify: `assets/js/game_manager.js`

- [ ] **Step 1: Update settings toggle to populate Save/Load slots**

Update `toggleSettings(slotsData)` in `HTMLActuator` to update slot info text inside `#settingsModal`.
Update `GameManager.toggleSettings()` to fetch slot data from `LocalStorageManager` and pass it to `actuator.toggleSettings(slotsData)`.

---

### Task 4: Update Playwright E2E Tests

**Files:**
- Modify: `tests/profile_modal.spec.js`
- Create: `tests/header_buttons.spec.js`

- [ ] **Step 1: Update tests for 3 header buttons**
- [ ] **Step 2: Run all Playwright tests to verify**

Run: `npx playwright test`
Expected: All tests PASS.
