// Main game module
const Game = {
  canvas: null,
  ctx: null,
  canvasWidth: 800,
  canvasHeight: 600,
  score: 0,
  lives: 3,
  level: 1,
  state: 'start', // 'start', 'playing', 'paused', 'gameover'
  keys: {},
  animationId: null,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;

    Ball.init(this.canvasWidth, this.canvasHeight);
    Paddle.init(this.canvasWidth, this.canvasHeight);
    Bricks.init(this.canvasWidth);

    this.setupInput();
    this.gameLoop();
  },

  setupInput() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        Ball.launch();
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.state === 'playing') this.state = 'paused';
        else if (this.state === 'paused') this.state = 'playing';
      }
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvasWidth / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      if (this.state === 'playing') {
        Paddle.moveTo(mouseX);
      }
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.state === 'start') {
        this.startGame();
      } else if (this.state === 'playing') {
        Ball.launch();
      } else if (this.state === 'gameover') {
        this.startGame();
      }
    });
  },

  handleKeyboardInput() {
    if (this.state !== 'playing') return;
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      Paddle.moveLeft();
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      Paddle.moveRight();
    }
  },

  startGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.state = 'playing';
    Ball.init(this.canvasWidth, this.canvasHeight);
    Paddle.init(this.canvasWidth, this.canvasHeight);
    Bricks.init(this.canvasWidth);
  },

  update() {
    if (this.state !== 'playing') return;

    this.handleKeyboardInput();

    // Update ball
    const ballLost = Ball.update(this.canvasWidth, this.canvasHeight, Paddle);
    if (ballLost) {
      this.lives--;
      if (this.lives <= 0) {
        this.state = 'gameover';
        Storage.setHighScore(this.score);
      } else {
        Ball.reset(this.canvasWidth, this.canvasHeight);
      }
    }

    // Check brick collision
    if (Bricks.checkCollision(Ball)) {
      this.score += 10;
    }

    // Check win condition
    if (Bricks.countAlive() === 0) {
      this.level++;
      Ball.init(this.canvasWidth, this.canvasHeight);
      Paddle.init(this.canvasWidth, this.canvasHeight);
      Bricks.init(this.canvasWidth);
    }
  },

  draw() {
    const ctx = this.ctx;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(0.5, '#302b63');
    gradient.addColorStop(1, '#24243e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (this.state === 'start') {
      this.drawStartScreen(ctx);
      return;
    }

    // Draw HUD
    this.drawHUD(ctx);

    // Draw game elements
    Bricks.draw(ctx);
    Paddle.draw(ctx);
    Ball.draw(ctx);

    // Draw overlays
    if (this.state === 'paused') {
      this.drawOverlay(ctx, 'PAUSED', 'Press P or ESC to continue');
    }
    if (this.state === 'gameover') {
      this.drawGameOver(ctx);
    }
  },

  drawHUD(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 15, 30);
    ctx.textAlign = 'center';
    ctx.fillText(`Level: ${this.level}`, this.canvasWidth / 2, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${'❤ '.repeat(this.lives)}`, this.canvasWidth - 15, 30);
  },

  drawStartScreen(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRICK BREAKER', this.canvasWidth / 2, 200);

    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`High Score: ${Storage.getHighScore()}`, this.canvasWidth / 2, 250);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Click to Start', this.canvasWidth / 2, 320);
    ctx.fillText('← → or A/D to move', this.canvasWidth / 2, 360);
    ctx.fillText('Space to launch ball', this.canvasWidth / 2, 390);
    ctx.fillText('P to pause', this.canvasWidth / 2, 420);
  },

  drawOverlay(ctx, title, subtitle) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.canvasWidth / 2, this.canvasHeight / 2 - 20);

    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(subtitle, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
  },

  drawGameOver(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2 - 60);

    ctx.fillStyle = '#fff';
    ctx.font = '24px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Score: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`High Score: ${Storage.getHighScore()}`, this.canvasWidth / 2, this.canvasHeight / 2 + 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Click to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 100);
  },

  gameLoop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
};

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => Game.init());