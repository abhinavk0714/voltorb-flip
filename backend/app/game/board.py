from .tile import Tile
from .level import Level
import random

class Board:
    def __init__(self, level_number):
        self.size = 5
        self.tiles = []
        self.level = Level(level_number)
        self.total_voltorbs = 0
        self.total_multipliers = 0
        self.flipped_multipliers_2x = 0
        self.flipped_multipliers_3x = 0
        self.row_voltorb_totals = [0] * self.size
        self.column_voltorb_totals = [0] * self.size
        self.row_point_totals = [0] * self.size
        self.column_point_totals = [0] * self.size
        self.setup_board()

    def setup_board(self):
        """Set up the board with tiles and calculate totals."""
        # Initialize all tiles as 1x multipliers
        self.tiles = [[Tile() for _ in range(self.size)] for _ in range(self.size)]
        
        # Place Voltorbs
        voltorbs_to_place = self.level.get_voltorb_count()
        while voltorbs_to_place > 0:
            row = random.randint(0, self.size - 1)
            col = random.randint(0, self.size - 1)
            if self.tiles[row][col].value == 1:  # Only place if it's a 1x tile
                self.tiles[row][col].value = -1  # -1 for Voltorb
                voltorbs_to_place -= 1

        # Place 2x multipliers
        multiplier_2x, multiplier_3x = self.level.get_multiplier_counts()
        while multiplier_2x > 0:
            row = random.randint(0, self.size - 1)
            col = random.randint(0, self.size - 1)
            if self.tiles[row][col].value == 1:  # Only place if it's a 1x tile
                self.tiles[row][col].value = 2  # 2x multiplier
                multiplier_2x -= 1

        # Place 3x multipliers
        while multiplier_3x > 0:
            row = random.randint(0, self.size - 1)
            col = random.randint(0, self.size - 1)
            if self.tiles[row][col].value == 1:  # Only place if it's a 1x tile
                self.tiles[row][col].value = 3  # 3x multiplier
                multiplier_3x -= 1

        self.calculate_totals()

    def calculate_totals(self):
        """Calculate the total number of Voltorbs and points for each row and column."""
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

    def flip_tile(self, row, col):
        """Flip a tile at the given row and column."""
        tile = self.tiles[row][col]
        if not tile.flipped:
            tile.flip()
            if tile.value == 2:
                self.flipped_multipliers_2x += 1
            elif tile.value == 3:
                self.flipped_multipliers_3x += 1
        return tile.value

    def check_if_game_won(self):
        """Check if the player has won by finding all 2x and 3x multipliers."""
        required_2x, required_3x = self.level.get_multiplier_counts()
        return (self.flipped_multipliers_2x == required_2x and
                self.flipped_multipliers_3x == required_3x)

    def is_row_dead(self, row):
        """Check if a row is 'dead' (contains only 1x multipliers and Voltorbs)."""
        a = self.row_voltorb_totals[row]
        b = self.row_point_totals[row]
        c = sum(1 for tile in self.tiles[row] if not tile.flipped)
        d = sum(tile.value for tile in self.tiles[row] if tile.flipped)
        return c - a == b - d

    def is_column_dead(self, col):
        """Check if a column is 'dead' (contains only 1x multipliers and Voltorbs)."""
        a = self.column_voltorb_totals[col]
        b = self.column_point_totals[col]
        c = sum(1 for row in range(self.size) if not self.tiles[row][col].flipped)
        d = sum(self.tiles[row][col].value for row in range(self.size) if self.tiles[row][col].flipped)
        return c - a == b - d 