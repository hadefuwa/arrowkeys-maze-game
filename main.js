// Maze Arrow Game JS Version
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = 800;
const HEIGHT = 800;
const CELL_SIZE = 40;
const PLAYER_SIZE = 30;
const GEM_SIZE = 20;
const VERSION = '1.0.2'; // Updated version

let level = 1;
let player = { x: CELL_SIZE, y: CELL_SIZE, speed: 5 };
let gem = { x: WIDTH / 2 - GEM_SIZE / 2, y: HEIGHT / 2 - GEM_SIZE / 2 };
let keys = {};

// Maze grid size
const MAZE_COLS = WIDTH / CELL_SIZE;
const MAZE_ROWS = HEIGHT / CELL_SIZE;

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
function mazeToWalls(maze) {
    const walls = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
            const [top, right, bottom, left] = maze[y][x];
            const px = x * CELL_SIZE;
            const py = y * CELL_SIZE;
            if (top)    walls.push([px, py, CELL_SIZE, 4]);
            if (right)  walls.push([px + CELL_SIZE - 4, py, 4, CELL_SIZE]);
            if (bottom) walls.push([px, py + CELL_SIZE - 4, CELL_SIZE, 4]);
            if (left)   walls.push([px, py, 4, CELL_SIZE]);
        }
    }
    // Outer border (ensure always present)
    walls.push([0, 0, WIDTH, 4]);
    walls.push([0, HEIGHT - 4, WIDTH, 4]);
    walls.push([0, 0, 4, HEIGHT]);
    walls.push([WIDTH - 4, 0, 4, HEIGHT]);
    return walls;
}

let maze = generateMaze(MAZE_COLS, MAZE_ROWS);
let walls = mazeToWalls(maze);

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
}

function drawGem() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(gem.x, gem.y, GEM_SIZE, GEM_SIZE);
}

function drawMaze() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#222';
    for (const [x, y, w, h] of walls) {
        ctx.fillRect(x, y, w, h);
    }
}

function drawVersionInfo() {
    ctx.fillStyle = '#000';
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
        // Generate a new maze
        maze = generateMaze(MAZE_COLS, MAZE_ROWS);
        walls = mazeToWalls(maze);
        resetPlayer();
        resetGem();
    }
}

function resetPlayer() {
    player.x = CELL_SIZE;
    player.y = CELL_SIZE;
}

function resetGem() {
    gem.x = WIDTH - CELL_SIZE * 2;
    gem.y = HEIGHT - CELL_SIZE * 2;
}

function resizeCanvas() {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - 20;
    const scale = Math.min(availableWidth / WIDTH, availableHeight / HEIGHT);
    canvas.style.width = `${WIDTH * scale}px`;
    canvas.style.height = `${HEIGHT * scale}px`;
}

function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
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
resizeCanvas();
gameLoop(); 