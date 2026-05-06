/* ===== ads/ad-slots.js — 광고 슬롯 키 + 카테고리 정의 ===== */
/* 페이지별 광고 위치를 중앙 관리. 빈 placeholder 텍스트는 사용자 화면에 노출 금지. */

(function (global) {
  'use strict';

  var SLOT_KEYS = {
    CALCULATOR_RESULT_BOTTOM: 'calculator-result-bottom',
    CALCULATOR_BOTTOM: 'calculator-bottom',
    GUIDE_H2_AUTO: 'guide-h2-auto',
    GUIDE_BOTTOM: 'guide-bottom',
    HOME_MIDDLE: 'home-middle',
    DESKTOP_SIDEBAR: 'desktop-sidebar'
  };

  /* adCategory ↔ officialLinkCategory ↔ fallback 카테고리 통합 매핑.
   * official-link 는 광고 아님. sponsor/affiliate 는 "광고" 라벨 표시. */
  var CATEGORY_MAP = {
    salary: {
      officialLinks: ['nps', 'nhis', 'moel', 'hometax'],
      affiliateThemes: ['신용점수', '급여통장', '대출비교', '재테크 앱'],
      relatedCalculators: ['take-home-pay', 'pension', 'health-insurance', 'social-insurance', 'paystub', 'employer-cost']
    },
    tax: {
      officialLinks: ['hometax', 'nts', 'wetax', 'gov24'],
      affiliateThemes: ['세무신고', '세무사 상담', '전자계약'],
      relatedCalculators: ['income-tax', 'vat', 'capital-gains-tax', 'gift-tax', 'inheritance-tax', 'freelancer-tax']
    },
    realEstate: {
      officialLinks: ['wetax', 'gov24', 'cheongyak', 'realprice'],
      affiliateThemes: ['대출비교', '부동산 앱', '이사견적'],
      relatedCalculators: ['mortgage-limit', 'dsr', 'rent-to-deposit', 'property-tax', 'comprehensive-property-tax']
    },
    car: {
      officialLinks: ['wetax', 'gov24', 'car365'],
      affiliateThemes: ['자동차보험', '중고차', '렌트/리스'],
      relatedCalculators: ['car-cost']
    },
    labor: {
      officialLinks: ['gov24', 'employ24', 'moel', 'kcomwel'],
      affiliateThemes: ['노무상담', '급여관리 SaaS'],
      relatedCalculators: ['hourly-wage', 'overtime-pay', 'annual-leave-pay', 'severance-pay', 'unemployment', 'weekly-holiday-pay']
    }
  };

  /* officialLinks 사전 — 라벨/URL */
  var OFFICIAL_LINKS = {
    nps:        { name: '국민연금공단',     url: 'https://www.nps.or.kr',       category: 'salary' },
    nhis:       { name: '국민건강보험',     url: 'https://www.nhis.or.kr',      category: 'salary' },
    moel:       { name: '고용보험',         url: 'https://www.ei.go.kr',        category: 'salary' },
    kcomwel:    { name: '근로복지공단',     url: 'https://www.kcomwel.or.kr',   category: 'labor' },
    fourins:    { name: '4대사회보험 정보연계센터', url: 'https://www.4insure.or.kr', category: 'salary' },
    hometax:    { name: '홈택스',           url: 'https://www.hometax.go.kr',   category: 'tax' },
    nts:        { name: '국세청',           url: 'https://www.nts.go.kr',       category: 'tax' },
    wetax:      { name: '위택스',           url: 'https://www.wetax.go.kr',     category: 'tax' },
    gov24:      { name: '정부24',           url: 'https://www.gov.kr',          category: 'tax' },
    car365:     { name: '자동차365',        url: 'https://www.car365.go.kr',    category: 'car' },
    cheongyak:  { name: '청약홈',           url: 'https://www.applyhome.co.kr', category: 'realEstate' },
    realprice:  { name: '부동산 공시가격 알리미', url: 'https://www.realtyprice.kr', category: 'realEstate' },
    employ24:   { name: '고용24',           url: 'https://www.work24.go.kr',    category: 'labor' }
  };

  global.KC_AD_SLOTS = SLOT_KEYS;
  global.KC_AD_CATEGORY_MAP = CATEGORY_MAP;
  global.KC_OFFICIAL_LINKS = OFFICIAL_LINKS;
})(typeof window !== 'undefined' ? window : globalThis);
