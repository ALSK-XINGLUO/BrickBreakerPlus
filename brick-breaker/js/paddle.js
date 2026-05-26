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
    const isWide = Powerup.activeEffects['wide'] ? 1 : 0;
    const isShrunk = this.width < (this.originalWidth || 100) && !Powerup.activeEffects['wide'];
    let glowColor = 'rgba(99, 102, 241, 0.3)';
    let gradientTop = '#818cf8';
    let gradientBottom = '#6366f1';

    if (isWide) {
      glowColor = 'rgba(251, 191, 36, 0.4)';
      gradientTop = '#fcd34d';
      gradientBottom = '#f59e0b';
    } else if (isShrunk) {
      glowColor = 'rgba(248, 113, 113, 0.4)';
      gradientTop = '#fca5a5';
      gradientBottom = '#ef4444';
    }

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isWide || isShrunk ? 16 : 10;
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, gradientTop);
    gradient.addColorStop(1, gradientBottom);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(this.x + 4, this.y + 2, this.width - 8, this.height * 0.4, 4);
    ctx.fill();

    // Effect label on paddle
    if (isWide) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⇔ WIDE', this.x + this.width / 2, this.y + this.height / 2);
    } else if (isShrunk) {
      ctx.fillStyle = 'rgba(248, 113, 113, 0.9)';
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▼ SHRINK', this.x + this.width / 2, this.y + this.height / 2);
    }
  }
};