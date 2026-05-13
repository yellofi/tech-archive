# GEPA (Genetic-Pareto)

**UC Berkeley · Stanford · MIT, ICLR 2026 Oral** | [arXiv](https://arxiv.org/abs/2507.19457) | [GitHub](https://github.com/gepa-ai/gepa)

## 개요

GEPA(Genetic-Pareto)는 **복합 AI 시스템용 프롬프트 최적화 알고리즘**으로, ICLR 2026 Oral로 채택됐습니다. [DSPy](./dspy)의 차세대 Optimizer이자 [Hermes Agent](./hermes-agent) self-evolution 파이프라인의 핵심 엔진입니다.

핵심 테제: **LLM에게는 스칼라 보상(RL)보다 자연어 반성이 훨씬 풍부한 학습 신호입니다.**

:::tip 핵심 성능
GRPO(24,000 롤아웃) 대비 평균 **+6%**, 최대 **+20%** 성능을 **35배 적은 롤아웃**으로 달성합니다.
:::

## 핵심 수식

$$\langle\Pi^*\rangle = \arg\max_{\Pi} \mathbb{E}_{(x,m)\sim\mathcal{T}} \left[\mu\left(\Phi(x;\Pi,\Theta_{frozen}), m\right)\right]$$

- **Φ**: 복합 AI 시스템 (여러 LLM 모듈의 조합)
- **Π**: 최적화 대상 — 각 모듈의 프롬프트(instruction) 집합
- **Θ_frozen**: 고정된 모델 가중치
- **μ**: 성능 측정 지표

모델 가중치는 고정하고 **프롬프트만 최적화**한다는 것이 GRPO와의 근본적 차이입니다.

## 세 가지 핵심 메커니즘

### 1. Reflective Prompt Mutation

에이전트 실행 시 생성되는 두 종류의 트레이스를 활용합니다.

- **실행 트레이스**: LLM의 추론 체인, 툴 호출 과정, 중간 출력
- **평가 트레이스**: 컴파일러 에러, 실패한 rubric 항목 등 보상 계산 과정의 자연어

```
기존 RL:  풍부한 텍스트 → scalar reward (0 or 1)
GEPA:    풍부한 텍스트 → Reflection LM → 개선된 instruction
```

Reflection LM은 "왜 실패했는지"를 자연어로 진단하고, 어느 모듈의 프롬프트가 원인인지 **암묵적 credit assignment**를 수행합니다.

**실제 사례 (PUPA 태스크):**

| 노드 | 점수 | 변화 내용 |
|------|------|-----------|
| 0 (베이스) | 82.26 | 단순 지시문 |
| 2 | 90.99 | 확장된 프라이버시 전략 추가 |
| 4 | 94.44 | 구조화된 출력 포맷 |
| 11 | 97.60 | 엄격한 PII 추상화 프로토콜 |

매 iteration마다 도메인 지식이 프롬프트 안으로 축적됩니다.

### 2. Pareto-based Candidate Selection

탐욕적 선택(항상 최고 성능 후보를 진화)은 즉시 로컬 옵티마에 빠집니다.

GEPA의 해결책 — **인스턴스 단위 Pareto 프론티어** 유지:

1. 각 training instance마다 최고 점수를 내는 후보들을 기록
2. 다른 모든 후보에게 지배당하는 후보만 제거
3. 남은 후보를 Pareto 프론트 등장 빈도에 비례해 확률적 샘플링

**효과:** Pareto 선택 +12.44% vs greedy +6.05%

### 3. System-Aware Merge (GEPA+Merge)

서로 다른 모듈을 최적화한 두 후보를 **합성**합니다. 두 후보가 공통 조상을 갖고, 각각 서로 다른 모듈을 진화시켰을 때 각 모듈의 최선 버전을 골라 새 후보를 생성합니다. GPT-4.1 Mini에서 최대 +5%의 추가 이득.

## 주요 벤치마크 결과

| 비교 대상 | 결과 | 비고 |
|-----------|------|------|
| GRPO (24,000 롤아웃) | 평균 +6%, 최대 +20% 우위 | **35배 적은 롤아웃** |
| MIPROv2 | 모든 벤치마크에서 +10% 이상 | 프롬프트 길이는 4~9배 짧음 |
| 크로스 모델 일반화 | Qwen3-8B 최적화 → GPT-4.1-Mini +9% | MIPROv2 직접 최적화(+5.64%) 초과 |
| NPUEval | 4.25% → 30.52% 벡터 활용률 | 하드웨어 최적화 도메인 |

## GRPO(RL)과의 패러다임 비교

| 구분 | GRPO (RL) | GEPA |
|------|-----------|------|
| 최적화 대상 | 모델 가중치 (Θ) | 프롬프트 (Π) |
| 학습 신호 | 스칼라 보상 | 자연어 반성 텍스트 |
| 필요 롤아웃 | 24,000+ | 수백~수천 |
| 폐쇄 모델 적용 | 불가 | 가능 (API만으로 동작) |
| 모델 변경 시 재학습 | 필요 | 불필요 |

두 방식은 **상호보완적**입니다. GEPA는 최적화된 프롬프트를 만들고, RL은 그 위에서 가중치를 미세 조정할 수 있습니다.

## 참고 자료

- [GEPA 논문 — ICLR 2026 Oral (arXiv 2507.19457)](https://arxiv.org/abs/2507.19457)
- [GEPA GitHub](https://github.com/gepa-ai/gepa)
- [Hermes Agent Self-Evolution](https://github.com/NousResearch/hermes-agent-self-evolution)
