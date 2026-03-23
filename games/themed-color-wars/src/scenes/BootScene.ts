import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Asset loading will go here
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
