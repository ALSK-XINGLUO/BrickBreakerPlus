// Brick module
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

  init(canvasWidth) {
    this.offsetLeft = (canvasWidth - (this.cols * (this.width + this.padding))) / 2;
    this.bricks = [];
    for (let r = 0; r < this.rows; r++) {
      this.bricks[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.bricks[r][c] = { x: 0, y: 0, alive: true };
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

  checkCollision(ball) {
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
          brick.alive = false;

          // Determine bounce direction
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

          return true; // brick hit
        }
      }
    }
    return false;
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

        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = this.colors[r];
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, this.width, this.height, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(brick.x + 2, brick.y + 2, this.width - 4, this.height / 2 - 2, 3);
        ctx.fill();
      }
    }
  }
};