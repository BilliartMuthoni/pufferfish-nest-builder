let player = {

    x: 0,
    y: 0,

    baseSize: 18,
    size: 18,
    speed: 2.2,

    carrying: null,

    tiltX: 0,
    tiltY: 0,

    hit: false,
    hitTimer: 0,
    depositCooldown: 0

};


/* Application Stage */
/* initPlayer - runs once on game start, sets up player position */

function initPlayer(w, h) {

    player.x = w * 0.5;
    player.y = h * 0.80;

    player.size = player.baseSize;
    player.carrying = null;

    player.hit = false;
    player.hitTimer = 0;
    player.depositCooldown = 0;

}


/* Application Stage */
/* updatePlayer - handles movement, pickup, deposit, and growth */

function updatePlayer(keys, gameState, w, h) {

    if (!gameState.running) return;

    /* Movement physics - arrow keys control direction */
    let dx = 0;
    let dy = 0;

    if (keys['ArrowLeft'])  dx = -player.speed;
    if (keys['ArrowRight']) dx =  player.speed;
    if (keys['ArrowUp'])    dy = -player.speed;
    if (keys['ArrowDown'])  dy =  player.speed;

    /* Store tilt for visual feedback */
    player.tiltX = Math.sign(dx);
    player.tiltY = Math.sign(dy);

    /* Move and clamp to canvas bounds */
    player.x = Math.max(player.size, Math.min(w - player.size, player.x + dx));
    player.y = Math.max(player.size, Math.min(h - player.size * 0.5, player.y + dy));

    /* Pickup collectibles when swimming over them */
    if (!player.carrying) {

        const picked = tryPickup(player.x, player.y);

        if (picked) {
            player.carrying = picked;
        }

    }

    /* Deposit at nest when pressing Space */
    if (player.depositCooldown > 0) {
        player.depositCooldown--;
    }

    if (keys['Space'] && player.carrying && player.depositCooldown === 0) {

        const nestData = getNestData();
        const dx2 = player.x - nestData.x;
        const dy2 = player.y - nestData.y;
        const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        /* Must be close enough to deposit */
        if (dist < nestData.maxRadius + 30) {

            gameState.nestProgress = Math.min(100, gameState.nestProgress + player.carrying.value);
            gameState.score += player.carrying.value;

            player.carrying = null;
            player.depositCooldown = 25;

            /* Pufferfish grows as nest progresses */
            const growthFactor = gameState.nestProgress / 100;
            player.size = player.baseSize + growthFactor * 12;

        }

    }

    /* Hit flash timer countdown */
    if (player.hitTimer > 0) {
        player.hitTimer--;
    }

    if (player.hitTimer <= 0) {
        player.hit = false;
    }

}


/* Called by shark when it catches the player */

function playerHit(gameState) {

    if (player.hit) return;

    gameState.lives--;

    player.carrying = null;
    player.hit = true;
    player.hitTimer = 90;

}


/* Geometry Stage - defines ellipse body, radial spines, eye circles */
/* Rasterization Stage - fill and stroke paint the pufferfish */

function drawPlayer(ctx, time) {

    const size = player.size;

    /* Hit flash effect - blink when invincible */
    if (player.hit && Math.floor(time / 80) % 2 === 0) {
        return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    /* Flip horizontally based on movement direction */
    if (player.tiltX === -1) {
        ctx.scale(-1, 1);
    }

    /* Body - gradient ellipse */
    const bodyGradient = ctx.createRadialGradient(
        -size * 0.2, -size * 0.2, size * 0.1,
        0, 0, size
    );

    bodyGradient.addColorStop(0.0, '#f5d060');
    bodyGradient.addColorStop(0.6, '#e8a830');
    bodyGradient.addColorStop(1.0, '#b07010');

    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.85, 0, 0, Math.PI * 2);

    ctx.fillStyle = bodyGradient;
    ctx.fill();

    ctx.strokeStyle = 'rgba(100, 60, 0, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* Spines */
    const spineCount = Math.floor(8 + (size - player.baseSize) * 1.2);

    for (let i = 0; i < spineCount; i++) {

        const angle = (i / spineCount) * Math.PI * 2;
        const spineLen = size * 0.55;
        const spineBase = size * 0.85;

        const bx = Math.cos(angle) * spineBase;
        const by = Math.sin(angle) * spineBase * 0.85;

        const tx = Math.cos(angle) * (spineBase + spineLen);
        const ty = Math.sin(angle) * (spineBase + spineLen) * 0.85;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(
            bx + Math.cos(angle + Math.PI / 2) * 2.5,
            by + Math.sin(angle + Math.PI / 2) * 2.5
        );
        ctx.lineTo(
            bx + Math.cos(angle - Math.PI / 2) * 2.5,
            by + Math.sin(angle - Math.PI / 2) * 2.5
        );
        ctx.closePath();

        ctx.fillStyle = '#d4902a';
        ctx.fill();

        ctx.restore();

    }

    /* Eye */
    const eyeX = size * 0.42;
    const eyeY = -size * 0.2;

    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeX + 1.5, eyeY, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0a00';
    ctx.fill();

    /* Eye shine */
    ctx.beginPath();
    ctx.arc(eyeX + 2.5, eyeY - 2.5, size * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.restore();

    /* Carried item indicator - small glowing dot below the fish */
    if (player.carrying) {

        ctx.save();

        ctx.beginPath();
        ctx.arc(player.x, player.y + size + 8, 6, 0, Math.PI * 2);

        ctx.fillStyle = player.carrying.color;
        ctx.shadowColor = player.carrying.glowColor;
        ctx.shadowBlur = 10;

        ctx.fill();

        ctx.restore();

    }

}


/* Helper function - returns player data for collision checks */

function getPlayerData() {

    return {
        x: player.x,
        y: player.y,
        size: player.size,
        hit: player.hit,
        carrying: player.carrying
    };

}