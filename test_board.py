from Board import Board
from Level import Level

level_number = 1  # or whatever level you want to test
board = Board(level_number)
board.display_board()

# Test flipping a tile
print("Initial board state:")
board.display_board()

# Flip a tile and display results
flipped_value = board.flip_tile(2, 3)
print(f"Flipped tile value: {flipped_value}")

# Display updated board state
board.display_board()
print("Game won?", board.check_if_game_won())
