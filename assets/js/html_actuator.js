import { t } from './i18n.js';
import { BoardRenderer } from './ui/board_renderer.js';
import { ModalManager } from './ui/modal_manager.js';
import { LeaderboardView } from './ui/leaderboard_view.js';
import { ConfettiEffect } from './ui/confetti_effect.js';

/**
 * HTMLActuator (Facade Coordinator)
 * Coordinates UI rendering components, messages, settings, scores, and modals.
 */
export default class HTMLActuator {
    constructor() {
        this.boardRenderer = new BoardRenderer(
            document.querySelector(".grid-container"),
            document.querySelector(".tile-container")
        );
        this.leaderboardView = new LeaderboardView();
        this.modalManager = new ModalManager(document.querySelector(".outerContainer"), {
            onFetchGlobalLeaderboard: () => this.onFetchLeaderboard && this.onFetchLeaderboard(),
            onFetchLocalLeaderboard: () => this.onFetchLocalLeaderboard && this.onFetchLocalLeaderboard()
        });

        this.muteToggleBtn = document.querySelector(".mute-toggle");
        this.timerContainer = document.querySelector(".timer-container");
        this.scoreContainer = document.querySelector(".score-container");
        this.bestContainer = document.querySelector(".best-container");
        this.messageContainer = document.querySelector(".game-message");
        this.sharingContainer = document.querySelector(".score-sharing");

        this.score = 0;
        this.size = 4;
        this.skin = 'classic';
        this.lang = 'vi';

        window.addEventListener("resize", () => this.boardRenderer.updateCSSVars(this.size));
        window.addEventListener("orientationchange", () => this.boardRenderer.updateCSSVars(this.size));
    }

    setupGrid(size) {
        this.size = size;
        this.boardRenderer.setupGrid(size);
    }

    updateCSSVars(size) {
        this.boardRenderer.updateCSSVars(size);
    }

    showProfileModal(defaultTab = 'account-tab') {
        this.modalManager.showProfile(defaultTab);
    }

    renderAuthState(user) {
        this.modalManager.renderAuthState(user);
    }

    renderGlobalLeaderboard(items) {
        this.leaderboardView.renderGlobal(items);
    }

    renderLocalLeaderboard(board) {
        this.leaderboardView.renderLocal(board, this.lang);
    }

    closeModals() {
        this.modalManager.closeModals();
    }

    showConfirm(message, callback) {
        this.modalManager.showConfirm(message, callback);
    }

    toggleSettings() {
        this.modalManager.showSettings();
    }

    updateMuteButton(isEnabled) {
        if (!this.muteToggleBtn) return;
        const iconUnmuted = this.muteToggleBtn.querySelector(".icon-unmuted");
        const iconMuted = this.muteToggleBtn.querySelector(".icon-muted");
        if (iconUnmuted && iconMuted) {
            iconUnmuted.style.display = isEnabled ? "block" : "none";
            iconMuted.style.display = isEnabled ? "none" : "block";
        }
    }

    updateSizeHighlight(size) {
        document.querySelectorAll(".size-option").forEach(opt => {
            opt.classList.toggle("active", parseInt(opt.getAttribute("data-size"), 10) === parseInt(size, 10));
        });
    }

    updateLanguageHighlight(lang) {
        this.lang = lang;
        this.modalManager.lang = lang;
        document.querySelectorAll(".lang-option").forEach(opt => {
            opt.classList.toggle("active", opt.getAttribute("data-lang") === lang);
        });
    }

    updateModeHighlight(mode) {
        document.querySelectorAll(".mode-option").forEach(opt => {
            opt.classList.toggle("active", opt.getAttribute("data-mode") === mode);
        });
    }

    updateSkinHighlight(skin) {
        this.skin = skin;
        document.querySelectorAll(".skin-option").forEach(opt => {
            opt.classList.toggle("active", opt.getAttribute("data-skin") === skin);
        });
    }

    updateTimer(seconds, mode) {
        if (!this.timerContainer) return;
        if (mode === 'time' || mode === 'survival') {
            this.timerContainer.style.display = "block";
            this.timerContainer.textContent = mode === 'time' ? `${seconds}s` : `Survival: ${seconds}s`;
        } else {
            this.timerContainer.style.display = "none";
        }
    }

    actuate(grid, metadata) {
        window.requestAnimationFrame(() => {
            this.boardRenderer.renderTiles(grid, this.skin);
            this.updateScore(metadata.score);
            this.updateBestScore(metadata.bestScore);

            if (metadata.terminated) {
                this.message(metadata.won);
            } else {
                this.clearMessage();
            }
        });
    }

    continueGame() {
        this.clearMessage();
    }

    updateScore(score) {
        if (!this.scoreContainer) return;
        const difference = score - this.score;
        this.score = score;
        this.scoreContainer.textContent = String(this.score);

        if (difference > 0) {
            const addition = document.createElement("div");
            addition.className = "score-addition";
            addition.textContent = `+${difference}`;
            this.scoreContainer.appendChild(addition);
            setTimeout(() => addition.remove(), 600);
        }
    }

    updateBestScore(bestScore) {
        if (this.bestContainer) {
            this.bestContainer.textContent = String(bestScore);
        }
    }

    message(won) {
        if (!this.messageContainer) return;
        const type = won ? "game-won" : "game-over";
        const messageText = won ? t("gameWon", this.lang) : t("gameOver", this.lang);

        this.messageContainer.classList.add(type);
        const p = this.messageContainer.querySelector("p");
        if (p) p.textContent = messageText;

        if (this.sharingContainer) {
            this.sharingContainer.replaceChildren(this.scoreTweetButton());
        }

        const mainUndoBtn = document.querySelector(".above-game .undo-button");
        if (won) {
            ConfettiEffect.trigger();
            if (mainUndoBtn) mainUndoBtn.classList.remove("pulse-highlight");
        } else if (mainUndoBtn) {
            mainUndoBtn.classList.add("pulse-highlight");
        }
    }

    clearMessage() {
        if (!this.messageContainer) return;
        this.messageContainer.classList.remove("game-won", "game-over");
        const mainUndoBtn = document.querySelector(".above-game .undo-button");
        if (mainUndoBtn) mainUndoBtn.classList.remove("pulse-highlight");
    }

    setDarkMode(enabled) {
        const themeToggle = document.querySelector(".theme-toggle");
        this.isDarkMode = enabled;
        document.body.classList.toggle("dark-mode", enabled);
        if (themeToggle) {
            themeToggle.textContent = t(enabled ? "lightMode" : "darkMode", this.lang);
        }
    }

    translateDOM(lang) {
        this.lang = lang;
        this.modalManager.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerHTML = t(key, lang);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('data-title', t(key, lang));
        });
        this.setDarkMode(this.isDarkMode);
    }

    scoreTweetButton() {
        const tweet = document.createElement("a");
        tweet.className = "twitter-share-button";
        tweet.setAttribute("href", "https://x.com/intent/post");
        tweet.setAttribute("data-url", "https://jet2511.github.io/2048/");
        tweet.textContent = "Tweet";
        tweet.setAttribute("data-text", `I scored ${this.score} points at 2048! #2048game`);
        return tweet;
    }
}