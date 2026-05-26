/* Canvas setup - We create the drawing surface for the game */
/* ctx is what we use to draw shapes, colours, images */

console.log("Game loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_W = 900;
const CANVAS_H = 600;

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;


/* Game state - every module reads from and writes to this object */

const gameState = {

    running: false,
    score: 0,
    nestProgress: 0,
    lives: 3,

    won: false,
    lost: false

};


/* Loop guard - ensures only one game loop runs at a time */

let loopStarted = false;


/* Input state - tracks which keys are currently pressed */

const keys = {};

window.addEventListener('keydown', (e) => {

    keys[e.code] = true;

    if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'Space'
    ) {
        e.preventDefault();
    }

});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});


/* Init is called when the player clicks start or restart */
/* Resets the game state and re-initialises every module */

function init() {

    gameState.running = true;

    gameState.score = 0;
    gameState.nestProgress = 0;
    gameState.lives = 3;

    gameState.won = false;
    gameState.lost = false;

    initBackground(CANVAS_W, CANVAS_H);
    initNest(CANVAS_W, CANVAS_H);
    initCollectibles(CANVAS_W, CANVAS_H);
    initPlayer(CANVAS_W, CANVAS_H);
    initShark(CANVAS_W, CANVAS_H);

}


/* Application Stage */
/* Update - runs all game logic every frame such as movement, collision detection, pickups, win and lose checks */

function update() {

    if (!gameState.running) return;

    updateNest(gameState);
    updatePlayer(keys, gameState, CANVAS_W, CANVAS_H);
    updateShark(gameState, CANVAS_W, CANVAS_H);
    updateCollectibles(gameState);

    /* Win condition */
    if (gameState.nestProgress >= 100) {

        gameState.running = false;
        gameState.won = true;

        showWinScreen();

    }

    /* Lose condition */
    if (gameState.lives <= 0) {

        gameState.running = false;
        gameState.lost = true;

        showLoseScreen();

    }

}


/* Rasterization Stage */
/* Render - draws every layer to the canvas each frame */

function render(time) {

    /* Remove the previous frame before drawing the new one */
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    drawBackground(ctx, CANVAS_W, CANVAS_H, time);
    drawSeafloor(ctx, CANVAS_W, CANVAS_H, time);
    drawNest(ctx, gameState);
    drawCollectibles(ctx, time);
    drawShark(ctx, time);
    drawPlayer(ctx, time);

    /* HUD sits on top of everything */
    drawHUD(ctx, CANVAS_W, CANVAS_H, gameState);

}


/* Game loop - drives update and render on every frame */

function loop(time = 0) {
    console.log("frame");

    update();
    render(time);

    requestAnimationFrame(loop);

    console.log("frame 2");

}


/* Screen manager - hides all screens or reveals one by id */

function showScreen(id) {

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    if (id) {
        document.getElementById(id).classList.remove('hidden');
    }

}


/* Button listeners */
/* The loop guard prevents a second loop from starting on restart */

document.getElementById('start-btn').addEventListener('click', () => {

    showScreen(null);
    init();

    if (!loopStarted) {
        loopStarted = true;
        requestAnimationFrame(loop);
    }

});

document.getElementById('restart-btn-win').addEventListener('click', () => {

    showScreen(null);
    init();

});

document.getElementById('restart-btn-lose').addEventListener('click', () => {

    showScreen(null);
    init();

});