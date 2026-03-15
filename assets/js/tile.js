export default class Tile {
    constructor(position, value, id) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
        this.id = id;

        this.previousPosition = null;
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }

    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }

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