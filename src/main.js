// Main entry point: defines CONFIG and initializes Phaser game

const CONFIG = {
  // Grid
  COLS: 20, ROWS: 14, CELL: 48,

  // Economy
  START_GOLD: 150, START_LIVES: 3,

  // Towers: [cost, damage, range (in tiles), fireRate (ms), type]
  TOWERS: {
    archer:   { cost: 50,  damage: 15, range: 3,   fireRate: 800,  type: 'archer',   color: 0x8B4513, label: 'Archer',   desc: 'Single target' },
    catapult: { cost: 100, damage: 45, range: 2.5, fireRate: 2500, type: 'catapult', color: 0x888888, label: 'Catapult', desc: 'Splash damage' },
    mage:     { cost: 125, damage: 30, range: 3.5, fireRate: 1500, type: 'mage',     color: 0x7B2FBE, label: 'Mage',     desc: 'Ignores armor' },
  },

  // Enemies: { hp, speed (px/s), gold, armor, minWave, color }
  ENEMIES: {
    greenSlime: { hp: 60,   speed: 80,  gold: 10,  armor: false, minWave: 1,  color: 0x44cc44, scale: 1 },
    blueSlime:  { hp: 120,  speed: 130, gold: 20,  armor: false, minWave: 5,  color: 0x4477ff, scale: 1 },
    redSlime:   { hp: 200,  speed: 70,  gold: 35,  armor: true,  minWave: 8,  color: 0xff3333, scale: 1 },
    dragon:     { hp: 1500, speed: 60,  gold: 200, armor: false, minWave: 10, color: 0x8B0000, scale: 2 },
  },

  // Wave scaling
  WAVE_BASE_ENEMIES: 5,
  WAVE_ENEMY_INCREMENT: 2,
  SPAWN_INTERVAL: 1200,
  MAX_WAVES: 20,
  PREP_TIME: 10,

  // Upgrade
  UPGRADE_DAMAGE_MULT: 2,
  UPGRADE_RANGE_MULT: 2,
  SELL_REFUND: 0.5,

  // Path waypoints [col, row]
  PATH: [
    [0,2],[1,2],[2,2],[3,2],[4,2],[4,3],[4,4],[4,5],[4,6],
    [5,6],[6,6],[7,6],[8,6],[8,5],[8,4],[8,3],[9,3],[10,3],
    [11,3],[11,4],[11,5],[11,6],[11,7],[11,8],[10,8],[9,8],
    [8,8],[7,8],[6,8],[5,8],[5,9],[5,10],[5,11],[6,11],
    [7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[12,10],
    [12,9],[12,8],[13,8],[14,8],[15,8],[15,7],[15,6],[15,5],
    [15,4],[15,3],[16,3],[17,3],[18,3],[19,3]
  ],
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: CONFIG.COLS * CONFIG.CELL,   // 960
  height: CONFIG.ROWS * CONFIG.CELL,  // 672
  backgroundColor: '#1a1a2e',
  scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene, WinScene],
  parent: document.body,
});
