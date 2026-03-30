# GameMaster

캐주얼 모바일 게임 프로토타이핑 워크스페이스. Phaser 3 + TypeScript + Vite 기반.

## Games

| 게임 | 장르 | 설명 |
|------|------|------|
| **merge-battle-td** | 머지 타워디펜스 | 유닛 머지 + PvP 타워디펜스 대전 |
| **themed-color-wars** | 머지 타워디펜스 | 컬러 테마 머지 타워디펜스 |
| **survivor-defense** | 서바이벌 디펜스 | 뱀서류 자동 전투 서바이벌 |
| **themed-cell-wars** | 서바이벌 디펜스 | 세포 테마 서바이벌 디펜스 |
| **themed-desk-war** | 서바이벌 디펜스 | 책상 테마 서바이벌 디펜스 |

## Quick Start

```bash
# 의존성 설치
npm install

# 개별 게임 실행
cd games/merge-battle-td
npm run dev
```

## Tech Stack

- **Phaser 3** — 2D 게임 엔진
- **TypeScript** — 타입 안전성
- **Vite** — 빌드/개발 서버

## Structure

```
games/           # 각 게임 프로젝트 (npm workspaces)
docs/            # 게임 컨셉 및 리서치 문서
  concepts/      # 게임/아트 컨셉
  research/      # 장르별 리서치
assets/          # 공유 에셋
skills/          # Claude Code 커스텀 스킬
```
