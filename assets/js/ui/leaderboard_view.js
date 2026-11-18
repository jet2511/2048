import { t } from '../i18n.js';

/**
 * Leaderboard View Component
 * Handles rendering global & local leaderboards with strict XSS-safe DOM node creation.
 */
export class LeaderboardView {
    constructor() {
        this.globalList = document.getElementById("globalLeaderboardList");
        this.localList = document.getElementById("localLeaderboardList");
        this.loadingEl = document.getElementById("leaderboardLoading");
    }

    renderGlobal(items) {
        if (this.loadingEl) this.loadingEl.style.display = "none";
        if (!this.globalList) return;

        this.globalList.replaceChildren();

        if (!items || items.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.className = "global-leaderboard-item";
            emptyItem.textContent = "Chưa có dữ liệu bảng xếp hạng";
            this.globalList.appendChild(emptyItem);
            return;
        }

        items.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "global-leaderboard-item";

            const rank = document.createElement("span");
            rank.className = "leader-rank";
            rank.textContent = `#${index + 1}`;

            const userBox = document.createElement("div");
            userBox.className = "leader-user";

            const avatar = document.createElement("img");
            avatar.className = "leader-avatar";
            avatar.src = item.photoURL || "https://lh3.googleusercontent.com/a/default-user";
            avatar.alt = item.displayName || "Anonymous";

            const name = document.createElement("span");
            name.className = "leader-name";
            name.textContent = item.displayName || "Anonymous";

            userBox.appendChild(avatar);
            userBox.appendChild(name);

            const score = document.createElement("span");
            score.className = "leader-score";
            score.textContent = String(item.bestScore || 0);

            li.appendChild(rank);
            li.appendChild(userBox);
            li.appendChild(score);

            this.globalList.appendChild(li);
        });
    }

    renderLocal(leaderboardData, lang = 'vi') {
        if (!this.localList) return;
        this.localList.replaceChildren();

        if (!leaderboardData || leaderboardData.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.textContent = t('noRecords', lang);
            this.localList.appendChild(emptyItem);
            return;
        }

        leaderboardData.forEach((entry, index) => {
            const li = document.createElement("li");
            const dateStr = new Date(entry.date).toLocaleDateString();

            const span = document.createElement("span");
            span.textContent = `#${index + 1} - ${dateStr}`;

            const strong = document.createElement("strong");
            strong.textContent = String(entry.score);

            li.appendChild(span);
            li.appendChild(strong);
            this.localList.appendChild(li);
        });
    }
}
