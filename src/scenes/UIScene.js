// UIScene: HUD overlay running parallel to GameScene — tower buttons, gold, lives, wave info

class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.selectedTowerType = null;
    this.selectedTower = null;
    this.waveActive = false;
    this.topBarH = 48;
    this.botBarH = 64;
    const { width, height } = this.scale;

    this._buildTopBar(width);
    this._buildBottomBar(width, height);
    this._buildInfoPanel(width, height);
    this._listenEvents();
    this._updateGold(CONFIG.START_GOLD);
    this._updateLives(CONFIG.START_LIVES);
    this._updateWave(0);
  }

  _buildTopBar(width) {
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.92); bg.fillRect(0, 0, width, this.topBarH);
    bg.lineStyle(2, 0x444466); bg.lineBetween(0, this.topBarH, width, this.topBarH);

    // Wave label
    this.waveTxt = this.add.text(12, 14, 'Wave: 0 / 20', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#ffffff'
    });

    // Gold
    this.goldIcon = this.add.text(width/2 - 60, 14, '💰', { fontSize: '18px' });
    this.goldTxt = this.add.text(width/2 - 36, 14, '150', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#f0c040'
    });

    // Lives
    this.livesContainer = this.add.container(width - 130, 10);
    this.livesGfx = [];
    for (let i = 0; i < CONFIG.START_LIVES; i++) {
      const h = this.add.text(i * 32, 0, '❤', { fontSize: '22px' });
      this.livesGfx.push(h);
      this.livesContainer.add(h);
    }

    // Start wave button
    this.startBtnBg = this.add.graphics();
    this._drawStartBtn(false);
    this.startBtnZone = this.add.zone(width - 220, 8, 80, 32).setInteractive({ useHandCursor: true });
    this.startBtnTxt = this.add.text(width - 260, 14, 'Start Wave', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#ffffff'
    });
    this.startBtnZone.on('pointerdown', () => {
      if (this.waveActive) return;
      this.gameScene.startWave();
    });
    this.startBtnZone.on('pointerover', () => { if (!this.waveActive) this._drawStartBtn(true); });
    this.startBtnZone.on('pointerout', () => { this._drawStartBtn(false); });
  }

  _drawStartBtn(hover) {
    const { width } = this.scale;
    this.startBtnBg.clear();
    const color = this.waveActive ? 0x444444 : (hover ? 0x5dab3a : 0x3d8b22);
    this.startBtnBg.fillStyle(color);
    this.startBtnBg.fillRoundedRect(width - 266, 8, 96, 32, 6);
    this.startBtnBg.lineStyle(1, this.waveActive ? 0x333333 : 0x8bc34a);
    this.startBtnBg.strokeRoundedRect(width - 266, 8, 96, 32, 6);
  }

  _buildBottomBar(width, height) {
    const y = height - this.botBarH;
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.92); bg.fillRect(0, y, width, this.botBarH);
    bg.lineStyle(2, 0x444466); bg.lineBetween(0, y, width, y);

    this.towerBtns = {};
    const types = ['archer', 'catapult', 'mage'];
    const startX = 20;

    types.forEach((type, i) => {
      const cfg = CONFIG.TOWERS[type];
      const bx = startX + i * 180;
      const by = y + 8;
      const bw = 168, bh = 48;

      const btn = this.add.graphics();
      this.towerBtns[type] = { bg: btn, selected: false };

      this._drawTowerBtn(type, false);

      const zone = this.add.zone(bx + bw/2, by + bh/2, bw, bh).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this._onTowerBtnClick(type));
      zone.on('pointerover', () => { if (!this.towerBtns[type].selected) this._drawTowerBtn(type, true); });
      zone.on('pointerout',  () => { if (!this.towerBtns[type].selected) this._drawTowerBtn(type, false); });

      // Label
      this.add.text(bx + 8, by + 4, `${cfg.label}`, {
        fontSize: '14px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold'
      });
      this.add.text(bx + 8, by + 22, cfg.desc, {
        fontSize: '11px', fontFamily: 'sans-serif', color: '#aaaacc'
      });
      this.add.text(bx + 8, by + 34, `${cfg.cost}g`, {
        fontSize: '13px', fontFamily: 'sans-serif', color: '#f0c040'
      });
    });

    // ESC hint
    this.add.text(width - 160, y + 18, 'ESC to cancel', {
      fontSize: '12px', fontFamily: 'sans-serif', color: '#666688'
    });
  }

  _drawTowerBtn(type, hover) {
    const { height } = this.scale;
    const types = ['archer', 'catapult', 'mage'];
    const i = types.indexOf(type);
    const bx = 20 + i * 180;
    const by = height - this.botBarH + 8;
    const bw = 168, bh = 48;
    const sel = this.towerBtns[type].selected;

    const g = this.towerBtns[type].bg;
    g.clear();
    const fill = sel ? 0x6b5a00 : (hover ? 0x2a2a4e : 0x1e1e3a);
    g.fillStyle(fill); g.fillRoundedRect(bx, by, bw, bh, 6);
    g.lineStyle(2, sel ? 0xf0c040 : 0x444466);
    g.strokeRoundedRect(bx, by, bw, bh, 6);
  }

  _onTowerBtnClick(type) {
    const prev = this.selectedTowerType;
    // Deselect all
    Object.keys(this.towerBtns).forEach(t => {
      this.towerBtns[t].selected = false;
      this._drawTowerBtn(t, false);
    });

    if (prev === type) {
      // Toggle off
      this.selectedTowerType = null;
      this.gameScene.cancelPlacement();
    } else {
      this.selectedTowerType = type;
      this.towerBtns[type].selected = true;
      this._drawTowerBtn(type, false);
      this.gameScene.selectTowerType(type);
    }
    this._hideInfoPanel();
  }

  _buildInfoPanel(width, height) {
    const pw = 220, ph = 130;
    const px = width / 2 - pw / 2;
    const py = height - this.botBarH - ph - 8;

    this.infoPanel = this.add.container(px, py).setVisible(false).setDepth(30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2e, 0.95); panelBg.fillRoundedRect(0, 0, pw, ph, 8);
    panelBg.lineStyle(2, 0x6644aa); panelBg.strokeRoundedRect(0, 0, pw, ph, 8);

    this.infoTitle = this.add.text(10, 10, '', { fontSize: '14px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold' });
    this.infoStats = this.add.text(10, 28, '', { fontSize: '12px', fontFamily: 'sans-serif', color: '#aaaacc' });

    // Upgrade button
    this.upgBtnBg = this.add.graphics();
    this.upgBtnBg.fillStyle(0x1155aa); this.upgBtnBg.fillRoundedRect(10, 72, 90, 28, 6);
    this.upgBtnTxt = this.add.text(55, 86, 'Upgrade', { fontSize: '12px', fontFamily: 'sans-serif', color: '#ffffff' }).setOrigin(0.5);
    this.upgCostTxt = this.add.text(55, 98, '', { fontSize: '10px', fontFamily: 'sans-serif', color: '#f0c040' }).setOrigin(0.5);
    const upgZone = this.add.zone(55, 82, 90, 28).setInteractive({ useHandCursor: true });
    upgZone.on('pointerdown', () => { if (this.selectedTower) this.gameScene.upgradeTower(this.selectedTower); });

    // Sell button
    this.sellBtnBg = this.add.graphics();
    this.sellBtnBg.fillStyle(0x993333); this.sellBtnBg.fillRoundedRect(120, 72, 90, 28, 6);
    this.sellBtnTxt = this.add.text(165, 86, 'Sell', { fontSize: '12px', fontFamily: 'sans-serif', color: '#ffffff' }).setOrigin(0.5);
    this.sellRefundTxt = this.add.text(165, 98, '', { fontSize: '10px', fontFamily: 'sans-serif', color: '#f0c040' }).setOrigin(0.5);
    const sellZone = this.add.zone(165, 82, 90, 28).setInteractive({ useHandCursor: true });
    sellZone.on('pointerdown', () => { if (this.selectedTower) { this.gameScene.sellTower(this.selectedTower); this.selectedTower = null; } });

    this.infoPanel.add([panelBg, this.infoTitle, this.infoStats, this.upgBtnBg, this.upgBtnTxt, this.upgCostTxt, this.sellBtnBg, this.sellBtnTxt, this.sellRefundTxt, upgZone, sellZone]);
  }

  _showInfoPanel(tower) {
    this.selectedTower = tower;
    const cfg = tower.cfg;
    this.infoTitle.setText(`${cfg.label}${tower.upgraded ? ' (Upgraded)' : ''}`);
    this.infoStats.setText(`DMG: ${tower.currentDamage}  RNG: ${tower.currentRange}  Rate: ${tower.currentFireRate}ms`);

    const upgCost = cfg.cost * 2;
    const refund = Math.floor(tower.totalSpent * CONFIG.SELL_REFUND);

    this.upgCostTxt.setText(tower.upgraded ? 'Max' : `${upgCost}g`);
    this.sellRefundTxt.setText(`+${refund}g`);

    // Dim upgrade button if maxed or insufficient gold
    const canUpg = !tower.upgraded && this.gameScene.gold >= upgCost;
    this.upgBtnBg.clear();
    this.upgBtnBg.fillStyle(tower.upgraded ? 0x333355 : (canUpg ? 0x1155aa : 0x553333));
    this.upgBtnBg.fillRoundedRect(10, 72, 90, 28, 6);

    this.infoPanel.setVisible(true);
  }

  _hideInfoPanel() {
    this.infoPanel.setVisible(false);
    this.selectedTower = null;
  }

  _listenEvents() {
    const gs = this.gameScene;

    gs.events.on('goldChanged', (g) => this._updateGold(g));
    gs.events.on('livesChanged', (l) => this._updateLives(l));
    gs.events.on('waveStarted', (w) => {
      this.waveActive = true;
      this._updateWave(w);
      this._drawStartBtn(false);
      this.startBtnTxt.setText('In Progress');
    });
    gs.events.on('waveComplete', (w) => {
      this.waveActive = false;
      this._drawStartBtn(false);
      this.startBtnTxt.setText('Start Wave');
    });
    gs.events.on('towerSelected', (t) => {
      this._showInfoPanel(t);
      // Deselect placement
      Object.keys(this.towerBtns).forEach(ty => {
        this.towerBtns[ty].selected = false;
        this._drawTowerBtn(ty, false);
      });
      this.selectedTowerType = null;
    });
    gs.events.on('towerDeselected', () => this._hideInfoPanel());
    gs.events.on('towerPlaced', (t) => {
      // Keep placement mode on for multi-place
    });
    gs.events.on('flashGold', () => this._flashGold());
  }

  _updateGold(g) {
    this.goldTxt.setText(String(g));
  }

  _updateLives(l) {
    this.livesGfx.forEach((h, i) => h.setVisible(i < l));
  }

  _updateWave(w) {
    this.waveTxt.setText(`Wave: ${w} / ${CONFIG.MAX_WAVES}`);
  }

  _flashGold() {
    this.goldTxt.setColor('#ff4444');
    this.time.delayedCall(400, () => this.goldTxt.setColor('#f0c040'));
  }
}
