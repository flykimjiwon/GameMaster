import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import type { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private xpBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private bossBar!: Phaser.GameObjects.Graphics;
  private bossLabel!: Phaser.GameObjects.Text;
  private gameScene!: GameScene;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    // HP bar background
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(20, 8, '면역력', {
      fontSize: '13px', color: '#00E5FF', fontFamily: 'monospace',
    });

    // XP bar
    this.xpBar = this.add.graphics();

    // Timer — 체온 느낌
    this.timerText = this.add.text(GAME_CONFIG.WIDTH / 2, 16, '3:00', {
      fontSize: '20px', color: '#00E5FF', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // Level
    this.levelText = this.add.text(GAME_CONFIG.WIDTH - 20, 8, 'Lv.1', {
      fontSize: '16px', color: '#00E5FF', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // Score
    this.scoreText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 20, '제거: 0', {
      fontSize: '14px', color: '#00E5FF', fontFamily: 'monospace',
    }).setOrigin(0.5, 1);

    // Boss HP bar (hidden until boss spawns)
    this.bossBar = this.add.graphics();
    this.bossLabel = this.add.text(GAME_CONFIG.WIDTH / 2, 56, '슈퍼박테리아', {
      fontSize: '12px', color: '#FF6D00', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setVisible(false);
  }

  update(): void {
    if (!this.gameScene.player) return;
    const player = this.gameScene.player;

    // HP bar — 시안→파랑 그라데이션 (면역력)
    this.hpBar.clear();
    const hpWidth = 150;
    const hpHeight = 16;
    const hpX = 20;
    const hpY = 28;
    this.hpBar.fillStyle(0x0A1A22, 1);
    this.hpBar.fillRect(hpX, hpY, hpWidth, hpHeight);
    const hpRatio = player.hp / player.maxHp;
    // 시안→파랑 그라데이션: high=cyan, mid=gold, low=red pulse
    const hpColor = hpRatio > 0.6 ? 0x00E5FF : hpRatio > 0.3 ? 0xFFD600 : 0xFF1744;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(hpX, hpY, hpWidth * hpRatio, hpHeight);
    // inner highlight stripe
    this.hpBar.fillStyle(0xffffff, 0.12);
    this.hpBar.fillRect(hpX, hpY, hpWidth * hpRatio, hpHeight / 2);
    this.hpBar.lineStyle(1, 0x00E5FF, 0.5);
    this.hpBar.strokeRect(hpX, hpY, hpWidth, hpHeight);
    this.hpText.setText(`면역력 ${player.hp}/${player.maxHp}`);

    // XP bar — 면역 에너지 (시안)
    this.xpBar.clear();
    const xpY = hpY + hpHeight + 4;
    const xpRequired = 10 * player.level;
    const xpRatio = Math.min(player.xp / xpRequired, 1);
    this.xpBar.fillStyle(0x0A1A22, 1);
    this.xpBar.fillRect(hpX, xpY, hpWidth, 6);
    this.xpBar.fillStyle(0x00E5FF, 0.9);
    this.xpBar.fillRect(hpX, xpY, hpWidth * xpRatio, 6);

    // Timer — 체온 느낌: 위험 시 빨강
    const remaining = Math.max(0, GAME_CONFIG.GAME_DURATION - this.gameScene.elapsedTime);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);
    const timerColor = remaining > 60 ? '#00E5FF' : remaining > 30 ? '#FFD600' : '#FF1744';
    this.timerText.setColor(timerColor);

    // Level
    this.levelText.setText(`Lv.${player.level}`);

    // Score
    this.scoreText.setText(`제거: ${player.killCount}`);

    // Boss HP bar
    this.bossBar.clear();
    const boss = this.gameScene.waveSystem?.boss;
    if (boss && boss.active) {
      this.bossLabel.setVisible(true);
      const bw = 300;
      const bh = 12;
      const bx = (GAME_CONFIG.WIDTH - bw) / 2;
      const by = 70;
      this.bossBar.fillStyle(0x1A0005, 1);
      this.bossBar.fillRect(bx, by, bw, bh);
      this.bossBar.fillStyle(0xFF6D00, 1);
      this.bossBar.fillRect(bx, by, bw * (boss.hp / boss.maxHp), bh);
      this.bossBar.lineStyle(1, 0xFFD600, 0.6);
      this.bossBar.strokeRect(bx, by, bw, bh);
    } else {
      this.bossLabel.setVisible(false);
    }
  }
}
