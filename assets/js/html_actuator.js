import { t } from './i18n.js';

export default class HTMLActuator {
    constructor() {
        this.tileContainer = document.querySelector(".tile-container");
        this.gridContainer = document.querySelector(".grid-container");
        this.settingsModal = document.getElementById("settingsModal");
        this.muteToggleBtn = document.querySelector(".mute-toggle");
        this.timerContainer = document.querySelector(".timer-container");
        this.scoreContainer = document.querySelector(".score-container");
        this.bestContainer = document.querySelector(".best-container");
        this.messageContainer = document.querySelector(".game-message");
        this.sharingContainer = document.querySelector(".score-sharing");
        this.outerContainer = document.querySelector(".outerContainer");
        this.leaderboardModal = document.getElementById("leaderboardModal");
        this.saveLoadModal = document.getElementById("saveLoadModal");
        this.profileModal = document.getElementById("profileModal");

        this.score = 0;
        this.size = 4; // Default size
        this.skin = 'classic';
        this.setupConfirmModal();
        this.setupProfileTabs();
        
        // Listen for window resize to handle responsiveness
        window.addEventListener("resize", () => {
            this.updateCSSVars(this.size);
        });

        // The user can't zoom, but they can still rotate their device
        window.addEventListener("orientationchange", () => {
            this.updateCSSVars(this.size);
        });
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

                if (targetTab === 'global-leaderboard-tab' && this.onFetchLeaderboard) {
                    const loading = document.getElementById("leaderboardLoading");
                    if (loading) loading.style.display = "block";
                    this.onFetchLeaderboard();
                }
            });
        });
    }

    showProfileModal() {
        this.closeModals();
        if (this.profileModal) this.profileModal.classList.add("is-open");
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

    renderGlobalLeaderboard(items) {
        const list = document.getElementById("globalLeaderboardList");
        const loading = document.getElementById("leaderboardLoading");
        if (loading) loading.style.display = "none";
        if (!list) return;

        list.innerHTML = "";
        if (!items || items.length === 0) {
            list.innerHTML = `<li class="global-leaderboard-item">Chưa có dữ liệu bảng xếp hạng</li>`;
            return;
        }

        items.forEach((item, index) => {
            const li = document.createElement("li");
            li.classList.add("global-leaderboard-item");
            const avatar = item.photoURL || "https://lh3.googleusercontent.com/a/default-user";
            const name = item.displayName || "Anonymous";
            const score = item.bestScore || 0;

            li.innerHTML = `
                <span class="leader-rank">#${index + 1}</span>
                <div class="leader-user">
                    <img class="leader-avatar" src="${avatar}" alt="${name}">
                    <span class="leader-name">${name}</span>
                </div>
                <span class="leader-score">${score}</span>
            `;
            list.appendChild(li);
        });
    }

    // Modal UI logic
    showLeaderboard(leaderboardData) {
        const list = this.leaderboardModal.querySelector('.leaderboard-list');
        list.innerHTML = '';
        if (leaderboardData.length === 0) {
            list.innerHTML = `<li>${t('noRecords', this.lang)}</li>`;
        } else {
            leaderboardData.forEach((entry, i) => {
                const date = new Date(entry.date).toLocaleDateString();
                list.innerHTML += `<li><span>#${i+1} - ${date}</span> <strong>${entry.score}</strong></li>`;
            });
        }
        this.closeModals();
        this.leaderboardModal.classList.add("is-open");
    }

    showSaveLoad(slotsData) {
        const slots = this.saveLoadModal.querySelectorAll('.slot');
        slots.forEach(slotEl => {
            const id = slotEl.getAttribute('data-slot');
            const info = slotsData[id];
            const infoSpan = slotEl.querySelector('.slot-info');
            if (info) {
                const modeName = t(info.mode, this.lang);
                infoSpan.textContent = t('slotScore', this.lang, id, info.score, modeName);
            } else {
                infoSpan.textContent = t('slotEmpty', this.lang, id);
            }
        });
        this.closeModals();
        this.saveLoadModal.classList.add("is-open");
    }

    closeModals() {
        this.leaderboardModal.classList.remove("is-open");
        this.saveLoadModal.classList.remove("is-open");
        this.settingsModal.classList.remove("is-open");
        if (this.profileModal) this.profileModal.classList.remove("is-open");
    }

    // --- Settings panel & Modals ---
    setupConfirmModal() {
        this.confirmModal = document.createElement("div");
        this.confirmModal.classList.add("confirm-modal");
        
        const content = document.createElement("div");
        content.classList.add("confirm-content");
        
        const text = document.createElement("p");
        text.classList.add("confirm-text");
        
        const buttons = document.createElement("div");
        buttons.classList.add("confirm-buttons");
        
        const cancelBtn = document.createElement("a");
        cancelBtn.classList.add("confirm-button", "cancel");
        cancelBtn.setAttribute("data-i18n", "cancel");
        cancelBtn.textContent = t("cancel", this.lang);
        
        const confirmBtn = document.createElement("a");
        confirmBtn.classList.add("confirm-button", "confirm");
        confirmBtn.setAttribute("data-i18n", "continueBtn");
        confirmBtn.textContent = t("continueBtn", this.lang);
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        content.appendChild(text);
        content.appendChild(buttons);
        this.confirmModal.appendChild(content);
        
        this.outerContainer.appendChild(this.confirmModal);
        
        this.confirmCallback = null;
        
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

    toggleSettings() {
        this.closeModals();
        this.settingsModal.classList.add("is-open");
    }

    updateMuteButton(isEnabled) {
        if (!this.muteToggleBtn) return;
        const iconUnmuted = this.muteToggleBtn.querySelector(".icon-unmuted");
        const iconMuted = this.muteToggleBtn.querySelector(".icon-muted");
        
        if (isEnabled) {
            iconUnmuted.style.display = "block";
            iconMuted.style.display = "none";
        } else {
            iconUnmuted.style.display = "none";
            iconMuted.style.display = "block";
        }
    }

    updateSizeHighlight(size) {
        const options = document.querySelectorAll(".size-option");
        options.forEach(opt => {
            if (parseInt(opt.getAttribute("data-size")) === size) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }

    updateLanguageHighlight(lang) {
        this.lang = lang;
        const options = document.querySelectorAll(".lang-option");
        options.forEach(opt => {
            if (opt.getAttribute("data-lang") === lang) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }

    updateModeHighlight(mode) {
        const options = document.querySelectorAll(".mode-option");
        options.forEach(opt => {
            if (opt.getAttribute("data-mode") === mode) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }

    updateSkinHighlight(skin) {
        this.skin = skin;
        const options = document.querySelectorAll(".skin-option");
        options.forEach(opt => {
            if (opt.getAttribute("data-skin") === skin) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }

    updateTimer(seconds, mode) {
        if (mode === 'time' || mode === 'survival') {
            this.timerContainer.style.display = "block";
            this.timerContainer.textContent = mode === 'time' ? `${seconds}s` : `Survival: ${seconds}s`;
        } else {
            this.timerContainer.style.display = "none";
        }
    }

    // Set up the grid background based on size
    setupGrid(size) {
        this.size = size;
        this.clearContainer(this.gridContainer);

        for (let i = 0; i < size; i++) {
            const row = document.createElement("div");
            row.classList.add("grid-row");

            for (let j = 0; j < size; j++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-cell");
                row.appendChild(cell);
            }

            this.gridContainer.appendChild(row);
        }

        this.updateCSSVars(size);
    }

    updateCSSVars(size) {
        const root = document.documentElement;
        const gameContainer = document.querySelector(".game-container");
        
        // Get the current width of the container on screen
        // If it's not visible yet (startup), it will fall back to base.css values
        const rect = gameContainer.getBoundingClientRect();
        const containerSize = rect.width > 0 ? rect.width : 500;
        
        // Match the spacing (varies by screen size but usually 15px or 10px on mobile)
        const spacing = window.innerWidth <= 520 ? 10 : 15;
        const tileSize = (containerSize - (spacing * (size + 1))) / size;

        root.style.setProperty('--grid-row-cells', size);
        root.style.setProperty('--tile-size', `${tileSize}px`);
        root.style.setProperty('--tile-margin', `${spacing}px`);
        root.style.setProperty('--game-container-size', `${containerSize}px`);
    }

    actuate(grid, metadata) {
        window.requestAnimationFrame(() => {
            this.clearContainer(this.tileContainer);

            grid.cells.forEach(column => {
                column.forEach(cell => {
                    if (cell) {
                        this.addTile(cell);
                    }
                });
            });

            this.updateScore(metadata.score);
            this.updateBestScore(metadata.bestScore);

            if (metadata.terminated) {
                if (metadata.over) {
                    this.message(false); // You lose
                } else if (metadata.won) {
                    this.message(true); // You win!
                }
            } else {
                this.clearMessage();
            }
        });
    }

    // Continues the game (both restart and keep playing)
    continueGame() {
        this.clearMessage();
    }

    clearContainer(container) {
        container.replaceChildren();
    }

    addTile(tile) {
        const wrapper = document.createElement("div");
        const inner = document.createElement("div");
        const position = tile.previousPosition || { x: tile.x, y: tile.y };
        
        wrapper.style.transform = this.getTranslate(position);

        // We can't use classlist because it somehow glitches when replacing classes
        const classes = ["tile", `tile-${tile.value}`];

        if (tile.value > 2048) classes.push("tile-super");

        this.applyClasses(wrapper, classes);

        inner.classList.add("tile-inner");
        
        if (this.skin === 'emoji') {
            const emojis = {
                2: '🥚', 4: '🐣', 8: '🐥', 16: '🐔', 32: '🕊️', 
                64: '🦆', 128: '🦅', 256: '🦉', 512: '🦇', 1024: '🐉', 
                2048: '👑', 4096: '🌟', 8192: '💎',
                16384: '🔮', 32768: '🚀', 65536: '🌌', 131072: '👽'
            };
            inner.textContent = emojis[tile.value] || '🦄';
            // Scale up emoji size slightly as they replace numbers
            inner.style.fontSize = 'calc(var(--tile-size) * 0.55)';
        } else {
            inner.textContent = tile.value;
            inner.style.fontSize = ''; // use CSS default
        }

        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(() => {
                wrapper.style.transform = this.getTranslate({ x: tile.x, y: tile.y });
            });
        } else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);

            // Render the tiles that merged
            tile.mergedFrom.forEach(merged => {
                this.addTile(merged);
            });

            // Show floating score at merged tile position
            this.showFloatingScore(tile.value, { x: tile.x, y: tile.y });
        } else {
            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
        }

        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);

        // Put the tile on the board
        this.tileContainer.appendChild(wrapper);
    }

    showFloatingScore(value, position) {
        const floatEl = document.createElement("div");
        floatEl.classList.add("floating-score");
        floatEl.textContent = `+${value}`;
        floatEl.style.transform = this.getTranslate(position);
        this.tileContainer.appendChild(floatEl);

        setTimeout(() => {
            if (floatEl.parentNode) {
                floatEl.parentNode.removeChild(floatEl);
            }
        }, 700);
    }

    getTranslate(position) {
        const { x, y } = position;
        return `translate(calc(${x} * (var(--tile-size) + var(--tile-margin)) + var(--tile-margin)), calc(${y} * (var(--tile-size) + var(--tile-margin)) + var(--tile-margin)))`;
    }

    applyClasses(element, classes) {
        element.setAttribute("class", classes.join(" "));
    }

    updateScore(score) {
        this.clearContainer(this.scoreContainer);

        const difference = score - this.score;
        this.score = score;

        this.scoreContainer.textContent = this.score;

        if (difference > 0) {
            const addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = `+${difference}`;

            this.scoreContainer.appendChild(addition);

            // Clean up the addition element after the animation (approx 600ms)
            setTimeout(() => {
                if (addition.parentNode) {
                    addition.parentNode.removeChild(addition);
                }
            }, 600);
        }
    }

    updateBestScore(bestScore) {
        this.bestContainer.textContent = bestScore;
    }

    message(won) {
        const type = won ? "game-won" : "game-over";
        const messageText = won ? t("gameWon", this.lang) : t("gameOver", this.lang);

        this.messageContainer.classList.add(type);
        this.messageContainer.querySelectorAll("p")[0].textContent = messageText;

        this.clearContainer(this.sharingContainer);
        this.sharingContainer.appendChild(this.scoreTweetButton());

        const mainUndoBtn = document.querySelector(".above-game .undo-button");

        if (won) {
            this.triggerConfetti();
            if (mainUndoBtn) mainUndoBtn.classList.remove("pulse-highlight");
        } else {
            if (mainUndoBtn) mainUndoBtn.classList.add("pulse-highlight");
        }
    }

    triggerConfetti() {
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "9999";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#edc22e", "#f65e3b", "#f2b179", "#ffcc33", "#60a5fa", "#34d399", "#f472b6"];
        const particles = Array.from({ length: 90 }, () => ({
            x: canvas.width / 2,
            y: canvas.height / 3,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rSpeed: (Math.random() - 0.5) * 10,
            opacity: 1
        }));

        let frame = 0;
        const animate = () => {
            if (frame > 130) {
                canvas.remove();
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3;
                p.rotation += p.rSpeed;
                p.opacity -= 0.007;
                if (p.opacity <= 0) return;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });
            frame++;
            requestAnimationFrame(animate);
        };
        animate();
    }

    clearMessage() {
        this.messageContainer.classList.remove("game-won");
        this.messageContainer.classList.remove("game-over");
        const mainUndoBtn = document.querySelector(".above-game .undo-button");
        if (mainUndoBtn) mainUndoBtn.classList.remove("pulse-highlight");
    }

    setDarkMode(enabled) {
        const themeToggle = document.querySelector(".theme-toggle");
        this.isDarkMode = enabled;
        if (enabled) {
            document.body.classList.add("dark-mode");
            if (themeToggle) themeToggle.textContent = t("lightMode", this.lang);
        } else {
            document.body.classList.remove("dark-mode");
            if (themeToggle) themeToggle.textContent = t("darkMode", this.lang);
        }
    }

    translateDOM(lang) {
        this.lang = lang;
        
        // Translate simple innerHTML/textContent
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerHTML = t(key, lang);
        });
        
        // Translate attributes (like title or aria-label if needed in the future)
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('data-title', t(key, lang)); // Or just textContent if it's the score label
        });
        
        // Manual updates for dynamic text
        this.setDarkMode(this.isDarkMode);
    }

    scoreTweetButton() {
        const tweet = document.createElement("a");
        tweet.classList.add("twitter-share-button");
        tweet.setAttribute("href", "https://x.com/intent/post");
        tweet.setAttribute("data-url", "https://jet2511.github.io/2048/");
        tweet.textContent = "Tweet";

        const text = `I scored ${this.score} points at 2048, a game where you join numbers to score high! #2048game`;
        tweet.setAttribute("data-text", text);

        return tweet;
    }
}