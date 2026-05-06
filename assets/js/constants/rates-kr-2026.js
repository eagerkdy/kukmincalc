/* ===== rates-kr-2026.js — 2026년 확정 기준값 (KR_RATES_2026) ===== */
/* 원칙
 *   1. value 는 소수(0.095). display 는 별도 ("9.5%").
 *   2. officialSource 는 정부/공공기관/법령 출처만. 민간 자료는 referenceSource[].
 *   3. 모든 항목에 verificationStatus / lastVerifiedAt / nextReviewAt / calculatorScope / roundingRule / note.
 *   4. verificationStatus: "verified" | "needs_official_source" | "dynamic" | "estimated" | "deprecated"
 */

(function (global) {
  'use strict';

  var SRC = global.KR_OFFICIAL_SOURCES || {};
  var ref = function (key, title, urlPath) {
    var s = SRC[key] || {};
    return {
      name: s.name || key,
      title: title,
      url: (s.baseUrl || '') + (urlPath || ''),
      retrievedAt: s.retrievedAt || '2026-05-05'
    };
  };

  var KR_RATES_2026 = {
    /* ---------- 1. 국민연금 ---------- */
    pension: {
      totalRate: 0.095,
      employeeRate: 0.0475,
      employerRate: 0.0475,
      selfEmployedRate: 0.095,
      display: {
        totalRate: '9.5%',
        employeeRate: '4.75%',
        employerRate: '4.75%',
        selfEmployedRate: '9.5%'
      },
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      officialSource: [ref('mohw', '2026년 국민연금 보험료율 고시')],
      referenceSource: [ref('nps', '국민연금공단 보험료 안내')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-12-01',
      verificationStatus: 'verified',
      roundingRule: 'pension_won_rule',
      calculatorScope: ['pension', 'take-home-pay', 'social-insurance', 'employer-cost', 'paystub'],
      note: '2026년 국민연금 총 보험료율 9.5%, 사업장가입자는 근로자/사업주 각 4.75%. 2027년부터 매년 0.5%p 인상되어 2033년 13% 도달 예정.'
    },

    /* ---------- 2. 국민연금 단계 인상 스케줄 (2026~2033) ---------- */
    pensionRateSchedule: {
      schedule: [
        { year: 2026, totalRate: 0.095, display: '9.5%' },
        { year: 2027, totalRate: 0.100, display: '10.0%' },
        { year: 2028, totalRate: 0.105, display: '10.5%' },
        { year: 2029, totalRate: 0.110, display: '11.0%' },
        { year: 2030, totalRate: 0.115, display: '11.5%' },
        { year: 2031, totalRate: 0.120, display: '12.0%' },
        { year: 2032, totalRate: 0.125, display: '12.5%' },
        { year: 2033, totalRate: 0.130, display: '13.0%' }
      ],
      officialSource: [ref('mohw', '국민연금 보험료율 단계적 인상 일정')],
      referenceSource: [],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-12-01',
      verificationStatus: 'verified',
      calculatorScope: ['pension'],
      note: '2033년까지 0.5%p 단위 단계적 인상 일정.'
    },

    /* ---------- 3. 국민연금 기준소득월액 (1~6월 / 7~12월 분리) ---------- */
    pensionIncomeLimit: {
      janJun: {
        floor: 400000,
        ceiling: 6370000,
        effectiveFrom: '2026-01-01',
        effectiveTo: '2026-06-30',
        display: { floor: '400,000원', ceiling: '6,370,000원' },
        verificationStatus: 'verified'
      },
      julDec: {
        floor: 410000,
        ceiling: 6590000,
        effectiveFrom: '2026-07-01',
        effectiveTo: '2027-06-30',
        display: { floor: '410,000원', ceiling: '6,590,000원' },
        verificationStatus: 'verified'
      },
      officialSource: [ref('mohw', '국민연금 기준소득월액 상·하한 고시')],
      referenceSource: [ref('nps', '국민연금공단 기준소득월액 안내')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2027-01-01',
      verificationStatus: 'verified',
      roundingRule: 'pension_won_rule',
      calculatorScope: ['pension', 'take-home-pay', 'social-insurance', 'employer-cost', 'paystub'],
      note: '기준소득월액 상·하한 조정은 2026년 7월부터 적용. 사용자가 계산 기준월을 선택할 수 있어야 함.'
    },

    /* ---------- 4. 건강보험 ---------- */
    healthInsurance: {
      totalRate: 0.0719,
      employeeRate: 0.03595,
      employerRate: 0.03595,
      display: {
        totalRate: '7.19%',
        employeeRate: '3.595%',
        employerRate: '3.595%'
      },
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      officialSource: [ref('mohw', '2026년 건강보험료율 7.19% 결정 자료')],
      referenceSource: [ref('nhis', '국민건강보험공단 보험료 안내')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-09-01',
      verificationStatus: 'verified',
      roundingRule: 'health_insurance_won_rule',
      calculatorScope: ['take-home-pay', 'social-insurance', 'employer-cost', 'health-insurance', 'paystub'],
      note: '직장가입자는 근로자와 사용자가 각각 절반 부담. officialSource 는 보건복지부로 통일.'
    },

    /* ---------- 5. 장기요양보험 ---------- */
    longTermCare: {
      incomeEquivalentRate: 0.009448,
      rateOnHealthInsurance: 0.1314,
      display: {
        incomeEquivalentRate: '0.9448%',
        rateOnHealthInsurance: '13.14%'
      },
      calculationPriority: 'healthInsurancePremium * 0.1314',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      officialSource: [ref('mohw', '2026년 장기요양보험료율')],
      referenceSource: [ref('nhis', '장기요양보험료 안내')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-11-01',
      verificationStatus: 'verified',
      roundingRule: 'long_term_care_won_rule',
      calculatorScope: ['take-home-pay', 'social-insurance', 'employer-cost', 'health-insurance', 'paystub'],
      note: 'UI 에는 건강보험료의 13.14% 로 표시하고, 계산은 건강보험료 × 0.1314 를 우선 적용.'
    },

    /* ---------- 6. 산재보험 ---------- */
    industrialAccidentInsurance: {
      employeeRate: 0,
      averageEmployerRate: 0.0147,
      display: {
        employeeRate: '0%',
        averageEmployerRate: '1.47%'
      },
      paidBy: 'employer',
      includeInTakeHomePay: false,
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      officialSource: [ref('moel', '2026년 산재보험료율 고시')],
      referenceSource: [ref('kcomwel', '근로복지공단 산재보험료율 안내')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-12-01',
      verificationStatus: 'verified',
      roundingRule: 'industrial_accident_insurance_rule',
      calculatorScope: ['employer-cost', 'industrial-insurance', 'social-insurance'],
      note: '산재보험은 근로자 실수령액에서 제외. 사업주 부담 계산기에서만 반영.'
    },

    /* ---------- 7. 고용보험 (verificationStatus: needs_official_source) ---------- */
    employmentInsurance: {
      unemploymentTotalRate: 0.018,
      employeeRate: 0.009,
      employerRate: 0.009,
      employerAdditionalRateRange: { min: 0.0025, max: 0.0085 },
      employerAdditionalRates: [
        { type: 'priority_support_company', rate: 0.0025, display: '0.25%', label: '우선지원대상기업' },
        { type: 'under_150', rate: 0.0025, display: '0.25%', label: '150인 미만' },
        { type: 'over_150_priority', rate: 0.0045, display: '0.45%', label: '150인 이상 우선지원대상기업' },
        { type: 'over_150_under_1000', rate: 0.0065, display: '0.65%', label: '150인 이상 1,000인 미만' },
        { type: 'over_1000_or_public', rate: 0.0085, display: '0.85%', label: '1,000인 이상 또는 국가·지자체 관련' }
      ],
      display: {
        employeeRate: '0.9%',
        employerRate: '0.9%'
      },
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      officialSource: [],
      referenceSource: [ref('moel', '고용보험료율 안내'), ref('kcomwel', '근로복지공단 고용보험료율')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-08-01',
      verificationStatus: 'needs_official_source',
      roundingRule: 'employment_insurance_rule',
      calculatorScope: ['take-home-pay', 'social-insurance', 'employer-cost', 'employment-insurance', 'paystub'],
      note: '근로자 실수령액에는 0.9% 임시 적용, 사업주 인건비 계산에서는 사업장 규모별 추가요율을 분리. 국가법령정보센터/고용노동부/근로복지공단 공식 자료 확인 후 verified 처리.'
    },

    /* ---------- 8. 최저임금 ---------- */
    minimumWage: {
      hourly: 10320,
      daily8Hours: 82560,
      monthly209Hours: 2156880,
      display: {
        hourly: '10,320원',
        daily8Hours: '82,560원',
        monthly209Hours: '2,156,880원'
      },
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      officialSource: [ref('moel', '2026년 적용 최저임금 고시')],
      referenceSource: [],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-08-01',
      verificationStatus: 'verified',
      roundingRule: 'none',
      calculatorScope: ['minimum-wage', 'weekly-holiday-pay', 'hourly-wage', 'part-time-pay', 'unemployment'],
      note: '월 환산액은 주 40시간, 월 209시간 기준.'
    },

    /* ---------- 9. 주휴수당 ---------- */
    weeklyHolidayPay: {
      weeklyMinimumHours: 15,
      requiresFullAttendance: true,
      formula: '(weeklyContractHours / 40) * 8 * hourlyWage',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      officialSource: [ref('moel', '주휴수당 안내')],
      referenceSource: [],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-12-01',
      verificationStatus: 'verified',
      roundingRule: 'wage_won_rule',
      calculatorScope: ['weekly-holiday-pay', 'part-time-pay', 'hourly-wage'],
      note: '주 15시간 이상 근무하고 소정근로일을 개근한 경우 주휴수당 발생.'
    },

    /* ---------- 10. 식대 비과세 ---------- */
    mealAllowanceTaxFree: {
      monthlyLimit: 200000,
      display: '월 200,000원',
      effectiveFrom: null,
      effectiveTo: null,
      officialSource: [ref('law', '소득세법 비과세 식사대 조항')],
      referenceSource: [ref('nts', '국세청 비과세 안내')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-12-01',
      verificationStatus: 'verified',
      roundingRule: 'none',
      calculatorScope: ['take-home-pay', 'paystub'],
      note: '연봉 실수령액 계산기 기본 비과세액은 월 20만원으로 두되 사용자가 수정 가능.'
    },

    /* ---------- 11. 퇴직금 ---------- */
    severancePay: {
      formula: 'dailyAverageWage * 30 * (employmentDays / 365)',
      eligibility: { minimumEmploymentDays: 365, weeklyMinimumHours: 15 },
      correctedExample: {
        monthlySalary: 3000000,
        dailyAverageWage: 100000,
        employmentDays: 1095,
        formula: '100000 * 30 * (1095 / 365)',
        result: 9000000,
        display: '약 9,000,000원'
      },
      officialSource: [ref('moel', '퇴직금 계산 안내')],
      referenceSource: [],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-12-01',
      verificationStatus: 'verified',
      roundingRule: 'severance_won_rule',
      calculatorScope: ['severance-pay'],
      note: '월 300만, 3년 근속 → 약 9,000,000원 (기존 90,000,000원 표기는 오류).'
    }
  };

  global.KR_RATES_2026 = KR_RATES_2026;
})(typeof window !== 'undefined' ? window : globalThis);
