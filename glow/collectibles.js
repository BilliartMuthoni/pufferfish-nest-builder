const types = [
    { name: 'sand',      color: '#d4b870', glowColor: '#e8cc88', size: 5, value: 2,  weight: 5 },
    { name: 'shell',     color: '#e8d5b0', glowColor: '#fff0cc', size: 7, value: 5,  weight: 3 },
    { name: 'rareShell', color: '#ff9d5c', glowColor: '#ffb87a', size: 9, value: 10, weight: 1 }
];


let collectibles = {

    items: [],

    canvasW: 0,
    canvasH: 0,
    floorY: 0

};


/* Application Stage */
/* initCollectibles - spawns initial set of items on the seafloor */

function initCollectibles(w, h) {

    collectibles.canvasW = w;
    collectibles.canvasH = h;
    collectibles.floorY = h * 0.78;
    collectibles.items = [];

    /* Spawn initial 14 items */
    for (let i = 0; i < 14; i++) {
        spawnCollectible();
    }

}


/* Helper function - picks a random type based on spawn weight */

function getRandomType() {

    const total = types.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * total;

    for (const type of types) {
        random -= type.weight;
        if (random <= 0) return type;
    }

    return types[0];

}


/* Helper function - spawns a single collectible at random floor position */

function spawnCollectible() {

    const type = getRandomType();

    collectibles.items.push({
        x: 40 + Math.random() * (collectibles.canvasW - 80),
        y: collectibles.floorY - 8 + Math.random() * 14,
        type: type,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
    });

}


/* Application Stage */
/* updateCollectibles - respawns items to keep minimum on screen */

function updateCollectibles(gameState) {

    /* Respawn if fewer than 8 items remain uncollected */
    const uncollected = collectibles.items.filter(item => !item.collected).length;

    if (uncollected < 8) {
        spawnCollectible();
    }

}


/* Called by pufferfish when player swims over an item */
/* Returns the collected item type or null */

function tryPickup(px, py) {

    const playerData = getPlayerData();

    /* Can't pickup if already carrying something */
    if (playerData.carrying) return null;

    for (const item of collectibles.items) {

        if (item.collected) continue;

        const dx = px - item.x;
        const dy = py - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        /* Collision check - close enough to pickup */
        if (distance < 18) {
            item.collected = true;
            return item.type;
        }

    }

    return null;

}


/* Geometry Stage - defines circle shapes with bob animation */
/* Rasterization Stage - fill paints the collectibles with glow */

function drawCollectibles(ctx, time) {

    collectibles.items.forEach(item => {

        if (item.collected) return;

        /* Gentle vertical bob animation */
        const bob = Math.sin(time * 0.002 + item.bobOffset) * 2;
        const drawY = item.y + bob;

        ctx.save();

        /* rare shells glow brighter */
        ctx.shadowColor = item.type.glowColor;
        ctx.shadowBlur = item.type.name === 'rareShell' ? 14 : 7;

        /* Main collectible circle */
        ctx.beginPath();
        ctx.arc(item.x, drawY, item.type.size, 0, Math.PI * 2);
        ctx.fillStyle = item.type.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
            item.x - item.type.size * 0.3,
            drawY - item.type.size * 0.3,
            item.type.size * 0.3,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        ctx.restore();

    });

}