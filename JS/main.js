const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const playerstart = canvas.height - 100;

// laster inn bilder for spiller, bakgrunn og plattform
var background_img = new Image();
background_img.src = "../img/game_background.png";
var player_img = new Image();
player_img.src = "../img/character.png";
var platform_img = new Image();
platform_img.src = "../img/platform.png";


const player = {
    width: 40, // spiller bredde
    height: 40, // spiller høyde
    x: canvas.width / 2 - 20, // spiller x posisjon
    y: playerstart + 60, // spiller y posisjon
    g_a: 0.05, // gravitasjons akselerasjon
    speed: 2.5, // spiller hastighet i x retning
    jump: 4, // spiller hastighet i y retning
    dx: 0, // spiller endring i x retning
    dy: 0, // spiller endring i y retning
    onPlatform: false // sjekker om spilleren er på en plattform
};

const game = {
    score: 0, // spill score
    difficulty: 1, // spill vanskelighetsgrad
    started: false, // spill game startet
    move_y: 0.05, // spill bevegelse i y retning
    highscore: 0 // spill highscore
}

function getRandomArbitrary(min, max) { // Hentet fra https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * (max - min) + min; // genererer et tilfeldig tall mellom min og max
}

class Platform {
    constructor(x, y, width, height, can_move) { // format for plattform objekt
        this.x = x; // x posisjon til plattform
        this.y = y; // y posisjon til plattform
        this.width = width; // bredde til plattform
        this.height = height; // høyde til plattform
        if (can_move >= 0.8) {
            this.can_move = true; // setter plattformen til å kunne bevege seg dersom tilfeldig tall mellom 0 og 1 er over 0.8, derfor en 20% sjanse
        }
        this.passed = false; // sjekker om spilleren har passert plattformen, default er false
        this.direction = Math.random() < 0.5 ? -1 : 1; // setter retning til plattformen til venstre eller høyre ved tilfeldig tall mellom 0 og 1. Dersom tallet er under 0.5 settes retningen til venstre, ellers til høyre
    }
    draw() {
        context.drawImage(platform_img,this.x, this.y, this.width, this.height); // tegner plattformen
    }
}

var platforms = []; // lager en array for plattformer

function createPlatforms(difficulty = 1) {
    if (platforms.length === 0) { // sjekker om det er noen plattformer i arrayen
        var y = canvas.height*0.75; // setter y posisjonen til 3/4 av canvas høyde dersom det ikke er noen plattformer
    } else {
        var y = platforms[platforms.length - 1].y - getRandomArbitrary(70, 150); // setter y posisjonen til forrige plattform minus et tilfeldig tall mellom 70 og 150 dersom det er plattformer i arrayen
    }
    let width = 100; // setter bredde til plattform
    let height = 10;    // setter høyde til plattform

    for (let i = 0; i < 100; i++) {
        let x = Math.random() * (canvas.width - width); // setter x posisjonen til et tilfeldig tall mellom 0 og canvas bredde minus plattform bredde
        platforms.push(new Platform(x, y, width, height, Math.random())); // legger til en plattform i arrayen
        y += -getRandomArbitrary(70, 150); // trekker fra et tilfeldig tall mellom 70 og 150 fra y posisjonen for å lage en ny plattform
    }
}

function check_for_platforms() {
    if (platforms.length-50 < game.score) { // sjekker om det er færre enn 50 plattformer i arrayen
        createPlatforms(); // lager nye plattformer dersom det er færre enn 50 plattformer i arrayen
    }
}

function drawPlatforms() {
    platforms.forEach(platform => platform.draw());
}

function platform_Movement() {
    platforms.forEach(platform => {
        if (platform.can_move) {
            platform.x += 0.5 * platform.direction; // flytter plattformene i x retning dersom plattformen kan bevege seg
            if (platform.x + platform.width < 0) {
                platform.x = canvas.width;
            } else if (platform.x > canvas.width) {
                platform.x = -platform.width;
            }
        }
    }); 
    if (game.started === true) { // sjekker om spillet har startet
        platforms.forEach(platform => { 
            platform.y += game.move_y; // øker plattformenes y posisjon for å følge med på spilleren
        });
        player.y += game.move_y; // øker spillerens y posisjon for å følge med på plattformene
        }
}

function canvas_Correction() {
    if (player.y <= canvas.height*0.5 && player.dy < 0) { // sjekker om spilleren er over midten av skjermen og øker y posisjonen til plattformene for å passe på at spilleren holder seg på skjermen
        platforms.forEach(platform => {
            platform.y -= player.dy*1.7; // øker y posisjonen til plattformene for å passe på at spilleren holder seg på skjermen dersom spilleren er over midten av skjermen og beveger seg oppover
        });
    }
}

function gravity() {
    if (player.y <= canvas.height*0.5 && !player.onPlatform) { // sjekker om spilleren er over midten av skjermen og øker gravitasjonen for å gjøre opp for function canvas_Correction
        player.dy += player.g_a*2;
    } else if (!player.onPlatform && player.y < playerstart + 60) { // sjekker at spilleren ikke er på en plattform og at spilleren ikke er på bakken
        player.dy += player.g_a;
    } else if (player.y >= playerstart + 60) {
        player.dy = 0; // setter spillerens y endring til 0 dersom spilleren er på bakken
        player.y = playerstart + 60; // setter spillerens y posisjon til bakkenivå
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
            { // sjekker om spilleren er på en plattform
            player.dy = 0; // setter spillerens y endring til 0 dersom spilleren er på en plattform
            player.y = platform.y - player.height; // setter spillerens y posisjon til plattformens y posisjon minus spillerens høyde
            player.onPlatform = true; // setter spillerens onPlatform til true

            if (platform.can_move) {
                player.x += platform.direction; // flytter spilleren til i retning til plattformen dersom plattformen kan bevege seg
            }
        }
    });
}

function update_points() {
    platforms.forEach(platform => {
        if (player.y < platform.y && !platform.passed) { // sjekker om spilleren har passert en plattform og øker score dersom det er første passering
            game.score++;
            platform.passed = true;
        }
    });
    if (game.score*0.005 > game.move_y && game.move_y < 0.75) { // øker hastigheten på plattformene hver gang spilleren passerer 10 plattformer og så lenge hastigheten er under 0.75
        game.move_y += 0.05;
        player.g_a -= 0.0005;
    }
}

function check_for_game_over() {
    if (player.y >= playerstart + 60 && game.started === true) {
        game_over();
    }
}

function updatePlayer() {
    player.x += player.dx; // oppdaterer spillerens x posisjon
    player.y += player.dy; // oppdaterer spillerens y posisjon
    if (player.x + player.width < 0) { // sjekker om spilleren er utenfor venstre side av skjermen og setter spilleren til høyre side av skjermen
        player.x = canvas.width;
    } else if (player.x > canvas.width) { // sjekker om spilleren er utenfor høyre side av skjermen og setter spilleren til venstre side av skjermen
        player.x = -player.width;
    }
    if (player.y < canvas.height*0.5 && game.started === false) { // sjekker om spilleren er over midten av skjermen og setter spillet i gang
        game.started = true;
    }
}

function drawPlayer() {
    context.clearRect(0, 0, canvas.width, canvas.height); 
    context.drawImage(background_img, 0, 0, canvas.width, canvas.height); // tegner bakgrunnen
    context.drawImage(player_img,player.x, player.y, player.width, player.height); // tegner spilleren
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

//Game over function
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

// Oppdaterer score display
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = `Score: ${game.score}`;
    const highscoreDisplay = document.getElementById('highscoreDisplay');
    if (game.score > game.highscore) {
        game.highscore = game.score;
    }
    highscoreDisplay.textContent = `Highscore: ${game.highscore}`;
}

// Spill loop som kjører nødvendige funksjoner konstant
function gameLoop() {
    updatePlayer();
    drawPlayer();
    drawPlatforms();
    updateScoreDisplay();
    gravity();
    platform_Movement();
    canvas_Correction();
    checkCollisions();
    update_points();
    check_for_game_over();
    check_for_platforms();
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