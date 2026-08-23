import { SKIN_CONFIG } from '../constants.js';

/**
 * Board Renderer Component
 * Responsible for rendering grid background, tiles, animations, and CSS variables calculation.
 */
export class BoardRenderer {
    constructor(gridContainer, tileContainer) {
        this.gridContainer = gridContainer || document.querySelector(".grid-container");
        this.tileContainer = tileContainer || document.querySelector(".tile-container");
        this.size = 4;
    }

    setupGrid(size) {
        this.size = size;
        if (!this.gridContainer) return;
        this.gridContainer.replaceChildren();

        for (let i = 0; i < size; i++) {
            const row = document.createElement("div");
            row.className = "grid-row";

            for (let j = 0; j < size; j++) {
                const cell = document.createElement("div");
                cell.className = "grid-cell";
                row.appendChild(cell);
            }

            this.gridContainer.appendChild(row);
        }

        this.updateCSSVars(size);
    }

    updateCSSVars(size = this.size) {
        const root = document.documentElement;
        const gameContainer = document.querySelector(".game-container");
        if (!gameContainer) return;

        const rect = gameContainer.getBoundingClientRect();
        const containerSize = rect.width > 0 ? rect.width : 500;
        const spacing = window.innerWidth <= 520 ? 10 : 15;
        const tileSize = (containerSize - (spacing * (size + 1))) / size;

        root.style.setProperty('--grid-row-cells', String(size));
        root.style.setProperty('--tile-size', `${tileSize}px`);
        root.style.setProperty('--tile-margin', `${spacing}px`);
        root.style.setProperty('--game-container-size', `${containerSize}px`);
    }

    renderTiles(grid, skin = 'classic') {
        if (!this.tileContainer) return;
        this.tileContainer.replaceChildren();

        grid.cells.forEach(column => {
            column.forEach(cell => {
                if (cell) {
                    this.addTile(cell, skin);
                }
            });
        });
    }

    addTile(tile, skin = 'classic') {
        const wrapper = document.createElement("div");
        const inner = document.createElement("div");
        const position = tile.previousPosition || { x: tile.x, y: tile.y };

        wrapper.style.transform = this.getTranslate(position);

        const classes = ["tile", `tile-${tile.value}`];
        if (tile.value > 2048) classes.push("tile-super");

        wrapper.setAttribute("class", classes.join(" "));
        inner.className = "tile-inner";

        if (skin === SKIN_CONFIG.EMOJI) {
            inner.textContent = SKIN_CONFIG.EMOJI_MAP[tile.value] || SKIN_CONFIG.DEFAULT_EMOJI;
            inner.style.fontSize = 'calc(var(--tile-size) * 0.55)';
        } else {
            inner.textContent = String(tile.value);
            inner.style.fontSize = '';
        }

        if (tile.previousPosition) {
            window.requestAnimationFrame(() => {
                wrapper.style.transform = this.getTranslate({ x: tile.x, y: tile.y });
            });
        } else if (tile.mergedFrom) {
            classes.push("tile-merged");
            wrapper.setAttribute("class", classes.join(" "));

            tile.mergedFrom.forEach(merged => {
                this.addTile(merged, skin);
            });

            this.showFloatingScore(tile.value, { x: tile.x, y: tile.y });
        } else {
            classes.push("tile-new");
            wrapper.setAttribute("class", classes.join(" "));
        }

        wrapper.appendChild(inner);
        this.tileContainer.appendChild(wrapper);
    }

    showFloatingScore(value, position) {
        const floatEl = document.createElement("div");
        floatEl.className = "floating-score";
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
}
