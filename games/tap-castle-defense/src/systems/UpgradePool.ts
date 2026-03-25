import { UpgradeOption, UpgradeState, WeaponType, WEAPON_SPECS } from '../config/weapons';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateUpgradeOptions(
  upgradeState: UpgradeState,
  wave: number,
): UpgradeOption[] {
  const all: UpgradeOption[] = [];

  // Weapon unlocks (if not yet unlocked)
  const weaponOrder: WeaponType[] = ['fire', 'ice', 'lightning', 'poison'];
  for (const wt of weaponOrder) {
    if (!upgradeState.unlockedWeapons.includes(wt)) {
      const spec = WEAPON_SPECS[wt];
      all.push({
        id: `unlock_${wt}`,
        label: `${spec.nameKo} 해금`,
        description: spec.description,
        apply: (s) => ({
          ...s,
          unlockedWeapons: [...s.unlockedWeapons, wt],
          currentWeapon: wt,
        }),
      });
    }
  }

  // Weapon switch (if unlocked)
  for (const wt of upgradeState.unlockedWeapons) {
    if (wt !== upgradeState.currentWeapon) {
      const spec = WEAPON_SPECS[wt];
      all.push({
        id: `switch_${wt}`,
        label: `${spec.nameKo}으로 교체`,
        description: spec.description,
        apply: (s) => ({ ...s, currentWeapon: wt }),
      });
    }
  }

  // Stat upgrades
  all.push({
    id: 'damage_up',
    label: '공격력 강화 +25%',
    description: '모든 화살의 피해가 25% 증가합니다.',
    apply: (s) => ({ ...s, damageMultiplier: s.damageMultiplier * 1.25 }),
  });

  all.push({
    id: 'speed_up',
    label: '발사 속도 강화 +20%',
    description: '화살이 20% 더 빠르게 날아갑니다.',
    apply: (s) => ({ ...s, speedMultiplier: s.speedMultiplier * 1.2 }),
  });

  all.push({
    id: 'firerate_up',
    label: '연사 속도 +20%',
    description: '화살 발사 간격이 20% 단축됩니다.',
    apply: (s) => ({ ...s, fireRateMultiplier: s.fireRateMultiplier * 0.8 }),
  });

  all.push({
    id: 'crit_up',
    label: '치명타 확률 +10%',
    description: '치명타 확률이 10% 증가합니다.',
    apply: (s) => ({ ...s, critChance: Math.min(s.critChance + 0.1, 0.9) }),
  });

  if (wave >= 5 && upgradeState.multiShot < 3) {
    all.push({
      id: 'multishot',
      label: '다중 발사',
      description: '동시에 화살을 2발 발사합니다.',
      apply: (s) => ({ ...s, multiShot: s.multiShot + 1 }),
    });
  }

  all.push({
    id: 'castle_hp',
    label: '성벽 보강 +30 HP',
    description: '최대 HP가 30 증가하고 현재 HP도 30 회복됩니다.',
    apply: (s) => ({ ...s, castleMaxHp: s.castleMaxHp + 30, castleHpBonus: s.castleHpBonus + 30 }),
  });

  const shuffled = shuffle(all);
  return shuffled.slice(0, 3);
}
