/* ===== rounding-kr.js — 원 단위 반올림/절사 규칙 ===== */
/* 각 보험·세목별 원 단위 처리 규칙. */
/* 공식 확인이 부족한 항목은 verificationStatus: needs_official_source 로 둔다. */

(function (global) {
  'use strict';

  var KR_ROUNDING_RULES = {
    pension_won_rule: {
      method: 'floor',
      unit: 10,
      verificationStatus: 'needs_official_source',
      note: '국민연금 보험료 원 단위 절사 — 공식자료 확인 후 단위(원/10원) 확정'
    },
    health_insurance_won_rule: {
      method: 'floor',
      unit: 10,
      verificationStatus: 'needs_official_source',
      note: '건강보험료 원 단위 절사'
    },
    long_term_care_won_rule: {
      method: 'floor',
      unit: 10,
      verificationStatus: 'needs_official_source',
      note: '장기요양보험료 원 단위 절사'
    },
    employment_insurance_rule: {
      method: 'floor',
      unit: 10,
      verificationStatus: 'needs_official_source',
      note: '고용보험료 원 단위 절사'
    },
    industrial_accident_insurance_rule: {
      method: 'floor',
      unit: 10,
      verificationStatus: 'needs_official_source',
      note: '산재보험료 원 단위 절사'
    },
    earned_income_tax_rule: {
      method: 'table',
      unit: 1,
      verificationStatus: 'verified_or_table_based',
      note: '근로소득 간이세액표 값 우선'
    },
    local_income_tax_rule: {
      method: 'floor',
      unit: 10,
      verificationStatus: 'needs_official_source',
      note: '지방소득세 = 소득세의 10% 계산 후 원 단위 처리'
    },
    freelancer_withholding_rule: {
      method: 'floor',
      unit: 1,
      verificationStatus: 'needs_official_source',
      note: '프리랜서/기타소득 원천징수 원 단위 절사'
    },
    severance_won_rule: {
      method: 'round',
      unit: 1,
      verificationStatus: 'verified',
      note: '퇴직금 원 단위 반올림 (현행 계산식 유지)'
    },
    wage_won_rule: {
      method: 'round',
      unit: 1,
      verificationStatus: 'verified',
      note: '시급/일급/주휴수당 원 단위 반올림'
    },
    none: {
      method: 'none',
      unit: 1,
      verificationStatus: 'verified',
      note: '반올림 없음 (정수 원본 그대로 사용)'
    }
  };

  global.KR_ROUNDING_RULES = KR_ROUNDING_RULES;
})(typeof window !== 'undefined' ? window : globalThis);
