// Powerup module - dropping and effects
const Powerup = {
  items: [],         // active falling powerups
  activeEffects: {}, // currently active effects
  types: [
    { id: 'wide',     color: '#fbbf24', symbol: '⇔', label: 'Wide Paddle', duration: 10000 },
    { id: 'multi',    color: '#f87171', symbol: '✦', label: 'Multi Ball',  duration: 0     },
    { id: 'pierce',   color: '#34d399', symbol: '⚡', label: 'Pierce Ball', duration: 12000 },
    { id: 'slow',     color: '#60a5fa', symbol: '◀', label: 'Slow Down',   duration: 8000  },
    { id: 'life',     color: '#fb923c', symbol: '❤', label: 'Extra Life',  duration: 0     },
    { id: 'shrink',   color: '#f87171', symbol: '▼', label: 'Shrink Paddle', duration: 0   },
  ],

  init() {
    this.items = [];
    this.activeEffects = {};
  },

  // Spawn a powerup at brick position
  spawn(brickX, brickY, brickWidth, brickHeight, dropRate) {
    if (Math.random() > dropRate) return null;
    const typeIndex = Math.floor(Math.random() * this.types.length);
    const type = this.types[typeIndex];

    // Never drop shrink from normal gameplay - it's a penalty
    if (type.id === 'shrink' && Math.random() > 0.2) {
      // Only 20% chance when selected, otherwise re-roll
      return this.spawn(brickX, brickY, brickWidth, brickHeight, dropRate);
    }

    const item = {
      type: type,
      x: brickX + brickWidth / 2,
      y: brickY,
      width: 36,
      height: 24,
      speed: 2,
      active: true
    };
    this.items.push(item);
    return item;
  },

  // Spawn a penalty (shrink) - forced for certain situations
  spawnPenalty(brickX, brickY, brickWidth, brickHeight) {
    const shrinkType = this.types.find(t => t.id === 'shrink');
    const item = {
      type: shrinkType,
      x: brickX + brickWidth / 2,
      y: brickY,
      width: 36,
      height: 24,
      speed: 2.5,
      active: true
    };
    this.items.push(item);
  },

  update(canvasHeight, paddle) {
    // Update falling items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item.active) continue;

      item.y += item.speed;

      // Remove if off screen
      if (item.y - item.height > canvasHeight) {
        this.items.splice(i, 1);
        continue;
      }

      // Check collision with paddle
      if (
        item.y + item.height >= paddle.y &&
        item.y <= paddle.y + paddle.height &&
        item.x >= paddle.x &&
        item.x <= paddle.x + paddle.width
      ) {
        item.active = false;
        this.items.splice(i, 1);
        this.activate(item.type);
        return item.type; // return activated type
      }
    }
    return null;
  },

  activate(type) {
    switch (type.id) {
      case 'wide':
        Paddle.originalWidth = Paddle.originalWidth || Paddle.width;
        Paddle.width = Math.min(Paddle.originalWidth * 1.5, 200);
        this.activeEffects['wide'] = { timer: type.duration };
        break;

      case 'multi':
        this.activateMultiBall();
        break;

      case 'pierce':
        Ball.piercing = true;
        this.activeEffects['pierce'] = { timer: type.duration };
        break;

      case 'slow':
        Ball.originalSpeed = Ball.originalSpeed || Ball.speed;
        Ball.speed = Math.max(2, Ball.originalSpeed * 0.6);
        Ball.dx = Ball.dx > 0 ? Ball.speed : -Ball.speed;
        Ball.dy = Ball.dy > 0 ? Ball.speed : -Ball.speed;
        this.activeEffects['slow'] = { timer: type.duration };
        break;

      case 'life':
        Game.addLife();
        break;

      case 'shrink':
        Paddle.originalWidth = Paddle.originalWidth || Paddle.width;
        Paddle.width = Math.max(40, (Paddle.originalWidth || 100) * 0.6);
        // Shrink is permanent until another wide restores
        break;
    }
  },

  activateMultiBall() {
    // Split existing balls
    const existingBalls = Balls.list.length > 0 ? [...Balls.list] : [Ball];
    const newBalls = [];
    for (const b of existingBalls) {
      for (let i = 0; i < 2; i++) {
        if (Balls.list.length + newBalls.length >= 6) break; // cap at 6 balls
        const angle = (Math.random() - 0.5) * Math.PI * 0.6;
        const speed = b.speed || Ball.speed;
        newBalls.push({
          x: b.x,
          y: b.y,
          radius: b.radius || Ball.radius,
          dx: speed * Math.sin(angle + (i === 0 ? -0.5 : 0.5)),
          dy: -speed * Math.cos(angle * 0.5 + 0.3),
          speed: speed,
          isMoving: true,
          piercing: false
        });
      }
    }
    Balls.add(newBalls);
  },

  updateEffects(dt) {
    for (const key in this.activeEffects) {
      this.activeEffects[key].timer -= dt;
      if (this.activeEffects[key].timer <= 0) {
        this.deactivate(key);
      }
    }
  },

  deactivate(effectId) {
    delete this.activeEffects[effectId];
    switch (effectId) {
      case 'wide':
        Paddle.width = Paddle.originalWidth || 100;
        break;
      case 'pierce':
        Ball.piercing = false;
        if (Balls.list.length > 0) {
          Balls.list.forEach(b => b.piercing = false);
        }
        break;
      case 'slow':
        if (Ball.originalSpeed) {
          Ball.speed = Ball.originalSpeed;
          Ball.originalSpeed = null;
          const speedRatio = Ball.speed / Math.max(1, Ball.dx || Ball.speed);
          Ball.dx = Ball.dx > 0 ? Ball.speed : -Ball.speed;
          Ball.dy = Ball.dy > 0 ? Ball.speed : -Ball.speed;
        }
        if (Balls.list.length > 0) {
          Balls.list.forEach(b => {
            if (b.originalSpeed) {
              b.speed = b.originalSpeed;
              b.originalSpeed = null;
            }
          });
        }
        break;
    }
  },

  draw(ctx) {
    for (const item of this.items) {
      const t = item.type;
      const x = item.x - item.width / 2;
      const y = item.y;

      // Glow
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 8;

      // Background
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 4);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Symbol
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.symbol, item.x, y + item.height / 2);
    }
  },

  clear() {
    this.items = [];
    // Deactivate all effects
    for (const key in this.activeEffects) {
      this.deactivate(key);
    }
  }
};

// Multi-ball manager
const Balls = {
  list: [],

  init() {
    this.list = [];
  },

  add(newBalls) {
    for (const b of newBalls) {
      if (this.list.length < 6) {
        this.list.push(b);
      }
    }
  },

  update(canvasWidth, canvasHeight, paddle) {
    const toRemove = [];
    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i];
      b.x += b.dx;
      b.y += b.dy;

      // Wall collisions
      if (b.x - b.radius <= 0 || b.x + b.radius >= canvasWidth) {
        b.dx = -b.dx;
      }
      if (b.y - b.radius <= 0) {
        b.dy = -b.dy;
      }

      // Paddle collision
      if (
        b.y + b.radius >= paddle.y &&
        b.y + b.radius <= paddle.y + paddle.height &&
        b.x >= paddle.x &&
        b.x <= paddle.x + paddle.width
      ) {
        b.dy = -b.dy;
        const hitPos = (b.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI * 0.6;
        const speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        b.dx = speed * Math.sin(angle);
        b.dy = -speed * Math.cos(angle);
      }

      // Bottom
      if (b.y + b.radius >= canvasHeight) {
        toRemove.push(i);
      }
    }

    // Remove lost balls
    for (const idx of toRemove) {
      this.list.splice(idx, 1);
    }

    return this.list.length === 0; // all balls lost
  },

  checkBrickCollision(bricks) {
    let hitAny = false;
    for (const b of this.list) {
      if (bricks.checkCollision(b)) {
        hitAny = true;
      }
    }
    return hitAny;
  },

  draw(ctx) {
    for (const b of this.list) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius || 8, 0, Math.PI * 2);
      if (b.piercing) {
        ctx.fillStyle = '#69db7c';
        ctx.fill();
      } else {
        // Same gradient as main ball
        const gradient = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.radius || 8);
        gradient.addColorStop(0, '#a5b4fc');
        gradient.addColorStop(0.6, '#818cf8');
        gradient.addColorStop(1, '#6366f1');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        // Highlight
        ctx.beginPath();
        ctx.arc(b.x - 2, b.y - 3, (b.radius || 8) * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }
      ctx.closePath();
    }
  },

  clear() {
    this.list = [];
  }
};