/* ===== analytics.js — KCAnalytics (Phase 3-5B) =====
 *
 * 단일 GA4 게이트웨이. 모든 측정은 이 파일을 거친다.
 *
 * 책임:
 *   - PII 가드 (이름/전화/이메일/주민번호/주소 등 자동 strip)
 *   - 금액 원문 차단 (raw 금액 키 자동 strip — bucket 값만 통과)
 *   - 공통 page 파라미터 자동 첨부 (page_path / page_type / page_calc_id / app_version)
 *   - 자동 click hook (가이드 페이지 CTA / 관련 계산기 / 공식 사이트)
 *   - 자동 계산기 행동 hook (calculator_started / calculator_result_viewed)
 *
 * 비책임 (다른 모듈이 처리):
 *   - 홈 hero_cta_clicked         — index.html 인라인 트래커 (KukmincalcEvents.track 경로)
 *   - 계산기 action-cards 클릭     — action-cards.js (KukmincalcEvents.track 경로)
 *   - 최근 계산 save/restore       — recent-calculations.js (KukmincalcEvents.track 경로)
 *
 * 게이트웨이 경로:
 *   KukmincalcEvents.track  ──┐
 *                             ├──► KCAnalytics.track ──► gtag('event', ...)
 *   KCAnalytics 자체 hook   ──┘
 *
 * silent fail: gtag 미로드/차단 환경에서도 콘솔 에러 0건.
 * 광고: AdSense 코드와 무관. ca-pub-6481387413747515 변경 금지 (이 파일은 광고에 손대지 않는다).
 */

(function (global) {
  'use strict';

  var GA_ID = 'G-DRYL72PPZ0';

  var DEBUG = false;
  try {
    DEBUG = location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1' ||
            location.search.indexOf('kcdebug=1') >= 0;
  } catch (e) {}

  /* ---------- PII / 원문 금액 가드 ---------- */

  // params 키 이름이 아래 토큰 중 하나라도 포함하면 즉시 strip.
  var PII_TOKENS = [
    'name', 'firstname', 'lastname', 'fullname',
    'phone', 'tel', 'mobile', 'fax',
    'email', 'mail',
    'ssn', 'rrn', 'jumin', 'birth', 'dob',
    'address', 'addr', 'zipcode',
    'account', 'bankaccount', 'card', 'creditcard',
    'ip', 'userid', 'user_id'
  ];

  // 금액 원문 키 — bucket suffix(`_bucket`) 또는 명시 라벨이 아니면 strip.
  var RAW_AMOUNT_TOKENS = [
    'salary', 'income', 'wage', 'monthlypay', 'monthly_pay',
    'amount', 'price', 'cost', 'fee',
    'tax', 'taxamount', 'taxableincome',
    'deposit', 'principal', 'loan'
  ];

  // 허용 키 — page param 류는 통과.
  var ALWAYS_ALLOW = {
    page_path: 1, page_type: 1, page_calc_id: 1,
    app_version: 1, debug_mode: 1
  };

  function isPiiKey(key) {
    var k = String(key || '').toLowerCase();
    for (var i = 0; i < PII_TOKENS.length; i++) {
      if (k.indexOf(PII_TOKENS[i]) >= 0) return true;
    }
    return false;
  }

  function isRawAmountKey(key) {
    var k = String(key || '').toLowerCase();
    // *_bucket / bucket / amount_bucket 등 bucket 키는 허용
    if (k.indexOf('bucket') >= 0) return false;
    // _label, _type, _id, _slug, _name 등 메타 키는 허용
    if (/_(?:label|type|id|slug|name|position|kind|category|status)$/.test(k)) return false;
    for (var i = 0; i < RAW_AMOUNT_TOKENS.length; i++) {
      if (k === RAW_AMOUNT_TOKENS[i]) return true;
    }
    return false;
  }

  function sanitize(params) {
    var out = {};
    if (!params || typeof params !== 'object') return out;
    Object.keys(params).forEach(function (k) {
      if (ALWAYS_ALLOW[k]) { out[k] = params[k]; return; }
      if (isPiiKey(k)) return;
      if (isRawAmountKey(k)) return;
      var v = params[k];
      if (v === null || v === undefined) return;
      // GA4 권장: scalar 만. 객체/배열은 평탄화 또는 strip.
      if (typeof v === 'object') return;
      // 너무 긴 문자열은 자른다 (GA4 100자 권장)
      if (typeof v === 'string' && v.length > 100) v = v.slice(0, 100);
      out[k] = v;
    });
    return out;
  }

  /* ---------- 공통 page 파라미터 ---------- */

  function detectPageType(path) {
    if (/^\/calculators\//.test(path)) return 'calculator';
    if (/^\/guides\//.test(path)) return 'guide';
    if (path === '/' || /\/index\.html$/.test(path)) return 'home';
    if (/^\/legal\//.test(path)) return 'legal';
    if (/^\/docs\//.test(path)) return 'docs';
    if (/^\/tests\//.test(path)) return 'test';
    return 'other';
  }

  function detectCalcId(path) {
    var m1 = path.match(/^\/calculators\/([a-z0-9-]+)\.html$/i);
    if (m1) return m1[1];
    var m2 = path.match(/^\/guides\/([a-z0-9-]+)\.html$/i);
    if (m2) return m2[1];
    return '';
  }

  function commonParams() {
    var p;
    try { p = location.pathname || '/'; } catch (e) { p = '/'; }
    return {
      page_path: p,
      page_type: detectPageType(p),
      page_calc_id: detectCalcId(p),
      app_version: (global.KR_RATES_2026 && global.KR_RATES_2026.version) || 'KR-2026'
    };
  }

  /* ---------- 페이지 단위 dedupe 가드 (Phase 3-5B follow-up) ---------- */
  // 일부 이벤트는 같은 페이지 안에서 둘 이상의 진입점(인라인 호출 + KCAnalytics 자동 hook)에서
  // 호출될 수 있어 GA4 카운트가 부풀어진다. 아래 정책 테이블에 등록된 이벤트는
  // (eventName, dedupeKey) 단위로 페이지 로드당 1회만 송신한다.
  //
  // dedupeKey 우선순위:
  //   1) URL 추정 calculator_id (가장 안정 — 키 이름 다름에도 동일 페이지면 동일 key)
  //   2) params.calculator_id (snake_case)
  //   3) params.calculatorId  (camelCase, 기존 인라인 호출 호환)
  //   4) '__'                  (식별 불가 시 페이지 단일 키)
  var ONCE_PER_PAGE = { calculator_started: true };
  var _firedOncePerPage = {};

  function dedupeKeyOf(params) {
    var fromPath;
    try { fromPath = detectCalcId(location.pathname || ''); } catch (e) { fromPath = ''; }
    if (fromPath) return fromPath;
    if (params && (params.calculator_id || params.calculatorId)) {
      return params.calculator_id || params.calculatorId;
    }
    return '__';
  }

  function shouldDedupe(eventName, params) {
    if (!ONCE_PER_PAGE[eventName]) return false;
    var key = dedupeKeyOf(params);
    if (!_firedOncePerPage[eventName]) _firedOncePerPage[eventName] = {};
    if (_firedOncePerPage[eventName][key]) return true;
    _firedOncePerPage[eventName][key] = true;
    return false;
  }

  /* ---------- 송신 ---------- */

  function track(eventName, params) {
    if (!eventName) return;
    if (shouldDedupe(eventName, params)) return;
    var clean = sanitize(params || {});
    var merged = {};
    var cp = commonParams();
    Object.keys(cp).forEach(function (k) { merged[k] = cp[k]; });
    Object.keys(clean).forEach(function (k) { merged[k] = clean[k]; });

    if (DEBUG) {
      try { console.debug('[KCA]', eventName, merged); } catch (e) {}
    }
    if (typeof global.gtag === 'function') {
      try { global.gtag('event', eventName, merged); } catch (e) {}
    }
  }

  function pageView(extra) {
    track('page_view', extra || {});
  }

  function ready() {
    return typeof global.gtag === 'function';
  }

  /* ---------- 버킷화 ---------- */

  // salary: 연봉(만원) → 버킷
  // monthly: 월급(만원) → 버킷
  // tax_amount: 세액(만원) → 버킷
  // generic: 원 단위 임의 금액 → 버킷
  var BUCKETS = {
    salary: [
      { lt: 3000, label: 'under_3000' },
      { lt: 4000, label: '3000_4000' },
      { lt: 5000, label: '4000_5000' },
      { lt: 7000, label: '5000_7000' },
      { lt: 10000, label: '7000_10000' },
      { lt: Infinity, label: 'over_10000' }
    ],
    monthly: [
      { lt: 200, label: 'under_200' },
      { lt: 300, label: '200_300' },
      { lt: 400, label: '300_400' },
      { lt: 500, label: '400_500' },
      { lt: Infinity, label: '500_plus' }
    ],
    tax_amount: [
      { lt: 1, label: 'under_1' },
      { lt: 5, label: '1_5' },
      { lt: 10, label: '5_10' },
      { lt: 30, label: '10_30' },
      { lt: Infinity, label: '30_plus' }
    ],
    generic: [
      { lt: 10000, label: 'under_1man' },
      { lt: 100000, label: '1_10man' },
      { lt: 1000000, label: '10_100man' },
      { lt: 10000000, label: '100_1000man' },
      { lt: Infinity, label: 'over_1000man' }
    ]
  };

  function bucketizeAmount(value, type) {
    if (value === null || value === undefined || isNaN(value)) return 'unknown';
    var n = Number(value);
    if (!isFinite(n)) return 'unknown';
    var table = BUCKETS[type] || BUCKETS.generic;
    for (var i = 0; i < table.length; i++) {
      if (n < table[i].lt) return table[i].label;
    }
    return 'unknown';
  }

  /* ---------- 자동 hook: 가이드 페이지 ---------- */

  function currentGuideSlug() {
    try {
      var m = (location.pathname || '').match(/\/guides\/([^/]+)\.html$/);
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }

  function extractCalcFromHref(href) {
    var m = String(href || '').match(/\/calculators\/([a-z0-9-]+)\.html/i);
    return m ? m[1] : '';
  }

  function hostnameOf(href) {
    try { return new URL(href, location.href).hostname.replace(/^www\./, ''); }
    catch (e) { return ''; }
  }

  function bindGuideHooks() {
    if (!/^\/guides\//.test(location.pathname || '')) return;

    var allCtas = Array.prototype.slice.call(document.querySelectorAll('.guide-cta'));

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var slug = currentGuideSlug();

      // 1) .guide-cta (계산기 CTA)
      if (a.classList && a.classList.contains('guide-cta')) {
        var idx = allCtas.indexOf(a);
        var pos = 'middle';
        if (allCtas.length > 0) {
          if (idx === 0) pos = 'top';
          else if (idx === allCtas.length - 1) pos = 'bottom';
        }
        track('guide_cta_clicked', {
          guide_slug: slug,
          target_calculator: extractCalcFromHref(a.getAttribute('href') || ''),
          cta_position: pos
        });
        return;
      }

      // 2) .guide-related .guide-card (관련 계산기)
      if (a.classList && a.classList.contains('guide-card') && a.closest('.guide-related')) {
        track('guide_related_calculator_clicked', {
          guide_slug: slug,
          target_calculator: extractCalcFromHref(a.getAttribute('href') || '')
        });
        return;
      }

      // 3) .guide-official .guide-card (공식 사이트 외부 링크)
      if (a.classList && a.classList.contains('guide-card') && a.closest('.guide-official')) {
        track('guide_official_link_clicked', {
          guide_slug: slug,
          official_site: hostnameOf(a.getAttribute('href') || '')
        });
        return;
      }
    }, true);
  }

  /* ---------- 자동 hook: 계산기 페이지 ---------- */

  function bindCalculatorHooks() {
    if (!/^\/calculators\//.test(location.pathname || '')) return;
    var calcId = detectCalcId(location.pathname || '');
    if (!calcId) return;

    var started = false;
    function fireStarted() {
      if (started) return;
      started = true;
      track('calculator_started', { calculator_id: calcId });
    }

    var inputs = document.querySelectorAll('.calculator-input input, .calculator-input select');
    if (!inputs || inputs.length === 0) {
      // calculator-input 컨테이너 패턴이 아닌 페이지 — fallback: <input>/<select> any
      inputs = document.querySelectorAll('main input, main select');
    }
    Array.prototype.forEach.call(inputs, function (el) {
      el.addEventListener('input', fireStarted);
      el.addEventListener('change', fireStarted);
    });

    // result 영역의 변화 감지 → calculator_result_viewed (debounce 800ms)
    var result = document.getElementById('result') || document.querySelector('.calculator-result');
    if (result && typeof MutationObserver === 'function') {
      var debounceTimer = null;
      var firedAtLeastOnce = false;
      var observer = new MutationObserver(function () {
        if (!started) return; // 사용자가 입력 변경하기 전 자동 초기 계산은 제외
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          firedAtLeastOnce = true;
          track('calculator_result_viewed', { calculator_id: calcId });
        }, 800);
      });
      try {
        observer.observe(result, { childList: true, subtree: true, characterData: true });
      } catch (e) {}
    }
  }

  /* ---------- 초기화 ---------- */

  function init() {
    bindGuideHooks();
    bindCalculatorHooks();
    // page_view 는 gtag config 호출에서 자동 발생 — 별도 전송 안 함.
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  /* ---------- 공개 API ---------- */

  global.KCAnalytics = {
    track: track,
    pageView: pageView,
    ready: ready,
    bucketizeAmount: bucketizeAmount,
    sanitize: sanitize,
    commonParams: commonParams,
    GA_ID: GA_ID
  };
})(typeof window !== 'undefined' ? window : globalThis);
