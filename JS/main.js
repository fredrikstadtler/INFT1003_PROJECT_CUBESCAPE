const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const playerstart = canvas.height - 100;

const player = {
    width: 40, // spiller bredde
    height: 40, // spiller høyde
    x: canvas.width / 2 - 20,
    y: playerstart + 60,
    g_a: 0.05, // gravitasjons akselerasjon
    speed: 2.5, // spiller hastighet i x retning
    jump: 4, // spiller hastighet i y retning
    dx: 0, // spiller fart i x retning
    dy: 0, // spiller fart i y retning
    onPlatform: false
};

const game = {
    score: 0, // spill score
    difficulty: 1, // spill vanskelighetsgrad
    started: false, // spill game startet
    move_y: 0.05 // spill bevegelse i y retning
}

function getRandomArbitrary(min, max) { // Hentet fra https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * (max - min) + min;
}

class Platform {
    constructor(x, y, width, height, can_move) { // format for plattform objekt
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (can_move >= 0.8) {
            this.can_move = true;
        }
        this.passed = false;
    }
    draw() {
        var img = new Image();
        img.src = "../img/platform.jpg";
        context.drawImage(img,this.x, this.y, this.width, this.height);
    }
}

var platforms = []; // lager en array for plattformer

function createPlatforms(difficulty = 1) {
    if (platforms.length === 0) {
        var y = canvas.height*0.75;
    } else {
        var y = platforms[platforms.length - 1].y - getRandomArbitrary(70, 150);
    }
    let width = 100;
    let height = 10;

    for (let i = 0; i < 100; i++) {
        let x = Math.random() * (canvas.width - width);
        platforms.push(new Platform(x, y, width, height, Math.random())); // legger til en plattform i arrayen
        y += -getRandomArbitrary(70, 150);
    }
}

function check_for_platforms() {
    if (platforms.length-50 < game.score) {
        createPlatforms();
    }
}

function drawPlatforms() {
    platforms.forEach(platform => platform.draw());
}

function platform_Movement() {
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
    if (game.started === true) {
        platforms.forEach(platform => {
            platform.y += game.move_y;
        });
        player.y += game.move_y;
        }
}

function canvas_Correction() {
    if (player.y <= canvas.height*0.5 && player.dy < 0) {
        platforms.forEach(platform => {
            platform.y -= player.dy*1.7; 
        });
    }
}

function gravity() {
    if (player.y <= canvas.height*0.5 && !player.onPlatform) {
        player.dy += player.g_a*2;
    } else if (!player.onPlatform && player.y < playerstart + 60) {
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

function update_points() {
    platforms.forEach(platform => {
        if (player.y < platform.y && !platform.passed) {
            game.score++;
            platform.passed = true;
            console.log(game.score);
        }
    });
    if (game.score*0.005 > game.move_y) {
        game.move_y += 0.05;
        player.g_a -= 0.0005;
        console.log(game.move_y);
    }
}

function check_for_game_over() {
    if (player.y >= playerstart + 60 && game.started === true) {
        game_over();
    }
}

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    gravity();
    platform_Movement();
    canvas_Correction();
    checkCollisions();
    update_points();
    check_for_game_over();
    check_for_platforms();
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }
    if (player.y < canvas.height*0.5 && game.started === false) {
        game.started = true;
    }
}

function drawPlayer() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'blue';
    context.fillRect(player.x, player.y, player.width, player.height);
}

//Player movement for keyboard input
function playerMove(e) {
    if (e.key === 'd' || e.key === 'ArrowRight') player.dx = player.speed;
    else if (e.key === 'a' || e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === ' ' || e.key === 'ArrowUp') {
        if (player.y === playerstart + 60 || player.onPlatform === true || player.dy === 0) {
            player.dy = -player.jump;
        }
    }
}   

function playerStop(e) {
    if (e.key === 'd' || e.key === 'a' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
}

//Player movement for touch input
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const canvasRect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - canvasRect.left;

    if (touchX < canvas.width / 2) {
        player.dx = -player.speed;
    } else {
        player.dx = player.speed;
    }

    if (player.y === playerstart + 60 || player.onPlatform === true || player.dy === 0) {
        player.dy = -player.jump;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    player.dx = 0;
}

function game_over() {
    game.started = false;
    player.x = canvas.width / 2 - 20;
    player.y = playerstart + 60;
    player.dy = 0;
    player.dx = 0;
    game.score = 0;
    platforms = [];
    createPlatforms();
}

function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = `Score: ${game.score}`;
}


function gameLoop() {
    updatePlayer();
    drawPlayer();
    drawPlatforms();
    updateScoreDisplay();
    requestAnimationFrame(gameLoop);
}

// Event listeners for keyboard input
document.addEventListener("keydown", playerMove);
document.addEventListener("keyup", playerStop);

// Event listeners for touch events
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);

createPlatforms();
gameLoop();