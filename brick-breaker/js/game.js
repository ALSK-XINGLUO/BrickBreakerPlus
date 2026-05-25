// Main game module
const Game = {
  canvas: null,
  ctx: null,
  canvasWidth: 800,
  canvasHeight: 600,
  score: 0,
  lives: 3,
  level: 1,
  maxLevel: Levels.length,
  state: 'start', // 'start', 'mainmenu', 'levelselect', 'playing', 'paused', 'gameover', 'levelclear', 'gameclear', 'about'
  keys: {},
  animationId: null,
  lastTime: 0,
  particles: [],

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;

    Ball.init(this.canvasWidth, this.canvasHeight);
    Paddle.init(this.canvasWidth, this.canvasHeight);
    Powerup.init();
    Balls.init();

    this.setupInput();
    this.gameLoop();
  },

  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (this.state === 'playing') {
          Ball.launch();
        }
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.state === 'playing') this.state = 'paused';
        else if (this.state === 'paused') this.state = 'playing';
      }
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvasWidth / rect.width;
      const scaleY = this.canvasHeight / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      this.mouseX = mouseX;
      this.mouseY = mouseY;

      if (this.state === 'playing') {
        Paddle.moveTo(mouseX);
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvasWidth / rect.width;
      const scaleY = this.canvasHeight / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      if (this.state === 'start') {
        this.state = 'mainmenu';
      } else if (this.state === 'mainmenu') {
        // Check which button was clicked
        // "开始闯关" button
        if (mouseX >= 240 && mouseX <= 560 && mouseY >= 260 && mouseY <= 310) {
          this.resetGame();
          this.startLevel(1);
        }
        // "选择关卡" button
        if (mouseX >= 240 && mouseX <= 560 && mouseY >= 330 && mouseY <= 380) {
          this.state = 'levelselect';
        }
        // "关于我们" button
        if (mouseX >= 240 && mouseX <= 560 && mouseY >= 400 && mouseY <= 450) {
          this.state = 'about';
        }
      } else if (this.state === 'levelselect') {
        const selected = this.getLevelAtPosition(mouseX, mouseY);
        if (selected !== null) {
          this.startLevel(selected);
        }
      } else if (this.state === 'playing') {
        Ball.launch();
      } else if (this.state === 'gameover') {
        this.state = 'levelselect';
      } else if (this.state === 'about') {
        this.state = 'mainmenu';
      } else if (this.state === 'gameclear') {
        this.state = 'mainmenu';
        this.resetGame();
      } else if (this.state === 'levelclear') {
        const nextLevel = this.level;
        if (nextLevel <= this.maxLevel) {
          this.startLevel(nextLevel);
        } else {
          this.state = 'gameclear';
        }
      }
    });
  },

  getLevelAtPosition(mouseX, mouseY) {
    const startX = 120;
    const startY = 180;
    const cols = 4;
    const cellW = 155;
    const cellH = 80;
    const gapX = 15;
    const gapY = 15;

    for (let i = 0; i < this.maxLevel; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellW + gapX);
      const y = startY + row * (cellH + gapY);
      if (mouseX >= x && mouseX <= x + cellW && mouseY >= y && mouseY <= y + cellH) {
        return i + 1; // level 1-based
      }
    }
    return null;
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

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    Powerup.clear();
    Balls.clear();
    this.particles = [];
  },

  startLevel(levelNum) {
    this.level = levelNum;
    const config = Levels[levelNum - 1];
    this.state = 'playing';

    // Reset lives if fixed lives is set
    if (config.fixedLives) {
      this.lives = config.lives;
    }

    // Apply level ball speed
    Ball.speed = config.ballSpeed;
    Ball.originalSpeed = null;

    Powerup.clear();
    Balls.clear();
    Bricks.loadLevel(config, this.canvasWidth);
    Ball.init(this.canvasWidth, this.canvasHeight);
    Paddle.init(this.canvasWidth, this.canvasHeight);
    this.particles = [];
  },

  addLife() {
    this.lives = Math.min(this.lives + 1, 5);
  },

  spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x: x,
        y: y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: color,
        life: 1.0,
        size: 2 + Math.random() * 3
      });
    }
  },

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.life -= dt * 2;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  update() {
    if (this.state !== 'playing') return;

    const dt = 1 / 60;

    this.handleKeyboardInput();

    // Update main ball
    const ballLost = Ball.update(this.canvasWidth, this.canvasHeight, Paddle);
    if (ballLost) {
      // Check if there are multi-balls
      if (Balls.list.length > 0) {
        // Main ball lost but multi-balls remain
        Ball.reset(this.canvasWidth, this.canvasHeight);
      } else {
        this.lives--;
        if (this.lives <= 0) {
          this.state = 'gameover';
          Storage.setHighScore(this.score);
        } else {
          Ball.reset(this.canvasWidth, this.canvasHeight);
        }
      }
    }

    // Update multi-balls
    if (Balls.list.length > 0) {
      const allLost = Balls.update(this.canvasWidth, this.canvasHeight, Paddle);
      if (allLost && ballLost) {
        // All balls lost
        this.lives--;
        if (this.lives <= 0) {
          this.state = 'gameover';
          Storage.setHighScore(this.score);
        } else {
          Ball.reset(this.canvasWidth, this.canvasHeight);
          Balls.clear();
        }
      }
    }

    // Check brick collision (main ball)
    const piercing = Ball.piercing || false;
    if (Bricks.checkCollision(Ball, piercing)) {
      const pos = Bricks.getLastHitPosition();
      if (pos) {
        const brick = Bricks.bricks[pos.r] ? Bricks.bricks[pos.r][pos.c] : null;
        const color = Bricks.colors[Math.min(pos.r, Bricks.colors.length - 1)];
        this.spawnParticles(pos.x + Bricks.width / 2, pos.y + Bricks.height / 2, color);
        if (brick && !brick.alive && brick.type !== 'indestructible') {
          const config = Levels[this.level - 1];
          Powerup.spawn(pos.x, pos.y, Bricks.width, Bricks.height, config.powerupDropRate);
        }
        this.score += 10;
      }
    }

    // Check brick collision for multi-balls
    if (Balls.list.length > 0) {
      if (Balls.checkBrickCollision(Bricks)) {
        const pos = Bricks.getLastHitPosition();
        if (pos) {
          const color = Bricks.colors[Math.min(pos.r, Bricks.colors.length - 1)];
          this.spawnParticles(pos.x + Bricks.width / 2, pos.y + Bricks.height / 2, color);
          const brick = Bricks.bricks[pos.r] ? Bricks.bricks[pos.r][pos.c] : null;
          if (brick && !brick.alive && brick.type !== 'indestructible') {
            const config = Levels[this.level - 1];
            Powerup.spawn(pos.x, pos.y, Bricks.width, Bricks.height, config.powerupDropRate);
          }
          this.score += 10;
        }
      }
    }

    // Update powerups
    if (Powerup.items.length > 0) {
      const activated = Powerup.update(this.canvasHeight, Paddle);
      if (activated) {
        // Powerup was activated
      }
    }

    // Update powerup timers
    Powerup.updateEffects(16);

    // Update particles
    this.updateParticles(dt);

    // Check win condition
    let aliveCount = 0;
    for (let r = 0; r < Bricks.rows; r++) {
      for (let c = 0; c < Bricks.cols; c++) {
        if (Bricks.bricks[r] && Bricks.bricks[r][c] && Bricks.bricks[r][c].alive) {
          aliveCount++;
        }
      }
    }
    if (aliveCount === 0) {
      this.level++;
      if (this.level > this.maxLevel) {
        this.state = 'gameclear';
        Storage.setHighScore(this.score);
      } else {
        this.state = 'levelclear';
      }
    }
  },

  draw() {
    const ctx = this.ctx;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(0.5, '#302b63');
    gradient.addColorStop(1, '#24243e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // State-specific rendering
    switch (this.state) {
      case 'start':
        this.drawSplash(ctx);
        break;
      case 'mainmenu':
        this.drawMainMenu(ctx);
        break;
      case 'about':
        this.drawPlaying(ctx);
        this.drawAbout(ctx);
        break;
      case 'levelselect':
        this.drawLevelSelect(ctx);
        break;
      case 'playing':
        this.drawPlaying(ctx);
        break;
      case 'paused':
        this.drawPlaying(ctx);
        this.drawOverlay(ctx, 'PAUSED', 'Press P or ESC to continue');
        break;
      case 'gameover':
        this.drawPlaying(ctx);
        this.drawGameOver(ctx);
        break;
      case 'levelclear':
        this.drawPlaying(ctx);
        this.drawLevelClear(ctx);
        break;
      case 'gameclear':
        this.drawGameClear(ctx);
        break;
    }
  },

  drawPlaying(ctx) {
    // HUD
    this.drawHUD(ctx);

    // Game elements
    Bricks.draw(ctx);
    Paddle.draw(ctx);
    Ball.draw(ctx);
    Balls.draw(ctx);
    Powerup.draw(ctx);

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Active effects indicator
    this.drawActiveEffects(ctx);
  },

  drawActiveEffects(ctx) {
    const effects = Powerup.activeEffects;
    let y = 50;
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    for (const key in effects) {
      const remaining = Math.ceil(effects[key].timer / 1000);
      let label = '';
      let color = '#fff';
      switch (key) {
        case 'wide': label = `⇔ Wide ${remaining}s`; color = '#ffd43b'; break;
        case 'pierce': label = `⚡ Pierce ${remaining}s`; color = '#69db7c'; break;
        case 'slow': label = `◀ Slow ${remaining}s`; color = '#4dabf7'; break;
      }
      ctx.fillStyle = color;
      ctx.fillText(label, 15, y);
      y += 18;
    }
  },

  drawHUD(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 15, 30);
    ctx.textAlign = 'center';
    ctx.fillText(`${Levels[this.level - 1].name}`, this.canvasWidth / 2, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${'❤ '.repeat(this.lives)}`, this.canvasWidth - 15, 30);
  },

  drawSplash(ctx) {
    // Animated splash that fades to main menu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRICK BREAKER', this.canvasWidth / 2, 260);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Click anywhere to continue', this.canvasWidth / 2, 340);
  },

  drawMainMenu(ctx) {
    // Title
    const gradient = ctx.createLinearGradient(this.canvasWidth / 2 - 200, 0, this.canvasWidth / 2 + 200, 0);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#ffd43b');
    gradient.addColorStop(1, '#69db7c');
    ctx.fillStyle = gradient;
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRICK BREAKER', this.canvasWidth / 2, 140);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`High Score: ${Storage.getHighScore()}`, this.canvasWidth / 2, 175);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`12 Levels · 6 Powerups · ${this.maxLevel} Levels Total`, this.canvasWidth / 2, 200);

    // Draw buttons
    const buttons = [
      { label: '开始闯关', y: 260, color: '#69db7c' },
      { label: '选择关卡', y: 330, color: '#4dabf7' },
      { label: '关于我们', y: 400, color: '#9775fa' },
    ];

    for (const btn of buttons) {
      const x = 240;
      const w = 320;
      const h = 50;
      const isHovered = this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= btn.y && this.mouseY <= btn.y + h;

      ctx.shadowColor = isHovered ? btn.color : 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = isHovered ? 20 : 8;

      ctx.fillStyle = isHovered ? btn.color : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(x, btn.y, w, h, 10);
      ctx.fill();

      ctx.shadowBlur = 0;

      if (isHovered) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, btn.y, w, h, 10);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, btn.y, w, h, 10);
        ctx.stroke();
      }

      ctx.fillStyle = isHovered ? '#1a1a2e' : 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, this.canvasWidth / 2, btn.y + h / 2);
    }

    ctx.textBaseline = 'alphabetic';

    // Controls hint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillText('← → A/D: Move  |  Space: Launch  |  P: Pause', this.canvasWidth / 2, 490);
  },

  drawAbout(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Title
    ctx.fillStyle = '#9775fa';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('About', this.canvasWidth / 2, 130);

    // Content box
    const boxX = 120;
    const boxY = 160;
    const boxW = 560;
    const boxH = 300;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    const aboutText = [
      'Brick Breaker Plus',
      '',
      'A modern take on the classic Breakout game.',
      'Built with vanilla HTML5 Canvas + JavaScript.',
      '',
      'Features:',
      '• 12 unique levels with progressive difficulty',
      '• 6 powerup types: Wide, Multi Ball, Pierce,',
      '  Slow, Extra Life & Shrink',
      '• Tough & Indestructible brick types',
      '• Particle effects & visual polish',
      '• Local high score persistence',
      '',
      'Project by ALSK · 2025',
    ];

    let y = 205;
    for (const line of aboutText) {
      if (line.startsWith('Brick Breaker')) {
        ctx.fillStyle = '#9775fa';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
      } else if (line.startsWith('Project')) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
      } else if (line === '') {
        y += 5;
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        y += 16;
        continue;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
      }
      ctx.fillText(line, this.canvasWidth / 2, y);
      y += 24;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Click to return', this.canvasWidth / 2, 510);
  },

  drawLevelSelect(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT LEVEL', this.canvasWidth / 2, 80);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`High Score: ${Storage.getHighScore()}`, this.canvasWidth / 2, 115);

    const startX = 120;
    const startY = 180;
    const cols = 4;
    const cellW = 155;
    const cellH = 80;
    const gapX = 15;
    const gapY = 15;

    for (let i = 0; i < this.maxLevel; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellW + gapX);
      const y = startY + row * (cellH + gapY);
      const level = Levels[i];

      // Card background
      const isHovered = this.mouseX >= x && this.mouseX <= x + cellW &&
                        this.mouseY >= y && this.mouseY <= y + cellH;

      ctx.shadowColor = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = isHovered ? 15 : 5;

      ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 8);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 8);
      ctx.stroke();

      // Level number
      ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 10, y + 26);

      // Level name
      ctx.fillStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.7)';
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(level.name, x + 10, y + 50);

      // Difficulty indicator
      const diff = i < 3 ? 'Easy' : i < 6 ? 'Medium' : i < 9 ? 'Hard' : 'Expert';
      const diffColors = { 'Easy': '#69db7c', 'Medium': '#ffd43b', 'Hard': '#ffa94d', 'Expert': '#ff6b6b' };
      ctx.fillStyle = diffColors[diff];
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(diff, x + cellW - 10, y + 26);
    }
  },

  drawLevelClear(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#69db7c';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL CLEAR!', this.canvasWidth / 2, this.canvasHeight / 2 - 40);

    ctx.fillStyle = '#fff';
    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Score: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2 + 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Next: ${Levels[Math.min(this.level - 1, this.maxLevel - 1)].name}`, this.canvasWidth / 2, this.canvasHeight / 2 + 50);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Click to continue', this.canvasWidth / 2, this.canvasHeight / 2 + 110);
  },

  drawGameClear(ctx) {
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 ALL CLEAR! 🎉', this.canvasWidth / 2, this.canvasHeight / 2 - 80);

    ctx.fillStyle = '#fff';
    ctx.font = '28px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Final Score: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`High Score: ${Storage.getHighScore()}`, this.canvasWidth / 2, this.canvasHeight / 2 + 50);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Click to return', this.canvasWidth / 2, this.canvasHeight / 2 + 120);
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
    ctx.fillText('Click to return to level select', this.canvasWidth / 2, this.canvasHeight / 2 + 100);
  },

  gameLoop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
};

window.addEventListener('DOMContentLoaded', () => Game.init());