const API_BASE_URL = 'http://localhost:8000';

interface GameState {
  level: number;
  coins: number;
  consecutive_wins: number;
  board: Array<Array<{
    value: number;
    flipped: boolean;
  }>>;
  row_totals: Array<{
    points: number;
    voltorbs: number;
  }>;
  column_totals: Array<{
    points: number;
    voltorbs: number;
  }>;
}

const gameService = {
  async startNewGame(): Promise<GameState> {
    const response = await fetch(`${API_BASE_URL}/game/new`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start new game');
    }
    return response.json();
  },

  async getGameState(): Promise<GameState> {
    const response = await fetch(`${API_BASE_URL}/game/state`);
    if (!response.ok) {
      throw new Error('Failed to get game state');
    }
    return response.json();
  },

  async flipTile(row: number, col: number): Promise<{
    tile_value: number;
    game_over: boolean;
    game_won: boolean;
  }> {
    const response = await fetch(`${API_BASE_URL}/game/flip/${row}/${col}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to flip tile');
    }
    return response.json();
  },

  async quitGame(): Promise<{ new_level: number }> {
    const response = await fetch(`${API_BASE_URL}/game/quit`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to quit game');
    }
    return response.json();
  },
};

export type { GameState };
export { gameService }; 