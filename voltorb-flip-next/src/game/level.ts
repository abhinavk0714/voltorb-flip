console.log('!!! Voltorb Flip main page loaded !!!');

interface LevelSettings {
    voltorbs: number;
    multipliers_2x: number;
    multipliers_3x: number;
    coins: number;
}

export class Level {
    private level: number;

    constructor(level: number) {
        this.level = Math.max(1, Math.min(8, level));
    }

    getVoltorbCount(): number {
        return Math.min(this.level + 2, 8);
    }

    getMultiplierCount(): number {
        return Math.min(this.level + 1, 6);
    }

    getMultiplierCounts(): [number, number] {
        const multiplierCount2x = Math.floor(this.level / 2);
        const multiplierCount3x = this.level % 2;
        return [multiplierCount2x, multiplierCount3x];
    }

    getCoinReward(): number {
        const levelSettings: Record<number, LevelSettings[]> = {
            1: [
                { voltorbs: 6, multipliers_2x: 3, multipliers_3x: 1, coins: 24 },
                { voltorbs: 6, multipliers_2x: 0, multipliers_3x: 3, coins: 27 },
                { voltorbs: 6, multipliers_2x: 5, multipliers_3x: 0, coins: 32 },
                { voltorbs: 6, multipliers_2x: 2, multipliers_3x: 2, coins: 36 },
                { voltorbs: 6, multipliers_2x: 4, multipliers_3x: 1, coins: 48 }
            ],
            2: [
                { voltorbs: 7, multipliers_2x: 1, multipliers_3x: 3, coins: 54 },
                { voltorbs: 7, multipliers_2x: 6, multipliers_3x: 0, coins: 64 },
                { voltorbs: 7, multipliers_2x: 3, multipliers_3x: 2, coins: 72 },
                { voltorbs: 7, multipliers_2x: 0, multipliers_3x: 4, coins: 81 },
                { voltorbs: 7, multipliers_2x: 5, multipliers_3x: 1, coins: 96 }
            ],
            3: [
                { voltorbs: 8, multipliers_2x: 2, multipliers_3x: 3, coins: 108 },
                { voltorbs: 8, multipliers_2x: 7, multipliers_3x: 0, coins: 128 },
                { voltorbs: 8, multipliers_2x: 4, multipliers_3x: 2, coins: 144 },
                { voltorbs: 8, multipliers_2x: 1, multipliers_3x: 4, coins: 162 },
                { voltorbs: 8, multipliers_2x: 6, multipliers_3x: 1, coins: 192 }
            ],
            4: [
                { voltorbs: 8, multipliers_2x: 3, multipliers_3x: 3, coins: 216 },
                { voltorbs: 8, multipliers_2x: 0, multipliers_3x: 5, coins: 243 },
                { voltorbs: 10, multipliers_2x: 8, multipliers_3x: 0, coins: 256 },
                { voltorbs: 10, multipliers_2x: 5, multipliers_3x: 2, coins: 288 },
                { voltorbs: 10, multipliers_2x: 2, multipliers_3x: 4, coins: 324 }
            ],
            5: [
                { voltorbs: 10, multipliers_2x: 7, multipliers_3x: 1, coins: 384 },
                { voltorbs: 10, multipliers_2x: 4, multipliers_3x: 3, coins: 432 },
                { voltorbs: 10, multipliers_2x: 1, multipliers_3x: 5, coins: 486 },
                { voltorbs: 10, multipliers_2x: 9, multipliers_3x: 0, coins: 512 },
                { voltorbs: 10, multipliers_2x: 6, multipliers_3x: 2, coins: 576 }
            ],
            6: [
                { voltorbs: 10, multipliers_2x: 3, multipliers_3x: 4, coins: 648 },
                { voltorbs: 10, multipliers_2x: 0, multipliers_3x: 6, coins: 729 },
                { voltorbs: 10, multipliers_2x: 8, multipliers_3x: 1, coins: 768 },
                { voltorbs: 10, multipliers_2x: 5, multipliers_3x: 3, coins: 864 },
                { voltorbs: 10, multipliers_2x: 2, multipliers_3x: 5, coins: 972 }
            ],
            7: [
                { voltorbs: 10, multipliers_2x: 7, multipliers_3x: 2, coins: 1152 },
                { voltorbs: 10, multipliers_2x: 4, multipliers_3x: 4, coins: 1296 },
                { voltorbs: 13, multipliers_2x: 1, multipliers_3x: 6, coins: 1458 },
                { voltorbs: 13, multipliers_2x: 9, multipliers_3x: 1, coins: 1536 },
                { voltorbs: 10, multipliers_2x: 6, multipliers_3x: 3, coins: 1728 }
            ],
            8: [
                { voltorbs: 10, multipliers_2x: 0, multipliers_3x: 7, coins: 2187 },
                { voltorbs: 10, multipliers_2x: 8, multipliers_3x: 2, coins: 2304 },
                { voltorbs: 10, multipliers_2x: 5, multipliers_3x: 4, coins: 2592 },
                { voltorbs: 10, multipliers_2x: 2, multipliers_3x: 6, coins: 2916 },
                { voltorbs: 10, multipliers_2x: 7, multipliers_3x: 3, coins: 3456 }
            ]
        };

        const settings = levelSettings[this.level][Math.floor(Math.random() * levelSettings[this.level].length)];
        return settings.coins;
    }
} 