import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Constants
WINDOW_SIZE = 800
CELL_SIZE = 40
GRID_SIZE = WINDOW_SIZE // CELL_SIZE
PLAYER_SIZE = 30
GEM_SIZE = 20
VERSION = "1.0.0"  # Added version number

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)

# Set up the display
screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
pygame.display.set_caption("Maze Arrow Game")

class Player:
    def __init__(self):
        self.reset_position()
        self.speed = 5

    def reset_position(self):
        self.x = CELL_SIZE
        self.y = CELL_SIZE

    def move(self, dx, dy, maze):
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed
        
        # Keep player within bounds
        new_x = max(0, min(new_x, WINDOW_SIZE - PLAYER_SIZE))
        new_y = max(0, min(new_y, WINDOW_SIZE - PLAYER_SIZE))
        
        self.x = new_x
        self.y = new_y

    def draw(self):
        pygame.draw.rect(screen, RED, (self.x, self.y, PLAYER_SIZE, PLAYER_SIZE))

class Gem:
    def __init__(self):
        self.reset_position()

    def reset_position(self):
        self.x = WINDOW_SIZE - CELL_SIZE * 2
        self.y = WINDOW_SIZE - CELL_SIZE * 2

    def draw(self):
        pygame.draw.rect(screen, YELLOW, (self.x, self.y, GEM_SIZE, GEM_SIZE))

class Game:
    def __init__(self):
        self.player = Player()
        self.gem = Gem()
        self.level = 1
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)  # Smaller font for version

    def handle_input(self):
        keys = pygame.key.get_pressed()
        dx = keys[pygame.K_RIGHT] - keys[pygame.K_LEFT]
        dy = keys[pygame.K_DOWN] - keys[pygame.K_UP]
        self.player.move(dx, dy, None)

    def check_collision(self):
        player_rect = pygame.Rect(self.player.x, self.player.y, PLAYER_SIZE, PLAYER_SIZE)
        gem_rect = pygame.Rect(self.gem.x, self.gem.y, GEM_SIZE, GEM_SIZE)
        
        if player_rect.colliderect(gem_rect):
            self.level += 1
            self.player.reset_position()
            self.gem.reset_position()

    def draw(self):
        screen.fill(WHITE)
        
        # Draw level text
        level_text = self.font.render(f"Level: {self.level}", True, BLACK)
        screen.blit(level_text, (10, 10))
        
        # Draw version text in bottom right
        version_text = self.small_font.render(f"v{VERSION}", True, BLACK)
        version_rect = version_text.get_rect(bottomright=(WINDOW_SIZE - 10, WINDOW_SIZE - 10))
        screen.blit(version_text, version_rect)
        
        # Draw player and gem
        self.player.draw()
        self.gem.draw()
        
        pygame.display.flip()

    def run(self):
        clock = pygame.time.Clock()
        running = True

        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

            self.handle_input()
            self.check_collision()
            self.draw()
            clock.tick(60)

        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run() 