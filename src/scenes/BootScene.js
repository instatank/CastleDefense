// BootScene: generates all programmatic textures and transitions to MenuScene

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this._makeTile('grassTile', 48, 48, 0x4a7c3f, 0x3d6b34);
    this._makeTile('pathTile', 48, 48, 0xc8a96e, 0xb8935a);
    this._makeGate();
    this.scene.start('MenuScene');
  }

  _makeTile(key, w, h, fill, border) {
    const rt = this.add.renderTexture(0, 0, w, h);
    const g = this.add.graphics();
    g.fillStyle(fill); g.fillRect(0, 0, w, h);
    g.lineStyle(1, border, 0.5); g.strokeRect(0, 0, w, h);
    rt.draw(g, 0, 0);
    rt.saveTexture(key);
    g.destroy();
  }

  _makeGate() {
    const rt = this.add.renderTexture(0, 0, 48, 96);
    const g = this.add.graphics();
    // Castle wall
    g.fillStyle(0x888888); g.fillRect(0, 0, 48, 96);
    g.fillStyle(0x555555);
    // Battlements
    for (let i = 0; i < 3; i++) { g.fillRect(i * 18, 0, 12, 16); }
    // Gate arch
    g.fillStyle(0x222222); g.fillRect(10, 40, 28, 56);
    g.fillStyle(0x8B4513); g.fillRect(10, 40, 28, 4); // gate top bar
    rt.draw(g, 0, 0);
    rt.saveTexture('castleGate');
    g.destroy();
  }
}
