# SEO Content Plan — Kukmincalc

> 검색 의도별 키워드 클러스터 + 페이지 구조 + 내부링크 설계.  
> Larry Page Brain (검색 의도 → 페이지) + Aristoteles (분류·확장성).

## 표준 키워드 schema

```yaml
- targetKeyword: string         # 메인 검색어
  searchIntent: "informational" | "transactional" | "navigational"
  pageType: "calculator" | "guide" | "test" | "home" | "category"
  targetCalculator: string      # 연결될 계산기 id
  title: string                  # SEO title (60자 이하)
  metaDescription: string        # meta description (80~150자)
  H1: string                     # 페이지 H1
  introSummary: string           # 1~2 문장 답변
  relatedCalculators: string[]
  adCategory: "salary" | "tax" | "labor" | "realEstate" | "car"
  officialLinkCategory: "salary" | "tax" | "labor" | "realEstate" | "car"
  priority: "P0" | "P1" | "P2"
  phase: "3-1" | "3-2" | "3-3" | "later"
```

---

## 1. 연봉/월급 클러스터 (salary)

### P0 — 최우선

| targetKeyword | targetCalculator | title (60자 내) | priority | phase |
|---|---|---|---|---|
| 연봉 실수령액 | take-home-pay | 연봉 실수령액 계산기 2026 \| 4대보험·세금 공제 후 월급 | P0 | 3-1 |
| 월급 실수령액 | take-home-pay | 월급 실수령액 계산기 2026 \| 세후 월급 1분 계산 | P0 | 3-2 |
| 연봉 3000 실수령액 | take-home-pay | 연봉 3000만원 실수령액 2026 \| 월 얼마 받나요 | P0 | 3-2 |
| 연봉 4000 실수령액 | take-home-pay | 연봉 4000만원 실수령액 2026 \| 세후 월급 정확 계산 | P0 | 3-2 |
| 연봉 5000 실수령액 | take-home-pay | 연봉 5000만원 실수령액 2026 \| 4대보험·소득세 공제 | P0 | 3-2 |
| 연봉 6000 실수령액 | take-home-pay | 연봉 6000만원 실수령액 2026 \| 월 실수령 정확 계산 | P0 | 3-3 |
| 연봉 7000 실수령액 | take-home-pay | 연봉 7000만원 실수령액 2026 \| 누진세 반영 | P0 | 3-3 |
| 연봉 1억 실수령액 | take-home-pay | 연봉 1억 실수령액 2026 \| 고소득자 세금 부담 | P0 | 3-3 |

introSummary (예: 연봉 3000):
> 연봉 3,000만원의 2026년 기준 월 실수령액은 약 X원입니다. 국민연금 4.75%, 건강보험 3.595%, 장기요양 13.14%, 고용보험 0.9%, 소득세·지방소득세를 공제한 결과입니다. 부양가족 수와 비과세 항목에 따라 달라질 수 있습니다.

### P1 — 후속

- 월급 250 실수령
- 월급 300 실수령
- 신입 연봉 실수령
- 세전 세후 차이

---

## 2. 4대보험·급여 클러스터 (salary)

| targetKeyword | targetCalculator | title | priority | phase |
|---|---|---|---|---|
| 2026 4대보험 계산기 | social-insurance | 2026 4대보험 계산기 \| 근로자·사업주 부담 | P0 | 3-1 |
| 4대보험 요율 2026 | social-insurance | 2026 4대보험 요율 \| 국민연금 9.5% / 건강보험 7.19% | P0 | 3-2 |
| 국민연금 보험료 | pension | 국민연금 보험료 계산기 2026 \| 9.5% 적용 | P0 | (반영됨) |
| 건강보험 7.19 | health-insurance | 2026 건강보험료 7.19% \| 직장가입자 계산 | P0 | (반영됨) |
| 사업주 4대보험 부담 | employer-cost | 사업주 4대보험 부담 + 인건비 \| 직원 1명 월 비용 | P0 | (반영됨) |
| 월급명세서 양식 | paystub | 월급명세서 계산기 \| 지급·공제·실수령 | P1 | 3-2 |
| 식대 비과세 한도 | take-home-pay | 식대 비과세 월 20만원 한도 \| 실수령액 영향 | P1 | 3-3 |

---

## 3. 알바·근로 클러스터 (labor)

| targetKeyword | targetCalculator | title | priority | phase |
|---|---|---|---|---|
| 주휴수당 계산기 | weekly-holiday-pay | 주휴수당 계산기 2026 \| 주 15시간 이상 + 개근 | P0 | (반영됨) |
| 2026 최저시급 | hourly-wage | 2026 최저시급 10,320원 \| 월 환산 2,156,880원 | P0 | (반영됨) |
| 알바 시급 계산 | hourly-wage | 알바 시급↔월급 변환 \| 주휴수당 포함 | P0 | 3-2 |
| 야근수당 계산기 | overtime-pay | 야근·연장·휴일근로 수당 \| 1.5배~2.5배 | P0 | 3-2 |
| 연차수당 계산 | annual-leave-pay | 연차수당 계산기 \| 미사용 연차 정산 | P1 | 3-3 |
| 퇴직금 계산법 | severance-pay | 퇴직금 계산법 + 예시 \| 월 300만 3년 = 900만원 | P0 | 3-2 |

---

## 4. 프리랜서·세금 클러스터 (tax)

| targetKeyword | targetCalculator | title | priority | phase |
|---|---|---|---|---|
| 프리랜서 3.3 계산기 | freelancer-tax | 프리랜서 3.3% 원천징수 계산기 \| 실수령 1분 | P0 | (반영됨) |
| 기타소득 8.8 계산기 | freelancer-tax | 기타소득 8.8% 계산기 \| 필요경비 60% 적용 | P0 | (반영됨) |
| 종합소득세 계산기 | income-tax | 종합소득세 계산기 \| 누진세율 6~45% | P1 | 3-2 |
| 부가세 계산기 | vat | 부가가치세 10% 계산기 \| 공급가↔부가세 분리 | P1 | 3-3 |
| 양도소득세 1주택 | capital-gains-tax | 양도소득세 1세대 1주택 비과세 \| 12억 한도 | P1 | 3-3 |

---

## 5. 대출·부동산·자동차 클러스터 (realEstate / car)

| targetKeyword | targetCalculator | title | priority | phase |
|---|---|---|---|---|
| DSR 계산기 | dsr | DSR 계산기 \| 총부채원리금상환비율 | P0 | 3-2 |
| 주담대 한도 | mortgage-limit | 주담대 한도 계산기 \| LTV·DTI·DSR 동시 | P0 | 3-2 |
| 대출이자 계산 | loan-interest | 대출이자 계산기 \| 원리금/원금균등/만기일시 | P0 | 3-2 |
| 월세 전세 비교 | rent-to-deposit | 월세↔전세 전환 \| 한국은행 기준금리 기반 | P1 | 3-3 |
| 취득세 계산 | acquisition-tax | 주택 취득세 계산기 \| 1주택 1~3% | P1 | 3-3 |
| 자동차 유지비 | car-cost | 자동차 유지비 \| 보험·연료·세금 월 비용 | P1 | 3-3 |

---

## 페이지 구조 표준 (각 가이드/계산기 페이지)

1. **H1** — 검색어와 정확히 매칭되는 결론형
2. **요약 답변 (introSummary)** — 1~2 문장
3. **1분 계산 예시** — 실제 숫자 1개로 보여주기
4. **계산기 CTA** — “직접 계산하기” 버튼 → 해당 계산기로 이동
5. **공식 기준** — KR_RATES_2026 의 수치 + officialSource 인용
6. **왜 이 금액이 나왔나요?** — Sejong 번역 (생활 언어로 풀이)
7. **FAQ** — 4~5개, JSON-LD 적용
8. **관련 계산기** — relatedCalculators 카드
9. **공식 사이트 바로가기** — officialLinks 카드 (광고 X, "공식 사이트" 라벨)
10. **광고/제휴 영역** — 결과 아래 / 본문 하단 (계산 버튼 주변 금지)

---

## 내부링크 설계

```
홈
 ├── 인기 계산기 4개
 ├── 상황별 입구 7개  →  카테고리 섹션
 ├── 카테고리 섹션 6개
 ├── 시즌 계산 4개  →  타겟 계산기
 └── 공식 사이트 바로가기 8개

계산기
 ├── 적용 기준 박스 (verificationStatus 배지)
 ├── 결과 카드 → relatedCalculators (최소 4개)
 ├── 결과 카드 → 공식 사이트 바로가기 팝업 (after_result trigger)
 └── 푸터 → 카테고리 / 인기 계산기

가이드 (3-2 이후)
 ├── H1 → 동일 검색 의도 1개
 ├── H2 #2 후: ad-slot 자동 삽입 hook (가이드 페이지에서만)
 ├── H2 #4 후: ad-slot 자동 삽입 hook
 ├── 본문 → 계산기 CTA (3회 이상)
 └── 푸터 → 시리즈 다음 글
```

---

## canonical 정책

- 계산기 페이지: `https://kukmincalc.com/calculators/<id>.html`
- 가이드: `https://kukmincalc.com/guides/<slug>.html` (3-2 이후)
- 카테고리 앵커는 canonical 영향 X (`#cat-labor` 등)

---

## sitemap 갱신 트리거

다음 중 하나라도 발생하면 sitemap.xml 갱신:
1. 신규 계산기 추가
2. 신규 가이드 페이지 추가
3. 계산 기준 변경 (lastmod 업데이트)
4. 시즌 컨텐츠 발행

`.html` 접미사 통일은 PR #2 머지 시점에 적용 완료. 그 이후 새 URL 추가 시 `.html` 유지 의무.

---

## Phase 3-1 적용 범위

이 문서는 Phase 3-1에서 **클러스터 정의 + P0 우선순위만** 확정한다. 실제 가이드 페이지 발행은 3-2 이후.

Phase 3-1에서 적용 완료된 항목:
- 홈 H1/부제/메타 → 검색 의도 정렬
- 상황별 입구 → 카테고리 진입 경로
- 시즌 섹션 → 5월/7월/12월 시즌 키워드 미리 노출
- 공식 사이트 바로가기 → official-link 카테고리 일관 적용

Phase 3-2 이후 발행 대상 (P0):
- 가이드 12개 (연봉 3000~1억 실수령, 2026 4대보험, 주휴수당, 프리랜서 3.3%/8.8%, DSR, 주담대 한도)
