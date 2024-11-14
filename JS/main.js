const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const playerstart = canvas.height - 100;

const player = {
    width: 40,
    height: 40,
    x: canvas.width / 2 - 20,
    y: playerstart + 60,
    g_a: 0.05, // gravitasjons akselerasjon
    speed: 2.5, // spiller hastighet
    jump: 4, // hopp fart
    dx: 0,
    dy: 0,
    onPlatform: false
};

const game = {
    score: 0,
    difficulty: 1,
    game_over: false
}

function getRandomArbitrary(min, max) { // Hentet fra https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * (max - min) + min;
}

class Platform {
    constructor(x, y, width, height, can_move) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (can_move >= 0.5) {
            this.can_move = true;
        }
    }
    draw() {
        context.fillStyle = 'green';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

const platforms = [];

function createPlatforms(difficulty = 1) {
    let y = canvas.height - 20;
    let width = 100;
    let height = 10;

    for (let i = 0; i < 100; i++) {
        let x = Math.random() * (canvas.width - width);
        platforms.push(new Platform(x, y, width, height, Math.random()));
        y += -getRandomArbitrary(70, 150);
    }
}

function drawPlatforms() {
    platforms.forEach(platform => platform.draw());
}

function platform_x_Movement() {
    platforms.forEach(platform => {
        if (platform.can_move) {
            platform.x += 0.5;
            if (platform.x + platform.width < 0) {
                platform.x = canvas.width;
            } else if (platform.x > canvas.width) {
                platform.x = -platform.width;
            }
        }
    });
}

function platform_y_Movement() {
    if (player.y <= canvas.height*0.5) {
        platforms.forEach(platform => {
            if (player.dy <= 0) {
                platform.y -= player.dy;
                console.log(platform.y, player.dy);
            }
    });
    }
}

function gravity() {
    if (!player.onPlatform && player.y < playerstart + 60) {
        player.dy += player.g_a;
    } else if (player.y >= playerstart + 60) {
        player.dy = 0;
        player.y = playerstart + 60;
    }
}

function checkCollisions() {
    player.onPlatform = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height <= platform.y + platform.height &&
            player.y + player.height + player.dy >= platform.y &&
            player.dy > 0)
            {
            // Collision detected
            player.dy = 0;
            player.y = platform.y - player.height;
            player.onPlatform = true;
        }
    });
}

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    gravity();
    checkCollisions();
    platform_x_Movement();
    platform_y_Movement();
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }
}

function drawPlayer() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'blue';
    context.fillRect(player.x, player.y, player.width, player.height);
}

function playerMove(e) {
    if (e.key === 'd') player.dx = player.speed;
    else if (e.key === 'a') player.dx = -player.speed;
    if (e.key === ' ') {
        if (player.dy != 0) return;
        else if (player.y <= canvas.height*0.5) {
            player.dy = -player.jump*0.75;
        }
        else {
            player.dy = -player.jump;
        }
    }
}   

function playerStop(e) {
    if (e.key === 'd' || e.key === 'a') player.dx = 0;
}

function gameLoop() {
    updatePlayer();
    drawPlayer();
    drawPlatforms();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", playerMove);
document.addEventListener("keyup", playerStop);

createPlatforms();
gameLoop();
