# Harness Engineering 이란?

## 개요

AI 에이전트가 실용적으로 사용되기 시작하면서 등장한 엔지니어링 분야입니다. 모델 자체를 개선하는 것이 아니라, **에이전트가 작동하는 전체 환경(시스템)을 설계·구축·유지하는 실천**을 의미합니다.

## 어원

**Harness**는 말을 제어하기 위한 마구(馬具)에서 유래합니다. "거칠고 강력한 것을 인간이 원하는 방향으로 제어 가능하게 만드는 장치"라는 의미를 지닙니다.

소프트웨어 엔지니어링에서는 수십 년간 **Test Harness** — 테스트 실행 환경을 제어·자동화하는 인프라 — 의 의미로 사용되어 왔습니다. 2025~2026년을 기점으로 AI 에이전트 시대의 핵심 개념으로 재정의되었습니다.

## 핵심 정의

:::info
**Agent = Model + Harness**
:::

**Harness**란 AI 에이전트에서 모델 자체를 제외한 모든 것입니다. 에이전트에게 어떤 도구를 줄 것인지, 어떤 규칙을 따르게 할 것인지, 실수했을 때 어떻게 자기수정하게 할 것인지, 인간이 어떻게 감시할 것인지 — 이 모든 인프라가 하네스에 해당합니다.

> *"Harness Engineering은 인간이 AI 에이전트 루프에 '직접 참여'(in the loop)하는 것이 아니라 '루프 위에서'(on the loop) 작동하는 방식이다. 우리는 결과물 자체를 수정하는 게 아니라, 그 결과물을 만들어내는 하네스를 개선한다."*
>
> — Martin Fowler (2026.02)

## Prompt → Context → Harness: 진화의 계층 구조

세 개념은 경쟁 관계가 아니라 **계층적 포함(hierarchical containment)** 관계입니다.

| 단계 | 핵심 질문 | 제어 단위 | 시기 |
|------|-----------|-----------|------|
| Prompt Engineering | 어떻게 *말할* 것인가? | 단일 텍스트 입력 | 2022~2024 |
| Context Engineering | 무엇을 *보여줄* 것인가? | 컨텍스트 윈도우 | 2025 |
| Harness Engineering | 어떤 *시스템*을 만들 것인가? | 에이전트 전체 환경 | 2025말~현재 |

### Prompt Engineering (2022~2024)

모델에게 전달하는 텍스트 지시문 자체를 정교하게 다듬는 것이 핵심입니다.

**한계:** 에이전트가 여러 스텝에 걸쳐 자율적으로 작동하기 시작하면 "하나의 잘 쓴 지시문"으로는 제어가 불가능해집니다.

### Context Engineering (2025)

Andrej Karpathy가 명문화한 개념입니다.

> *"Context engineering is the delicate art and science of filling the context window with just the right information for the next step."*

**LLM은 CPU, 컨텍스트 윈도우는 RAM.** 모델 파라미터는 고정되어 있고, 그 순간 컨텍스트에 무엇이 담겨 있느냐가 출력 품질을 결정합니다.

**한계:** 에이전트가 장시간 자율 작동하면서 실수를 저지르고 복구해야 하는 상황 전체를 다루기에는 부족합니다.

### Harness Engineering (2025말~현재)

앞의 두 단계를 포함하되, 더 높은 추상화 레이어에서 작동합니다.

기존의 전제는 **"인간이 루프 안에(in the loop) 있다"**는 것입니다. Harness Engineering은 **"인간은 루프 위에(on the loop) 있다"**로 전제가 바뀝니다.

## 핵심 구성요소

### Guides (피드포워드 제어)

에이전트가 행동하기 **전에** 방향을 잡아주는 장치입니다.

- 시스템 프롬프트, CLAUDE.md 같은 컨텍스트 문서
- 코딩 컨벤션, 아키텍처 맵, 기술 스택 정의
- 기능 요구사항 목록, 태스크 분해 구조

### Sensors (피드백 제어)

에이전트가 행동한 **후에** 결과를 관찰하고 자기수정을 유도하는 장치입니다.

- 린터, 타입체커, 테스트 슈트
- 별도 평가 에이전트(Evaluator Agent)
- 관찰성(Observability) 레이어 — 에이전트의 의사결정 추적

## 글로벌 테크 사례

### OpenAI — 에이전트 퍼스트 개발 (2025~2026)

수동으로 작성한 코드 한 줄 없이 소프트웨어 제품의 내부 베타를 빌드·출시했습니다. 2025년 8월 첫 커밋 후 5개월 만에 약 100만 줄의 코드베이스, 1,500개의 PR이 머지되었으며 엔지니어 3명이 평균 하루 3.5 PR/인을 처리했습니다.

### Anthropic — 3-에이전트 하네스 아키텍처 (2026)

**Planner → Generator → Evaluator** 3-에이전트 구조. Initializer 에이전트가 200개 이상의 기능 요구사항을 "all failing" 상태로 먼저 작성하고, Generator가 순차 구현하며, Evaluator가 Playwright로 실제 페이지를 탐색하며 채점 후 피드백 루프를 구성합니다.

### LangChain — 하네스 변경만으로 벤치마크 도약

동일한 모델, 하네스만 변경 → Terminal Bench 2.0에서 **52.8% → 66.5%**, Top 30 밖 → **Top 5**.

### Manus — 6개월간 5번의 하네스 재설계

동일한 모델을 유지하면서 하네스 아키텍처를 6개월 동안 5번 재설계. 매 재설계마다 신뢰성·태스크 완성률 개선.

## 참고 자료

- [Harness engineering for coding agent users — Martin Fowler](https://martinfowler.com/articles/harness-engineering.html)
- [Harness engineering: leveraging Codex in an agent-first world — OpenAI](https://openai.com/index/harness-engineering/)
- [Harness design for long-running application development — Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Awesome Harness Engineering — GitHub](https://github.com/ai-boost/awesome-harness-engineering)
