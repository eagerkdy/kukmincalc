/* ===== ads/ad-manager.js — 광고 슬롯 매니저 + fallback ===== */
/* 모든 .ad-slot 의 placeholder 텍스트를 사용자 화면에서 제거.
 * AdSense Auto Ads 가 채우면 그대로 두고, 비어있으면 fallback 카드. */

(function (global) {
  'use strict';

  /* placeholder 텍스트 패턴 — 광고가 로드되기 전 사용자에게 보이지 않게 함 */
  function clearPlaceholderText(el) {
    if (!el) return;
    var children = Array.from(el.childNodes);
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      if (node.nodeType === Node.TEXT_NODE) {
        var t = (node.nodeValue || '').trim();
        if (/^광고\s*영역$/.test(t) || /광고\s*영역/.test(t)) {
          node.nodeValue = '';
        }
      }
    }
  }

  function categoryFromPage() {
    /* schema 가 우선, 없으면 URL 휴리스틱 */
    if (global.KC_PAGE_CATEGORY) return global.KC_PAGE_CATEGORY;
    var schema = global.KC_CURRENT_SCHEMA;
    if (schema && schema.adCategory) return schema.adCategory;
    var p = (location.pathname || '').toLowerCase();
    if (/take-home-pay|hourly-wage|severance-pay|pension|unemployment|paystub|social-insurance|employer-cost|weekly-holiday-pay/.test(p)) return 'salary';
    if (/freelancer-tax|income-tax|vat|capital-gains|gift-tax|inheritance-tax|acquisition-tax|property-tax|comprehensive-property/.test(p)) return 'tax';
    if (/health-insurance|employment-insurance|industrial-insurance/.test(p)) return 'salary';
    if (/mortgage|dsr|rent-to-deposit|moving|remodel/.test(p)) return 'realEstate';
    if (/car-cost|car-tax/.test(p)) return 'car';
    if (/overtime|annual-leave|hourly-wage/.test(p)) return 'labor';
    return 'salary';
  }

  function renderFallback(el, category) {
    var map = (global.KC_AD_CATEGORY_MAP || {})[category] || {};
    var officialKeys = map.officialLinks || [];
    var officialDict = global.KC_OFFICIAL_LINKS || {};
    if (!officialKeys.length) {
      el.style.minHeight = '0';
      el.innerHTML = '';
      el.setAttribute('data-kc-empty', '1');
      return;
    }
    var linksHTML = officialKeys.slice(0, 4).map(function (key) {
      var link = officialDict[key];
      if (!link) return '';
      return '<a class="kc-fallback-link" href="' + link.url + '" target="_blank" ' +
             'rel="noopener noreferrer" data-kc-action="official-link" ' +
             'data-link-name="' + link.name + '">' + link.name + ' →</a>';
    }).filter(Boolean).join('');
    el.innerHTML =
      '<div class="kc-fallback-card">' +
      '  <div class="kc-fallback-label">공식 사이트 바로가기</div>' +
      '  <div class="kc-fallback-desc">계산 결과는 공식 기관에서 최종 확인하실 수 있습니다.</div>' +
      '  <div class="kc-fallback-links">' + linksHTML + '</div>' +
      '</div>';
    el.setAttribute('data-kc-fallback', '1');
    if (global.KukmincalcEvents) global.KukmincalcEvents.track('ad_fallback_shown', {
      category: category, slotKey: el.getAttribute('data-slot-key') || ''
    });
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.matches && t.matches('[data-kc-action="official-link"]')) {
        if (global.KukmincalcEvents) global.KukmincalcEvents.track('official_link_clicked', {
          linkName: t.getAttribute('data-link-name'), source: 'ad_fallback'
        });
      }
    });
  }

  function processSlots() {
    var slots = document.querySelectorAll('.ad-slot');
    var category = categoryFromPage();
    slots.forEach(function (el) {
      clearPlaceholderText(el);
      // AdSense Auto Ads 가 별도로 채울 수 있도록 살짝 기다린 뒤 fallback 검사
      setTimeout(function () {
        // 광고 노드 / iframe 이 들어왔는지 검사
        var hasAd = el.querySelector('ins.adsbygoogle, iframe, .google-auto-placed') ||
                    el.children.length > 0;
        if (!hasAd) {
          renderFallback(el, category);
        }
      }, 1500);
    });
  }

  function init() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    processSlots();
  }

  global.KCAdManager = {
    init: init,
    processSlots: processSlots,
    renderFallback: renderFallback,
    clearPlaceholderText: clearPlaceholderText
  };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
