class Level:
    def __init__(self, level):
        self.level = level
        self.voltorb_count = 0
        self.multiplier_count_2x = 0
        self.multiplier_count_3x = 0
        self.coin_reward = 0
        self.set_level_parameters()

    def set_level_parameters(self):
        """Set the number of Voltorbs and multiplier tiles for the current level."""
        # Level configurations based on the provided game mechanics
        level_settings = {
            1: [
                {'voltorbs': 6, 'multipliers_2x': 3, 'multipliers_3x': 1, 'coins': 24},
                {'voltorbs': 6, 'multipliers_2x': 0, 'multipliers_3x': 3, 'coins': 27},
                {'voltorbs': 6, 'multipliers_2x': 5, 'multipliers_3x': 0, 'coins': 32},
                {'voltorbs': 6, 'multipliers_2x': 2, 'multipliers_3x': 2, 'coins': 36},
                {'voltorbs': 6, 'multipliers_2x': 4, 'multipliers_3x': 1, 'coins': 48}
            ],
            2: [
                {'voltorbs': 7, 'multipliers_2x': 1, 'multipliers_3x': 3, 'coins': 54},
                {'voltorbs': 7, 'multipliers_2x': 6, 'multipliers_3x': 0, 'coins': 64},
                {'voltorbs': 7, 'multipliers_2x': 3, 'multipliers_3x': 2, 'coins': 72},
                {'voltorbs': 7, 'multipliers_2x': 0, 'multipliers_3x': 4, 'coins': 81},
                {'voltorbs': 7, 'multipliers_2x': 5, 'multipliers_3x': 1, 'coins': 96}
            ],
            3: [
                {'voltorbs': 8, 'multipliers_2x': 2, 'multipliers_3x': 3, 'coins': 108},
                {'voltorbs': 8, 'multipliers_2x': 7, 'multipliers_3x': 0, 'coins': 128},
                {'voltorbs': 8, 'multipliers_2x': 4, 'multipliers_3x': 2, 'coins': 144},
                {'voltorbs': 8, 'multipliers_2x': 1, 'multipliers_3x': 4, 'coins': 162},
                {'voltorbs': 8, 'multipliers_2x': 6, 'multipliers_3x': 1, 'coins': 192}
            ],
            4: [
                {'voltorbs': 8, 'multipliers_2x': 3, 'multipliers_3x': 3, 'coins': 216},
                {'voltorbs': 8, 'multipliers_2x': 0, 'multipliers_3x': 5, 'coins': 243},
                {'voltorbs': 10, 'multipliers_2x': 8, 'multipliers_3x': 0, 'coins': 256},
                {'voltorbs': 10, 'multipliers_2x': 5, 'multipliers_3x': 2, 'coins': 288},
                {'voltorbs': 10, 'multipliers_2x': 2, 'multipliers_3x': 4, 'coins': 324}
            ],
            5: [
                {'voltorbs': 10, 'multipliers_2x': 7, 'multipliers_3x': 1, 'coins': 384},
                {'voltorbs': 10, 'multipliers_2x': 4, 'multipliers_3x': 3, 'coins': 432},
                {'voltorbs': 10, 'multipliers_2x': 1, 'multipliers_3x': 5, 'coins': 486},
                {'voltorbs': 10, 'multipliers_2x': 9, 'multipliers_3x': 0, 'coins': 512},
                {'voltorbs': 10, 'multipliers_2x': 6, 'multipliers_3x': 2, 'coins': 576}
            ],
            6: [
                {'voltorbs': 10, 'multipliers_2x': 3, 'multipliers_3x': 4, 'coins': 648},
                {'voltorbs': 10, 'multipliers_2x': 0, 'multipliers_3x': 6, 'coins': 729},
                {'voltorbs': 10, 'multipliers_2x': 8, 'multipliers_3x': 1, 'coins': 768},
                {'voltorbs': 10, 'multipliers_2x': 5, 'multipliers_3x': 3, 'coins': 864},
                {'voltorbs': 10, 'multipliers_2x': 2, 'multipliers_3x': 5, 'coins': 972}
            ],
            7: [
                {'voltorbs': 10, 'multipliers_2x': 7, 'multipliers_3x': 2, 'coins': 1152},
                {'voltorbs': 10, 'multipliers_2x': 4, 'multipliers_3x': 4, 'coins': 1296},
                {'voltorbs': 13, 'multipliers_2x': 1, 'multipliers_3x': 6, 'coins': 1458},
                {'voltorbs': 13, 'multipliers_2x': 9, 'multipliers_3x': 1, 'coins': 1536},
                {'voltorbs': 10, 'multipliers_2x': 6, 'multipliers_3x': 3, 'coins': 1728}
            ],
            8: [
                {'voltorbs': 10, 'multipliers_2x': 0, 'multipliers_3x': 7, 'coins': 2187},
                {'voltorbs': 10, 'multipliers_2x': 8, 'multipliers_3x': 2, 'coins': 2304},
                {'voltorbs': 10, 'multipliers_2x': 5, 'multipliers_3x': 4, 'coins': 2592},
                {'voltorbs': 10, 'multipliers_2x': 2, 'multipliers_3x': 6, 'coins': 2916},
                {'voltorbs': 10, 'multipliers_2x': 7, 'multipliers_3x': 3, 'coins': 3456}
            ]
        }

        if self.level not in level_settings:
            raise ValueError("Invalid level")

        # Randomly select one of the possible configurations for this level
        import random
        settings = random.choice(level_settings[self.level])
        
        self.voltorb_count = settings['voltorbs']
        self.multiplier_count_2x = settings['multipliers_2x']
        self.multiplier_count_3x = settings['multipliers_3x']
        self.coin_reward = settings['coins']

    def get_voltorb_count(self):
        """Return the number of Voltorbs for this level."""
        return self.voltorb_count

    def get_multiplier_counts(self):
        """Return the number of 2x and 3x multiplier tiles for this level."""
        return self.multiplier_count_2x, self.multiplier_count_3x

    def get_coin_reward(self):
        """Return the coin reward for completing this level."""
        return self.coin_reward 