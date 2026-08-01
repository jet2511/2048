# Technical Design: Google Authentication & Firebase Integration for 2048

**Date**: 2026-08-01  
**Status**: Draft for Review  
**Project**: 2048 Modernized (`[package.json](file:///h:/Apps/_Project/_Personal/2048/package.json)`)

---

## 1. Overview & Objectives

Tích hợp **Firebase Authentication (Google Sign-In)** và **Cloud Firestore** cho ứng dụng 2048 Web (`Vite + Vanilla JS`):
1. **User Authentication**: Cho phép người dùng đăng nhập/đăng xuất bằng tài khoản Google.
2. **Cloud Save Game**: Tự động lưu và phục hồi tiến trình chơi (Grid, Score, Mode) trên đám mây khi đổi thiết bị.
3. **Global Leaderboard**: Lưu Điểm cao nhất (Best Score) của người dùng đăng nhập và hiển thị Bảng xếp hạng toàn cầu.
4. **Offline Fallback**: Khi không có mạng hoặc chưa đăng nhập, game hoạt động hoàn toàn dựa vào `LocalStorageManager` hiện tại không bị gián đoạn.

---

## 2. System Architecture & Module Boundaries

Ứng dụng tuân thủ kiến trúc phân lớp hiện tại của 2048, bổ sung các module độc lập:

```
┌─────────────────────────────────────────────────────────┐
│                      HTML Actuator                      │
│        (Render UI, Profile/Leaderboard Modal)           │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
┌────────────▼──────────────┐  ┌───────────▼──────────────┐
│       Auth Manager        │  ┌───► Cloud Storage Mgr    │
│  (Firebase Auth Lifecycle)│  │   │  (Firestore Reader/  │
└────────────┬──────────────┘  │   │   Writer)            │
             │                 │   └──────────────────────┘
┌────────────▼─────────────────┴──────────────────────────┐
│                  Game Manager (2048)                    │
│      (Coordinates game state, move listeners)           │
└────────────────────────────┬────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │    LocalStorage Manager     │
              │  (Offline-first fallback)   │
              └─────────────────────────────┘
```

### New Modules to Add (`assets/js/`):

1. `assets/js/firebase_config.js`:
   - Khởi tạo Firebase App từ biến môi trường Vite (`import.meta.env.VITE_FIREBASE_*`).
   - Export các instances: `auth`, `googleProvider`, `db` (Firestore).

2. `assets/js/auth_manager.js`:
   - Lớp `AuthManager` theo mô hình Singleton/Event-driven.
   - Quản lý hàm `loginWithGoogle()`, `logout()`, `getCurrentUser()`.
   - Lắng nghe `onAuthStateChanged()` và emit event/callback cho `GameManager` và `HTMLActuator`.

3. `assets/js/cloud_storage_manager.js`:
   - Lớp `CloudStorageManager` giao tiếp với Firestore:
     - `saveGameState(uid, gameState)`: Đẩy bản lưu game hiện tại.
     - `loadGameState(uid)`: Lấy bản lưu game từ Cloud.
     - `updateBestScore(uid, userInfo, score)`: Cập nhật Best Score lên Leaderboard.
     - `fetchTopLeaderboard(limit)`: Lấy top 20 điểm cao nhất toàn cầu.

4. **Enhancements to Existing Modules**:
   - `assets/js/local_storage_manager.js`: Giữ nguyên giao diện method, bổ sung logic kết hợp giữa Local Storage và Cloud Storage khi Auth state thay đổi.
   - `assets/js/game_manager.js`: Gọi `CloudStorageManager.saveGameState()` sau mỗi nước đi (debounced hoặc on pause/window blur) và cập nhật Leaderboard khi GameOver/Win.
   - `assets/js/html_actuator.js`: Thêm render UI cho Modal Profile & Leaderboard, Avatar user, nút Sign-in Google.

---

## 3. Data Schemas (Firestore Collections)

### Collection 1: `users/{uid}/data/game_state`
Lưu trạng thái bàn chơi hiện tại của người dùng.
```json
{
  "grid": {
    "size": 4,
    "cells": [
      [{"position": {"x": 0, "y": 0}, "value": 2}, null, null, null],
      ...
    ]
  },
  "score": 1024,
  "over": false,
  "won": false,
  "keepPlaying": false,
  "mode": "classic",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### Collection 2: `leaderboard/{uid}`
Bảng xếp hạng công khai top điểm cao.
```json
{
  "uid": "string",
  "displayName": "Nguyen Van A",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "bestScore": 16384,
  "updatedAt": "SERVER_TIMESTAMP"
}
```

---

## 4. UI/UX Workflow (Profile & Leaderboard Modal)

1. **Top Bar Button**: Thêm nút 👤 / 🏆 ở thanh header `[index.html](file:///h:/Apps/_Project/_Personal/2048/index.html)`.
2. **Modal View**:
   - **Tab 1: Profile & Sync Status**
     - Chưa đăng nhập: Nút lớn *"Sign in with Google"*.
     - Đã đăng nhập: Avatar, Tên Google, Email, nút *"Logout"*, nút *"Sync Now"*.
   - **Tab 2: Global Leaderboard**
     - Danh sách Top 20 người chơi (Hạng, Avatar, Tên, Điểm số).
     - Đánh dấu dòng của chính người dùng hiện tại (nếu có trong bảng).

---

## 5. Security & Environment Configuration

### `.env` File (Ignored by `.gitignore`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firestore Security Rules:
- `users/{uid}/**`: Chỉ có user sở hữu `auth.uid == uid` mới được `read` và `write`.
- `leaderboard/{uid}`: Mọi người dùng đều có thể `read` (để xem bảng xếp hạng), chỉ user có `auth.uid == uid` mới được `create`/`update` bản ghi của họ.

---

## 6. Verification & Test Plan

1. **Unit/Integration Verification**:
   - Kiểm tra `firebase_config.js` load đúng biến môi trường mà không crash khi thiếu key.
   - Kiểm tra Auth Flow (login -> user token created -> state updated -> logout).
2. **Playwright Automated E2E Tests**:
   - Đảm bảo Modal Profile/Leaderboard mở/đóng bình thường.
   - Đảm bảo offline fallback không bị gián đoạn khi Firebase offline.
3. **Manual Verification**:
   - Test login Google popup.
   - Test chuyển thiết bị (sau khi login tài khoản ở tab A, mở tab B ẩn danh login cùng tài khoản -> tự sync game state & best score).
