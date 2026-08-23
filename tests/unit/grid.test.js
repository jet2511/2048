import { describe, it, expect, beforeEach } from 'vitest';
import Grid from '../../assets/js/grid.js';
import Tile from '../../assets/js/tile.js';

describe('Grid Domain Logic', () => {
    let grid;

    beforeEach(() => {
        grid = new Grid(4);
    });

    it('should initialize an empty 4x4 grid', () => {
        expect(grid.size).toBe(4);
        expect(grid.cells.length).toBe(4);
        expect(grid.availableCells().length).toBe(16);
        expect(grid.cellsAvailable()).toBe(true);
    });

    it('should correctly insert, query and remove tiles', () => {
        const tile = new Tile({ x: 1, y: 2 }, 4, 1);
        grid.insertTile(tile);

        expect(grid.cellOccupied({ x: 1, y: 2 })).toBe(true);
        expect(grid.cellContent({ x: 1, y: 2 })).toBe(tile);
        expect(grid.cellAvailable({ x: 1, y: 2 })).toBe(false);
        expect(grid.availableCells().length).toBe(15);

        grid.removeTile(tile);
        expect(grid.cellOccupied({ x: 1, y: 2 })).toBe(false);
        expect(grid.cellContent({ x: 1, y: 2 })).toBeNull();
        expect(grid.availableCells().length).toBe(16);
    });

    it('should correctly check bounds', () => {
        expect(grid.withinBounds({ x: 0, y: 0 })).toBe(true);
        expect(grid.withinBounds({ x: 3, y: 3 })).toBe(true);
        expect(grid.withinBounds({ x: -1, y: 0 })).toBe(false);
        expect(grid.withinBounds({ x: 4, y: 0 })).toBe(false);
        expect(grid.withinBounds({ x: 0, y: 4 })).toBe(false);
    });

    it('should serialize and restore grid state accurately', () => {
        const tile1 = new Tile({ x: 0, y: 0 }, 2, 10);
        const tile2 = new Tile({ x: 3, y: 2 }, 1024, 11);
        grid.insertTile(tile1);
        grid.insertTile(tile2);

        const serialized = grid.serialize();
        expect(serialized.size).toBe(4);
        expect(serialized.cells[0][0].value).toBe(2);
        expect(serialized.cells[3][2].value).toBe(1024);

        const restoredGrid = new Grid(serialized.size, serialized.cells);
        expect(restoredGrid.size).toBe(4);
        expect(restoredGrid.cellContent({ x: 0, y: 0 }).value).toBe(2);
        expect(restoredGrid.cellContent({ x: 3, y: 2 }).value).toBe(1024);
        expect(restoredGrid.cellContent({ x: 1, y: 1 })).toBeNull();
    });
});
