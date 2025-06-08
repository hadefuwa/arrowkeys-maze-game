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

// Updated walls: path from top-left to center is open
const walls = [
    [0, 0, WIDTH, 10], // top border
    [0, HEIGHT - 10, WIDTH, 10], // bottom border
    [0, 0, 10, HEIGHT], // left border
    [WIDTH - 10, 0, 10, HEIGHT], // right border
    // Maze walls (leave a path open from top-left to center)
    [100, 0, 10, 300], // vertical left
    [200, 100, 400, 10], // horizontal top
    [700, 100, 10, 400], // vertical right
    [100, 700, 600, 10], // horizontal bottom
    [400, 200, 10, 200], // vertical center
    [200, 400, 400, 10], // horizontal center
    // Leave a gap at (110, 300) to (400, 300) for a path
];

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
    // Draw walls
    ctx.fillStyle = '#222';
    for (const [x, y, w, h] of walls) {
        ctx.fillRect(x, y, w, h);
    }
}

function drawLevelInfo() {
    document.getElementById('levelInfo').textContent = `Level: ${level}`;
    document.getElementById('versionInfo').textContent = `v${VERSION}`;
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
    // Keep player in bounds and check wall collision
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

function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawMaze();
    drawPlayer();
    drawGem();
    drawLevelInfo();
    movePlayer();
    checkGemCollision();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

gameLoop(); 