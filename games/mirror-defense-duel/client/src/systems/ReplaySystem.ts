/**
 * ReplaySystem — records battle state per tick for later playback.
 * Stub implementation: records frames but playback is future work.
 */
export interface ReplayFrame {
  tick: number;
  units: Array<{
    id: string;
    x: number;
    y: number;
    hp: number;
    alive: boolean;
  }>;
  baseHp: { p1: number; p2: number };
}

export class ReplaySystem {
  private frames: ReplayFrame[] = [];
  private recording = false;

  startRecording(): void {
    this.frames = [];
    this.recording = true;
  }

  recordFrame(frame: ReplayFrame): void {
    if (!this.recording) return;
    this.frames.push(frame);
  }

  stopRecording(): void {
    this.recording = false;
  }

  getReplay(): ReplayFrame[] {
    return this.frames;
  }

  exportJSON(): string {
    return JSON.stringify(this.frames);
  }
}
