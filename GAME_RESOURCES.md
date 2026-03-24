# 2D / 도트 / 웹 게임 제작 리소스 종합 가이드

> 무료 & 오픈소스 중심으로 카테고리별 정리 | 2026-03-23

---

## 1. 무료 스프라이트 / 2D 에셋

### 에셋 포털 사이트

| 사이트 | URL | 특징 |
|--------|-----|------|
| **Kenney** | https://kenney.nl/assets | 60,000+ 에셋, **CC0** (저작권 표시 불필요), 원클릭 전체 다운로드 |
| **OpenGameArt** | https://opengameart.org | 커뮤니티 기반 최대 무료 에셋 아카이브 (CC 라이선스) |
| **itch.io Free Assets** | https://itch.io/game-assets/free | 수천 개 무료 에셋팩, 태그별 검색 |
| **CraftPix Freebies** | https://craftpix.net/freebies | 무료 2D 킷, GUI, 배경, 타일셋 |
| **Game Art 2D** | https://gameart2d.com/freebies.html | 상업용 무료 2D 캐릭터/타일셋 |
| **Open Pixel Project** | https://openpixelproject.com | 2,000+ 타일, 100+ 애니메이션 스프라이트 |

### 인기 무료 에셋팩 (itch.io)

| 팩 이름 | URL | 내용 |
|---------|-----|------|
| **Pixel Adventure** | https://pixelfrog-assets.itch.io/pixel-adventure-1 | 완성도 높은 플랫포머 타일셋+캐릭터 |
| **Sprout Lands** | https://cupnooble.itch.io/sprout-lands-asset-pack | 귀여운 농장 에셋 (캐릭터, 타일, UI) |
| **Tiny RPG Character Pack** | https://ansimuz.itch.io/tiny-rpg-character-pack | 20종 애니메이션 RPG 캐릭터 |
| **Brackeys Platformer Bundle** | https://brackeysgames.itch.io/brackeys-platformer-bundle | 완전한 플랫포머 팩 (타일+캐릭+사운드+음악) |
| **Free Top-Down 500 Sprites** | https://free-game-assets.itch.io/free-top-down-pixel-art-asset-pack | 히어로 3종, 적 8종, 무기 50종 |
| **Monochrome Caves** | https://adamatomic.itch.io/cavernas | 모노크롬 동굴 타일셋 |
| **16x16 DungeonTileset II** | https://0x72.itch.io/dungeontileset-ii | 던전 크롤러용 16x16 타일셋 |
| **Modern Interiors** | https://limezu.itch.io/moderninteriors | 현대식 실내 타일셋 |

### Kenney 추천 팩 (전부 CC0)

- Roguelike/RPG Pack, Pixel UI Pack, Platformer Characters
- Nature Kit, Castle Kit, Fish Pack, Blocky Characters
- Game Icons (1,000+), Particle Pack, UI Pack RPG Expansion

---

## 2. 픽셀아트 제작 도구

### 에디터

| 도구 | URL | 특징 | 비용 |
|------|-----|------|------|
| **Aseprite** | https://aseprite.org | 업계 표준 픽셀아트 에디터. 애니메이션, 레이어, 팔레트 | $19.99 (소스 무료 빌드 가능) |
| **Pixelorama** | https://orama-interactive.itch.io/pixelorama | Aseprite 대안. Godot 기반, 풀기능 | **무료** (오픈소스) |
| **LibreSprite** | https://libresprite.github.io | Aseprite 오래된 버전 포크 | **무료** (오픈소스) |
| **Piskel** | https://piskelapp.com | 브라우저 기반, 설치 불필요, 실시간 프리뷰 | **무료** (오픈소스) |
| **GrafX2** | https://grafx2.gitlab.io | 아미가 Deluxe Paint 스타일 레트로 에디터 | **무료** (오픈소스) |
| **Pix2D** | https://pix2d.com | 태블릿 최적화 픽셀아트 에디터 | **무료** (오픈소스) |
| **Lospec Pixel Editor** | https://lospec.com/pixel-editor | 브라우저 기반 미니 에디터 | **무료** |

### 타일맵 에디터

| 도구 | URL | 특징 | 비용 |
|------|-----|------|------|
| **Tiled** | https://mapeditor.org | 업계 표준. JSON/XML 내보내기, 무한 맵, 레이어 | **무료** (오픈소스) |
| **LDtk** | https://ldtk.io | Dead Cells 디렉터 제작. 최고 UX, 엔티티 시스템 | **무료** (오픈소스) |
| **Sprite Fusion** | https://spritefusion.com | 브라우저 기반 타일맵 에디터 | **무료** |
| **MapperMate** | https://mappermate.com | 온라인, Unity/Godot/JS 내보내기 | **무료** |

### 팔레트 & 컬러 도구

| 도구 | URL | 특징 |
|------|-----|------|
| **Lospec Palette List** | https://lospec.com/palette-list | 1,000+ 큐레이팅된 픽셀아트 팔레트 |
| **Lospec Procedural Generator** | https://lospec.com/procedural-pixel-art-generator | 랜덤 픽셀 스프라이트 생성 |
| **Coolors** | https://coolors.co | 색상 조합 생성기 |

---

## 3. 2D 게임 엔진 & 프레임워크

### JavaScript / TypeScript

| 엔진 | URL | 크기 | 특징 | 추천 |
|------|-----|------|------|------|
| **Phaser 3** | https://phaser.io | 중간 | 가장 인기. 물리, 카메라, 씬, 타일맵, 오디오 | **1순위** |
| **PixiJS v8** | https://pixijs.com | 중간 | 최고속 2D WebGL 렌더러. 게임 로직 없음 | 렌더링만 필요 시 |
| **KAPLAY** | https://kaplayjs.com | 작음 | Kaboom.js 후속. 초보 친화, 게임잼용 | 프로토타입 |
| **Excalibur.js** | https://excaliburjs.com | 중간 | TypeScript-first. 완전한 2D 엔진 | TS 선호 시 |
| **MelonJS** | https://melonjs.org | 작음 | 경량 모듈식. 플랫포머/퍼즐용 | 경량 필요 시 |
| **LittleJS** | https://github.com/KilledByAPixel/LittleJS | **~6KB** | 초경량, 의존성 0, 게임잼 우승 | 미니 게임 |
| **Kontra.js** | https://straker.github.io/kontra | **~10KB** | js13kGames 전용 마이크로 라이브러리 | 크기 제한 |
| **Two.js** | https://two.js.org | 작음 | SVG/Canvas/WebGL 2D 드로잉 API | 시각화 |

### 기타 엔진

| 엔진 | URL | 언어 | 특징 |
|------|-----|------|------|
| **Godot 4/5** | https://godotengine.org | GDScript/C# | 완전 무료(MIT), 네이티브 2D 엔진, HTML5 내보내기 |
| **LOVE2D** | https://love2d.org | Lua | 경량 2D 전용, 인디 프로 사이에서 인기 |
| **GDevelop** | https://gdevelop.io | 노코드 | 이벤트 기반 2D 게임 메이커, 웹/모바일 내보내기 |

---

## 4. 사운드 & 음악

### SFX 생성기 (무료, 브라우저)

| 도구 | URL | 특징 |
|------|-----|------|
| **jsfxr** | https://sfxr.me | 8-bit SFX 생성. npm: `jsfxr`로 게임 내 사용 가능 |
| **ChipTone** | https://sfbgames.com/chiptone | 고급 칩튠 SFX 생성기 |
| **Bfxr** | https://bfxr.net | 레트로 SFX 생성 클래식 |

### 무료 SFX / 음악 라이브러리

| 사이트 | URL | 라이선스 | 특징 |
|--------|-----|----------|------|
| **OpenGameArt (Audio)** | https://opengameart.org | CC (다양) | 칩튠, SFX, 앰비언트 |
| **Freesound.org** | https://freesound.org | CC (다양) | 230,000+ 샘플, 태그 검색 |
| **Incompetech** | https://incompetech.com | CC BY 4.0 | Kevin MacLeod 2,500+ 트랙 |
| **Soundimage.org** | https://soundimage.org/chiptunes | 무료 | 칩튠/아케이드 BGM |
| **SONNISS GDC** | https://sonniss.com/gameaudiogdc | 무료 | 프로 SFX 연간 무료 배포 (수백 달러치) |
| **Free Music Archive** | https://freemusicarchive.org | CC (다양) | CC 음악 아카이브 |
| **itch.io Chiptune** | https://itch.io/game-assets/free/tag-chiptune | 무료/PWYW | 인디 작곡가 칩튠 팩 |

### AI 음악/SFX 생성

| 도구 | URL | 특징 | 비용 |
|------|-----|------|------|
| **Suno** | https://suno.com | 텍스트→음악 (풀 곡, 칩튠 가능) | 프리미엄 |
| **ElevenLabs SFX** | https://elevenlabs.io/sound-effects | 텍스트→효과음 | 프리미엄 |
| **ElevenLabs Music** | https://elevenlabs.io/music | AI 음악 생성 (상업 라이선스) | 프리미엄 |

---

## 5. 폰트

### 픽셀/게임용 무료 폰트

| 폰트 | URL | 특징 |
|------|-----|------|
| **Press Start 2P** | https://fonts.google.com/specimen/Press+Start+2P | 1980년대 아케이드 스타일 (OFL) |
| **VT323** | https://fonts.google.com/specimen/VT323 | 레트로 터미널 픽셀 폰트 |
| **Silkscreen** | https://fonts.google.com/specimen/Silkscreen | 깔끔한 픽셀 폰트 |
| **Monogram** | https://datagoblin.itch.io/monogram | itch.io 최다 다운로드 픽셀 폰트 |
| **Ark Pixel Font** | https://github.com/TakWolf/ark-pixel-font | 다국어 (한/중/일/영) 픽셀 폰트 (OFL) |
| **Public Pixel Font** | https://ggbot.itch.io/public-pixel-font | CC0, 저작권 표시 불필요 |
| **itch.io Pixel Fonts** | https://itch.io/game-assets/free/tag-pixel-font | 100+ 무료 픽셀 폰트 |

---

## 6. UI 킷 & 템플릿

| 에셋 | URL | 내용 |
|------|-----|------|
| **Kenney UI Pack** | https://kenney.nl/assets/ui-pack | 버튼, 슬라이더, 패널, 메뉴 (CC0) |
| **Kenney UI Pack RPG** | https://kenney.nl/assets/ui-pack-rpg-expansion | RPG 테마 UI (CC0) |
| **itch.io Free GUI (Pixel)** | https://itch.io/game-assets/free/tag-gui/tag-pixel-art | 무료 픽셀아트 UI팩 전체 |
| **Complete UI Essential Pack** | https://crusenho.itch.io/complete-ui-essential-pack | 메뉴, HUD, 인벤토리 종합 |
| **RPG GUI Construction Kit** | https://opengameart.org (검색: RPG GUI) | 모듈형 RPG GUI |
| **itch.io HUD Assets** | https://itch.io/game-assets/free/tag-hud/tag-pixel-art | HUD 전용 픽셀아트 |

---

## 7. 물리 & 유틸리티 라이브러리

### 2D 물리 엔진

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **Matter.js** | `matter-js` | 가장 인기 2D 물리. 내장 렌더러, 풍부한 문서 |
| **Planck.js** | `planck` | Box2D의 JS 포팅. 정밀 시뮬레이션 |
| **p2-es** | `p2-es` | 조인트, 스프링, 마찰. pmndrs 관리 포크 |
| **Rapier** | `@dimforge/rapier2d` | Rust+WASM. 최고속 물리 엔진 |

### 경로 탐색

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **PathFinding.js** | `pathfinding` | A*, Dijkstra, BFS, JPS 등 종합 |
| **EasyStar.js** | `easystarjs` | 비동기 A*. 게임 루프 블로킹 없음 |

### 트윈 / 애니메이션

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **GSAP** | `gsap` | 업계 표준. jQuery 대비 20배 빠름 |
| **Tween.js** | `@tweenjs/tween.js` | 심플, Three.js 호환 |
| **Anime.js** | `animejs` | 타임라인, 키프레임, SVG 모핑 |

### 상태 머신

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **XState** | `xstate` | 스테이트차트. 게임 AI, UI 상태 관리에 최적 |
| **javascript-state-machine** | `javascript-state-machine` | 심플 FSM |

### 파티클 시스템

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **tsParticles** | `tsparticles` | ~8,000 스타. 고설정 파티클 |
| **Proton** | `proton-engine` | ~2,470 스타. 게임용 독립 파티클 |
| **Phaser Particles** | (내장) | Phaser 사용 시 별도 설치 불필요 |
| **PixiJS Particle Emitter** | `@pixi/particle-emitter` | PixiJS 전용 |

### 노이즈 & 랜덤

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **simplex-noise** | `simplex-noise` | 70M ops/sec, 시드 지원. 지형 생성용 |
| **seedrandom** | `seedrandom` | 시드 기반 PRNG. Math.random() 대체 |

### 수학

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **gl-matrix** | `gl-matrix` | vec2/3/4, mat3/4. WebGL 수학 표준 (주간 130만 다운로드) |

---

## 8. ECS (Entity Component System)

| 프레임워크 | npm | 성능 (ops/sec) | 특징 |
|-----------|-----|----------------|------|
| **bitECS** | `bitecs` | **246,659** | 최고 성능. 비트마스크 기반 |
| **Becsy** | `@lastolivegames/becsy` | 높음 | 멀티스레드 지원, TS 친화 |
| **Miniplex** | `miniplex` | 중간 | React 하이브리드 프로젝트에 최적 |
| ~~ECSY~~ | ~~ecsy~~ | 13,118 | **사용 금지** (archived, 20배 느림) |

---

## 9. 대화/스토리 시스템

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **inkjs** | `inkjs` | Ink 스크립트 런타임 (Disco Elysium, 80 Days에서 사용) |
| **bondage.js** | `bondage` | Yarn Spinner 포맷 |
| **Tuesday JS** | (GitHub) | JSON 기반 비주얼 노벨 엔진, 비주얼 에디터 |
| **Pixi'VN** | `pixi-vn` | PixiJS 기반 비주얼 노벨 엔진 |

---

## 10. 세이브/로드 시스템

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **localForage** | `localforage` | 비동기, IndexedDB 래퍼. 25,000 스타 |
| **store2** | `store2` | 동기식 localStorage 래퍼 |
| **lz-string** | `lz-string` | 세이브 데이터 압축 (localForage와 조합) |

---

## 11. 절차적 생성 (Procedural Generation)

| 라이브러리 | npm | 특징 |
|-----------|-----|------|
| **rot.js** | `rot-js` | 던전 생성, FOV, 경로탐색, 조명, RNG, 스케줄러 — 로그라이크 올인원 |
| **wavefunctioncollapse** | `wavefunctioncollapse` | WFC 타일맵/이미지 생성 |
| **blazinwfc** | (GitHub) | 고속 WFC, Phaser 타일 인덱스 반환 |
| **node-roguelike** | `node-roguelike` | 방 기반 던전 (~3ms/레벨) |
| **simplex-noise** | `simplex-noise` | 지형 생성 (노이즈) |

---

## 12. 멀티플레이어 / 네트워킹

| 프레임워크 | URL | 특징 | 비용 |
|-----------|-----|------|------|
| **Colyseus** | https://colyseus.io | Node.js 실시간 멀티. 자동 상태 동기화, 매치메이킹 | 무료 (MIT, 셀프호스트) |
| **Nakama** | https://heroiclabs.com/nakama | 풀 게임 백엔드. 매치메이킹, 리더보드, 채팅, 소셜 | 무료 (Apache 2.0, 셀프호스트) |
| **Socket.IO** | https://socket.io | WebSocket 추상화. 룸, 브로드캐스팅 | 무료 (MIT) |
| **Lance.gg** | https://lance.gg | 클라이언트 예측 + 렉 보상 | 무료 (오픈소스) |

---

## 13. 셰이더 / 비주얼 이펙트 (WebGL)

### PixiJS 필터 (2D)

| 필터 | 패키지 | 효과 |
|------|--------|------|
| **CRT** | `@pixi/filter-crt` | CRT 스캔라인 + 곡면 |
| **Bloom** | `@pixi/filter-bloom` | 글로우/블룸 |
| **Godray** | `@pixi/filter-godray` | 빛줄기 효과 |
| **Glitch** | `@pixi/filter-glitch` | 글리치 왜곡 |
| **Dot** | `@pixi/filter-dot` | 도트 매트릭스 |
| **Noise** | `@pixi/filter-noise` | 노이즈 오버레이 |

### Three.js (3D)

| 효과 | 패키지 | 설명 |
|------|--------|------|
| **UnrealBloom** | `three` (내장) | 언리얼 스타일 블룸 |
| **Glitch** | `three` (내장) | 글리치 패스 |
| **Film** | `three` (내장) | 필름 그레인 |

---

## 14. 스프라이트 시트 도구

| 도구 | 타입 | 비용 | 특징 |
|------|------|------|------|
| **TexturePacker** | 데스크톱 | 유료 (무료 티어) | 업계 표준. Phaser/PixiJS/Unity 지원 |
| **free-tex-packer** | CLI + 웹 | **무료** | JSON+PNG 출력 |
| **Spine** | 데스크톱 | 에디터 유료 | 2D 스켈레탈 애니메이션. IK, 메시 |
| **DragonBones** | 데스크톱 | **무료** | Spine 대안 (관리 저조) |

런타임: `@esotericsoftware/spine-pixi` (PixiJS), `@esotericsoftware/spine-phaser` (Phaser)

---

## 15. 수익화 SDK (웹 게임)

| 플랫폼 | SDK 문서 | MAU | 접근 |
|--------|----------|-----|------|
| **Poki** | https://sdk.poki.com | 1억 | 초대/승인제 |
| **CrazyGames** | https://docs.crazygames.com/sdk/html5-v2/intro | 3,500만 | **오픈 제출** — 시작하기 좋음 |
| **GameDistribution** | https://gamedistribution.com | 3억+ | CPM 광고 |

---

## 16. AI 에셋 생성 도구

| 도구 | URL | 용도 | 비용 |
|------|-----|------|------|
| **PixelLab AI** | https://pixellab.ai | 픽셀아트 캐릭터, 맵, 스프라이트시트 애니메이션 | 프리미엄 |
| **Rosebud AI** | https://lab.rosebud.ai/ai-game-assets | 텍스트→스프라이트, 타일셋, 모든 스타일 | 프리미엄 |
| **SEELE AI** | https://seeles.ai/features/tools/sprite.html | 무료 AI 스프라이트 생성. 로그인 불필요 | **무료** |
| **PixelBox (LlamaGen)** | https://llamagen.ai/ai-pixel-art-generator | 이미지→애니메이션 픽셀 스프라이트시트 | 무료 티어 |
| **Pixa** | https://pixa.com/create/sprite-generator | AI 스프라이트 생성, 워터마크 없음 | 무료 티어 |
| **OpenArt Sprite** | https://openart.ai/generator/sprite | 가입 시 50 크레딧 | 프리미엄 |

---

## 17. 완성된 게임 템플릿 / 스타터

| 템플릿 | GitHub | 스택 |
|--------|--------|------|
| **phaserjs/template-vite-ts** | https://github.com/phaserjs/template-vite-ts | Phaser 3 + Vite + TS (**공식**) |
| **phaser-by-example** | https://github.com/phaserjs/phaser-by-example | 9개 완성 게임 예제 |
| **ourcade/phaser3-vite-template** | https://github.com/ourcade/phaser3-typescript-vite-template | 커뮤니티, 문서 풍부 |
| **LittleJS** | https://github.com/KilledByAPixel/LittleJS | ~5KB 엔진, 게임잼 우승작 |
| **excalibur-ts-starter** | https://github.com/excaliburjs/excalibur-ts-starter | Excalibur + Vite + TS |

---

## 18. 추천 기본 스택 (예산 $0)

```
엔진:          Phaser 3 + TypeScript + Vite
스프라이트:     Kenney.nl (CC0)
픽셀 에디터:    Pixelorama (오픈소스)
타일맵:        LDtk (최고 UX)
SFX:           jsfxr (브라우저 생성)
BGM:           OpenGameArt 칩튠 (CC0)
폰트:          Press Start 2P (Google Fonts)
물리:          Matter.js (필요 시)
경로탐색:      PathFinding.js
상태머신:      XState
절차적생성:    rot.js + simplex-noise
세이브:        localForage + lz-string
멀티플레이:    Colyseus (Node.js, 셀프호스트)
ECS:           bitECS (고성능 필요 시)
수익화:        CrazyGames SDK → Poki (트랙션 확보 후)
```

**총 비용: $0** — 전부 무료/오픈소스로 상업 게임 출시 가능
