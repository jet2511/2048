import { db, initialized } from './firebase_config.js';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

export class CloudStorageManager {
  static async saveGameState(uid, gameState) {
    if (!initialized || !db || !uid || !gameState) return;
    try {
      const userRef = doc(db, 'users', uid, 'data', 'game_state');
      await setDoc(userRef, {
        stateJson: JSON.stringify(gameState),
        score: gameState.score || 0,
        gameMode: gameState.gameMode || 'classic',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Cloud save error:", err);
    }
  }

  static async loadGameState(uid) {
    if (!initialized || !db || !uid) return null;
    try {
      const userRef = doc(db, 'users', uid, 'data', 'game_state');
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      if (data.stateJson) {
        return JSON.parse(data.stateJson);
      }
      return data;
    } catch (err) {
      console.warn("Cloud load error:", err);
      return null;
    }
  }

  static async updateLeaderboard(uid, userObj, bestScore) {
    if (!initialized || !db || !uid || !bestScore) return;
    try {
      const leaderRef = doc(db, 'leaderboard', uid);
      await setDoc(leaderRef, {
        uid,
        displayName: userObj.displayName || 'Anonymous',
        photoURL: userObj.photoURL || '',
        bestScore: Number(bestScore),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Leaderboard update error:", err);
    }
  }

  static async getTopLeaderboard(maxLimit = 20) {
    if (!initialized || !db) return [];
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('bestScore', 'desc'), limit(maxLimit));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data());
    } catch (err) {
      console.warn("Leaderboard fetch error:", err);
      return [];
    }
  }
}

if (typeof window !== 'undefined') {
  window.CloudStorageManager = CloudStorageManager;
}
