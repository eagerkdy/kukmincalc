/* ===== utils/rounding.js — 원 단위 처리 유틸 ===== */
/* roundByRule(amount, ruleKey) 로 KR_ROUNDING_RULES 적용. */

(function (global) {
  'use strict';

  function floorToUnit(amount, unit) {
    if (!unit || unit <= 1) return Math.floor(amount);
    return Math.floor(amount / unit) * unit;
  }

  function roundToUnit(amount, unit) {
    if (!unit || unit <= 1) return Math.round(amount);
    return Math.round(amount / unit) * unit;
  }

  function ceilToUnit(amount, unit) {
    if (!unit || unit <= 1) return Math.ceil(amount);
    return Math.ceil(amount / unit) * unit;
  }

  function roundByRule(amount, ruleKey) {
    var rules = global.KR_ROUNDING_RULES || {};
    var rule = rules[ruleKey];
    if (!rule) return Math.round(amount);
    var unit = rule.unit || 1;
    switch (rule.method) {
      case 'floor': return floorToUnit(amount, unit);
      case 'ceil': return ceilToUnit(amount, unit);
      case 'round': return roundToUnit(amount, unit);
      case 'none': return amount;
      case 'table': return Math.round(amount); // 간이세액표는 별도 lookup, 여기선 fallback
      default: return Math.round(amount);
    }
  }

  global.floorToUnit = floorToUnit;
  global.roundToUnit = roundToUnit;
  global.ceilToUnit = ceilToUnit;
  global.roundByRule = roundByRule;
})(typeof window !== 'undefined' ? window : globalThis);
