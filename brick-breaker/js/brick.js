// Brick module - supports normal, tough, and indestructible types
const Bricks = {
  rows: 6,
  cols: 10,
  width: 70,
  height: 20,
  padding: 5,
  offsetTop: 60,
  offsetLeft: 0,
  bricks: [],
  colors: [
    '#ff6b6b', // red
    '#ffa94d', // orange
    '#ffd43b', // yellow
    '#69db7c', // green
    '#4dabf7', // blue
    '#9775fa'  // purple
  ],
  colorTough: '#c92a2a',
  colorIndestructible: '#495057',

  // Load a level configuration
  loadLevel(levelConfig, canvasWidth) {
    this.rows = levelConfig.rows;
    this.cols = levelConfig.cols;
    this.offsetLeft = (canvasWidth - (this.cols * (this.width + this.padding))) / 2;
    this.bricks = [];

    for (let r = 0; r < this.rows; r++) {
      this.bricks[r] = [];
      for (let c = 0; c < this.cols; c++) {
        // Check pattern
        let alive = true;
        if (levelConfig.pattern) {
          if (r >= levelConfig.pattern.length || c >= levelConfig.pattern[r].length) {
            alive = false;
          } else {
            alive = levelConfig.pattern[r][c] === 1;
          }
        }

        // Determine brick type
        let type = 'normal';
        if (alive && levelConfig.brickTypes) {
          const customType = levelConfig.brickTypes(r, c);
          if (customType) type = customType;
        }

        this.bricks[r][c] = {
          x: 0,
          y: 0,
          alive: alive,
          type: type,
          hits: type === 'tough' ? 2 : (type === 'indestructible' ? 999 : 1),
          maxHits: type === 'tough' ? 2 : 1
        };
      }
    }
    this.calculatePositions();
  },

  calculatePositions() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetLeft + c * (this.width + this.padding);
        const y = this.offsetTop + r * (this.height + this.padding);
        this.bricks[r][c].x = x;
        this.bricks[r][c].y = y;
      }
    }
  },

  checkCollision(ball, piercing = false) {
    let hitAny = false;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const brick = this.bricks[r][c];
        if (!brick.alive) continue;

        // AABB collision
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + this.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + this.height
        ) {
          if (!brick.alive) continue;

          // Determine bounce direction
          if (brick.type !== 'indestructible') {
            brick.hits--;
            if (brick.hits <= 0) {
              brick.alive = false;
            }
          }

          // Bounce (skip for piercing)
          if (!piercing || brick.type === 'indestructible') {
            const overlapLeft = (ball.x + ball.radius) - brick.x;
            const overlapRight = (brick.x + this.width) - (ball.x - ball.radius);
            const overlapTop = (ball.y + ball.radius) - brick.y;
            const overlapBottom = (brick.y + this.height) - (ball.y - ball.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }
          }

          hitAny = true;

          // Return brick position for powerup spawning
          // We collect the last hit brick coords
          this.lastHitBrick = { x: brick.x, y: brick.y, r, c };
        }
      }
    }
    return hitAny;
  },

  getLastHitPosition() {
    return this.lastHitBrick || null;
  },

  countAlive() {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.bricks[r][c].alive) count++;
      }
    }
    return count;
  },

  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const brick = this.bricks[r][c];
        if (!brick.alive) continue;

        // Pick color based on type and hits
        let color;
        if (brick.type === 'indestructible') {
          color = this.colorIndestructible;
        } else if (brick.type === 'tough') {
          // Cracked color progression
          if (brick.hits === 2) {
            color = this.colors[Math.min(r, this.colors.length - 1)];
          } else {
            // Darker / cracked
            color = '#e8590c';
          }
        } else {
          color = this.colors[Math.min(r, this.colors.length - 1)];
        }

        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, this.width, this.height, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Highlight on top half
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(brick.x + 2, brick.y + 2, this.width - 4, this.height / 2 - 2, 3);
        ctx.fill();

        // Indestructible border glow
        if (brick.type === 'indestructible') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(brick.x + 1, brick.y + 1, this.width - 2, this.height - 2, 4);
          ctx.stroke();
        }
      }
    }
  }
};