/* ===== policies-kr.js — 정책성/동적 기준값 ===== */
/* 단일 고정값 금지. 입력 조건에 따라 분기되는 policyTable 또는 formula 로 관리. */
/* 1차에서는 스키마와 placeholder 만, 실제 정책값은 2·3차에서 채움. */

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

  var KR_POLICIES = {
    /* ---------- 1. 주택담보대출 정책 (DSR / LTV / DTI) ---------- */
    /* 단일 constants 금지. 사용자 입력 조건에 따라 policyTable 분기. */
    housingLoanPolicy: {
      dsr: {
        bank: { defaultLimit: 0.40, verificationStatus: 'dynamic' },
        nonBank: { defaultLimit: 0.50, verificationStatus: 'dynamic' },
        stressDsr: {
          enabled: true,
          stages: [],
          verificationStatus: 'dynamic',
          note: '스트레스 DSR 단계와 가산금리는 금융위/금감원 공식자료로 관리'
        }
      },
      ltv: {
        policyTable: [],
        verificationStatus: 'dynamic',
        note: '규제지역, 주택수, 생애최초, 정책대출 여부에 따라 분기'
      },
      dti: {
        policyTable: [],
        verificationStatus: 'dynamic',
        note: '규제지역/비규제지역 및 금융권에 따라 분기'
      },
      requiredInputs: [
        'lenderType',          /* bank | nonBank */
        'regulatedArea',       /* regulated | nonRegulated */
        'numberOfHouses',      /* 0 | 1 | 2+ */
        'firstTimeBuyer',      /* boolean */
        'policyLoan',          /* boolean */
        'stressDsrApplied',    /* boolean */
        'housePrice',
        'annualIncome',
        'existingAnnualPayment',
        'newAnnualPayment',
        'loanPurpose'          /* purchase | living | jeonseReturn | other */
      ],
      officialSource: [ref('fsc', 'DSR/LTV/DTI 정책 안내'), ref('fss', '스트레스 DSR 시행 세칙')],
      referenceSource: [ref('hf', '한국주택금융공사 정책대출 한도')],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-08-01',
      verificationStatus: 'dynamic',
      calculatorScope: ['dsr', 'mortgage-limit'],
      note: '금융위원회/금융감독원/한국주택금융공사 공식자료만 officialSource. 민간 자료 사용 금지.'
    },

    /* ---------- 2. 자동차세 ---------- */
    carTax: {
      passengerNonCommercial: {
        under1000cc: { taxPerCc: 80 },
        under1600cc: { taxPerCc: 140 },
        over1600cc: { taxPerCc: 200 }
      },
      localEducationTax: {
        rate: 0.30,
        appliesTo: ['non_commercial_passenger']
      },
      ageDiscount: {
        startsFromYear: 3,
        annualDiscountRate: 0.05,
        maxDiscountRate: 0.50
      },
      electricVehicle: {
        annualBaseTax: 100000,
        localEducationTaxRate: 0.30,
        verificationStatus: 'needs_official_source'
      },
      annualPrepaymentDiscount: {
        verificationStatus: 'needs_official_source',
        note: '2026년 연납 할인율은 위택스/행정안전부 공식자료로 확정 후 반영'
      },
      officialSource: [ref('wetax', '자동차세 안내'), ref('mois', '지방세법')],
      referenceSource: [],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-08-01',
      verificationStatus: 'needs_official_source',
      calculatorScope: ['car-tax', 'car-cost'],
      note: '민간 블로그/계산기 사이트는 officialSource 로 사용 금지. 위택스/지방세법/행정안전부 자료만 인정.'
    },

    /* ---------- 3. 전월세 전환율 ---------- */
    rentJeonsePolicy: {
      conversionCapRate: {
        formula: 'min(0.10, latestBaseRate + 0.02)',
        latestBaseRate: {
          value: null,
          display: null,
          source: '한국은행',
          userEditable: true,
          lastVerifiedAt: null
        },
        statutorySpread: 0.02,
        absoluteCap: 0.10,
        verificationStatus: 'dynamic',
        officialSource: [ref('bok', '한국은행 기준금리'), ref('law', '주택임대차보호법 시행령')],
        referenceSource: [],
        note: '한국은행 기준금리는 변동값. 사용자가 직접 입력/수정 가능해야 함. 4.5% 같은 고정값 하드코딩 금지.'
      },
      inputs: [
        'jeonseDeposit',
        'monthlyDeposit',
        'monthlyRent',
        'jeonseLoan',
        'jeonseLoanRate',
        'depositOpportunityCostRate',
        'baseRate',
        'comparisonMonths'
      ],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-08-01',
      verificationStatus: 'dynamic',
      calculatorScope: ['rent-to-deposit', 'rent-vs-jeonse'],
      note: '4.5% 하드코딩 금지. conversionCapRate.formula 결과를 적용.'
    },

    /* ---------- 4. 프리랜서 / 기타소득 원천징수 ---------- */
    withholdingTax: {
      businessIncome: {
        incomeTaxRate: 0.03,
        localIncomeTaxRate: 0.003,
        totalRate: 0.033,
        display: '3.3%',
        verificationStatus: 'needs_official_source',
        officialSource: [ref('nts', '사업소득 원천징수 안내')],
        referenceSource: [],
        note: '사업소득 원천징수. 5월 종합소득세 신고 시 정산 가능.'
      },
      otherIncome: {
        effectiveIncomeTaxRate: 0.08,
        effectiveLocalIncomeTaxRate: 0.008,
        totalRate: 0.088,
        necessaryExpenseRate: 0.60,
        display: '8.8%',
        verificationStatus: 'needs_official_source',
        officialSource: [ref('nts', '기타소득 원천징수 안내')],
        referenceSource: [],
        note: '기타소득 필요경비 60% 적용 전제. 소득 유형에 따라 달라질 수 있음.'
      },
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2026-08-01',
      calculatorScope: ['freelancer-tax']
    },

    /* ---------- 5. 연말정산 (간이 추정 — 정교한 환급 계산기 아님) ---------- */
    yearEndTaxSettlement: {
      mode: 'simplified_estimate',
      requiredFields: [
        'totalSalary',
        'earnedIncomeDeduction',
        'basicDeduction',
        'personalDeduction',
        'computedTax',
        'earnedIncomeTaxCredit'
      ],
      optionalFields: [
        'childTaxCredit',
        'creditCardSpending',
        'medicalExpense',
        'educationExpense',
        'insurancePremium',
        'monthlyRent',
        'pensionSavings',
        'donation'
      ],
      disclaimer: '본 계산기는 국세청 기준을 바탕으로 한 간이 추정 계산기입니다. 실제 연말정산 결과는 회사 제출자료, 국세청 간소화 자료, 개인별 공제 요건에 따라 달라질 수 있습니다.',
      officialSource: [ref('nts', '연말정산 종합 안내'), ref('hometax', '연말정산 간소화')],
      referenceSource: [],
      lastVerifiedAt: '2026-05-05',
      nextReviewAt: '2027-01-01',
      verificationStatus: 'needs_official_source',
      calculatorScope: ['year-end-tax-settlement']
    }
  };

  global.KR_POLICIES = KR_POLICIES;
})(typeof window !== 'undefined' ? window : globalThis);
