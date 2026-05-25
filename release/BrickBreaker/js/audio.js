// Audio module - procedural sound effects using Web Audio API
const Audio = {
  ctx: null,
  enabled: true,
  volume: 0.3,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
    // Resume on first user interaction
    const resume = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
  },

  // Play a tone
  playTone(frequency, duration, type = 'square', volumeMul = 1) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * volumeMul, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // Play noise burst (for explosions)
  playNoise(duration, volumeMul = 1) {
    if (!this.enabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * volumeMul, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  },

  // --- Game Sounds ---

  brickHit() {
    this.playTone(440, 0.08, 'square', 0.3);
  },

  brickBreak() {
    this.playTone(660, 0.12, 'square', 0.4);
    this.playNoise(0.08, 0.3);
  },

  paddleHit() {
    this.playTone(520, 0.1, 'sine', 0.35);
  },

  wallHit() {
    this.playTone(300, 0.06, 'triangle', 0.2);
  },

  loseBall() {
    this.playTone(200, 0.3, 'sawtooth', 0.4);
    this.playTone(150, 0.4, 'sawtooth', 0.3);
  },

  levelClear() {
    this.playTone(523, 0.15, 'sine', 0.5);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.5), 150);
    setTimeout(() => this.playTone(784, 0.3, 'sine', 0.5), 300);
  },

  gameClear() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.5), i * 150);
    });
  },

  gameOver() {
    this.playTone(300, 0.3, 'sawtooth', 0.4);
    setTimeout(() => this.playTone(200, 0.5, 'sawtooth', 0.3), 300);
  },

  powerup() {
    this.playTone(800, 0.08, 'sine', 0.4);
    setTimeout(() => this.playTone(1000, 0.12, 'sine', 0.4), 80);
    setTimeout(() => this.playTone(1200, 0.15, 'sine', 0.4), 160);
  },

  toughHit() {
    this.playTone(350, 0.08, 'triangle', 0.3);
    this.playNoise(0.05, 0.2);
  },

  launch() {
    this.playTone(400, 0.06, 'sine', 0.3);
    setTimeout(() => this.playTone(600, 0.08, 'sine', 0.3), 60);
  }
};