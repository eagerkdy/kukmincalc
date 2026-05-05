/* ===== calculator-core.js - 35개 계산 함수 모듈 ===== */
/* 2026 기준값은 window.KR_RATES_2026 / window.getRatesByDate / window.KR_ROUNDING_RULES 에서 가져온다.
 * constants 스크립트(/assets/js/constants/*.js, /assets/js/utils/*.js)가 먼저 로드되어 있어야 함.
 * 호출 시그니처는 backward-compat 유지 (옵션은 마지막 인자에 객체로 추가). */

const CalcCore = {

  // ----- 내부 헬퍼: 기준값 조회 (constants 미로드 시 안전한 fallback) -----
  _rates() {
    return (typeof window !== 'undefined' && window.KR_RATES_2026) || {};
  },
  _ratesAt(date, scope) {
    if (typeof window !== 'undefined' && typeof window.getRatesByDate === 'function') {
      return window.getRatesByDate(date, scope);
    }
    return null;
  },
  _round(amount, ruleKey) {
    if (typeof window !== 'undefined' && typeof window.roundByRule === 'function') {
      return window.roundByRule(amount, ruleKey);
    }
    return Math.round(amount);
  },
  _appliedRates(scope, date, extra) {
    var r = this._ratesAt(date, scope);
    if (!r) return null;
    return Object.assign({
      rateVersion: r.rateVersion,
      appliedDate: r.appliedDate,
      lastVerifiedAt: r.lastVerifiedAt,
      warnings: r.warnings || []
    }, extra || {});
  },

  // ========== 1. 대출이자 ==========
  loanEqualPayment(principal, rate, months, grace = 0) {
    const r = rate / 12 / 100;
    if (r === 0) return { monthly: Math.round(principal / (months - grace)), total: principal, interest: 0, graceMonthly: 0 };
    const graceInterest = grace > 0 ? principal * r * grace : 0;
    const n = months - grace;
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalInterest = (monthly * n) + graceInterest - principal;
    return {
      monthly: Math.round(monthly),
      total: Math.round(monthly * n + graceInterest),
      interest: Math.round(totalInterest),
      graceMonthly: grace > 0 ? Math.round(principal * r) : 0
    };
  },

  loanEqualPrincipal(principal, rate, months, grace = 0) {
    const r = rate / 12 / 100;
    const n = months - grace;
    const monthlyPrincipal = principal / n;
    let totalInterest = 0;
    let remaining = principal;
    for (let i = 0; i < grace; i++) totalInterest += remaining * r;
    const firstInterest = remaining * r;
    for (let i = 0; i < n; i++) {
      totalInterest += remaining * r;
      remaining -= monthlyPrincipal;
    }
    const lastRemaining = principal - monthlyPrincipal * (n - 1);
    return {
      firstMonthly: Math.round(monthlyPrincipal + firstInterest),
      lastMonthly: Math.round(monthlyPrincipal + lastRemaining * r / n * (n > 1 ? 1 : 0) + (n === 1 ? firstInterest : monthlyPrincipal * r)),
      totalInterest: Math.round(totalInterest),
      total: Math.round(principal + totalInterest)
    };
  },

  loanBullet(principal, rate, months) {
    const r = rate / 12 / 100;
    const monthlyInterest = principal * r;
    return {
      monthly: Math.round(monthlyInterest),
      total: Math.round(principal + monthlyInterest * months),
      interest: Math.round(monthlyInterest * months),
      finalPayment: principal
    };
  },

  // ========== 2. 퇴직금 ==========
  severancePay(avgDailySalary, totalDays) {
    // 퇴직금 = 1일 평균임금 × 30일 × (총 재직일수 / 365)
    return Math.round(avgDailySalary * 30 * (totalDays / 365));
  },

  severancePayFromMonthly(monthlySalary, years, months = 0) {
    const totalDays = years * 365 + months * 30;
    const dailySalary = monthlySalary / 30;
    return this.severancePay(dailySalary, totalDays);
  },

  // ========== 3. 실업급여 ==========
  unemployment(avgDailySalary, age, workYears) {
    // 2026년 기준 실업급여
    const dailyBenefit = Math.min(avgDailySalary * 0.6, 66000); // 상한 66,000원
    const minBenefit = 63104; // 하한 (최저임금의 80%)
    const daily = Math.max(dailyBenefit, minBenefit);

    // 소정급여일수 (연령 + 피보험기간)
    let days;
    if (age < 50) {
      if (workYears < 1) days = 120;
      else if (workYears < 3) days = 150;
      else if (workYears < 5) days = 180;
      else if (workYears < 10) days = 210;
      else days = 240;
    } else {
      if (workYears < 1) days = 120;
      else if (workYears < 3) days = 180;
      else if (workYears < 5) days = 210;
      else if (workYears < 10) days = 240;
      else days = 270;
    }

    return { daily: Math.round(daily), days, total: Math.round(daily * days), monthly: Math.round(daily * 30) };
  },

  // ========== 4. 연봉 실수령액 ==========
  takeHomePay(annualSalary, dependents = 1, childUnder20 = 0, nonTaxable, opts) {
    const rates = this._rates();
    const ratesAt = this._ratesAt((opts && opts.date) || null, 'take-home-pay');
    const meal = rates.mealAllowanceTaxFree || { monthlyLimit: 200000 };
    if (nonTaxable === undefined || nonTaxable === null) nonTaxable = meal.monthlyLimit;

    const monthly = annualSalary / 12;
    const taxable = monthly - nonTaxable;

    // 4대보험 — 2026 기준값
    const pensionRate = (rates.pension && rates.pension.employeeRate) != null ? rates.pension.employeeRate : 0.0475;
    const healthRate = (rates.healthInsurance && rates.healthInsurance.employeeRate) != null ? rates.healthInsurance.employeeRate : 0.03595;
    const longTermRate = (rates.longTermCare && rates.longTermCare.rateOnHealthInsurance) != null ? rates.longTermCare.rateOnHealthInsurance : 0.1314;
    const employmentRate = (rates.employmentInsurance && rates.employmentInsurance.employeeRate) != null ? rates.employmentInsurance.employeeRate : 0.009;

    // 국민연금 기준소득월액 clamp (기준월별)
    const pensionLimit = ratesAt && ratesAt.pensionIncomeLimit;
    const pensionFloor = pensionLimit ? pensionLimit.floor : 400000;
    const pensionCeiling = pensionLimit ? pensionLimit.ceiling : 6370000;
    const pensionBase = Math.min(Math.max(taxable, pensionFloor), pensionCeiling);

    const nationalPension = this._round(pensionBase * pensionRate, 'pension_won_rule');
    const healthInsurance = this._round(taxable * healthRate, 'health_insurance_won_rule');
    const longTermCare = this._round(healthInsurance * longTermRate, 'long_term_care_won_rule');
    const employmentIns = this._round(taxable * employmentRate, 'employment_insurance_rule');
    const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentIns;

    // 소득세 (간이세액표 근사)
    const annualTaxable = taxable * 12;
    let incomeTax = 0;
    if (annualTaxable <= 14000000) incomeTax = annualTaxable * 0.06;
    else if (annualTaxable <= 50000000) incomeTax = 840000 + (annualTaxable - 14000000) * 0.15;
    else if (annualTaxable <= 88000000) incomeTax = 6240000 + (annualTaxable - 50000000) * 0.24;
    else if (annualTaxable <= 150000000) incomeTax = 15360000 + (annualTaxable - 88000000) * 0.35;
    else if (annualTaxable <= 300000000) incomeTax = 37060000 + (annualTaxable - 150000000) * 0.38;
    else if (annualTaxable <= 500000000) incomeTax = 94060000 + (annualTaxable - 300000000) * 0.40;
    else if (annualTaxable <= 1000000000) incomeTax = 174060000 + (annualTaxable - 500000000) * 0.42;
    else incomeTax = 384060000 + (annualTaxable - 1000000000) * 0.45;

    // 부양가족 공제
    const deduction = (dependents * 1500000 + childUnder20 * 150000);
    incomeTax = Math.max(0, incomeTax - deduction * 0.15);
    const monthlyIncomeTax = Math.round(incomeTax / 12);
    const localTax = Math.round(monthlyIncomeTax * 0.1);

    const totalDeduction = totalInsurance + monthlyIncomeTax + localTax;
    const takeHome = Math.round(monthly - totalDeduction);

    return {
      monthly, takeHome, totalDeduction,
      nationalPension, healthInsurance, longTermCare, employmentIns,
      incomeTax: monthlyIncomeTax, localTax,
      annualTakeHome: takeHome * 12,
      pensionBase: pensionBase,
      appliedRates: this._appliedRates('take-home-pay', opts && opts.date)
    };
  },

  // ========== 5. 시급 계산기 ==========
  hourlyWage(monthlySalary, weeklyHours = 40) {
    // 월 소정근로시간 = (주 소정근로시간 + 8) × 4.345 (주휴 포함)
    const monthlyHours = (weeklyHours + (weeklyHours >= 15 ? 8 : 0)) * 4.345;
    return { hourly: Math.round(monthlySalary / monthlyHours), monthlyHours: Math.round(monthlyHours) };
  },

  hourlyToMonthly(hourlyWage, weeklyHours = 40) {
    const monthlyHours = (weeklyHours + (weeklyHours >= 15 ? 8 : 0)) * 4.345;
    return { monthly: Math.round(hourlyWage * monthlyHours), monthlyHours: Math.round(monthlyHours) };
  },

  // ========== 6. 야근수당 ==========
  overtimePay(hourlyWage, overtimeHours, isNight = false, isHoliday = false) {
    let rate = 1.5; // 기본 연장근로 50%
    if (isNight) rate = 2.0; // 야간 + 연장
    if (isHoliday) rate = isNight ? 2.5 : 2.0; // 휴일
    return Math.round(hourlyWage * overtimeHours * rate);
  },

  // ========== 7. 연차수당 ==========
  annualLeavePay(dailyWage, unusedDays) {
    return Math.round(dailyWage * unusedDays);
  },

  annualLeaveCount(totalYears, totalMonths) {
    if (totalYears < 1) return Math.min(totalMonths, 11); // 1년 미만: 월 1개
    let days = 15;
    if (totalYears > 3) days += Math.floor((totalYears - 1) / 2);
    return Math.min(days, 25); // 최대 25일
  },

  // ========== 8. 종합소득세 ==========
  incomeTax(totalIncome, deductions = 0) {
    const taxable = Math.max(0, totalIncome - deductions);
    let tax = 0;
    const brackets = [
      [14000000, 0.06], [50000000, 0.15], [88000000, 0.24],
      [150000000, 0.35], [300000000, 0.38], [500000000, 0.40],
      [1000000000, 0.42], [Infinity, 0.45]
    ];
    let prev = 0;
    for (const [limit, rate] of brackets) {
      if (taxable <= limit) { tax += (taxable - prev) * rate; break; }
      tax += (limit - prev) * rate;
      prev = limit;
    }
    const localTax = Math.round(tax * 0.1);
    return { tax: Math.round(tax), localTax, total: Math.round(tax + localTax), effectiveRate: totalIncome > 0 ? (tax / totalIncome * 100) : 0 };
  },

  // ========== 9. 부가가치세 ==========
  vat(supplyValue, type = 'include') {
    if (type === 'include') {
      // 포함 → 분리
      const supply = Math.round(supplyValue / 1.1);
      const vat = supplyValue - supply;
      return { supply, vat, total: supplyValue };
    }
    // 미포함 → 더하기
    const vat = Math.round(supplyValue * 0.1);
    return { supply: supplyValue, vat, total: supplyValue + vat };
  },

  // ========== 10. 양도소득세 ==========
  capitalGainsTax(salePrice, buyPrice, expenses = 0, holdingYears = 1, isOneHouse = false) {
    const gain = salePrice - buyPrice - expenses;
    if (gain <= 0) return { gain: 0, tax: 0, localTax: 0, total: 0 };

    // 1세대 1주택 비과세 (9억 초과분만)
    let taxableGain = gain;
    if (isOneHouse && salePrice <= 1200000000 && holdingYears >= 2) {
      return { gain, tax: 0, localTax: 0, total: 0, exempt: true };
    }
    if (isOneHouse && salePrice > 1200000000) {
      taxableGain = gain * ((salePrice - 1200000000) / salePrice);
    }

    // 기본공제
    taxableGain = Math.max(0, taxableGain - 2500000);

    // 장기보유특별공제 (보유기간별)
    let longTermDeduction = 0;
    if (holdingYears >= 3) longTermDeduction = Math.min(holdingYears * 2, 30) / 100;
    if (isOneHouse && holdingYears >= 3) longTermDeduction = Math.min(holdingYears * 4, 80) / 100;
    taxableGain *= (1 - longTermDeduction);

    const result = this.incomeTax(taxableGain);
    return { gain, taxableGain: Math.round(taxableGain), tax: result.tax, localTax: result.localTax, total: result.total, longTermDeduction: Math.round(longTermDeduction * 100) };
  },

  // ========== 11. 증여세 ==========
  giftTax(giftAmount, relation = 'child', previousGifts = 0) {
    const exemptions = { spouse: 600000000, child: 50000000, grandchild: 50000000, minor: 20000000, other: 10000000 };
    const exemption = exemptions[relation] || 10000000;
    const taxable = Math.max(0, giftAmount + previousGifts - exemption);

    const brackets = [
      [100000000, 0.10], [500000000, 0.20], [1000000000, 0.30],
      [3000000000, 0.40], [Infinity, 0.50]
    ];
    let tax = 0, prev = 0;
    for (const [limit, rate] of brackets) {
      if (taxable <= limit) { tax += (taxable - prev) * rate; break; }
      tax += (limit - prev) * rate;
      prev = limit;
    }
    return { exemption, taxable, tax: Math.round(tax), effectiveRate: giftAmount > 0 ? (tax / giftAmount * 100) : 0 };
  },

  // ========== 12. 상속세 ==========
  inheritanceTax(totalAssets, debts = 0, funeralCost = 0, spouse = true, children = 1) {
    const netAssets = totalAssets - debts - Math.min(funeralCost, 15000000);
    const basicDeduction = 500000000; // 기본공제 5억
    const spouseDeduction = spouse ? Math.max(500000000, Math.min(netAssets * 0.3, 3000000000)) : 0;
    const childDeduction = children * 50000000;
    const totalDeduction = Math.max(basicDeduction + spouseDeduction + childDeduction, 1000000000); // 일괄공제 10억 선택
    const taxable = Math.max(0, netAssets - totalDeduction);

    const brackets = [
      [100000000, 0.10], [500000000, 0.20], [1000000000, 0.30],
      [3000000000, 0.40], [Infinity, 0.50]
    ];
    let tax = 0, prev = 0;
    for (const [limit, rate] of brackets) {
      if (taxable <= limit) { tax += (taxable - prev) * rate; break; }
      tax += (limit - prev) * rate;
      prev = limit;
    }
    return { netAssets, totalDeduction, taxable, tax: Math.round(tax) };
  },

  // ========== 13. 취득세 ==========
  acquisitionTax(price, area = 85, isFirstHome = true, numHouses = 0) {
    let rate;
    if (numHouses === 0 || isFirstHome) {
      if (price <= 600000000) rate = 0.01;
      else if (price <= 900000000) rate = 0.02;
      else rate = 0.03;
    } else if (numHouses === 1) {
      rate = 0.08;
    } else {
      rate = 0.12;
    }

    const acqTax = Math.round(price * rate);
    const eduTax = Math.round(acqTax * 0.1);
    const specialTax = rate < 0.02 ? 0 : Math.round(acqTax * 0.2);
    return { rate: rate * 100, acqTax, eduTax, specialTax, total: acqTax + eduTax + specialTax };
  },

  // ========== 14. 재산세 ==========
  propertyTax(publicPrice) {
    // 과세표준 = 공시가격 × 60%
    const taxBase = publicPrice * 0.6;
    let rate, deduction;
    if (taxBase <= 60000000) { rate = 0.001; deduction = 0; }
    else if (taxBase <= 150000000) { rate = 0.0015; deduction = 30000; }
    else if (taxBase <= 300000000) { rate = 0.0025; deduction = 180000; }
    else { rate = 0.004; deduction = 630000; }

    const propertyTax = Math.round(taxBase * rate - deduction);
    const cityTax = Math.round(propertyTax * 0.14);
    const eduTax = Math.round(propertyTax * 0.2);
    return { taxBase: Math.round(taxBase), propertyTax, cityTax, eduTax, total: propertyTax + cityTax + eduTax };
  },

  // ========== 15. 종합부동산세 ==========
  comprehensivePropertyTax(totalPublicPrice, numHouses = 1) {
    const deduction = numHouses === 1 ? 1100000000 : 600000000;
    const taxBase = Math.max(0, (totalPublicPrice - deduction) * 0.6);
    if (taxBase <= 0) return { taxBase: 0, tax: 0, total: 0 };

    let rate;
    if (numHouses <= 1) {
      if (taxBase <= 300000000) rate = 0.005;
      else if (taxBase <= 600000000) rate = 0.007;
      else if (taxBase <= 1200000000) rate = 0.01;
      else if (taxBase <= 5000000000) rate = 0.013;
      else rate = 0.02;
    } else {
      if (taxBase <= 300000000) rate = 0.005;
      else if (taxBase <= 600000000) rate = 0.007;
      else if (taxBase <= 1200000000) rate = 0.01;
      else if (taxBase <= 2500000000) rate = 0.02;
      else rate = 0.05;
    }

    const tax = Math.round(taxBase * rate);
    const farmTax = Math.round(tax * 0.2);
    return { taxBase: Math.round(taxBase), tax, farmTax, total: tax + farmTax };
  },

  // ========== 16. 주택담보대출 한도 ==========
  mortgageLimit(housePrice, annualIncome, existingDebt = 0, ltv = 0.7, dti = 0.4, dsr = 0.4) {
    const ltvLimit = Math.round(housePrice * ltv);
    const dtiLimit = Math.round((annualIncome * dti - existingDebt * 0.12) / 0.06 * 0.8);
    const dsrLimit = Math.round((annualIncome * dsr - existingDebt * 0.05) / 0.05);
    const limit = Math.min(ltvLimit, dtiLimit, dsrLimit);
    return { ltvLimit, dtiLimit, dsrLimit, limit: Math.max(0, limit) };
  },

  // ========== 17. DSR ==========
  dsr(annualIncome, loans) {
    // loans: [{principal, rate, months, type}]
    let totalAnnualPayment = 0;
    loans.forEach(loan => {
      const r = loan.rate / 12 / 100;
      const n = loan.months;
      let annual;
      if (loan.type === 'mortgage') {
        const monthly = loan.principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        annual = monthly * 12;
      } else {
        annual = (loan.principal / n + loan.principal * r) * 12;
      }
      totalAnnualPayment += annual;
    });
    const dsrRatio = annualIncome > 0 ? (totalAnnualPayment / annualIncome * 100) : 0;
    return { totalAnnualPayment: Math.round(totalAnnualPayment), dsr: Math.round(dsrRatio * 10) / 10 };
  },

  // ========== 18. 중도상환수수료 ==========
  prepaymentFee(amount, rate = 1.5, remainingMonths = 0, totalMonths = 36, type = 'fixed') {
    if (type === 'fixed') {
      const feeRate = rate / 100;
      const remainRatio = remainingMonths / totalMonths;
      return Math.round(amount * feeRate * remainRatio);
    }
    return Math.round(amount * (rate / 100));
  },

  // ========== 19. 예적금 이자 ==========
  depositInterest(principal, annualRate, months, type = 'deposit', taxRate = 0.154) {
    const r = annualRate / 100;
    if (type === 'deposit') {
      // 정기예금 (단리)
      const interest = principal * r * (months / 12);
      const tax = Math.round(interest * taxRate);
      return { interest: Math.round(interest), tax, afterTax: Math.round(interest - tax), total: Math.round(principal + interest - tax) };
    }
    // 적금 (매월 적립)
    let totalInterest = 0;
    for (let i = 1; i <= months; i++) {
      totalInterest += principal * r * ((months - i + 1) / 12);
    }
    const totalDeposit = principal * months;
    const tax = Math.round(totalInterest * taxRate);
    return { totalDeposit, interest: Math.round(totalInterest), tax, afterTax: Math.round(totalInterest - tax), total: Math.round(totalDeposit + totalInterest - tax) };
  },

  // ========== 20. 복리 계산기 ==========
  compoundInterest(principal, annualRate, years, compoundPerYear = 12, monthlyAdd = 0) {
    const r = annualRate / 100;
    const n = compoundPerYear;
    const t = years;

    // 복리: A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
    let amount = principal * Math.pow(1 + r / n, n * t);
    if (monthlyAdd > 0 && r > 0) {
      amount += monthlyAdd * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));
    } else if (monthlyAdd > 0) {
      amount += monthlyAdd * n * t;
    }
    const totalInvested = principal + monthlyAdd * 12 * years;
    return { amount: Math.round(amount), totalInvested, interest: Math.round(amount - totalInvested) };
  },

  // ========== 21. 국민연금 ==========
  pension(monthlySalary, opts) {
    const rates = this._rates();
    const ratesAt = this._ratesAt(opts && opts.date, 'pension');
    const employeeRate = (rates.pension && rates.pension.employeeRate) != null ? rates.pension.employeeRate : 0.0475;
    const employerRate = (rates.pension && rates.pension.employerRate) != null ? rates.pension.employerRate : 0.0475;

    const limit = ratesAt && ratesAt.pensionIncomeLimit;
    const floor = limit ? limit.floor : 400000;
    const ceiling = limit ? limit.ceiling : 6370000;
    const base = Math.min(Math.max(monthlySalary, floor), ceiling);

    const employee = this._round(base * employeeRate, 'pension_won_rule');
    const employer = this._round(base * employerRate, 'pension_won_rule');
    return {
      base,
      floor,
      ceiling,
      period: limit ? limit.period : null,
      employee,
      employer,
      total: employee + employer,
      appliedRates: this._appliedRates('pension', opts && opts.date)
    };
  },

  // ========== 22. 건강보험료 ==========
  healthInsurance(monthlySalary, opts) {
    const rates = this._rates();
    const totalRate = (rates.healthInsurance && rates.healthInsurance.totalRate) != null ? rates.healthInsurance.totalRate : 0.0719;
    const halfRate = (rates.healthInsurance && rates.healthInsurance.employeeRate) != null ? rates.healthInsurance.employeeRate : 0.03595;
    const longTermRate = (rates.longTermCare && rates.longTermCare.rateOnHealthInsurance) != null ? rates.longTermCare.rateOnHealthInsurance : 0.1314;

    const health = this._round(monthlySalary * totalRate, 'health_insurance_won_rule');
    const longTerm = this._round(health * longTermRate, 'long_term_care_won_rule');
    const employeeHealth = this._round(monthlySalary * halfRate, 'health_insurance_won_rule');
    const employeeLong = this._round(employeeHealth * longTermRate, 'long_term_care_won_rule');
    return {
      health,
      longTerm,
      employeeHealth,
      employeeLong,
      employeeTotal: employeeHealth + employeeLong,
      appliedRates: this._appliedRates('health-insurance', opts && opts.date)
    };
  },

  // ========== 23. 고용보험료 ==========
  /* 사업장 규모별 추가요율을 분리하여, 근로자 부담(0.9% 만)과 사업주 부담(0.9% + 추가요율)을 구분 반환.
   * companySize 는 spec 의 5단계 라벨을 받지만, 기존 small/medium/large 도 backward-compat alias 로 동작. */
  employmentInsurance(monthlySalary, companySize = 'under_150', opts) {
    const rates = this._rates();
    const ei = rates.employmentInsurance || {};
    const employeeRate = ei.employeeRate != null ? ei.employeeRate : 0.009;
    const employerBaseRate = ei.employerRate != null ? ei.employerRate : 0.009;

    // 추가요율 lookup
    const list = ei.employerAdditionalRates || [];
    const aliasMap = {
      small: 'under_150',
      medium: 'over_150_under_1000',
      large: 'over_1000_or_public'
    };
    const sizeKey = aliasMap[companySize] || companySize;
    let additional = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].type === sizeKey) { additional = list[i].rate; break; }
    }
    if (!additional && list.length > 0) additional = list[0].rate;

    const employee = this._round(monthlySalary * employeeRate, 'employment_insurance_rule');
    const employerBase = this._round(monthlySalary * employerBaseRate, 'employment_insurance_rule');
    const employerAdditional = this._round(monthlySalary * additional, 'employment_insurance_rule');
    const employer = employerBase + employerAdditional;
    return {
      employee,
      employer,
      employerBase,
      employerAdditional,
      employerAdditionalRate: additional,
      sizeKey,
      total: employee + employer,
      appliedRates: this._appliedRates('employment-insurance', opts && opts.date, {
        verificationStatus: ei.verificationStatus || 'needs_official_source'
      })
    };
  },

  // ========== 24. 산재보험료 ==========
  industrialInsurance(monthlySalary, industryRate = 0.007) {
    const premium = Math.round(monthlySalary * industryRate);
    return { premium, rate: industryRate * 100 };
  },

  // ========== 25. 월세↔전세 전환 ==========
  /* 전월세 전환율 = min(0.10, latestBaseRate + 0.02). 4.5% 하드코딩 금지.
   * 호출자는 baseRate(한국은행 기준금리, 사용자 입력)를 percent 단위로 전달해야 한다.
   * conversionRate 가 직접 주어지면 그 값을 사용. 둘 다 없으면 baseRate=null 로 보고 fallback. */
  conversionCapRate(baseRatePercent) {
    const policies = (typeof window !== 'undefined' && window.KR_POLICIES) || {};
    const policy = (policies.rentJeonsePolicy && policies.rentJeonsePolicy.conversionCapRate) || {};
    const spread = policy.statutorySpread != null ? policy.statutorySpread : 0.02;
    const cap = policy.absoluteCap != null ? policy.absoluteCap : 0.10;
    if (baseRatePercent == null || isNaN(baseRatePercent)) return null;
    const baseRate = baseRatePercent / 100;
    return Math.min(cap, baseRate + spread) * 100; // percent 단위 반환
  },

  rentToDeposit(monthlyRent, conversionRate, opts) {
    const baseRate = opts && opts.baseRatePercent;
    if ((conversionRate == null || isNaN(conversionRate)) && baseRate != null) {
      conversionRate = this.conversionCapRate(baseRate);
    }
    if (conversionRate == null || isNaN(conversionRate)) {
      // 마지막 fallback — baseRate 도 없으면 정책상 cap(10%)을 임시 적용. 호출자에게 경고.
      conversionRate = 10;
    }
    const deposit = Math.round(monthlyRent * 12 / (conversionRate / 100));
    return { deposit, appliedConversionRate: conversionRate, hasBaseRate: baseRate != null };
  },

  depositToRent(deposit, conversionRate, opts) {
    const baseRate = opts && opts.baseRatePercent;
    if ((conversionRate == null || isNaN(conversionRate)) && baseRate != null) {
      conversionRate = this.conversionCapRate(baseRate);
    }
    if (conversionRate == null || isNaN(conversionRate)) conversionRate = 10;
    const monthlyRent = Math.round(deposit * (conversionRate / 100) / 12);
    return { monthlyRent, appliedConversionRate: conversionRate, hasBaseRate: baseRate != null };
  },

  // ========== 26. 이사비용 ==========
  movingCost(houseType = '1room', distance = 10, floor = 1, hasElevator = true, season = 'normal') {
    const baseCosts = { '1room': 300000, '2room': 500000, '3room': 800000, '4room': 1200000, house: 2000000 };
    let cost = baseCosts[houseType] || 500000;
    if (distance > 30) cost *= 1.3;
    else if (distance > 100) cost *= 1.8;
    if (!hasElevator && floor > 3) cost *= 1.2;
    if (season === 'peak') cost *= 1.5; // 이사 성수기
    return { cost: Math.round(cost) };
  },

  // ========== 27. 인테리어 비용 ==========
  remodelCost(area, level = 'standard') {
    const perPyeong = { basic: 3000000, standard: 5000000, premium: 8000000, luxury: 12000000 };
    const pyeong = area / 3.3058;
    const cost = Math.round(pyeong * (perPyeong[level] || 5000000));
    return { cost, pyeong: Math.round(pyeong * 10) / 10 };
  },

  // ========== 28. 자동차 유지비 ==========
  carCost(carPrice, fuelType = 'gasoline', kmPerMonth = 1000, fuelEfficiency = 12, fuelPrice = 1650) {
    const fuelCost = Math.round((kmPerMonth / fuelEfficiency) * fuelPrice);
    const insurance = Math.round(carPrice * 0.04 / 12);
    const maintenance = Math.round(carPrice * 0.02 / 12);
    const tax = Math.round(carPrice * 0.015 / 12);
    const depreciation = Math.round(carPrice * 0.15 / 12);
    const total = fuelCost + insurance + maintenance + tax;
    return { fuelCost, insurance, maintenance, tax, depreciation, total, totalWithDepr: total + depreciation };
  },

  // ========== 29. 결혼비용 ==========
  weddingCost(hallType = 'hotel', guests = 200, giftPerPerson = 50000) {
    const hallCosts = { small: 5000000, wedding: 10000000, hotel: 20000000, outdoor: 15000000 };
    const hallCost = hallCosts[hallType] || 10000000;
    const mealCost = guests * 80000;
    const expectedGift = guests * giftPerPerson;
    const photoCost = 2000000;
    const dressCost = 3000000;
    const honeymoon = 5000000;
    const total = hallCost + mealCost + photoCost + dressCost + honeymoon;
    return { hallCost, mealCost, photoCost, dressCost, honeymoon, total, expectedGift, netCost: total - expectedGift };
  },

  // ========== 30. 육아비용 ==========
  childCost(age = 0, region = 'seoul') {
    // 연령별 월 평균 육아비용 (2026년 추정)
    const monthlyCosts = {
      0: { daycare: 500000, food: 150000, medical: 100000, misc: 200000 },
      1: { daycare: 500000, food: 200000, medical: 80000, misc: 250000 },
      3: { daycare: 400000, food: 250000, medical: 50000, misc: 300000 },
      6: { education: 300000, food: 300000, medical: 50000, misc: 400000 },
      10: { education: 500000, food: 350000, medical: 50000, misc: 500000 },
      13: { education: 800000, food: 400000, medical: 50000, misc: 600000 }
    };
    const bracket = Object.keys(monthlyCosts).reverse().find(a => age >= parseInt(a)) || '0';
    const costs = monthlyCosts[bracket];
    const total = Object.values(costs).reduce((a, b) => a + b, 0);
    const regionMultiplier = region === 'seoul' ? 1.2 : region === 'metro' ? 1.0 : 0.85;
    return { ...costs, total: Math.round(total * regionMultiplier), annual: Math.round(total * regionMultiplier * 12) };
  },

  // ========== 31. BMI ==========
  bmi(height, weight) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    let category;
    if (bmi < 18.5) category = '저체중';
    else if (bmi < 23) category = '정상';
    else if (bmi < 25) category = '과체중';
    else if (bmi < 30) category = '비만';
    else category = '고도비만';

    const normalMin = Math.round(18.5 * heightM * heightM * 10) / 10;
    const normalMax = Math.round(23 * heightM * heightM * 10) / 10;
    return { bmi: Math.round(bmi * 10) / 10, category, normalMin, normalMax };
  },

  // ========== 32. 환율 ==========
  exchangeRate(amount, rate, direction = 'to_krw') {
    if (direction === 'to_krw') return { result: Math.round(amount * rate) };
    return { result: Math.round(amount / rate * 100) / 100 };
  },

  // ========== 33. 단위 변환 ==========
  unitConvert(value, from, to) {
    const conversions = {
      'km_mile': 0.621371, 'mile_km': 1.60934,
      'kg_lb': 2.20462, 'lb_kg': 0.453592,
      'm_ft': 3.28084, 'ft_m': 0.3048,
      'cm_inch': 0.393701, 'inch_cm': 2.54,
      'L_gal': 0.264172, 'gal_L': 3.78541,
      'pyeong_m2': 3.3058, 'm2_pyeong': 0.3025,
      'celsius_fahrenheit': (v) => v * 9/5 + 32,
      'fahrenheit_celsius': (v) => (v - 32) * 5/9,
    };
    const key = `${from}_${to}`;
    const conv = conversions[key];
    if (typeof conv === 'function') return { result: Math.round(conv(value) * 100) / 100 };
    if (conv) return { result: Math.round(value * conv * 100) / 100 };
    return { result: value };
  },

  // ========== 34. 팁/더치페이 ==========
  tipCalculator(totalAmount, tipPercent = 0, numPeople = 1) {
    const tip = Math.round(totalAmount * tipPercent / 100);
    const totalWithTip = totalAmount + tip;
    const perPerson = Math.ceil(totalWithTip / numPeople);
    return { tip, totalWithTip, perPerson };
  },

  // ========== 35. 날짜 계산기 (D-day) ==========
  dateCalculator(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const diffYears = end.getFullYear() - start.getFullYear();
    return { days: diffDays, weeks: diffWeeks, months: diffMonths, years: diffYears };
  },

  addDays(startDate, days) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
};
