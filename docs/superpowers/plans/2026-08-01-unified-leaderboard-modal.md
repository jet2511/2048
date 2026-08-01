# Unified Profile & Leaderboard Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate local high scores modal (`#leaderboardModal`) and Firebase profile modal (`#profileModal`) into a single 3-tab Modal for clean UX.

**Architecture:** Update `index.html` markup to have 3 tabs (Account, Global Leaderboard, Local History) inside `#profileModal`, delete obsolete `#leaderboardModal`, update `HTMLActuator`, `KeyboardInputManager`, and `GameManager` to route both 🏆 and 👤 header buttons to the unified modal.

**Tech Stack:** JavaScript (ES Modules), HTML5, CSS3, Playwright (E2E Tests).

---

### Task 1: Update HTML Markup (index.html)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove obsolete `#leaderboardModal` and update `#profileModal` to 3 tabs**

In `index.html`, update `#profileModal` structure:
```html
<div class="profile-tabs">
    <button class="tab-btn active" data-tab="account-tab">Tài khoản</button>
    <button class="tab-btn" data-tab="global-leaderboard-tab">BXH Toàn Cầu</button>
    <button class="tab-btn" data-tab="local-leaderboard-tab">Kỷ Lục Cá Nhân</button>
</div>
```

Add tab container `#local-leaderboard-tab` containing `<ul class="local-leaderboard-list" id="localLeaderboardList"></ul>`.

Remove `<div class="modal-overlay" id="leaderboardModal">...</div>`.

---

### Task 2: Update CSS Styles (assets/css/ui.css)

**Files:**
- Modify: `assets/css/ui.css`

- [ ] **Step 1: Add styling for local leaderboard inside profile modal**

Add styles for `.local-leaderboard-list` and 3-tab layout adjustments.

---

### Task 3: Update HTMLActuator & Tab Navigation (assets/js/html_actuator.js)

**Files:**
- Modify: `assets/js/html_actuator.js`

- [ ] **Step 1: Update tab handler and render methods in HTMLActuator**

Update `setupProfileTabs()` to handle tab switching.
Add `renderLocalLeaderboard(data)` method.
Update `showProfileModal(activeTab)` to accept an optional tab ID to activate upon opening.
Remove obsolete `showLeaderboard()` method.

---

### Task 4: Update KeyboardInputManager & GameManager

**Files:**
- Modify: `assets/js/keyboard_input_manager.js`
- Modify: `assets/js/game_manager.js`

- [ ] **Step 1: Route header buttons to unified modal**

In `KeyboardInputManager`:
- `.profile-toggle` emits `toggleProfile('account-tab')`
- `.leaderboard-toggle` emits `toggleProfile('global-leaderboard-tab')`

In `GameManager`:
- Update `toggleProfile(tab)` to call `actuator.showProfileModal(tab)` and fetch local/global data accordingly.

---

### Task 5: Update & Run Playwright Tests

**Files:**
- Modify: `tests/profile_modal.spec.js`

- [ ] **Step 1: Update Playwright tests for 3-tab navigation**
- [ ] **Step 2: Run all Playwright tests to verify**

Run: `npx playwright test`
Expected: All tests PASS.
