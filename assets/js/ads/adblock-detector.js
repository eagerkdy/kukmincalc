/* ===== ads/adblock-detector.js — OP.GG식 차단 감지 ===== */
/* 우회 금지. 안내만. 계산 기능 차단 절대 금지. */

(function (global) {
  'use strict';

  var STATE_KEY = 'kukmincalc_adblock_state';
  var NOTICE_KEY = 'kukmincalc_adblock_notice_closed_until';

  function isBlocked() {
    return new Promise(function (resolve) {
      var bait = document.createElement('div');
      bait.className = 'adsbox ad ad-banner ads ad-placeholder';
      bait.style.cssText = 'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);
      setTimeout(function () {
        var blocked = !bait.offsetParent || bait.offsetHeight === 0 || bait.offsetWidth === 0;
        // 추가 시그널: adsbygoogle SDK 미로드
        if (!blocked) {
          var sdkLoaded = !!document.querySelector('script[src*="adsbygoogle.js"]');
          var sdkRunning = typeof global.adsbygoogle !== 'undefined';
          if (sdkLoaded && !sdkRunning) blocked = true;
        }
        try { document.body.removeChild(bait); } catch (e) {}
        resolve(blocked);
      }, 200);
    });
  }

  function noticeSuppressedUntil() {
    try {
      var until = parseInt(localStorage.getItem(NOTICE_KEY) || '0', 10);
      return until > Date.now();
    } catch (e) { return false; }
  }

  function suppressNoticeForDays(days) {
    try {
      var until = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(NOTICE_KEY, String(until));
    } catch (e) {}
  }

  function showNotice() {
    if (noticeSuppressedUntil()) return;
    if (document.getElementById('kc-adblock-notice')) return;

    var modal = document.createElement('div');
    modal.id = 'kc-adblock-notice';
    modal.className = 'kc-popup kc-popup-adblock';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = [
      '<div class="kc-popup-backdrop" data-kc-close="1"></div>',
      '<div class="kc-popup-card">',
      '  <button class="kc-popup-close" aria-label="닫기" data-kc-close="1">&times;</button>',
      '  <div class="kc-popup-label">서비스 운영 안내</div>',
      '  <h3 class="kc-popup-title">광고 차단이 감지되었습니다</h3>',
      '  <p class="kc-popup-desc">Kukmincalc는 무료 계산기 서비스를 광고 수익으로 운영하고 있습니다. 광고를 허용해주시면 서비스 운영에 도움이 됩니다.</p>',
      '  <div class="kc-popup-actions">',
      '    <a class="kc-popup-cta" href="https://support.google.com/adsense/answer/10527?hl=ko" target="_blank" rel="noopener noreferrer" data-kc-action="learn">광고 허용 방법 보기</a>',
      '    <button class="kc-popup-btn" data-kc-close="1">계속 이용하기</button>',
      '    <button class="kc-popup-btn ghost" data-kc-suppress="7">오늘 다시 보지 않기</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);

    if (global.KukmincalcEvents) global.KukmincalcEvents.track('adblock_detected', { url: location.pathname });
    if (global.KukmincalcEvents) global.KukmincalcEvents.track('popup_shown', { campaignId: 'adblock_notice', triggerType: 'adblock_detect' });

    function close() {
      modal.remove();
      if (global.KukmincalcEvents) global.KukmincalcEvents.track('popup_closed', { campaignId: 'adblock_notice' });
    }

    modal.addEventListener('click', function (e) {
      var target = e.target;
      if (target.matches('[data-kc-close]')) {
        close();
      } else if (target.matches('[data-kc-suppress]')) {
        var days = parseInt(target.getAttribute('data-kc-suppress'), 10) || 7;
        suppressNoticeForDays(days);
        if (global.KukmincalcEvents) global.KukmincalcEvents.track('adblock_notice_closed', { days: days });
        close();
      } else if (target.matches('[data-kc-action="learn"]')) {
        if (global.KukmincalcEvents) global.KukmincalcEvents.track('popup_cta_clicked', { campaignId: 'adblock_notice', cta: 'learn' });
      }
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    });
  }

  /* 노출 조건: 첫 진입 즉시 X. 계산 완료 / 10초 체류 / 두 번째 페이지 중 하나. */
  function maybeShowNoticeAfterTrigger(trigger) {
    if (!global.__KC_ADBLOCK_BLOCKED__) return;
    if (noticeSuppressedUntil()) return;
    showNotice();
  }

  function init() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    isBlocked().then(function (blocked) {
      global.__KC_ADBLOCK_BLOCKED__ = blocked;
      try {
        if (blocked) localStorage.setItem(STATE_KEY, '1');
        else localStorage.removeItem(STATE_KEY);
      } catch (e) {}
      // 두 번째 페이지 진입 + 차단 → 즉시 안내
      try {
        var visitCount = parseInt(localStorage.getItem('kukmincalc_visit_count') || '0', 10);
        localStorage.setItem('kukmincalc_visit_count', String(visitCount + 1));
        if (blocked && visitCount >= 1) {
          setTimeout(function () { maybeShowNoticeAfterTrigger('second_page'); }, 800);
        } else if (blocked) {
          setTimeout(function () { maybeShowNoticeAfterTrigger('page_delay_10s'); }, 10000);
        }
      } catch (e) {}
    });
  }

  global.KCAdblockDetector = {
    init: init,
    isBlocked: function () { return !!global.__KC_ADBLOCK_BLOCKED__; },
    showNotice: showNotice,
    maybeShow: maybeShowNoticeAfterTrigger
  };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
