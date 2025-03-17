// Importiere die benötigten Module
import { Player } from './logic.js';
import { ObstacleManager } from './logic.js';
import { Floor } from './gui.js';
import { UI } from './gui.js';
import { soundManager } from './sfx.js';
import { getRefreshRate } from './refreshRate.js'; // Importiere die RefreshRate-Funktion

// Setup für das HTML5 Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Spielvariablen
let score = 0;
let highscore = 0;
let active = false;
let playerSize = 20;
let gravity = 0.08;
let speed = 16;
let obstacleSpeed = 8;
let lastSpeedIncrease = -10;

// Erstelle die Spielfunktionen und Objekte
const ui = new UI(canvas.width, canvas.height);
const player = new Player(50, canvas.height - 100 - playerSize, playerSize, speed, gravity, ui);
const obstacles = new ObstacleManager(canvas.width, playerSize / 2, obstacleSpeed, ui);
const background = new Image();
background.src = '/dinorunner/assets/moon_background.png';

let floor = new Floor(canvas, '/dinorunner/assets/floor.png');

// **Verwende die externe RefreshRate-Berechnung**
let targetFrameTime = 2400 / getRefreshRate();

// FPS Setup
const TARGET_FPS = 240;
const TARGET_FRAME_TIME = targetFrameTime / TARGET_FPS;
let lastTime = 0;
let accumulatedTime = 0;

// Spiel-Schleife
export function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // **Aktualisiere die Refreshrate dynamisch**
    targetFrameTime = 2400 / getRefreshRate();

    accumulatedTime += deltaTime;

    while (accumulatedTime >= TARGET_FRAME_TIME) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        floor.update(ctx);

        if (score >= lastSpeedIncrease + 10) {
            obstacleSpeed += 2;
            lastSpeedIncrease = score;
            console.log("Speed erhöht! " + "Aktueller Speed: " + obstacleSpeed);
        }

        displayScoreAndHighscore();

        if (active) {
            soundManager.playBackgroundMusic();
            obstacles.render(ctx);
        }

        if (!active) {
            ui.showStartScreen(ctx);
        } else {
            const keys = getPressedKeys();
            player.move(keys, canvas.height - 100, canvas.width - playerSize * 2, deltaTime / 1000);
            player.update(deltaTime / 1000);
            player.render(ctx);
        }

        if (active) {
            score += obstacles.moveObstacles(deltaTime / 1000, obstacleSpeed);
            if (obstacles.checkCollision(player.getRect())) {
                soundManager.playDeathSound();
                if (score > highscore) {
                    highscore = score;
                    saveHighscore(highscore);
                }
                active = false;
            }
        }

        accumulatedTime -= TARGET_FRAME_TIME;
    }

    requestAnimationFrame(gameLoop);
}



// Funktion um Tasteneingaben zu holen
let keys = {}; // Objekt für die gedrückten Tasten
let spacePressed = false;

// Event-Listener für Tasteneingaben
window.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        keys['A'] = true; // A-Taste für nach links
    }
    if (event.key === 'd' || event.key === 'D') {
        keys['D'] = true; // D-Taste für nach rechts
    }
    if (event.key === ' ' && !spacePressed) {
        keys['Space'] = true; // Leertaste für Sprung
        spacePressed = true;
        console.log("Space key pressed!");  // Debugging: Leertaste gedrückt
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        keys['A'] = false;
    }
    if (event.key === 'd' || event.key === 'D') {
        keys['D'] = false;
    }
    if (event.key === ' ') {
        if (!active) {  // Wenn das Spiel beendet ist, neustarten
            startNewGame();
        } else {
            keys['Space'] = false; // Leertaste für Sprung
            spacePressed = false;
        }
    }
});

// Funktion um die gedrückten Tasten zurückzugeben
function getPressedKeys() {
    return keys;
}

// Anzeige von Score und Highscore
function displayScoreAndHighscore() {
    const scoreText = `Score: ${score}`;
    const highscoreText = `Highscore: ${highscore}`;

    ctx.font = '16px Helvetica';
    ctx.fillStyle = 'white';

    // Score auf der rechten Seite anzeigen, aber sicherstellen, dass es nicht aus dem Bild verschwindet
    const scoreX = Math.max(canvas.width-50-scoreText.length); // Verhindert, dass der Score zu nah an der rechten Kante ist
    ctx.fillText(scoreText, scoreX, 30);

    // Highscore auf der linken Seite anzeigen, aber sicherstellen, dass es nicht zu nah an der linken Kante ist
    const highscoreX = Math.min(70); // Verhindert, dass der Highscore zu nah an der linken Kante ist
    ctx.fillText(highscoreText, highscoreX, 30);
}

function saveHighscore(score) {
    localStorage.setItem('highscore', score);
}

// Funktion zum Spielstart
function startNewGame() {
    if (score>highscore) {
        highscore=score;
    }
    player.reset(50, canvas.height - playerSize);   // Setze die Spielfigur zurück
    obstacles.reset();  // Setze die Hindernisse zurück
    score = 0;  // Setze den Punktestand zurück
    obstacleSpeed = 8;  // Setze die Hindernisgeschwindigkeit zurück
    lastSpeedIncrease = -10;  // Setze die letzte Geschwindigkeitserhöhung zurück
    active = true;
    soundManager.playBackgroundMusic();  // Hintergrundmusik starten
    keys = {};
    spacePressed = false;
}

// Event-Listener für den Startbutton
document.getElementById('startButton').addEventListener('click', () => {
    startNewGame();
    // Start-Button ausblenden
    document.getElementById('startButton').style.display = 'none';
});

// Das Spiel starten
soundManager.loadMusic();
soundManager.loadJumpSound();
soundManager.loadDeathSound();

// Warten bis alle Ressourcen geladen sind, bevor wir den Hauptloop starten
window.onload = () => {
    requestAnimationFrame(gameLoop); // Das Spiel starten, wenn alles bereit ist
};
