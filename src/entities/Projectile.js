// Projectile: travels from tower to enemy, applies damage with type-specific effects

class Projectile {
  constructor(scene, tower, target) {
    this.scene = scene;
    this.tower = tower;
    this.target = target;
    this.done = false;
    this.speed = 300;

    this.x = tower.x;
    this.y = tower.y;

    const colors = { archer: 0xf5deb3, catapult: 0x999999, mage: 0xdd88ff };
    const sizes  = { archer: 4, catapult: 7, mage: 5 };
    this.color = colors[tower.type] || 0xffffff;
    this.radius = sizes[tower.type] || 4;

    this.gfx = scene.add.graphics().setDepth(6);
    this._draw();
  }

  _draw() {
    this.gfx.clear();
    this.gfx.fillStyle(this.color);
    this.gfx.fillCircle(this.x, this.y, this.radius);
    // Mage orb glow
    if (this.tower.type === 'mage') {
      this.gfx.fillStyle(0xffffff, 0.3);
      this.gfx.fillCircle(this.x, this.y, this.radius + 3);
    }
  }

  update(time, delta) {
    if (this.done) return;

    if (this.target.isDead || this.target.reachedEnd) {
      this.done = true;
      this.gfx.destroy();
      return;
    }

    const tx = this.target.x, ty = this.target.y;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, tx, ty);
    const step = this.speed * (delta / 1000);

    if (dist <= step) {
      // Hit!
      this._applyDamage();
      this.done = true;
      this.gfx.destroy();
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
      this.x += Math.cos(angle) * step;
      this.y += Math.sin(angle) * step;
      this._draw();
    }
  }

  _applyDamage() {
    const { tower } = this;
    const ignoresArmor = tower.type === 'mage';

    if (tower.type === 'catapult') {
      // Splash: damage all enemies within 1 tile radius
      const splashRadius = CONFIG.CELL;
      this.scene.enemies.forEach(e => {
        if (e.isDead || e.reachedEnd) return;
        const d = Phaser.Math.Distance.Between(this.target.x, this.target.y, e.x, e.y);
        if (d <= splashRadius) e.takeDamage(tower.currentDamage, ignoresArmor);
      });
    } else {
      if (!this.target.isDead) this.target.takeDamage(tower.currentDamage, ignoresArmor);
    }
  }
}
