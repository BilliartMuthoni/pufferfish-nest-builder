let nest = {

    x: 0,
    y: 0,
    
    rings: 5,
    maxRadius: 110,
    safeRadius: 0

};


/* Application Stage */
/* initNest - runs once on game start, sets up the nest position */

function initNest(w, h) {

    nest.x = w * 0.5;
    nest.y = h * 0.82;

}

/* Application Stage */
/* updateNest - calculates safe zone radius based on progress */

function updateNest(gameState) {

    const progress = gameState.nestProgress;
    
    nest.safeRadius = nest.maxRadius * 0.5 + (progress / 100) * nest.maxRadius * 1.2;

}


/* Helper function - calculates radius for each ring */

function getRingRadius(ringIndex) {
    return (nest.maxRadius / nest.rings) * (ringIndex + 1);
}


/* Helper function - calculates how many rings are complete based on progress */

function getCompletedRings(progress) {
    return Math.floor((progress / 100) * nest.rings);
}


/* Geometry Stage - defines circle arcs, ring shapes, shell positions */
/* Rasterization Stage - fill and stroke paint the nest as pixels */

function drawNest(ctx, gameState) {

    const progress = gameState.nestProgress;

    const safeGlow = ctx.createRadialGradient(
        nest.x, nest.y, 0,
        nest.x, nest.y, nest.safeRadius
    );

    safeGlow.addColorStop(0.0, 'rgba(0, 229, 255, 0.06)');
    safeGlow.addColorStop(0.6, 'rgba(0, 229, 255, 0.03)');
    safeGlow.addColorStop(1.0, 'rgba(0, 229, 255, 0)');

    ctx.save();
    ctx.fillStyle = safeGlow;
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, nest.safeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* Draw rings from outside to inside */
    const completed = getCompletedRings(progress);

    for (let i = nest.rings - 1; i >= 0; i--) {

        const outerR = getRingRadius(i);
        const innerR = i > 0 ? getRingRadius(i - 1) : 0;
        const isBuilt = i < completed;

        ctx.save();

        if (isBuilt) {

            /* Built ring - textured sand and shell pattern */
            const ringGradient = ctx.createRadialGradient(
                nest.x, nest.y, innerR,
                nest.x, nest.y, outerR
            );

            ringGradient.addColorStop(0.0, 'rgba(180, 145, 60, 0.95)');
            ringGradient.addColorStop(0.5, 'rgba(210, 175, 80, 0.9)');
            ringGradient.addColorStop(1.0, 'rgba(160, 120, 40, 0.85)');

            ctx.fillStyle = ringGradient;

            ctx.beginPath();
            ctx.arc(nest.x, nest.y, outerR, 0, Math.PI * 2);
            ctx.arc(nest.x, nest.y, innerR, 0, Math.PI * 2, true);
            ctx.fill();

            /* Ridge lines - radial spokes for texture */
            const spokes = 12 + i * 6;

            ctx.strokeStyle = 'rgba(100, 70, 20, 0.4)';
            ctx.lineWidth = 1;

            for (let s = 0; s < spokes; s++) {

                const angle = (s / spokes) * Math.PI * 2;

                ctx.beginPath();
                ctx.moveTo(
                    nest.x + Math.cos(angle) * innerR,
                    nest.y + Math.sin(angle) * innerR
                );
                ctx.lineTo(
                    nest.x + Math.cos(angle) * outerR,
                    nest.y + Math.sin(angle) * outerR
                );
                ctx.stroke();

            }

            /* Shells on the outer edge */
            const shells = 6 + i * 3;

            for (let s = 0; s < shells; s++) {

                const angle = (s / shells) * Math.PI * 2;
                const shellX = nest.x + Math.cos(angle) * (outerR - 4);
                const shellY = nest.y + Math.sin(angle) * (outerR - 4);

                ctx.beginPath();
                ctx.arc(shellX, shellY, 3, 0, Math.PI * 2);

                ctx.fillStyle = i % 2 === 0 ? '#f0d080' : '#e0a860';
                ctx.shadowColor = '#f5c842';
                ctx.shadowBlur = 6;

                ctx.fill();

            }

        } else {

            /* Unbuilt ring - just a faint dashed outline */
            ctx.beginPath();
            ctx.arc(nest.x, nest.y, outerR, 0, Math.PI * 2);

            ctx.strokeStyle = 'rgba(180, 150, 80, 0.18)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 6]);

            ctx.stroke();
            ctx.setLineDash([]);

        }

        ctx.restore();

    }

    /* Centre dot - glows when nest has progress */
    ctx.save();

    ctx.beginPath();
    ctx.arc(nest.x, nest.y, 6, 0, Math.PI * 2);

    ctx.fillStyle = progress > 0 ? '#f5c842' : 'rgba(180, 150, 80, 0.3)';
    ctx.shadowColor = '#f5c842';
    ctx.shadowBlur = progress > 0 ? 12 : 0;

    ctx.fill();

    ctx.restore();

}


/* Helper function - returns nest data for collision checks in other modules */

function getNestData() {

    return {
        x: nest.x,
        y: nest.y,
        safeRadius: nest.safeRadius,
        maxRadius: nest.maxRadius
    };

}