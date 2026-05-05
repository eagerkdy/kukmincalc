# 2026 기준값 변경 내역 (CHANGELOG)

본 문서는 2026 기준값 리팩토링 1차 작업에서 **기존 잘못된 값 → 정정값** 매핑을 기록한다.

검증 출처: 보건복지부, 고용노동부, 국세청, 국가법령정보센터.  
적용일: 2026-05-05.

---

## 코드 변경 (assets/js/calculator-core.js)

| 함수 | 위치 | 기존 값 | 정정값 | 출처 |
|---|---|---|---|---|
| `takeHomePay` | 국민연금 요율 | `0.045`, 상한 `265,500원` 고정 | `KR_RATES_2026.pension.employeeRate` (0.0475) + 기준월별 ceiling 적용 | 보건복지부 |
| `takeHomePay` | 건강보험 | `0.03545` | `KR_RATES_2026.healthInsurance.employeeRate` (0.03595) | 보건복지부 |
| `takeHomePay` | 장기요양 | `health × 0.1295` | `health × KR_RATES_2026.longTermCare.rateOnHealthInsurance` (0.1314) | 보건복지부 |
| `takeHomePay` | 비과세 기본값 | `200000` 하드코딩 | `KR_RATES_2026.mealAllowanceTaxFree.monthlyLimit` 참조 | 소득세법 |
| `pension` | clamp | `370,000~5,900,000` 고정 | `getRatesByDate(date).pensionIncomeLimit` (1~6월 40만~637만 / 7~12월 41만~659만) | 보건복지부 |
| `pension` | 요율 | `0.045 × 2` | `0.0475 × 2` | 보건복지부 |
| `healthInsurance` | 요율 | `0.03545`, `0.1295` | `0.03595`, `0.1314` | 보건복지부 |
| `employmentInsurance` | 사업주 요율 | `{small:0.0125, medium:0.0145, large:0.0165}` | spec 5단계 `employerAdditionalRates` 테이블 + `0.009 + additional` 분리 | needs_official_source — 임시 |
| `rentToDeposit` / `depositToRent` | conversionRate | `4.5` 하드코딩 | `conversionCapRate(baseRatePercent) = min(10%, baseRate+2%)`, `latestBaseRate.userEditable: true` | 한국은행, 주택임대차보호법 시행령 |

---

## HTML 본문 변경

### calculators/take-home-pay.html
| 위치 | 기존 | 정정 |
|---|---|---|
| 4대보험 설명 단락 | "4.5%(근로자 부담분), 상한액 월 265,500원, 보수월액의 3.545%, 장기요양 12.95%" | "4.75%, 1~6월 상한 6,370,000원·7~12월 상한 6,590,000원, 보수월액 3.595%, 장기요양 13.14%" |
| 입력 영역 | (없음) | `계산 기준월` / `원천징수 비율 (80/100/120%)` 셀렉트 추가 |
| 결과 위 | (없음) | `적용 기준값 박스` 추가 |

### calculators/pension.html
| 위치 | 기존 | 정정 |
|---|---|---|
| 요약 박스 (line 59) | "보험료율: 9% (근로자 4.5% + 사업주 4.5%) \| 기준소득월액: 37만~590만원" | "보험료율: 9.5% (근로자 4.75% + 사업주 4.75%) \| 1~6월 40만~637만 / 7~12월 41만~659만" |
| 본문 라인 78 | "근로자 최대 부담액은 월 265,500원(590만 x 4.5%)" | "1~6월 약 302,575원, 7~12월 약 313,025원" |
| 본문 일반 설명 | "총 9%의 보험료를 부담합니다" | "**2026년부터** 총 9.5%, 매년 0.5%p 인상되어 2033년 13% 도달" |
| 새 섹션 | (없음) | **2026~2033 단계 인상표** (8행) |
| 입력 영역 | (없음) | `계산 기준월` / `가입 유형(직장/지역/임의)` 셀렉트 추가 |
| FAQ JSON-LD | "총 9% / 근로자 최대 265,500원" | "총 9.5% / 1~6월 약 302,575원, 7~12월 약 313,025원" |

### calculators/health-insurance.html
| 위치 | 기존 | 정정 |
|---|---|---|
| 본문 / FAQ / JSON-LD | "7.09%", "3.545%", "12.95%" 전 occurrence | "7.19%", "3.595%", "13.14%" |
| "보수월액 상한 104,536,000원, 하한 279,000원" | (옛 고시값) | "보건복지부 공식 고시값을 따릅니다(2026년 고시값 확인 후 표시)" |
| 입력 영역 | (없음) | `계산 기준월` 셀렉트 + 적용 기준 박스 |

### calculators/employment-insurance.html
| 위치 | 기존 | 정정 |
|---|---|---|
| 사업장 규모 셀렉트 | 3단계 (small/medium/large) | **5단계** (우선지원대상기업 / 150인 미만 / 150인 이상 우선지원대상 / 150인 이상 1,000인 미만 / 1,000인 이상 또는 국가·지자체) |
| 결과 카드 (line 211 등) | "1.25%" (small) | "0.9% + 0.25% = 1.15%" 분리 표기 |
| 결과 카드 | 사업주 부담 단일 표시 | **사업주 = 실업급여 0.9% + 고용안정·직능개발 추가요율** 분리 |
| AI 인사이트 | "건강보험(3.545%), 국민연금(4.5%)" | "건강보험(근로자 3.595%), 국민연금(근로자 4.75%)" |
| 결과 카드 헤더 | (없음) | **공식 기준 확인 중** 배지 (verificationStatus: needs_official_source) |

### calculators/severance-pay.html
| 위치 | 기존 | 정정 |
|---|---|---|
| 본문 | (정정 예시 없음) | **계산 예시 박스 추가** — "월 300만, 3년 근속 → 9,000,000원" |
| 계산식 | 변경 없음 | 변경 없음 (`avgDailyWage × 30 × days/365`) |

> 주: `90,000,000원` 잘못된 예시는 worktree 어디에도 존재하지 않았다(grep 0건). 정정 예시는 신규 추가만 했다.

### calculators/hourly-wage.html
| 위치 | 기존 | 정정 |
|---|---|---|
| `MIN_WAGE_2026 = 10030` (라인 199) | `10030` | `KR_RATES_2026.minimumWage.hourly` (10,320) 참조 + fallback `10320` |
| 페이지 부제 | "2026 최저시급 10,030원" | "2026 최저시급 10,320원 (월 환산 2,156,880원, 209시간 기준)" |
| 프리셋 / 입력 기본값 / FAQ / JSON-LD | `10,030`, `2,096,270` 전 occurrence | `10,320`, `2,156,880` |
| 페이지 안내 박스 | "전년 대비 1.7% 인상" | "일 8시간 82,560원 \| 월 209시간 2,156,880원" |

---

## 신규 파일

```
assets/js/constants/sources-2026.js       — 공식 출처 사전
assets/js/constants/rates-kr-2026.js      — 2026 확정 기준값
assets/js/constants/rounding-kr.js        — 원 단위 처리 규칙
assets/js/constants/policies-kr.js        — DSR/LTV/DTI/자동차세/전월세/원천징수 정책 스키마
assets/js/utils/rates.js                  — getRatesByDate(date, calculatorType)
assets/js/utils/rounding.js               — floorToUnit / roundToUnit / ceilToUnit / roundByRule
tests/calc-core.test.html                 — 브라우저 테스트 러너
docs/RATE_SOURCES.md                      — 항목별 출처 표
docs/CALCULATION_POLICY.md                — 계산 정책
docs/CHANGELOG-2026-RATES.md              — 본 문서
```

---

## 수정 파일

```
assets/js/calculator-core.js              — _rates/_ratesAt/_round/_appliedRates 헬퍼 추가, takeHomePay/pension/healthInsurance/employmentInsurance/rentToDeposit/depositToRent 리팩토링
assets/js/common.js                       — renderAppliedRatesBox(opts) 추가
assets/css/calculator.css                 — .applied-rates-box, .rate-badge.{verified,needs-source,dynamic,other}, .ad-slot min-height
calculators/take-home-pay.html
calculators/pension.html
calculators/health-insurance.html
calculators/employment-insurance.html
calculators/severance-pay.html
calculators/hourly-wage.html
```

---

## 검증

`tests/calc-core.test.html` 을 브라우저에서 직접 열어 전 항목 PASS 확인.

핵심 단정문:
- `pension(3,000,000, 2026-05).employee = 142,500` (= 3,000,000 × 0.0475)
- `pension(7,000,000, 2026-03).base = 6,370,000` / `2026-08 = 6,590,000`
- `healthInsurance(3,000,000).health = floor10(215,700)` / `longTerm = floor10(28,342.98) = 28,340`
- `KR_RATES_2026.minimumWage.hourly × 209 = 2,156,880`
- `severancePayFromMonthly(3,000,000, 3) = 9,000,000`
- `getRatesByDate(...).warnings` 에 `employmentInsurance` 의 `needs_official_source` 포함
- `KR_RATES_2026.healthInsurance.officialSource[0].name === "보건복지부"`
- `conversionCapRate(1.5) = 3.5%` (= min(10%, 1.5%+2%))

---

## 1차 작업에서 미반영 (2·3차로 이월)

- 신규 계산기: 4대보험 통합 / 사업주 총 인건비 / 월급명세서 / 주휴수당 / 프리랜서 3.3%/8.8% — **2차**
- 자동차세 / 연말정산 / DSR-LTV-DTI policyTable 채우기 — **2차**
- 간이세액표 2026-03-01 시행분 원본(.xlsx → .json 변환), 80/100/120% 정확 매핑 — **3차**
- SEO 랜딩 페이지(`/guides/*`) / BreadcrumbList JSON-LD / canonical / sitemap 갱신 — **3차**
- 공유 URL (`?salary=...&date=...`) / localStorage 최근 5개 — **3차**
- 애드센스 슬롯 재배치 (`.ad-slot { min-height: 100px }` 만 1차 반영) — **3차**
- iframe / SDK 응답에 `appliedRates` 메타 포함 — **3차**
