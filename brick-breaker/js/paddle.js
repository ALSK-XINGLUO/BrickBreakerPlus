// Paddle module
const Paddle = {
  x: 0,
  y: 0,
  width: 100,
  height: 15,
  speed: 8,
  canvasWidth: 0,

  init(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.width = 100;
    this.height = 15;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 30;
  },

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed);
  },

  moveRight() {
    this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed);
  },

  moveTo(mouseX) {
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, mouseX - this.width / 2));
  },

  draw(ctx) {
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};