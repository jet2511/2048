import { CloudStorageManager } from '../cloud_storage_manager.js';

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

        this.init();
    }

    init() {
        this.authManager.onAuthChange(async (user) => {
            this.actuator.renderAuthState(user);
            if (user) {
                const cloudState = await CloudStorageManager.loadGameState(user.uid);
                if (cloudState && this.callbacks.onCloudStateLoaded) {
                    this.callbacks.onCloudStateLoaded(cloudState);
                }
                const currentBest = this.storageManager.getBestScore();
                if (currentBest > 0) {
                    CloudStorageManager.updateLeaderboard(user.uid, user, currentBest);
                }
            }
        });

        this.setupAuthButtons();
        this.setupLeaderboardCallbacks();
    }

    setupAuthButtons() {
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
        if (currentUser) {
            CloudStorageManager.saveGameState(currentUser.uid, serializedState);
            CloudStorageManager.updateLeaderboard(currentUser.uid, currentUser, bestScore);
        }
    }
}
