# 웹 게임 플랫폼 & 검색 활성화 가이드

> 플랫폼별 가입 → 등록 → SDK 연동 → 검색 노출까지 실전 단계

---

## 1. Poki (월 10억 플레이, 톱 스튜디오 연 $1M)

### 가입 & 등록
1. https://developers.poki.com 접속
2. "Submit your game" 클릭
3. 개발자 계정 생성 (이메일 인증)
4. 게임 정보 제출: 제목, 설명, 스크린샷, 플레이 가능 URL
5. **큐레이션 심사** — Poki 팀이 직접 플레이 후 승인/거절 (1-4주)

### SDK 연동 (필수)
```bash
npm install poki-sdk
```

```typescript
// game.ts
import PokiSDK from 'poki-sdk';

// 초기화
await PokiSDK.init();

// 게임 시작 시
PokiSDK.gameplayStart();

// 게임 종료 시
PokiSDK.gameplayStop();

// 광고 표시 (레벨 사이)
await PokiSDK.commercialBreak();

// 리워드 광고
const rewarded = await PokiSDK.rewardedBreak();
if (rewarded) {
  // 보상 지급
}
```

### 수익
- 직접 트래픽 (북마크, 검색): **수익 100%**
- Poki 유입 트래픽: **50/50 분배**
- Web Exclusive 계약 시: 7년 웹 독점, 모바일/스팀은 가능

### 검색 노출
- Poki가 자체 SEO 처리 (Google에서 "게임명 poki"로 노출)
- 개발자가 별도로 SEO 할 필요 없음
- 게임 태그, 카테고리를 정확히 설정하면 Poki 내부 검색에서 노출

---

## 2. CrazyGames (MAU 3,500만)

### 가입 & 등록
1. https://developer.crazygames.com 접속
2. "Create account" → 개발자 등록
3. "Upload a game" → 게임 파일 업로드 (HTML5 zip 또는 Unity WebGL)
4. 메타데이터 입력: 제목, 설명, 태그, 카테고리, 스크린샷
5. 심사 후 게시 (보통 1-2주)

### SDK 연동
```bash
npm install @nicecactus/crazygames-sdk
# 또는 CDN
```

```html
<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
```

```typescript
// 초기화
const sdk = await window.CrazyGames.SDK.init();

// 광고
await sdk.ad.requestAd("midgame"); // 전면 광고
const result = await sdk.ad.requestAd("rewarded"); // 리워드 광고

// 리더보드
await sdk.game.happytime(); // 좋은 순간에 호출 → 추천 알고리즘 boost
```

### 수익
- 기본 수익 공유 (비율 비공개, 업계 기준 40-60%)
- **2개월 독점 계약 시 +50% 수익 boost**

### 최적화 패키지 (Unity용)
```
https://github.com/CrazyGamesCom/unity-optimizations-package
```

---

## 3. itch.io (인디 커뮤니티)

### 가입 & 등록
1. https://itch.io/register 계정 생성
2. https://itch.io/game/new → 새 프로젝트
3. **Kind of project**: HTML → 브라우저 플레이 가능
4. 게임 빌드 zip 업로드
5. "This file will be played in the browser" 체크
6. Embed options: 게임 해상도 설정
7. 가격: 무료 / 기부 / 유료 ($100 수수료로 유료 게임 등록)
8. **즉시 게시** — 심사 없음

### 설정 팁
```
Visibility: Public
Genre: 선택
Tags: 최대 10개 (검색 핵심!)
Community: Comments 활성화
```

### 수익
- 기본: **수익 90%** (itch.io 10%)
- 개발자가 비율 직접 설정 가능 (0% ~ 100% itch.io 기부)
- Open Revenue Sharing: 플레이어가 비율 선택도 가능

### 검색 노출
- **태그가 핵심**: `idle`, `clicker`, `casual`, `browser`, `html5` 등
- itch.io 내부 검색 + Google 인덱싱 자동
- 게임잼 참가 → 노출 급증

---

## 4. Newgrounds

### 가입 & 등록
1. https://www.newgrounds.com/passport/signup 계정 생성
2. https://www.newgrounds.com/projects/games → Upload
3. HTML5 게임: zip 파일 업로드
4. **Newgrounds API** 연동 (선택, 메달/스코어보드)
5. 커뮤니티 투표로 Featured 선정

### API 연동
```html
<script src="https://uploads.ungrounded.net/alternate/1895829/1895829_alternate_168605.js"></script>
```

```typescript
// Newgrounds.io API
const ngio = new Newgrounds.io.core('APP_ID', 'AES_KEY');

// 메달 잠금 해제
ngio.callComponent('Medal.unlock', { id: 12345 });

// 스코어 등록
ngio.callComponent('ScoreBoard.postScore', {
  id: 67890,
  value: score
});
```

---

## 5. 텔레그램 미니앱

### 봇 생성
1. 텔레그램에서 **@BotFather** 대화
2. `/newbot` 명령어 → 봇 이름, 유저네임 설정
3. **API 토큰** 수령 (안전하게 보관)

### 미니앱 등록
```
/newapp → 봇 선택 → 앱 URL 입력 → 앱 이름/설명/사진 설정
```

### 웹앱 연동
```html
<!-- index.html에 추가 -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

```typescript
// Telegram WebApp SDK
const tg = window.Telegram.WebApp;

// 초기화 & 테마 적용
tg.ready();
tg.expand(); // 전체화면

// 사용자 정보
const user = tg.initDataUnsafe?.user;
console.log(user?.id, user?.first_name);

// 다크모드 감지
const isDark = tg.colorScheme === 'dark';

// 메인 버튼 (하단)
tg.MainButton.setText('Play Again');
tg.MainButton.show();
tg.MainButton.onClick(() => restartGame());

// 햅틱 피드백
tg.HapticFeedback.impactOccurred('medium');

// 인라인 결제 (Telegram Stars)
tg.openInvoice(invoiceLink, (status) => {
  if (status === 'paid') {
    // 아이템 지급
  }
});
```

### Telegram Stars 결제 연동
```typescript
// 백엔드 (FastAPI)
import httpx

async def create_invoice():
    response = await httpx.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/createInvoiceLink",
        json={
            "title": "100 Coins",
            "description": "Get 100 in-game coins",
            "payload": "coins_100",
            "currency": "XTR",  # Telegram Stars
            "prices": [{"label": "100 Coins", "amount": 100}]  # 100 Stars
        }
    )
    return response.json()["result"]
```

### 검색 노출
- 텔레그램 내부 검색: 봇 유저네임으로 검색됨
- **t.me/봇유저네임/앱이름** 링크 공유
- 텔레그램 게임 카탈로그에 자동 등록은 없음 → 직접 홍보 필요
- 텔레그램 채널/그룹에서 바이럴이 핵심

---

## 6. 디스코드 액티비티

### 앱 등록
1. https://discord.com/developers/applications 접속
2. "New Application" → 앱 이름 설정
3. 좌측 "Activities" 탭 활성화
4. URL Mapping 설정 (개발 중 localhost 가능)

### 개발 환경 설정
```bash
# Discord Embedded App SDK
npm install @discord/embedded-app-sdk
```

```typescript
import { DiscordSDK } from '@discord/embedded-app-sdk';

const discordSdk = new DiscordSDK(CLIENT_ID);

async function setup() {
  // SDK 준비
  await discordSdk.ready();

  // OAuth2 인증
  const { code } = await discordSdk.commands.authorize({
    client_id: CLIENT_ID,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: ['identify', 'guilds'],
  });

  // 백엔드에서 토큰 교환
  const response = await fetch('/api/token', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  const { access_token } = await response.json();

  // 인증 완료
  await discordSdk.commands.authenticate({ access_token });

  // 현재 참가자 정보
  const participants = await discordSdk.commands.getInstanceConnectedParticipants();
}
```

### IAP (인앱 구매) 설정
```typescript
// SKU 생성: Discord Developer Portal → Monetization → SKUs

// 구매 처리
import { DiscordSDK } from '@discord/embedded-app-sdk';

async function buyItem(skuId: string) {
  await discordSdk.commands.startPurchase({ sku_id: skuId });
}

// 구매 확인 (서버 사이드)
// Discord API: GET /users/@me/entitlements
```

### 수익
- **개발자 90% / 디스코드 10%**
- App Pitches 프로그램: 최대 **$30,000 펀딩** 지원

### 검색 노출
- 디스코드 앱 디렉토리에 등록
- 서버 내 "Activities" 버튼에서 발견
- 디스코드 앱 검색으로 노출

---

## 7. Facebook Instant Games

### 앱 등록
1. https://developers.facebook.com 접속
2. "My Apps" → "Create App" → "Gaming" 선택
3. "Instant Games" 제품 추가
4. App ID 획득

### SDK 연동
```html
<script src="https://connect.facebook.net/en_US/fbinstant.7.1.js"></script>
```

```typescript
// 초기화
FBInstant.initializeAsync().then(() => {
  // 로딩 진행률
  FBInstant.setLoadingProgress(100);

  // 게임 시작
  FBInstant.startGameAsync().then(() => {
    // 플레이어 정보
    const name = FBInstant.player.getName();
    const photo = FBInstant.player.getPhoto();
    const id = FBInstant.player.getID();
  });
});

// 리더보드
const leaderboard = await FBInstant.getLeaderboardAsync('high_scores');
await leaderboard.setScoreAsync(score);

// 친구에게 공유
FBInstant.shareAsync({
  intent: 'CHALLENGE',
  text: `I scored ${score}! Can you beat me?`,
  image: base64Image,
});

// 광고
const interstitial = await FBInstant.getInterstitialAdAsync('AD_PLACEMENT_ID');
await interstitial.loadAsync();
await interstitial.showAsync();
```

### 수익
- IAP: 개발자 **70%** (웹), 모바일은 플랫폼 수수료 적용
- Audience Network 광고 수익

---

## 8. 검색 엔진 최적화 (SEO)

### Google Search Console 등록
1. https://search.google.com/search-console 접속
2. "속성 추가" → 도메인 또는 URL 프리픽스
3. DNS TXT 레코드 또는 HTML 파일로 소유권 확인
4. sitemap.xml 제출

### 네이버 서치어드바이저 등록
1. https://searchadvisor.naver.com 접속
2. "사이트 등록" → URL 입력
3. HTML 태그 또는 파일로 소유권 확인
4. sitemap.xml 제출
5. RSS 피드 등록 (있으면)

### 다음 웹마스터 도구
1. https://webmaster.daum.net 접속
2. 사이트 등록 → 소유권 확인
3. RSS/sitemap 제출

### Bing 웹마스터 도구
1. https://www.bing.com/webmasters 접속
2. Google Search Console에서 가져오기 가능 (원클릭)

### sitemap.xml 예시 (Next.js)
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourgame.com';

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/play`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.5 },
  ];
}
```

### robots.txt
```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://yourgame.com/sitemap.xml',
  };
}
```

### Open Graph + 메타태그 (공유 시 미리보기)
```typescript
// app/layout.tsx
export const metadata = {
  title: 'GameName - 무료 브라우저 게임',
  description: '지금 바로 플레이! 설치 없이 브라우저에서 즐기는 캐주얼 게임',
  openGraph: {
    title: 'GameName',
    description: '무료 브라우저 게임',
    url: 'https://yourgame.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameName',
    description: '무료 브라우저 게임',
    images: ['/og-image.png'],
  },
};
```

### 구조화된 데이터 (JSON-LD)
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'GameName',
    description: '무료 브라우저 캐주얼 게임',
    url: 'https://yourgame.com',
    genre: ['Casual', 'Puzzle'],
    gamePlatform: ['Web Browser'],
    applicationCategory: 'Game',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  return (
    <html>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
```

---

## 9. 애널리틱스 연동

### GameAnalytics (게임 특화, 무료)
```bash
npm install gameanalytics
```

```typescript
import gameanalytics from 'gameanalytics';

// 초기화
gameanalytics.GameAnalytics.configureBuild('1.0.0');
gameanalytics.GameAnalytics.initialize('GAME_KEY', 'SECRET_KEY');

// 이벤트 추적
// 레벨 시작
gameanalytics.GameAnalytics.addProgressionEvent(
  gameanalytics.EGAProgressionStatus.Start,
  'world01', 'level01'
);

// 레벨 완료
gameanalytics.GameAnalytics.addProgressionEvent(
  gameanalytics.EGAProgressionStatus.Complete,
  'world01', 'level01',
  undefined, score
);

// 리소스 이벤트 (인게임 화폐)
gameanalytics.GameAnalytics.addResourceEvent(
  gameanalytics.EGAResourceFlowType.Source,
  'coins', 100, 'reward', 'level_complete'
);
```

### Google Analytics 4 (웹 범용)
```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}

// 커스텀 이벤트
gtag('event', 'level_complete', {
  level_number: 5,
  score: 1200,
  time_spent: 45,
});

gtag('event', 'ad_watched', {
  ad_type: 'rewarded',
  placement: 'extra_life',
});
```

---

## 10. 빠른 시작 체크리스트

### Phase 0: 계정 생성 (1일)
- [ ] Poki 개발자 계정 (https://developers.poki.com)
- [ ] CrazyGames 개발자 계정 (https://developer.crazygames.com)
- [ ] itch.io 계정 (https://itch.io/register)
- [ ] 텔레그램 봇 생성 (@BotFather)
- [ ] 디스코드 앱 생성 (https://discord.com/developers)
- [ ] GameAnalytics 계정 (https://gameanalytics.com)
- [ ] Google Search Console 등록
- [ ] 네이버 서치어드바이저 등록

### Phase 1: 게임 개발 (2-4주)
- [ ] `npm create @phaserjs/game@latest` 으로 Phaser + TS 프로젝트 생성
- [ ] 게임 핵심 루프 구현 (아이들/클리커 추천)
- [ ] GameAnalytics SDK 연동
- [ ] 리워드 광고 플레이스먼트 설계

### Phase 2: 멀티 플랫폼 SDK 연동 (1주)
- [ ] Poki SDK 연동 (commercialBreak, rewardedBreak)
- [ ] CrazyGames SDK 연동
- [ ] 텔레그램 WebApp SDK 연동
- [ ] 디스코드 Embedded App SDK 연동
- [ ] 플랫폼별 빌드 스크립트 작성

### Phase 3: SEO & 검색 활성화 (2-3일)
- [ ] 게임 랜딩페이지 (Next.js)
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정
- [ ] Open Graph 메타태그
- [ ] JSON-LD 구조화 데이터 (VideoGame 스키마)
- [ ] Google Search Console에 sitemap 제출
- [ ] 네이버 서치어드바이저에 sitemap 제출

### Phase 4: 출시 & 홍보 (1주)
- [ ] itch.io에 즉시 업로드 (심사 없음)
- [ ] Poki에 제출 (심사 1-4주)
- [ ] CrazyGames에 제출 (심사 1-2주)
- [ ] 텔레그램 채널/그룹 홍보
- [ ] Reddit r/WebGames, r/indiegaming 포스팅
- [ ] 게임플레이 영상 TikTok/YouTube Shorts 업로드
