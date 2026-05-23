# LangChain & LangGraph

## LangChain

### 등장 배경

2022년 말 ChatGPT 공개 이후, LLM으로 실제 애플리케이션을 만들려는 시도가 폭발적으로 늘었다. 그런데 "검색 결과를 LLM에 넣기", "도구를 호출하고 결과를 다시 LLM에 넣기" 같은 패턴이 반복됐다. LangChain은 이 반복 패턴을 **추상화된 컴포넌트**로 제공했다.

### 핵심 추상화

**Chain**: LLM 호출, 도구 실행, 파서 등을 파이프라인으로 연결하는 단위.

```python
chain = prompt | llm | output_parser
result = chain.invoke({"question": "..."})
```

**LCEL (LangChain Expression Language)**: `|` 연산자로 컴포넌트를 연결하는 선언적 문법. 스트리밍, 배치, 비동기를 일관된 인터페이스로 처리한다.

**Memory**: 대화 이력을 관리하는 추상화. `ConversationBufferMemory`, `ConversationSummaryMemory` 등.

**Retriever**: 벡터 DB, 검색 엔진 등 다양한 소스를 동일한 인터페이스로 감싼다.

### LangChain이 잘 하는 것

- LLM + 도구 + 데이터소스를 빠르게 연결하는 프로토타이핑
- 다양한 LLM 프로바이더(OpenAI, Anthropic, 로컬 모델)를 동일 인터페이스로 교체
- RAG 파이프라인 구성

### LangChain의 한계

추상화 계층이 깊어지면서 내부 동작을 이해하기 어려워졌다. 버전마다 API가 크게 바뀌었고, 간단한 작업에도 불필요한 의존성이 따라왔다. "LangChain 없이 짜는 게 더 간결하다"는 반응이 커지면서 커뮤니티가 분화됐다.

---

## LangGraph

### 등장 배경

LangChain의 선형 Chain 모델은 "조건 분기", "반복", "상태 유지"가 필요한 복잡한 에이전트를 표현하기 어려웠다. LangGraph는 이를 **상태 기계(State Machine) + 방향 그래프** 모델로 해결했다.

### 핵심 개념

**State**: 그래프 전체가 공유하는 TypedDict. 각 노드는 상태를 읽고 일부를 수정해 반환한다.

```python
class MyState(TypedDict):
    messages: list
    result: str
```

**Node**: 상태를 받아 처리하고 업데이트된 상태를 반환하는 함수.

**Edge**: 노드 간 연결. 조건부 엣지로 분기가 가능하다.

```python
graph = StateGraph(MyState)
graph.add_node("analyze", analyze_node)
graph.add_node("report", report_node)
graph.add_edge("analyze", "report")
```

**Checkpointing**: 상태를 중간에 저장해 중단된 그래프를 이어서 실행하거나, Human-in-the-loop을 구현할 수 있다.

### LangGraph가 잘 하는 것

- 다단계 파이프라인의 상태 흐름을 명시적으로 표현
- 병렬 실행 (여러 노드를 동시에 실행)
- 루프와 재시도 로직
- 복잡한 멀티 에이전트 워크플로우

### LangGraph 실제 사용 예시

주식 브리핑 파이프라인을 LangGraph로 구성했다.

```
[collect] → [search] → [analyze] → [connect] → [report]
```

각 단계가 독립적인 노드로 분리되어 있고, `collect`와 `search`는 병렬로 실행된다. 상태(`StockState`)에 뉴스, 가격, 분석 결과가 누적되며 흘러간다.

```python
class StockState(TypedDict):
    tickers: list[str]
    themes: list[str]
    news: dict
    prices: dict
    web_results: dict
    ticker_analysis: dict
    theme_analysis: str
    report: str
```

이 구조는 LangGraph가 강점을 발휘하는 영역이다. **흐름이 정해져 있고, 각 단계의 입출력이 명확하며, 병렬 처리가 필요한 파이프라인**.

---

## LangGraph의 현재 포지션 (2025~2026)

### 오케스트레이션 레이어 경쟁

Google ADK, Anthropic Agent SDK/MCP가 등장하면서 LangGraph의 위치가 재조명되고 있다. 이 경쟁을 이해하려면 **레이어 분리**로 보는 시각이 필요하다.

```
Infrastructure   AWS / GCP / Azure
Model            Claude / Gemini / GPT
Orchestration    LangGraph / ADK / MCP   ← 이 레이어가 경쟁 중
Application      실제 서비스
```

AWS가 있어도 GCP를 쓰는 팀이 있듯, 레이어가 다르면 경쟁이 아니라 공존이 가능하다.

### 각사 프레임워크의 전략적 의도

Google과 Anthropic이 각자 프레임워크를 미는 것은 단순한 편의 제공이 아니다. **자사 모델 ↔ 자사 프레임워크 간 성능/비용 최적화를 의도적으로 자사 스택에서 가장 잘 되도록 설계**한다. 개발자를 생태계에 묶어두는 것이 목적이다.

```
Google     →  Gemini + ADK + Vertex AI     (우리 것만 써도 다 됨)
Anthropic  →  Claude + MCP + Agent SDK     (우리 것만 써도 다 됨)
```

자사 모델 사용 시 성능·비용 최적화가 자사 프레임워크에서 제일 잘 되는 것은 의도된 설계다.

### LangGraph가 여전히 쓰이는 이유

**① 생태계 규모**

LangChain/LangGraph 커뮤니티는 현재 AI 에이전트 생태계 중 가장 크다. 레퍼런스, 예제, 스택오버플로우 답변이 압도적으로 많고 프로덕션 사례가 이미 쌓여 있다. ADK는 2025년 4월 출시, MCP는 아직 확산 중이다.

**② 모델 벤더 중립성**

```python
# LangGraph 안에서 모델 교체는 몇 줄 수정으로 가능
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Claude → Gemini 전환
llm = ChatAnthropic(model="claude-opus-4-5")
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")  # 이 줄만 바꾸면 됨
```

특정 모델에 락인되기 싫은 팀은 LangGraph를 선호한다. **모델은 갈아끼울 수 있는 부품, LangGraph는 그 위의 워크플로우 레이어**라는 구분이 핵심이다.

### LangGraph가 실제로 잘 하는 것

"iterative reasoning에 특화"라고 이해하기 쉽지만 실제 강점은 더 넓다.

| 영역 | 내용 |
|---|---|
| **Iterative reasoning** | 반복·분기 제어, 루프 설계 |
| **상태 관리** | 대화·작업 상태를 그래프 전체에서 공유·유지 |
| **멀티에이전트 조율** | 에이전트 간 Handoff, 병렬 실행 |
| **프로덕션 신뢰성** | Checkpointing, 재시도, Human-in-the-loop |

### ADK·MCP로의 전환 용이성

LangGraph를 알면 ADK나 MCP로 갈아타는 것이 어렵지 않다. **개념이 같고 문법만 다르기** 때문이다.

| LangGraph | ADK / MCP |
|---|---|
| State (TypedDict) | Session / Memory |
| Node (함수) | Agent / Tool |
| Edge (연결) | Routing / Handoff |
| Checkpointing | Agent Runtime 상태 저장 |

LangGraph로 상태 기계와 에이전트 조율의 개념을 익혀두면, 특정 벤더 스택으로의 이전은 학습 비용이 낮다.
