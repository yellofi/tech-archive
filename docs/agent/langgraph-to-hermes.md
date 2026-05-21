# LangGraph의 구조적 한계와 Hermes Agent 도입

## 배경

개인 AI 비서를 만드는 과정에서 처음에는 LangGraph + LangChain 조합으로 시작했다. 주식 브리핑 파이프라인을 만드는 데는 충분했다. 그런데 "Discord에서 말 걸면 캘린더에 일정을 추가해주는 비서"를 만들려는 순간부터 LangGraph의 설계 철학과 요구사항 사이의 간극이 드러났다.

---

## LangGraph의 구조적 한계

### 1. DAG는 대화가 아니다

LangGraph의 그래프는 **정해진 흐름을 실행**하는 데 최적화되어 있다. 시작 노드가 있고 종료 노드가 있으며, 각 노드의 역할은 그래프 정의 시점에 결정된다.

대화형 에이전트는 다르다. 사용자가 무슨 말을 할지 모르고, 어떤 도구를 호출할지도 런타임에 결정된다. LangGraph로 이걸 구현하려면 "어떤 도구를 쓸지 판단하는 노드 → 도구 실행 노드 → 결과 해석 노드 → 다시 판단 노드" 형태의 루프를 수동으로 설계해야 한다. 그래프가 에이전트 동작의 **모든 가능성을 사전에 포함**해야 한다.

### 2. 인프라가 없다

LangGraph는 오케스트레이션 라이브러리다. 다음은 직접 구현해야 한다.

- Discord, Slack, Telegram 등 메시지 플랫폼 연결
- 세션별 장기 메모리 저장
- 크론 스케줄링 (매일 아침 자동 브리핑)
- 다중 사용자 세션 분리

이것들이 없으면 "파이프라인"은 만들 수 있어도 "비서"는 만들 수 없다.

### 3. 도구 등록의 번거로움

LangChain의 도구 시스템은 파이프라인 안에서 쓰기 좋게 설계되어 있다. 새 도구를 만들고, 에이전트 executor에 주입하고, 프롬프트에 도구 목록을 명시하는 과정이 코드 곳곳에 분산된다.

---

## 왜 Hermes Agent인가

### OpenRouter 글로벌 1위

2026년 5월, Hermes Agent가 OpenRouter 사용량 기준 전 세계 1위 에이전트가 됐다.

| | Hermes Agent | OpenClaw |
|---|---|---|
| 일일 처리 토큰 | 224B | 186B |
| 접근 방식 | 자기 개선 (Self-evolution) | 플랫폼 연동 (50+ integrations) |
| 핵심 가치 | **얼마나 잘 배우는가** | 얼마나 많이 연결되는가 |

상업용 경쟁자를 오픈소스가 사용량으로 앞지른 첫 사례다.

### Hermes가 해결한 것들

**에이전트 런타임 내장**
LangGraph는 "무엇을 실행할지" 정의하는 도구다. Hermes는 "에이전트가 어떻게 존재하는지" 정의하는 런타임이다. 메시지 수신, 도구 호출, 응답 생성, 메모리 저장이 하나의 루프로 돌아간다.

**플러그인 시스템**
도구 하나를 추가하는 데 필요한 것이 전부다.

```python
# plugins/calendar/__init__.py
def register(ctx):
    ctx.register_tool(
        name="add_calendar_event",
        schema=ADD_EVENT_SCHEMA,
        handler=add_calendar_event,
    )
```

스키마를 보고 LLM이 알아서 언제 이 도구를 호출할지 판단한다.

**Discord 게이트웨이 내장**
`hermes --config hermes.yaml gateway discord` 한 줄로 Discord 봇이 된다.

**세션 메모리**
Discord user_id 기준으로 세션이 분리되고, SQLite(`state.db`)에 대화 이력이 쌓인다. 서버를 재시작해도 기억이 유지된다.

**크론 스케줄링**
봇에게 "매일 아침 9시에 #morning-briefing 채널에 브리핑 보내줘"라고 말하면 된다. 코드 한 줄 없이.

---

## 실제 아키텍처: 교체가 아닌 계층 분리

Hermes 도입은 LangGraph를 버린 게 아니다. 각자 잘하는 영역을 맡겼다.

```
Discord 메시지
      ↓
 Hermes Gateway     ← 라우팅, 메모리, 스케줄링, 다중 사용자
      ↓
 Plugin: calendar   ← Google Calendar 직접 조작
 Plugin: briefing   ← LangGraph 파이프라인 호출
                              ↓
                    collect → search → analyze → report
```

**LangGraph가 맡은 것**: 흐름이 정해진 데이터 파이프라인. 병렬 수집, 순차 분석, 최종 리포트 생성.

**Hermes가 맡은 것**: 대화형 에이전트 레이어. 사용자 의도 파악, 도구 선택, 메모리, 스케줄링.

두 프레임워크가 서로의 공백을 채운다.

---

## 도입 과정에서 마주친 실제 엔지니어링 이슈

Hermes는 공식 문서가 부족하고 소스코드를 직접 읽어야 동작 방식을 이해할 수 있었다. 실제로 마주친 문제들.

**플러그인 로딩 실패**
`standalone` 모드에서는 `config.yaml`에 `plugins.enabled` 목록을 명시해야만 플러그인이 로드된다. 문서에 없던 내용으로, 소스코드 분석으로 파악했다.

**핸들러 시그니처**
Hermes는 `handler(args_dict, **kwargs)` 형태로 호출한다. `handler(**args_dict)`로 작성하면 dict 전체가 첫 번째 인자로 들어온다. 이 차이를 모르면 모든 인자가 `None`으로 보인다.

**pycache 오염**
심볼릭 링크로 연결된 플러그인은 `.pyc` 캐시가 구버전을 참조하는 문제가 있었다. `PYTHONDONTWRITEBYTECODE=1`로 해결.

**멀티테넌시 OAuth**
`google_token.json` 단일 파일로는 여러 사용자의 캘린더를 분리할 수 없다. `state.db`에서 `session_id → Discord user_id`를 조회하고, `google_tokens/{user_id}.json`으로 토큰을 분리했다.

---

## 결론

LangGraph는 파이프라인을 코드로 표현하는 훌륭한 도구다. 다만 대화형 에이전트에 필요한 인프라(런타임, 메모리, 스케줄링, 플랫폼 연결)는 범위 밖이다.

Hermes는 그 인프라를 제공한다. 자기 개선 루프(DSPy + GEPA)까지 내장하고 있어, 같은 도메인의 작업을 반복할수록 성능이 올라간다.

> LangGraph로 파이프라인을 만들고, Hermes로 그 파이프라인을 비서로 만든다.
