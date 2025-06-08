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

// Multiple maze layouts
const mazeLayouts = [
    // Maze 1
    [
        [0, 0, WIDTH, 10],
        [0, HEIGHT - 10, WIDTH, 10],
        [0, 0, 10, HEIGHT],
        [WIDTH - 10, 0, 10, HEIGHT],
        [100, 0, 10, 300],
        [200, 100, 400, 10],
        [700, 100, 10, 400],
        [100, 700, 600, 10],
        [400, 200, 10, 200],
        [200, 400, 400, 10],
    ],
    // Maze 2
    [
        [0, 0, WIDTH, 10],
        [0, HEIGHT - 10, WIDTH, 10],
        [0, 0, 10, HEIGHT],
        [WIDTH - 10, 0, 10, HEIGHT],
        [300, 0, 10, 500],
        [500, 300, 10, 500],
        [100, 300, 400, 10],
        [400, 500, 400, 10],
        [600, 100, 10, 400],
        [200, 600, 400, 10],
    ],
    // Maze 3
    [
        [0, 0, WIDTH, 10],
        [0, HEIGHT - 10, WIDTH, 10],
        [0, 0, 10, HEIGHT],
        [WIDTH - 10, 0, 10, HEIGHT],
        [100, 100, 600, 10],
        [100, 200, 10, 500],
        [200, 600, 500, 10],
        [700, 200, 10, 400],
        [200, 200, 400, 10],
        [400, 300, 10, 200],
    ],
];

let currentMazeIndex = 0;
let walls = mazeLayouts[currentMazeIndex];

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
        // Change maze
        currentMazeIndex = (currentMazeIndex + 1) % mazeLayouts.length;
        walls = mazeLayouts[currentMazeIndex];
        resetPlayer();
        resetGem();
    }
}

function resetPlayer() {
    player.x = CELL_SIZE;
    player.y = CELL_SIZE;
}

function resetGem() {
    gem.x = WIDTH / 2 - GEM_SIZE / 2;
    gem.y = HEIGHT / 2 - GEM_SIZE / 2;
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