# Voltorb Flip Backend

This is the backend server for the Voltorb Flip game, implemented using FastAPI.

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
```

2. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

To start the development server:
```bash
uvicorn app.main:app --reload
```

The server will be available at http://localhost:8000

## API Endpoints

- `POST /game/new`: Start a new game
- `GET /game/state`: Get the current game state
- `POST /game/flip/{row}/{col}`: Flip a tile at the specified position
- `POST /game/quit`: Quit the current game

## Game Rules

- The game is played on a 5x5 grid
- Each tile contains either a multiplier (1x, 2x, or 3x) or a Voltorb
- Row and column totals show the sum of multipliers and number of Voltorbs
- Flipping a Voltorb ends the game
- Win by finding all 2x and 3x multipliers
- Level progression is based on consecutive wins and number of cards flipped 