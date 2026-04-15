// WinScene: displayed after surviving all 20 waves, shows total gold earned

class WinScene extends Phaser.Scene {
  constructor() { super('WinScene'); }

  init(data) {
    this.totalGold = data.gold || 0;
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1a0a, 0x0a1a0a, 0x1a2e1a, 0x1a2e1a, 1);
    bg.fillRect(0, 0, width, height);

    // Victory stars
    for (let i = 0; i < 30; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height * 0.5;
      const g = this.add.graphics();
      g.fillStyle(0xf0c040, Math.random() * 0.8 + 0.2);
      g.fillCircle(sx, sy, Math.random() * 3 + 1);
    }

    // Trophy
    const t = this.add.graphics();
    t.fillStyle(0xf0c040);
    t.fillRect(width/2 - 30, height/2 - 130, 60, 50);
    t.fillRect(width/2 - 40, height/2 - 130, 10, 20);
    t.fillRect(width/2 + 30, height/2 - 130, 10, 20);
    t.fillRect(width/2 - 12, height/2 - 82, 24, 16);
    t.fillRect(width/2 - 24, height/2 - 68, 48, 8);

    this.add.text(width/2, height/2 - 40, 'VICTORY!', {
      fontSize: '64px', fontFamily: 'serif', color: '#f0c040',
      stroke: '#8B4513', strokeThickness: 6,
      shadow: { color: '#ffff00', blur: 20, fill: true }
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 + 30, 'The castle stands proud!', {
      fontSize: '22px', fontFamily: 'sans-serif', color: '#aaccaa'
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 + 64, `Total Gold Earned: ${this.totalGold}`, {
      fontSize: '20px', fontFamily: 'sans-serif', color: '#f0c040'
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 + 96, 'All 20 waves survived!', {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#66aa66'
    }).setOrigin(0.5);

    // Play Again
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1a5c1a); btnBg.fillRoundedRect(width/2 - 90, height/2 + 128, 180, 52, 10);
    btnBg.lineStyle(2, 0x4aaa4a); btnBg.strokeRoundedRect(width/2 - 90, height/2 + 128, 180, 52, 10);
    this.add.text(width/2, height/2 + 154, 'Play Again', {
      fontSize: '24px', fontFamily: 'serif', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const zone = this.add.zone(width/2, height/2 + 154, 180, 52).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0x267a26); btnBg.fillRoundedRect(width/2 - 90, height/2 + 128, 180, 52, 10); btnBg.lineStyle(2, 0x6acc6a); btnBg.strokeRoundedRect(width/2 - 90, height/2 + 128, 180, 52, 10); });
    zone.on('pointerout', () => { btnBg.clear(); btnBg.fillStyle(0x1a5c1a); btnBg.fillRoundedRect(width/2 - 90, height/2 + 128, 180, 52, 10); btnBg.lineStyle(2, 0x4aaa4a); btnBg.strokeRoundedRect(width/2 - 90, height/2 + 128, 180, 52, 10); });
    zone.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MenuScene'));
    });

    this.cameras.main.fadeIn(600);
  }
}
