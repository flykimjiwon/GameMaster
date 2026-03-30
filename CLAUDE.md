# GameMaster — Project Guide

## Overview

캐주얼 모바일 게임 디자인 연구 및 프로토타이핑 워크스페이스.
Phaser 3 + TypeScript + Vite 기반으로 다양한 게임 컨셉을 빠르게 프로토타이핑한다.

## Workspace Structure

```
GameMaster/
├── games/                    # npm workspaces (각 게임 독립 프로젝트)
│   ├── merge-battle-td/      # 머지 PvP 타워디펜스
│   ├── survivor-defense/     # 뱀서류 서바이벌 디펜스
│   ├── themed-cell-wars/     # 세포 테마 서바이벌 디펜스
│   ├── themed-color-wars/    # 컬러 테마 머지 타워디펜스
│   └── themed-desk-war/      # 책상 테마 서바이벌 디펜스
├── docs/                     # 게임 컨셉/리서치 문서
│   ├── concepts/             # 게임 컨셉, 아트 컨셉
│   └── research/             # 장르별 리서치
├── assets/                   # 공유 에셋
├── skills/                   # Claude Code 커스텀 스킬
└── package.json              # 루트 workspace 설정
```

## Tech Stack

- **Engine**: Phaser 3.80+
- **Language**: TypeScript 5.4+
- **Build**: Vite 5.4+
- **Package Manager**: npm workspaces

## Development Commands

```bash
# 특정 게임 개발 서버 실행
cd games/<game-name> && npm run dev

# 특정 게임 빌드
cd games/<game-name> && npm run build

# 전체 workspace 의존성 설치
npm install  # 루트에서 실행
```

## Game Project Convention

각 게임 프로젝트는 동일한 구조를 따른다:

```
games/<name>/
├── src/
│   ├── main.ts          # Phaser 게임 초기화
│   ├── config.ts        # 게임 설정값
│   ├── entities/        # 게임 오브젝트 (적, 타워, 유닛 등)
│   ├── scenes/          # Phaser Scene 클래스
│   ├── systems/         # 게임 시스템 (XP, 웨이브, 스폰 등)
│   └── weapons/|themes/ # 무기 또는 테마 정의
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── GAME_DESIGN.md       # 상세 기획서
```

## Game Types

| 타입 | 게임 | 핵심 메커니즘 |
|------|------|--------------|
| 머지 타워디펜스 | merge-battle-td, themed-color-wars | 유닛 머지 + 타워 배치 + PvP |
| 서바이벌 디펜스 | survivor-defense, themed-cell-wars, themed-desk-war | 뱀서류 + 자동 전투 + 웨이브 |

## Documentation (`docs/`)

```
docs/
├── concepts/              # 게임 컨셉 및 아트 컨셉
│   ├── GAME_CONCEPTS_100.md
│   ├── SIDE_SCROLL_GAME_CONCEPTS.md
│   ├── ART_CONCEPT_CELL_WARS.md
│   ├── ART_CONCEPT_DESK_WAR.md
│   └── ART_CONCEPT_RESEARCH.md
├── research/              # 장르별 리서치
│   ├── GAME_DEV_RESEARCH.md
│   ├── DEFENSE_RESEARCH.md
│   ├── CASUAL_DEFENSE_RESEARCH.md
│   ├── CASUAL_SRPG_RESEARCH.md
│   └── SRPG_RESEARCH.md
├── PLATFORM_ACTIVATION_GUIDE.md
├── MCP_SEARCH_GUIDE.md
└── SESSION_DASHBOARD.html
```

## Guidelines

- 새 게임 추가 시 `games/` 아래에 동일한 구조로 생성
- Phaser 3 API 사용, Canvas 렌더링 기본
- 각 게임은 독립적으로 빌드/실행 가능해야 함
- 기획서(`GAME_DESIGN.md`)를 먼저 작성한 후 구현
- `as any` 캐스트 최소화, 타입 안전성 유지
