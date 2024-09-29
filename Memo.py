class Memo:
    def __init__(self, board_size=5):
        # 2D array representing the memo for each tile: None, "Voltorb", "1", "2", or "3"
        self.memo_grid = [[None for _ in range(board_size)] for _ in range(board_size)]

    def set_memo(self, row, col, value):
        """
        Set a memo for a specific tile. Value can be "Voltorb", "1", "2", or "3".
        """
        self.memo_grid[row][col] = value

    def get_memo(self, row, col):
        """
        Get the memo value for a specific tile.
        """
        return self.memo_grid[row][col]

    def display_memo(self):
        """
        Display the current memo grid.
        """
        for row in self.memo_grid:
            display_row = [val if val else '?' for val in row]
            print(' | '.join(display_row))
            print('-' * (len(row) * 4))
