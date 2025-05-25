# Voltorb Flip

A web-based implementation of the Voltorb Flip minigame from Pokémon HeartGold/SoulSilver.

## Features

- Classic 5x5 Voltorb Flip gameplay
- Modern, responsive UI
- Real-time game state updates
- Progressive difficulty levels

## Coming Soon

- Memo system for marking tiles
- Multiple difficulty levels
- Coin collection and tracking system

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + Python
- Styling: CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.12 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voltorb-flip.git
cd voltorb-flip
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Play

1. The game board consists of a 5x5 grid of tiles
2. Each tile contains either a number (1, 2, or 3) or a Voltorb
3. The numbers on the right and bottom show:
   - The sum of all numbers in that row/column
   - The number of Voltorb in that row/column
4. Click tiles to reveal them
5. If you hit a Voltorb, the game is over
6. To win, you must reveal all tiles that contain numbers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.