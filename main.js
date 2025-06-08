// Maze Arrow Game JS Version
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = 800;
const HEIGHT = 800;
const CELL_SIZE = 40;
const PLAYER_SIZE = 40;
const GEM_SIZE = 32;
const VERSION = '1.0.4'; // Updated version

let level = 1;
let player = { x: 0, y: 0, speed: 5 };
let gem = { x: 0, y: 0 };
let keys = {};

// Load local sprites if available, otherwise use online fallback
function loadSprite(localPath, fallbackUrl) {
    const img = new Image();
    img.src = localPath;
    img.onerror = function() {
        img.onerror = null;
        img.src = fallbackUrl;
    };
    return img;
}

const playerImg = loadSprite('sprites/player.png', 'https://kenney.nl/assets/platformer-art-deluxe/PNG/Player/pinkGirl_idle.png');
const gemImg = loadSprite('sprites/gem.png', 'https://kenney.nl/assets/puzzle-pack/PNG/Default/star.png');

// Pastel colors
const BG_COLOR = '#ffe6f7'; // pastel pink
const WALL_COLOR = '#e0b3ff'; // pastel purple

// Difficulty scaling
function getMazeSizeForLevel(level) {
    // Level 1: 6x6, Level 10+: 15x15
    const minSize = 6;
    const maxSize = 15;
    const size = Math.min(maxSize, minSize + level - 1);
    return size;
}

// Directions: [dx, dy, wallIndex, oppositeWallIndex]
const DIRS = [
    [0, -1, 0, 2], // up
    [1, 0, 1, 3],  // right
    [0, 1, 2, 0],  // down
    [-1, 0, 3, 1], // left
];

// Generate a random maze using DFS (Recursive Backtracker)
function generateMaze(cols, rows) {
    // Each cell: [top, right, bottom, left] (walls)
    const maze = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => [true, true, true, true])
    );
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const stack = [];
    let cx = 0, cy = 0;
    visited[cy][cx] = true;
    stack.push([cx, cy]);
    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        // Find unvisited neighbors
        const neighbors = [];
        DIRS.forEach(([dx, dy, wall, oppWall], dirIdx) => {
            const nx = x + dx, ny = y + dy;
            if (
                nx >= 0 && nx < cols &&
                ny >= 0 && ny < rows &&
                !visited[ny][nx]
            ) {
                neighbors.push([nx, ny, wall, oppWall]);
            }
        });
        if (neighbors.length > 0) {
            // Pick a random neighbor
            const [nx, ny, wall, oppWall] = neighbors[Math.floor(Math.random() * neighbors.length)];
            // Remove wall between current and neighbor
            maze[y][x][wall] = false;
            maze[ny][nx][oppWall] = false;
            visited[ny][nx] = true;
            stack.push([nx, ny]);
        } else {
            stack.pop();
        }
    }
    return maze;
}

// Convert maze grid to wall rectangles for rendering
function mazeToWalls(maze, cellSize) {
    const rows = maze.length;
    const cols = maze[0].length;
    const walls = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const [top, right, bottom, left] = maze[y][x];
            const px = x * cellSize;
            const py = y * cellSize;
            if (top)    walls.push([px, py, cellSize, 4]);
            if (right)  walls.push([px + cellSize - 4, py, 4, cellSize]);
            if (bottom) walls.push([px, py + cellSize - 4, cellSize, 4]);
            if (left)   walls.push([px, py, 4, cellSize]);
        }
    }
    // Outer border (ensure always present)
    walls.push([0, 0, cols * cellSize, 4]);
    walls.push([0, rows * cellSize - 4, cols * cellSize, 4]);
    walls.push([0, 0, 4, rows * cellSize]);
    walls.push([cols * cellSize - 4, 0, 4, rows * cellSize]);
    return walls;
}

// Dynamic maze/grid/cell size
let maze, walls, MAZE_COLS, MAZE_ROWS, MAZE_CELL_SIZE;
function setupMazeForLevel(level) {
    const gridSize = getMazeSizeForLevel(level);
    MAZE_COLS = gridSize;
    MAZE_ROWS = gridSize;
    MAZE_CELL_SIZE = Math.floor(WIDTH / gridSize);
    maze = generateMaze(MAZE_COLS, MAZE_ROWS);
    walls = mazeToWalls(maze, MAZE_CELL_SIZE);
    resetPlayer();
    resetGem();
}

function drawPlayer() {
    if (playerImg.complete && playerImg.naturalWidth > 0) {
        ctx.drawImage(playerImg, player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    } else {
        ctx.fillStyle = '#ff69b4'; // fallback pink
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }
}

function drawGem() {
    if (gemImg.complete && gemImg.naturalWidth > 0) {
        ctx.drawImage(gemImg, gem.x, gem.y, GEM_SIZE, GEM_SIZE);
    } else {
        ctx.fillStyle = '#ffd1dc'; // fallback pastel pink
        ctx.fillRect(gem.x, gem.y, GEM_SIZE, GEM_SIZE);
    }
}

function drawMaze() {
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth = 4;
    ctx.fillStyle = WALL_COLOR;
    for (const [x, y, w, h] of walls) {
        ctx.fillRect(x, y, w, h);
    }
}

function drawVersionInfo() {
    ctx.fillStyle = '#b266b2';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`v${VERSION}`, WIDTH - 10, HEIGHT - 10);
}

function rectsCollide(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function canMove(newX, newY) {
    for (const [wx, wy, ww, wh] of walls) {
        if (rectsCollide(newX, newY, PLAYER_SIZE, PLAYER_SIZE, wx, wy, ww, wh)) {
            return false;
        }
    }
    return true;
}

function movePlayer() {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']) dx = -1;
    if (keys['ArrowRight']) dx = 1;
    if (keys['ArrowUp']) dy = -1;
    if (keys['ArrowDown']) dy = 1;
    let newX = player.x + dx * player.speed;
    let newY = player.y + dy * player.speed;
    if (canMove(newX, player.y)) player.x = newX;
    if (canMove(player.x, newY)) player.y = newY;
}

function checkGemCollision() {
    if (
        player.x < gem.x + GEM_SIZE &&
        player.x + PLAYER_SIZE > gem.x &&
        player.y < gem.y + GEM_SIZE &&
        player.y + PLAYER_SIZE > gem.y
    ) {
        level++;
        setupMazeForLevel(level);
    }
}

function resetPlayer() {
    player.x = MAZE_CELL_SIZE + 4;
    player.y = MAZE_CELL_SIZE + 4;
}

function resetGem() {
    // Place gem in bottom right cell
    player.gemCellOffset = 0;
    gem.x = (MAZE_COLS - 2) * MAZE_CELL_SIZE + (MAZE_CELL_SIZE - GEM_SIZE) / 2;
    gem.y = (MAZE_ROWS - 2) * MAZE_CELL_SIZE + (MAZE_CELL_SIZE - GEM_SIZE) / 2;
}

function resizeCanvas() {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - 20;
    const scale = Math.min(availableWidth / WIDTH, availableHeight / HEIGHT);
    canvas.style.width = `${WIDTH * scale}px`;
    canvas.style.height = `${HEIGHT * scale}px`;
}

function gameLoop() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMaze();
    drawPlayer();
    drawGem();
    drawVersionInfo();
    movePlayer();
    checkGemCollision();
    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', resizeCanvas);
document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

// Initial resize
setupMazeForLevel(level);
resizeCanvas();
gameLoop(); 