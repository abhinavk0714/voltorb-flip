from Board import Board
from Player import Player

class VoltorbFlipGame:
    def __init__(self, level=1):
        self.level = level
        self.coins = 0
        self.board = Board(self.level)
        self.player = Player()
        self.game_over = False

    def start_game(self):
        """
        Initialize the game and start the gameplay loop.
        """
        # Reset game state, load board for the current level
        self.board.setup_board(self.level)
        self.game_over = False
        self.play_turn()

    def play_turn(self):
        """
        Main loop for playing a turn.
        """
        while not self.game_over:
            self.board.display_board()
            row, col = self.player.choose_tile()
            self.flip_tile(row, col)
            if self.board.check_if_game_won():
                self.advance_level()

    def flip_tile(self, row, col):
        """
        Flip a tile at the given row and column.
        """
        tile_value = self.board.flip_tile(row, col)
        if tile_value == -1:  # Voltorb
            self.game_over = True
            print("You hit a Voltorb! Game over!")
        else:
            self.coins += self.player.calculate_score(tile_value)

    def advance_level(self):
        """
        Advance to the next level and reset the game board.
        """
        self.level += 1
        print(f"Level {self.level} reached!")
        self.start_game()
