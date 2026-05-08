/* ===== action-cards.js — 계산 결과 후 "다음에 함께 확인하면 좋은 계산" =====
 *
 * Phase 3-2A: 토스식 다음 행동 카드 — 최소 구현.
 *
 * 적용:
 *   <div class="action-cards" data-calculator="<id>"></div>
 *   또는 자동 마운트 — 페이지의 window.KC_CURRENT_SCHEMA?.id 또는 URL slug 로 calculator id 추정
 *
 * 카드 type:
 *   - "internal" : 관련 계산기 카드 (라벨 없음)
 *   - "official" : 공식 사이트 바로가기 (광고 아님, "공식 사이트" 라벨)
 *
 * 절대 X:
 *   - sponsor / affiliate 카드는 본 모듈에서 추가하지 않음
 *   - "정부 제휴", "공식 파트너", "정부24 광고", "홈택스 제휴" 표현 금지
 */

(function (global) {
  'use strict';

  var ACTION_CARDS = {
    'take-home-pay': [
      { type: 'internal', icon: '📋', title: '월급명세서로 공제 항목 더 보기',
        description: '실수령액에서 어떤 항목이 빠졌는지 자세히 확인하세요.',
        href: '/calculators/paystub.html' },
      { type: 'internal', icon: '🛡️', title: '4대보험 상세 계산하기',
        description: '근로자·사업주 부담을 분리해서 봅니다.',
        href: '/calculators/social-insurance.html' },
      { type: 'internal', icon: '🎒', title: '퇴직금 예상액 계산하기',
        description: '재직기간과 평균임금 기반으로 산출합니다.',
        href: '/calculators/severance-pay.html' }
    ],
    'social-insurance': [
      { type: 'internal', icon: '💵', title: '연봉 실수령액 계산하기',
        description: '4대보험과 세금 공제 후 월 실수령액 확인.',
        href: '/calculators/take-home-pay.html' },
      { type: 'internal', icon: '📋', title: '월급명세서 만들기',
        description: '지급/공제/실수령을 명세서 형식으로 봅니다.',
        href: '/calculators/paystub.html' },
      { type: 'internal', icon: '🏢', title: '사업주 총 인건비 보기',
        description: '직원 1명 채용 시 회사가 실제 부담하는 비용.',
        href: '/calculators/employer-cost.html' }
    ],
    'weekly-holiday-pay': [
      { type: 'internal', icon: '⏰', title: '시급 계산하기',
        description: '월급↔시급 환산을 1분 만에.',
        href: '/calculators/hourly-wage.html' },
      { type: 'internal', icon: '🌙', title: '연장/야간수당 계산하기',
        description: '연장·야간·휴일 근로의 가산수당.',
        href: '/calculators/overtime-pay.html' },
      { type: 'internal', icon: '💵', title: '월급 실수령액 계산하기',
        description: '연봉 기준 월 실수령액 산출.',
        href: '/calculators/take-home-pay.html' }
    ],
    'freelancer-tax': [
      { type: 'internal', icon: '🧾', title: '부가세 계산하기',
        description: '공급가액↔부가세 분리·합산.',
        href: '/calculators/vat.html' },
      { type: 'internal', icon: '📊', title: '종합소득세 확인하기',
        description: '5월 종합소득세 신고 시 정산.',
        href: '/calculators/income-tax.html' },
      { type: 'official', icon: '🏛️', title: '홈택스 공식 사이트 확인하기',
        description: '실제 신고와 납부는 홈택스에서 최종 확인하세요.',
        href: 'https://www.hometax.go.kr',
        external: true,
        sourceName: '홈택스' }
    ],
    'pension': [
      { type: 'internal', icon: '🛡️', title: '4대보험 통합 계산하기',
        description: '국민연금 외 건강보험·고용보험·장기요양도 함께.',
        href: '/calculators/social-insurance.html' },
      { type: 'internal', icon: '💵', title: '연봉 실수령액 계산하기',
        description: '국민연금 공제가 반영된 월 실수령액.',
        href: '/calculators/take-home-pay.html' },
      { type: 'official', icon: '🏛️', title: '국민연금공단 공식 사이트 확인하기',
        description: '실제 가입 내역과 예상 수령액은 공단에서 확인하세요.',
        href: 'https://www.nps.or.kr',
        external: true,
        sourceName: '국민연금공단' }
    ]
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCardHTML(card, calculatorId) {
    var labelHTML = card.type === 'official'
      ? '<span class="action-card-label official">공식 사이트</span>'
      : '<span class="action-card-label internal">관련 계산기</span>';
    var external = card.type === 'official' || card.external;
    var attrs = external
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';
    var dataAttrs = card.type === 'official'
      ? ' data-kc-action="official-link" data-link-name="' + escapeHtml(card.sourceName || '') + '"'
      : ' data-kc-action="related-calculator"';
    return [
      '<a class="action-card ' + escapeHtml(card.type) + '" href="' + escapeHtml(card.href) + '"',
      attrs,
      ' data-from-calculator="' + escapeHtml(calculatorId) + '"',
      dataAttrs + '>',
      labelHTML,
      '<div class="action-card-row">',
      '  <span class="action-card-icon" aria-hidden="true">' + escapeHtml(card.icon || '') + '</span>',
      '  <div class="action-card-body">',
      '    <h4 class="action-card-title">' + escapeHtml(card.title) + '</h4>',
      '    <p class="action-card-desc">' + escapeHtml(card.description) + '</p>',
      '  </div>',
      '  <span class="action-card-go" aria-hidden="true">→</span>',
      '</div>',
      '</a>'
    ].join('');
  }

  function detectCalculatorId(el) {
    if (el && el.dataset && el.dataset.calculator) return el.dataset.calculator;
    if (global.KC_CURRENT_SCHEMA && global.KC_CURRENT_SCHEMA.id) return global.KC_CURRENT_SCHEMA.id;
    var p = (location.pathname || '').toLowerCase();
    var m = p.match(/\/calculators\/([a-z0-9-]+)\.html$/);
    return m ? m[1] : null;
  }

  function mount(el) {
    if (!el || el.dataset.kcMounted === '1') return;
    var id = detectCalculatorId(el);
    if (!id) return;
    var cards = ACTION_CARDS[id];
    if (!cards || cards.length === 0) return;

    var html = [
      '<h3 class="action-cards-title">다음에 함께 확인하면 좋은 계산</h3>',
      '<div class="action-cards-grid">',
      cards.map(function (c) { return renderCardHTML(c, id); }).join(''),
      '</div>'
    ].join('');
    el.innerHTML = html;
    el.dataset.kcMounted = '1';

    el.addEventListener('click', function (e) {
      var anchor = e.target.closest('a.action-card');
      if (!anchor) return;
      if (global.KukmincalcEvents && typeof global.KukmincalcEvents.track === 'function') {
        var action = anchor.getAttribute('data-kc-action');
        var payload = {
          calculatorId: id,
          targetHref: anchor.getAttribute('href'),
          source: 'action-cards'
        };
        if (action === 'official-link') {
          global.KukmincalcEvents.track('official_link_clicked', Object.assign(payload, {
            linkName: anchor.getAttribute('data-link-name') || ''
          }));
        } else {
          global.KukmincalcEvents.track('related_calculator_clicked', payload);
        }
      }
    });
  }

  function autoMount() {
    var holders = document.querySelectorAll('.action-cards');
    if (holders.length === 0) {
      // 자동 삽입 — 결과 카드(.calculator-result 또는 #result) 뒤에 컨테이너 한 개 만들어 마운트
      var result = document.getElementById('result') || document.querySelector('.calculator-result');
      if (result && detectCalculatorId(null) && ACTION_CARDS[detectCalculatorId(null)]) {
        var holder = document.createElement('section');
        holder.className = 'action-cards';
        // 적용 기준 박스나 광고 슬롯 사이에 끼지 않도록 결과 카드 직후에 삽입
        if (result.nextSibling) result.parentNode.insertBefore(holder, result.nextSibling);
        else result.parentNode.appendChild(holder);
        holders = [holder];
      }
    }
    holders.forEach(mount);
  }

  function init() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoMount);
    } else {
      autoMount();
    }
  }

  global.KCActionCards = {
    init: init,
    mount: mount,
    autoMount: autoMount,
    DATA: ACTION_CARDS
  };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
