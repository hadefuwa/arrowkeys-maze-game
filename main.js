// Maze Arrow Game JS Version
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = 800;
const HEIGHT = 800;
const CELL_SIZE = 40;
const PLAYER_SIZE = 30;
const GEM_SIZE = 20;
const VERSION = '1.0.0';

let level = 1;
let player = { x: CELL_SIZE, y: CELL_SIZE, speed: 5 };
let gem = { x: WIDTH / 2 - GEM_SIZE / 2, y: HEIGHT / 2 - GEM_SIZE / 2 };
let keys = {};

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
}

function drawGem() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(gem.x, gem.y, GEM_SIZE, GEM_SIZE);
}

function drawMaze() {
    // Simple static maze for now, can be randomized per level
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    // Outer border
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    // Example: Draw a few walls
    ctx.beginPath();
    ctx.moveTo(0, 200); ctx.lineTo(600, 200);
    ctx.moveTo(200, 600); ctx.lineTo(800, 600);
    ctx.moveTo(400, 0); ctx.lineTo(400, 400);
    ctx.moveTo(600, 400); ctx.lineTo(800, 400);
    ctx.stroke();
}

function drawLevelInfo() {
    document.getElementById('levelInfo').textContent = `Level: ${level}`;
    document.getElementById('versionInfo').textContent = `v${VERSION}`;
}

function movePlayer() {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']) dx = -1;
    if (keys['ArrowRight']) dx = 1;
    if (keys['ArrowUp']) dy = -1;
    if (keys['ArrowDown']) dy = 1;
    player.x += dx * player.speed;
    player.y += dy * player.speed;
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, WIDTH - PLAYER_SIZE));
    player.y = Math.max(0, Math.min(player.y, HEIGHT - PLAYER_SIZE));
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