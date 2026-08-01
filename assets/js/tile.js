/**
 * @typedef {object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * Tile Object representing a cell number tile
 */
export default class Tile {
    /**
     * @param {Position} position
     * @param {number} [value=2]
     * @param {number} [id]
     */
    constructor(position, value = 2, id) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;
        this.id = id;

        /** @type {Position|null} */
        this.previousPosition = null;
        /** @type {Tile[]|null} */
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    /**
     * Save current position as previous position
     */
    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }

    /**
     * Update position
     * @param {Position} position
     */
    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }

    /**
     * Serialize tile state
     * @returns {object}
     */
    serialize() {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value,
            id: this.id
        };
    }
}