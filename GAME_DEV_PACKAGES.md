# 게임 개발 패키지 & 라이브러리 총정리

> 400개 이상의 리소스를 조사하여 카테고리별로 정리한 문서입니다.
> 최종 업데이트: 2026-03-24

---

## 목차

1. [게임 엔진 & 프레임워크](#1-게임-엔진--프레임워크)
2. [물리 엔진](#2-물리-엔진)
3. [ECS (Entity Component System)](#3-ecs-entity-component-system)
4. [경로탐색 & AI](#4-경로탐색--ai)
5. [멀티플레이어 & 네트워킹](#5-멀티플레이어--네트워킹)
6. [오디오](#6-오디오)
7. [UI 프레임워크 & 아이콘](#7-ui-프레임워크--아이콘)
8. [애니메이션 & 트윈](#8-애니메이션--트윈)
9. [프로시저럴 생성](#9-프로시저럴-생성)
10. [상태 관리](#10-상태-관리)
11. [저장 & 직렬화](#11-저장--직렬화)
12. [방치형/숫자 처리](#12-방치형숫자-처리)
13. [대화/스토리 시스템](#13-대화스토리-시스템)
14. [입력 처리](#14-입력-처리)
15. [게임 템플릿 & 보일러플레이트](#15-게임-템플릿--보일러플레이트)
16. [무료 에셋 & 스프라이트](#16-무료-에셋--스프라이트)
17. [사운드 이펙트 & 음악](#17-사운드-이펙트--음악)
18. [AI 에셋 생성 도구](#18-ai-에셋-생성-도구)
19. [수익화 & 플랫폼 SDK](#19-수익화--플랫폼-sdk)
20. [유틸리티](#20-유틸리티)
21. [추천 스택 조합](#21-추천-스택-조합)

---

## 1. 게임 엔진 & 프레임워크

### 핵심 엔진

| 패키지 | 설치 | 특징 | 추천 장르 |
|--------|------|------|----------|
| **Phaser 3** | `npm i phaser` | 2D 게임 최강, 거대한 생태계, TypeScript 지원 | TD, SRPG, 캐주얼 전부 |
| **PixiJS v8** | `npm i pixi.js` | 2D 렌더링 특화, WebGPU 지원, 최고 성능 | 대량 스프라이트, 파티클 |
| **Excalibur.js** | `npm i excalibur` | TypeScript 네이티브, 초보 친화적 | 2D 액션, 플랫포머 |
| **Kaboom/KAPLAY** | `npm i kaplay` | Kaboom 후속, 간결한 API, 프로토타이핑 최강 | 게임잼, 빠른 프로토타입 |
| **Three.js** | `npm i three` | 3D 웹 표준, WebGPU 지원 | 3D 게임, 시각화 |
| **Babylon.js** | `npm i babylonjs` | 풀스택 3D 엔진, 에디터 내장 | 3D RPG, 시뮬레이션 |
| **PlayCanvas** | `npm i playcanvas` | 클라우드 에디터, WebGPU | 3D 모바일 게임 |

### 프레임워크 (엔진 위에 구축)

| 패키지 | 기반 | 특징 |
|--------|------|------|
| **RPG-JS** | PixiJS | RPG 전용 프레임워크, 맵에디터, 멀티플레이어 내장 |
| **Colyseus + Phaser** | Phaser 3 | 실시간 멀티플레이어 게임 풀스택 |
| **phaser3-rex-plugins** | Phaser 3 | 200개+ 플러그인 (UI, 이펙트, 유틸 등) |
| **@dimforge/rapier2d** | 독립 | Rust→WASM 물리엔진, Phaser/Pixi와 조합 |

---

## 2. 물리 엔진

| 패키지 | 설치 | 특징 | 성능 |
|--------|------|------|------|
| **Matter.js** | `npm i matter-js` | 2D 물리, 쉬운 API, 커뮤니티 거대 | 보통 |
| **Rapier2D (WASM)** | `npm i @dimforge/rapier2d` | Rust 컴파일, 결정론적 물리 | 최고 |
| **Planck.js** | `npm i planck` | Box2D의 JS 포트, 정밀한 물리 | 좋음 |
| **p2.js** | `npm i p2` | 경량 2D 물리 | 좋음 |
| **cannon-es** | `npm i cannon-es` | 3D 물리 (Three.js 호환) | 보통 |

**추천**: 타워디펜스/SRPG → Rapier2D (결정론적). 캐주얼 → Matter.js (쉬움).

---

## 3. ECS (Entity Component System)

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **bitECS** | `npm i bitecs` | 극한 성능, 10만+ 엔티티 처리 |
| **miniplex** | `npm i miniplex` | DX 우선, TypeScript 친화적 |
| **ecsy** | `npm i ecsy` | Mozilla 출신, 안정적 |
| **ape-ecs** | `npm i ape-ecs` | 경량, 쉬운 학습곡선 |

**추천**: 대규모 유닛 → bitECS. 편의성 → miniplex.

---

## 4. 경로탐색 & AI

| 패키지 | 설치 | 용도 |
|--------|------|------|
| **PathFinding.js** | `npm i pathfinding` | A*, JPS, 그리드 기반 경로탐색 |
| **navmesh** | `npm i navmesh` | 네비메시 기반, 비그리드 맵 지원 |
| **javascript-astar** | `npm i javascript-astar` | 경량 A* 구현 |
| **behavior3js** | GitHub | 행동 트리 AI |
| **goap** | 커스텀 | 목표 지향 액션 플래닝 |

**추천**: 그리드 기반 TD/SRPG → PathFinding.js. 자유 이동 → navmesh.

---

## 5. 멀티플레이어 & 네트워킹

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **Colyseus** | `npm i colyseus.js` | 게임 특화 서버, 방 관리, 상태 동기화 |
| **Socket.io** | `npm i socket.io-client` | 범용 WebSocket, 폴백 지원 |
| **geckos.io** | `npm i @geckos.io/client` | UDP-like (WebRTC 기반), 액션 게임용 |
| **Peer.js** | `npm i peerjs` | P2P WebRTC, 서버리스 |
| **Lance** | `npm i lance-gg` | 클라이언트 예측, 보간 내장 |
| **Nakama** | Docker | 오픈소스 게임 백엔드, 매치메이킹 |

**추천**: PvP 미러 디펜스 → Colyseus (방 관리 + 상태 동기화 최적).

---

## 6. 오디오

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **Howler.js** | `npm i howler` | 웹 오디오 표준, 스프라이트 지원 |
| **Tone.js** | `npm i tone` | 프로시저럴 음악/SFX 생성 |
| **zzfx** | 인라인 | 초경량(~1KB), 프로시저럴 SFX |
| **jsfxr** | 웹/npm | 레트로 8bit SFX 생성기 |
| **Pizzicato** | `npm i pizzicato` | 이펙트 체인 (에코, 디스토션 등) |

**추천**: Howler.js (메인 오디오) + jsfxr (효과음 생성).

---

## 7. UI 프레임워크 & 아이콘

### UI 라이브러리

| 패키지 | 설치/링크 | 특징 |
|--------|----------|------|
| **RPGUI** | CDN/GitHub | RPG 스타일 HTML UI (체력바, 인벤토리 슬롯) |
| **phaser3-rex-plugins** | `npm i phaser3-rex-plugins` | Phaser UI 컴포넌트 200개+ |
| **@pixi/ui** | `npm i @pixi/ui` | PixiJS 공식 UI 컴포넌트 |
| **Arwes** | `npm i arwes` | SF/사이버펑크 React UI |
| **pixel-retroui** | `npm i pixel-retroui` | 레트로 픽셀 React UI (이미 saju에서 사용 중) |
| **dat.GUI** | `npm i dat.gui` | 디버그/개발용 컨트롤 패널 |
| **lil-gui** | `npm i lil-gui` | dat.GUI 후속, 경량 |

### 아이콘 & 폰트

| 리소스 | 링크 | 특징 |
|--------|------|------|
| **RPG-Awesome** | `npm i rpg-awesome` | RPG 전용 아이콘 495개 (검, 방패, 포션 등) |
| **Game-Icons.net** | game-icons.net | SVG 게임 아이콘 4,170개+ (CC BY 3.0) |
| **Nerd Fonts** | nerdfonts.com | 게임 아이콘 포함 폰트 |
| **Kenney UI Pack** | kenney.nl | 무료 UI 에셋 (버튼, 패널, HUD) |

---

## 8. 애니메이션 & 트윈

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **GSAP** | `npm i gsap` | 업계 표준, 2024년 완전 무료화 |
| **@tweenjs/tween.js** | `npm i @tweenjs/tween.js` | 경량, Three.js 호환 |
| **anime.js** | `npm i animejs` | 다목적, CSS+SVG+JS 통합 |
| **popmotion** | `npm i popmotion` | 물리 기반 애니메이션 |
| **Framer Motion** | `npm i framer-motion` | React 전용, 제스처 지원 |
| **Spine Runtime** | 상용 | 2D 골격 애니메이션 (프로 퀄리티) |
| **DragonBones** | 무료 | 2D 골격 애니메이션 (무료 대안) |

**추천**: Phaser 게임 → GSAP 또는 내장 트윈. React UI → Framer Motion.

---

## 9. 프로시저럴 생성

| 패키지 | 설치 | 용도 |
|--------|------|------|
| **simplex-noise** | `npm i simplex-noise` | 지형, 맵, 텍스처 노이즈 생성 |
| **rot-js** | `npm i rot-js` | 로그라이크 전용 (던전, FOV, 스케줄러) |
| **WFC (Wave Function Collapse)** | GitHub | 타일맵 자동 생성 |
| **dungeoneer** | `npm i dungeoneer` | BSP 기반 던전 생성 |
| **Tracery** | `npm i tracery-grammar` | 프로시저럴 텍스트/이름 생성 |
| **perlin-noise-3d** | `npm i perlin-noise-3d` | 3D 펄린 노이즈 |

**추천**: TD 맵 → simplex-noise + WFC. 로그라이크 → rot-js.

---

## 10. 상태 관리

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **XState** | `npm i xstate` | FSM/스테이트차트, 게임 상태 관리 최강 |
| **Zustand** | `npm i zustand` | React 경량 상태관리 |
| **signals** | `npm i @preact/signals-core` | 반응형 상태, 프레임워크 무관 |
| **effector** | `npm i effector` | 이벤트 기반, 복잡한 게임 로직 |

**추천**: 게임 FSM (턴 관리, AI 상태) → XState. UI 상태 → Zustand.

---

## 11. 저장 & 직렬화

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **localForage** | `npm i localforage` | IndexedDB/WebSQL/localStorage 통합 |
| **idb-keyval** | `npm i idb-keyval` | 초경량 IndexedDB 래퍼 |
| **lz-string** | `npm i lz-string` | 세이브 데이터 압축 |
| **msgpackr** | `npm i msgpackr` | 바이너리 직렬화 (JSON 대비 50%+ 작음) |
| **flatbuffers** | `npm i flatbuffers` | 제로카피 직렬화, 네트워크 최적 |

---

## 12. 방치형/숫자 처리

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **break_infinity.js** | `npm i break_infinity.js` | 1e308 이상 숫자 처리 |
| **break_eternity.js** | `npm i break_eternity.js` | 10↑↑308 이상, 방치형 게임 필수 |
| **decimal.js** | `npm i decimal.js` | 정밀한 소수점 연산 |

---

## 13. 대화/스토리 시스템

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **inkjs** | `npm i inkjs` | Ink 스크립트 런타임 (분기 대화) |
| **yarn-bound** | `npm i yarn-bound` | YarnSpinner JS 런타임 |
| **bondage.js** | `npm i bondage` | Yarn 포맷 파서 |
| **Twine** | 외부 에디터 | 인터랙티브 스토리 에디터 |

---

## 14. 입력 처리

| 패키지 | 설치 | 특징 |
|--------|------|------|
| **nipplejs** | `npm i nipplejs` | 모바일 가상 조이스틱 |
| **hammer.js** | `npm i hammerjs` | 터치 제스처 (핀치, 스와이프) |
| **gamecontroller.js** | `npm i gamecontroller.js` | 게임패드 API 래퍼 |
| **KeyboardJS** | `npm i keyboardjs` | 키 바인딩, 콤보 키 |

---

## 15. 게임 템플릿 & 보일러플레이트

### 공식 템플릿

| 템플릿 | 명령어 | 포함 내용 |
|--------|--------|----------|
| **Phaser 3 공식** | `npm create @phaserjs/game@latest` | Vite + TS + Phaser 3.90, 씬 전환 |
| **PixiJS 공식** | `npm create pixi-app` | PixiJS 8 + Vite |
| **KAPLAY 공식** | `npx create-kaplay mygame` | KAPLAY + Vite |

### 커뮤니티 템플릿

| 템플릿 | GitHub | 특징 |
|--------|--------|------|
| **poki-pixijs-template** | poki/pixijs-template | Poki 배포 최적화, 리사이즈 처리 |
| **pixijs/open-games** | pixijs/open-games | 완성된 게임 4종 (퍼즐, 버블슈터 등) |
| **phaser3-typescript-template** | 여러 버전 | TS + Webpack/Vite |
| **ourcade templates** | ourcade | Phaser 3 시리즈 (FSM, 멀티씬 등) |
| **Colyseus + Phaser** | colyseus/tutorial | 멀티플레이어 게임 보일러플레이트 |
| **RPG-JS starter** | `npx @rpgjs/create mygame` | RPG 풀스택 (서버 + 클라이언트) |

### 상용 템플릿 (참고용)

| 종류 | 플랫폼 | 가격대 |
|------|--------|--------|
| Tower Defense Kit | CodeCanyon | $20-49 |
| Match-3 Template | CodeCanyon | $15-39 |
| Merge Game Kit | CodeCanyon | $25-59 |
| Card Game Framework | itch.io | $10-30 |

---

## 16. 무료 에셋 & 스프라이트

### 종합 에셋 사이트

| 사이트 | 라이선스 | 특징 |
|--------|---------|------|
| **Kenney.nl** | CC0 (완전 무료) | 60,000개+ 에셋, 2D/3D/UI/오디오 |
| **OpenGameArt.org** | CC/GPL 혼합 | 커뮤니티 기반, 방대한 양 |
| **itch.io/game-assets** | 다양 | 인디 아티스트 에셋, 유료/무료 혼합 |
| **CraftPix.net** | 무료/프리미엄 | TD 전용 에셋 풍부 (타워, 몬스터, 맵) |
| **Game-Icons.net** | CC BY 3.0 | SVG 아이콘 4,170개+ |

### 스프라이트 전용

| 리소스 | 특징 |
|--------|------|
| **LPC (Liberated Pixel Cup)** | 캐릭터 생성기, RPG 스프라이트 통합 시스템 |
| **Kenney 1-Bit Pack** | 1비트 스타일 스프라이트 1,000개+ |
| **Universal LPC Spritesheet** | 커스텀 캐릭터 조합 (머리/갑옷/무기) |
| **Pixel Frog** | 2D 플랫포머 캐릭터+배경 (itch.io) |
| **0x72** | 던전 크롤러 에셋 (itch.io) |

### TD/디펜스 특화 에셋

| 리소스 | 내용 |
|--------|------|
| CraftPix TD Pack | 타워 스프라이트, 적 웨이브, 맵 타일 |
| Kenney Tower Defense | 탑뷰 TD 에셋 (타워, 적, UI) |
| Space Shooter Extension | 우주 테마 발사체, 적기 |

### 타일맵 에디터

| 도구 | 용도 |
|------|------|
| **Tiled** | 2D 타일맵 에디터 (Phaser/Pixi 호환) |
| **LDtk** | 모던 2D 레벨 에디터 (핫리로드) |
| **Sprite Fusion** | 온라인 타일맵 에디터 |

---

## 17. 사운드 이펙트 & 음악

### SFX 생성기

| 도구 | 링크 | 특징 |
|------|------|------|
| **jsfxr** | jsfxr.frozenfractal.com | 브라우저 레트로 SFX 생성기 |
| **ChipTone** | sfbgames.itch.io/chiptone | 8비트/16비트 SFX |
| **zzfx** | GitHub | 코드로 SFX 생성 (~1KB) |
| **Bfxr** | bfxr.net | sfxr 확장판 |

### 무료 음악/SFX 라이브러리

| 리소스 | 라이선스 | 특징 |
|--------|---------|------|
| **SONNISS GameAudioGDC** | 로열티 프리 | 매년 GDC 무료 번들 (수십 GB) |
| **Freesound.org** | CC 혼합 | 커뮤니티 SFX 50만개+ |
| **Mixkit** | 무료 | 게임 SFX + 음악 |
| **OpenGameArt (Audio)** | CC 혼합 | 게임 특화 BGM, SFX |

### 컬러 팔레트

| 리소스 | 특징 |
|--------|------|
| **Lospec.com** | 픽셀아트 팔레트 7,000개+ |
| **Coolors.co** | 팔레트 생성기 |
| **DB32** | 32색 범용 게임 팔레트 |
| **Endesga 64** | 64색 프로페셔널 게임 팔레트 |

---

## 18. AI 에셋 생성 도구

| 도구 | 용도 | 특징 |
|------|------|------|
| **PixelLab** | 스프라이트 생성 | AI 픽셀아트 캐릭터/환경 |
| **SEELE.run** | 2D 에셋 생성 | 게임 에셋 특화 AI |
| **Leonardo.ai** | 일반 게임 아트 | 파인튜닝된 게임 스타일 |
| **Scenario.gg** | 일관성 있는 에셋 | 스타일 통일된 세트 생성 |
| **Aseprite** | 스프라이트 편집 | 픽셀아트 에디터 (유료 $20) |
| **Piskel** | 스프라이트 편집 | 무료 온라인 픽셀아트 에디터 |

---

## 19. 수익화 & 플랫폼 SDK

| 플랫폼 | 연동 방식 | 수익 모델 |
|--------|----------|----------|
| **Poki SDK** | CDN `<script>` | 광고 수익 공유, 무료 호스팅 |
| **CrazyGames SDK** | CDN `<script>` | 광고 수익 공유 |
| **GameDistribution** | CDN | HTML5 게임 유통 |
| **GameAnalytics** | `npm i gameanalytics` | 게임 분석 (무료) |
| **PlayFab** | `npm i playfab-sdk` | 백엔드 서비스 (리더보드, 인증) |
| **게임 웹 배포** | Vercel/Netlify | 정적 호스팅 (무료) |

---

## 20. 유틸리티

| 패키지 | 설치 | 용도 |
|--------|------|------|
| **stats.js** | `npm i stats.js` | FPS/메모리 모니터 |
| **tweakpane** | `npm i tweakpane` | 런타임 파라미터 조정 UI |
| **debug** | `npm i debug` | 네임스페이스 디버그 로깅 |
| **uuid** | `npm i uuid` | 엔티티 고유 ID 생성 |
| **seedrandom** | `npm i seedrandom` | 시드 기반 랜덤 (리플레이 가능) |
| **comlink** | `npm i comlink` | Web Worker 간편 사용 |
| **texture-packer** | `npm i free-tex-packer-core` | 스프라이트시트 자동 패킹 |

---

## 21. 추천 스택 조합

### A. PvP 미러 디펜스 (★ 1순위)

```
엔진:     Phaser 3 + TypeScript
물리:     Rapier2D (결정론적 동기화)
네트워크:  Colyseus (방 관리 + 상태 동기화)
경로탐색:  PathFinding.js (그리드)
상태관리:  XState (턴/페이즈 FSM)
오디오:    Howler.js + jsfxr
UI:       phaser3-rex-plugins + RPGUI
에셋:     Kenney TD Pack + CraftPix
저장:     localForage + lz-string
```

### B. 캐주얼 타워디펜스 (싱글)

```
엔진:     Phaser 3 또는 KAPLAY (빠른 프로토타입)
경로탐색:  PathFinding.js
상태관리:  XState
오디오:    Howler.js
에셋:     Kenney + OpenGameArt
배포:     Poki SDK (수익화)
```

### C. SRPG / 턴제 전략

```
엔진:     Phaser 3 + TypeScript
타일맵:   Tiled (에디터) + Phaser Tilemap
경로탐색:  PathFinding.js (BFS/A*)
AI:       행동 트리 (커스텀 또는 behavior3js)
상태관리:  XState (턴 시스템)
대화:     inkjs (분기 스토리)
오디오:    Howler.js
에셋:     LPC 캐릭터 + OpenGameArt
```

### D. 방치형/머지 게임

```
엔진:     Phaser 3 또는 React+Canvas
숫자:     break_infinity.js
저장:     localForage + lz-string (오프라인 진행)
UI:       pixel-retroui (React) 또는 RPGUI
애니:     GSAP
배포:     Poki/CrazyGames
```

### E. 사이드스크롤 액션

```
엔진:     Phaser 3 또는 KAPLAY
물리:     Matter.js (간단) 또는 Rapier2D (정밀)
입력:     nipplejs (모바일 조이스틱)
애니:     Spine/DragonBones (골격 애니메이션)
레벨:     LDtk (레벨 에디터)
오디오:    Howler.js
```

---

## 빠른 시작

```bash
# Phaser 3 프로젝트 생성
npm create @phaserjs/game@latest my-game

# KAPLAY 프로젝트 생성
npx create-kaplay my-game

# RPG-JS 프로젝트 생성
npx @rpgjs/create my-rpg

# 멀티플레이어 (Colyseus)
npm init colyseus-app my-server

# 핵심 패키지 설치 (TD 기준)
npm i phaser pathfinding howler xstate @dimforge/rapier2d-compat
```

---

> 이 문서는 GameMaster 프로젝트의 게임 개발에 필요한 패키지와 리소스를 총정리한 참조 문서입니다.
> 각 프로젝트의 요구사항에 맞게 스택을 조합하세요.
