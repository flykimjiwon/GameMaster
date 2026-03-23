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
    this.hpText = this.add.text(20, 8, 'HP', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
    });

    // XP bar
    this.xpBar = this.add.graphics();

    // Timer
    this.timerText = this.add.text(GAME_CONFIG.WIDTH / 2, 16, '3:00', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // Level
    this.levelText = this.add.text(GAME_CONFIG.WIDTH - 20, 8, 'Lv.1', {
      fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // Score
    this.scoreText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 20, 'SCORE: 0', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5, 1);

    // Boss HP bar (hidden until boss spawns)
    this.bossBar = this.add.graphics();
    this.bossLabel = this.add.text(GAME_CONFIG.WIDTH / 2, 56, 'KING SLIME', {
      fontSize: '12px', color: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setVisible(false);
  }

  update(): void {
    if (!this.gameScene.player) return;
    const player = this.gameScene.player;

    // HP bar
    this.hpBar.clear();
    const hpWidth = 150;
    const hpHeight = 16;
    const hpX = 20;
    const hpY = 28;
    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(hpX, hpY, hpWidth, hpHeight);
    const hpRatio = player.hp / player.maxHp;
    const hpColor = hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff4444;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(hpX, hpY, hpWidth * hpRatio, hpHeight);
    this.hpBar.lineStyle(1, 0xffffff, 0.3);
    this.hpBar.strokeRect(hpX, hpY, hpWidth, hpHeight);
    this.hpText.setText(`HP ${player.hp}/${player.maxHp}`);

    // XP bar
    this.xpBar.clear();
    const xpY = hpY + hpHeight + 4;
    const xpRequired = 10 * player.level;
    const xpRatio = Math.min(player.xp / xpRequired, 1);
    this.xpBar.fillStyle(0x222222, 1);
    this.xpBar.fillRect(hpX, xpY, hpWidth, 6);
    this.xpBar.fillStyle(0x4488ff, 1);
    this.xpBar.fillRect(hpX, xpY, hpWidth * xpRatio, 6);

    // Timer
    const remaining = Math.max(0, GAME_CONFIG.GAME_DURATION - this.gameScene.elapsedTime);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

    // Level
    this.levelText.setText(`Lv.${player.level}`);

    // Score
    this.scoreText.setText(`SCORE: ${player.killCount * 10}`);

    // Boss HP bar
    this.bossBar.clear();
    const boss = this.gameScene.waveSystem?.boss;
    if (boss && boss.active) {
      this.bossLabel.setVisible(true);
      const bw = 300;
      const bh = 12;
      const bx = (GAME_CONFIG.WIDTH - bw) / 2;
      const by = 70;
      this.bossBar.fillStyle(0x333333, 1);
      this.bossBar.fillRect(bx, by, bw, bh);
      this.bossBar.fillStyle(0xff2222, 1);
      this.bossBar.fillRect(bx, by, bw * (boss.hp / boss.maxHp), bh);
      this.bossBar.lineStyle(1, 0xffffff, 0.3);
      this.bossBar.strokeRect(bx, by, bw, bh);
    } else {
      this.bossLabel.setVisible(false);
    }
  }
}
