// GameScene: main game loop, grid rendering, tower placement, enemy management

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init() {
    this.gold = CONFIG.START_GOLD;
    this.lives = CONFIG.START_LIVES;
    this.wave = 0;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.selectedTowerType = null;
    this.placingTower = false;
    this.hoverCell = null;
    this.pathSet = new Set();
    this.gameOver = false;
    this.waveActive = false;
    this.totalGoldEarned = 0;
  }

  create() {
    // Build path lookup set
    CONFIG.PATH.forEach(([c, r]) => this.pathSet.add(`${c},${r}`));

    this._buildGrid();
    this._drawCastle();
    this._setupInput();

    // Hover overlay graphics
    this.hoverGraphics = this.add.graphics().setDepth(10);

    // Selected tower range ring
    this.rangeGraphics = this.add.graphics().setDepth(9);

    // Wave manager
    this.waveManager = new WaveManager(this);

    // Tell UI scene game is ready
    this.events.emit('gameReady');

    this.cameras.main.fadeIn(400);
  }

  _buildGrid() {
    const { COLS, ROWS, CELL } = CONFIG;
    this.gridGraphics = this.add.graphics().setDepth(0);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * CELL, y = r * CELL;
        const isPath = this.pathSet.has(`${c},${r}`);
        if (isPath) {
          this.gridGraphics.fillStyle(0xc8a96e); this.gridGraphics.fillRect(x, y, CELL, CELL);
          this.gridGraphics.lineStyle(1, 0xb8935a, 0.4); this.gridGraphics.strokeRect(x, y, CELL, CELL);
        } else {
          this.gridGraphics.fillStyle(0x4a7c3f); this.gridGraphics.fillRect(x, y, CELL, CELL);
          this.gridGraphics.lineStyle(1, 0x3d6b34, 0.3); this.gridGraphics.strokeRect(x, y, CELL, CELL);
        }
      }
    }
  }

  _drawCastle() {
    const { CELL, ROWS } = CONFIG;
    const x = 19 * CELL;
    const g = this.add.graphics().setDepth(1);

    // Castle body spans full column height
    g.fillStyle(0x888888); g.fillRect(x, 0, CELL, ROWS * CELL);
    g.fillStyle(0x777777); g.lineStyle(2, 0x555555); g.strokeRect(x, 0, CELL, ROWS * CELL);

    // Battlements on top
    g.fillStyle(0x666666);
    for (let i = 0; i < 3; i++) { g.fillRect(x + i * 16, 0, 12, 20); }

    // Gate at path row (row 3)
    const gateY = 3 * CELL;
    g.fillStyle(0x222233); g.fillRect(x + 8, gateY, 32, 48);
    g.fillStyle(0x8B4513); g.fillRect(x + 8, gateY, 32, 4);

    // Windows
    g.fillStyle(0xddaa44);
    g.fillRect(x + 12, CELL, 10, 14);
    g.fillRect(x + 26, CELL, 10, 14);
    g.fillRect(x + 12, 5*CELL, 10, 14);
    g.fillRect(x + 26, 5*CELL, 10, 14);
  }

  _setupInput() {
    this.input.on('pointermove', (ptr) => {
      if (this.gameOver) return;
      const c = Math.floor(ptr.x / CONFIG.CELL);
      const r = Math.floor(ptr.y / CONFIG.CELL);
      this.hoverCell = { c, r };
      this._drawHover();
    });

    this.input.on('pointerdown', (ptr) => {
      if (this.gameOver || ptr.button !== 0) return;
      const c = Math.floor(ptr.x / CONFIG.CELL);
      const r = Math.floor(ptr.y / CONFIG.CELL);

      if (this.placingTower) {
        this._tryPlaceTower(c, r);
      } else {
        this._trySelectTower(c, r);
      }
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.placingTower = false;
      this.selectedTowerType = null;
      this.hoverGraphics.clear();
      this.events.emit('towerDeselected');
    });
  }

  _drawHover() {
    this.hoverGraphics.clear();
    if (!this.placingTower || !this.hoverCell) return;
    const { c, r } = this.hoverCell;
    const { CELL } = CONFIG;
    const valid = this._canPlace(c, r);
    this.hoverGraphics.fillStyle(valid ? 0x00ff00 : 0xff0000, 0.35);
    this.hoverGraphics.fillRect(c * CELL, r * CELL, CELL, CELL);
    this.hoverGraphics.lineStyle(2, valid ? 0x00ff00 : 0xff0000, 0.8);
    this.hoverGraphics.strokeRect(c * CELL, r * CELL, CELL, CELL);
  }

  _canPlace(c, r) {
    if (c < 0 || c >= CONFIG.COLS - 1 || r < 0 || r >= CONFIG.ROWS) return false;
    if (this.pathSet.has(`${c},${r}`)) return false;
    if (this.towers.find(t => t.col === c && t.row === r)) return false;
    return true;
  }

  _tryPlaceTower(c, r) {
    const cfg = CONFIG.TOWERS[this.selectedTowerType];
    if (!cfg) return;
    if (!this._canPlace(c, r)) return;

    if (this.gold < cfg.cost) {
      this.events.emit('flashGold');
      return;
    }

    this.gold -= cfg.cost;
    const tower = new Tower(this, c, r, this.selectedTowerType, cfg);
    this.towers.push(tower);
    this.events.emit('goldChanged', this.gold);
    this.events.emit('towerPlaced', tower);
  }

  _trySelectTower(c, r) {
    const tower = this.towers.find(t => t.col === c && t.row === r);
    if (tower) {
      this.rangeGraphics.clear();
      const cx = tower.col * CONFIG.CELL + CONFIG.CELL / 2;
      const cy = tower.row * CONFIG.CELL + CONFIG.CELL / 2;
      const range = tower.currentRange * CONFIG.CELL;
      this.rangeGraphics.lineStyle(2, 0xffffff, 0.4);
      this.rangeGraphics.strokeCircle(cx, cy, range);
      this.events.emit('towerSelected', tower);
    } else {
      this.rangeGraphics.clear();
      this.events.emit('towerDeselected');
    }
  }

  selectTowerType(type) {
    this.selectedTowerType = type;
    this.placingTower = true;
    this.rangeGraphics.clear();
    this.events.emit('towerDeselected');
  }

  cancelPlacement() {
    this.placingTower = false;
    this.selectedTowerType = null;
    this.hoverGraphics.clear();
  }

  upgradeTower(tower) {
    const upgradeCost = tower.cfg.cost * 2;
    if (this.gold < upgradeCost || tower.upgraded) return false;
    this.gold -= upgradeCost;
    tower.upgrade();
    this.events.emit('goldChanged', this.gold);
    this.events.emit('towerSelected', tower);
    return true;
  }

  sellTower(tower) {
    const refund = Math.floor(tower.totalSpent * CONFIG.SELL_REFUND);
    this.gold += refund;
    tower.destroy();
    this.towers = this.towers.filter(t => t !== tower);
    this.rangeGraphics.clear();
    this.events.emit('goldChanged', this.gold);
    this.events.emit('towerDeselected');
    return refund;
  }

  enemyReachedEnd(enemy) {
    this.lives--;
    this.events.emit('livesChanged', this.lives);
    if (this.lives <= 0) this._triggerGameOver();
  }

  enemyKilled(enemy) {
    this.gold += enemy.goldValue;
    this.totalGoldEarned += enemy.goldValue;
    this.events.emit('goldChanged', this.gold);
    this._spawnDeathParticles(enemy);
  }

  _spawnDeathParticles(enemy) {
    const x = enemy.x, y = enemy.y;
    const color = enemy.enemyColor;
    const isDragon = enemy.enemyType === 'dragon';
    const count = isDragon ? 20 : 8;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({ x, y, vx: (Math.random()-0.5)*160, vy: (Math.random()-0.5)*160, life: 1, r: isDragon ? 6 : 3 });
    }
    // Each burst gets its own graphics object so bursts don't clobber each other
    const burstGfx = this.add.graphics().setDepth(20);
    let ticks = 0;
    this.time.addEvent({ delay: 16, repeat: 30, callback: () => {
      ticks++;
      burstGfx.clear();
      particles.forEach(p => {
        p.x += p.vx * 0.016; p.y += p.vy * 0.016;
        p.vy += 80 * 0.016; p.life -= 0.033;
        if (p.life > 0) {
          burstGfx.fillStyle(color, Math.max(0, p.life));
          burstGfx.fillCircle(p.x, p.y, p.r * p.life);
        }
      });
      if (ticks >= 30) burstGfx.destroy();
    }, callbackScope: this });

    if (isDragon) {
      this.cameras.main.flash(300, 255, 200, 100);
    }
  }

  _triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.waveManager.stop();
    this.cameras.main.fade(600, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', { wave: this.wave });
    });
  }

  triggerWin() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.cameras.main.fade(600, 255, 255, 200);
    this.time.delayedCall(600, () => {
      this.scene.stop('UIScene');
      this.scene.start('WinScene', { gold: this.totalGoldEarned });
    });
  }

  startWave() {
    this.waveManager.startNextWave();
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Update towers
    this.towers.forEach(t => t.update(time, delta, this.enemies));

    // Update enemies
    this.enemies.forEach(e => e.update(time, delta));

    // Update projectiles
    this.projectiles.forEach(p => p.update(time, delta));

    // Cleanup dead enemies
    this.enemies = this.enemies.filter(e => !e.isDead && !e.reachedEnd);
    this.projectiles = this.projectiles.filter(p => !p.done);

    // Update wave manager
    this.waveManager.update(time, delta);
  }
}
