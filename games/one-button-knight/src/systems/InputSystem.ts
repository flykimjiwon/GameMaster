import { HOLD_THRESHOLDS } from '../config/gameConfig';

export type ActionType = 'attack' | 'jump' | 'dash';

export interface InputEvent {
  action: ActionType;
  holdMs: number;
}

type Callback = (evt: InputEvent) => void;

export class InputSystem {
  private pressTime: number = 0;
  private isDown: boolean = false;
  private callbacks: Callback[] = [];
  private scene: Phaser.Scene;

  // How long (ms) the button has been held right now (0 if not held)
  holdMs: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.register();
  }

  private register(): void {
    // Keyboard
    this.scene.input.keyboard?.on('keydown-SPACE', this.onDown, this);
    this.scene.input.keyboard?.on('keyup-SPACE', this.onUp, this);

    // Pointer (mouse / touch)
    this.scene.input.on('pointerdown', this.onDown, this);
    this.scene.input.on('pointerup', this.onUp, this);
  }

  onAction(cb: Callback): void {
    this.callbacks.push(cb);
  }

  private onDown(): void {
    if (this.isDown) return;
    this.isDown = true;
    this.pressTime = performance.now();
  }

  private onUp(): void {
    if (!this.isDown) return;
    this.isDown = false;
    const holdMs = performance.now() - this.pressTime;
    this.holdMs = 0;

    let action: ActionType;
    if (holdMs < HOLD_THRESHOLDS.ATTACK) {
      action = 'attack';
    } else if (holdMs < HOLD_THRESHOLDS.JUMP) {
      action = 'jump';
    } else {
      action = 'dash';
    }

    this.callbacks.forEach(cb => cb({ action, holdMs }));
  }

  update(): void {
    if (this.isDown) {
      this.holdMs = performance.now() - this.pressTime;
    } else {
      this.holdMs = 0;
    }
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.onDown, this);
    this.scene.input.keyboard?.off('keyup-SPACE', this.onUp, this);
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointerup', this.onUp, this);
  }
}
