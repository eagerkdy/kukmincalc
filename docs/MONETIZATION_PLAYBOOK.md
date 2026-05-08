# Monetization Playbook — Kukmincalc

> AdSense / sponsor / affiliate / official-link / internal — 5가지 카테고리 분리.  
> Ogilvy (전환 카피) + Buffett/Munger (장기 평판) + Sejong (공식 vs 광고 구분).

---

## 0. 카테고리 정의

| type | 라벨 | 위치 | 예시 |
|---|---|---|---|
| **AdSense** | (자동) | Auto Ads + 슬롯 컨테이너 | Google AdSense 자동 광고 |
| **sponsor** | "스폰서" | 캠페인 팝업 / 슬롯 | 직접 협찬 (현재 enabled: false) |
| **affiliate** | "광고" | 캠페인 팝업 / 슬롯 | 신용점수, 자동차보험 비교, 세무신고 서비스 (현재 enabled: false) |
| **official-link** | "공식 사이트" | 캠페인 팝업 / 카드 / fallback | 정부24, 홈택스, 위택스, 국민연금공단 |
| **internal** | (라벨 없음) | 카드 / 추천 영역 | 관련 계산기, 시즌 카드 |

**핵심: official-link 는 광고가 아니다.** 공식 사이트 바로가기는 사용자 신뢰 + 다음 행동을 위한 안내. 절대 광고로 표시하지 않음.

---

## 1. AdSense

### 정책
- **변경 금지**: `ads.txt`, `ca-pub-6481387413747515`, AdSense Auto Ads 주입 코드.
- 슬롯 컨테이너만 추가 가능 (`<div class="ad-slot" data-slot-key="...">`).
- 슬롯이 비어 있으면 `KCAdManager` 가 자동으로 fallback 카드 (공식 사이트 바로가기) 노출.
- placeholder 텍스트("광고 영역") 노출 금지.

### 위치
- 결과 아래 1개 (`calculator-result-bottom`)
- 본문 하단 1개 (`calculator-bottom`)
- 가이드 페이지 H2 #2 / #4 후 자동 삽입 hook (`guide-h2-auto`)
- 홈 중간 1개 (`home-middle`) — 선택
- 데스크톱 사이드바 1개 (`desktop-sidebar`) — 모바일에서는 숨김

### 금지 위치
- 입력폼 위
- 계산 버튼 주변
- 결과 카드 내부
- 모바일 sticky / 스크롤 점거형

---

## 2. Sponsor

### 정의
브랜드가 직접 비용을 지불해 노출되는 단발성 캠페인.

### 라벨
**"스폰서"** (필수, 우상단 또는 카드 헤더).

### 데이터 구조 (`assets/js/ads/campaigns.js`)
```js
{
  id: '<sponsor-id>',
  type: 'sponsor',
  label: '스폰서',
  title: '...',
  description: '...',
  imageUrl: '...',
  ctaText: '...',
  ctaUrl: 'https://...',
  targetCategories: ['salary'],
  trigger: 'after_result',
  frequency: 'daily',
  startAt: '2026-XX-XX',
  endAt: '2026-XX-XX',
  enabled: false   // 실제 운영 시 true 로 전환
}
```

### 운영 원칙
- 광고주 계약서가 있을 때만 활성화.
- 캠페인 기간(`startAt`, `endAt`) 종료 시 자동 비활성화.
- 사용자 화면에 "스폰서" 라벨 명확히 표시.
- AdSense 정책과 충돌하지 않게 같은 페이지에서 동시 노출 시 거리 확보.

---

## 3. Affiliate

### 정의
제휴 프로그램으로, 사용자가 클릭/가입/구매 시 수익 발생.

### 카테고리별 후보 (Ogilvy: 맥락 광고)

| adCategory | 제휴 후보 |
|---|---|
| salary | 신용점수 조회, 급여통장, 대출 비교, 적금 비교, 재테크 앱 |
| tax | 세무 신고 서비스, 세무사 상담, 전자계약, 종합소득세 신고 도움 |
| labor | 노무 상담, 급여관리 SaaS |
| realEstate | 대출 비교, 부동산 앱, 이사 견적, 청약 도움 |
| car | 자동차 보험 비교, 중고차, 렌트/리스 |

### 라벨
**"광고"** (필수). 한국 광고법 + 공정거래위원회 권고 사항 준수.

### 링크 속성
```html
<a rel="sponsored noopener noreferrer" target="_blank"
   data-campaign-id="..." data-page-type="..." data-calculator-type="..."
   href="https://...?utm_source=kukmincalc&utm_medium=affiliate&utm_campaign=...">
  ...
</a>
```

### 금지
- "정부 지원" / "정부 인증" / "공식" 표현 (오해 유발)
- 과장 환급률, 보장 표현
- 사용자가 광고임을 인지하기 어려운 위장

---

## 4. Official-link (광고 아님)

### 정의
공식 기관 사이트로의 안내 링크. 사용자 신뢰 + 다음 행동을 위한 도구.

### 등록 사이트 (`assets/js/ads/ad-slots.js → KC_OFFICIAL_LINKS`)

| 키 | 사이트 | 카테고리 |
|---|---|---|
| nps | 국민연금공단 | salary |
| nhis | 국민건강보험 | salary |
| moel | 고용보험 | salary |
| kcomwel | 근로복지공단 | labor |
| fourins | 4대사회보험 정보연계센터 | salary |
| hometax | 홈택스 | tax |
| nts | 국세청 | tax |
| wetax | 위택스 | tax |
| gov24 | 정부24 | tax |
| car365 | 자동차365 | car |
| cheongyak | 청약홈 | realEstate |
| realprice | 부동산 공시가격 알리미 | realEstate |
| employ24 | 고용24 | labor |

### 라벨
**"공식 사이트"** (필수). "광고" / "스폰서" / "제휴" 라벨 절대 사용 금지.

### 표현 (Sejong)
✅ 허용: "공식 사이트 바로가기", "공식 기관에서 확인하기", "실제 신청·조회는 공식기관에서 확인하세요"  
❌ 금지: "정부 제휴", "공식 파트너", "정부24 광고", "홈택스 제휴", "정부 공식 앱"

### 위치
- 계산 결과 직후 팝업 (`KCPopupManager.showForResult()`)
- AdSense fallback 카드 (광고 미로드 시)
- 푸터 카드
- 홈 `.official-section`

---

## 5. Internal (광고 아님)

### 정의
내부 페이지 추천. 관련 계산기 / 시즌 카드 / 가이드 시리즈.

### 위치
- 결과 카드 직후 `relatedCalculators` 그리드
- 푸터 인기 계산기
- 홈 `.season-section`
- 홈 `.situation-section` (상황별 입구)

### 라벨
없음. 일반 카드 디자인.

---

## 6. 우선순위 룰

같은 페이지에 여러 노출이 가능할 때:

1. **official-link** 우선 (사용자 신뢰)
2. **internal (관련 계산기)** 다음 (체류 / 재유입)
3. **sponsor** (있으면)
4. **affiliate** (맥락 일치 시)
5. **AdSense Auto Ads** (자동 슬롯)

`KCCampaigns.pickForCategory()` 의 정렬 기준이 이를 반영함.

---

## 7. 안티프래질 (Taleb)

| 정책 변경 | 영향 |
|---|---|
| 국민연금 기준소득월액 변경 | 시즌 카드 갱신 + 가이드 페이지 lastVerifiedAt + 광고 캠페인 타깃 키워드 갱신 |
| 신규 광고주 등장 | 카테고리에 sponsor / affiliate 캠페인 추가 (`enabled: true`) |
| AdSense 정책 변경 | 슬롯 위치 재배치 (`assets/js/ads/ad-slots.js`) |
| 광고차단기 비율 증가 | fallback 카드 (공식 사이트) 강화 |

모든 변경은 `docs/CHANGELOG-2026-RATES.md` + `docs/MONETIZATION_PLAYBOOK.md` 갱신 후 commit.

---

## 8. 측정 (Andy Grove)

| 이벤트 | 의미 |
|---|---|
| `ad_fallback_shown` | AdSense 미로드 → fallback 카드 노출 |
| `popup_shown` | 캠페인 노출 (sponsor/affiliate/official-link) |
| `popup_cta_clicked` | 캠페인 CTA 클릭 |
| `official_link_clicked` | 공식 사이트 카드 클릭 |
| `adblock_detected` | 광고차단 감지 |
| `adblock_notice_closed` | 안내 모달 닫음 |

KPI 후보:
- AdSense 노출 / 클릭 / RPM
- official-link CTR (신뢰도 시그널)
- affiliate 전환율 (구매·가입 등 외부 트래커 연동 후)
- adblock 비율 (운영 체크용)

---

## 9. Phase 3-1 적용 범위

이번 Phase 에서는 **정의 + 홈/푸터/카드 표현만** 정리. 실제 sponsor/affiliate 캠페인 활성화는 광고주가 등장한 다음 Phase.

Phase 3-1에서 가동:
- 홈 `.official-section` (8개 카드)
- 카테고리별 official-link 캠페인 5종 (Phase 2 에서 생성된 것)
- AdSense 슬롯 컨테이너 + fallback (Phase 2 에서 생성된 것)
- "공식 사이트 바로가기" / "광고" / "스폰서" 라벨 일관 적용
