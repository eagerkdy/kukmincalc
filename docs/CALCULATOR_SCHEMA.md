# Calculator Schema — Kukmincalc 표준 공정

[전략] Ford/Toyota Brain — 모든 신규 계산기는 schema-driven. 페이지별 하드코딩 금지, constants/CalcCore/공통 helper만 조합.

## Schema

```js
{
  id: "social-insurance",                     // URL slug
  title: "4대보험 통합 계산기",
  category: "labor" | "tax" | "realEstate" | "finance" | "insurance" | "life",
  searchIntent: ["4대보험 계산기", "2026 4대보험 요율", ...],
  inputs: [
    { id, label, type, default, options?, validate? }
  ],
  outputs: {
    primary: { label, formula, format },     // Jobs Brain — 핵심 결과 1개 우선
    breakdown: [...]                          // 그 뒤 상세
  },
  formulas: [...],
  appliedRates: ["pension", "healthInsurance", ...],   // KR_RATES_2026 키 참조
  verificationStatus: "verified" | "needs_official_source" | "dynamic" | "estimated" | "deprecated",
  officialSources: [{ key, title, url }],
  referenceSources: [{ ... }],
  relatedCalculators: ["take-home-pay", "pension", ...],
  officialLinks: ["nps", "nhis", "moel", "hometax"],   // KR_OFFICIAL_SOURCES 키
  adCategory: "salary" | "tax" | "realEstate" | "car" | "labor",
  officialLinkCategory: "salary" | "tax" | "realEstate" | "car" | "labor",
  latestBadge: "2026 최신 기준 반영" | "공식 기준 확인 중" | "간이 추정 계산" | null,
  pageType: "calculator" | "guide" | "test" | "home",
  tests: [...]
}
```

## 표준 공정 (15단계)

1. schema 작성
2. inputs 정의
3. outputs 정의
4. formula 정의
5. constants 연결 (`KR_RATES_2026` / `KR_POLICIES`)
6. `CalcCore` 함수 작성 또는 재사용
7. result renderer (`Jobs Brain` — primary 결과 카드 우선)
8. officialSource 표시 (`renderAppliedRatesBox`)
9. relatedCalculators 카드
10. officialLinks 카드 (`Sejong Brain` — “공식 사이트 바로가기” 라벨)
11. adCategory → ad-slot fallback 카테고리 매핑
12. NAV_CATEGORIES + index.html + sitemap.xml 등록
13. tests/phase2.test.html 또는 calc-core.test.html 단정문 추가
14. grep 검증 (옛 값/placeholder 텍스트 0건)
15. PR 생성 (main 직접 push 금지)

## 페이지 결과 화면 표준 (Jobs Brain)

```
1. 핵심 결과 카드 (primary)
2. 세부 breakdown
3. 왜 이 금액이 나왔나요? (Sejong 번역)
4. 적용 기준 박스 (renderAppliedRatesBox)
5. 공식 출처 (officialSource)
6. 관련 계산기 (relatedCalculators)
7. 공식 사이트 바로가기 (officialLinks)
8. 광고/제휴 슬롯 (adCategory 기반 ad-slot)
```

## adCategory ↔ officialLinkCategory 매핑

| adCategory | officialLinkCategory | 공식 링크 후보 |
|---|---|---|
| salary | salary | 국민연금공단, 국민건강보험, 고용보험, 4대사회보험 정보연계센터, 홈택스 |
| tax | tax | 정부24, 홈택스, 국세청, 위택스 |
| labor | labor | 정부24, 고용24, 고용보험, 근로복지공단 |
| car | car | 정부24, 위택스, 자동차365 |
| realEstate | realEstate | 정부24, 위택스, 청약홈, 부동산 공시가격 알리미 |

## verificationStatus 배지 매핑

| status | UI 라벨 | 색상 |
|---|---|---|
| `verified` | "2026 최신 기준 반영" | 초록 |
| `needs_official_source` | "공식 기준 확인 중" | 주황 |
| `dynamic` | "동적 정책값" | 파랑 |
| `estimated` | "간이 추정 계산" | 회색 |
| `deprecated` | "과거 기준값" | 비활성 |

## Schema 인스턴스 예시: social-insurance

```js
window.KC_SCHEMA = window.KC_SCHEMA || {};
window.KC_SCHEMA['social-insurance'] = {
  id: 'social-insurance',
  title: '4대보험 통합 계산기',
  category: 'labor',
  pageType: 'calculator',
  searchIntent: ['4대보험 계산기', '2026 4대보험 요율', '월급 4대보험 계산', '사업주 4대보험 부담금'],
  inputs: ['monthlySalary', 'nonTaxable', 'calcMonth', 'companySize'],
  outputs: {
    primary: { label: '근로자 총 공제액 (월)', format: 'krw' },
    breakdown: ['nationalPension', 'healthInsurance', 'longTermCare', 'employmentIns',
                'employerNationalPension', 'employerHealthInsurance', 'employerLongTermCare',
                'employerEmploymentBase', 'employerEmploymentAdditional', 'employerIndustrial',
                'totalEmployerBurden', 'totalLaborCost']
  },
  appliedRates: ['pension', 'pensionIncomeLimit', 'healthInsurance', 'longTermCare',
                 'employmentInsurance', 'industrialAccidentInsurance'],
  verificationStatus: 'needs_official_source',  // 고용보험 때문에 mixed
  relatedCalculators: ['take-home-pay', 'employer-cost', 'paystub', 'pension', 'health-insurance'],
  officialLinks: ['nps', 'nhis', 'moel', 'kcomwel'],
  adCategory: 'salary',
  officialLinkCategory: 'salary',
  latestBadge: '2026 최신 기준 반영'
};
```

## 연결 함수

`window.KC.getSchema(id)` — schema 조회.
`window.KC.renderRelatedCalculators(schema)` — 카드 그리드 HTML.
`window.KC.renderOfficialLinks(schema)` — 공식 바로가기 카드.
`window.KC.renderLatestBadge(schema)` — 배지.

(2차에서는 schema 등록 + 직접 사용. 4차에서 헬퍼 함수 추출.)
