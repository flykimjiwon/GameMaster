import { COMBO } from '../config/gameConfig';

export class ComboSystem {
  private count: number = 0;
  private lastKillTime: number = 0;
  private score: number = 0;

  reset(): void {
    this.count = 0;
    this.score = 0;
    this.lastKillTime = 0;
  }

  registerKill(now: number): { combo: number; multiplier: number; points: number } {
    const elapsed = now - this.lastKillTime;
    if (elapsed > COMBO.WINDOW_MS) {
      this.count = 0;
    }
    this.count++;
    this.lastKillTime = now;

    const mults = COMBO.MULTIPLIERS;
    const idx = Math.min(this.count - 1, mults.length - 1);
    const multiplier = mults[idx];
    const points = 100 * multiplier;
    this.score += points;

    return { combo: this.count, multiplier, points };
  }

  getScore(): number {
    return this.score;
  }

  getCombo(): number {
    return this.count;
  }

  tick(now: number): void {
    if (this.count > 0 && now - this.lastKillTime > COMBO.WINDOW_MS) {
      this.count = 0;
    }
  }
}
