// Importiere die benötigten Module (Player, ObstacleManager, UI, etc.)
import { Player } from './logic.js';
import { ObstacleManager } from './logic.js';
import { Floor } from './gui.js';  // Importiere die Floor-Klasse
import { UI } from './gui.js';
import { soundManager } from './sfx.js';  // Instanz des SoundManagers importieren
import { getRefreshRate } from "./refreshRate.js";

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
let gravity = 0.1;
let speed = 18;
let obstacleSpeed = 8;
let lastSpeedIncrease = -10;
let jumpPower = -0.5;

// Erstelle die Spielfunktionen und Objekte
const ui = new UI(canvas.width, canvas.height);
const player = new Player(50, canvas.height - 100 - playerSize, playerSize, speed, jumpPower, gravity, ui);
const obstacles = new ObstacleManager(canvas.width, playerSize / 2, obstacleSpeed, ui);
const background = new Image();
background.src = '/dinorunner/assets/moon_background.png';

let floor = new Floor(canvas, '/dinorunner/assets/floor.png');
//let frameTimes = [];
//let refreshRate = 60; // Standard-Wert als Fallback

//function updateRefreshRate() {
  //  const now = performance.now();
  //  if (window.lastFrameTime) {
  //      frameTimes.push(now - window.lastFrameTime);
  //      if (frameTimes.length > 30) frameTimes.shift(); // Behalte nur die letzten 30 Frames
  //  }
 //   window.lastFrameTime = now;

 //   const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
 //   refreshRate = Math.round(1000 / avgFrameTime);
//}

//let targetFrameTime = 2400 / refreshRate;


// FPS Setup

let refresh = 10;

const TARGET_FPS = 60;
const TARGET_FRAME_TIME = refresh / TARGET_FPS; // 1000 ms / 60 FPS = ca. 16.67 ms pro Frame
let lastTime = 0; // Zeitstempel für DeltaTime
let accumulatedTime = 0; // Zeit, die sich über mehrere Frames ansammelt

// Spiel-Schleife
export function gameLoop(timestamp) {
    if (getRefreshRate()===240){
        refresh = 40;
        jumpPower = -0.4;
        gravity = 0.1;
    }
    else if (getRefreshRate()===60){
        refresh = 10;
        jumpPower = -0.6;
        gravity= 0.2;
    }
    // Berechne die DeltaTime (Zeitdifferenz zwischen den Frames)
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp; // Speichere den aktuellen Zeitstempel als "letzten" Zeitpunkt
    console.log("40 -0.4 0.1 ist 240 hz: "+refresh +jumpPower+gravity)
    //updateRefreshRate()

    accumulatedTime += deltaTime;

    // Wenn mehr als 16.67 ms vergangen sind (also ein Frame bei 60 FPS), dann rendere und aktualisiere das Spiel
    while (accumulatedTime >= TARGET_FRAME_TIME) {
        // Canvas leeren
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Hintergrund rendern
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        floor.update(ctx);

        // Geschwindigkeit alle 10 Punkte erhöhen
        if (score >= lastSpeedIncrease + 10) {
            obstacleSpeed += 1;  // Erhöhe die Hindernisgeschwindigkeit
            lastSpeedIncrease = score;  // Merkt sich, wann zuletzt erhöht wurde
            console.log("Speed erhöht! "+ "Aktueller Speed:" + obstacleSpeed)
        }

        // Score und Highscore anzeigen
        displayScoreAndHighscore();

        if (active) {
            soundManager.playBackgroundMusic();
            obstacles.render(ctx);
        }

        // Wenn das Spiel nicht aktiv ist, zeige das Startmenü
        if (!active) {
            ui.showStartScreen(ctx);
        } else {
            // Spielerbewegung und Animation aktualisieren
            const keys = getPressedKeys();
            player.move(keys, canvas.height - 100, canvas.width - playerSize * 2, deltaTime / 1000);  // DeltaTime an die move-Methode übergeben (in Sekunden)
            player.update(deltaTime / 1000);  // DeltaTime an die update-Methode übergeben (in Sekunden)
            player.render(ctx);  // Spieler rendern
        }

        // Kollisionsprüfung nach Spielerbewegung
        if (active) {
            score += obstacles.moveObstacles(deltaTime / 1000, obstacleSpeed);  // DeltaTime in Sekunden übergeben

            // Kollisionserkennung
            if (obstacles.checkCollision(player.getRect())) {
                soundManager.playDeathSound();
                if (score > highscore) {
                    highscore = score;
                    saveHighscore(highscore);
                }
                active = false; // Beende das Spiel, wenn eine Kollision erkannt wird
            }
        }

        accumulatedTime -= TARGET_FRAME_TIME; // Ziehe die verbrauchte Zeit ab
    }

    // Spiel-Schleife fortsetzen
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
