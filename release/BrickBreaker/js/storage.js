// Storage module - localStorage high score management
const Storage = {
  getHighScore() {
    return parseInt(localStorage.getItem('brickBreakerHighScore')) || 0;
  },

  setHighScore(score) {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem('brickBreakerHighScore', score);
      return true;
    }
    return false;
  }
};