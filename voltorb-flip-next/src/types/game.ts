export interface BoardState {
    tiles: Array<Array<{
        value: number;
        flipped: boolean;
    }>>;
    rowPointTotals: number[];
    rowVoltorbTotals: number[];
    columnPointTotals: number[];
    columnVoltorbTotals: number[];
    // Add any other board properties as needed
}

export interface GameState {
    level: number;
    coins: number;
    coinsEarnedThisLevel: number;
    consecutiveWins: number;
    flippedCards: number;
    board: BoardState;
    rowTotals: Array<{
        points: number;
        voltorbs: number;
    }>;
    columnTotals: Array<{
        points: number;
        voltorbs: number;
    }>;
}

export interface GameResponse {
    message?: string;
    reset?: boolean;
    game_over?: boolean;
    game_won?: boolean;
    value?: number;
    new_level?: number;
} 