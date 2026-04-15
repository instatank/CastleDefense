// Tower: placeable defense structure with targeting and firing logic

class Tower {
  constructor(scene, col, row, type, cfg) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.type = type;
    this.cfg = cfg;
    this.upgraded = false;
    this.currentDamage = cfg.damage;
    this.currentRange = cfg.range;
    this.currentFireRate = cfg.fireRate;
    this.totalSpent = cfg.cost;
    this.lastFireTime = 0;
    this.target = null;

    const cx = col * CONFIG.CELL + CONFIG.CELL / 2;
    const cy = row * CONFIG.CELL + CONFIG.CELL / 2;
    this.x = cx; this.y = cy;

    this.gfx = scene.add.graphics().setDepth(4);
    this._draw();
  }

  _draw() {
    const g = this.gfx;
    g.clear();
    const { CELL } = CONFIG;
    const cx = this.col * CELL + CELL / 2;
    const cy = this.row * CELL + CELL / 2;
    const half = CELL / 2 - 4;

    if (this.type === 'archer') {
      // Brown base
      g.fillStyle(this.upgraded ? 0xd4891a : 0x8B4513);
      g.fillRect(cx - half, cy - half, half*2, half*2);
      // Darker turret
      g.fillStyle(this.upgraded ? 0xb36b10 : 0x5c2e0a);
      g.fillRect(cx - half*0.45, cy - half*0.9, half*0.9, half*0.9);
      // Arrow slit
      g.fillStyle(0x222222); g.fillRect(cx - 2, cy - half*0.85, 4, half*0.5);
    } else if (this.type === 'catapult') {
      // Grey base
      g.fillStyle(this.upgraded ? 0xaaaaaa : 0x777777);
      g.fillRect(cx - half, cy - half, half*2, half*2);
      // Arm
      g.lineStyle(4, this.upgraded ? 0xdddddd : 0x999999);
      g.lineBetween(cx, cy + half*0.4, cx, cy - half*0.8);
      // Bucket
      g.fillStyle(0x555555); g.fillCircle(cx, cy - half*0.8, 6);
      // Wheels
      g.fillStyle(0x333333); g.fillCircle(cx - half*0.7, cy + half*0.5, 7); g.fillCircle(cx + half*0.7, cy + half*0.5, 7);
    } else if (this.type === 'mage') {
      // Purple base
      g.fillStyle(this.upgraded ? 0xb44fec : 0x7B2FBE);
      g.fillRect(cx - half, cy - half, half*2, half*2);
      // Tower
      g.fillStyle(this.upgraded ? 0x9a30d4 : 0x5a1a8a);
      g.fillRect(cx - half*0.5, cy - half, half, half*1.4);
      // Orb
      g.fillStyle(this.upgraded ? 0xffaaff : 0xee88ff, 0.9);
      g.fillCircle(cx, cy - half*0.8, 9);
      g.fillStyle(0xffffff, 0.5); g.fillCircle(cx - 3, cy - half*0.8 - 3, 3);
      // Stars
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(cx - half*0.6, cy - half*0.3, 2); g.fillCircle(cx + half*0.6, cy - half*0.5, 2);
    }

    // Upgraded badge — manual 5-point star via fillPoints
    if (this.upgraded) {
      const sx = cx + half - 4, sy = cy - half + 4;
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 5 : 2.5;
        pts.push({ x: sx + Math.cos(angle) * r, y: sy + Math.sin(angle) * r });
      }
      g.fillStyle(0xf0c040); g.fillPoints(pts, true);
    }
  }

  upgrade() {
    if (this.upgraded) return;
    this.upgraded = true;
    this.currentDamage = this.cfg.damage * CONFIG.UPGRADE_DAMAGE_MULT;
    this.currentRange = this.cfg.range * CONFIG.UPGRADE_RANGE_MULT;
    this.totalSpent += this.cfg.cost * 2;
    this._draw();
  }

  update(time, delta, enemies) {
    if (enemies.length === 0) return;
    if (time - this.lastFireTime < this.currentFireRate) return;

    // Find nearest enemy in range
    const rangePx = this.currentRange * CONFIG.CELL;
    let nearest = null, nearDist = Infinity;

    enemies.forEach(e => {
      if (e.isDead || e.reachedEnd) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (dist <= rangePx && dist < nearDist) { nearest = e; nearDist = dist; }
    });

    if (!nearest) return;

    this.lastFireTime = time;
    const proj = new Projectile(this.scene, this, nearest);
    this.scene.projectiles.push(proj);
  }

  destroy() {
    this.gfx.destroy();
  }
}
