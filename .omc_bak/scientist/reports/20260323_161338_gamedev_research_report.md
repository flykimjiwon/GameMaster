# Game Development Research Report
**Generated:** 2026-03-23  
**Scientist Agent:** oh-my-claudecode:scientist  
**Session ID:** gamemaster-research-2025

---

[OBJECTIVE] Research Unity build performance, deployment costs, casual game revenue data, AI coding productivity, solo release requirements, and web vs mobile revenue comparison for game developers in 2025-2026.

---

## 1. Unity Build Sizes and Performance Across Platforms

[DATA] Sources: Unity 6 official docs, GitHub benchmark repo (JohannesDeml/UnityWebGL-LoadingTest), Unity Engine community discussions (Oct 2024 – Mar 2025).

### Build Size Benchmarks

| Build Type | Compressed Size | Notes |
|---|---|---|
| Unity 6 empty project (URP, disk-size-optimized) | **2.0 MB** | With LTO optimization |
| Unity 6 empty project (URP, default) | **10.7 MB** | 3.7 MB data + 6.9 MB code |
| Typical small web game (WebGL, compressed) | **11–14 MB** | .wasm + assets compressed |
| Typical small web game (WebGL, uncompressed) | **40–45 MB** | Without Brotli/gzip |
| Typical small Android APK (native) | **20–50 MB** | Game logic + assets |
| Typical iOS IPA (native) | **30–80 MB** | Larger due to multi-arch |

[FINDING] Unity WebGL compressed builds are 2–4x smaller than their native mobile equivalents at the transport layer, but load significantly slower due to being downloaded fresh on each session.

[STAT:n] Benchmark data from Unity 6 release builds (October 2024 onward)

### Loading Time Comparison (Mobile)

| Scenario | Load Time |
|---|---|
| WebGL compressed (11–14 MB) on mobile browser | **20–25 seconds** |
| WebGL uncompressed (40–45 MB) on mobile browser | **35–45 seconds** |
| Native Android app (already installed) | **2–5 seconds** |

[FINDING] WebGL loading times on mobile are 5–10x slower than native app launches. The 20–25 second load time for compressed WebGL is a critical UX risk — industry data identifies this as the number-one cause of pre-game abandonment.

[STAT:effect_size] 5–10x slower load vs native (large practical effect)
[STAT:n] Community benchmark data from Unity discussions, verified against Unity 6 docs

### Performance: CPU/GPU

- GPU: WebGL performance is **close to native** because rendering uses hardware-accelerated WebGL/WebGPU.
- CPU: WebAssembly (Emscripten-compiled C#) runs at roughly **60–80% of native performance** depending on browser/platform.
- Key limitation: Unity WebGL does **not support C# multithreading** (WebAssembly constraint as of 2025).
- Recommended: Keep draw calls low; WebGL CPU dispatch is slower than native OpenGL/Metal.

[LIMITATION] No controlled head-to-head benchmark (same game, WebGL vs Android APK) was found in the public domain for 2025. All figures are derived from component-level measurements and developer reports.

---

## 2. Unity Deployment Costs Breakdown

[DATA] Sources: Unity official pricing page, Apple Developer Program, Google Play Console, Steamworks documentation.

### Platform Entry Fees

| Platform | Fee | Type | Notes |
|---|---|---|---|
| Apple Developer Program | **$99/year** | Annual, recurring | Required for iOS + macOS distribution |
| Google Play Console | **$25** | One-time | No recurring fee for account |
| Steam / Steamworks | **$100 per app** | Per-title | Recoupable at $1,000 in revenue |
| Itch.io | **$0** | Free | Revenue share optional (pay what you want) |

[FINDING] Google Play is the lowest barrier for mobile distribution ($25 one-time). Steam is recoupable at $1K revenue, making it effectively free for successful titles.

[STAT:n] Official 2025 fee schedules from each platform

### Unity Licensing (2025, after Runtime Fee cancellation)

| Tier | Requirement | Annual Cost/Seat |
|---|---|---|
| Personal | Revenue < $200K/year | **FREE** |
| Pro | Revenue $200K – $25M | **$2,200/year** (+8% increase from 2024) |
| Enterprise | Revenue > $25M | **Custom** (~$9,000+, +25% from 2024) |

**Runtime Fee Status:** Cancelled in September 2024. Unity reverted to subscription-only model. The Runtime Fee (originally announced September 2023, which would have charged per-install) was fully rescinded.

[FINDING] For solo developers earning under $200K/year, Unity Personal remains FREE with no runtime fees. The 2023 Runtime Fee controversy is resolved — Unity abandoned the policy entirely.

[STAT:n] Unity official pricing update (January 1, 2025 effective date for new thresholds)
[LIMITATION] Unity Pro price increase of 8% and Enterprise increase of 25% took effect Jan 2025. Enterprise pricing requires direct negotiation.

### Revenue Share (App Stores)

| Platform | Revenue Share |
|---|---|
| Apple App Store | 30% (15% if revenue < $1M/year via Small Business Program) |
| Google Play | 30% (15% on first $1M/year) |
| Steam | 30% (25% above $10M; 20% above $50M) |
| Poki (web) | Revenue share model, not publicly disclosed; ad-based |
| CrazyGames (web) | Revenue share + 50% bonus for 2-month exclusivity |
| Itch.io | Developer sets their own split (default 10% to Itch) |

---

## 3. Successful Casual Games: Unity vs Web Technologies

[DATA] Sources: GameAnalytics, Business of Apps, Udonis, SensorTower, Game Developer magazine.

### Unity-Built Hit Casual Games

| Game | Platform | Lifetime Revenue | Downloads | Notes |
|---|---|---|---|---|
| **Stumble Guys** | Mobile (Unity) | **~$168M** | 600M+ | Peak $70M/year (2022) |
| **Among Us** | Mobile + PC (Unity) | **~$105M** | 650M+ | Launched 2018, exploded 2020 |
| **Temple Run** | Mobile (Unity) | **~$100M** | 500M+ | Peak ~$1M/month |

[FINDING] All three top casual games with >$100M lifetime revenue were built with Unity. Unity powers 71% of the top 1,000 mobile games.

[STAT:n] n=1,000 top mobile games (Unity 2025 Gaming Report)
[STAT:effect_size] 71% Unity market share in top 1,000 mobile games is a dominant position

### Web-Based Game Examples

| Game | Engine/Tech | Platform | Notes |
|---|---|---|---|
| Krunker.io | JavaScript/Three.js | Browser | Millions of MAU, ad-based |
| Slither.io | JavaScript | Browser | 500M+ plays, acquired |
| Shell Shockers | Babylon.js | Browser / Poki | Top Poki game |
| Various puzzle/casual | Unity WebGL / GDevelop | Poki, CrazyGames | Revenue up to €1M/year per studio |

[FINDING] Web games rarely reach $100M+ revenue but have dramatically lower UA costs. Top Poki studios earn up to $1M/year — achievable for a solo developer, versus near-impossible for a solo mobile developer targeting the same figure.

[STAT:n] 600+ independent studios on Poki (2025); 100M monthly Poki users

### Market Share Context

- Unity: 71% of top 1,000 mobile games
- Only **11% of game developers** plan to make games for web platforms (Unity 2024 report)
- Global gaming revenue 2024: **$184 billion** total; mobile accounts for **$114 billion** (62%)

[LIMITATION] Web game revenue data is largely self-reported or based on platform statements (not audited financials). Mobile revenue figures from SensorTower/AppMagic are estimates with ±15–25% error margins.

---

## 4. AI Coding Assistants for Game Development

[DATA] Sources: GitHub Research blog, Atlassian Developer Report 2025, Unity 2024 Gaming Report, METR research, Coplay/Unity-MCP GitHub repos.

### Measured Productivity Gains

| Study | Metric | Result | Statistical Confidence |
|---|---|---|---|
| GitHub Copilot (2023, n=95) | Task completion time | **55% faster** | p=0.0017; 95% CI: [21%, 89%] |
| Atlassian Dev Report 2025 | Hours saved per week (daily AI users) | **4.1 hours/week** | Self-reported |
| Atlassian Dev Report 2025 | Hours saved (Q4 2024 baseline) | **~2.0 hours/week** | ~2x increase in savings in 12 months |
| Unity CEO claim | Productivity multiplier | **5–10x** (aspiration) | Not independently measured |

[FINDING] The best-controlled study (GitHub, p=0.0017) shows 55% task completion speed improvement with AI coding assistance. Self-reported time savings of 3–4 hours/week have approximately doubled in one year, suggesting rapid adoption and improving tool quality.

[STAT:p_value] p=0.0017 (GitHub Copilot study)
[STAT:ci] 95% CI for speed gain: [21%, 89%]
[STAT:n] n=95 developers (GitHub study); n=1,000s (Atlassian survey)

### Unity-Specific AI Workflow (2025)

**Top tools for Unity C# development:**

| Tool | Approach | Best For |
|---|---|---|
| **Claude Code + Unity MCP** | Terminal agent + MCP bridge to Unity Editor | Multi-file refactors, architectural changes, scene automation |
| **Cursor** | AI-native IDE with inline completions | Individual file editing, fast iteration |
| **Windsurf** | AI-native IDE with "Cascade" agentic mode | Large codebases, enterprise teams |
| **GitHub Copilot** | IDE extension (VS Code / Rider) | Boilerplate, autocomplete within existing workflow |
| **Unity Sentis / Unity AI** | Built-in Unity 6.2 feature | Prompt-to-prototype (beta, casual games) |

**Claude Code + Unity MCP integration:**
- Unity MCP (multiple open-source implementations: CoplayDev, CoderGamester, IvanMurzak) bridges Claude Code directly to Unity Editor
- Capabilities: create GameObjects, modify components, generate scenes, run tests, manage assets — via natural language
- Setup: Install MCP package in Unity → configure Claude Code → natural language commands execute in Editor

[FINDING] Claude Code leads for complex multi-file and architectural tasks; Cursor leads for in-editor flow. 62% of game developers now use AI tools in production (Unity 2024 report, up from ~40% in 2023).

[STAT:n] 62% of developers = from Unity 2024 Gaming Report (large-scale industry survey)

[LIMITATION] The 55% speed gain study used a controlled JavaScript task (HTTP server), not Unity C# game development. Real-world gains for complex game logic may differ. Unity CEO's "5–10x" claim is unverified.

---

## 5. Solo Developer Game Release Checklist (2025)

[DATA] Sources: LootLocker blog, ESRB, FTC COPPA amendments (January 2025), GDPR official guidance, Game Developer magazine.

### Legal Requirements

#### Privacy Policy (MANDATORY for all platforms)
- Required by: Apple App Store, Google Play, GDPR (EU), CCPA (California), COPPA (US, if any minor users possible)
- Must include: what data you collect, how you store/process it, what you use it for, which third parties receive it
- Free generators available (PrivacyPolicies.com, TermsFeed)
- **Penalty for non-compliance:** COPPA = up to $40,000 per user; GDPR = up to 4% of annual turnover

#### COPPA (Children's Online Privacy Protection Act)
- Applies if: your game may be used by anyone under 13 in the US
- January 2025: FTC finalized significant COPPA Rule amendments — stricter requirements
- Required: verifiable parental consent for behavioral advertising, AI training data use, profiling
- Practical rule: if your game could attract children, add age gate + parental consent flow

#### GDPR (EU)
- Applies to: any game available in the EU, regardless of developer location
- Children's data: parental consent required for users under 16 (varies by EU member state: 13–16)
- UK Children's Code: defines "child" as under 18 (stricter than GDPR)
- Practical minimum: privacy policy + cookie consent if you use analytics/ads

### Platform-Specific Requirements

| Platform | Requirements |
|---|---|
| Apple App Store | Privacy policy URL, App Privacy nutrition label (data usage disclosure), IDFA consent (ATT framework) |
| Google Play | Privacy policy URL, Data Safety section filled out, target age declaration |
| Steam | Privacy policy, Age gate if ESRB/PEGI rated M/18+, content descriptors |
| Poki/CrazyGames | Privacy policy, GDPR-compliant analytics, no data collection from minors without consent |

### Minimum Viable Marketing (MVPs)

1. **Steam Wishlist page** — launch 3–6 months before release; set a goal of 7,000+ wishlists for meaningful launch day sales
2. **Short-form video** — TikTok/Instagram Reels/YouTube Shorts gameplay clips (30–60 seconds); highest organic reach per effort
3. **Press kit** — screenshots (at least 5), trailer (60–90 seconds), 150-word description, key art
4. **Subreddit posts** — r/indiegaming, r/gamedev, r/WebGames (for web titles)
5. **Launch day discount** — 10–20% off for first week drives algorithmic visibility

### Analytics Setup (Minimum Viable)

| Tool | Cost | Use Case |
|---|---|---|
| GameAnalytics | Free | Session length, D1/D7/D30 retention, funnel events |
| Unity Analytics | Free (Personal tier) | Built-in Unity integration |
| Google Analytics 4 | Free | Web game / landing page traffic |
| Firebase | Free tier | Mobile: crash reporting + analytics |

**Key metrics to track from day 1:**
- Day 1 / Day 7 / Day 30 retention rates
- Session length average
- "Rage-quit" / drop-off points in levels
- Store page CTR and conversion rate
- Revenue per user (ARPU) and average session value

[FINDING] Legal compliance (privacy policy + GDPR/COPPA) is the single most skipped requirement by solo developers and carries the highest downside risk. The actual cost of a compliant privacy policy is $0 (free generators exist).

[STAT:n] COPPA Rule finalized January 2025 by FTC; GDPR in force since 2018

[LIMITATION] Legal requirements vary by jurisdiction and change over time. This is not legal advice — consult a lawyer for commercial releases targeting significant audiences.

---

## 6. Web Game vs Mobile Game Revenue — Actual Data

[DATA] Sources: Poki Developer Portal, Dutch Games Association 2024, AppMagic Casual Report H1 2025, SensorTower State of Mobile Gaming 2025, Wayline.io indie revenue analysis.

### Revenue Comparison Table

| Segment | Platform | Typical Annual Revenue Range | Top End |
|---|---|---|---|
| Solo/small web game | Poki / CrazyGames | $10,000 – $100,000 | ~€1M/year |
| Established web studio | Poki | $50,000 – $1,000,000 | $1M+ |
| Typical solo mobile indie | App Store / Google Play | $1,000 – $20,000 | $50,000 |
| Breakout mobile indie | App Store / Google Play | $100,000 – $1,000,000 | $10M+ |
| Average mobile casual game | All mobile stores | Under $10K lifetime | — |

[FINDING] For solo developers, web platforms (Poki/CrazyGames) offer a more predictable revenue ceiling that is realistically achievable (~$50K–$100K/year for a successful game) without user acquisition spend. Mobile offers higher theoretical upside but requires significant UA investment to break through discovery barriers.

[STAT:n] Poki: 600+ studios in ecosystem, 100M MAU (June 2025 milestone of 1B plays/month)
[STAT:n] Mobile indie: ~10–20% of first games produce revenue exceeding development costs

### ROI Analysis: Web vs Mobile for Solo Developers

| Factor | Web (Poki/CrazyGames) | Mobile (iOS + Android) |
|---|---|---|
| Entry cost | $0 | $124 ($99 Apple + $25 Google) |
| UA (user acquisition) cost | Organic / platform handles | $1–$5 CPI; significant budget needed |
| Time to first player | Hours after submission | 1–7 days (store review) |
| Revenue model | Ad revenue share (platform-managed) | IAP + ads (developer-managed) |
| Discovery mechanism | Platform curates + features games | App store algorithms + paid UA |
| Audience ceiling | 100M MAU (Poki), 35M MAU (CrazyGames) | Billions (but noise floor is extreme) |
| Revenue share transparency | Not publicly disclosed | 30% to store (known) |

[FINDING] Web game platforms have a structurally lower barrier to first-player reach. The absence of user acquisition costs is a significant ROI advantage for solo developers with no marketing budget. However, mobile revenue potential at scale is 10–100x larger for breakout titles.

[STAT:n] Global mobile gaming revenue 2024: $114 billion (SensorTower)
[STAT:n] Only 11% of game developers target web platforms (Unity 2024 Gaming Report)

[LIMITATION] Web game CPM rates are not publicly disclosed by Poki or CrazyGames. Revenue estimates for web game studios are based on platform statements and developer testimonials, not audited financials. Mobile revenue estimates from SensorTower/AppMagic carry ±15–25% uncertainty.

---

## Summary of Key Findings

| Topic | Key Number | Source |
|---|---|---|
| Unity Personal (solo) cost | **$0/year** | Unity (2025) |
| Unity Runtime Fee | **Cancelled** Sept 2024 | Unity official |
| Apple Dev Program | **$99/year** | Apple (2025) |
| Google Play Console | **$25 one-time** | Google (2025) |
| Steam per app | **$100** (recoupable at $1K rev) | Steamworks (2025) |
| WebGL mobile load time | **20–25 seconds** (compressed) | Unity benchmarks |
| WebGL vs native load | **5–10x slower** | Unity community data |
| Unity market share (top 1K mobile) | **71%** | Unity 2025 Gaming Report |
| AI productivity gain (controlled study) | **55% faster** (p=0.0017) | GitHub Research |
| Dev AI tool adoption | **62%** of game devs | Unity 2024 Gaming Report |
| Poki top studio annual revenue | **up to $1M/year** | Dutch Games Assoc. 2024 |
| Typical indie mobile revenue | **$1K–$20K/year** | Wayline.io analysis |
| COPPA penalty | **$40K per user** | FTC (2025) |
| GDPR penalty | **4% of turnover** | EU GDPR |

---

## Figures

- `fig1_deployment_costs.png` — Platform entry fees + Unity licensing tiers
- `fig2_webgl_build_loading.png` — Build sizes and loading time comparison
- `fig3_casual_game_revenue.png` — Hit casual game revenue (Stumble Guys, Among Us, Temple Run)
- `fig4_ai_productivity.png` — AI coding assistant productivity measurements
- `fig5_web_vs_mobile_revenue.png` — Revenue range and barrier-to-entry comparison

---

*Sources consulted: Unity official docs (2025), Unity 2024/2025 Gaming Reports, GitHub Research blog, Atlassian Developer Experience Report 2025, Poki Developer Portal, Dutch Games Association 2024, SensorTower State of Mobile Gaming 2025, AppMagic Casual Report H1 2025, FTC COPPA Rule (Jan 2025), Steamworks documentation, Apple Developer Program, Google Play Console Help, Game Developer magazine.*
