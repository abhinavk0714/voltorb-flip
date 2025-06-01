from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .game.board import Board
from .game.level import Level
import logging

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "http://localhost:5174",  # Alternative local port
        "https://voltorb-flip-murex.vercel.app/",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state
current_board: Optional[Board] = None
current_level = 1
coins = 0
coins_earned_this_level = 0
consecutive_wins = 0
flipped_cards_in_current_game = 0
MAX_COINS = 50000

class GameState(BaseModel):
    level: int
    coins: int
    coins_earned_this_level: int
    consecutive_wins: int
    flipped_cards: int
    board: List[List[dict]]
    row_totals: List[dict]
    column_totals: List[dict]

@app.post("/game/new")
async def new_game():
    global current_board, current_level, coins, coins_earned_this_level, consecutive_wins, flipped_cards_in_current_game
    
    # Check if player has max coins
    if coins >= MAX_COINS:
        # Reset all state and return a special message
        coins = 0
        coins_earned_this_level = 0
        consecutive_wins = 0
        flipped_cards_in_current_game = 0
        current_level = 1
        current_board = Board(current_level)
        return {"message": "Congratulations! You reached 50,000 coins! The game has been reset. Play again and try to beat your record!", "reset": True}
    
    # Clamp current_level to 1-8
    if current_level < 1 or current_level > 8:
        current_level = 1
    try:
        current_board = Board(current_level)
    except Exception as e:
        logging.error(f"Board creation failed at level {current_level}: {e}")
        # If board creation fails, reset to level 1 and try again
        current_level = 1
        try:
            current_board = Board(current_level)
        except Exception as e2:
            logging.error(f"Board creation failed again at level 1: {e2}")
            # Reset all state and try one last time
            coins = 0
            coins_earned_this_level = 0
            consecutive_wins = 0
            flipped_cards_in_current_game = 0
            try:
                current_board = Board(1)
            except Exception as e3:
                logging.critical(f"Board creation failed after full reset: {e3}")
                raise HTTPException(status_code=500, detail="Critical error: Unable to create a new board. Please try refreshing or restarting the server.")
    flipped_cards_in_current_game = 0
    coins_earned_this_level = 0
    return await get_game_state()

@app.get("/game/state")
async def get_game_state():
    if not current_board:
        raise HTTPException(status_code=400, detail="No active game")
    
    return GameState(
        level=current_level,
        coins=coins,
        coins_earned_this_level=coins_earned_this_level,
        consecutive_wins=consecutive_wins,
        flipped_cards=flipped_cards_in_current_game,
        board=[[{"value": tile.value, "flipped": tile.flipped} for tile in row] for row in current_board.tiles],
        row_totals=[{"points": pt, "voltorbs": vt} for pt, vt in zip(current_board.row_point_totals, current_board.row_voltorb_totals)],
        column_totals=[{"points": pt, "voltorbs": vt} for pt, vt in zip(current_board.column_point_totals, current_board.column_voltorb_totals)]
    )

@app.post("/game/flip/{row}/{col}")
async def flip_tile(row: int, col: int):
    global current_board, current_level, coins, coins_earned_this_level, consecutive_wins, flipped_cards_in_current_game
    
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
        if flipped_cards_in_current_game <= 2:
            current_level = max(1, current_level - 1)  # Drop one level if few cards flipped
        else:
            current_level = max(1, current_level - 2)  # Drop two levels if many cards flipped
        consecutive_wins = 0
        coins_earned_this_level = 0
        return {"game_over": True, "value": value, "new_level": current_level}
    
    # Update coins based on multiplier
    if coins_earned_this_level == 0:
        coins_earned_this_level = value
    else:
        coins_earned_this_level *= value
    
    # Check for win condition
    if current_board.check_if_game_won():
        consecutive_wins += 1
        # Add level coins to total coins when level is won
        coins += coins_earned_this_level
        # Ensure coins don't exceed maximum
        coins = min(coins, MAX_COINS)
        # Check for level 8 progression
        if consecutive_wins >= 5 and flipped_cards_in_current_game >= 8:
            current_level = 8
        elif current_level < 8:
            current_level += 1
        return {"game_won": True, "value": value, "new_level": current_level}
    
    return {"value": value}

@app.post("/game/quit")
async def quit_game():
    global current_board, current_level, consecutive_wins, flipped_cards_in_current_game, coins_earned_this_level
    
    if not current_board:
        raise HTTPException(status_code=400, detail="No active game")
    
    # Drop level based on flipped cards
    if flipped_cards_in_current_game <= 2:
        current_level = max(1, current_level - 1)  # Drop one level if few cards flipped
    else:
        current_level = max(1, current_level - 2)  # Drop two levels if many cards flipped
    consecutive_wins = 0
    coins_earned_this_level = 0
    
    return {"new_level": current_level}

@app.post("/game/reset")
async def reset_game():
    global current_board, current_level, coins, coins_earned_this_level, consecutive_wins, flipped_cards_in_current_game
    current_board = None
    current_level = 1
    coins = 0
    coins_earned_this_level = 0
    consecutive_wins = 0
    flipped_cards_in_current_game = 0
    return {"message": "Game reset to level 1"} 