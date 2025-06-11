import { GameState, GameResponse } from '@/types/game';
import type { BoardState } from '@/types/game';

function toCamelCaseGameState(data: any): GameState {
    return {
        level: data.level,
        coins: data.coins,
        coinsEarnedThisLevel: data.coins_earned_this_level,
        consecutiveWins: data.consecutive_wins,
        flippedCards: data.flipped_cards,
        board: data.board as BoardState,
        rowTotals: data.row_totals,
        columnTotals: data.column_totals
    };
}

const gameService = {
    async startNewGame(level?: number): Promise<GameState | GameResponse> {
        const response = await fetch('/api/game/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: level ? JSON.stringify({ level }) : undefined,
        });
        if (!response.ok) {
            throw new Error('Failed to start new game');
        }
        const data = await response.json();
        return toCamelCaseGameState(data);
    },

    async getGameState(): Promise<GameState> {
        const response = await fetch('/api/game/state');
        if (!response.ok) {
            throw new Error('Failed to get game state');
        }
        const data = await response.json();
        return toCamelCaseGameState(data);
    },

    async flipTile(row: number, col: number): Promise<any> {
        const response = await fetch(`/api/game/flip/${row}/${col}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to flip tile');
        }
        const data = await response.json();
        // Pass through game_won/game_over if present
        if ('game_won' in data || 'game_over' in data) {
            return {
                ...toCamelCaseGameState(data),
                game_won: !!data.game_won,
                game_over: !!data.game_over,
            };
        }
        return toCamelCaseGameState(data);
    },

    async quitGame(): Promise<GameResponse> {
        const response = await fetch('/api/game/quit', {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to quit game');
        }
        return response.json();
    },

    async resetGame(): Promise<GameResponse> {
        const response = await fetch('/api/game/reset', {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to reset game');
        }
        return response.json();
    },

    async advanceLevel(): Promise<GameState> {
        const response = await fetch('/api/game/advance', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to advance level');
        const data = await response.json();
        return toCamelCaseGameState(data);
    },

    async dropLevel(): Promise<GameState> {
        const response = await fetch('/api/game/drop', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to drop level');
        const data = await response.json();
        return toCamelCaseGameState(data);
    },
};

export { gameService }; 