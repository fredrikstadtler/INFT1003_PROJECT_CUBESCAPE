const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const playerstart = canvas.height - 100;

const player = {
    width: 40,
    height: 40,
    x: canvas.width / 2 - 20,
    y: playerstart + 60,
    speed: 5,
    dx: 0,
    dy: 0
};

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

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
}

function playerStop(e) {
    if (e.key === 'd' || e.key === 'a') player.dx = 0;
}

function gameLoop() {
    updatePlayer();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", playerMove);
document.addEventListener("keyup", playerStop);

gameLoop();