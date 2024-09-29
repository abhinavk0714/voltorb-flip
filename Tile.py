class Tile:
    def __init__(self):
        """
        Initialize a tile with a default value of 1 (1x multiplier).
        The value can later be updated to represent 2x, 3x, or 'Voltorb'.
        """
        self.value = 1  # Default is 1x; other values are 2, 3, or 'Voltorb'
        self.flipped = False

    def flip(self):
        """
        Mark the tile as flipped.
        """
        self.flipped = True

    def is_voltorb(self):
        """
        Check if the tile is a Voltorb.
        """
        return self.value == 'Voltorb'

    def is_multiplier(self):
        """
        Check if the tile is a multiplier card (2x or 3x).
        """
        return isinstance(self.value, int) and self.value > 1

    def __str__(self):
        """
        Return a string representation of the tile's value.
        Display '?' if the tile is unflipped.
        """
        return '?' if not self.flipped else str(self.value)
