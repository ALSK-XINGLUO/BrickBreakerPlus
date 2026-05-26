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
  levelPage: 0,
  levelsPerPage: 12,
  maxLevelPage: 0,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;

    Audio.init();
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
        if (this.state === 'playing' && !Ball.isMoving) {
          Ball.launch();
          Audio.launch();
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

      // Global back button check for secondary pages
      const hasBackButton = ['levelselect', 'about'].includes(this.state);
      if (hasBackButton && this.isBackButtonClicked(mouseX, mouseY)) {
        this.state = 'mainmenu';
        return;
      }

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
        // Check page navigation arrows
        const totalPages = Math.ceil(this.maxLevel / this.levelsPerPage);
        // Left arrow area
        const arrowY = 525;
        if (mouseX >= 250 && mouseX <= 310 && mouseY >= arrowY && mouseY <= arrowY + 40 && this.levelPage > 0) {
          this.levelPage--;
        } else if (mouseX >= 490 && mouseX <= 550 && mouseY >= arrowY && mouseY <= arrowY + 40 && this.levelPage < totalPages - 1) {
          this.levelPage++;
        } else {
          const selected = this.getLevelAtPosition(mouseX, mouseY);
          if (selected !== null) {
            this.startLevel(selected);
          }
        }
      } else if (this.state === 'playing') {
        if (!Ball.isMoving) {
          Ball.launch();
          Audio.launch();
        }
      } else if (this.state === 'paused') {
        // "Resume" button
        if (mouseX >= 240 && mouseX <= 560 && mouseY >= 260 && mouseY <= 310) {
          this.state = 'playing';
        }
        // "Skip this level" button
        if (mouseX >= 240 && mouseX <= 560 && mouseY >= 330 && mouseY <= 380) {
          const nextLevel = this.level + 1;
          if (nextLevel <= this.maxLevel) {
            this.startLevel(nextLevel);
          } else {
            this.state = 'gameclear';
            Storage.setHighScore(this.score);
            Audio.gameClear();
          }
        }
        // "Return to main menu" button
        if (mouseX >= 240 && mouseX <= 560 && mouseY >= 400 && mouseY <= 450) {
          this.state = 'mainmenu';
          this.resetGame();
        }
      } else if (this.state === 'gameover') {
        this.state = 'levelselect';
      } else if (this.state === 'about') {
        this.state = 'mainmenu';
      } else if (this.state === 'gameclear') {
        this.state = 'mainmenu';
        this.resetGame();
      } else if (this.state === 'levelclear') {
        const nextLevel = this.level + 1;
        if (nextLevel <= this.maxLevel) {
          this.startLevel(nextLevel);
        } else {
          this.state = 'gameclear';
        }
      }
    });
  },

  isBackButtonClicked(mouseX, mouseY) {
    // Back button in top-left corner
    return mouseX >= 20 && mouseX <= 100 && mouseY >= 20 && mouseY <= 50;
  },

  drawBackButton(ctx) {
    const x = 20, y = 15, w = 80, h = 35;
    const isHovered = this.mouseX >= x && this.mouseX <= x + w &&
                      this.mouseY >= y && this.mouseY <= y + h;

    ctx.shadowColor = isHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.05)';
    ctx.shadowBlur = isHovered ? 10 : 3;

    ctx.fillStyle = isHovered ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.04)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = isHovered ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.stroke();

    ctx.fillStyle = isHovered ? '#6366f1' : 'rgba(99, 102, 241, 0.6)';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('← 返回', x + w / 2, y + h / 2);
    ctx.textBaseline = 'alphabetic';
  },

  getLevelAtPosition(mouseX, mouseY) {
    const cols = 4;
    const cellW = 155;
    const cellH = 80;
    const gapX = 15;
    const gapY = 15;
    const totalGridW = cols * cellW + (cols - 1) * gapX;
    const startX = (this.canvasWidth - totalGridW) / 2;
    const startY = 170;
    const page = this.levelPage;
    const startIdx = page * this.levelsPerPage;
    const endIdx = Math.min(startIdx + this.levelsPerPage, this.maxLevel);

    for (let i = startIdx; i < endIdx; i++) {
      const idxInPage = i - startIdx;
      const col = idxInPage % cols;
      const row = Math.floor(idxInPage / cols);
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

    // Update multi-balls
    const multiExists = Balls.list.length > 0;
    let allBallsLost = false;
    if (multiExists) {
      allBallsLost = Balls.update(this.canvasWidth, this.canvasHeight, Paddle);
    }

    // Only lose life when NO balls remain on screen
    if (ballLost && (multiExists ? allBallsLost : true)) {
      Audio.loseBall();
      this.lives--;
      if (this.lives <= 0) {
        this.state = 'gameover';
        Storage.setHighScore(this.score);
        Audio.gameOver();
      } else {
        Ball.reset(this.canvasWidth, this.canvasHeight);
        Balls.clear();
      }
    } else if (ballLost && multiExists && !allBallsLost) {
      // Main ball lost but multi-balls still remaining, just reset main ball
      Ball.reset(this.canvasWidth, this.canvasHeight);
    }

    // Check brick collision (main ball)
    const piercing = Ball.piercing || false;
    if (Bricks.checkCollision(Ball, piercing)) {
      const pos = Bricks.getLastHitPosition();
      if (pos) {
        const brick = Bricks.bricks[pos.r] ? Bricks.bricks[pos.r][pos.c] : null;
        const wasAlive = brick && brick.alive;
        const color = Bricks.colors[Math.min(pos.r, Bricks.colors.length - 1)];
        this.spawnParticles(pos.x + Bricks.width / 2, pos.y + Bricks.height / 2, color);
        if (brick && !brick.alive && brick.type !== 'indestructible') {
          if (brick.type === 'tough') {
            Audio.toughHit();
          } else {
            Audio.brickBreak();
          }
          const config = Levels[this.level - 1];
          Powerup.spawn(pos.x, pos.y, Bricks.width, Bricks.height, config.powerupDropRate);
        } else if (wasAlive && brick.type === 'tough' && brick.hits === 1) {
          Audio.toughHit();
        } else if (wasAlive) {
          Audio.brickHit();
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
            Audio.brickBreak();
            const config = Levels[this.level - 1];
            Powerup.spawn(pos.x, pos.y, Bricks.width, Bricks.height, config.powerupDropRate);
          } else {
            Audio.brickHit();
          }
          this.score += 10;
        }
      }
    }

    // Update powerups
    if (Powerup.items.length > 0) {
      const activated = Powerup.update(this.canvasHeight, Paddle);
      if (activated) {
        Audio.powerup();
      }
    }

    // Update powerup timers
    Powerup.updateEffects(16);

    // Update particles
    this.updateParticles(dt);

    // Check win condition - only count breakable bricks (not indestructible)
    let aliveCount = 0;
    for (let r = 0; r < Bricks.rows; r++) {
      for (let c = 0; c < Bricks.cols; c++) {
        if (Bricks.bricks[r] && Bricks.bricks[r][c] && Bricks.bricks[r][c].alive && Bricks.bricks[r][c].type !== 'indestructible') {
          aliveCount++;
        }
      }
    }
    if (aliveCount === 0) {
      if (this.level >= this.maxLevel) {
        this.state = 'gameclear';
        Storage.setHighScore(this.score);
        Audio.gameClear();
      } else {
        this.state = 'levelclear';
        Audio.levelClear();
      }
    }
  },

  draw() {
    const ctx = this.ctx;

    // Light background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#f1f5f9');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvasWidth; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvasHeight; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }

    // State-specific rendering
    switch (this.state) {
      case 'start':
        this.drawSplash(ctx);
        break;
      case 'mainmenu':
        this.drawMainMenu(ctx);
        break;
      case 'about':
        this.drawAbout(ctx);
        this.drawBackButton(ctx);
        break;
      case 'levelselect':
        this.drawLevelSelect(ctx);
        this.drawBackButton(ctx);
        break;
      case 'playing':
        this.drawPlaying(ctx);
        break;
      case 'paused':
        this.drawPlaying(ctx);
        this.drawPause(ctx);
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
      let color = '#475569';
      switch (key) {
        case 'wide': label = `⇔ Wide ${remaining}s`; color = '#f59e0b'; break;
        case 'pierce': label = `⚡ Pierce ${remaining}s`; color = '#10b981'; break;
        case 'slow': label = `◀ Slow ${remaining}s`; color = '#3b82f6'; break;
      }
      ctx.fillStyle = color;
      ctx.fillText(label, 15, y);
      y += 18;
    }
  },

  drawHUD(ctx) {
    // Score
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 15, 30);

    // Level name
    ctx.fillStyle = '#6366f1';
    ctx.textAlign = 'center';
    ctx.fillText(`${Levels[this.level - 1].name}`, this.canvasWidth / 2, 30);

    // Lives
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${'❤ '.repeat(this.lives)}`, this.canvasWidth - 15, 30);
  },

  drawSplash(ctx) {
    ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Brick Breaker', this.canvasWidth / 2, 260);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('点击任意位置继续', this.canvasWidth / 2, 340);
  },

  drawMainMenu(ctx) {
    // Title with gradient
    const gradient = ctx.createLinearGradient(this.canvasWidth / 2 - 200, 0, this.canvasWidth / 2 + 200, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Brick Breaker', this.canvasWidth / 2, 130);

    // Subtitle
    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.font = '15px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Plus', this.canvasWidth / 2, 166);

    // High score
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`最高分: ${Storage.getHighScore()}`, this.canvasWidth / 2, 195);

    // Level info
    ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`24 关卡 · 6 种道具 · 共 ${this.maxLevel} 关`, this.canvasWidth / 2, 215);

    // Draw buttons with pastel theme
    const buttons = [
      { label: '开始闯关', y: 280, color: '#6366f1', hoverColor: '#4f46e5' },
      { label: '选择关卡', y: 345, color: '#8b5cf6', hoverColor: '#7c3aed' },
      { label: '关于我们', y: 410, color: '#a855f7', hoverColor: '#9333ea' },
    ];

    for (const btn of buttons) {
      const x = 240;
      const w = 320;
      const h = 52;
      const isHovered = this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= btn.y && this.mouseY <= btn.y + h;

      ctx.shadowColor = isHovered ? `${btn.color}33` : 'rgba(99, 102, 241, 0.1)';
      ctx.shadowBlur = isHovered ? 20 : 8;

      ctx.fillStyle = isHovered ? btn.color : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x, btn.y, w, h, 12);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.strokeStyle = isHovered ? 'transparent' : 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, btn.y, w, h, 12);
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#ffffff' : btn.color;
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, this.canvasWidth / 2, btn.y + h / 2);
    }

    ctx.textBaseline = 'alphabetic';

    // Controls hint
    ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillText('← → / A D: 移动  |  空格: 发射  |  P: 暂停', this.canvasWidth / 2, 505);
  },

  drawPause(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('已暂停', this.canvasWidth / 2, 200);

    // Draw buttons
    const buttons = [
      { label: '继续游戏', y: 270, color: '#6366f1', hoverColor: '#4f46e5' },
      { label: '跳过此关', y: 335, color: '#f59e0b', hoverColor: '#d97706' },
      { label: '返回主界面', y: 400, color: '#ef4444', hoverColor: '#dc2626' },
    ];

    for (const btn of buttons) {
      const x = 240;
      const w = 320;
      const h = 50;
      const isHovered = this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= btn.y && this.mouseY <= btn.y + h;

      ctx.shadowColor = isHovered ? `${btn.color}33` : 'rgba(99, 102, 241, 0.08)';
      ctx.shadowBlur = isHovered ? 15 : 5;

      ctx.fillStyle = isHovered ? btn.color : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x, btn.y, w, h, 10);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.strokeStyle = isHovered ? 'transparent' : 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, btn.y, w, h, 10);
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#ffffff' : btn.color;
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, this.canvasWidth / 2, btn.y + h / 2);
    }

    ctx.textBaseline = 'alphabetic';
  },

  drawAbout(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Title
    ctx.fillStyle = '#8b5cf6';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('About', this.canvasWidth / 2, 130);

    // Content box
    const boxX = 120;
    const boxY = 160;
    const boxW = 560;
    const boxH = 300;
    ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke();

    ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    const aboutText = [
      'Brick Breaker Plus',
      '',
      '经典打砖块游戏的现代演绎。',
      '使用 HTML5 Canvas + JavaScript 构建。',
      '',
      '特色功能:',
      '• 24 个独特关卡，难度循序渐进',
      '• 6 种道具: 加宽、多球、穿刺、减速、加命、缩窄',
      '• 坚固砖块 & 不可摧毁砖块',
      '• 粒子特效 & 视觉优化',
      '• 本地最高分持久化存储',
      '',
      '作者: Cline · 2025',
    ];

    let y = 205;
    for (const line of aboutText) {
      if (line.startsWith('Brick Breaker')) {
        ctx.fillStyle = '#8b5cf6';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
      } else if (line.startsWith('作者')) {
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
      } else if (line === '') {
        y += 5;
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
        y += 16;
        continue;
      } else {
        ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
      }
      ctx.fillText(line, this.canvasWidth / 2, y);
      y += 24;
    }
  },

  drawLevelSelect(ctx) {
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('选择关卡', this.canvasWidth / 2, 80);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.font = '15px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`最高分: ${Storage.getHighScore()}`, this.canvasWidth / 2, 112);

    const cols = 4;
    const cellW = 155;
    const cellH = 80;
    const gapX = 15;
    const gapY = 15;
    const totalGridW = cols * cellW + (cols - 1) * gapX;
    const startX = (this.canvasWidth - totalGridW) / 2;
    const startY = 170;

    const page = this.levelPage;
    const startIdx = page * this.levelsPerPage;
    const endIdx = Math.min(startIdx + this.levelsPerPage, this.maxLevel);

    for (let i = startIdx; i < endIdx; i++) {
      const idxInPage = i - startIdx;
      const col = idxInPage % cols;
      const row = Math.floor(idxInPage / cols);
      const x = startX + col * (cellW + gapX);
      const y = startY + row * (cellH + gapY);
      const level = Levels[i];

      // Card background
      const isHovered = this.mouseX >= x && this.mouseX <= x + cellW &&
                        this.mouseY >= y && this.mouseY <= y + cellH;

      ctx.shadowColor = isHovered ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = isHovered ? 15 : 5;

      ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 10);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = isHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 10);
      ctx.stroke();

      // Level number
      ctx.fillStyle = isHovered ? '#6366f1' : 'rgba(99, 102, 241, 0.5)';
      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 12, y + 28);

      // Level name
      ctx.fillStyle = isHovered ? '#1e293b' : 'rgba(71, 85, 105, 0.7)';
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(level.name, x + 12, y + 52);

      // Difficulty indicator
      const diff = i < 3 ? '简单' : i < 6 ? '中等' : i < 9 ? '困难' : '专家';
      const diffColors = { '简单': '#10b981', '中等': '#f59e0b', '困难': '#f97316', '专家': '#ef4444' };
      ctx.fillStyle = diffColors[diff];
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(diff, x + cellW - 12, y + 28);
    }

    // Page navigation
    const totalPages = Math.ceil(this.maxLevel / this.levelsPerPage);
    if (totalPages > 1) {
      const arrowY = 525;
      const arrowSize = 40;

      // Left arrow
      const leftArrowX = 250;
      const leftHovered = this.mouseX >= leftArrowX && this.mouseX <= leftArrowX + arrowSize &&
                          this.mouseY >= arrowY && this.mouseY <= arrowY + arrowSize && this.levelPage > 0;
      ctx.shadowColor = leftHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = leftHovered ? 10 : 3;
      ctx.fillStyle = leftHovered ? '#6366f1' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(leftArrowX, arrowY, arrowSize, arrowSize, 10);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = leftHovered ? 'transparent' : 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(leftArrowX, arrowY, arrowSize, arrowSize, 10);
      ctx.stroke();
      ctx.fillStyle = leftHovered ? '#ffffff' : 'rgba(99, 102, 241, 0.5)';
      ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◀', leftArrowX + arrowSize / 2, arrowY + arrowSize / 2);

      // Right arrow
      const rightArrowX = 490;
      const rightHovered = this.mouseX >= rightArrowX && this.mouseX <= rightArrowX + arrowSize &&
                           this.mouseY >= arrowY && this.mouseY <= arrowY + arrowSize && this.levelPage < totalPages - 1;
      ctx.shadowColor = rightHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = rightHovered ? 10 : 3;
      ctx.fillStyle = rightHovered ? '#6366f1' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(rightArrowX, arrowY, arrowSize, arrowSize, 10);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = rightHovered ? 'transparent' : 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightArrowX, arrowY, arrowSize, arrowSize, 10);
      ctx.stroke();
      ctx.fillStyle = rightHovered ? '#ffffff' : 'rgba(99, 102, 241, 0.5)';
      ctx.fillText('▶', rightArrowX + arrowSize / 2, arrowY + arrowSize / 2);

      ctx.textBaseline = 'alphabetic';

      // Page indicator
      ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.font = '15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`${page + 1} / ${totalPages}`, this.canvasWidth / 2, arrowY + arrowSize / 2 + 6);
    }
  },

  drawLevelClear(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('关卡通过!', this.canvasWidth / 2, this.canvasHeight / 2 - 40);

    ctx.fillStyle = '#475569';
    ctx.font = '22px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`得分: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2 + 15);

    const nextIdx = Math.min(this.level, this.maxLevel - 1);
    ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`下一关: ${Levels[nextIdx].name}`, this.canvasWidth / 2, this.canvasHeight / 2 + 55);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('点击继续', this.canvasWidth / 2, this.canvasHeight / 2 + 110);
  },

  drawGameClear(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 恭喜通关! 🎉', this.canvasWidth / 2, this.canvasHeight / 2 - 80);

    ctx.fillStyle = '#475569';
    ctx.font = '28px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`最终得分: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`最高分: ${Storage.getHighScore()}`, this.canvasWidth / 2, this.canvasHeight / 2 + 50);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('点击返回主菜单', this.canvasWidth / 2, this.canvasHeight / 2 + 120);
  },

  drawOverlay(ctx, title, subtitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.canvasWidth / 2, this.canvasHeight / 2 - 20);

    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.fillText(subtitle, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
  },

  drawGameOver(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', this.canvasWidth / 2, this.canvasHeight / 2 - 60);

    ctx.fillStyle = '#475569';
    ctx.font = '24px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`得分: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`最高分: ${Storage.getHighScore()}`, this.canvasWidth / 2, this.canvasHeight / 2 + 40);

    ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('点击返回关卡选择', this.canvasWidth / 2, this.canvasHeight / 2 + 100);
  },

  gameLoop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
};

window.addEventListener('DOMContentLoaded', () => Game.init());