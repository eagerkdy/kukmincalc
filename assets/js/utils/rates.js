/* ===== utils/rates.js — getRatesByDate(date, calculatorType) ===== */
/* 계산 기준월에 따라 적용되는 요율/한도를 반환한다. */
/* 필요한 계산기 scope 의 항목만 추출하고, verified 가 아닌 항목은 warnings 로 모아 반환. */

(function (global) {
  'use strict';

  function parseDateISO(dateLike) {
    if (!dateLike) return new Date();
    if (dateLike instanceof Date) return dateLike;
    if (typeof dateLike === 'string') {
      // 'YYYY-MM' 또는 'YYYY-MM-DD' 모두 허용
      var s = dateLike.length === 7 ? dateLike + '-01' : dateLike;
      var d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }

  function isInRange(date, fromISO, toISO) {
    var t = date.getTime();
    var fromOk = !fromISO || t >= new Date(fromISO).getTime();
    var toOk = !toISO || t <= new Date(toISO + 'T23:59:59').getTime();
    return fromOk && toOk;
  }

  function pickPensionIncomeLimit(rates, date) {
    var limits = rates.pensionIncomeLimit || {};
    if (limits.julDec && isInRange(date, limits.julDec.effectiveFrom, limits.julDec.effectiveTo)) {
      return {
        floor: limits.julDec.floor,
        ceiling: limits.julDec.ceiling,
        period: 'julDec',
        display: limits.julDec.display,
        effectiveFrom: limits.julDec.effectiveFrom,
        effectiveTo: limits.julDec.effectiveTo
      };
    }
    if (limits.janJun && isInRange(date, limits.janJun.effectiveFrom, limits.janJun.effectiveTo)) {
      return {
        floor: limits.janJun.floor,
        ceiling: limits.janJun.ceiling,
        period: 'janJun',
        display: limits.janJun.display,
        effectiveFrom: limits.janJun.effectiveFrom,
        effectiveTo: limits.janJun.effectiveTo
      };
    }
    // fallback: jan~jun
    if (limits.janJun) {
      return {
        floor: limits.janJun.floor,
        ceiling: limits.janJun.ceiling,
        period: 'janJun',
        display: limits.janJun.display,
        effectiveFrom: limits.janJun.effectiveFrom,
        effectiveTo: limits.janJun.effectiveTo
      };
    }
    return null;
  }

  function buildWarnings(rates) {
    var warnings = [];
    var keys = Object.keys(rates || {});
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var item = rates[k];
      if (!item || typeof item !== 'object') continue;
      var status = item.verificationStatus;
      if (status && status !== 'verified' && status !== 'verified_or_table_based') {
        warnings.push({
          key: k,
          status: status,
          message: status === 'needs_official_source'
            ? (item.note || '공식 기준 확인 후 업데이트될 수 있습니다.')
            : (status === 'dynamic'
                ? '조건/시점에 따라 달라지는 동적 값입니다.'
                : (item.note || '검증 상태: ' + status))
        });
      }
    }
    return warnings;
  }

  function filterByScope(rates, calculatorType) {
    if (!calculatorType) return rates;
    var out = {};
    Object.keys(rates).forEach(function (k) {
      var v = rates[k];
      if (!v || typeof v !== 'object') return;
      var scope = v.calculatorScope;
      if (!scope || (Array.isArray(scope) && scope.indexOf(calculatorType) >= 0)) {
        out[k] = v;
      }
    });
    return out;
  }

  function getRatesByDate(dateLike, calculatorType) {
    var date = parseDateISO(dateLike);
    var iso = date.toISOString().slice(0, 10);
    var rates = global.KR_RATES_2026 || {};

    var scoped = filterByScope(rates, calculatorType);
    var pensionLimit = pickPensionIncomeLimit(rates, date);
    var rateVersion = 'KR-2026-' + iso.slice(0, 7);

    return {
      rateVersion: rateVersion,
      appliedDate: iso,
      pension: scoped.pension || null,
      pensionRateSchedule: scoped.pensionRateSchedule || null,
      pensionIncomeLimit: pensionLimit,
      healthInsurance: scoped.healthInsurance || null,
      longTermCare: scoped.longTermCare || null,
      industrialAccidentInsurance: scoped.industrialAccidentInsurance || null,
      employmentInsurance: scoped.employmentInsurance || null,
      minimumWage: scoped.minimumWage || null,
      weeklyHolidayPay: scoped.weeklyHolidayPay || null,
      mealAllowanceTaxFree: scoped.mealAllowanceTaxFree || null,
      severancePay: scoped.severancePay || null,
      lastVerifiedAt: '2026-05-05',
      warnings: buildWarnings(scoped)
    };
  }

  global.getRatesByDate = getRatesByDate;
})(typeof window !== 'undefined' ? window : globalThis);
