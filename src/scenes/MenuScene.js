// MenuScene: title screen with Play button

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    // Background gradient feel
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    // Castle silhouette
    const castle = this.add.graphics();
    castle.fillStyle(0x2a2a4e);
    castle.fillRect(width/2 - 80, height/2 + 20, 160, 120);
    for (let i = 0; i < 5; i++) { castle.fillRect(width/2 - 80 + i*40, height/2, 24, 30); }
    castle.fillRect(width/2 - 20, height/2 + 60, 40, 80);

    // Title
    this.add.text(width/2, 120, 'CASTLE', {
      fontSize: '72px', fontFamily: 'serif', color: '#f0c040',
      stroke: '#8B4513', strokeThickness: 6, shadow: { color: '#000', blur: 10, fill: true }
    }).setOrigin(0.5);

    this.add.text(width/2, 200, 'DEFENCE', {
      fontSize: '72px', fontFamily: 'serif', color: '#e88020',
      stroke: '#8B4513', strokeThickness: 6, shadow: { color: '#000', blur: 10, fill: true }
    }).setOrigin(0.5);

    this.add.text(width/2, 280, 'Protect your castle from the slime invasion!', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#aaaacc'
    }).setOrigin(0.5);

    // Play button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x4a7c3f); btnBg.fillRoundedRect(width/2 - 80, height/2 + 80, 160, 52, 12);
    btnBg.lineStyle(3, 0x8bc34a); btnBg.strokeRoundedRect(width/2 - 80, height/2 + 80, 160, 52, 12);
    const btnTxt = this.add.text(width/2, height/2 + 106, 'PLAY', {
      fontSize: '28px', fontFamily: 'serif', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.zone(width/2, height/2 + 106, 160, 52).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0x5d9e50); btnBg.fillRoundedRect(width/2 - 80, height/2 + 80, 160, 52, 12); btnBg.lineStyle(3, 0xaee571); btnBg.strokeRoundedRect(width/2 - 80, height/2 + 80, 160, 52, 12); });
    btn.on('pointerout', () => { btnBg.clear(); btnBg.fillStyle(0x4a7c3f); btnBg.fillRoundedRect(width/2 - 80, height/2 + 80, 160, 52, 12); btnBg.lineStyle(3, 0x8bc34a); btnBg.strokeRoundedRect(width/2 - 80, height/2 + 80, 160, 52, 12); });
    btn.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => { this.scene.start('GameScene'); this.scene.launch('UIScene'); });
    });

    // Wave info
    this.add.text(width/2, height - 40, '20 Waves • 3 Tower Types • Survive to Win', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#666688'
    }).setOrigin(0.5);
  }
}
