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
