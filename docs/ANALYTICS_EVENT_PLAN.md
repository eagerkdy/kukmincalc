# Analytics Event Plan — Kukmincalc

> Phase 3-5A: **이벤트 사전 정의만**. GA4 연결/스니펫 주입은 Phase 3-5B 별도 PR.
> 본 문서는 "어떤 이벤트를 어디서, 어떤 파라미터로 보낼지"의 합의서.

---

## 0. 원칙

- **이벤트 이름은 snake_case** (GA4 권장 + 보존 호환)
- **PII 금지** — 사용자 입력값(연봉/소득 등)은 **버킷화**해서 보낸다 (3000–3500 같은 구간), 원숫자 직접 전송 금지
- **PII 가드:** email/phone/이름 절대 전송 금지
- **광고 ID 변경 금지** — `ca-pub-6481387413747515` 유지
- **공통 파라미터**(page_path, page_type, page_calc_id)는 자동 첨부

---

## 1. 측정 도구 계층

| 계층 | 도구 | 책임 |
|---|---|---|
| 1차 (검색) | Google Search Console | 노출/클릭/CTR/평균위치 |
| 1차 (검색, KR) | 네이버 서치어드바이저 | 노출/클릭 |
| 2차 (행동) | GA4 (Phase 3-5B) | 페이지뷰, 이벤트, 체류 |
| 3차 (수익) | AdSense 콘솔 | RPM, CTR, 페이지 RPM |
| 4차 (조합) | Looker Studio (선택, 3-5C) | GA4 + Search Console + AdSense 통합 대시 |

---

## 2. 공통 페이지 파라미터 (모든 이벤트에 자동 첨부 — Phase 3-5B에서 wrapper 구현)

| param | type | 예시 | 비고 |
|---|---|---|---|
| `page_path` | string | `/guides/salary-4000-take-home.html` | window.location.pathname |
| `page_type` | string | `guide` / `calculator` / `home` / `legal` / `docs` | `<article data-page-type>` 또는 path 추론 |
| `page_calc_id` | string | `take-home-pay` | 가이드 → 연결된 계산기 ID. 없으면 빈 문자열 |
| `app_version` | string | `KR-2026-05` | `KR_RATES_2026.version` 미러 |

---

## 3. 이벤트 카탈로그

### 3-1. SEO 유입 (Search Console에서 수집, GA4 미수집)
- (자동) Impressions / Clicks / CTR / Average Position

### 3-2. 페이지 단위

| event | 발생 위치 | 핵심 파라미터 |
|---|---|---|
| `page_view` | 모든 페이지 (GA4 기본) | (자동) |
| `engaged_session` | GA4 기본 (10s+ 또는 전환 또는 2 PV) | (자동) |
| `scroll_depth` | guide 페이지 50% / 90% 도달 | `depth: 50`/`90` |

### 3-3. 가이드 페이지 행동

| event | 트리거 | 파라미터 |
|---|---|---|
| `guide_cta_click` | 가이드 페이지 `.guide-cta` 클릭 | `cta_position`: top/middle/bottom, `cta_target_calc`: take-home-pay 등 |
| `guide_related_click` | `.guide-related .guide-card` 클릭 | `target_calc`: 계산기 ID |
| `guide_official_click` | `.guide-official .guide-card` 클릭 | `official_target`: nps/hometax/wetax/moel 등 도메인 |
| `guide_faq_open` | `<details>` open | `faq_index`: 0~N |

### 3-4. 계산기 페이지 행동

| event | 트리거 | 파라미터 |
|---|---|---|
| `calc_compute` | 계산 결과가 화면에 표시된 시점 (bindCalculation 결과) | `calc_id`, `result_bucket`(아래 §4 참고) |
| `calc_input_change` | 입력값 변경 (debounce 1s) | `field_name`(연봉/근속/시급 등) |
| `calc_copy_result` | 복사 버튼 클릭 | `calc_id` |
| `calc_share_url` | 공유 URL 복사 (Phase 3-3C 도입 후) | `calc_id` |
| `calc_recent_save` | localStorage 저장 성공 | `calc_id` |
| `calc_action_card_click` | 다음 행동 카드 클릭 | `action_target`, `action_type`(internal/official) |

### 3-5. 홈 (`index.html`)

| event | 트리거 | 파라미터 |
|---|---|---|
| `home_hero_cta_click` | 히어로 영역 3 CTA 클릭 | `cta_label`: take-home/social-insurance/freelancer |
| `home_category_click` | 카테고리 카드 클릭 | `category`: labor/tax/loan/insurance/lifestyle |
| `home_situation_click` | 상황별 입구 클릭 | `situation`: 신입/이직/프리/사업 등 |
| `home_season_click` | 시즌 섹션 클릭 | `season_label` |
| `home_official_click` | 공식 사이트 8개 카드 클릭 | `official_target` |
| `home_recent_click` | "내 최근 계산" 항목 클릭 | `calc_id`, `rank`(1~5) |

### 3-6. 광고 (AdSense 콘솔에서 수집, GA4 미수집)
- AdSense 자체 클릭/RPM은 AdSense 콘솔에서 봄.
- AdBlock 검지(`KCAdblockDetector`) 결과는 (선택) `ad_blocked_detected` 1회 이벤트로 GA4 전송 가능 — 단, 사용자 거부감 고려하여 Phase 3-5B에서 별도 결정.

---

## 4. 입력값 버킷화 규칙 (PII 가드)

GA4에 보낼 때 **원숫자 금지**, 다음 표 기준으로 버킷 문자열만 전송.

| 입력 | 버킷 라벨 |
|---|---|
| 연봉 (KRW) | `0-2000` / `2000-3000` / `3000-4000` / `4000-5000` / `5000-6000` / `6000-8000` / `8000-10000` / `10000+` (만원) |
| 월급 (KRW) | `0-200` / `200-300` / `300-400` / `400-500` / `500-700` / `700-1000` / `1000+` (만원) |
| 시급 | `min` (10320) / `min-12000` / `12000-15000` / `15000+` |
| 근속연수 | `1-2` / `3-5` / `5-10` / `10+` |
| 지급액 (프리랜서) | `<100` / `100-300` / `300-500` / `500+` (만원) |

**원숫자 금지 항목:** 이름·이메일·전화·주민번호·계좌·차량번호·주소 — 입력 폼에도 없어야 함. (현재 모든 계산기 미수집 — 유지)

---

## 5. 핵심 KPI

| KPI | 정의 | 목표 (3개월) |
|---|---|---|
| **가이드 → 계산기 전환율** | `guide_cta_click` / `page_view (guide)` | 25%+ |
| **계산기 도달률** | 가이드 진입 사용자 중 `calc_compute` 발생 비율 | 60%+ |
| **계산 완료 → 다음 행동** | `calc_compute` 후 `calc_action_card_click` 또는 `calc_share_url` 비율 | 15%+ |
| **재방문률** | GA4 returning users / total | 20%+ |
| **검색 CTR (P0 7개 가이드)** | Search Console 평균 | 3%+ |

---

## 6. Phase 3-5B 구현 범위 (별도 PR 예고)

이번 PR에서는 **문서만**. 다음 PR(`Phase 3-5B`)에서 구현:

1. `assets/js/analytics.js` — `KCAnalytics.track(event, payload)` wrapper. 공통 파라미터 자동 첨부. GA4 미연결 시 콘솔 로그만 (`window.dataLayer` 푸시).
2. `index.html` `<head>`에 GA4 gtag 스니펫 1회 삽입 (측정 ID는 환경별 설정).
3. `common.js` 헤더 인젝션 시 `<script>` defer 로드.
4. 기존 `KukmincalcEvents.track` (Phase 3-2A 도입분)이 있으면 그것을 기반으로 확장 (재발명 금지).
5. PII 가드 함수 `bucketize(value, table)` 헬퍼.

**금지 (Phase 3-5B에도 동일):**
- AdSense 코드 변경 금지
- ads.txt 변경 금지
- ca-pub-6481387413747515 변경 금지
- 계산 로직 변경 금지

---

## 7. 동의 / 개인정보 처리방침 (Phase 3-5B에서 함께 갱신)

GA4 도입 시 다음 항목 검토:
- `legal/privacy` 페이지에 "Google Analytics 4 사용 + IP 익명화 + GA4 광고 신호 미사용" 명시
- 한국 사용자 대상이므로 명시적 쿠키 동의 배너는 **GA4만 사용 + AdSense Auto Ads** 조합에서는 의무 아님 (개인정보보호위원회 가이드 기준), 단 공정거래 표준 안내문은 유지
- 광고 개인화 / 쿠키 동의는 AdSense Auto Ads 기본 정책에 위임 (지금 그대로)

---

## 8. 측정 캘린더

| 일자 | 작업 |
|---|---|
| D+0 (2026-05-09 발행) | sitemap 제출, P0 7개 색인 요청 |
| D+1 ~ D+3 | 네이버/Bing 등록, P1 5개 색인 요청 |
| D+7 (2026-05-16) | Week 1 측정. `GUIDE_DISTRIBUTION_PLAN.md` Week 1 표 갱신 |
| D+14 | Week 2 측정 + Phase 3-4B 후보 1차 선정 |
| D+30 | 1개월 회고. AdSense RPM 안정성 확인. Phase 3-5B 착수 결정 |
| D+90 | 3개월 KPI 평가. 핵심 KPI §5 기준 통과/미통과 판정 |
