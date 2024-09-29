class StrategyHelper:
    @staticmethod
    def is_row_dead(voltorbs, sum_of_multipliers, flipped_2x_count, flipped_3x_count):
        """
        Determine if a row or column is dead using the first formula.
        If a + b - 5 > c + 2d, the row/column is not yet dead.
        """
        return voltorbs + sum_of_multipliers - 5 > flipped_2x_count + 2 * flipped_3x_count

    @staticmethod
    def is_row_fully_flipped(voltorbs, sum_of_multipliers, unflipped_count, sum_of_flipped_cards):
        """
        Determine if all the valuable tiles in a row or column have been flipped
        using the second formula.
        If c - a = b - d, the row/column is dead.
        """
        return unflipped_count - voltorbs == sum_of_multipliers - sum_of_flipped_cards

    @staticmethod
    def calculate_simpler_dead_row(voltorbs_and_multipliers_sum, flipped_multipliers):
        """
        Use a simpler method to find dead rows based on the sum of Voltorbs and multipliers.
        """
        return voltorbs_and_multipliers_sum - sum(flipped_multipliers) == 5
