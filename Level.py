class Level:
    def __init__(self, level):
        self.level = level
        self.voltorb_count = 0
        self.multiplier_count_2x = 0
        self.multiplier_count_3x = 0
        self.coin_reward = 0  # Optional: You can track rewards or other level-specific data
        self.set_level_parameters()

    def set_level_parameters(self):
        """
        Set the number of Voltorbs and multiplier tiles for the current level.
        These parameters are based on pre-defined level configurations.
        """
        level_settings = {
            1: {'voltorbs': 6, 'multipliers_2x': 3, 'multipliers_3x': 1, 'coins': 24},
            2: {'voltorbs': 7, 'multipliers_2x': 1, 'multipliers_3x': 3, 'coins': 54},
            3: {'voltorbs': 8, 'multipliers_2x': 2, 'multipliers_3x': 3, 'coins': 108},
            4: {'voltorbs': 8, 'multipliers_2x': 3, 'multipliers_3x': 3, 'coins': 216},
            5: {'voltorbs': 10, 'multipliers_2x': 2, 'multipliers_3x': 4, 'coins': 432},
            6: {'voltorbs': 10, 'multipliers_2x': 3, 'multipliers_3x': 4, 'coins': 648},
            7: {'voltorbs': 10, 'multipliers_2x': 3, 'multipliers_3x': 5, 'coins': 864},
            8: {'voltorbs': 10, 'multipliers_2x': 3, 'multipliers_3x': 6, 'coins': 1728},
        }

        if self.level not in level_settings:
            raise ValueError("Invalid level")

        settings = level_settings[self.level]
        self.voltorb_count = settings['voltorbs']
        self.multiplier_count_2x = settings['multipliers_2x']
        self.multiplier_count_3x = settings['multipliers_3x']
        self.coin_reward = settings['coins']

    def get_voltorb_count(self):
        """
        Return the number of Voltorbs for this level.
        """
        return self.voltorb_count

    def get_multiplier_counts(self):
        """
        Return the number of 2x and 3x multiplier tiles for this level.
        """
        return self.multiplier_count_2x, self.multiplier_count_3x

    def get_coin_reward(self):
        """
        Return the coin reward for completing this level.
        """
        return self.coin_reward
