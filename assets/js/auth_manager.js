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
    if (this.currentUser) {
      callback(this.currentUser);
    }
  }

  notifyListeners(user) {
    this.listeners.forEach((cb) => {
      try {
        cb(user);
      } catch (e) {
        console.error("Auth listener error:", e);
      }
    });
  }

  async loginWithGoogle() {
    if (!initialized || !auth) {
      throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env");
    }
    const result = await signInWithPopup(auth, googleProvider);
    this.currentUser = result.user;
    return result.user;
  }

  async logout() {
    if (!initialized || !auth) return;
    await signOut(auth);
    this.currentUser = null;
  }

  getUser() {
    return this.currentUser;
  }

  isInitialized() {
    return initialized;
  }
}

if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}
