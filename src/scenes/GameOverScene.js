// GameOverScene: displayed when lives reach zero, shows wave reached and play again option

class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.waveReached = data.wave || 0;
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.95); bg.fillRect(0, 0, width, height);

    // Skull decoration
    const skull = this.add.graphics();
    skull.fillStyle(0xcccccc);
    skull.fillCircle(width/2, height/2 - 120, 50);
    skull.fillRect(width/2 - 25, height/2 - 80, 50, 40);
    skull.fillStyle(0x0a0a1a);
    skull.fillCircle(width/2 - 16, height/2 - 128, 14);
    skull.fillCircle(width/2 + 16, height/2 - 128, 14);
    skull.fillRect(width/2 - 20, height/2 - 100, 8, 20);
    skull.fillRect(width/2 - 4, height/2 - 100, 8, 20);
    skull.fillRect(width/2 + 12, height/2 - 100, 8, 20);

    this.add.text(width/2, height/2 - 50, 'GAME OVER', {
      fontSize: '56px', fontFamily: 'serif', color: '#cc2222',
      stroke: '#000000', strokeThickness: 6,
      shadow: { color: '#ff0000', blur: 20, fill: true }
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 + 20, `You survived to Wave ${this.waveReached} of ${CONFIG.MAX_WAVES}`, {
      fontSize: '22px', fontFamily: 'sans-serif', color: '#aaaacc'
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 + 56, 'The castle has fallen!', {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#666688'
    }).setOrigin(0.5);

    // Play Again button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x8B1a1a); btnBg.fillRoundedRect(width/2 - 90, height/2 + 90, 180, 52, 10);
    btnBg.lineStyle(2, 0xcc4444); btnBg.strokeRoundedRect(width/2 - 90, height/2 + 90, 180, 52, 10);
    this.add.text(width/2, height/2 + 116, 'Play Again', {
      fontSize: '24px', fontFamily: 'serif', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const zone = this.add.zone(width/2, height/2 + 116, 180, 52).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0xaa2222); btnBg.fillRoundedRect(width/2 - 90, height/2 + 90, 180, 52, 10); btnBg.lineStyle(2, 0xff6666); btnBg.strokeRoundedRect(width/2 - 90, height/2 + 90, 180, 52, 10); });
    zone.on('pointerout', () => { btnBg.clear(); btnBg.fillStyle(0x8B1a1a); btnBg.fillRoundedRect(width/2 - 90, height/2 + 90, 180, 52, 10); btnBg.lineStyle(2, 0xcc4444); btnBg.strokeRoundedRect(width/2 - 90, height/2 + 90, 180, 52, 10); });
    zone.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MenuScene'));
    });

    this.cameras.main.fadeIn(400);
  }
}
