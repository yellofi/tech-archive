# AI 3사의 Harness 생태계 구축 현황

## 배경

모델 성능 경쟁이 어느 정도 수렴하면서, Anthropic·OpenAI·Google은 이제 **"모델이 작동하는 환경"** 을 자사 생태계로 선점하는 경쟁을 벌이고 있다. 각사가 tool, skill, connector를 쏟아내는 것은 단순한 기능 확장이 아니라 개발자와 기업이 어느 harness 위에 올라탈지를 결정짓는 플랫폼 전략이다.

---

## Anthropic — 표준 선점 전략

### 핵심 구조

```
Agent = Model(Claude) + Harness
Harness = CLAUDE.md (Guide) + Skills + Hooks (Sensor) + MCP Servers
```

### MCP (Model Context Protocol)

2024년 11월 Anthropic이 공개한 tool 연결 표준. AI가 외부 데이터·도구에 접근하는 방식을 JSON-RPC 2.0 기반으로 통일한 오픈 프로토콜이다.

- **2024.11**: MCP 공개, SDK 월 다운로드 200만
- **2025.04**: OpenAI가 MCP 채택 → 월 2,200만으로 급증
- **2025.07**: Microsoft Copilot Studio 통합
- **2025.11**: AWS 지원 추가
- **2025.12**: Agentic AI Foundation(Linux Foundation 산하)에 MCP 기증 → **사실상 업계 표준화**
- **2026.03**: 주요 AI 플랫폼 전체 채택, 공개 MCP 서버 10,000+

### Claude Code Harness

| 구성요소 | 역할 |
|---|---|
| **CLAUDE.md** | 세션 간 지식 전달, 코딩 컨벤션·규칙 주입 (Guide) |
| **Skills** | `/skill-name`으로 호출 가능한 재사용 작업 단위 |
| **Hooks** | 도구 호출 전후 결정론적 스크립트 실행 (Sensor) |
| **MCP Servers** | 외부 시스템 연결 (DB, 파일시스템, SaaS 등) |
| **Desktop Extensions** | 1-click MCP 서버 설치 (2026) |

2026년 5월 기준 커뮤니티 MCP 서버 5,000+, 공식 MCP Registry 2,000+.

### 전략 요약

> **표준을 만들고 기증해서 생태계를 주도한다.**

MCP를 직접 소유하지 않고 Linux Foundation에 이전함으로써 벤더 중립성을 확보했다. OpenAI·Microsoft·AWS까지 채택하면서 MCP는 사실상 AI tool 연결의 USB-C가 되었다. 개발자가 harness를 직접 짜는 대신 Claude Code 위에서 바로 구성하도록 유도하는 구조.

---

## OpenAI — 제품 통합 전략

### 핵심 구조

```
ChatGPT Agent = Operator(GUI 브라우저) + Deep Research + ChatGPT
개발자 스택  = Responses API + Agents SDK + AgentKit
```

### Responses API (2025.03)

Assistants API와 Chat Completions를 통합한 새로운 API 원형. 하나의 요청 안에서 모델이 `web_search`, `file_search`, `code_interpreter`, `image_generation`, remote MCP 서버 등을 연속 호출하는 **agentic loop가 기본값**이다. Assistants API는 2026년 중 deprecated 예정.

### Agents SDK

이전 실험작 Swarm의 프로덕션 버전. 최소 추상화를 유지하면서 다음 세 가지 프리미티브만 제공한다:

| 프리미티브 | 설명 |
|---|---|
| **Agent** | 지시문 + 도구를 가진 LLM 인스턴스 |
| **Handoff** | 작업을 다른 에이전트에 위임 |
| **Guardrails** | 입출력 유효성 검사 |

### ChatGPT Agent (2025.07)

Operator(웹 GUI 조작), Deep Research(정보 합성), ChatGPT를 단일 에이전트로 통합. Computer-Using Agent(CUA) 모델이 GUI를 직접 클릭·입력한다.

### AgentKit (2026)

멀티 에이전트 워크플로우를 위한 엔터프라이즈 도구 세트:
- **Agent Builder**: 시각적 캔버스로 워크플로우 설계·버전 관리
- **Connector Registry**: Gmail, GitHub 등 앱 연결 중앙 관리
- **ChatKit**: 임베드 가능한 챗 UI 툴킷

### 전략 요약

> **모델이 곧 인터페이스가 된다. 제품 레이어에서 end-to-end를 장악한다.**

개발자 SDK와 소비자 제품(ChatGPT)을 동일 스택 위에 올려, ChatGPT 사용자 기반을 그대로 agentic 플랫폼의 유통망으로 전환하는 구조. MCP는 채택했지만 자체 Apps SDK(MCP + UI)로 확장하며 차별화를 유지한다.

---

## Google — 엔터프라이즈 플랫폼 전략

### 핵심 구조

```
Gemini Enterprise Agent Platform
  = Agent Studio (low-code) + ADK (code-first) + Agent Runtime + 거버넌스 레이어
```

### Agent Development Kit (ADK, 2025)

Google Cloud NEXT 2025에서 발표한 오픈소스 코드 퍼스트 프레임워크. Python·TypeScript 지원.

- 워크플로우 에이전트(결정론적 파이프라인) ↔ 동적 라우팅 에이전트 선택 가능
- 기본 제공 tool: Google Search, Code Execution, MCP 도구, LangChain/LangGraph/CrewAI 래퍼
- Gemini 기능 네이티브 지원: 컨텍스트 캐싱, Computer Use, Interactions API

### Gemini Enterprise Agent Platform (2026.05)

Vertex AI를 흡수한 통합 플랫폼. 이후 모든 Vertex AI 로드맵은 이 플랫폼을 통해서만 제공된다.

| 레이어 | 구성요소 | 역할 |
|---|---|---|
| **빌드** | Agent Studio, ADK | low-code / code-first 에이전트 개발 |
| **운영** | Agent Runtime | 장기 실행(days), Memory Bank로 영속 컨텍스트 |
| **거버넌스** | Agent Identity, Registry, Gateway | 에이전트 추적·권한·접근 제어 |
| **데이터** | 100+ 커넥터, BigQuery, AlloyDB | 데이터 중복 없이 직접 연결 |
| **생태계** | Agent Gallery | Oracle, Salesforce, Adobe 등 파트너 에이전트 마켓플레이스 |

Model Garden은 Gemini 외에도 Anthropic Claude, Meta Llama, Gemma 등 200+ 모델을 제공한다.

### 전략 요약

> **구글 인프라 전체를 harness로 만든다. 거버넌스가 차별점이다.**

Google Search의 실시간성, BigQuery·AlloyDB의 데이터 레이어, Workspace의 생산성 앱을 에이전트 tool로 직접 연결하는 것이 경쟁사가 단기 복제하기 어려운 해자다. 엔터프라이즈 규모에서 필수가 되는 에이전트 신원 관리·감사 추적·접근 제어를 플랫폼 레벨에서 제공하는 것이 핵심 차별화 포인트.

---

## 3사 전략 비교

| 차원 | Anthropic | OpenAI | Google |
|---|---|---|---|
| **핵심 전략** | 표준 선점 | 제품 통합 | 인프라 플랫폼화 |
| **Harness 진입점** | Claude Code + MCP | Responses API + Agents SDK | ADK + Agent Platform |
| **Tool 연결 방식** | MCP (업계 표준 주도) | MCP 채택 + Apps SDK 확장 | MCP + 100+ 네이티브 커넥터 |
| **기억/지속성** | CLAUDE.md + Auto Memory | Workspace Agents | Memory Bank (장기, days 단위) |
| **멀티 에이전트** | Sub-agent + Hooks | Handoff + AgentKit | ADK 멀티에이전트 + Agent Gateway |
| **거버넌스** | 없음(개발자 자율) | Guardrails | Agent Identity + Registry + Gateway |
| **주요 강점** | 개발자 친화, 표준 생태계 | 소비자 유통망, 빠른 통합 | 데이터 인프라, 엔터프라이즈 보안 |
| **주요 타겟** | 개발자·스타트업 | 소비자 + 기업 혼합 | 엔터프라이즈 |

---

## 시사점

세 전략은 서로 다른 레이어를 공략하고 있어 단기 수렴보다는 **역할 분화** 가능성이 높다:

- **Anthropic**: tool 연결 표준(MCP)을 장악해 어느 에이전트 위에서도 Claude가 연결될 수 있게 하는 인프라 레이어
- **OpenAI**: 챗GPT 사용자 기반을 agentic 플랫폼으로 자연스럽게 전환, 소비자→기업 순서
- **Google**: 데이터와 인프라를 이미 보유한 기업 고객을 에이전트로 잠금, 기업→소비자 순서

장기적으로 harness 인프라 자체는 상품화될 가능성이 높다. 진짜 경쟁은 각사가 독점한 **데이터 접근권**(Google: 검색/BigQuery, OpenAI: RLHF 피드백, Anthropic: 개발자 워크플로우)에서 갈릴 것으로 보인다.
