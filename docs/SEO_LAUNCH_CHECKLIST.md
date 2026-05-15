# SEO Launch Checklist — Kukmincalc

> Phase 3-4 가이드 12개 발행 직후 1회성 등록·제출 체크리스트.
> 운영자가 위에서 아래로 한 번씩 실행하고 끝낸다.
> 코드 변경 없음. 외부 콘솔/대시보드 작업만.

---

## 0. 전제

- **사이트:** `https://kukmincalc.com`
- **sitemap:** `https://kukmincalc.com/sitemap.xml` (총 58 URL, guides 12 포함)
- **소유 인증:** `index.html` `<head>` 내 `google-site-verification` / `naver-site-verification` 메타 태그 또는 DNS TXT
- **금지:** AdSense / ads.txt / ca-pub / 계산 로직 변경 금지

---

## 1. Google Search Console (P0)

### 1-1. 자산 등록
- [ ] https://search.google.com/search-console 접속
- [ ] **속성 추가** → "URL 접두어" → `https://kukmincalc.com/` 입력
- [ ] 소유 인증
  - 권장: HTML 태그 (meta) → `index.html` `<head>`에 1줄 추가 (별도 PR)
  - 대안: DNS TXT (Vercel DNS 또는 도메인 등록기관 콘솔)

### 1-2. 사이트맵 제출
- [ ] 사이드바 → **사이트맵** → `sitemap.xml` 입력 → 제출
- [ ] 상태 "성공" 확인 (24~72h 내 색인 시작)

### 1-3. 색인 요청 우선순위 (URL 검사)
P0 (연봉/4대보험/주휴수당 — 검색량 大):
- [ ] `/guides/salary-3000-take-home.html`
- [ ] `/guides/salary-4000-take-home.html`
- [ ] `/guides/salary-5000-take-home.html`
- [ ] `/guides/monthly-300-social-insurance.html`
- [ ] `/guides/social-insurance-rate-2026.html`
- [ ] `/guides/weekly-holiday-pay-20-hours.html`
- [ ] `/guides/min-wage-monthly-2026.html`

P1 (프리랜서/퇴직/식대/국민연금 — 검색량 中):
- [ ] `/guides/freelancer-tax-100.html`
- [ ] `/guides/other-income-tax-8-8.html`
- [ ] `/guides/severance-pay-300-3years.html`
- [ ] `/guides/non-taxable-meal-200k.html`
- [ ] `/guides/national-pension-2026.html`

각 URL에서 **URL 검사 → "색인 생성 요청"** 클릭. 하루 10건 한도 주의.

### 1-4. 리치 결과 검증
- [ ] https://search.google.com/test/rich-results 에서 가이드 1개 URL 입력 → BreadcrumbList + FAQPage 검출 확인
- [ ] FAQPage `mainEntity` 수와 화면 FAQ 수 일치 확인

---

## 2. 네이버 서치어드바이저 (P0)

### 2-1. 사이트 등록
- [ ] https://searchadvisor.naver.com 접속
- [ ] **웹마스터 도구 → 사이트 등록** → `https://kukmincalc.com/` 입력
- [ ] 소유 인증 (HTML 태그 또는 HTML 파일 업로드)
  - HTML 태그 추가는 별도 PR로 진행 (`index.html` `<head>`)

### 2-2. 사이트맵 제출
- [ ] **요청 → 사이트맵 제출** → `sitemap.xml` 입력
- [ ] **요청 → RSS 제출** (해당 없음 — RSS 미운영, 스킵)

### 2-3. 수집 요청
- [ ] **요청 → 웹페이지 수집** → P0 7개 URL 우선 등록
- [ ] 잔여 5개는 P1로 다음 날 분산 등록

---

## 3. Bing Webmaster Tools (P2)

### 3-1. 사이트 등록
- [ ] https://www.bing.com/webmasters 접속
- [ ] **Add site** → `https://kukmincalc.com/`
- [ ] Google Search Console 연동 (가장 빠른 인증 경로)

### 3-2. 사이트맵 제출
- [ ] **Sitemaps** → `https://kukmincalc.com/sitemap.xml` 제출

---

## 4. Analytics 연결 (P1 — 별도 PR)

본 Phase 3-5A는 **연결 코드 변경 없음**. 본 체크리스트는 다음 PR(`Phase 3-5B`)에서 적용할 항목만 정리:

- [ ] GA4 측정 ID 발급 (`G-XXXXXXXXXX`)
- [ ] `assets/js/common.js`에 GA4 스니펫 + 환경변수 (Phase 3-5B에서 별도 PR로)
- [ ] AdSense ↔ GA4 연결 (애드센스 콘솔)
- [ ] Search Console ↔ GA4 연동 (속성 연결)
- [ ] 추적 이벤트 정의는 `docs/ANALYTICS_EVENT_PLAN.md` 참조

---

## 5. 콘텐츠 측정 한정 (코드 변경 없이 가능)

- [ ] Search Console **검색 실적** 보고서 → 7일 후 가이드 12개 노출/CTR 확인
- [ ] Search Console **색인 → 페이지** → 색인된 페이지 수 = 12 확인
- [ ] 네이버 서치어드바이저 **검색 통계** → 7일 후 노출/클릭 확인

---

## 6. 1주 후 첫 측정 일자

발행일: **2026-05-09**
첫 측정 D+7: **2026-05-16** (이후 매주 토요일 정기 점검)

측정 결과는 `docs/GUIDE_DISTRIBUTION_PLAN.md` 의 주차별 표에 기록.

---

## 7. 완료 정의 (Phase 3-5A 종료 조건)

- [ ] Search Console 자산 등록 + sitemap 제출 + P0 7개 색인 요청 완료
- [ ] 네이버 서치어드바이저 사이트 등록 + sitemap 제출 + P0 7개 수집 요청 완료
- [ ] Bing Webmaster 사이트 등록 + sitemap 제출 완료
- [ ] 본 체크리스트 모든 P0 항목 ✅
- [ ] 7일 후 측정 일정 캘린더 등록

코드 변경 없이 외부 콘솔 작업만으로 끝낸다.
