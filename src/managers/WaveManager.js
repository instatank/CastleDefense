// WaveManager: controls wave spawning, prep countdown, and win/lose conditions

class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.active = false;
    this.stopped = false;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.delayTimer = 0;
    this.spawnInterval = CONFIG.SPAWN_INTERVAL;
    this.prepTimer = 0;
    this.inPrep = false;
    this.dragonWarned = false;
  }

  startNextWave() {
    if (this.active || this.stopped) return;
    this.currentWave++;
    this.scene.wave = this.currentWave;
    this.scene.events.emit('waveStarted', this.currentWave);
    this._buildQueue();
    this.active = true;
    this.spawnTimer = 0;
    this.delayTimer = 0;
    this.dragonWarned = false;

    // Dragon warning for every 10th wave
    if (this.currentWave % 10 === 0) {
      this._showDragonWarning();
    }
  }

  _buildQueue() {
    const wave = this.currentWave;
    const count = CONFIG.WAVE_BASE_ENEMIES + wave * CONFIG.WAVE_ENEMY_INCREMENT;
    this.spawnQueue = [];

    // Dragon boss spawns after a 3-second warning delay on every 10th wave
    // The 'DRAGON_DELAY' sentinel causes the spawn loop to wait 3s before spawning
    if (wave % 10 === 0) {
      this.spawnQueue.push('DRAGON_DELAY');
      this.spawnQueue.push('dragon');
    }

    const available = [];
    if (wave >= 1) available.push('greenSlime', 'greenSlime', 'greenSlime');
    if (wave >= 5) available.push('blueSlime', 'blueSlime');
    if (wave >= 8) available.push('redSlime');

    for (let i = 0; i < count; i++) {
      this.spawnQueue.push(available[Math.floor(Math.random() * available.length)]);
    }
  }

  _showDragonWarning() {
    const { width, height } = this.scene.scale;
    const txt = this.scene.add.text(width / 2, height / 2 - 40, '⚠ DRAGON INCOMING ⚠', {
      fontSize: '36px', fontFamily: 'serif', color: '#ff4400',
      stroke: '#000000', strokeThickness: 6,
      shadow: { color: '#ff0000', blur: 20, fill: true }
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.scene.tweens.add({
      targets: txt, alpha: 1, duration: 300, yoyo: true, hold: 2400,
      onComplete: () => txt.destroy()
    });

    this.scene.cameras.main.shake(500, 0.01);
  }

  _spawnEnemy(type) {
    const cfg = CONFIG.ENEMIES[type];
    if (!cfg) return;
    const enemy = new Enemy(this.scene, type, cfg);
    this.scene.enemies.push(enemy);
  }

  update(time, delta) {
    if (this.stopped || !this.active) return;

    if (this.delayTimer > 0) {
      this.delayTimer -= delta;
      return;
    }

    if (this.spawnQueue.length > 0) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        const type = this.spawnQueue.shift();
        if (type === 'DRAGON_DELAY') {
          // Hold spawn loop for 3 seconds to let warning play
          this.delayTimer = 3000;
          return;
        }
        this._spawnEnemy(type);
      }
    } else {
      // Queue empty — wait for all enemies to be gone
      if (this.scene.enemies.length === 0) {
        this.active = false;
        this._onWaveComplete();
      }
    }
  }

  _onWaveComplete() {
    if (this.currentWave >= CONFIG.MAX_WAVES) {
      this.scene.triggerWin();
      return;
    }
    this.scene.events.emit('waveComplete', this.currentWave);
  }

  stop() {
    this.stopped = true;
    this.active = false;
  }
}
