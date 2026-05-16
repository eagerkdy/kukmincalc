/* ===== analytics/event-tracker.js — Andy Grove Brain ===== */
/* 모든 핵심 행동을 측정 가능하게. GA4/Plausible/자체 로그로 추후 연결. */

(function (global) {
  'use strict';

  var DEBUG = false;
  try {
    DEBUG = location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1' ||
            location.search.indexOf('kcdebug=1') >= 0;
  } catch (e) {}

  var listeners = [];

  /* 이벤트 사전 (참고용 — track() 은 임의 eventName 도 허용) */
  var EVENTS = {
    calculator_started: 'calculator_started',
    calculator_completed: 'calculator_completed',
    related_calculator_clicked: 'related_calculator_clicked',
    official_link_clicked: 'official_link_clicked',
    popup_shown: 'popup_shown',
    popup_closed: 'popup_closed',
    popup_cta_clicked: 'popup_cta_clicked',
    ad_fallback_shown: 'ad_fallback_shown',
    adblock_detected: 'adblock_detected',
    adblock_notice_closed: 'adblock_notice_closed',
    share_clicked: 'share_clicked',
    recent_calculation_restored: 'recent_calculation_restored'
  };

  function track(eventName, payload) {
    if (!eventName) return;
    var ev = {
      name: eventName,
      payload: payload || {},
      timestamp: new Date().toISOString()
    };
    if (DEBUG) {
      try { console.debug('[KC]', eventName, payload); } catch (e) {}
    }
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](ev); } catch (e) {}
    }
    // Phase 3-5B: GA4 송신은 KCAnalytics 단일 게이트웨이로 위임 (PII/원문금액 가드 + 공통 page 파라미터).
    // KCAnalytics 미로드 환경에서는 기존 동작(gtag 직접 호출) 유지.
    if (global.KCAnalytics && typeof global.KCAnalytics.track === 'function') {
      try { global.KCAnalytics.track(eventName, payload || {}); } catch (e) {}
    } else if (typeof global.gtag === 'function') {
      try { global.gtag('event', eventName, payload || {}); } catch (e) {}
    }
  }

  function on(handler) {
    if (typeof handler === 'function') listeners.push(handler);
  }

  global.KukmincalcEvents = {
    track: track,
    on: on,
    EVENTS: EVENTS,
    isDebug: function () { return DEBUG; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
