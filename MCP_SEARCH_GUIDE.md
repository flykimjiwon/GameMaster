# MCP & API 검색/리서치 도구 가이드

> Claude Code에서 웹 검색, 문서 조회, 스크래핑 등을 활성화하는 MCP 서버 종합 가이드

---

## 현재 설치된 MCP 서버

| MCP 서버 | 상태 | 용도 |
|----------|------|------|
| **Notion** | Connected | 노션 페이지/DB 읽기/쓰기 |
| **oh-my-claudecode** | Connected | OMC 에이전트 오케스트레이션 |
| **Playwright** | Connected | 브라우저 자동화, E2E 테스트 |
| **Brave Search** | Connected | 웹 검색 (월 2,000회 무료) |
| **Tavily** | Connected | AI 최적화 검색 |
| **Firecrawl** | Connected | 웹사이트 → 마크다운 스크래핑 |
| **YouTube** | Connected | 유튜브 콘텐츠 검색/분석 |
| **Apify** | Connected | 웹 스크래핑/자동화 액터 |

**이미 검색/리서치 도구가 잘 갖춰져 있습니다!** 아래는 추가로 설치하면 좋은 것들입니다.

---

## 추천 추가 MCP (아직 없는 것)

### 1. Context7 — SDK/프레임워크 최신 문서 자동 조회 (무료, API 키 불필요)

게임 개발 시 Phaser, Next.js, Three.js 등 라이브러리 최신 문서를 Claude가 **실시간으로 조회**할 수 있게 해줌. 학습 데이터 기반이 아니라 **최신 공식 문서**를 가져옴.

```bash
claude mcp add --scope user --transport stdio \
  context7 -- npx -y @upstash/context7-mcp@latest
```

**사용법**: 프롬프트에 `use context7` 추가하면 자동으로 최신 문서 참조
```
Phaser 3에서 타일맵 사용법 알려줘 use context7
```

- GitHub: https://github.com/upstash/context7
- 비용: **무료** (Upstash 오픈소스)
- API 키: 불필요

---

### 2. Exa — 뉴럴/시맨틱 검색 (연구/논문/코드)

Brave와 달리 **의미 기반 검색**. 연구 논문, GitHub 코드, 기술 블로그를 깊이 있게 찾을 때 유용.

```bash
claude mcp add --scope user --transport stdio \
  --env EXA_API_KEY=your_key_here \
  exa -- npx -y exa-mcp-server
```

- GitHub: https://github.com/exa-labs/exa-mcp-server
- API 키: https://exa.ai 에서 발급
- 비용: 무료 티어 있음 (제한적)

---

### 3. Fetch — 공식 Anthropic URL 가져오기 (무료, 키 불필요)

URL을 마크다운으로 변환. Firecrawl 보다 가볍고 단순. API 문서 하나만 빠르게 읽을 때 유용.

```bash
claude mcp add --scope user --transport stdio \
  fetch -- npx -y @modelcontextprotocol/server-fetch
```

- GitHub: https://github.com/modelcontextprotocol/servers
- 비용: **무료**
- API 키: 불필요

---

### 4. Memory — 세션 간 기억 (지식 그래프, 무료)

대화 간 정보를 영구 저장하는 로컬 지식 그래프. 게임 디자인 결정, 밸런싱 데이터 등을 기억.

```bash
claude mcp add --scope user --transport stdio \
  memory -- npx -y @modelcontextprotocol/server-memory
```

- 비용: **무료**
- API 키: 불필요
- 데이터: 로컬 저장 (프라이버시 보장)

---

### 5. GitHub MCP — 공식 GitHub 연동

PR, 이슈, 코드 검색, 커밋 분석을 Claude Code에서 직접 수행.

```bash
claude mcp add --scope user --transport http \
  github https://api.githubcopilot.com/mcp/
# → /mcp 실행 후 GitHub OAuth 인증
```

- 비용: **무료**
- 인증: OAuth (브라우저에서 인증)

---

### 6. Perplexity — AI 검색 + 인용 (유료)

딥 리서치, 추론 기반 검색. Brave보다 깊은 분석이 필요할 때.

```bash
claude mcp add --scope user --transport stdio \
  --env PERPLEXITY_API_KEY=pplx-your_key \
  perplexity -- npx -y @perplexity-ai/mcp-server
```

- API 키: https://perplexity.ai 에서 발급
- 비용: 유료 (API 크레딧)

---

### 7. Phaser Editor MCP — Phaser 게임 에디터 연동

Phaser Editor v5와 Claude Code를 연결. 씬 생성/관리를 AI로 자동화.

```bash
# Phaser Editor v5 설치 필요
# https://github.com/phaserjs/editor-mcp-server 참고
```

- GitHub: https://github.com/phaserjs/editor-mcp-server
- 비용: Phaser Editor v5 라이선스 필요

---

### 8. Unity MCP — Unity 에디터 ↔ Claude Code

Unity Editor를 Claude Code에서 직접 제어. GameObject 생성, 컴포넌트 수정, 씬 자동화.

```bash
# Unity 패키지 매니저에서 Unity-MCP 패키지 먼저 설치
# 그 후:
claude mcp add --scope user --transport stdio \
  unity -- npx -y mcp-unity
```

- GitHub: https://github.com/IvanMurzak/Unity-MCP
- 비용: **무료**

---

## 한 번에 설치 (추천 4개, 전부 무료)

```bash
# 1. Context7 — 프레임워크 최신 문서 (Phaser, Next.js 등)
claude mcp add --scope user --transport stdio \
  context7 -- npx -y @upstash/context7-mcp@latest

# 2. Fetch — URL → 마크다운 변환
claude mcp add --scope user --transport stdio \
  fetch -- npx -y @modelcontextprotocol/server-fetch

# 3. Memory — 세션 간 지식 그래프
claude mcp add --scope user --transport stdio \
  memory -- npx -y @modelcontextprotocol/server-memory

# 4. GitHub — PR/이슈/코드 검색
claude mcp add --scope user --transport http \
  github https://api.githubcopilot.com/mcp/
```

설치 후 Claude Code에서 `/mcp` 입력하면 연결 상태 확인 가능.

---

## 현재 MCP 활용 가이드

### 이미 있는 도구로 할 수 있는 것

| 하고 싶은 것 | 사용할 MCP |
|-------------|-----------|
| 게임 시장 조사, 트렌드 검색 | **Brave Search** |
| AI 최적화 깊은 검색 | **Tavily** |
| 경쟁 게임 웹사이트 분석 | **Firecrawl** |
| 게임 개발 튜토리얼 영상 검색 | **YouTube** |
| 웹 스크래핑 (앱스토어 순위 등) | **Apify** |
| 브라우저 테스트/자동화 | **Playwright** |
| 노션에 기획서 관리 | **Notion** |

### 추가 설치 후 할 수 있는 것

| 하고 싶은 것 | 사용할 MCP |
|-------------|-----------|
| Phaser/Next.js 최신 API 문서 조회 | **Context7** |
| 코드/논문/기술글 시맨틱 검색 | **Exa** |
| API 문서 페이지 빠르게 읽기 | **Fetch** |
| 게임 디자인 결정 기억 | **Memory** |
| GitHub 이슈/PR 자동화 | **GitHub MCP** |
| AI 딥 리서치 + 인용 | **Perplexity** |
| Unity 에디터 AI 제어 | **Unity MCP** |
| Phaser 에디터 AI 제어 | **Phaser Editor MCP** |

---

## MCP 관리 명령어

```bash
# 목록 보기
claude mcp list

# 특정 서버 상세 정보
claude mcp get brave-search

# 서버 삭제
claude mcp remove server-name

# 세션 내에서 상태 확인
/mcp
```

---

## 설정 파일 위치

| 파일 | 스코프 | 용도 |
|------|--------|------|
| `~/.claude.json` | user | 개인 전역 MCP (API 키 포함) |
| `~/.claude/settings.json` | user | 권한, 플러그인 설정 |
| `.mcp.json` (프로젝트 루트) | project | 팀 공유 MCP (git에 커밋) |

### .mcp.json 예시 (GameMaster 프로젝트용)

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "fetch": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

> API 키가 필요한 MCP는 `.mcp.json`에 넣지 말고 `claude mcp add --scope user`로 개인 설정에 추가할 것 (키가 git에 노출되지 않도록)

---

## API 키 관리

환경 변수로 관리 (`.zshrc` 또는 `.env`에 추가):

```bash
# ~/.zshrc에 추가
export BRAVE_API_KEY="BSA..."
export TAVILY_API_KEY="tvly-..."
export FIRECRAWL_API_KEY="fc-..."
export EXA_API_KEY="..."
export PERPLEXITY_API_KEY="pplx-..."
```

`.mcp.json`에서 환경 변수 참조:
```json
{
  "env": {
    "BRAVE_API_KEY": "${BRAVE_API_KEY}"
  }
}
```

---

## 참고 링크

- [Claude Code MCP 공식 문서](https://code.claude.com/docs/en/mcp)
- [awesome-mcp-servers (커뮤니티 목록)](https://github.com/punkpeye/awesome-mcp-servers)
- [50+ Best MCP Servers 2026](https://claudefa.st/blog/tools/mcp-extensions/best-addons)
- [Brave Search API](https://brave.com/search/api/)
- [Tavily MCP](https://github.com/tavily-ai/tavily-mcp)
- [Firecrawl MCP](https://docs.firecrawl.dev/mcp-server)
- [Context7 (Upstash)](https://github.com/upstash/context7)
- [GitHub MCP](https://github.com/github/github-mcp-server)
- [Unity MCP](https://github.com/IvanMurzak/Unity-MCP)
- [Phaser Editor MCP](https://github.com/phaserjs/editor-mcp-server)
- [Playwright MCP (Microsoft)](https://github.com/microsoft/playwright-mcp)
