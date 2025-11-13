// --- DOM Elements ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const musicBtn = document.getElementById("musicBtn");
const bgMusic = document.getElementById("bgMusic");
const gigaSound = document.getElementById("gigaSound");

const gameOverPopup = document.getElementById("gameOverPopup");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

const triggerWarning = document.getElementById("triggerWarning");
const continueBtn = document.getElementById("continueBtn");

const loadingOverlay = document.getElementById("loadingOverlay");
const interactionOverlay = document.getElementById("interactionOverlay");

// --- Canvas Setup ---
canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.75;

// --- Game Variables ---
let score = 0;
let lives = 3;
let gameRunning = false;
let eggs = [];
let catcherX = canvas.width / 2;
let catcherY = canvas.height - 120;
let catcherWidth = 140;
let catcherHeight = 45;
let fallSpeed = 4;
let eggInterval;
let moveLeft = false;
let moveRight = false;
let musicOn = true;

// --- Load face images (1–9) ---
const faces = [];
for (let i = 1; i <= 9; i++) {
  const img = new Image();
  img.src = `procto${i}.png`;
  faces.push(img);
}

// --- Interaction Overlay for autoplay ---
interactionOverlay.addEventListener("click", () => {
  gigaSound.play().then(() => {
    console.log("GigaSound is playing!");
  }).catch(err => {
    console.log("Failed to autoplay:", err);
  });
  interactionOverlay.style.display = "none";
});

// --- Trigger Warning Logic ---
triggerWarning.style.display = "flex";

continueBtn.addEventListener("click", () => {
  // Stop gigaSound
  gigaSound.pause();
  gigaSound.currentTime = 0;

  triggerWarning.style.display = "none";

  // Show loading overlay with countdown
  loadingOverlay.style.display = "flex";
  let countdown = 3;
  loadingOverlay.querySelector("h1").textContent = countdown;

  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      loadingOverlay.querySelector("h1").textContent = countdown;
    } else {
      clearInterval(countdownInterval);
      loadingOverlay.style.display = "none";
      overlay.style.display = "flex";

      // Start background music if ON
      if (musicOn) bgMusic.play();
    }
  }, 1000);
});

// --- Music toggle ---
musicBtn.addEventListener("click", () => {
  if (musicOn) {
    bgMusic.pause();
    musicBtn.textContent = "🔇 Music OFF";
  } else {
    bgMusic.play();
    musicBtn.textContent = "🎵 Music ON";
  }
  musicOn = !musicOn;
});

// --- Start / Restart Game ---
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
  gameOverPopup.style.display = "none";
  startGame();
});

function startGame() {
  overlay.style.display = "none";
  gameOverPopup.style.display = "none";
  score = 0;
  lives = 3;
  eggs = [];
  gameRunning = true;
  bgMusic.currentTime = 0;
  if (musicOn) bgMusic.play();
  scoreText.textContent = "Score: " + score;
  livesText.textContent = "Lives: " + lives;
  spawnEgg();
  eggInterval = setInterval(spawnEgg, 1500);
  update();
}

// --- Spawn falling faces ---
function spawnEgg() {
  if (!gameRunning) return;
  const img = faces[Math.floor(Math.random() * faces.length)];
  const x = Math.random() * (canvas.width - 100);
  eggs.push({ x, y: -100, img });
}

// --- Movement controls ---
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft = true;
  if (e.key === "ArrowRight") moveRight = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") moveLeft = false;
  if (e.key === "ArrowRight") moveRight = false;
});

// Touch controls
canvas.addEventListener("touchstart", (e) => {
  const touchX = e.touches[0].clientX;
  if (touchX < canvas.width / 2) moveLeft = true;
  else moveRight = true;
});
canvas.addEventListener("touchend", () => {
  moveLeft = moveRight = false;
});

// --- Game loop ---
function update() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#6fcf97";
  ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

  // Move catcher
  if (moveLeft) catcherX -= 7;
  if (moveRight) catcherX += 7;
  catcherX = Math.max(0, Math.min(catcherX, canvas.width - catcherWidth));

  // Draw catcher
  ctx.fillStyle = "#03045e";
  ctx.beginPath();
  ctx.ellipse(catcherX + catcherWidth / 2, catcherY + 20, catcherWidth / 2, 25, 0, 0, Math.PI);
  ctx.fill();

  // Draw + move eggs
  eggs.forEach((egg, index) => {
    egg.y += fallSpeed;
    ctx.drawImage(egg.img, egg.x, egg.y, 100, 120);

    // Check catch
    if (
      egg.y + 120 >= catcherY &&
      egg.x + 50 >= catcherX &&
      egg.x + 50 <= catcherX + catcherWidth
    ) {
      eggs.splice(index, 1);
      score += 10;
      scoreText.textContent = "Score: " + score;
    }

    // Missed egg
    if (egg.y > canvas.height) {
      eggs.splice(index, 1);
      lives--;
      livesText.textContent = "Lives: " + lives;
      if (lives <= 0) endGame();
    }
  });

  requestAnimationFrame(update);
}

// --- Game Over ---
function endGame() {
  gameRunning = false;
  clearInterval(eggInterval);
  bgMusic.pause();
  bgMusic.currentTime = 0;
  finalScore.textContent = `Your Score: ${score}`;
  gameOverPopup.style.display = "flex";
}
