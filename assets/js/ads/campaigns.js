/* ===== ads/campaigns.js — 캠페인 사전 ===== */
/* sponsor / affiliate / official-link / internal 4가지 타입.
 * 기본 enabled=false 로 두고 사용자가 광고주/제휴 추가 시 활성화. */

(function (global) {
  'use strict';

  var CAMPAIGNS = [
    /* ---------- 공식 사이트 바로가기 (official-link, 광고 아님) ---------- */
    {
      id: 'official-links-salary',
      type: 'official-link',
      label: '공식 사이트',
      title: '계산 결과를 공식 사이트에서 확인하세요',
      description: '4대보험·세금·근로 정보는 공식 기관에서 최종 확인하는 것이 정확합니다.',
      links: [
        { name: '국민연금공단', url: 'https://www.nps.or.kr' },
        { name: '국민건강보험', url: 'https://www.nhis.or.kr' },
        { name: '고용보험', url: 'https://www.ei.go.kr' },
        { name: '4대사회보험 정보연계센터', url: 'https://www.4insure.or.kr' },
        { name: '홈택스', url: 'https://www.hometax.go.kr' }
      ],
      targetCategories: ['salary'],
      trigger: 'after_result',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'official-links-tax',
      type: 'official-link',
      label: '공식 사이트',
      title: '계산 결과를 공식 사이트에서 확인하세요',
      description: '세금 신고·조회는 공식 기관에서 최종 확인하세요.',
      links: [
        { name: '정부24', url: 'https://www.gov.kr' },
        { name: '홈택스', url: 'https://www.hometax.go.kr' },
        { name: '국세청', url: 'https://www.nts.go.kr' },
        { name: '위택스', url: 'https://www.wetax.go.kr' }
      ],
      targetCategories: ['tax'],
      trigger: 'after_result',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'official-links-labor',
      type: 'official-link',
      label: '공식 사이트',
      title: '근로 관련 공식 사이트',
      description: '실제 신청·증명서·상담은 공식 기관에서 확인하세요.',
      links: [
        { name: '정부24', url: 'https://www.gov.kr' },
        { name: '고용24', url: 'https://www.work24.go.kr' },
        { name: '고용보험', url: 'https://www.ei.go.kr' },
        { name: '근로복지공단', url: 'https://www.kcomwel.or.kr' }
      ],
      targetCategories: ['labor'],
      trigger: 'after_result',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'official-links-realestate',
      type: 'official-link',
      label: '공식 사이트',
      title: '부동산·주거 관련 공식 사이트',
      description: '시세·세금·청약은 공식 기관에서 최종 확인하세요.',
      links: [
        { name: '정부24', url: 'https://www.gov.kr' },
        { name: '위택스', url: 'https://www.wetax.go.kr' },
        { name: '청약홈', url: 'https://www.applyhome.co.kr' },
        { name: '부동산 공시가격 알리미', url: 'https://www.realtyprice.kr' }
      ],
      targetCategories: ['realEstate'],
      trigger: 'after_result',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'official-links-car',
      type: 'official-link',
      label: '공식 사이트',
      title: '자동차 관련 공식 사이트',
      description: '자동차세 납부·차량 조회는 공식 기관에서 확인하세요.',
      links: [
        { name: '정부24', url: 'https://www.gov.kr' },
        { name: '위택스', url: 'https://www.wetax.go.kr' },
        { name: '자동차365', url: 'https://www.car365.go.kr' }
      ],
      targetCategories: ['car'],
      trigger: 'after_result',
      frequency: 'weekly',
      enabled: true
    },

    /* ---------- 제휴/광고 (affiliate, 광고 라벨 표시) — 기본 enabled: false ---------- */
    {
      id: 'salary-loan-affiliate',
      type: 'affiliate',
      label: '광고',
      title: '내 연봉 기준 금융 혜택 확인',
      description: '실수령액을 확인했다면 내 조건에 맞는 금융 상품도 비교해보세요.',
      ctaText: '확인하기',
      ctaUrl: '#',
      targetCategories: ['salary'],
      trigger: 'after_result',
      frequency: 'daily',
      enabled: false
    },
    {
      id: 'freelancer-tax-service',
      type: 'affiliate',
      label: '광고',
      title: '프리랜서 세금 신고 도움받기',
      description: '3.3% 원천징수 이후 종합소득세 신고까지 확인해보세요.',
      ctaText: '알아보기',
      ctaUrl: '#',
      targetCategories: ['tax'],
      trigger: 'after_result',
      frequency: 'daily',
      enabled: false
    },
    {
      id: 'car-insurance-affiliate',
      type: 'affiliate',
      label: '광고',
      title: '자동차 보험료 비교',
      description: '자동차세와 함께 보험료도 확인해보세요.',
      ctaText: '비교하기',
      ctaUrl: '#',
      targetCategories: ['car'],
      trigger: 'after_result',
      frequency: 'daily',
      enabled: false
    }
  ];

  function frequencyKeyFor(campaignId) {
    return 'kukmincalc_campaign_' + campaignId;
  }

  function frequencyMs(frequency) {
    if (frequency === 'session') return 0;
    if (frequency === 'daily') return 24 * 60 * 60 * 1000;
    if (frequency === 'weekly') return 7 * 24 * 60 * 60 * 1000;
    return 24 * 60 * 60 * 1000;
  }

  function shouldShow(campaign) {
    if (!campaign || !campaign.enabled) return false;
    var now = Date.now();
    if (campaign.startAt && now < new Date(campaign.startAt).getTime()) return false;
    if (campaign.endAt && now > new Date(campaign.endAt).getTime()) return false;
    try {
      var key = frequencyKeyFor(campaign.id);
      var lastShown = parseInt(localStorage.getItem(key) || '0', 10);
      if (campaign.frequency === 'session') {
        var sessionKey = 'kc_session_' + campaign.id;
        if (sessionStorage.getItem(sessionKey)) return false;
        return true;
      }
      if (lastShown && now - lastShown < frequencyMs(campaign.frequency)) return false;
    } catch (e) {}
    return true;
  }

  function markShown(campaign) {
    try {
      if (campaign.frequency === 'session') {
        sessionStorage.setItem('kc_session_' + campaign.id, '1');
      } else {
        localStorage.setItem(frequencyKeyFor(campaign.id), String(Date.now()));
      }
    } catch (e) {}
  }

  function pickForCategory(category, trigger) {
    var matches = [];
    for (var i = 0; i < CAMPAIGNS.length; i++) {
      var c = CAMPAIGNS[i];
      if (!shouldShow(c)) continue;
      if (c.trigger && c.trigger !== trigger) continue;
      if (c.targetCategories && c.targetCategories.indexOf(category) < 0) continue;
      matches.push(c);
    }
    // official-link 우선, sponsor/affiliate 다음
    matches.sort(function (a, b) {
      var order = { 'official-link': 0, sponsor: 1, affiliate: 1, internal: 2 };
      return (order[a.type] || 9) - (order[b.type] || 9);
    });
    return matches[0] || null;
  }

  global.KC_CAMPAIGNS = CAMPAIGNS;
  global.KCCampaigns = {
    all: function () { return CAMPAIGNS.slice(); },
    pickForCategory: pickForCategory,
    shouldShow: shouldShow,
    markShown: markShown
  };
})(typeof window !== 'undefined' ? window : globalThis);
