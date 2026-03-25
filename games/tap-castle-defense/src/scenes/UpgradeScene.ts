import Phaser from 'phaser';
import { UpgradeOption, UpgradeState } from '../config/weapons';

export interface UpgradeSceneData {
  wave: number;
  upgradeState: UpgradeState;
  options: UpgradeOption[];
  onChosen: (option: UpgradeOption) => void;
}

export class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradeScene' });
  }

  create(data: UpgradeSceneData): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.78);
    overlay.fillRect(0, 0, W, H);

    // Panel background
    const panelW = Math.min(W * 0.92, 540);
    const panelH = H * 0.82;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1205, 0.97);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 16);
    panel.lineStyle(2, 0xf5c842, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 16);

    // Header
    this.add.text(W / 2, panelY + 28, `웨이브 ${data.wave} 클리어!`, {
      fontSize: '26px',
      color: '#f5c842',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(W / 2, panelY + 60, '강화를 선택하세요', {
      fontSize: '15px',
      color: '#ccaa44',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Stars decoration
    this.add.text(W / 2, panelY + 82, '★ ★ ★', {
      fontSize: '18px',
      color: '#f5c842',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Three upgrade cards
    const cardW = panelW * 0.82;
    const cardH = (panelH - 160) / 3 - 12;
    const cardX = W / 2 - cardW / 2;
    const startY = panelY + 116;

    data.options.forEach((opt, i) => {
      const cy = startY + i * (cardH + 12);
      this.createUpgradeCard(opt, cardX, cy, cardW, cardH, data, W);
    });

    // Current weapon indicator
    const spec = { arrow: '화살', fire: '화염', ice: '빙결', lightning: '번개', poison: '독' };
    this.add.text(W / 2, panelY + panelH - 30, `현재 무기: ${spec[data.upgradeState.currentWeapon] ?? data.upgradeState.currentWeapon}`, {
      fontSize: '12px',
      color: '#888866',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  private createUpgradeCard(
    opt: UpgradeOption,
    x: number,
    y: number,
    w: number,
    h: number,
    data: UpgradeSceneData,
    W: number,
  ): void {
    const cardBg = this.add.graphics();
    const normalStyle = () => {
      cardBg.clear();
      cardBg.fillStyle(0x2a1f0a, 1);
      cardBg.fillRoundedRect(x, y, w, h, 10);
      cardBg.lineStyle(2, 0x6a5010, 1);
      cardBg.strokeRoundedRect(x, y, w, h, 10);
    };
    const hoverStyle = () => {
      cardBg.clear();
      cardBg.fillStyle(0x3d2d10, 1);
      cardBg.fillRoundedRect(x, y, w, h, 10);
      cardBg.lineStyle(2, 0xf5c842, 1);
      cardBg.strokeRoundedRect(x, y, w, h, 10);
    };
    normalStyle();

    const labelText = this.add.text(x + 16, y + h / 2 - 16, opt.label, {
      fontSize: '16px',
      color: '#f5c842',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const descText = this.add.text(x + 16, y + h / 2 + 12, opt.description, {
      fontSize: '11px',
      color: '#ccccaa',
      fontFamily: 'monospace',
      wordWrap: { width: w - 80 },
    }).setOrigin(0, 0.5);

    // Arrow indicator on right
    const arrow = this.add.text(x + w - 28, y + h / 2, '▶', {
      fontSize: '20px',
      color: '#6a5010',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const zone = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => {
      hoverStyle();
      labelText.setColor('#ffffff');
      arrow.setColor('#f5c842');
      this.tweens.add({ targets: arrow, x: x + w - 22, duration: 150, ease: 'Power1' });
    });
    zone.on('pointerout', () => {
      normalStyle();
      labelText.setColor('#f5c842');
      arrow.setColor('#6a5010');
      this.tweens.add({ targets: arrow, x: x + w - 28, duration: 150, ease: 'Power1' });
    });
    zone.on('pointerdown', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.time.delayedCall(200, () => {
        data.onChosen(opt);
        this.scene.stop();
      });
    });

    // Suppress unused variable warnings
    void descText;
    void W;
  }
}
