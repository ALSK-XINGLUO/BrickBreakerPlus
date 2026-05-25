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
  }
];