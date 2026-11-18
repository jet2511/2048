import { CloudStorageManager } from '../cloud_storage_manager.js';
import { SYNC_CONFIG } from '../constants.js';

/**
 * GameSyncService
 * Coordinates Cloud state synchronization, Firebase Auth listeners, and Leaderboards.
 */
export class GameSyncService {
    /**
     * @param {object} authManager Instance of AuthManager
     * @param {object} storageManager Instance of LocalStorageManager
     * @param {object} actuator Instance of HTMLActuator
     * @param {object} callbacks Callback handlers
     */
    constructor(authManager, storageManager, actuator, callbacks = {}) {
        this.authManager = authManager;
        this.storageManager = storageManager;
        this.actuator = actuator;
        this.callbacks = callbacks;
        this.syncDebounceTimer = null;

        this.init();
    }

    init() {
        this.authManager.onAuthChange(async (user) => {
            if (this.actuator && typeof this.actuator.renderAuthState === 'function') {
                this.actuator.renderAuthState(user);
            }
            if (user) {
                const cloudState = await CloudStorageManager.loadGameState(user.uid);
                if (cloudState && this.callbacks.onCloudStateLoaded) {
                    this.callbacks.onCloudStateLoaded(cloudState);
                }
                const currentGridSize = this.storageManager.getItem('gridSize') || 4;
                const currentBest = this.storageManager.getBestScore(currentGridSize);
                if (currentBest > 0) {
                    CloudStorageManager.updateLeaderboard(user.uid, user, currentBest);
                }
            }
        });

        this.setupAuthButtons();
        this.setupLeaderboardCallbacks();
    }

    setupAuthButtons() {
        if (typeof document === 'undefined') return;
        const googleLoginBtn = document.getElementById("googleLoginBtn");
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener("click", async () => {
                try {
                    await this.authManager.loginWithGoogle();
                } catch (err) {
                    alert(err.message || "Đăng nhập thất bại");
                }
            });
        }

        const googleLogoutBtn = document.getElementById("googleLogoutBtn");
        if (googleLogoutBtn) {
            googleLogoutBtn.addEventListener("click", async () => {
                await this.authManager.logout();
            });
        }
    }

    setupLeaderboardCallbacks() {
        this.actuator.onFetchLeaderboard = async () => {
            const topUsers = await CloudStorageManager.getTopLeaderboard(20);
            this.actuator.renderGlobalLeaderboard(topUsers);
        };

        this.actuator.onFetchLocalLeaderboard = () => {
            const board = this.storageManager.getLeaderboard();
            this.actuator.renderLocalLeaderboard(board);
        };
    }

    syncGameState(serializedState, bestScore) {
        const currentUser = this.authManager.getUser();
        if (!currentUser) return;

        // Nếu game kết thúc hoặc win, đồng bộ ngay lập tức không cần debounce
        if (serializedState.over || serializedState.won) {
            if (this.syncDebounceTimer) {
                clearTimeout(this.syncDebounceTimer);
                this.syncDebounceTimer = null;
            }
            CloudStorageManager.saveGameState(currentUser.uid, serializedState);
            CloudStorageManager.updateLeaderboard(currentUser.uid, currentUser, bestScore);
            return;
        }

        // Với mỗi nước đi bình thường, debounce để giảm số lượng write lên Firestore
        if (this.syncDebounceTimer) {
            clearTimeout(this.syncDebounceTimer);
        }

        this.syncDebounceTimer = setTimeout(() => {
            CloudStorageManager.saveGameState(currentUser.uid, serializedState);
            CloudStorageManager.updateLeaderboard(currentUser.uid, currentUser, bestScore);
            this.syncDebounceTimer = null;
        }, SYNC_CONFIG.DEBOUNCE_MS || 3000);
    }
}
