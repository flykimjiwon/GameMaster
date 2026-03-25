import Phaser from 'phaser';
import localforage from 'localforage';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  async create(): Promise<void> {
    const W = this.scale.width;
    const H = this.scale.height;

    // Sky gradient background
    this.drawBackground(W, H);

    // Title
    this.add.text(W / 2, H * 0.18, '⚔', {
      fontSize: '72px',
      color: '#ffdd44',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.3, '원탭 캐슬 디펜스', {
      fontSize: '36px',
      color: '#f5c842',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#4a1a00',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.39, 'ONE TAP CASTLE DEFENSE', {
      fontSize: '14px',
      color: '#cc9922',
      fontFamily: 'monospace',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Records
    const bestWave = (await localforage.getItem<number>('bestWave')) ?? 0;
    const totalKills = (await localforage.getItem<number>('totalKills')) ?? 0;
    const critRatio = (await localforage.getItem<number>('critRatio')) ?? 0;

    this.add.text(W / 2, H * 0.5, '── 기록 ──', {
      fontSize: '13px',
      color: '#888866',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.565, `최고 웨이브: ${bestWave}`, {
      fontSize: '16px',
      color: '#ffcc44',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.615, `총 처치수: ${totalKills}`, {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.655, `치명타율: ${(critRatio * 100).toFixed(1)}%`, {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // How to play
    this.add.text(W / 2, H * 0.73, '── 조작법 ──', {
      fontSize: '13px',
      color: '#888866',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.78, '화면을 탭/클릭하면 화살 발사\n적 머리 근처 타격 = 치명타 (2배 피해)\n웨이브 클리어 → 강화 선택', {
      fontSize: '12px',
      color: '#ccccaa',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Start button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x8B0000, 1);
    btnBg.fillRoundedRect(W / 2 - 100, H * 0.875 - 25, 200, 50, 10);
    btnBg.lineStyle(2, 0xf5c842, 1);
    btnBg.strokeRoundedRect(W / 2 - 100, H * 0.875 - 25, 200, 50, 10);

    const btnText = this.add.text(W / 2, H * 0.875, '게임 시작', {
      fontSize: '22px',
      color: '#f5c842',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const btnZone = this.add.zone(W / 2, H * 0.875, 200, 50).setInteractive();
    btnZone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xcc0000, 1);
      btnBg.fillRoundedRect(W / 2 - 100, H * 0.875 - 25, 200, 50, 10);
      btnBg.lineStyle(2, 0xffee88, 1);
      btnBg.strokeRoundedRect(W / 2 - 100, H * 0.875 - 25, 200, 50, 10);
      btnText.setScale(1.05);
    });
    btnZone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x8B0000, 1);
      btnBg.fillRoundedRect(W / 2 - 100, H * 0.875 - 25, 200, 50, 10);
      btnBg.lineStyle(2, 0xf5c842, 1);
      btnBg.strokeRoundedRect(W / 2 - 100, H * 0.875 - 25, 200, 50, 10);
      btnText.setScale(1.0);
    });
    btnZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('GameScene'));
    });

    // Floating particles
    this.createParticles(W, H);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private drawBackground(W: number, H: number): void {
    const bg = this.add.graphics();

    // Dark sky gradient (approximated with rects)
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(Phaser.Math.Linear(10, 40, t));
      const g2 = Math.floor(Phaser.Math.Linear(10, 20, t));
      const b = Math.floor(Phaser.Math.Linear(30, 60, t));
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g2, b), 1);
      bg.fillRect(0, (H / steps) * i, W, H / steps + 1);
    }

    // Stars
    bg.fillStyle(0xffffff, 1);
    for (let i = 0; i < 80; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H * 0.6;
      const ss = Math.random() * 2 + 0.5;
      bg.fillCircle(sx, sy, ss);
    }

    // Mountains silhouette
    bg.fillStyle(0x1a1225, 1);
    const pts: number[] = [];
    pts.push(0, H);
    let mx = 0;
    while (mx < W + 60) {
      pts.push(mx, H * (0.55 + Math.random() * 0.18));
      mx += 40 + Math.random() * 60;
    }
    pts.push(W, H);
    bg.fillPoints(
      pts.reduce<Phaser.Math.Vector2[]>((acc, _, i) => {
        if (i % 2 === 0) acc.push(new Phaser.Math.Vector2(pts[i], pts[i + 1]));
        return acc;
      }, []),
      true,
    );

    // Ground
    bg.fillStyle(0x2a1f10, 1);
    bg.fillRect(0, H * 0.85, W, H * 0.15);
    bg.fillStyle(0x3a2a14, 1);
    bg.fillRect(0, H * 0.85, W, 4);
  }

  private createParticles(W: number, H: number): void {
    // Floating embers
    for (let i = 0; i < 12; i++) {
      const ember = this.add.graphics();
      ember.fillStyle(0xff8800, 0.7);
      ember.fillCircle(0, 0, 2);
      ember.setPosition(Math.random() * W, H * 0.5 + Math.random() * H * 0.4);

      this.tweens.add({
        targets: ember,
        y: ember.y - 200 - Math.random() * 200,
        x: ember.x + Phaser.Math.Between(-80, 80),
        alpha: 0,
        duration: 3000 + Math.random() * 3000,
        delay: Math.random() * 3000,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => {
          ember.setPosition(Math.random() * W, H * 0.9);
          ember.setAlpha(0.7);
        },
      });
    }
  }
}
