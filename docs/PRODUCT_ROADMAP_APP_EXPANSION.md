# Product Roadmap — Kukmincalc App Expansion

> **Phase 4 Planning (2026-05-18)**
> 국민계산기를 "계산기 사이트"에서 **"내 돈 계산·정책·지원금 알림 플랫폼"**으로 확장하는 큰그림.
> 이 문서는 코드 명세가 아니라 **방향과 우선순위 합의서**.

---

## 0. 최종 포지션

### 현재
> 월급·세금·보험료를 공식 기준으로 계산하는 **생활금융 도구 허브**

### 최종 (Phase 5 완료 후)
> 내 월급·세금·보험료·지원금·환급금까지 한 번에 확인하는 **생활금융 알림 플랫폼**

짧은 한 줄:
> **내 돈 계산과 정책 알림, 국민계산기**

앱 스토어 라벨 후보:
- 국민계산기 — 월급·세금·지원금 알림
- 국민계산기 — 실수령액·4대보험·세금 계산
- 국민계산기 — 내 돈 계산과 정책 알림

---

## 1. 판단 기준 (Brain Framework 적용)

본 로드맵 모든 결정은 다음 위인 관점을 통과한다. 각 Phase 4~5 작업은 "어느 위인 관점에서 이게 맞는가"를 명시한다.

| 위인 | 적용 |
|---|---|
| **Steve Jobs** | 기능 나열 금지. 사용자 상황(직장인/알바/프리/사업주) 기준 진입 구조 |
| **King Sejong** | 모든 정책/지원금 페이지는 "이게 뭔가요 → 누가 → 얼마 → 어디서 공식 확인" 4단 구조. 어려운 용어는 생활 언어 번역 첨부 |
| **David Ogilvy** | 버튼은 기능명이 아니라 사용자 이득. "근로장려금 안내" → "내가 근로장려금 대상인지 확인하기" |
| **Aristoteles** | 분류 체계 4축 고정 — 계산 / 점검 / 혜택 / 공식 확인. 신규 기능은 이 4축 안에 들어가야 함 |
| **Jeff Bezos** | 플라이휠 — SEO 유입 → 계산 → 저장 → 다음 행동 → 공식 확인 → 알림 → 재방문 → 측정 → 확장 |
| **Larry Page** | 검색은 계산기명이 아니라 질문형 키워드를 잡는다. 지원금/환급금/장려금/연말정산/자동차세/실업급여 클러스터로 확장 |
| **Buffett · Munger** | 신뢰 우선. "정부 제휴 / 공식 파트너 / 100% 환급 / 무조건 받음" 절대 금지 |
| **Sun Tzu** | 정부24/보조금24 정면승부 X. "공식 사이트로 가기 전 내 돈을 미리 계산하는 관문" 포지션 |
| **Walt Disney** | 사용자 여정 — 직장인 여정, 프리랜서 여정, 사업주 여정을 체크리스트 팩으로 |
| **Charles Darwin** | GA4 데이터 기반으로 죽일 기능과 살릴 기능 선별. 7일/30일 단위 가지치기 |
| **Peter Drucker** | "측정할 수 없으면 개선할 수 없다" — Phase 3-5B로 측정 인프라 가동, Phase 4 모든 기능은 GA4 이벤트 정의를 동반한다 |

---

## 2. 분류 체계 (Aristoteles) — 고정 4축

신규 기능은 이 4축 안에 들어와야 한다. 4축을 벗어나는 기능은 별도 합의 없이 추가 금지.

```
1. 계산  (지금까지의 35개 계산기 — 입력 → 숫자 결과)
2. 점검  (직장인/알바/프리/사업주 체크리스트 팩 — 여러 계산기를 1여정으로 묶음)
3. 혜택  (지원금/환급금/장려금/시즌 — 대상 여부 + 공식 확인 경로)
4. 공식 확인  (홈택스/정부24/보조금24/위택스/공단/고용24 — 신뢰 출구)
```

홈 네비게이션 최종 구조 (Phase 5 완료 후):
```
홈
├─ 내 돈 상황판      (점검 진행 상태 + 최근 계산 + 이번 달 확인할 돈)
├─ 계산              (4대 카테고리)
├─ 점검              (페르소나별 체크리스트 팩)
├─ 혜택              (지원금·환급금 허브)
├─ 공식 확인         (8개 공식 사이트 카드)
└─ 알림              (시즌 변경 알림)
```

---

## 3. 사용자 여정 (Disney) — 페르소나 3종

### 3-1. 직장인 여정
```
나는 직장인이다
→ 연봉 실수령액 계산
→ 4대보험 확인
→ 월급명세서 확인
→ 퇴직금 확인
→ 연말정산 체크
→ 근로장려금 대상 확인
→ 홈택스 공식 확인
```

### 3-2. 프리랜서 여정
```
나는 프리랜서다
→ 3.3% 세금 계산
→ 기타소득 8.8% 확인
→ 부가세 확인
→ 종합소득세 체크
→ 국세환급금 조회
→ 홈택스 공식 확인
```

### 3-3. 사업주 여정
```
나는 사업주다
→ 직원 월급 입력
→ 사업주 4대보험 확인
→ 총 인건비 확인
→ 월급명세서 발급
→ 소상공인 정책자금 대상 확인
→ 고용보험/산재보험 공식 확인
```

각 여정은 **Phase 4A의 "내 돈 상황판" / Phase 4B의 "점검 팩"**으로 구체화된다.

---

## 4. 플라이휠 (Bezos)

```
질문형 SEO 유입
→ 계산기 사용
→ 최근 계산 저장
→ 다음 행동 카드
→ 공식 사이트 확인
→ 정책/지원금 관심 저장   (Phase 4)
→ 알림/앱 설치              (Phase 5)
→ 재방문                    (Phase 5C)
→ 데이터 측정 (GA4)         (Phase 3-5B 완료)
→ 잘 먹히는 주제 확장 (Phase 3-4B / 4B)
```

**현재 위치 (2026-05-18):** 측정(GA4) ─ ──> 정책/지원금 저장(Phase 4) 진입 직전.

---

## 5. Phase 4 — 웹 확장 (앱 전 단계)

### 5-1. Phase 4A — 내 돈 상황판

**목표**
> 최근 계산을 단순 목록이 아니라 **내 돈 점검판**으로 바꾼다.

**대상 기능**
- 페르소나 자동 추정 (최근 사용한 계산기 패턴 → 직장인/알바/프리/사업주)
- 점검 체크리스트 (페르소나별 5~7개 항목)
- 진행률 표시 (3/7 항목 완료 등)
- 이번 달 확인할 돈 (시즌 트리거)

**예시 — 직장인 점검**
```
✅ 실수령액 확인
✅ 4대보험 확인
□ 월급명세서 확인
□ 퇴직금 확인
□ 연말정산 확인
```

**의존성**
- localStorage `kc_recent_calculations` (Phase 3-3A 완료) 재사용
- 새 localStorage 키 `kc_persona_checklists` 추가

**GA4 이벤트 (Drucker)**
- `persona_detected` { persona }
- `checklist_item_completed` { persona, item_id }
- `situation_panel_viewed`

**금지**
- 사용자 입력 원문 저장 금지 (Phase 3-3A 규약 그대로)
- "정부 제휴" 등 금지 표현

---

### 5-2. Phase 4B — 지원금·환급금 허브

상세는 [`docs/POLICY_BENEFIT_HUB_PLAN.md`](POLICY_BENEFIT_HUB_PLAN.md) 참조. 핵심 요약:

**1차 10개 (P0)**
1. 근로장려금
2. 자녀장려금
3. 국세환급금
4. 건강보험 환급금
5. 자동차세 연납
6. 실업급여 (계산기 기존 → 가이드 보강)
7. 국민취업지원제도
8. 청년 월세 지원
9. 소상공인 정책자금
10. 보조금24 공식 확인

각 항목 페이지 구조 (Sejong + Ogilvy):
```
1. 이게 뭔가요?        (한 문장 생활 언어 번역)
2. 누가 확인해야 하나요? (대상 조건 — 참고 안내, 단정 금지)
3. 얼마나 받을 수 있나요? (범위 — 계산기 연결 가능 시 CTA)
4. 어디서 공식 확인하나요? (공식 사이트 카드, "공식 사이트" 라벨)
5. 계산기로 먼저 확인할 수 있나요? (해당 시 계산기 CTA)
```

---

### 5-3. Phase 4C — 정책 시즌 알림

**목표**
> 재방문 이유를 만든다.

**1차 구현 (웹 only, 푸시 알림 없음)**
- 홈 상단 "이번 달 확인할 돈" 섹션
- 월 단위 시즌 트리거 자동 노출

**시즌 캘린더**
| 월 | 트리거 | 연결 가이드/계산기 |
|---|---|---|
| 1월 | 자동차세 연납 | (Phase 4B 후) |
| 2월 | 연말정산 | (Phase 4B 후) |
| 3월 | 부가세 1기 예정 | freelancer-tax / vat |
| 4월 | 건강보험 정산 | health-insurance |
| 5월 | 종합소득세 | freelancer-tax / income-tax |
| 6월 | 자동차세 1기 | (Phase 4B 후) |
| 7월 | 국민연금 기준소득월액 변경 | national-pension-2026 가이드 |
| 8월 | 주민세 | (Phase 4B 후) |
| 9월 | 재산세 1기 / 부가세 2기 예정 | property-tax / vat |
| 10월 | — | — |
| 11월 | 근로장려금 기한 후 신청 | (Phase 4B 후) |
| 12월 | 연말정산 준비 | (Phase 4B 후) |

**GA4 이벤트**
- `season_card_viewed` { season_month, season_label }
- `season_card_clicked` { season_month, target }

**금지**
- 푸시 알림은 Phase 5C에서 (PWA 깐 후)
- 시즌 단정 표현 금지 — "확인하세요" / "준비하세요" 유지

---

## 6. Phase 5 — 앱화 (PWA → Play Store)

상세는 [`docs/PWA_PLAY_STORE_PLAN.md`](PWA_PLAY_STORE_PLAN.md) 참조. 핵심 요약:

### 6-1. Phase 5A — PWA
- `manifest.json` + 아이콘 세트
- Service Worker 1차 (오프라인 셸 + 캐시 전략)
- 홈 화면 추가 유도 (browser native prompt 활용)
- localStorage 그대로 활용 (계정 없음 정책 유지)

### 6-2. Phase 5B — Play Store TWA
- Bubblewrap CLI로 TWA 생성
- Digital Asset Links (`assetlinks.json`)
- Play Console 등록 — 카테고리: Finance
- 정책 검토 통과 기준 (개인정보처리방침 / 금융 도구 표현 가이드)

### 6-3. Phase 5C — 앱 알림
- Web Push (PWA) — 시즌 알림만 (이벤트성)
- 사용자 명시 허용 후 활성
- Play Store TWA에서 동일하게 동작

---

## 7. SEO 클러스터 확장 (Larry Page)

Phase 3-4에서 P0 12개 가이드 발행. Phase 4 진행에 맞춰 다음 클러스터 추가:

| 클러스터 | 우선순위 | 연결 Phase |
|---|---|---|
| 연봉 6000/7000/1억 실수령 | P1 (D+7 측정 결과 의존) | Phase 3-4B |
| 근로장려금 / 자녀장려금 대상 | P1 | Phase 4B |
| 국세환급금 / 건강보험 환급금 조회 | P1 | Phase 4B |
| 자동차세 연납 할인 / 1월 신청 | P2 (시즌) | Phase 4B + 4C |
| 연말정산 시즌 (식대 비과세, 신용카드, 의료비) | P2 (시즌) | Phase 4C |
| 종합소득세 신고 가이드 | P1 (시즌) | Phase 4B |
| 실업급여 수급 조건/기간 | P2 | Phase 4B 가이드 |
| 국민취업지원제도 | P2 | Phase 4B |
| 청년 월세 지원 | P2 | Phase 4B |

**확장 원칙 (Darwin):** D+7 GA4 보고서에서 상위 키워드 클러스터에서만 파생. 검색량 가설 없이 만들지 않음.

---

## 8. 신뢰 가드 (Buffett · Munger) — 모든 Phase 4~5에서 절대 위배 금지

### 8-1. 절대 금지 표현
- 정부 제휴 / 공식 파트너 / 정부 공식 앱
- 정부24 광고 / 홈택스 제휴 / 보조금24 공식
- 무조건 받음 / 100% 환급 / 확정 지원금
- 신청 대행 / 대신 신청 / 자동 신청

### 8-2. 권장 표현
- "공식 사이트에서 최종 확인하세요"
- "대상 여부는 입력값과 공식 기준에 따라 달라질 수 있습니다"
- "국민계산기는 계산과 공식 확인을 돕는 참고용 도구입니다"
- "참고용입니다"

### 8-3. 광고/측정 무손상 (Phase 3-5B 유지)
- AdSense Auto Ads 변경 금지
- `ca-pub-6481387413747515` 변경 금지
- `ads.txt` 변경 금지
- GA4 `G-DRYL72PPZ0` 측정 ID 변경 금지
- KCAnalytics PII / 원문금액 가드 변경 금지

---

## 9. 우선순위 결정 룰 (Drucker · Darwin)

**Phase 4 작업 순서는 GA4 D+7~D+30 데이터로 결정한다.** 데이터 없이 만들지 않음.

| GA4 신호 | 다음 작업 |
|---|---|
| 가이드 → 계산기 CTA 전환율 30%↑ | Phase 4A (점검 팩) 우선 — 사용자가 계산 흐름에 머무름 |
| 가이드만 보고 이탈 비율 60%↑ | Phase 4B (혜택 허브) 우선 — 새 진입 동기 필요 |
| 시즌 키워드(5월 종소세) 상위 진입 | Phase 4C (시즌 알림) 우선 — 시즌 유입 펌프 |
| 재방문률 15%↑ | Phase 5A (PWA) 즉시 진행 — 설치 동기 충분 |
| 모바일 점유율 80%↑ | Phase 5B (Play Store) 가속 — 모바일 사용자 락인 |

**D+30 시점 (2026-06-15) 평가표 작성** — 위 룰을 적용해 Phase 4A/4B/4C 중 첫 구현 대상 선정.

---

## 10. 측정 합의서 (Drucker)

Phase 4~5 모든 신규 기능은 다음 GA4 이벤트를 동반한다. `docs/ANALYTICS_EVENT_PLAN.md` 의 확장 섹션으로 등록.

| Phase | 신규 이벤트 |
|---|---|
| 4A | `persona_detected`, `checklist_item_completed`, `situation_panel_viewed` |
| 4B | `benefit_card_viewed`, `benefit_card_clicked`, `benefit_official_link_clicked` |
| 4C | `season_card_viewed`, `season_card_clicked` |
| 5A | `pwa_install_prompted`, `pwa_installed` |
| 5B | `app_opened_from_store` (TWA 진입 식별) |
| 5C | `push_permission_requested`, `push_permission_granted`, `push_notification_clicked` |

PII/원문금액 가드는 Phase 3-5B 그대로. 모든 이벤트는 KCAnalytics 단일 게이트웨이 통과.

---

## 11. 본 PR 범위 (Phase 4 Planning)

**문서만.**

- `docs/PRODUCT_ROADMAP_APP_EXPANSION.md` (본 파일)
- `docs/POLICY_BENEFIT_HUB_PLAN.md` (Phase 4B 상세)
- `docs/PWA_PLAY_STORE_PLAN.md` (Phase 5A/5B/5C 상세)

**코드 변경 0. 광고/AdSense/ads.txt/ca-pub/계산 로직 무변경.**

---

## 12. D+7 이후 첫 실행 결정 흐름

```
2026-05-23 (D+7)
  → GUIDE_DISTRIBUTION_PLAN.md Week 1 표 기입
  → ANALYTICS_EVENT_PLAN.md §5 KPI 1차 측정
  → 본 문서 §9 우선순위 결정 룰 적용
  → Phase 4A/4B/4C 중 첫 구현 PR 시작
```

다음 단계 PR 후보:
- `feat(phase 4a): situation panel + persona detection (skeleton)`
- `feat(phase 4b): benefit hub p0 5개 페이지 발행`
- `feat(phase 4c): season card on home (5월 트리거)`

선택은 GA4 데이터가 결정한다. 추측으로 먼저 만들지 않음.
