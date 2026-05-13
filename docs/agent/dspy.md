# DSPy (Declarative Self-improving Python)

**Stanford·MIT, ICLR 2024** | [GitHub](https://github.com/stanfordnlp/dspy) | [Docs](https://dspy.ai/)

## 개요

DSPy는 Stanford·MIT의 Omar Khattab 연구팀이 개발한 **복합 AI 시스템(Compound AI System) 프로그래밍 프레임워크**입니다. "프롬프트 문자열을 직접 손으로 다듬는 것"에서 벗어나, LLM 호출을 구조화된 모듈로 선언하고 자동으로 최적화하는 패러다임을 제시합니다.

> *"DSPy는 AI 시스템 설계를 특정 LLM이나 프롬프팅 전략에 대한 우연적 선택으로부터 분리한다."*

## 왜 DSPy가 필요한가

기존 방식의 문제: 프롬프트와 로직이 결합되어 있어 모델을 바꾸거나 태스크가 달라지면 처음부터 다시 튜닝해야 합니다.

DSPy의 해결책 — **분리(decoupling)**:

- **구조** (무엇을 해야 하는가) → 코드로 작성
- **파라미터** (어떻게 말할 것인가) → 최적화 알고리즘이 자동으로 탐색

## 핵심 3요소

### 1. Signatures — "무엇을 해야 하는가" 선언

입력과 출력의 의미론적 역할을 자연어로 선언합니다. 구현 방법이 아니라 **의도**를 기술하는 것이 핵심입니다.

```python
class GenerateAnswer(dspy.Signature):
    """문서를 참고해 질문에 답하라."""
    context = dspy.InputField(desc="관련 문서 목록")
    question = dspy.InputField()
    answer = dspy.OutputField(desc="간결한 1~2문장 답변")
```

### 2. Modules — 재사용 가능한 AI 컴포넌트

Signature를 실행하는 전략을 캡슐화한 단위. PyTorch의 `nn.Module`과 유사한 개념입니다.

| 모듈 | 역할 |
|------|------|
| `dspy.ChainOfThought` | 단계별 추론 유도 |
| `dspy.ReAct` | 추론과 행동을 반복하는 에이전트 루프 |
| `dspy.Retrieve` | 검색 증강 생성(RAG) |

### 3. Optimizers — 파라미터 자동 탐색

시스템의 구조는 고정한 채, 각 모듈의 instruction과 few-shot 예시를 자동으로 최적화합니다.

| Optimizer | 방식 | 특징 |
|-----------|------|------|
| MIPROv2 | Bayesian Optimization | instruction + few-shot 동시 최적화 |
| BootstrapFewShot | 데모 부트스트래핑 | 빠르고 저비용 |
| **[GEPA](./gepa)** | Genetic-Pareto + 자연어 반성 | **MIPROv2 대비 +10% 이상, 35× 샘플 효율** |

## Compound AI System 예시

```python
class MultiHopQA(dspy.Module):
    def __init__(self):
        self.retrieve = dspy.Retrieve(k=3)
        self.generate_query = dspy.ChainOfThought("context, question -> search_query")
        self.generate_answer = dspy.ChainOfThought(GenerateAnswer)

    def forward(self, question):
        passages = self.retrieve(question).passages
        query = self.generate_query(context=passages, question=question).search_query
        more_passages = self.retrieve(query).passages
        return self.generate_answer(context=more_passages, question=question)
```

이 시스템 전체를 DSPy Optimizer에 넘기면, 각 모듈의 프롬프트가 자동으로 최적화됩니다. **개발자는 구조만 설계하면 됩니다.**

## Hermes Agent에서의 역할

Hermes Agent는 DSPy를 기반으로 에이전트의 스킬(Skill)을 모듈로 정의하고, GEPA Optimizer를 통해 이 스킬들을 자동으로 진화시킵니다. DSPy + GEPA의 결합이 self-evolution을 가능하게 합니다.

## 참고 자료

- [DSPy 공식 문서](https://dspy.ai/)
- [DSPy GitHub](https://github.com/stanfordnlp/dspy)
- [논문: Compiling Declarative Language Model Calls (ICLR 2024)](https://openreview.net/forum?id=sY5N0zY5Od)
