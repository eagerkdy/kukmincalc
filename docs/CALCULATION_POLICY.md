# 계산 정책 (CALCULATION_POLICY)

본 문서는 Kukmincalc 의 모든 계산기에서 공통적으로 지키는 정책을 정의한다.

---

## 1. 결과는 참고용

모든 계산 결과는 입력값과 공개 기준값을 바탕으로 한 **참고용 결과**이다. 실제 금액은 회사의 급여정책, 개인별 공제 조건, 기관 고시, 신고자료에 따라 달라질 수 있다.

각 계산기 페이지 하단 disclaimer 와 결과 카드 하단에 동일 문구가 노출된다.

---

## 2. 기준월 처리

- 사용자가 `계산 기준월` 을 선택하면 해당 월에 유효한 요율/한도가 적용된다.
- 국민연금 기준소득월액은 **2026년 7월부터** 상·하한이 변경된다.
  - 1~6월: 하한 400,000 / 상한 6,370,000
  - 7~12월: 하한 410,000 / 상한 6,590,000
- 결정 로직은 `assets/js/utils/rates.js` 의 `getRatesByDate(date, calculatorType)` 한 곳에서 처리한다. 페이지나 `CalcCore` 에서 직접 분기하지 않는다.

---

## 3. roundingRule 처리

- 모든 보험료/세금 계산은 `KR_ROUNDING_RULES[ruleKey]` 의 `method` 와 `unit` 에 따라 일관 처리한다.
- 계산 함수에서는 `_round(amount, ruleKey)` 또는 `roundByRule(amount, ruleKey)` 를 호출한다 — `Math.round` 를 직접 쓰지 않는다.
- `verificationStatus: needs_official_source` 인 rule 은 결과 카드에 배지로 표시된다(공식 단위 확정 후 verified 로 승격).
- 각 ruleKey 의 정의는 [docs/RATE_SOURCES.md](RATE_SOURCES.md) 와 `assets/js/constants/rounding-kr.js` 참조.

---

## 4. 공식 출처 우선 원칙

- `officialSource[]` — 정부/공공기관/법령 공식 자료만.
- `referenceSource[]` — 공단(NPS/NHIS/KCOMWEL), 민간 자료, 보조 자료.
- **블로그/세무사 글/민간 계산기/카드사 콘텐츠는 절대 officialSource 로 인용 금지.**
- 건강보험 officialSource 는 **보건복지부**로 통일. `nps.or.kr` / `nhis.or.kr` 는 referenceSource 전용.
- 자동차세 officialSource 는 **위택스 / 지방세법 / 행정안전부**만.

---

## 5. dynamic policy 처리

- DSR / LTV / DTI / 자동차세 / 전월세 전환율 / 연말정산 등 **조건·시점에 따라 변동되는 값**은 단일 constants 금지.
- `assets/js/constants/policies-kr.js` 의 `policyTable[]` 또는 formula 로 관리.
- 사용자 입력 조건(은행권/규제지역/주택수/생애최초/정책대출/스트레스DSR 등)을 받아 분기.
- 전월세 전환율: `min(0.10, latestBaseRate + 0.02)`. `latestBaseRate.userEditable: true` — 사용자 직접 수정 가능.

---

## 6. verificationStatus 정의

| 값 | 의미 | UI 배지 |
|---|---|---|
| `verified` | 공식 출처로 검증 완료 | 초록 배지 “적용 기준” |
| `needs_official_source` | 공식 원문 보강 필요 — 임시값으로 동작 | 주황 배지 “공식 기준 확인 중” |
| `dynamic` | 조건/시점에 따라 변동 — policyTable 필수 | 파랑 배지 “동적 정책값” |
| `verified_or_table_based` | 표 lookup 우선 (간이세액표) | (배지 없음, table fallback) |
| `estimated` | 간이 추정 | 회색 배지 |
| `deprecated` | 과거 기준값 | 비활성 |

`getRatesByDate(...)` 는 verified 가 아닌 항목을 모아 `warnings[]` 로 반환한다. 각 페이지의 `renderAppliedRatesBox(...)` 가 이를 배지로 노출.

---

## 7. 결과 객체 표준

`CalcCore.*` 의 모든 계산 함수는 결과 객체에 다음을 포함하도록 한다(점진적 마이그레이션):

```js
{
  // ... 계산 결과 필드 ...
  appliedRates: {
    rateVersion: "KR-2026-05",      // 적용 기준 버전
    appliedDate: "2026-05-01",       // 적용 기준일
    lastVerifiedAt: "2026-05-05",    // 마지막 검증일
    warnings: [                       // verified 가 아닌 항목 모음
      { key, status, message }
    ],
    verificationStatus: "..."         // 항목별 상태(선택)
  }
}
```

UI 는 이 메타데이터를 사용해 적용 기준 박스를 그린다.

---

## 8. 호환성 원칙

- `CalcCore.*` 메서드 시그니처는 backward-compat 유지.
- 신규 옵션은 마지막 인자 `opts = { date, ... }` 로 추가.
- 기존 페이지가 `CalcCore.takeHomePay(salary, dependents, children, nonTaxable)` 형태로 호출해도 그대로 동작해야 한다.
- `employmentInsurance(salary, 'small'|'medium'|'large')` 의 기존 alias 도 5단계 신규 라벨과 호환되도록 매핑 유지.

---

## 9. API 응답 (3차 작업 예정)

iframe / SDK / API 응답에 `appliedRates` 메타를 함께 반환:

```json
{
  "calculator": "take-home-pay",
  "input": {...},
  "result": {...},
  "appliedRates": {
    "rateVersion": "KR-2026-05",
    "lastVerifiedAt": "2026-05-05",
    "verification": { "pension": "verified", "employmentInsurance": "needs_official_source" }
  },
  "calculatedAt": "2026-05-05T00:00:00+09:00",
  "disclaimer": "본 계산 결과는 참고용입니다."
}
```
