from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .game.board import Board
from .game.level import Level

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state
current_board: Optional[Board] = None
current_level = 1
coins = 0
consecutive_wins = 0
flipped_cards_in_current_game = 0

class GameState(BaseModel):
    level: int
    coins: int
    consecutive_wins: int
    flipped_cards: int
    board: List[List[dict]]
    row_totals: List[dict]
    column_totals: List[dict]

@app.post("/game/new")
async def new_game():
    global current_board, current_level, coins, consecutive_wins, flipped_cards_in_current_game
    current_board = Board(current_level)
    flipped_cards_in_current_game = 0
    return await get_game_state()

@app.get("/game/state")
async def get_game_state():
    if not current_board:
        raise HTTPException(status_code=400, detail="No active game")
    
    return GameState(
        level=current_level,
        coins=coins,
        consecutive_wins=consecutive_wins,
        flipped_cards=flipped_cards_in_current_game,
        board=[[{"value": tile.value, "flipped": tile.flipped} for tile in row] for row in current_board.tiles],
        row_totals=[{"points": pt, "voltorbs": vt} for pt, vt in zip(current_board.row_point_totals, current_board.row_voltorb_totals)],
        column_totals=[{"points": pt, "voltorbs": vt} for pt, vt in zip(current_board.column_point_totals, current_board.column_voltorb_totals)]
    )

@app.post("/game/flip/{row}/{col}")
async def flip_tile(row: int, col: int):
    global current_board, current_level, coins, consecutive_wins, flipped_cards_in_current_game
    
    if not current_board:
        raise HTTPException(status_code=400, detail="No active game")
    
    if row < 0 or row >= 5 or col < 0 or col >= 5:
        raise HTTPException(status_code=400, detail="Invalid tile position")
    
    tile = current_board.tiles[row][col]
    if tile.flipped:
        raise HTTPException(status_code=400, detail="Tile already flipped")
    
    value = current_board.flip_tile(row, col)
    flipped_cards_in_current_game += 1
    
    if value == -1:  # Voltorb
        # Game over - drop level based on flipped cards
        new_level = min(flipped_cards_in_current_game, current_level)
        if new_level < current_level:
            current_level = new_level
        consecutive_wins = 0
        return {"game_over": True, "value": value, "new_level": current_level}
    
    # Update coins based on multiplier
    if coins == 0:
        coins = value
    else:
        coins *= value
    
    # Check for win condition
    if current_board.check_if_game_won():
        consecutive_wins += 1
        if consecutive_wins >= 5 and flipped_cards_in_current_game >= 8:
            current_level = 8
        elif current_level < 8:
            current_level += 1
        return {"game_won": True, "value": value, "new_level": current_level}
    
    return {"value": value}

@app.post("/game/quit")
async def quit_game():
    global current_board, current_level, consecutive_wins, flipped_cards_in_current_game
    
    if not current_board:
        raise HTTPException(status_code=400, detail="No active game")
    
    # Drop level based on flipped cards
    new_level = min(flipped_cards_in_current_game, current_level)
    if new_level < current_level:
        current_level = new_level
    consecutive_wins = 0
    
    return {"new_level": current_level} 