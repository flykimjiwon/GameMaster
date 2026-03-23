# Merge Battle TD — 테마 구현 가이드

> 구현 완료: 1.세포생물학, 2.종이접기, 3.스테인드글라스
> 미구현 컨셉(4~26) 상세 구현 가이드

---

## 구현된 테마 시스템 구조

```
src/themes/ThemeSystem.ts
├── ThemeConfig (인터페이스)
│   ├── 배경/그리드/경로/HUD 색상
│   ├── towerVisuals: 타워별 색상/모양/알파
│   ├── enemyVisuals: 적별 색상/모양/반경
│   ├── drawTower(): 커스텀 타워 그리기
│   ├── drawEnemy(): 커스텀 적 그리기
│   ├── drawGrid(): 커스텀 그리드 셀 그리기
│   └── drawPath(): 커스텀 경로 그리기
├── CELL_THEME (세포생물학)
├── ORIGAMI_THEME (종이접기)
└── STAINEDGLASS_THEME (스테인드글라스)
```

### 새 테마 추가 방법
1. `ThemeSystem.ts`에 `ThemeConfig` 객체 추가
2. `THEMES` Record에 등록
3. `ThemeId` 유니온 타입에 추가
4. 끝. 모든 Scene/Entity가 자동으로 테마를 참조함

---

## 4. 수묵화/캘리그라피 (구현 가이드)

### 비주얼 키워드
- 한지 텍스처 배경 (크림색 #f5f0e0)
- 검은 먹물 붓터치로 그린 타워 실루엣
- 붉은 먹(주사) 적 캐릭터
- 번짐(bokashi) 그라데이션 배경
- 타워 위에 한자/한글 서예 표시

### drawTower 구현 핵심
```typescript
// 붓질 느낌: 두께 변화가 있는 선으로 사각형 그리기
gfx.lineStyle(4, 0x222222, 0.8); // 시작: 두꺼운 먹
// 불규칙한 선 (약간의 떨림 offset 추가)
// 중심에 한자: 弓(아처), 砲(캐논), 氷(슬로우)
```

### drawEnemy 구현 핵심
```typescript
// 붉은 먹으로 그린 요괴
gfx.fillStyle(0xcc3333, 0.7); // 주사 색
// 번짐 효과: 같은 도형을 alpha 낮춰서 약간 크게 그리기
gfx.fillStyle(0xcc3333, 0.2);
gfx.fillCircle(0, 0, r + 5); // 번짐
```

### 에셋
- 600 Brush-Stroke Icons (itch.io, CC-BY 4.0)
- 배경: 한지 텍스처 자체 생성 (노이즈 + 크림색)

### 난이도: 상 (커스텀 붓질 렌더링 필요)

---

## 5. 보드게임/탁상 (구현 가이드)

### 비주얼 키워드
- 나무 보드판 배경 (#8B7355)
- 마분지 스탠디 타워 (접힌 탭 포함)
- 미니어처 피규어 적
- 주사위/카드 UI 요소

### drawTower 구현 핵심
```typescript
// 카드보드 스탠디
gfx.fillStyle(0xddccaa, 0.95); // 마분지색
gfx.fillRect(-s, -s, s*2, s*2);
// 접힌 탭 (아래)
gfx.fillStyle(0xccbb99, 0.8);
gfx.fillTriangle(-s/2, s, s/2, s, 0, s+8);
// 카드보드 텍스처: 수평 줄무늬
gfx.lineStyle(1, 0xbbaa88, 0.2);
for (let i = 0; i < 5; i++) gfx.lineBetween(-s, -s + i*s*0.5, s, -s + i*s*0.5);
```

### 에셋: Kenney Board Game Pack (490개, CC0) — 바로 사용 가능

### 난이도: 중

---

## 6. 직물/뜨개질 (구현 가이드)

### 비주얼 키워드
- 천 텍스처 배경 (린넨/캔버스)
- 실타래/바늘 타워
- 좀벌레/올풀림 적
- 격자 무늬 = 뜨개질 패턴

### drawGrid 핵심
```typescript
// 격자 = 뜨개질 눈코 패턴
gfx.lineStyle(1, 0xaa8866, 0.4);
// V자 반복 패턴으로 셀 채우기
for (let i = 0; i < 4; i++) {
  const cx = x + 10 + i * 20;
  gfx.lineBetween(cx-5, y+h/2-5, cx, y+h/2+5);
  gfx.lineBetween(cx, y+h/2+5, cx+5, y+h/2-5);
}
```

### 난이도: 중

---

## 7. 산호초/해양 생태계 (구현 가이드)

### 비주얼 키워드
- 어두운 심해 배경 + 열대 색상 (#0a1a2a → 산호핑크/전기블루)
- 산호/말미잘 타워 (유기적 곡선)
- 침입종/오염물 적
- 물 인과 (caustic) 빛 오버레이
- 버블 파티클

### drawTower 핵심
```typescript
// 산호 — 불규칙한 가지 모양
gfx.fillStyle(0xff6688, 0.8);
// 여러 원을 겹쳐서 산호 가지 표현
for (let i = 0; i < 5; i++) {
  const angle = (i/5)*Math.PI*2;
  gfx.fillCircle(Math.cos(angle)*s*0.4, Math.sin(angle)*s*0.4, s*0.35);
}
```

### 에셋: OpenGameArt Coral Reef BG + Underwater Enemies (itch.io)

### 난이도: 중

---

## 8. 유화 스타일 (구현 가이드)

### 비주얼 키워드
- 임파스토 질감 (두꺼운 물감)
- 네덜란드 정물화 색감 (버밀리온, 엄버, 카드뮴 옐로)
- 모든 스프라이트에 붓질 텍스처 느낌

### 구현 전략
- 각 도형 위에 여러 겹의 반투명 레이어를 미세하게 offset
- 난이도 높음: 실제 유화 느낌을 Graphics만으로 재현하기 어려움
- 스프라이트 사용 추천

### 난이도: 상

---

## 9. 회로기판/전자부품 (구현 가이드)

### 비주얼 키워드
- PCB 녹색 배경 (#1a4a2a)
- 금색 회로 트레이스 경로
- 콘덴서/저항/트랜지스터 타워
- 바이러스 패킷/정전기 적

### drawGrid 핵심
```typescript
gfx.fillStyle(0x1a4a2a, 0.9); // PCB 녹색
gfx.fillRect(x, y, w, h);
// 회로 트레이스
gfx.lineStyle(1, 0xccaa44, 0.3); // 금색
gfx.lineBetween(x, y+h/2, x+w, y+h/2);
// 솔더 포인트
gfx.fillStyle(0xccaa44, 0.5);
gfx.fillCircle(x+w/2, y+h/2, 3);
```

### drawTower 핵심
```typescript
// 콘덴서 (아처)
gfx.fillStyle(0x4488ff, 0.9);
gfx.fillRect(-s*0.3, -s, s*0.6, s*2); // 본체
gfx.lineStyle(2, 0xcccccc, 0.8);
gfx.lineBetween(0, -s, 0, -s-8); // 다리
gfx.lineBetween(0, s, 0, s+8);
```

### 에셋: cpudefense (GitHub 오픈소스) 참고

### 난이도: 하

---

## 10. 곤충 군단 (구현 가이드)

### 비주얼 키워드
- 지하 단면도 배경 (갈색/흙색)
- 개미/벌/무당벌레 타워
- 적 곤충 침략자

### drawEnemy 핵심
```typescript
// 개미 — 3개 원(머리+가슴+배) + 6개 다리
gfx.fillStyle(0x442222, 0.9);
gfx.fillCircle(0, -6, 4); // 머리
gfx.fillCircle(0, 0, 5);  // 가슴
gfx.fillCircle(0, 8, 6);  // 배
// 다리
gfx.lineStyle(1, 0x442222, 0.7);
for (let i = 0; i < 3; i++) {
  gfx.lineBetween(-8, -2+i*4, 8, -2+i*4);
}
```

### 에셋: Animated Insect Enemies 32x32 (itch.io)

### 난이도: 중-하

---

## 11. 연금술/화학 실험실 (구현 가이드)

### 비주얼 키워드
- 실험실 타일 바닥
- 비커/플라스크/버너 타워
- 색깔 액체 (빨강=불, 파랑=물, 초록=독)
- 거품/연기 파티클

### drawTower 핵심
```typescript
// 삼각 플라스크 (아처)
gfx.fillStyle(0x44cc44, 0.3); // 액체
gfx.fillTriangle(-s, s, s, s, 0, -s*0.3);
gfx.lineStyle(2, 0xcccccc, 0.8); // 유리
gfx.strokeTriangle(-s, s, s, s, 0, -s*0.3);
// 플라스크 목
gfx.lineStyle(2, 0xcccccc, 0.8);
gfx.lineBetween(-s*0.2, -s*0.3, -s*0.2, -s);
gfx.lineBetween(s*0.2, -s*0.3, s*0.2, -s);
```

### 에셋: Animated Potion Pack, 48 Alchemy Icons (itch.io, 무료)

### 난이도: 중-하

---

## 12. 우주정거장 내부 (구현 가이드)

### 비주얼 키워드
- 금속 복도 상면도
- 터렛/방어벽/레이저 타워
- 외계 탑승대 적
- 적색경보등 깜빡임

### 구현: 그리드 셀을 금속 패널로, 경로를 복도로 표현

### 난이도: 중

---

## 13. 포스트아포칼립스 자연회복 (구현 가이드)

### 비주얼 키워드
- 회색 폐허 + 초록 덩굴 대비
- 식물/이끼 타워
- 방랑자/돌연변이 적

### drawGrid 핵심: 회색 콘크리트 + 이끼 오버레이

### 에셋: Kenney Nature Kit (330, CC0)

### 난이도: 중

---

## 14. 칠판/낙서 (구현 가이드)

### 비주얼 키워드
- 검정/녹색 칠판 배경
- 흰/색 분필 선 (jitter 효과)
- 지우개 스머지 이펙트

### drawTower 핵심
```typescript
// 떨리는 사각형 (분필 효과)
gfx.lineStyle(2, 0xffffff, 0.8);
const jitter = () => (Math.random() - 0.5) * 2;
gfx.beginPath();
gfx.moveTo(-s + jitter(), -s + jitter());
gfx.lineTo(s + jitter(), -s + jitter());
gfx.lineTo(s + jitter(), s + jitter());
gfx.lineTo(-s + jitter(), s + jitter());
gfx.closePath();
gfx.strokePath();
```

### 에셋: 불필요 (자체 Graphics만으로 완성)

### 난이도: 하

---

## 15. 귀신의 집 (구현 가이드)

### 비주얼 키워드
- 어두운 보라/세피아 톤
- 촛대/갑옷/괘종시계 타워
- 유령/고스트 적 (반투명)
- 안개 파티클, 촛불 깜빡

### drawEnemy 핵심
```typescript
// 유령 — 반투명 흔들리는 형태
gfx.fillStyle(0xddddff, 0.5);
gfx.fillCircle(0, -r*0.3, r*0.8); // 머리
gfx.fillRect(-r*0.8, -r*0.3, r*1.6, r); // 몸
// 하단 물결
for (let i = 0; i < 4; i++) {
  const bx = -r*0.8 + i*r*0.4;
  gfx.fillCircle(bx+r*0.2, r*0.7, r*0.25);
}
```

### 에셋: Cotton Boo Ghost, Wraith 48x48, KR Haunted Tileset (itch.io)

### 난이도: 하

---

## 16. 음악/악기 (구현 가이드)

### 비주얼 키워드
- 오선지 경로
- 바이올린/드럼/신스 타워
- 음파 링 공격 이펙트
- 소음 몬스터 적

### drawPath 핵심: 5줄 오선지 선으로 경로 표현

### 특이사항: 타워 배치 시 BGM 레이어 추가 (Phaser Sound)

### 난이도: 중

---

## 17. 장난감/미니어처 (구현 가이드)

### 비주얼 키워드
- 카펫/나무 바닥 배경
- 레고/병정/액션피규어 타워
- 틸트시프트 느낌 (상하 블러)

### 특이사항: 카메라 후처리로 depth-of-field 효과

### 에셋: itch.io Toy assets

### 난이도: 중

---

## 18~26. 간략 구현 노트

| # | 컨셉 | 핵심 구현 포인트 | 난이도 |
|---|------|----------------|--------|
| 18 | 사탕/디저트 | 분홍 배경, 원형 도형, 스프링클 파티클 | 하 |
| 19 | 스팀펑크 | 세피아 톤, 기어 도형, 증기 파티클 | 중 |
| 20 | 사이버펑크 네온 | 검정 배경, 네온 아웃라인만, bloom 느낌 glow | 하 |
| 21 | 일본 신토/에도 | 수채화 톤, 부적 사각형, 요괴 도형 | 중 |
| 22 | 한국/브라질 민화 | 토템 도형, 밝은 민화 색상 | 중 |
| 23 | 요리/음식 전쟁 | 주방 배경, 조리도구 타워, 벌레 적 | 하 |
| 24 | 고대 이집트 | 모래색 배경, 피라미드 삼각형, 미이라 적 | 중-하 |
| 25 | 노르드 신화 | 얼음색 배경, 룬 문자, 서리 거인 적 | 중-하 |
| 26 | 딥씨/심해 | 칠흑 배경, 생물발광 타워, 심해어 적 | 중 |

---

## ThemeConfig 타입 참조

새 테마를 만들 때 아래 필드를 모두 채우면 됩니다:

```typescript
interface ThemeConfig {
  id: ThemeId;
  name: string;          // 영문명
  nameKo: string;        // 한글명
  background: number;    // 배경색 hex
  gridCellColor: number;
  gridCellAlpha: number;
  gridLineColor: number;
  gridLineAlpha: number;
  pathColor: number;
  pathAlpha: number;
  pathLineColor: number;
  pathLineWidth: number;
  hudBgColor: number;
  hudBgAlpha: number;
  hudTextColor: string;  // CSS color
  hudAccentColor: string;
  panelBgColor: number;
  panelBgAlpha: number;
  towerVisuals: Record<TowerType, TowerVisual>;
  enemyVisuals: Record<EnemyType, EnemyVisual>;
  projectileColor: number;
  projectileGlow: number;
  mergeParticleColors: number[];
  deathParticleColor: number;
  hitFlashColor: number;
  // Optional custom draw functions
  drawTower?: (gfx, type, tier, size) => void;
  drawEnemy?: (gfx, type) => void;
  drawGrid?: (gfx, x, y, w, h, isPath) => void;
  drawPath?: (gfx, waypoints) => void;
}
```
