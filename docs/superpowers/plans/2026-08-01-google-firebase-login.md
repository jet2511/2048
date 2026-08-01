# Google Authentication & Firebase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Google Sign-In via Firebase Auth and Cloud Sync (Firestore) for Leaderboard and Save Game State in 2048.

**Architecture:** Add isolated Firebase JS modules (`firebase_config.js`, `auth_manager.js`, `cloud_storage_manager.js`), connect them with `game_manager.js` and `local_storage_manager.js`, and add Profile/Leaderboard Modal to `html_actuator.js` and `index.html`.

**Tech Stack:** JavaScript (ES Modules), Firebase v10+ (Web SDK), Vite, Playwright (E2E testing).

---

### Task 1: Add Firebase SDK & Configuration Module

**Files:**
- Modify: `package.json`
- Create: `assets/js/firebase_config.js`
- Create: `.env.example`
- Create: `tests/firebase_config.test.js`

- [ ] **Step 1: Write test for Firebase config initialization**

```javascript
import { test, expect } from '@playwright/test';

test('firebase_config exports initialized auth and db objects or handles missing env gracefully', async ({ page }) => {
  await page.goto('/');
  const hasFirebaseConfig = await page.evaluate(() => {
    return window.firebaseInitialized !== undefined;
  });
  expect(hasFirebaseConfig).toBe(true);
});
```

- [ ] **Step 2: Add firebase dependency to package.json**

Run: `npm install firebase`

- [ ] **Step 3: Create `.env.example` file**

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

- [ ] **Step 4: Create `assets/js/firebase_config.js`**

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app, auth, googleProvider, db;
let initialized = false;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  initialized = true;
}

window.firebaseInitialized = initialized;

export { auth, googleProvider, db, initialized };
```

- [ ] **Step 5: Run test to verify**

Run: `npx playwright test tests/firebase_config.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.example assets/js/firebase_config.js tests/firebase_config.test.js
git commit -m "feat: setup firebase sdk and config module"
```

---

### Task 2: Create Auth Manager Module

**Files:**
- Create: `assets/js/auth_manager.js`
- Create: `tests/auth_manager.test.js`

- [ ] **Step 1: Write test for AuthManager class**

```javascript
import { test, expect } from '@playwright/test';

test('AuthManager initializes and provides login/logout methods', async ({ page }) => {
  await page.goto('/');
  const isAuthManagerAvailable = await page.evaluate(() => {
    return typeof window.AuthManager === 'function';
  });
  expect(isAuthManagerAvailable).toBe(true);
});
```

- [ ] **Step 2: Create `assets/js/auth_manager.js`**

```javascript
import { auth, googleProvider, initialized } from './firebase_config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.listeners = [];

    if (initialized && auth) {
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.notifyListeners(user);
      });
    }
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
    if (this.currentUser) callback(this.currentUser);
  }

  notifyListeners(user) {
    this.listeners.forEach((cb) => cb(user));
  }

  async loginWithGoogle() {
    if (!initialized || !auth) {
      throw new Error("Firebase configuration missing. Please check .env file.");
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }

  async logout() {
    if (!initialized || !auth) return;
    await signOut(auth);
  }

  getUser() {
    return this.currentUser;
  }
}

if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}
```

- [ ] **Step 3: Run test**

Run: `npx playwright test tests/auth_manager.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add assets/js/auth_manager.js tests/auth_manager.test.js
git commit -m "feat: add AuthManager class for Google auth lifecycle"
```

---

### Task 3: Create Cloud Storage Manager (Firestore)

**Files:**
- Create: `assets/js/cloud_storage_manager.js`
- Create: `tests/cloud_storage.test.js`

- [ ] **Step 1: Create `assets/js/cloud_storage_manager.js`**

```javascript
import { db, initialized } from './firebase_config.js';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

export class CloudStorageManager {
  static async saveGameState(uid, gameState) {
    if (!initialized || !db || !uid) return;
    const userRef = doc(db, 'users', uid, 'data', 'game_state');
    await setDoc(userRef, {
      ...gameState,
      updatedAt: serverTimestamp()
    });
  }

  static async loadGameState(uid) {
    if (!initialized || !db || !uid) return null;
    const userRef = doc(db, 'users', uid, 'data', 'game_state');
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  static async updateLeaderboard(uid, userObj, bestScore) {
    if (!initialized || !db || !uid) return;
    const leaderRef = doc(db, 'leaderboard', uid);
    await setDoc(leaderRef, {
      uid,
      displayName: userObj.displayName || 'Anonymous',
      photoURL: userObj.photoURL || '',
      bestScore,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  static async getTopLeaderboard(maxLimit = 20) {
    if (!initialized || !db) return [];
    const q = query(collection(db, 'leaderboard'), orderBy('bestScore', 'desc'), limit(maxLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/cloud_storage_manager.js
git commit -m "feat: implement CloudStorageManager for Firestore operations"
```

---

### Task 4: Integrate Profile/Leaderboard Modal UI in HTML & CSS

**Files:**
- Modify: `index.html`
- Modify: `assets/css/main.css`
- Modify: `assets/js/html_actuator.js`

- [ ] **Step 1: Add Modal markup to `index.html`**

Thêm nút `#profile-btn` ở header container và thẻ `<div class="modal profile-modal" id="profile-modal">` chứa Tabs (Profile, Leaderboard) và danh sách top players.

- [ ] **Step 2: Add CSS rules to `assets/css/main.css`**

Tạo style glassmorphic / dark mode cho Profile Modal, Tab switching, Avatar user, và Leaderboard table.

- [ ] **Step 3: Modify `html_actuator.js` to handle Modal events & render user profile / leaderboard**

- [ ] **Step 4: Verify UI via Playwright test**

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/main.css assets/js/html_actuator.js
git commit -m "feat: add Profile and Leaderboard UI modal"
```

---

### Task 5: Connect AuthManager and CloudSync into GameManager

**Files:**
- Modify: `assets/js/game_manager.js`
- Modify: `assets/js/local_storage_manager.js`

- [ ] **Step 1: Sync cloud game state on auth change**
- [ ] **Step 2: Push best score to Firestore on game over or high score update**
- [ ] **Step 3: Run full Playwright test suite**

Run: `npm run test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: integrate AuthManager and CloudSync with GameManager"
```
