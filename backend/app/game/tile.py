class Tile:
    def __init__(self):
        self.value = 1  # Default to 1x multiplier
        self.flipped = False
        self.memo = None  # For memo mode: can be 'voltorb', '1', '2', or '3'

    def flip(self):
        """Flip the tile to reveal its value."""
        self.flipped = True

    def set_memo(self, value: str):
        """Set a memo on the tile (for memo mode)."""
        if value in ['voltorb', '1', '2', '3']:
            self.memo = value
        else:
            raise ValueError("Invalid memo value")

    def is_voltorb(self) -> bool:
        """Check if the tile is a Voltorb."""
        return self.value == -1 