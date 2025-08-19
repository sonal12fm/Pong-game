const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const gameOverDiv = document.getElementById('game-over');

// Game constants
const PADDLE_WIDTH = 12, PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 25;
const AI_X = canvas.width - 25 - PADDLE_WIDTH;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;
const WINNING_SCORE = 7;

// Game state
let playerY = canvas.height/2 - PADDLE_HEIGHT/2;
let aiY = canvas.height/2 - PADDLE_HEIGHT/2;
let ball = {
  x: canvas.width/2,
  y: canvas.height/2,
  vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  vy: BALL_SPEED * (Math.random() * 2 - 1)
};
let playerScore = 0, aiScore = 0;
let isGameOver = false;

// Draw functions
function drawRect(x, y, w, h, color="#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color="#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, size=40, color="#fff") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

// Mouse movement for player paddle
canvas.addEventListener('mousemove', function(e) {
  if (isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT/2;
  // Clamp paddle inside canvas
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Simple AI movement
function moveAI() {
  let center = aiY + PADDLE_HEIGHT/2;
  if (center < ball.y - 18) {
    aiY += PADDLE_SPEED;
  } else if (center > ball.y + 18) {
    aiY -= PADDLE_SPEED;
  }
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Collision detection
function collide(paddleX, paddleY) {
  // AABB vs Circle
  return (
    ball.x + BALL_RADIUS > paddleX &&
    ball.x - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
    ball.y + BALL_RADIUS > paddleY &&
    ball.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT
  );
}

// Ball reset after score
function resetBall() {
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Game Over check
function checkGameOver() {
  if (playerScore >= WINNING_SCORE || aiScore >= WINNING_SCORE) {
    isGameOver = true;
    gameOverDiv.style.display = "block";
    if (playerScore > aiScore) {
      gameOverDiv.innerHTML = '🎉 <b>Game Over! You Win!</b> 🎉<br><span style="font-size:1.2rem;">Refresh to play again.</span>';
    } else {
      gameOverDiv.innerHTML = '😢 <b>Game Over! AI Wins!</b> 😢<br><span style="font-size:1.2rem;">Refresh to try again.</span>';
    }
  }
}

// Main update loop
function update() {
  if (isGameOver) return;

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision (top/bottom)
  if (ball.y - BALL_RADIUS < 0) {
    ball.y = BALL_RADIUS;
    ball.vy *= -1;
  }
  if (ball.y + BALL_RADIUS > canvas.height) {
    ball.y = canvas.height - BALL_RADIUS;
    ball.vy *= -1;
  }

  // Paddle collisions
  if (collide(PLAYER_X, playerY)) {
    ball.x = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
    ball.vx *= -1;
    // Add "spin" based on where it hit the paddle
    let impact = (ball.y - (playerY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
    ball.vy = BALL_SPEED * impact;
  }
  if (collide(AI_X, aiY)) {
    ball.x = AI_X - BALL_RADIUS;
    ball.vx *= -1;
    let impact = (ball.y - (aiY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
    ball.vy = BALL_SPEED * impact;
  }

  // Score conditions
  if (ball.x - BALL_RADIUS < 0) {
    aiScore++;
    resetBall();
    checkGameOver();
  }
  if (ball.x + BALL_RADIUS > canvas.width) {
    playerScore++;
    resetBall();
    checkGameOver();
  }

  moveAI();
}

// Draw everything
function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw net
  for (let i = 10; i < canvas.height; i += 30) {
    drawRect(canvas.width/2 - 2, i, 4, 20, "#888");
  }

  // Draw paddles and ball
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0f8");
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#f44");
  drawCircle(ball.x, ball.y, BALL_RADIUS);

  // Draw scores
  drawText(playerScore, canvas.width/4, 60, 44);
  drawText(aiScore, canvas.width*3/4, 60, 44);
}

// Game loop
function loop() {
  update();
  draw();
  if (!isGameOver) {
    requestAnimationFrame(loop);
  }
}

// Start the game
loop();