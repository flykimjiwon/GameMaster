# GameMaster - 캐주얼 게임 개발 종합 리서치

> 2026-03-23 작성 | Next.js + Python + Unity 개발자를 위한 전략 문서

---

## 1. 개발자 프로필 (현재 기술 스택)

| 영역 | 기술 |
|------|------|
| **프론트엔드** | Next.js 15-16, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| **백엔드** | FastAPI, Python 3.11+, PostgreSQL, SQLite, Supabase |
| **AI/ML** | OpenAI, Claude, Gemini, Ollama, RAG (pgvector) |
| **인프라** | Docker, Turborepo, Git LFS, GitHub Actions |
| **게임(경험)** | Unity 기초, Phaser.js (sajuMarket_world에서 사용) |
| **기타** | Voice Cloning, WordPress 자동화, SEO, 카카오 SDK |

**핵심 강점**: 풀스택 웹 개발 + Python 백엔드 + AI 통합 → 게임 서버/백엔드/LiveOps에 즉시 활용 가능

---

## 2. 게임 엔진/프레임워크 비교

### 2A. 웹 게임 엔진 (TypeScript 활용)

| 엔진 | 타입 | TS 지원 | 빌드 크기 | 로딩 | 추천 장르 |
|------|------|---------|-----------|------|-----------|
| **Phaser 3** | 풀 엔진 | 네이티브 | 0.5-5 MB | 즉시 | 2D 전반 (퍼즐, 아케이드, 플랫포머) |
| **PixiJS v8** | 렌더러 | 내장 | 0.2-3 MB | 즉시 | UI 중심 (카드, 슬롯) |
| **KAPLAY** | 풀 엔진 | 포함 | 1-3 MB | 즉시 | 초경량 캐주얼, 게임잼 |
| **Excalibur.js** | 풀 엔진 | TS-first | 1-5 MB | 즉시 | 2D (타입 안전 중시) |
| **Three.js / R3F** | 3D 렌더러 | Good | 2-10 MB | 빠름 | 3D 웹 게임 |
| **Cocos Creator** | 풀 엔진 | 네이티브 | 3-15 MB | 빠름 | 모바일+웹 크로스 (아시아 시장) |

### 2B. 네이티브/크로스플랫폼 엔진

| 엔진 | 비용 | 언어 | 강점 | 약점 |
|------|------|------|------|------|
| **Unity 6** | 무료 (<$200K) | C# | 71% 모바일 게임 점유, 최대 에셋 스토어 | WebGL 빌드 무거움 (20-50MB+) |
| **Godot 4/5** | 무료 (MIT) | GDScript/C# | 완전 무료, 경량, 오픈소스 | 에셋 생태계 작음 |
| **Cocos Creator** | 무료 | TypeScript | 아시아 시장 최적, 미니게임 내보내기 | 서양 커뮤니티 작음 |

### 2C. 핵심 판단 기준: Web vs Unity

| 요소 | 웹 (Phaser/PixiJS) | Unity |
|------|---------------------|-------|
| **빌드 크기** | 0.5-5 MB | 20-50+ MB (WebGL) / 30-100 MB (모바일) |
| **로딩 시간** | 즉시 | WebGL: 20-60초 / 네이티브: 2-5초 |
| **설치 필요** | 없음 (URL 클릭) | 앱스토어 다운로드 |
| **개발 속도** | 매우 빠름 (핫 리로드) | 보통 (컴파일 필요) |
| **수익화 천장** | 중간 ($100K-$1M/년) | 높음 ($1M+ 가능) |
| **배포** | git push → 즉시 | 스토어 심사 1-7일 |
| **타겟 플랫폼** | 브라우저, 텔레그램, 디스코드 | 앱스토어, 스팀, 콘솔 |
| **3D 지원** | Three.js로 제한적 | 풀 3D |
| **UA 비용** | $0 (플랫폼이 트래픽 제공) | $1-5/설치 (유료 광고) |

**결론**: 캐주얼 2D 게임이라면 **웹이 압도적으로 유리**. 3D/복잡한 물리/앱스토어 필수라면 Unity.

---

## 3. 플랫폼별 배포 가이드

### 3A. 웹 게임 플랫폼

| 플랫폼 | MAU | 수익 모델 | 개발자 수익 |
|--------|-----|-----------|-------------|
| **Poki** | 1억 | 광고 수익 공유 | 직접 트래픽 100%, Poki 유입 50/50 |
| **CrazyGames** | 3,500만 | 광고 수익 공유 | 독점 계약 시 +50% |
| **itch.io** | 수백만 | 판매/기부 | 90%+ (개발자 설정) |
| **HTML5 라이센싱** | - | 일괄 판매 | $200-$40,000/건 |

**Poki 상세**: 톱 스튜디오 연 **$1M** 수익. 5년 전 $50K 벌던 스튜디오가 현재 $1M. 월 10억 플레이 (2025.06 달성).

### 3B. 텔레그램 미니앱

- **MAU**: 10억 (텔레그램 전체)
- **수익**: 텔레그램 Stars(인앱 화폐) + 광고 + IAP + 크립토(TON)
- **스택**: HTML5/TypeScript 웹앱 → WebView로 실행 → **기존 웹 기술 그대로 사용**
- **사례**: Hamster Kombat 3억 유저 / Notcoin 3,500만 유저
- **현실적 수익**: 솔로 개발자 기준 월 $5,000-$35,000 (성공 시)
- **주의**: 탭투언 장르는 포화, 퍼즐/RPG 미니앱이 성장 중

### 3C. 디스코드 액티비티

- **수익 분배**: 개발자 **90%** / 디스코드 10% → 업계 최고 조건
- **개발비 지원**: App Pitches 프로그램 최대 **$30,000**
- **효과**: Social SDK 연동 시 세션 길이 +48%, 플레이 일수 +25%
- **스택**: 웹앱 (TypeScript/React 그대로 사용)

### 3D. Unity → 앱스토어 (iOS)

```
1. Apple Developer Program 가입 ($99/년)
2. Unity Build Settings → iOS 선택
3. Bundle ID, 서명 팀, ARM64 설정
4. Build → Xcode 프로젝트 생성
5. Xcode에서 인증서 + 프로비저닝 프로파일 설정
6. TestFlight 내부 테스트 (100명까지)
7. App Store Connect에 메타데이터 + 스크린샷 업로드
8. Xcode Organizer → Distribute App → App Store Connect
9. Apple 심사 (1-3일)
10. 출시
```

**필수 체크**:
- 코드 서명 인증서 + 프로비저닝 프로파일 생성
- IARC 연령 등급 질문지 완료
- 한국 배포 시 GRAC 등급 자동 부여 (IARC 통합)

### 3E. Unity → Google Play

```
1. Google Play Console 가입 ($25, 일회)
2. Unity Build Settings → Android 선택
3. AAB(Android App Bundle) 형식으로 빌드 (필수)
4. Keystore 생성 및 안전 백업 (분실 시 업데이트 불가!)
5. 테스트 트랙: Internal → Closed → Open → Production
6. Play Console에 메타데이터 + 스크린샷
7. Google 심사 (수시간-수일)
```

**2025 주의사항**: Google Play Billing Library v7 필수 (2025.08~). Unity IAP v5.0.0+ 사용해야 함.

### 3F. Unity → Steam

```
1. Steamworks 개발자 계정 ($100/앱, 매출 $1,000 도달 시 환급)
2. Steamworks.NET 패키지 임포트
3. steam_appid.txt에 앱 ID 설정
4. SteamAPI.Init() 초기 Awake()에서 호출
5. SteamPipe로 빌드 업로드 (steamcmd 사용)
6. "Coming Soon" 페이지 먼저 공개 → 위시리스트 수집 (7,000+ 목표)
7. Valve 심사 (3-5일)
8. 10-20% 출시 할인으로 알고리즘 부스트
```

**Steam Deck**: Unity 게임은 Proton 호환 레이어로 실행. Verified/Playable/Unsupported 등급.

### 3G. 콘솔 (참고)

| 콘솔 | 프로그램 | 비용 | 필수 |
|------|---------|------|------|
| Nintendo Switch | Nintendo Developer Portal | 무료 (승인 필요) | Unity Pro 필수 |
| PlayStation | PlayStation Partners | NDA 필요 | Unity Pro 필수 |
| Xbox | ID@Xbox | 무료 | Unity Pro 필수 |

**Unity Pro 필수**: 2024년부터 콘솔 배포에는 Unity Pro ($2,200/년) 필요.

### 3H. 배포 비용 요약

| 항목 | 비용 |
|------|------|
| Unity Personal | 무료 (매출 <$200K) |
| Unity Pro (콘솔 필요 시) | $2,200/년 |
| Apple Developer | $99/년 |
| Google Play | $25 (일회) |
| Steam (앱당) | $100 (환급 가능) |
| itch.io | $0 |
| 웹 (Poki/CrazyGames) | $0 |
| 텔레그램/디스코드 | $0 |
| **솔로 개발자 최소 비용** | **$0 (웹) ~ $224 (모바일+스팀)** |

---

## 4. 수익화 전략

### 4A. 수익 모델 비교

| 모델 | 설명 | 수익 잠재력 | 적합 장르 |
|------|------|------------|-----------|
| **리워드 광고** | 15-30초 광고 시청 → 보상 | $10-40 CPM (미국/한국) | 모든 캐주얼 |
| **전면 광고** | 레벨 사이 풀스크린 | $3-15 CPM | 하이퍼캐주얼 |
| **인앱 구매** | 코인/부스터/스킨 구매 | 높음 (무제한) | 퍼즐, 머지 |
| **배틀 패스** | $4.99-9.99/시즌 | 총 IAP의 22% | 중간 이상 캐주얼 |
| **구독** | $4.99-9.99/월 VIP | 예측 가능 수익 | 리텐션 높은 게임 |
| **하이브리드** | 광고 + IAP + 구독 | 최고 | 하이브리드 캐주얼 |

**2026 추천 기본 전략**: 리워드 광고 + 가벼운 IAP(부스터/스킨) + 선택적 VIP 구독

### 4B. 장르별 수익 잠재력

| 장르 | 시장 규모 | 개발 기간 | 솔로 개발 수익 | 위험도 |
|------|----------|-----------|---------------|--------|
| **아이들/방치형** | $2.5B (연 10% 성장) | 2-8주 | $500-$1M/년 | 낮음 |
| **하이퍼캐주얼** | $690M (2025 상위 100) | 1-4주 | $10K-$200K | 낮음 |
| **퍼즐 (매치3)** | $6B+ | 3-12개월 | $100K-$10M+ | 높음 |
| **머지** | 성장 중 | 2-6개월 | $50K-$1M | 중간 |
| **타워디펜스** | Coin Master $960M | 3-12개월 | $50K-$500K | 중간 |

### 4C. 한국 시장 특이사항

- **GRAC 등급 필수**: 미등급 게임 배포 불법. IARC 통합으로 자동 부여 가능.
- **확률 공개 의무**: 가챠/뽑기 시스템 확률 반드시 표시
- **미성년자 월 지출 한도**: 7만원 / 성인 한도: 50만원
- **결제**: Toss Payments, KakaoPay (기존 프로젝트에 카카오 SDK 설정 경험 있음)
- **인기 장르**: 퍼즐, 소셜 카지노/보드게임, 수집형 RPG, 캐릭터 IP 게임

---

## 5. Claude Code + Unity 개발 워크플로우

### 5A. Claude Code가 Unity에서 할 수 있는 것

| 가능 | 불가능 |
|------|--------|
| C# 스크립트 읽기/쓰기/리팩토링 | Unity Editor GUI 조작 |
| MonoBehaviour, ScriptableObject 작성 | Play Mode 직접 실행 |
| 셰이더 코드 작성 | Inspector에서 값 변경 |
| Editor 스크립트/커스텀 에디터 작성 | Scene View 조작 |
| package.json, asmdef 설정 | Asset Store 브라우징 |
| .gitignore, CI/CD 설정 | |

### 5B. Unity MCP — Claude Code ↔ Unity Editor 연동

**2025-2026년 핵심 발전**: MCP(Model Context Protocol)로 Claude Code가 Unity Editor를 **직접 제어** 가능!

| 패키지 | 기능 | GitHub |
|--------|------|--------|
| **Coplay MCP** | GameObject 생성, 컴포넌트 수정, 씬 생성 | CoplayDev/unity-mcp |
| **IvanMurzak Unity-MCP** | C# 메서드에 속성 하나로 MCP 툴 등록 | IvanMurzak/Unity-MCP |
| **CoderGamester mcp-unity** | 전체 에디터 자동화 | CoderGamester/mcp-unity |

**설치 후 가능한 것**:
```
"빈 씬에 큐브 100개를 랜덤 위치에 배치해줘"
"PlayerController에 점프 기능 추가해줘"
"현재 씬에서 모든 라이트의 intensity를 2로 변경해줘"
```

### 5C. 추천 IDE 설정

**최적 조합**: JetBrains Rider + Claude Code + Unity Editor

```
[Unity Editor] ←→ [Unity MCP] ←→ [Claude Code CLI]
      ↑                                    ↑
      └──── [JetBrains Rider] ────────────┘
             (C# 편집/디버깅)
```

- **Rider 2025.2+**: 내장 MCP 서버로 Claude Code ↔ Rider 직접 연동
- **Claude Code JetBrains 플러그인**: Rider 터미널에서 claude 바로 실행
- **대안**: VS Code + Unity C# 확장 + Claude Code

### 5D. AI 개발 도구 생산성

| 연구 | 결과 |
|------|------|
| GitHub Copilot 연구 (n=95) | 작업 완료 **55% 빨라짐** (p=0.0017) |
| Atlassian 2025 설문 | 주간 **4.1시간** 절약 (전년 대비 2배) |
| Unity CEO 주장 | "5-10배 생산성" (미검증) |
| 게임 개발자 AI 도구 사용률 | **62%** (Unity 2024 보고서) |

### 5E. Unity 개발 필수 도구

| 도구 | 용도 |
|------|------|
| **Git + Git LFS** | 버전 관리 (.png, .fbx, .mp3 → LFS) |
| **GameCI** | CI/CD (GitHub Actions + Unity 빌드 자동화) |
| **Steamworks.NET** | Steam 연동 (업적, 리더보드, 클라우드 저장) |
| **Unity Test Framework** | NUnit 기반 테스트 (Edit Mode / Play Mode) |
| **Unity LevelPlay** | 광고 미디에이션 (구 ironSource) |

---

## 6. 인디 개발자 성공 사례

### 6A. 솔로/소규모 히트작

| 게임 | 팀 규모 | 매출 | 장르 | 핵심 요인 |
|------|---------|------|------|-----------|
| Stardew Valley | 1명 | $300M+ (누적) | 농장 RPG | 4년 개발, 깊은 콘텐츠 |
| Balatro | 1명 | $25M+ | 포커 로그라이크 | 신선한 메카닉, 바이럴 |
| Schedule I | 솔로 | $151M (2025) | 시뮬 | 코옵 바이럴 |
| Stumble Guys | 소규모 | $168M (누적) | 아케이드 | Unity, 멀티플레이 |
| Among Us | 3명 | $105M (누적) | 소셜 | Unity, 코로나 바이럴 |

### 6B. 수익 분포 현실 (Steam, n=5,000)

| 퍼센타일 | 연 매출 |
|----------|---------|
| 30th | $30 |
| **중앙값** | **$180** |
| 90th | $28,600 |
| 99th | $1,400,000 |
| 99.9th | $15,100,000 |

**현실**: 중앙값은 $180. 상위 10%에 들어야 의미있는 수익. 플랫폼 선택과 마케팅이 핵심.

### 6C. 웹 vs 모바일 솔로 개발자 ROI

| 요소 | 웹 (Poki/CrazyGames) | 모바일 (앱스토어) |
|------|----------------------|-------------------|
| 진입 비용 | $0 | $124 |
| UA 비용 | $0 (플랫폼 트래픽) | $1-5/설치 |
| 첫 플레이어까지 | 수시간 | 1-7일 |
| 현실적 수익 (성공 시) | $10K-$100K/년 | $1K-$20K (마케팅 없이) |
| 상위 수익 | $1M/년 (톱 스튜디오) | $10M+ (대박 시) |

**솔로 개발자 추천**: 마케팅 예산 없으면 **웹 플랫폼이 ROI 압도적으로 높음**.

---

## 7. 솔로 개발자 출시 체크리스트

### 법적 필수사항
- [ ] **개인정보 처리방침** — Apple/Google/GDPR 필수 (무료 생성기 사용)
- [ ] **COPPA** — 13세 미만 접근 가능 시 부모 동의 필요 (위반 시 $40,000/유저)
- [ ] **GDPR** — EU 플레이어 접근 가능 시 적용 (위반 시 매출의 4%)
- [ ] **GRAC 등급** — 한국 배포 시 필수 (IARC로 자동 부여 가능)
- [ ] **확률 공개** — 가챠/뽑기 시스템 사용 시 한국/일본 법적 의무

### 마케팅 최소사항
- [ ] 게임플레이 트레일러 60-90초 (TikTok/Reels/YouTube Shorts)
- [ ] 스크린샷 5장 + 150자 설명 + 키 아트
- [ ] r/indiegaming, r/WebGames, 관련 디스코드 포스팅
- [ ] Steam이면 Coming Soon 페이지 3-6개월 전 공개 (위시리스트 7,000+ 목표)
- [ ] 10-20% 출시 할인

### 애널리틱스 설정
- [ ] **GameAnalytics** (무료) — D1/D7/D30 리텐션, 세션 데이터
- [ ] **Firebase** (무료) — 크래시 리포팅 (모바일)
- [ ] **Google Analytics 4** (무료) — 웹 게임/랜딩페이지

---

## 8. 추천 전략 (액션 플랜)

### Phase 1: 웹 게임으로 빠른 출시 (1-2개월)

```
기술: Phaser 3 + TypeScript + Vite
장르: 아이들/클리커 게임 (가장 빠른 개발-수익 사이클)
배포: 동시에 4곳
  ├── Poki / CrazyGames (웹 트래픽)
  ├── 텔레그램 미니앱 (10억 MAU)
  ├── 디스코드 액티비티 (90/10 수익 분배)
  └── itch.io (인디 커뮤니티)
백엔드: FastAPI (리더보드, 세이브, 분석)
수익: 리워드 광고 + 텔레그램 Stars
목표: 월 $1,000-$10,000
```

### Phase 2: 웹 게임 포트폴리오 확장 (3-6개월)

```
2-3개 추가 게임 개발 (다른 장르 실험)
HTML5 라이센싱으로 추가 수익 ($200-$15,000/건)
LiveOps: 주간 이벤트, 시즌 콘텐츠
배틀 패스 도입 ($4.99/시즌)
```

### Phase 3: 모바일/스팀 진출 (6-12개월)

```
가장 성과 좋은 웹 게임 → Unity로 리메이크
또는 Cocos Creator로 모바일 + 웹 동시 빌드
앱스토어 + Google Play 출시
수익: IAP + 리워드 광고 + 구독
스팀 출시 (Coming Soon 먼저, 위시리스트 수집)
```

### Phase 4: 규모 확장 (12개월+)

```
머지/퍼즐 게임 도전 (높은 수익 천장)
Unity + LevelPlay 광고 미디에이션
한국 시장 특화 (카카오톡 연동, GRAC 등급)
코옵 멀티플레이 (2025 트렌드: 코옵 = 인디 대박 공식)
```

---

## 9. 핵심 판단

### "캐주얼 게임이라면 웹을 사용하는 것도 방법일까?"

**YES — 오히려 웹이 더 나은 선택인 경우가 많다.**

| 근거 | 데이터 |
|------|--------|
| 솔로 개발자 ROI | 웹이 압도적 (UA 비용 $0, 즉시 배포) |
| 기존 스킬 활용 | TypeScript/React 그대로 사용 (학습 비용 0) |
| 시장 성장 | HTML5 게임 시장 2026년 $11.8B 전망 |
| 다중 배포 | 하나의 코드로 Poki+텔레그램+디스코드+itch.io |
| Poki 성장 | 5년 만에 개발자 수익 20배 증가 |
| 빌드 크기 | Phaser 1-5MB vs Unity WebGL 20-50MB |

**Unity를 선택해야 하는 경우**: 3D 게임, 복잡한 물리, 앱스토어 IAP 집중 수익화, 콘솔 진출 목표

**추천**: Phase 1은 **웹 (Phaser + TypeScript)**으로 시작. 검증된 게임을 Phase 3에서 Unity/모바일로 포팅.

---

## 참고 자료

### 게임 엔진
- [Phaser TypeScript Tutorial](https://phaser.io/tutorials/how-to-use-phaser-with-typescript)
- [KAPLAY.js](https://kaplayjs.com/)
- [Cocos Creator GitHub](https://github.com/cocos/cocos-engine)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)

### 플랫폼
- [Poki 개발자 SDK](https://sdk.poki.com/index.html)
- [CrazyGames 개발자 포털](https://developer.crazygames.com/)
- [텔레그램 미니앱 수익화 2026](https://merge.rocks/blog/telegram-mini-apps-2026-monetization-guide-how-to-earn-from-telegram-mini-apps)
- [디스코드 개발자 문서](https://discord.com/developers)
- [Steamworks.NET](https://steamworks.github.io/gettingstarted/)

### 수익화
- [모바일 게임 수익화 2026 — StudioKrew](https://studiokrew.com/blog/mobile-game-monetization-models-2026/)
- [배틀 패스 사례 — Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/battle-pass)
- [하이브리드 캐주얼 Q1 2025 — AppMagic](https://appmagic.rocks/blog/hybridcasual-q1-2025/)

### Unity 배포
- [Unity iOS 빌드 서명](https://docs.unity.com/ugs/en-us/manual/devops/manual/build-automation/sign-build-artifacts/sign-an-ios-application)
- [Unity Steam 출시 가이드](https://medium.com/@yoonicode/publishing-unity-games-on-steam-the-ultimate-guide-5e09fc812c65)
- [GameCI — Unity CI/CD](https://game.ci/docs/github/getting-started/)

### AI 개발 도구
- [Unity MCP — Coplay](https://github.com/CoplayDev/unity-mcp)
- [Unity MCP — IvanMurzak](https://github.com/IvanMurzak/Unity-MCP)
- [Rider + Claude Code](https://sharkpillow.com/post/rider-claude/)

### 한국 시장
- [GRAC 공식](https://www.grac.or.kr/english/)
- [한국 게임법 2025 — Chambers](https://practiceguides.chambers.com/practice-guides/gaming-law-2025/south-korea)
- [카카오 게임즈 — Inquivix](https://inquivix.com/kakao-games/)
