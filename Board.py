from Tile import Tile
from Level import Level
import random

class Board:
    def __init__(self, level_number):
        self.size = 5
        self.tiles = []
        self.level = Level(level_number)  # Create a Level instance
        self.total_voltorbs = 0
        self.total_multipliers = 0
        self.flipped_multipliers_2x = 0
        self.flipped_multipliers_3x = 0
        self.row_voltorb_totals = [0] * self.size
        self.column_voltorb_totals = [0] * self.size
        self.row_point_totals = [0] * self.size
        self.column_point_totals = [0] * self.size
        self.setup_board(level_number)  # Pass the integer level_number

    def setup_board(self, level):
        """
        Set up the board for the given level.
        """
        self.tiles = [[Tile() for _ in range(self.size)] for _ in range(self.size)]
        self.populate_tiles()
        self.calculate_totals()

    def populate_tiles(self):
        """
        Randomly place Voltorbs and multiplier tiles (1x, 2x, 3x) based on the level.
        """
        level_data = {
            1: (6, 3, 1),  # (Voltorbs, 2x, 3x)
            # Add more levels here
        }

        voltorbs, multiplier_2x, multiplier_3x = level_data[self.level.level]  # Use the level number

        # Place Voltorbs
        for _ in range(voltorbs):
            while True:
                row = random.randint(0, self.size - 1)
                col = random.randint(0, self.size - 1)
                if self.tiles[row][col].value == 1:  # Only place if it's a 1x tile
                    self.tiles[row][col].value = -1  # -1 for Voltorb
                    break

        # Place 2x multipliers
        for _ in range(multiplier_2x):
            while True:
                row = random.randint(0, self.size - 1)
                col = random.randint(0, self.size - 1)
                if self.tiles[row][col].value == 1:  # Only place if it's a 1x tile
                    self.tiles[row][col].value = 2  # 2x multiplier
                    break

        # Place 3x multipliers
        for _ in range(multiplier_3x):
            while True:
                row = random.randint(0, self.size - 1)
                col = random.randint(0, self.size - 1)
                if self.tiles[row][col].value == 1:  # Only place if it's a 1x tile
                    self.tiles[row][col].value = 3  # 3x multiplier
                    break

    def calculate_totals(self):
        """
        Calculate the total number of Voltorbs and points for each row and column.
        """
        # Reset totals
        self.row_voltorb_totals = [0] * self.size
        self.column_voltorb_totals = [0] * self.size
        self.row_point_totals = [0] * self.size
        self.column_point_totals = [0] * self.size

        for row in range(self.size):
            for col in range(self.size):
                tile = self.tiles[row][col]
                if tile.value == -1:  # Voltorb
                    self.row_voltorb_totals[row] += 1
                    self.column_voltorb_totals[col] += 1
                else:
                    self.row_point_totals[row] += tile.value
                    self.column_point_totals[col] += tile.value

    def display_board(self):
        """
        Display the current state of the board to the player, including row/column totals.
        """
        for row in range(self.size):
            display_row = ['?' if not tile.flipped else str(tile.value) for tile in self.tiles[row]]
            print(' | '.join(display_row) + f" || Points: {self.row_point_totals[row]} Voltorbs: {self.row_voltorb_totals[row]}")
            print('-' * (self.size * 4))
        
        # Display column totals
        point_totals_str = ' | '.join(str(pt) for pt in self.column_point_totals)
        voltorb_totals_str = ' | '.join(str(vt) for vt in self.column_voltorb_totals)
        print(f"Points: {point_totals_str}")
        print(f"Voltorbs: {voltorb_totals_str}")

    def flip_tile(self, row, col):
        """
        Flip a tile at the given row and column.
        Returns the value of the tile (Voltorb or multiplier).
        """
        tile = self.tiles[row][col]
        tile.flip()
        if tile.value == 2:
            self.flipped_multipliers_2x += 1
        elif tile.value == 3:
            self.flipped_multipliers_3x += 1
        return tile.value

    def check_if_game_won(self):
        """
        Check if the player has won the game by flipping all the multiplier cards (2x and 3x).
        """
        required_2x, required_3x = self.level.get_multiplier_counts()
        return (self.flipped_multipliers_2x == required_2x and
                self.flipped_multipliers_3x == required_3x)
