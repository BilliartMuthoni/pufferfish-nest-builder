const sharkStates = {
    PATROL: 'patrol',
    DESCEND: 'descend',
    CHASE: 'chase',
    RETREAT: 'retreat'
};


let shark = {

    x: 0,
    y: 0,

    state: sharkStates.PATROL,
    speed: 1.4,
    dir: 1,

    patrolY: 0,
    targetX: 0,
    targetY: 0,

    alertTimer: 0,

    canvasW: 0,
    canvasH: 0,

    size: 38

};


/* Application Stage */
/* initShark - sets up shark starting position and patrol height */

function initShark(w, h) {

    shark.canvasW = w;
    shark.canvasH = h;
    shark.patrolY = h * 0.22;

    shark.x = -80;
    shark.y = shark.patrolY;

    shark.state = sharkStates.PATROL;
    shark.dir = 1;
    shark.alertTimer = 0;

}


/* Application Stage */
/* updateShark - AI state machine drives shark behavior */

function updateShark(gameState, w, h) {

    if (!gameState.running) return;

    const playerData = getPlayerData();
    const nestData = getNestData();
    const progress = gameState.nestProgress;

    /* Shark speeds up as nest grows */
    const speedMultiplier = 1 + (progress / 100) * 1.2;
    const speed = shark.speed * speedMultiplier;

    /* Descend depth increases with nest progress */
    const descendY = h * 0.22 + (progress / 100) * h * 0.5;
    shark.patrolY = descendY;

    /* Distance from shark to player */
    const dx = playerData.x - shark.x;
    const dy = playerData.y - shark.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    /* Distance from player to nest safe zone */
    const dxNest = playerData.x - nestData.x;
    const dyNest = playerData.y - nestData.y;
    const distToNest = Math.sqrt(dxNest * dxNest + dyNest * dyNest);

    /* Is player outside the safe zone */
    const playerInDanger = distToNest > nestData.safeRadius;

    /* State machine - patrol, chase, or retreat */
    switch (shark.state) {

        case sharkStates.PATROL:

            /* Swim left and right across upper water */
            shark.x += speed * shark.dir;
            shark.y = shark.patrolY + Math.sin(Date.now() * 0.0008) * 15;

            /* Reverse direction at edges */
            if (shark.x > w + 80) shark.dir = -1;
            if (shark.x < -80) shark.dir = 1;

            /* Detect player if they venture too far from nest */
            if (playerInDanger && distToPlayer < 280) {

                shark.alertTimer++;

                if (shark.alertTimer > 40) {
                    shark.state = sharkStates.CHASE;
                    shark.alertTimer = 0;
                }

            } else {
                shark.alertTimer = 0;
            }

            break;

        case sharkStates.CHASE:

            /* Move directly toward player */
            const angle = Math.atan2(dy, dx);
            shark.x += Math.cos(angle) * speed * 1.5;
            shark.y += Math.sin(angle) * speed * 1.5;
            shark.dir = dx > 0 ? 1 : -1;

            /* Retreat if player reaches safe zone */
            if (!playerInDanger) {
                shark.state = sharkStates.RETREAT;
            }

            /* Collision - shark catches player */
            if (distToPlayer < shark.size * 0.8 + playerData.size && !playerData.hit) {
                playerHit(gameState);
                shark.state = sharkStates.RETREAT;
            }

            break;

        case sharkStates.RETREAT:

            /* Swim back up to patrol height */
            shark.y += (shark.patrolY - shark.y) * 0.04;
            shark.x += speed * shark.dir;

            if (shark.x > w + 80) shark.dir = -1;
            if (shark.x < -80) shark.dir = 1;

            /* Return to patrol when close to patrol height */
            if (Math.abs(shark.y - shark.patrolY) < 10) {
                shark.state = sharkStates.PATROL;
            }

            break;

    }

}


/* Geometry Stage - defines ellipse body, triangle fins, circle eye */
/* Rasterization Stage - fill paints the shark as pixels */

function drawShark(ctx, time) {

    ctx.save();
    ctx.translate(shark.x, shark.y);

    /* Flip horizontally based on swim direction */
    if (shark.dir === -1) {
        ctx.scale(-1, 1);
    }

    const size = shark.size;

    /* Tail sway animation */
    const sway = Math.sin(time * 0.005) * 0.25;

    /* Main body - ellipse */
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.38, 0, 0, Math.PI * 2);

    ctx.fillStyle = shark.state === sharkStates.CHASE ? '#2a2a3a' : '#374050';
    ctx.fill();

    /* Belly - lighter underside */
    ctx.beginPath();
    ctx.ellipse(0, size * 0.12, size * 0.7, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 210, 220, 0.35)';
    ctx.fill();

    /* Dorsal fin - triangle on top */
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.35);
    ctx.lineTo(size * 0.25, -size * 0.7);
    ctx.lineTo(size * 0.4, -size * 0.32);
    ctx.closePath();

    ctx.fillStyle = shark.state === sharkStates.CHASE ? '#1a1a2a' : '#2d3545';
    ctx.fill();

    /* Tail - two triangles with sway */
    ctx.save();
    ctx.translate(-size, 0);
    ctx.rotate(sway);

    /* Upper tail lobe */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.55, -size * 0.38);
    ctx.lineTo(-size * 0.12, size * 0.05);
    ctx.closePath();

    ctx.fillStyle = '#2d3545';
    ctx.fill();

    /* Lower tail lobe */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.45, size * 0.32);
    ctx.lineTo(-size * 0.12, size * 0.05);
    ctx.closePath();

    ctx.fill();

    ctx.restore();

    /* Pectoral fin - side triangle */
    ctx.beginPath();
    ctx.moveTo(size * 0.1, size * 0.2);
    ctx.lineTo(size * 0.45, size * 0.55);
    ctx.lineTo(size * 0.5, size * 0.18);
    ctx.closePath();

    ctx.fillStyle = '#2d3545';
    ctx.fill();

    /* Eye - changes color when chasing */
    ctx.beginPath();
    ctx.arc(size * 0.62, -size * 0.08, size * 0.1, 0, Math.PI * 2);

    ctx.fillStyle = shark.state === sharkStates.CHASE ? '#ff3333' : '#111';
    ctx.fill();

    /* Eye shine */
    ctx.beginPath();
    ctx.arc(size * 0.65, -size * 0.11, size * 0.035, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.restore();

}