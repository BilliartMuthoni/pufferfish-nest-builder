function showWinScreen() {
    showScreen('win-screen');
}

function showLoseScreen() {
    showScreen('lose-screen');
}


/* Geometry Stage - defines rectangles, circles, and text positions */
/* Rasterization Stage - fillText, fill, and stroke paint the HUD */

function drawHUD(ctx, w, h, gameState) {

    /* Live indicator */
    ctx.save();

    ctx.font = '13px Raleway, sans-serif';
    ctx.fillStyle = 'rgba(232, 244, 248, 0.75)';
    ctx.fillText('LIVES', 18, 22);

    for (let i = 0; i < 3; i++) {

        const lifeX = 18 + i * 26;
        const lifeY = 38;
        const isAlive = i < gameState.lives;

        ctx.beginPath();
        ctx.arc(lifeX, lifeY, 9, 0, Math.PI * 2);

        ctx.fillStyle = isAlive ? '#f5c842' : 'rgba(100, 80, 30, 0.3)';
        ctx.shadowColor = isAlive ? '#f5c842' : 'transparent';
        ctx.shadowBlur = isAlive ? 10 : 0;

        ctx.fill();

    }

    ctx.restore();

    /* Nest progress bar */
    const barWidth = 180;
    const barHeight = 14;
    const barX = w / 2 - barWidth / 2;
    const barY = 14;
    const fillWidth = (gameState.nestProgress / 100) * barWidth;

    ctx.save();

    /* Progress label */
    ctx.font = '11px Cinzel, serif';
    ctx.fillStyle = 'rgba(232, 244, 248, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('NEST PROGRESS', w / 2, barY - 2);

    /* Background track */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    /* Fill bar - grows with progress */
    if (fillWidth > 0) {

        const barGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        barGradient.addColorStop(0.0, '#d4a820');
        barGradient.addColorStop(1.0, '#f5e060');

        ctx.fillStyle = barGradient;
        ctx.shadowColor = '#f5c842';
        ctx.shadowBlur = 8;

        ctx.fillRect(barX, barY, fillWidth, barHeight);

    }

    /* Border around the bar */
    ctx.strokeStyle = 'rgba(245, 200, 66, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.restore();

    /* Score*/
    ctx.save();

    ctx.textAlign = 'right';
    ctx.font = '11px Raleway, sans-serif';
    ctx.fillStyle = 'rgba(232, 244, 248, 0.6)';
    ctx.fillText('SCORE', w - 18, 22);

    ctx.font = '20px Cinzel, serif';
    ctx.fillStyle = '#f5c842';
    ctx.shadowColor = '#f5c842';
    ctx.shadowBlur = 8;
    ctx.fillText(gameState.score, w - 18, 44);

    ctx.restore();

}