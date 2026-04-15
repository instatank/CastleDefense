// Enemy: path-following entity with HP bar, armor, and visual representation

class Enemy {
  constructor(scene, enemyType, cfg) {
    this.scene = scene;
    this.enemyType = enemyType;
    this.cfg = cfg;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.speed = cfg.speed;
    this.goldValue = cfg.gold;
    this.hasArmor = cfg.armor;
    this.enemyColor = cfg.color;
    this.scale = cfg.scale || 1;
    this.isDead = false;
    this.reachedEnd = false;
    this.pathIndex = 0;
    this.hitFlashTimer = 0;

    const size = Math.floor(CONFIG.CELL * 0.7 * this.scale);
    const startPt = CONFIG.PATH[0];
    this.x = startPt[0] * CONFIG.CELL + CONFIG.CELL / 2;
    this.y = startPt[1] * CONFIG.CELL + CONFIG.CELL / 2;

    // Graphics container
    this.container = scene.add.container(this.x, this.y).setDepth(5);

    // Body graphic
    this.bodyGfx = scene.add.graphics();
    this.container.add(this.bodyGfx);

    // HP bar background
    this.hpBarBg = scene.add.graphics();
    this.container.add(this.hpBarBg);

    // HP bar fill
    this.hpBarFill = scene.add.graphics();
    this.container.add(this.hpBarFill);

    this._drawBody();
    this._drawHpBar();
    this._startMoving();
  }

  _drawBody() {
    const g = this.bodyGfx;
    g.clear();
    const s = Math.floor(CONFIG.CELL * 0.65 * this.scale);
    const h = Math.floor(s * 0.8);
    const color = this.hitFlashTimer > 0 ? 0xffffff : this.enemyColor;

    if (this.enemyType === 'dragon') {
      // Dragon: large dark red shape with wings
      g.fillStyle(color);
      g.fillEllipse(0, 0, s, h);
      // Wings
      g.fillStyle(0x5a0000, 0.8);
      g.fillTriangle(-s*0.6, -h*0.2, -s*1.1, -h*0.9, -s*0.1, -h*0.5);
      g.fillTriangle(s*0.6, -h*0.2, s*1.1, -h*0.9, s*0.1, -h*0.5);
      // Eyes
      g.fillStyle(0xffff00); g.fillCircle(-s*0.18, -h*0.15, 4*this.scale); g.fillCircle(s*0.18, -h*0.15, 4*this.scale);
      g.fillStyle(0x000000); g.fillCircle(-s*0.18, -h*0.15, 2*this.scale); g.fillCircle(s*0.18, -h*0.15, 2*this.scale);
    } else {
      // Slime: rounded rect body
      g.fillStyle(color);
      g.fillRoundedRect(-s/2, -h/2, s, h, s * 0.3);
      // Shine
      g.fillStyle(0xffffff, 0.25);
      g.fillEllipse(-s*0.15, -h*0.25, s*0.3, h*0.2);
      // Eyes
      g.fillStyle(0xffffff); g.fillCircle(-s*0.18, -h*0.08, 5); g.fillCircle(s*0.18, -h*0.08, 5);
      g.fillStyle(0x000000); g.fillCircle(-s*0.18, -h*0.08, 3); g.fillCircle(s*0.18, -h*0.08, 3);
    }
  }

  _drawHpBar() {
    const w = CONFIG.CELL * this.scale;
    const pct = Math.max(0, this.hp / this.maxHp);
    const barY = -Math.floor(CONFIG.CELL * 0.45 * this.scale) - 8;

    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x220000, 0.8);
    this.hpBarBg.fillRect(-w/2, barY, w, 6);

    this.hpBarFill.clear();
    const barColor = pct > 0.5 ? 0x00cc00 : pct > 0.25 ? 0xcccc00 : 0xcc0000;
    this.hpBarFill.fillStyle(barColor);
    this.hpBarFill.fillRect(-w/2, barY, w * pct, 6);
  }

  _startMoving() {
    this._moveToNext();
  }

  _moveToNext() {
    if (this.isDead || this.reachedEnd) return;
    this.pathIndex++;
    if (this.pathIndex >= CONFIG.PATH.length) {
      this.reachedEnd = true;
      this.scene.enemyReachedEnd(this);
      this.destroy();
      return;
    }

    const [nc, nr] = CONFIG.PATH[this.pathIndex];
    const tx = nc * CONFIG.CELL + CONFIG.CELL / 2;
    const ty = nr * CONFIG.CELL + CONFIG.CELL / 2;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, tx, ty);
    const duration = (dist / this.speed) * 1000;

    this.tween = this.scene.tweens.add({
      targets: this.container,
      x: tx, y: ty,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.x = tx; this.y = ty;
        this._moveToNext();
      }
    });
  }

  update(time, delta) {
    if (this.isDead || this.reachedEnd) return;
    // Sync position from container
    this.x = this.container.x;
    this.y = this.container.y;

    // Hit flash decay
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= delta;
      if (this.hitFlashTimer <= 0) {
        this.hitFlashTimer = 0;
        this._drawBody();
      }
    }
    this._drawHpBar();
  }

  takeDamage(amount, ignoresArmor = false) {
    if (this.isDead) return;
    // Armor check: armored enemies take 0 from archer unless ignoresArmor
    if (this.hasArmor && !ignoresArmor) return;

    this.hp -= amount;
    this.hitFlashTimer = 100;
    this._drawBody();

    if (this.hp <= 0) {
      this.isDead = true;
      this.scene.enemyKilled(this);
      this.destroy();
    }
  }

  destroy() {
    if (this.tween) this.tween.stop();
    if (this.container) this.container.destroy();
  }
}
