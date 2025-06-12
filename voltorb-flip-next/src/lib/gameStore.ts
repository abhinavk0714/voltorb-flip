import { cookies } from 'next/headers';
import { Board } from '@/game/board';

// Helper to get the game state from the cookie
export async function getGameState(cookieStore: ReturnType<typeof cookies>) {
    const gameStateCookie = await cookieStore.get('gameState');
    if (!gameStateCookie) return null;
    try {
        return JSON.parse(gameStateCookie.value);
    } catch {
        return null;
    }
}

// Helper to set the game state cookie
export async function setGameState(cookieStore: ReturnType<typeof cookies>, state: any) {
    const isProd = process.env.NODE_ENV === 'production';
    await cookieStore.set('gameState', JSON.stringify(state), {
        httpOnly: true,
        secure: isProd ? true : false, // Always false for local dev
        sameSite: isProd ? 'strict' : 'lax', // Lax for local dev
        path: '/',
        maxAge: 3600 // 1 hour
    });
}

export async function newGame(cookieStore: ReturnType<typeof cookies>, level?: number) {
    let prevState = await getGameState(cookieStore);
    let coins = 0;
    if (prevState && typeof prevState.coins === 'number') {
        coins = prevState.coins;
    }
    const board = new Board(level || 1);
    const state = {
        board: board.toJSON(),
        row_totals: board.getRowTotals(),
        column_totals: board.getColumnTotals(),
        level: level || 1,
        coins,
        flipped_cards: 0,
        consecutive_wins: 0,
        coins_earned_this_level: 0,
        _multiplierStarted: false
    };
    await setGameState(cookieStore, state);
    return state;
}

export async function flipTile(row: number, col: number, cookieStore: ReturnType<typeof cookies>) {
    const state = await getGameState(cookieStore);
    if (!state) throw new Error('No active game');
    const board = Board.fromJSON(state.board);
    const tile = board.tiles[row][col];
    if (tile.flipped) return { ...state, game_won: false, game_over: false }; // Already flipped
    tile.flipped = true;
    state.flipped_cards += 1;
    let value = tile.value;
    let game_over = false;
    let game_won = false;
    if (value === -1) {
        // Voltorb: game over, drop level if needed
        let flippedMultipliers = 0;
        for (let rowIdx = 0; rowIdx < board.tiles.length; rowIdx++) {
            for (let colIdx = 0; colIdx < board.tiles[rowIdx].length; colIdx++) {
                const t = board.tiles[rowIdx][colIdx];
                if (t.flipped && t.value > 0) flippedMultipliers++;
            }
        }
        if (flippedMultipliers < state.level) {
            state.level = Math.max(1, flippedMultipliers);
        }
        state.coins_earned_this_level = 0;
        state.consecutive_wins = 0;
        board.tiles.forEach(row => row.forEach(t => t.flipped = true));
        state.board = board.toJSON();
        state.row_totals = board.getRowTotals();
        state.column_totals = board.getColumnTotals();
        state.flipped_cards = 0;
        state._multiplierStarted = false;
        await setGameState(cookieStore, state);
        return { ...state, game_won: false, game_over: true };
    } else {
        // Multiplier logic: only multiply for 2x/3x, 1x does not multiply
        if (value === 2 || value === 3) {
            if (!state._multiplierStarted) {
                state.coins_earned_this_level = value;
                state._multiplierStarted = true;
            } else {
                state.coins_earned_this_level *= value;
            }
        } else if (value === 1) {
            // 1x card: do not multiply, do not change coins_earned_this_level
            if (!state._multiplierStarted) {
                state.coins_earned_this_level = 1;
            }
        }
        state.board = board.toJSON();
        state.row_totals = board.getRowTotals();
        state.column_totals = board.getColumnTotals();
        // Check win condition
        if (board.checkIfGameWon()) {
            game_won = true;
            board.tiles.forEach(row => row.forEach(t => t.flipped = true));
            state.board = board.toJSON();
            state.row_totals = board.getRowTotals();
            state.column_totals = board.getColumnTotals();
            state._multiplierStarted = false;
        }
        await setGameState(cookieStore, state);
        return { ...state, game_won: !!game_won, game_over: false };
    }
}

export async function resetGame(cookieStore: ReturnType<typeof cookies>) {
    // Clear all game-related cookies
    await cookieStore.delete('gameState');
    // Set initial values
    await setGameState(cookieStore, {
        level: 1,
        coins: 0,
        consecutive_wins: 0,
        coins_earned_this_level: 0
    });
    return newGame(cookieStore);
}

export async function levelUp(cookieStore: ReturnType<typeof cookies>) {
    const state = await getGameState(cookieStore);
    if (!state) throw new Error('No active game');
    const consecutive_wins = state.consecutive_wins + 1;
    const coins_earned_this_level = state.coins_earned_this_level;
    const coins = state.coins + coins_earned_this_level;
    // Update state
    state.level += 1;
    state.coins = coins;
    state.consecutive_wins = consecutive_wins;
    state.coins_earned_this_level = 0;
    await setGameState(cookieStore, state);
    return newGame(cookieStore);
}

export async function advanceLevel(cookieStore: ReturnType<typeof cookies>) {
    const state = await getGameState(cookieStore);
    if (!state) throw new Error('No active game');
    state.level += 1;
    state.coins += state.coins_earned_this_level;
    state.coins_earned_this_level = 0;
    state.consecutive_wins += 1;
    // Generate a new board for the new level
    const board = new Board(state.level);
    state.board = board.toJSON();
    state.row_totals = board.getRowTotals();
    state.column_totals = board.getColumnTotals();
    state.flipped_cards = 0;
    await setGameState(cookieStore, state);
    return state;
}

export async function dropLevel(cookieStore: ReturnType<typeof cookies>, level: number) {
    const state = await getGameState(cookieStore);
    if (!state) throw new Error('No active game');
    state.level = level;
    state.coins_earned_this_level = 0;
    state.consecutive_wins = 0;
    // Generate a new board for the new level
    const board = new Board(state.level);
    state.board = board.toJSON();
    state.row_totals = board.getRowTotals();
    state.column_totals = board.getColumnTotals();
    state.flipped_cards = 0;
    await setGameState(cookieStore, state);
    return state;
}

export async function quitGame(cookieStore: ReturnType<typeof cookies>) {
    const state = await getGameState(cookieStore);
    if (!state) throw new Error('No active game');
    state.coins += state.coins_earned_this_level;
    state.coins_earned_this_level = 0;
    state.consecutive_wins = 0;
    await setGameState(cookieStore, state);
    return state;
} 