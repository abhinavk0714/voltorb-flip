import { Tile } from './tile';
import { Level } from './level';

export class Board {
    private size: number;
    tiles: Tile[][];
    rowPointTotals: number[];
    rowVoltorbTotals: number[];
    columnPointTotals: number[];
    columnVoltorbTotals: number[];
    private level: Level;
    private totalVoltorbs: number;
    private totalMultipliers: number;
    private flippedMultipliers2x: number;
    private flippedMultipliers3x: number;
    private flippedMultipliers1x: number;

    constructor(levelNumber: number = 1) {
        try {
            console.log('Initializing board with level:', levelNumber);
            this.size = 5;
            this.tiles = [];
            this.level = new Level(levelNumber);
            this.totalVoltorbs = 0;
            this.totalMultipliers = 0;
            this.flippedMultipliers2x = 0;
            this.flippedMultipliers3x = 0;
            this.flippedMultipliers1x = 0;
            this.rowVoltorbTotals = new Array(this.size).fill(0);
            this.columnVoltorbTotals = new Array(this.size).fill(0);
            this.rowPointTotals = new Array(this.size).fill(0);
            this.columnPointTotals = new Array(this.size).fill(0);
            this.setupBoard();
            console.log('Board initialized successfully');
        } catch (error) {
            console.error('Error initializing board:', error);
            throw error;
        }
    }

    private setupBoard(): void {
        try {
            console.log('Starting board setup...');
            // Initialize all tiles as 1x multipliers
            this.tiles = Array(this.size).fill(null).map(() => 
                Array(this.size).fill(null).map(() => new Tile(1, false))
            );

            // Place Voltorbs
            const voltorbCount = this.level.getVoltorbCount();
            console.log('Placing', voltorbCount, 'Voltorbs');
            this.placeVoltorbs(voltorbCount);

            // Place 2x and 3x multipliers
            const multiplierCount = this.level.getMultiplierCount();
            console.log('Placing', multiplierCount, 'multipliers');
            this.placeMultipliers(multiplierCount);

            // Calculate totals
            this.calculateTotals();
            console.log('Board setup complete');
        } catch (error) {
            console.error('Error in setupBoard:', error);
            throw error;
        }
    }

    private placeVoltorbs(count: number): void {
        let placed = 0;
        while (placed < count) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            if (this.tiles[row][col].value === 1) {
                this.tiles[row][col] = new Tile(-1, false);
                placed++;
            }
        }
        this.totalVoltorbs = count;
    }

    private placeMultipliers(count: number): void {
        let placed = 0;
        while (placed < count) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            if (this.tiles[row][col].value === 1) {
                const value = Math.random() < 0.5 ? 2 : 3;
                this.tiles[row][col] = new Tile(value, false);
                placed++;
            }
        }
        this.totalMultipliers = count;
    }

    private calculateTotals(): void {
        // Reset totals
        this.rowPointTotals.fill(0);
        this.rowVoltorbTotals.fill(0);
        this.columnPointTotals.fill(0);
        this.columnVoltorbTotals.fill(0);

        // Calculate new totals
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = this.tiles[i][j];
                if (tile.value === -1) {
                    this.rowVoltorbTotals[i]++;
                    this.columnVoltorbTotals[j]++;
                } else {
                    this.rowPointTotals[i] += tile.value;
                    this.columnPointTotals[j] += tile.value;
                }
            }
        }
    }

    flipTile(row: number, col: number): number {
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            throw new Error("Invalid tile position");
        }

        const tile = this.tiles[row][col];
        if (tile.flipped) {
            throw new Error("Tile already flipped");
        }

        tile.flipped = true;
        const value = tile.value;

        if (value === 2) this.flippedMultipliers2x++;
        else if (value === 3) this.flippedMultipliers3x++;
        else if (value === 1) this.flippedMultipliers1x++;

        return value;
    }

    checkIfGameWon(): boolean {
        // Count total 2x and 3x tiles
        const totalMultipliers = this.tiles.reduce((count, row) =>
            count + row.filter(tile => tile.value === 2 || tile.value === 3).length, 0
        );
        // Count flipped 2x and 3x tiles
        const flippedMultipliers = this.tiles.reduce((count, row) =>
            count + row.filter(tile => (tile.value === 2 || tile.value === 3) && tile.flipped).length, 0
        );
        return flippedMultipliers === totalMultipliers && totalMultipliers > 0;
    }

    toJSON() {
        return {
            tiles: this.tiles.map(row => row.map(tile => ({ value: tile.value, flipped: tile.flipped }))),
            rowPointTotals: this.rowPointTotals,
            rowVoltorbTotals: this.rowVoltorbTotals,
            columnPointTotals: this.columnPointTotals,
            columnVoltorbTotals: this.columnVoltorbTotals,
            // Add any other properties needed to fully restore the board
        };
    }

    static fromJSON(data: any): Board {
        const board = Object.create(Board.prototype) as Board;
        board.size = 5;
        board.tiles = data.tiles.map((row: any[]) =>
            row.map(tile => new Tile(tile.value, tile.flipped))
        );
        board.rowPointTotals = data.rowPointTotals;
        board.rowVoltorbTotals = data.rowVoltorbTotals;
        board.columnPointTotals = data.columnPointTotals;
        board.columnVoltorbTotals = data.columnVoltorbTotals;
        // Restore any other properties as needed
        return board;
    }

    getBoard() {
        return this.tiles.map(row => 
            row.map(tile => ({
                value: tile.value,
                flipped: tile.flipped
            }))
        );
    }

    getRowTotals() {
        return this.rowPointTotals.map((points, i) => ({
            points,
            voltorbs: this.rowVoltorbTotals[i]
        }));
    }

    getColumnTotals() {
        return this.columnPointTotals.map((points, i) => ({
            points,
            voltorbs: this.columnVoltorbTotals[i]
        }));
    }
} 