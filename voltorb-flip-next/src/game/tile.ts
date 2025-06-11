export class Tile {
    value: number;
    flipped: boolean;

    constructor(value: number, flipped: boolean = false) {
        this.value = value;
        this.flipped = flipped;
    }

    flip(): number {
        this.flipped = true;
        return this.value;
    }
} 