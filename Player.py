class Player:
    def __init__(self):
        self.coins = 0
        self.multiplier = 1
        self.flipped_tiles = []

    def choose_tile(self):
        """
        Allow the player to choose a tile by specifying the row and column.
        For now, this can be simple user input; later, this can be automated.
        """
        row = int(input("Enter row (0-4): "))
        col = int(input("Enter column (0-4): "))
        return row, col

    def calculate_score(self, tile_value):
        """
        Calculate the player's new score based on the tile's multiplier value.
        The first flipped tile gives that many coins, and subsequent flips multiply the total.
        """
        if tile_value > 1:
            self.multiplier *= tile_value
        return tile_value * self.multiplier
