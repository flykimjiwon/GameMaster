import Phaser from 'phaser';
import { BattleLane } from '../objects/BattleLane';
import { StageConfig, WaveConfig } from '../config/stages';

export class WaveSystem {
  scene: Phaser.Scene;
  lane: BattleLane;
  stageConfig: StageConfig;
  currentWaveIndex: number = 0;
  private waveTimers: Phaser.Time.TimerEvent[] = [];
  private spawnTimers: Phaser.Time.TimerEvent[] = [];
  allWavesSpawned: boolean = false;
  private totalEnemiesSpawned: number = 0;

  onWaveStart: ((waveIndex: number, total: number) => void) | null = null;
  onAllWavesSpawned: (() => void) | null = null;

  constructor(scene: Phaser.Scene, lane: BattleLane, stageConfig: StageConfig) {
    this.scene = scene;
    this.lane = lane;
    this.stageConfig = stageConfig;
  }

  start(): void {
    this.allWavesSpawned = false;
    this.totalEnemiesSpawned = 0;

    for (let i = 0; i < this.stageConfig.waves.length; i++) {
      const wave = this.stageConfig.waves[i];
      const waveIndex = i;
      const timer = this.scene.time.delayedCall(wave.delay, () => {
        this.spawnWave(wave, waveIndex);
      });
      this.waveTimers.push(timer);
    }

    // Mark all waves spawned after last wave + spawning time
    const lastWave = this.stageConfig.waves[this.stageConfig.waves.length - 1];
    let lastWaveSpawnDuration = 0;
    for (const ec of lastWave.enemies) {
      lastWaveSpawnDuration = Math.max(lastWaveSpawnDuration, ec.count * ec.interval);
    }
    const totalTime = lastWave.delay + lastWaveSpawnDuration + 500;

    const doneTimer = this.scene.time.delayedCall(totalTime, () => {
      this.allWavesSpawned = true;
      if (this.onAllWavesSpawned) this.onAllWavesSpawned();
    });
    this.waveTimers.push(doneTimer);
  }

  private spawnWave(wave: WaveConfig, waveIndex: number): void {
    this.currentWaveIndex = waveIndex;
    if (this.onWaveStart) {
      this.onWaveStart(waveIndex + 1, this.stageConfig.waves.length);
    }

    let cumulativeDelay = 0;
    for (const enemyConfig of wave.enemies) {
      for (let i = 0; i < enemyConfig.count; i++) {
        const delay = cumulativeDelay + i * enemyConfig.interval;
        const config = { ...enemyConfig };
        const timer = this.scene.time.delayedCall(delay, () => {
          if (this.lane) {
            this.lane.spawnEnemy(config);
            this.totalEnemiesSpawned++;
          }
        });
        this.spawnTimers.push(timer);
      }
      cumulativeDelay += enemyConfig.count * enemyConfig.interval;
    }
  }

  isAllCleared(): boolean {
    return this.allWavesSpawned && this.lane.enemies.length === 0;
  }

  destroy(): void {
    for (const t of this.waveTimers) {
      if (t && t.remove) t.remove(false);
    }
    for (const t of this.spawnTimers) {
      if (t && t.remove) t.remove(false);
    }
    this.waveTimers = [];
    this.spawnTimers = [];
  }
}
