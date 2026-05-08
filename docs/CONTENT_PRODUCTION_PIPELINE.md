# Content Production Pipeline — Kukmincalc

> 키워드 → 제목 → 목차 → 계산 예시 → 공식 출처 → 계산기 CTA → 외부유입.  
> Ford/Toyota Brain (표준 공정) + Buffett/Munger (출처 검증) + Ogilvy (전환 카피).

---

## 0. 문서 목적

가이드/블로그/아티클 콘텐츠를 **표준 공정**으로 찍어내기 위한 체크리스트.  
콘텐츠 1개 발행 = 12단계를 모두 통과한 결과물.

---

## 1. 표준 12단계

### 단계 1. 키워드 선정
- 출처: `docs/SEO_CONTENT_PLAN.md` 의 P0 → P1 → P2 순.
- 1편 = 1 검색 의도. 여러 의도 합치지 말 것.

### 단계 2. 제목 (H1 / SEO title)
- H1: 검색어 포함 + 결론형. 60자 이하.
- SEO title: H1 + ` | 국민계산기`.
- ❌ 금지: "최고", "100%", "완벽", "비밀", "무조건", "정부 제휴", "공식 파트너".

### 단계 3. 요약 답변 (introSummary)
- 1~2 문장. 검색 의도에 즉시 답.
- 숫자가 있는 결론형 권장.
- 예: "연봉 3,000만원의 2026년 월 실수령액은 약 X원입니다."

### 단계 4. 1분 계산 예시
- 실제 숫자 1개. 사용자가 머릿속으로 따라할 수 있는 값.
- 표보다 단순 산식 우선.
- 예: `100,000원 × 30 × (1095 ÷ 365) = 9,000,000원`.

### 단계 5. 계산기 CTA (3회 이상)
- 첫 1회: 본문 상단 (요약 답변 직후).
- 두 번째: 본문 중반 (공식 기준 직후).
- 세 번째: 본문 하단 (FAQ 위).
- 버튼 문구는 행동형: "내 실수령액 확인하기" / "내 주휴수당 계산" / "내 사업소득 3.3% 확인".

### 단계 6. 공식 기준 (KR_RATES_2026)
- 보험요율 / 한도 / 한정 조건은 `assets/js/constants/rates-kr-2026.js` 의 값과 동일해야 함.
- `verificationStatus`, `lastVerifiedAt`, `officialSource` 표시 필수.
- ❌ 블로그/세무사 글 / 민간 계산기 인용 금지.

### 단계 7. 왜 이 금액이 나왔나요?
- 공공 용어 → 생활 언어 번역 (Sejong).
- 예: "기준소득월액 상한" → "보험료 계산에 쓰이는 월소득의 천장".
- 한 문장당 한 개념.

### 단계 8. FAQ (4~5개)
- JSON-LD `FAQPage` 적용 (실제 화면에 보이는 질문만).
- 답변은 50~100자.
- 최소 1개는 정책 변경 가능성 언급 (다윈).

### 단계 9. 관련 계산기 카드 (4개 이상)
- `relatedCalculators` 배열 기준.
- 카테고리 일관성 유지.
- 데이터 속성: `data-related-from`, `data-related-to` (event-tracker 추적용).

### 단계 10. 공식 사이트 바로가기
- `officialLinks` 키 사용 (`KC_OFFICIAL_LINKS`).
- "공식 사이트" 라벨, sponsor/affiliate 와 분리.
- ❌ "정부 제휴", "공식 파트너", "정부24 광고" 표현 금지.

### 단계 11. 광고/제휴 영역
- 위치: 결과 아래 1개 + 본문 하단 1개 (가이드 페이지는 H2 #2/#4 후 자동 삽입 hook 가능).
- ❌ 계산 버튼 주변 금지, 결과 카드 내부 금지, 입력폼 위 최소화.
- sponsor/affiliate 는 "광고" 라벨, official-link 는 "공식 사이트" 라벨.

### 단계 12. 검수 체크리스트
- [ ] H1 + 검색어 매칭 정확
- [ ] 요약 답변 1~2 문장
- [ ] 1분 계산 예시 1개 (숫자)
- [ ] 계산기 CTA 3회 이상
- [ ] 공식 출처 인용 + lastVerifiedAt
- [ ] 생활 언어 번역 통과
- [ ] FAQ JSON-LD 등록
- [ ] 관련 계산기 4개
- [ ] 공식 사이트 바로가기 카드
- [ ] 광고 위치 규칙 준수
- [ ] verificationStatus 배지 (verified/needs_official_source/dynamic/estimated)
- [ ] grep: 35종/35가지/35개/정부 제휴/공식 파트너 → 0건

---

## 2. 콘텐츠 패턴 (가이드 페이지)

```
<h1>{H1: 결론형 검색어 매칭}</h1>

<p class="intro">{1~2문장 요약 답변, 숫자 포함}</p>

<div class="cta-box">
  <a class="cta-primary" href="{calculator_url}">{행동형 CTA #1}</a>
</div>

<h2>1분 계산 예시</h2>
<div class="example-box">
  {산식 + 결과 1개}
</div>

<h2>계산 공식</h2>
<p>{공식 자체}</p>
<p class="official">출처: {officialSource.name} ({lastVerifiedAt})</p>

<!-- 광고/공식 링크 자동 삽입 hook (in-content-ad-inserter.js) -->

<h2>왜 이 금액이 나왔나요?</h2>
<p>{Sejong 번역}</p>

<div class="cta-box">
  <a class="cta-primary" href="{calculator_url}">{행동형 CTA #2}</a>
</div>

<h2>적용 기준 ({rateVersion})</h2>
{KR_RATES_2026 의 항목별 표}

<!-- 광고/공식 링크 자동 삽입 hook -->

<h2>자주 묻는 질문</h2>
<details>...</details>
{JSON-LD FAQPage}

<h2>관련 계산기</h2>
<div class="related-grid">{4개 카드}</div>

<h2>공식 사이트 바로가기</h2>
<div class="official-grid">{4~6개 카드}</div>

<div class="cta-box">
  <a class="cta-primary" href="{calculator_url}">{행동형 CTA #3}</a>
</div>
```

---

## 3. Frontmatter (가이드 페이지에 부착)

각 가이드 페이지에 다음 메타를 주석으로 박아두면 후속 자동화에 유리.

```yaml
---
id: salary-3000-take-home
targetKeyword: "연봉 3000 실수령액"
searchIntent: informational
pageType: guide
targetCalculator: take-home-pay
adCategory: salary
officialLinkCategory: salary
priority: P0
verificationStatus: verified
lastVerifiedAt: 2026-05-05
relatedCalculators:
  - take-home-pay
  - paystub
  - social-insurance
  - severance-pay
phase: 3-2
---
```

---

## 4. 발행 후 외부유입 트리거

발행과 동시에 `EXTERNAL_TRAFFIC_PLAYBOOK.md` 의 외부유입 루틴 1회 실행.  
발행 → 외부유입 → 1주 모니터링 (CTR / 체류시간 / 다음 행동).

---

## 5. 정책 변경 발생 시 (Darwin / Taleb)

기준값이 바뀌면:
1. `assets/js/constants/rates-kr-2026.js` 갱신.
2. `docs/CHANGELOG-2026-RATES.md` 추가.
3. 관련 가이드 페이지의 `lastVerifiedAt` 갱신.
4. 가이드 페이지 상단에 "2026.07 국민연금 상한 변경 반영" 배지.
5. 시즌 카드(`index.html`의 `.season-section`)도 함께 업데이트.
6. sitemap.xml `lastmod` 갱신.

이 절차가 **유입 기회**다 (안티프래질).

---

## 6. Phase 3-1 적용 범위

본 파이프라인 문서 자체는 Phase 3-1에서 정의만 한다. 실제 가이드 페이지 발행은 3-2 이후.  
Phase 3-1에서 즉시 적용한 항목:
- 홈 페이지의 결과 화면 표준 (Jobs Brain) 반영
- 상황별 입구 / 시즌 카드 / 공식 사이트 바로가기 → 위 패턴의 축소판
- `KC_SCHEMA` 등록 / `KC_PAGE_CATEGORY` 매핑 → Phase 2 에서 이미 시작
