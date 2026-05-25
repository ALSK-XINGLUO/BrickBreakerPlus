// Ball module
const Ball = {
  x: 0,
  y: 0,
  radius: 8,
  dx: 5,
  dy: -5,
  speed: 5,
  isMoving: false,

  init(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  },

  reset(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 40;
    this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1);
    this.dy = -this.speed;
    this.isMoving = false;
  },

  launch() {
    if (!this.isMoving) {
      this.isMoving = true;
    }
  },

  update(canvasWidth, canvasHeight, paddle) {
    if (!this.isMoving) {
      // Follow paddle
      this.x = paddle.x + paddle.width / 2;
      this.y = paddle.y - this.radius;
      return false;
    }

    this.x += this.dx;
    this.y += this.dy;

    // Wall collisions (left/right)
    if (this.x - this.radius <= 0 || this.x + this.radius >= canvasWidth) {
      this.dx = -this.dx;
    }

    // Wall collision (top)
    if (this.y - this.radius <= 0) {
      this.dy = -this.dy;
    }

    // Paddle collision
    if (
      this.y + this.radius >= paddle.y &&
      this.y + this.radius <= paddle.y + paddle.height &&
      this.x >= paddle.x &&
      this.x <= paddle.x + paddle.width
    ) {
      this.dy = -this.dy;
      // Angle based on hit position
      const hitPos = (this.x - paddle.x) / paddle.width; // 0~1
      const angle = (hitPos - 0.5) * Math.PI * 0.6; // -54°~54°
      const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      this.dx = speed * Math.sin(angle);
      this.dy = -speed * Math.cos(angle);
    }

    // Bottom (miss)
    if (this.y + this.radius >= canvasHeight) {
      return true; // ball lost
    }

    return false;
  },

  draw(ctx) {
    // Glow
    ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
    ctx.shadowBlur = 12;
    // Ball body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(this.x - 2, this.y - 2, 1, this.x, this.y, this.radius);
    gradient.addColorStop(0, '#a5b4fc');
    gradient.addColorStop(0.6, '#818cf8');
    gradient.addColorStop(1, '#6366f1');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
    // Highlight
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 3, this.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    ctx.closePath();
  }
};