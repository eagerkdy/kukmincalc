/* ===== sources-2026.js — 2026 공식 출처 (officialSource) 사전 ===== */
/* 모든 요율/한도/정책값은 이 파일의 출처를 우선 인용한다. */
/* 민간 블로그·세무사 글·계산기 사이트는 절대 officialSource 로 사용 금지 → referenceSource[] 만 사용. */

(function (global) {
  'use strict';

  var KR_OFFICIAL_SOURCES = {
    mohw: {
      name: '보건복지부',
      baseUrl: 'https://www.mohw.go.kr',
      retrievedAt: '2026-05-05',
      note: '국민연금/건강보험/장기요양 보험료율 고시 주체'
    },
    moel: {
      name: '고용노동부',
      baseUrl: 'https://www.moel.go.kr',
      retrievedAt: '2026-05-05',
      note: '최저임금/주휴수당/퇴직금/산재보험 고시 주체'
    },
    nts: {
      name: '국세청',
      baseUrl: 'https://www.nts.go.kr',
      retrievedAt: '2026-05-05',
      note: '간이세액표/원천징수/연말정산 기준 자료'
    },
    hometax: {
      name: '홈택스',
      baseUrl: 'https://www.hometax.go.kr',
      retrievedAt: '2026-05-05',
      note: '국세청 운영 전자세무서비스'
    },
    wetax: {
      name: '위택스',
      baseUrl: 'https://www.wetax.go.kr',
      retrievedAt: '2026-05-05',
      note: '지방세(자동차세/취득세/재산세) 기준 자료'
    },
    mois: {
      name: '행정안전부',
      baseUrl: 'https://www.mois.go.kr',
      retrievedAt: '2026-05-05',
      note: '지방세법 운영 주체'
    },
    bok: {
      name: '한국은행',
      baseUrl: 'https://www.bok.or.kr',
      retrievedAt: '2026-05-05',
      note: '기준금리 — 전월세 전환율 상한 산정에 사용'
    },
    fsc: {
      name: '금융위원회',
      baseUrl: 'https://www.fsc.go.kr',
      retrievedAt: '2026-05-05',
      note: 'DSR/LTV/DTI 정책 결정 주체'
    },
    fss: {
      name: '금융감독원',
      baseUrl: 'https://www.fss.or.kr',
      retrievedAt: '2026-05-05',
      note: 'DSR/스트레스DSR 시행 세칙'
    },
    hf: {
      name: '한국주택금융공사',
      baseUrl: 'https://www.hf.go.kr',
      retrievedAt: '2026-05-05',
      note: '정책대출/보금자리론/디딤돌 한도'
    },
    law: {
      name: '국가법령정보센터',
      baseUrl: 'https://law.go.kr',
      retrievedAt: '2026-05-05',
      note: '소득세법/지방세법/근로기준법 원문'
    },
    nps: {
      name: '국민연금공단',
      baseUrl: 'https://www.nps.or.kr',
      retrievedAt: '2026-05-05',
      note: '국민연금 referenceSource (officialSource 는 mohw 사용)'
    },
    nhis: {
      name: '국민건강보험공단',
      baseUrl: 'https://www.nhis.or.kr',
      retrievedAt: '2026-05-05',
      note: '건강보험 referenceSource (officialSource 는 mohw 사용)'
    },
    kcomwel: {
      name: '근로복지공단',
      baseUrl: 'https://www.kcomwel.or.kr',
      retrievedAt: '2026-05-05',
      note: '고용보험/산재보험 referenceSource (officialSource 는 moel 사용)'
    }
  };

  global.KR_OFFICIAL_SOURCES = KR_OFFICIAL_SOURCES;
})(typeof window !== 'undefined' ? window : globalThis);
