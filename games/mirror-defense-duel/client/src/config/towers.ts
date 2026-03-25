import { TOWER_STATS } from "@shared/types";
import type { TowerType, TowerStats } from "@shared/types";

export interface TowerRenderInfo extends TowerStats {
  icon: string;      // Unicode symbol for display
  description: string;
}

export const TOWER_RENDER: Record<TowerType, TowerRenderInfo> = {
  arrow: {
    ...TOWER_STATS.arrow,
    icon: "▲",
    description: "빠른 공격, 넓은 사거리",
  },
  cannon: {
    ...TOWER_STATS.cannon,
    icon: "●",
    description: "범위 폭발, 높은 데미지",
  },
  slow: {
    ...TOWER_STATS.slow,
    icon: "◆",
    description: "이동속도 50% 감소",
  },
};

export const WALL_RENDER = {
  color: 0x607d8b,
  icon: "■",
  name: "벽",
  description: "경로 차단",
};
