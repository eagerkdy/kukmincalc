/* ===== recent-calculations.js — 최근 계산 기록 (localStorage 기반) =====
 *
 * Phase 3-3A: 캐시워크식 내 숫자 집계 / 최근 계산 대시보드 1차.
 *
 * 핵심:
 *   - localStorage 만 사용 (서버/계정/쿠키/로그인 X)
 *   - 최대 10개 보관
 *   - 같은 calculatorId 새 저장 시 옛 항목 제거 후 최상단 추가
 *   - 민감/식별 정보 저장 금지 (이름/전화/주민번호/생년월일 등)
 *   - localStorage unavailable 환경에서는 silent (사용자 화면 노출 X)
 *
 * 공개 API:
 *   window.KCRecentCalculations.save(record)
 *   window.KCRecentCalculations.list()
 *   window.KCRecentCalculations.clear()
 *   window.KCRecentCalculations.renderHome(targetEl)
 *   window.KCRecentCalculations.renderSavedFeedback(holderEl, calculatorName)
 */

(function (global) {
  'use strict';

  var STORAGE_KEY = 'kc_recent_calculations';
  var MAX_ITEMS = 10;

  function safeStorage() {
    try {
      var t = '__kc_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  function readAll() {
    var s = safeStorage();
    if (!s) return [];
    try {
      var raw = s.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(arr) {
    var s = safeStorage();
    if (!s) return false;
    try {
      s.setItem(STORAGE_KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function genId() {
    return 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  /* 사용자가 직접 입력한 숫자만 저장. 라벨/요약 문구만 보관. */
  function save(record) {
    if (!record || !record.calculatorId) return false;
    var items = readAll();
    // 같은 calculatorId 의 옛 기록 제거 (최신 1개만 유지)
    items = items.filter(function (x) { return x && x.calculatorId !== record.calculatorId; });

    var entry = {
      id: record.id || genId(),
      calculatorId: String(record.calculatorId),
      calculatorName: String(record.calculatorName || ''),
      summaryTitle: String(record.summaryTitle || ''),
      summaryValue: String(record.summaryValue || ''),
      subText: String(record.subText || ''),
      href: String(record.href || ('/calculators/' + record.calculatorId + '.html')),
      type: String(record.type || ''),
      createdAt: new Date().toISOString()
    };
    items.unshift(entry);
    if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
    writeAll(items);

    if (global.KukmincalcEvents && typeof global.KukmincalcEvents.track === 'function') {
      try {
        global.KukmincalcEvents.track('recent_calculation_saved', {
          calculatorId: entry.calculatorId,
          type: entry.type
        });
      } catch (e) {}
    }
    return true;
  }

  function list() {
    return readAll();
  }

  function clear() {
    var s = safeStorage();
    if (!s) return false;
    var prevCount = 0;
    try { prevCount = readAll().length; } catch (e) {}
    var ok = false;
    try { s.removeItem(STORAGE_KEY); ok = true; } catch (e) {}
    if (ok && global.KukmincalcEvents && typeof global.KukmincalcEvents.track === 'function') {
      try {
        global.KukmincalcEvents.track('recent_calculations_cleared', {
          count_bucket: prevCount === 0 ? '0' : (prevCount < 3 ? '1_2' : (prevCount < 6 ? '3_5' : '6_plus'))
        });
      } catch (e) {}
    }
    return ok;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function timeAgo(iso) {
    try {
      var diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return '방금 전';
      if (diff < 3600) return Math.floor(diff / 60) + '분 전';
      if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
      var days = Math.floor(diff / 86400);
      if (days < 30) return days + '일 전';
      return new Date(iso).toLocaleDateString('ko-KR');
    } catch (e) { return ''; }
  }

  function renderHome(targetEl) {
    if (!targetEl) return;
    var items = list();
    if (items.length === 0) {
      targetEl.innerHTML = [
        '<div class="recent-calc-empty">',
        '  <div class="recent-calc-empty-title">최근 계산한 내역이 없습니다</div>',
        '  <div class="recent-calc-empty-desc">먼저 계산기를 사용해보세요. 계산 결과는 이 영역에 자동으로 보관됩니다.</div>',
        '</div>'
      ].join('');
      targetEl.setAttribute('data-kc-empty', '1');
      return;
    }
    targetEl.removeAttribute('data-kc-empty');
    var cardsHtml = items.map(function (e) {
      return [
        '<a class="recent-calc-card" href="' + escapeHtml(e.href) + '" data-kc-action="recent-calculation-restored" data-calculator-id="' + escapeHtml(e.calculatorId) + '">',
        '  <div class="recent-calc-name">' + escapeHtml(e.calculatorName) + '</div>',
        '  <div class="recent-calc-value">' + escapeHtml(e.summaryValue) + '</div>',
        e.subText ? '<div class="recent-calc-sub">' + escapeHtml(e.subText) + '</div>' : '',
        '  <div class="recent-calc-meta">',
        '    <span class="recent-calc-time">' + escapeHtml(timeAgo(e.createdAt)) + '</span>',
        '    <span class="recent-calc-go">다시 계산하기 →</span>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
    targetEl.innerHTML = [
      '<div class="recent-calc-list">' + cardsHtml + '</div>',
      '<div class="recent-calc-footer">',
      '  <a class="recent-calc-allcalcs" href="#categorySections">전체 계산기 보기 →</a>',
      '  <button class="recent-calc-clear" type="button" data-kc-action="clear-recent">기록 지우기</button>',
      '</div>'
    ].join('');

    // event delegation
    targetEl.addEventListener('click', function (e) {
      var clr = e.target.closest('[data-kc-action="clear-recent"]');
      if (clr) {
        e.preventDefault();
        clear();
        renderHome(targetEl);
        return;
      }
      var card = e.target.closest('.recent-calc-card');
      if (card && global.KukmincalcEvents) {
        try {
          global.KukmincalcEvents.track('recent_calculation_restored', {
            calculatorId: card.getAttribute('data-calculator-id') || '',
            href: card.getAttribute('href')
          });
        } catch (er) {}
      }
    });
  }

  /* 결과 페이지 하단의 작은 피드백. 1.5초 후 자동 fade. */
  function renderSavedFeedback(holderEl, calculatorName) {
    if (!holderEl) return;
    var msg = document.createElement('div');
    msg.className = 'recent-calc-saved-feedback';
    msg.innerHTML =
      '<span class="recent-calc-saved-icon" aria-hidden="true">✓</span>' +
      '<span class="recent-calc-saved-text">최근 계산에 저장되었습니다. 홈에서 다시 확인할 수 있어요.</span>';
    // 같은 메시지 중복 방지
    var existing = holderEl.querySelector('.recent-calc-saved-feedback');
    if (existing) existing.remove();
    holderEl.appendChild(msg);
    setTimeout(function () {
      msg.classList.add('fade-out');
      setTimeout(function () { msg.remove(); }, 800);
    }, 4000);
  }

  /* 자동 마운트 — 홈 페이지에서 #recentCalculations 영역에 렌더 */
  function autoMount() {
    var el = document.getElementById('recentCalculations');
    if (el) renderHome(el);
  }

  function init() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoMount);
    } else {
      autoMount();
    }
  }

  global.KCRecentCalculations = {
    save: save,
    list: list,
    clear: clear,
    renderHome: renderHome,
    renderSavedFeedback: renderSavedFeedback,
    STORAGE_KEY: STORAGE_KEY,
    MAX_ITEMS: MAX_ITEMS
  };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
