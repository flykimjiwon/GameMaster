export type WeaponType = 'arrow' | 'fire' | 'ice' | 'lightning' | 'poison';

export interface WeaponSpec {
  type: WeaponType;
  name: string;
  nameKo: string;
  damage: number;
  speed: number;        // pixels per second
  fireRate: number;     // cooldown in ms
  critMultiplier: number;
  color: number;
  trailColor: number;
  description: string;
  aoeRadius?: number;   // fire
  slowFactor?: number;  // ice
  piercePower?: number; // lightning (how many enemies it pierces)
  chainCount?: number;  // lightning chain
  dotDamage?: number;   // poison damage per tick
  dotDuration?: number; // poison duration in ms
}

export const WEAPON_SPECS: Record<WeaponType, WeaponSpec> = {
  arrow: {
    type: 'arrow',
    name: 'Arrow',
    nameKo: '화살',
    damage: 20,
    speed: 500,
    fireRate: 600,
    critMultiplier: 2.0,
    color: 0xf5c842,
    trailColor: 0xffd700,
    description: '기본 화살. 빠르고 정확하다.',
  },
  fire: {
    type: 'fire',
    name: 'Fire Arrow',
    nameKo: '화염 화살',
    damage: 15,
    speed: 450,
    fireRate: 900,
    critMultiplier: 2.5,
    color: 0xff4400,
    trailColor: 0xff8800,
    description: '착탄 시 범위 폭발. 다수의 적을 동시 공격.',
    aoeRadius: 80,
  },
  ice: {
    type: 'ice',
    name: 'Ice Arrow',
    nameKo: '빙결 화살',
    damage: 12,
    speed: 400,
    fireRate: 800,
    critMultiplier: 2.0,
    color: 0x44ccff,
    trailColor: 0x88eeff,
    description: '명중 시 적을 둔화. 처치 시 빙결 폭발.',
    slowFactor: 0.4,
  },
  lightning: {
    type: 'lightning',
    name: 'Lightning',
    nameKo: '번개 화살',
    damage: 25,
    speed: 700,
    fireRate: 1200,
    critMultiplier: 3.0,
    color: 0xffff00,
    trailColor: 0xaaaaff,
    description: '적을 관통하며 연쇄 번개 방전.',
    piercePower: 3,
    chainCount: 2,
  },
  poison: {
    type: 'poison',
    name: 'Poison Arrow',
    nameKo: '독 화살',
    damage: 8,
    speed: 420,
    fireRate: 750,
    critMultiplier: 2.0,
    color: 0x44ff44,
    trailColor: 0x88ff88,
    description: '명중 시 독 상태 이상. 시간당 지속 피해.',
    dotDamage: 5,
    dotDuration: 4000,
  },
};

export interface UpgradeOption {
  id: string;
  label: string;
  description: string;
  apply: (state: UpgradeState) => UpgradeState;
}

export interface UpgradeState {
  currentWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  damageMultiplier: number;
  speedMultiplier: number;
  fireRateMultiplier: number;
  critChance: number;
  multiShot: number;
  castleMaxHp: number;
  castleHpBonus: number;
}

export const DEFAULT_UPGRADE_STATE: UpgradeState = {
  currentWeapon: 'arrow',
  unlockedWeapons: ['arrow'],
  damageMultiplier: 1.0,
  speedMultiplier: 1.0,
  fireRateMultiplier: 1.0,
  critChance: 0.15,
  multiShot: 1,
  castleMaxHp: 100,
  castleHpBonus: 0,
};
