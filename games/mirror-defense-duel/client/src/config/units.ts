import { UNIT_STATS } from "@shared/types";
import type { UnitType, UnitStats } from "@shared/types";

export interface UnitRenderInfo extends UnitStats {
  icon: string;
  description: string;
  size: number; // render radius
}

export const UNIT_RENDER: Record<UnitType, UnitRenderInfo> = {
  infantry: {
    ...UNIT_STATS.infantry,
    icon: "⚔",
    description: "균형잡힌 보병",
    size: 6,
  },
  archer: {
    ...UNIT_STATS.archer,
    icon: "🏹",
    description: "빠르고 원거리 공격",
    size: 5,
  },
  cavalry: {
    ...UNIT_STATS.cavalry,
    icon: "🐎",
    description: "매우 빠름, 높은 체력",
    size: 7,
  },
  tank: {
    ...UNIT_STATS.tank,
    icon: "🛡",
    description: "느리지만 매우 단단함, 아군 버프",
    size: 9,
  },
};
