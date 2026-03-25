import { createMachine, createActor, assign } from 'xstate';

export type WaveState =
  | 'idle'
  | 'wave_start'
  | 'combat'
  | 'wave_clear'
  | 'upgrade'
  | 'game_over';

export interface WaveContext {
  wave: number;
  enemiesRemaining: number;
  enemiesSpawned: number;
  totalEnemies: number;
}

export type WaveEvent =
  | { type: 'START' }
  | { type: 'WAVE_BEGIN'; totalEnemies: number }
  | { type: 'ENEMY_SPAWNED' }
  | { type: 'ENEMY_KILLED' }
  | { type: 'ALL_SPAWNED' }
  | { type: 'WAVE_CLEARED' }
  | { type: 'UPGRADE_CHOSEN' }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART' };

const waveMachine = createMachine({
  id: 'wave',
  initial: 'idle',
  types: {} as {
    context: WaveContext;
    events: WaveEvent;
  },
  context: {
    wave: 0,
    enemiesRemaining: 0,
    enemiesSpawned: 0,
    totalEnemies: 0,
  },
  states: {
    idle: {
      on: {
        START: { target: 'wave_start' },
        RESTART: {
          target: 'idle',
          actions: assign({
            wave: 0,
            enemiesRemaining: 0,
            enemiesSpawned: 0,
            totalEnemies: 0,
          }),
        },
      },
    },
    wave_start: {
      entry: assign({ wave: ({ context }) => context.wave + 1 }),
      on: {
        WAVE_BEGIN: {
          target: 'combat',
          actions: assign({
            totalEnemies: ({ event }) => event.totalEnemies,
            enemiesRemaining: ({ event }) => event.totalEnemies,
            enemiesSpawned: 0,
          }),
        },
      },
    },
    combat: {
      on: {
        ENEMY_SPAWNED: {
          actions: assign({
            enemiesSpawned: ({ context }) => context.enemiesSpawned + 1,
          }),
        },
        ENEMY_KILLED: {
          actions: assign({
            enemiesRemaining: ({ context }) => context.enemiesRemaining - 1,
          }),
        },
        WAVE_CLEARED: { target: 'wave_clear' },
        GAME_OVER: { target: 'game_over' },
      },
    },
    wave_clear: {
      on: {
        UPGRADE_CHOSEN: { target: 'wave_start' },
        GAME_OVER: { target: 'game_over' },
      },
    },
    upgrade: {
      on: {
        UPGRADE_CHOSEN: { target: 'wave_start' },
      },
    },
    game_over: {
      on: {
        RESTART: {
          target: 'idle',
          actions: assign({
            wave: 0,
            enemiesRemaining: 0,
            enemiesSpawned: 0,
            totalEnemies: 0,
          }),
        },
      },
    },
  },
});

export class WaveManager {
  private actor = createActor(waveMachine);

  constructor() {
    this.actor.start();
  }

  get state(): WaveState {
    return this.actor.getSnapshot().value as WaveState;
  }

  get context(): WaveContext {
    return this.actor.getSnapshot().context;
  }

  get currentWave(): number {
    return this.context.wave;
  }

  get enemiesRemaining(): number {
    return this.context.enemiesRemaining;
  }

  send(event: WaveEvent): void {
    this.actor.send(event);
  }

  is(state: WaveState): boolean {
    return this.state === state;
  }

  onTransition(callback: (state: WaveState) => void): void {
    this.actor.subscribe((snapshot) => {
      callback(snapshot.value as WaveState);
    });
  }

  stop(): void {
    this.actor.stop();
  }
}
