// Level definitions for Brick Breaker
const Levels = [
  // Level 1 - Classic pyramid (easy)
  {
    name: 'Classic',
    rows: 6,
    cols: 10,
    // null = empty, true = normal brick
    pattern: null, // null means full grid
    brickTypes: null, // default: all normal
    fixedLives: false,
    ballSpeed: 5,
    powerupDropRate: 0.15
  },

  // Level 2 - Diamond (easy)
  {
    name: 'Diamond',
    rows: 8,
    cols: 10,
    pattern: [
      [0,0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,0,0,0,0],
    ],
    brickTypes: null,
    fixedLives: false,
    ballSpeed: 5,
    powerupDropRate: 0.18
  },

  // Level 3 - Checkerboard (medium)
  {
    name: 'Checkerboard',
    rows: 8,
    cols: 10,
    pattern: null, // full grid with types below
    brickTypes: (r, c) => ((r + c) % 2 === 0) ? 'normal' : 'tough', // alternate
    fixedLives: false,
    ballSpeed: 5.5,
    powerupDropRate: 0.2
  },

  // Level 4 - Arrow (medium)
  {
    name: 'Arrow',
    rows: 9,
    cols: 9,
    pattern: [
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
    ],
    brickTypes: null,
    fixedLives: false,
    ballSpeed: 5.5,
    powerupDropRate: 0.2
  },

  // Level 5 - Fortress (medium-hard)
  {
    name: 'Fortress',
    rows: 8,
    cols: 10,
    pattern: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    brickTypes: (r, c) => {
      // Outer walls are tough
      if (r === 0 || r === 7 || c === 0 || c === 9) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6,
    powerupDropRate: 0.22
  },

  // Level 6 - Zigzag (medium)
  {
    name: 'Zigzag',
    rows: 6,
    cols: 10,
    pattern: [
      [1,1,0,0,1,1,0,0,1,1],
      [0,1,1,0,0,1,1,0,0,1],
      [0,0,1,1,0,0,1,1,0,0],
      [0,0,0,1,1,0,0,1,1,0],
      [0,0,0,0,1,1,0,0,1,1],
      [0,0,0,0,0,1,1,0,0,1],
    ],
    brickTypes: null,
    fixedLives: false,
    ballSpeed: 5.5,
    powerupDropRate: 0.2
  },

  // Level 7 - Hard diamonds (hard)
  {
    name: 'Crystal',
    rows: 8,
    cols: 10,
    pattern: [
      [0,0,1,0,1,1,0,1,0,0],
      [0,1,0,1,0,0,1,0,1,0],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,1,0,0,1],
      [1,0,0,0,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [0,1,0,1,0,0,1,0,1,0],
      [0,0,1,0,1,1,0,1,0,0],
    ],
    brickTypes: (r, c) => {
      if ((r + c) % 3 === 0) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6,
    powerupDropRate: 0.25
  },

  // Level 8 - Rows of tough bricks (hard)
  {
    name: 'Fortress II',
    rows: 8,
    cols: 10,
    pattern: null,
    brickTypes: (r, c) => {
      if (r < 2) return 'tough';      // Top 2 rows: tough
      if (r < 4) return 'normal';     // Middle 2 rows: normal
      if (r < 6) return 'tough';      // Bottom-mid 2 rows: tough
      return 'normal';                // Bottom 2 rows: normal
    },
    fixedLives: false,
    ballSpeed: 6.5,
    powerupDropRate: 0.25
  },

  // Level 9 - Speed challenge (very hard)
  {
    name: 'Speed Run',
    rows: 6,
    cols: 8,
    pattern: null,
    brickTypes: null,
    fixedLives: true,
    lives: 1,
    ballSpeed: 8,
    powerupDropRate: 0.35
  },

  // Level 10 - The Wall (boss level)
  {
    name: 'The Wall',
    rows: 10,
    cols: 10,
    pattern: null,
    brickTypes: (r, c) => {
      if (r < 3) return 'tough';
      if (r < 6) return 'normal';
      return 'tough';
    },
    fixedLives: false,
    ballSpeed: 7,
    powerupDropRate: 0.3
  },

  // Level 11 - Spiral (hard)
  {
    name: 'Spiral',
    rows: 9,
    cols: 9,
    pattern: [
      [1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    brickTypes: (r, c) => {
      if (r === 0 || r === 8 || c === 0 || c === 8) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6.5,
    powerupDropRate: 0.25
  },

  // Level 12 - Chaos (very hard)
  {
    name: 'Chaos',
    rows: 10,
    cols: 10,
    pattern: [
      [1,0,1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1,0,1],
      [1,1,0,0,1,1,0,0,1,1],
      [0,0,1,1,0,0,1,1,0,0],
      [1,0,1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1,0,1],
      [0,1,1,0,0,1,1,0,0,1],
      [1,0,0,1,1,0,0,1,1,0],
      [1,0,1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1,0,1],
    ],
    brickTypes: (r, c) => {
      const rand = (r * 7 + c * 13) % 10;
      if (rand < 2) return 'tough';
      if (rand < 3) return 'indestructible';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 7,
    powerupDropRate: 0.3
  },

  // ---- New levels 13-24 ----

  // Level 13 - Target Practice (easy)
  {
    name: 'Target',
    rows: 5,
    cols: 5,
    pattern: [
      [0,0,1,0,0],
      [0,1,1,1,0],
      [1,1,1,1,1],
      [0,1,1,1,0],
      [0,0,1,0,0],
    ],
    brickTypes: (r, c) => {
      if (r === 2 && c === 2) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 5,
    powerupDropRate: 0.25
  },

  // Level 14 - Stripes (easy)
  {
    name: 'Stripes',
    rows: 8,
    cols: 10,
    pattern: null,
    brickTypes: (r, c) => {
      if (r % 2 === 0) return 'normal';
      return 'tough';
    },
    fixedLives: false,
    ballSpeed: 5.5,
    powerupDropRate: 0.2
  },

  // Level 15 - X-Marks (medium)
  {
    name: 'X-Marks',
    rows: 9,
    cols: 9,
    pattern: [
      [1,0,0,0,0,0,0,0,1],
      [0,1,0,0,0,0,0,1,0],
      [0,0,1,0,0,0,1,0,0],
      [0,0,0,1,0,1,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,1,0,1,0,0,0],
      [0,0,1,0,0,0,1,0,0],
      [0,1,0,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,0,1],
    ],
    brickTypes: null,
    fixedLives: false,
    ballSpeed: 5.5,
    powerupDropRate: 0.22
  },

  // Level 16 - Pyramid (medium)
  {
    name: 'Pyramid',
    rows: 8,
    cols: 9,
    pattern: [
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
    ],
    brickTypes: (r, c) => {
      if (r === 0 && c === 4) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6,
    powerupDropRate: 0.22
  },

  // Level 17 - Grid Lock (medium-hard)
  {
    name: 'Grid Lock',
    rows: 10,
    cols: 10,
    pattern: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,1,0,1,1,0,1,0,1],
    ],
    brickTypes: (r, c) => {
      if (r % 2 === 0 || c % 2 === 0) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6,
    powerupDropRate: 0.25
  },

  // Level 18 - Hourglass (medium)
  {
    name: 'Hourglass',
    rows: 9,
    cols: 9,
    pattern: [
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,1,0,1,0,0,0],
      [0,0,1,0,0,0,1,0,0],
      [0,1,0,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,0,1],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
    ],
    brickTypes: (r, c) => {
      if (r === 0) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6,
    powerupDropRate: 0.22
  },

  // Level 19 - Lightning (hard)
  {
    name: 'Lightning',
    rows: 8,
    cols: 10,
    pattern: [
      [1,0,0,0,1,1,1,0,0,1],
      [1,0,0,1,0,0,1,0,0,1],
      [1,0,1,0,0,0,1,0,0,1],
      [1,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,0,1,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    brickTypes: (r, c) => {
      if (r === 7) return 'tough';
      if ((r + c) % 5 === 0) return 'indestructible';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6.5,
    powerupDropRate: 0.28
  },

  // Level 20 - Diamond Mine (hard)
  {
    name: 'Diamond Mine',
    rows: 8,
    cols: 10,
    pattern: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,1,0,0,1,0,0,1],
      [1,0,1,0,1,0,0,1,0,1],
      [1,1,1,1,0,1,1,0,1,1],
      [1,0,0,1,0,0,1,0,0,1],
      [1,0,1,0,1,0,0,1,0,1],
      [1,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    brickTypes: (r, c) => {
      if (r === 0 || r === 7 || c === 0 || c === 9) return 'tough';
      if ((r * c) % 7 === 0) return 'indestructible';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 6.5,
    powerupDropRate: 0.28
  },

  // Level 21 - Maze (very hard)
  {
    name: 'Maze',
    rows: 10,
    cols: 10,
    pattern: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    brickTypes: (r, c) => {
      if (r === 0 || r === 9 || c === 0 || c === 9) return 'tough';
      if (r % 2 === 0 && c % 2 === 0) return 'indestructible';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 7,
    powerupDropRate: 0.3
  },

  // Level 22 - Storm (very hard)
  {
    name: 'Storm',
    rows: 10,
    cols: 10,
    pattern: null,
    brickTypes: (r, c) => {
      const seed = (r * 13 + c * 7) % 8;
      if (seed < 1) return 'indestructible';
      if (seed < 3) return 'tough';
      return 'normal';
    },
    fixedLives: false,
    ballSpeed: 7.5,
    powerupDropRate: 0.35
  },

  // Level 23 - Gauntlet (extreme)
  {
    name: 'Gauntlet',
    rows: 12,
    cols: 10,
    pattern: null,
    brickTypes: (r, c) => {
      if (r < 2 || r >= 10) return 'tough';
      if (r % 3 === 0 && c % 3 === 0) return 'indestructible';
      return 'normal';
    },
    fixedLives: true,
    lives: 2,
    ballSpeed: 8,
    powerupDropRate: 0.35
  },

  // Level 24 - The End (final boss)
  // This pattern uses: 1 = normal/tough (handled by brickTypes), 2 = indestructible
  {
    name: 'The End',
    rows: 12,
    cols: 12,
    pattern: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,2,1,2,1,2,1,2,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,2,1,1,1,1,2,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,2,1,1,2,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,2,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,1,1,1,1,1,2,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    // Indestructible positions: row 1 cols 1,3,5,7,9; row 3 cols 2,7; row 5 col 3,6; row 7 col 4; row 9 col 1,8
    brickTypes: (r, c) => {
      // Check for indestructible positions
      if (
        (r === 1 && (c === 1 || c === 3 || c === 5 || c === 7 || c === 9)) ||
        (r === 3 && (c === 2 || c === 7)) ||
        (r === 5 && (c === 3 || c === 6)) ||
        (r === 7 && c === 4) ||
        (r === 9 && (c === 1 || c === 8))
      ) return 'indestructible';
      // Outer ring is tough
      if (r === 0 || r === 11 || c === 0 || c === 11) return 'tough';
      // Core bricks are tough
      if (r >= 4 && r <= 7 && c >= 4 && c <= 7) return 'tough';
      return 'normal';
    },
    fixedLives: true,
    lives: 3,
    ballSpeed: 8.5,
    powerupDropRate: 0.4
  }
];