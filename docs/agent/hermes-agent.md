# OpenClaw를 제친 Hermes Agent (26.05)

## OpenClaw를 제친 에이전트

2026년 5월, OpenRouter 글로벌 에이전트 랭킹 1위가 바뀌었습니다. 기존 1위였던 OpenClaw를 **Hermes Agent**가 추월했습니다. 일일 토큰 처리량 기준 Hermes 224B vs OpenClaw 186B — 오픈소스 에이전트가 처음으로 상용 에이전트를 사용량에서 역전한 사례입니다.

핵심: **"쓸수록 똑똑해지는 에이전트"**

## Hermes Agent란?

**Hermes Agent**는 Nous Research가 2026년 2월 출시한 **오픈소스 Self-Improving AI Agent**입니다. 에이전트가 태스크를 수행하면서 스스로 스킬을 생성하고, 프롬프트를 자동으로 최적화하며, 메모리를 축적합니다.

:::tip Nous Research 내부 벤치마크
동일 도메인 태스크를 self-evolution 없이 처음 실행할 때 대비 **40% 빠른 처리 속도**를 달성합니다.
:::

## OpenClaw와의 차이

| 구분 | OpenClaw | Hermes Agent |
|------|----------|--------------|
| 핵심 강점 | WebSocket Gateway — 50+ 플랫폼 연동 | Self-evolution — 쓸수록 스스로 개선 |
| 아키텍처 | 멀티 플랫폼 통합 중심 | Do-Learn-Improve 루프 중심 |
| 메모리 | 기본 컨텍스트 관리 | SQLite FTS5 영구 메모리 레이어 |
| 스킬 관리 | 고정된 스킬 셋 | 재사용 가능한 스킬 파일 자동 생성·진화 |
| 최적화 방식 | 수동 프롬프트 튜닝 | DSPy + GEPA 자동 최적화 |

OpenClaw가 "얼마나 많은 플랫폼과 연결되는가"에 집중했다면, Hermes는 "얼마나 잘 학습하는가"에 집중했습니다.

## Self-Evolution 아키텍처

```
Do (태스크 실행)
→ Learn (실행 트레이스 분석 + 스킬 추출)
→ Improve (DSPy + GEPA로 스킬 프롬프트 자동 최적화)
→ Do (개선된 스킬로 다음 태스크 실행)
```

이 루프가 반복될수록 에이전트는 해당 도메인에 특화된 최적 프롬프트를 갖게 됩니다. 이 과정은 **완전 자동** — 개발자가 개입하지 않아도 됩니다.

### 메모리 시스템

SQLite FTS5 기반 영구 메모리 레이어가 에이전트의 과거 경험을 저장합니다. 새 태스크가 들어오면 유사한 과거 경험을 검색해 컨텍스트로 활용하고, 성공적인 실행 패턴을 재사용 가능한 스킬 파일로 추출합니다.

## 핵심 기술 스택

### [DSPy](./dspy) — Compound AI System 프레임워크

에이전트의 각 스킬을 DSPy 모듈로 정의합니다. Signature로 입출력 의미를 선언하고, Module로 실행 전략을 캡슐화합니다.

### [GEPA](./gepa) — 자연어 반성 기반 프롬프트 진화 알고리즘

DSPy 모듈의 프롬프트를 자동으로 최적화하는 엔진입니다. 실행 트레이스(추론 체인, 툴 호출, 에러 메시지)를 분석해 "왜 잘 됐는가/왜 실패했는가"를 자연어로 진단하고 프롬프트를 개선합니다.

GRPO(RL) 대비 **35배 적은 롤아웃**으로 더 높은 성능 달성.

## 참고 자료

- [Hermes Agent GitHub](https://github.com/nousresearch/hermes-agent)
- [Hermes Agent Self-Evolution GitHub](https://github.com/NousResearch/hermes-agent-self-evolution)
- [OpenClaw vs Hermes Agent — MarkTechPost](https://www.marktechpost.com/2026/05/10/openclaw-vs-hermes-agent-why-nous-researchs-self-improving-agent-now-leads-openrouters-global-rankings/)
