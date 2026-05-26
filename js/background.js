let bg = {

    width: 0,
    height: 0,
    floorY: 0,

    rays: [],
    rocks: [],
    seaweed: []

};


/* Application Stage */
/* initBackground - runs once on game start, builds all the static background data */

function initBackground(w, h) {

    bg.width  = w;
    bg.height = h;
    bg.floorY = h * 0.78;

    /* Light rays */
    bg.rays = [];

    for (let i = 0; i < 6; i++) {

        bg.rays.push({
            x:     (w / 6) * i + (w / 12),
            width: 30 + Math.random() * 50,
            speed: 0.15 + Math.random() * 0.25
        });

    }

    /* Rocks */
    bg.rocks = [];

    for (let i = 0; i < 10; i++) {

        bg.rocks.push({
            x:     Math.random() * w,
            y:     bg.floorY + 8 + Math.random() * 14,
            rx:    18 + Math.random() * 28,
            ry:    10 + Math.random() * 12,
            color: Math.random() > 0.5 ? '#3a3530' : '#4a4440'
        });

    }

    /* Seaweed - each plant gets a random phase so they don't all sway together */
    bg.seaweed = [];

    for (let i = 0; i < 14; i++) {

        bg.seaweed.push({
            x:      Math.random() * w,
            height: 30 + Math.random() * 50,
            width:  4  + Math.random() * 4,
            phase:  Math.random() * Math.PI * 2,
            color:  Math.random() > 0.5 ? '#2d7a4f' : '#1a5c38'
        });

    }

}


/* Geometry Stage - defines the water gradient and ray triangle positions */
/* Rasterization Stage - fillRect and fill paint those shapes as pixels */

function drawBackground(ctx, w, h, time) {

    /* Water gradient from light blue at the top to deep navy at the bottom */
    const water = ctx.createLinearGradient(0, 0, 0, h);

    water.addColorStop(0.0, '#0d4f6e');
    water.addColorStop(0.5, '#072d4f');
    water.addColorStop(1.0, '#010e1f');

    ctx.fillStyle = water;
    ctx.fillRect(0, 0, w, h);

    /* Light rays */
    bg.rays.forEach(ray => {

        const drift  = Math.sin(time * 0.0003 * ray.speed + ray.x) * 18;
        const topX   = ray.x + drift;
        const spread = ray.width * 3;

        ctx.save();

        ctx.globalAlpha = 0.04;
        ctx.fillStyle   = '#a8e6f0';

        ctx.beginPath();
        ctx.moveTo(topX,          0);
        ctx.lineTo(topX - spread, h * 0.75);
        ctx.lineTo(topX + spread, h * 0.75);
        ctx.closePath();

        ctx.fill();
        ctx.restore();

    });

}


/* Geometry Stage - bezier curves define the floor edge and seaweed shapes */
/* Rasterization Stage - fill and stroke paint them as pixels */

function drawSeafloor(ctx, w, h, time) {

    const fY = bg.floorY;

    /* Sandy floor shape */
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, fY);

    ctx.bezierCurveTo(w * 0.25, fY - 18, w * 0.5,  fY + 14, w * 0.75, fY - 8);
    ctx.bezierCurveTo(w * 0.88, fY - 16, w * 0.95, fY + 6,  w,        fY);

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const sand = ctx.createLinearGradient(0, fY, 0, h);

    sand.addColorStop(0,   '#b89a50');
    sand.addColorStop(0.3, '#9e8040');
    sand.addColorStop(1,   '#6b5425');

    ctx.fillStyle = sand;
    ctx.fill();

    ctx.restore();

    /* Rocks */
    bg.rocks.forEach(rock => {

        ctx.save();

        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y, rock.rx, rock.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = rock.color;
        ctx.fill();

        /* Small highlight to give each rock a bit of depth */
        ctx.beginPath();
        ctx.ellipse(rock.x - 4, rock.y - 3, rock.rx * 0.45, rock.ry * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fill();

        ctx.restore();

    });

    /* Seaweed - sways using sin so each plant moves at its own pace */
    bg.seaweed.forEach(plant => {

        const sway = Math.sin(time * 0.001 + plant.phase) * 8;

        ctx.save();

        ctx.strokeStyle = plant.color;
        ctx.lineWidth   = plant.width;
        ctx.lineCap     = 'round';

        ctx.beginPath();
        ctx.moveTo(plant.x, fY);
        ctx.quadraticCurveTo(
            plant.x + sway,
            fY - plant.height * 0.5,
            plant.x + sway * 0.6,
            fY - plant.height
        );

        ctx.stroke();
        ctx.restore();

    });

}