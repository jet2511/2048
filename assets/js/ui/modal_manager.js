import { t } from '../i18n.js';

/**
 * Modal Manager Component
 * Manages modal visibility, tab switching, and confirmation dialogues.
 */
export class ModalManager {
    constructor(outerContainer, callbacks = {}) {
        this.outerContainer = outerContainer || document.querySelector(".outerContainer");
        this.settingsModal = document.getElementById("settingsModal");
        this.profileModal = document.getElementById("profileModal");
        this.callbacks = callbacks;
        this.confirmCallback = null;
        this.lang = 'vi';

        this.setupConfirmModal();
        this.setupProfileTabs();
    }

    setupConfirmModal() {
        this.confirmModal = document.createElement("div");
        this.confirmModal.className = "confirm-modal";

        const content = document.createElement("div");
        content.className = "confirm-content";

        const text = document.createElement("p");
        text.className = "confirm-text";

        const buttons = document.createElement("div");
        buttons.className = "confirm-buttons";

        const cancelBtn = document.createElement("a");
        cancelBtn.className = "confirm-button cancel";
        cancelBtn.setAttribute("data-i18n", "cancel");
        cancelBtn.textContent = t("cancel", this.lang);

        const confirmBtn = document.createElement("a");
        confirmBtn.className = "confirm-button confirm";
        confirmBtn.setAttribute("data-i18n", "continueBtn");
        confirmBtn.textContent = t("continueBtn", this.lang);

        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        content.appendChild(text);
        content.appendChild(buttons);
        this.confirmModal.appendChild(content);

        if (this.outerContainer) {
            this.outerContainer.appendChild(this.confirmModal);
        }

        cancelBtn.addEventListener("click", () => this.handleConfirm(false));
        confirmBtn.addEventListener("click", () => this.handleConfirm(true));
    }

    showConfirm(message, callback) {
        this.confirmModal.querySelector(".confirm-text").textContent = message;
        this.confirmModal.classList.add("is-open");
        this.confirmCallback = callback;
    }

    handleConfirm(confirmed) {
        this.confirmModal.classList.remove("is-open");
        if (this.confirmCallback) {
            this.confirmCallback(confirmed);
            this.confirmCallback = null;
        }
    }

    setupProfileTabs() {
        if (!this.profileModal) return;
        const tabBtns = this.profileModal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const contents = this.profileModal.querySelectorAll('.tab-content');
                contents.forEach(c => {
                    if (c.id === targetTab) {
                        c.classList.add('active');
                    } else {
                        c.classList.remove('active');
                    }
                });

                if (targetTab === 'global-leaderboard-tab' && this.callbacks.onFetchGlobalLeaderboard) {
                    const loading = document.getElementById("leaderboardLoading");
                    if (loading) loading.style.display = "block";
                    this.callbacks.onFetchGlobalLeaderboard();
                } else if (targetTab === 'local-leaderboard-tab' && this.callbacks.onFetchLocalLeaderboard) {
                    this.callbacks.onFetchLocalLeaderboard();
                }
            });
        });
    }

    showProfile(defaultTab = 'account-tab') {
        this.closeModals();
        if (this.profileModal) {
            const tabBtns = this.profileModal.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                if (btn.getAttribute('data-tab') === defaultTab) {
                    btn.click();
                }
            });
            this.profileModal.classList.add("is-open");
        }
    }

    showSettings() {
        this.closeModals();
        if (this.settingsModal) {
            this.settingsModal.classList.add("is-open");
        }
    }

    closeModals() {
        if (this.settingsModal) this.settingsModal.classList.remove("is-open");
        if (this.profileModal) this.profileModal.classList.remove("is-open");
        if (this.confirmModal) this.confirmModal.classList.remove("is-open");
    }

    renderAuthState(user) {
        const unauthView = document.getElementById("userProfileUnauth");
        const authView = document.getElementById("userProfileAuth");
        const userAvatar = document.getElementById("userAvatar");
        const userName = document.getElementById("userName");
        const userEmail = document.getElementById("userEmail");

        if (!unauthView || !authView) return;

        if (user) {
            unauthView.style.display = "none";
            authView.style.display = "block";
            if (userAvatar) userAvatar.src = user.photoURL || "https://lh3.googleusercontent.com/a/default-user";
            if (userName) userName.textContent = user.displayName || "Người chơi";
            if (userEmail) userEmail.textContent = user.email || "";
        } else {
            unauthView.style.display = "block";
            authView.style.display = "none";
        }
    }
}
