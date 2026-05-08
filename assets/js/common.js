/* ===== common.js - 공통 유틸리티 ===== */

// 애드센스 Auto Ads 자동 주입 (변경 금지 — ca-pub-6481387413747515)
(function() {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6481387413747515';
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
})();

// ===== Phase 2: 광고/팝업/측정 시스템 자동 로딩 =====
// common.js 가 로드되는 모든 페이지에 광고 fallback / 팝업 / 측정 훅이 따라온다.
// 광고 placeholder 텍스트를 사용자 화면에서 즉시 무력화 + ad-manager 가 fallback 처리.
(function () {
  function pathPrefix() {
    // /calculators/foo.html -> ../assets, / 또는 /index.html -> assets
    var p = location.pathname || '/';
    if (/\/(calculators|guides|blog|articles|legal|docs|tests|api)\//i.test(p)) return '../';
    return '';
  }
  var base = pathPrefix() + 'assets/';
  function appendLink(href) {
    if (document.querySelector('link[href$="' + href.replace(base, '') + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }
  function appendScript(src) {
    if (document.querySelector('script[src$="' + src.replace(base, '') + '"]')) return;
    var s = document.createElement('script'); s.src = src; s.defer = true;
    document.head.appendChild(s);
  }
  appendLink(base + 'css/ads.css');
  appendLink(base + 'css/popup-ads.css');
  // 분석/광고 모듈 — 의존 순서: event-tracker → ad-slots → campaigns → popup → ad-manager → adblock → inserter
  appendScript(base + 'js/analytics/event-tracker.js');
  appendScript(base + 'js/ads/ad-slots.js');
  appendScript(base + 'js/ads/campaigns.js');
  appendScript(base + 'js/ads/popup-manager.js');
  appendScript(base + 'js/ads/ad-manager.js');
  appendScript(base + 'js/ads/adblock-detector.js');
  appendScript(base + 'js/ads/in-content-ad-inserter.js');
})();

// 숫자 포맷 (콤마)
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('ko-KR');
}

// 원 단위 포맷 (예: 1억 2,345만원)
function formatKRW(num) {
  if (!num || isNaN(num)) return '0원';
  num = Math.round(num);
  if (num >= 100000000) {
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${formatNumber(man)}만원` : `${eok}억원`;
  }
  if (num >= 10000) {
    const man = Math.floor(num / 10000);
    return `${formatNumber(man)}만원`;
  }
  return `${formatNumber(num)}원`;
}

// 퍼센트 포맷
function formatPercent(num, decimals = 1) {
  if (isNaN(num)) return '0%';
  return num.toFixed(decimals) + '%';
}

// 입력값 파싱 (콤마 제거)
function parseInput(val) {
  if (typeof val === 'string') val = val.replace(/,/g, '');
  return parseFloat(val) || 0;
}

// 입력값에 콤마 자동 삽입
function setupCommaInput(inputEl) {
  inputEl.addEventListener('blur', function () {
    const val = parseInput(this.value);
    if (val > 0 && this.type !== 'number') {
      this.value = formatNumber(val);
    }
  });
}

// 다크모드 토글
function initDarkMode() {
  const toggle = document.getElementById('darkToggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (toggle) toggle.textContent = '☀️';
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

// 모바일 메뉴 토글 + 아코디언
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('navLinks');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
    btn.textContent = nav.classList.contains('open') ? '✕' : '☰';
    // 메뉴 닫을 때 아코디언도 초기화
    if (!nav.classList.contains('open')) {
      nav.querySelectorAll('.nav-item.open').forEach(item => item.classList.remove('open'));
    }
  });

  // 드롭다운 링크 클릭 시 메뉴 닫기
  nav.querySelectorAll('.nav-dropdown a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.textContent = '☰';
    });
  });

  // 직접 링크(법적 고지 등) 클릭 시 메뉴 닫기
  nav.querySelectorAll(':scope > a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.textContent = '☰';
    });
  });

  // 모바일 아코디언: .nav-link 클릭 시 해당 .nav-item 토글
  nav.querySelectorAll('.nav-item > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // 모바일에서만 아코디언 동작
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const item = link.closest('.nav-item');
      // 다른 열린 항목 닫기
      nav.querySelectorAll('.nav-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });
}

// 프리셋 버튼 초기화
function initPresets() {
  // add 타입: 현재값에 더하기
  document.querySelectorAll('.preset-btn[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        const current = parseInput(target.value);
        target.value = current + parseFloat(btn.dataset.add);
        target.dispatchEvent(new Event('input'));
      }
    });
  });
  // set 타입: 값 설정
  document.querySelectorAll('.preset-btn[data-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        target.value = btn.dataset.set;
        target.dispatchEvent(new Event('input'));
        // active 표시
        btn.parentElement.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });
}

// 실시간 계산 바인딩
function bindCalculation(calcFn) {
  const inputs = document.querySelectorAll('.calculator-input input, .calculator-input select');
  inputs.forEach(input => {
    input.addEventListener('input', calcFn);
    input.addEventListener('change', calcFn);
  });
  // 초기 계산
  calcFn();
}

// 결과 공유 - 클립보드 복사
function copyResult(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('결과가 복사되었습니다!');
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('결과가 복사되었습니다!');
  });
}

// 토스트 메시지
function showToast(msg, duration = 2000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: var(--primary); color: white; padding: 0.75rem 1.5rem;
      border-radius: var(--radius-full); font-size: 0.9rem; z-index: 9999;
      box-shadow: var(--shadow-lg); opacity: 0; transition: opacity 0.3s;
      font-family: var(--font);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

// ===== 적용 기준값 박스 (2026 기준) =====
// getRatesByDate(date) 결과를 받아 “적용 기준 / 출처 / 마지막 검증일” 박스를 그린다.
function renderAppliedRatesBox(opts) {
  opts = opts || {};
  if (typeof window === 'undefined' || typeof window.getRatesByDate !== 'function') return '';
  const r = window.getRatesByDate(opts.date || null, opts.calculator || null);
  const items = [];

  if (r.pension) items.push(`국민연금 ${r.pension.display.totalRate} (근로자 ${r.pension.display.employeeRate})`);
  if (r.healthInsurance) items.push(`건강보험 ${r.healthInsurance.display.totalRate} (근로자 ${r.healthInsurance.display.employeeRate})`);
  if (r.longTermCare) items.push(`장기요양 건강보험료의 ${r.longTermCare.display.rateOnHealthInsurance}`);
  if (r.employmentInsurance) items.push(`고용보험 근로자 ${r.employmentInsurance.display.employeeRate}`);
  if (r.minimumWage) items.push(`최저임금 ${r.minimumWage.display.hourly} (월 ${r.minimumWage.display.monthly209Hours})`);

  let limitNote = '';
  if (r.pensionIncomeLimit) {
    const p = r.pensionIncomeLimit;
    limitNote = `<div class="rate-limit-note">국민연금 기준소득월액 (${p.effectiveFrom} ~ ${p.effectiveTo}): 하한 ${p.display.floor} / 상한 ${p.display.ceiling}</div>`;
  }

  let warningHTML = '';
  if (r.warnings && r.warnings.length > 0) {
    warningHTML = '<div class="rate-warnings">' + r.warnings.map(w => {
      const cls = w.status === 'needs_official_source' ? 'needs-source' : (w.status === 'dynamic' ? 'dynamic' : 'other');
      const label = w.status === 'needs_official_source' ? '공식 기준 확인 중' : (w.status === 'dynamic' ? '동적 정책값' : w.status);
      return `<span class="rate-badge ${cls}" title="${w.message || ''}">${label}: ${w.key}</span>`;
    }).join(' ') + '</div>';
  }

  // 출처 (보건복지부, 고용노동부, 국세청 — verified 항목 출처를 모음)
  const sources = [];
  ['pension', 'healthInsurance', 'longTermCare', 'minimumWage'].forEach(k => {
    const item = r[k];
    if (item && item.officialSource && item.officialSource.length) {
      item.officialSource.forEach(s => {
        if (s && s.name && !sources.find(x => x.name === s.name)) sources.push(s);
      });
    }
  });
  const sourceHTML = sources.length
    ? '<div class="rate-source-list">출처: ' + sources.map(s => s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>` : s.name).join(' · ') + '</div>'
    : '';

  return `
    <div class="applied-rates-box">
      <div class="rate-header">
        <span class="rate-badge verified">적용 기준 ${r.appliedDate || ''}</span>
        <span class="rate-version">${r.rateVersion || ''}</span>
      </div>
      <div class="rate-items">${items.map(i => `<span>${i}</span>`).join('<span class="rate-sep">·</span>')}</div>
      ${limitNote}
      ${warningHTML}
      ${sourceHTML}
      <div class="rate-verified-at">마지막 검증일: ${r.lastVerifiedAt || '2026-05-05'}</div>
    </div>
  `;
}

// 네비게이션 카테고리 데이터
const NAV_CATEGORIES = [
  {
    label: '근로·급여', items: [
      { name: '연봉 실수령액', id: 'take-home-pay' },
      { name: '월급명세서', id: 'paystub' },
      { name: '4대보험 통합', id: 'social-insurance' },
      { name: '사업주 총 인건비', id: 'employer-cost' },
      { name: '시급 계산기', id: 'hourly-wage' },
      { name: '주휴수당 계산기', id: 'weekly-holiday-pay' },
      { name: '야근수당 계산기', id: 'overtime-pay' },
      { name: '연차수당 계산기', id: 'annual-leave-pay' },
      { name: '퇴직금 계산기', id: 'severance-pay' },
      { name: '실업급여 계산기', id: 'unemployment' },
      { name: '국민연금 계산기', id: 'pension' },
    ]
  },
  {
    label: '세금', items: [
      { name: '종합소득세', id: 'income-tax' },
      { name: '부가가치세', id: 'vat' },
      { name: '프리랜서/기타소득', id: 'freelancer-tax' },
      { name: '양도소득세', id: 'capital-gains-tax' },
      { name: '증여세', id: 'gift-tax' },
      { name: '상속세', id: 'inheritance-tax' },
      { name: '취득세', id: 'acquisition-tax' },
      { name: '재산세', id: 'property-tax' },
    ]
  },
  {
    label: '부동산', items: [
      { name: '종합부동산세', id: 'comprehensive-property-tax' },
      { name: '주담대 한도', id: 'mortgage-limit' },
      { name: 'DSR 계산기', id: 'dsr' },
      { name: '월세↔전세 전환', id: 'rent-to-deposit' },
      { name: '이사비용', id: 'moving-cost' },
      { name: '인테리어 비용', id: 'remodel-cost' },
    ]
  },
  {
    label: '대출·금융', items: [
      { name: '대출이자', id: 'loan-interest' },
      { name: '중도상환수수료', id: 'prepayment-fee' },
      { name: '예적금 이자', id: 'deposit-interest' },
      { name: '복리 계산기', id: 'compound-interest' },
      { name: '환율 계산기', id: 'exchange-rate' },
    ]
  },
  {
    label: '보험', items: [
      { name: '건강보험료', id: 'health-insurance' },
      { name: '고용보험료', id: 'employment-insurance' },
      { name: '산재보험료', id: 'industrial-insurance' },
    ]
  },
  {
    label: '생활', items: [
      { name: '자동차 유지비', id: 'car-cost' },
      { name: '결혼비용', id: 'wedding-cost' },
      { name: '육아비용', id: 'child-cost' },
      { name: 'BMI 계산기', id: 'bmi' },
      { name: '단위 변환기', id: 'unit-converter' },
      { name: '팁/더치페이', id: 'tip-calculator' },
      { name: '날짜 계산기', id: 'date-calculator' },
    ]
  },
];

// 드롭다운 네비게이션 HTML 생성 (prefix: 경로 접두사)
function buildNavHTML(prefix) {
  let html = '';
  NAV_CATEGORIES.forEach(cat => {
    html += '<div class="nav-item">';
    html += `<span class="nav-link">${cat.label} <span class="arrow">▾</span></span>`;
    html += '<div class="nav-dropdown">';
    cat.items.forEach(item => {
      html += `<a href="${prefix}${item.id}.html">${item.name}</a>`;
    });
    html += '</div></div>';
  });
  return html;
}

// 공통 헤더 HTML (계산기 페이지용 - ../calculators/ 경로)
function getHeaderHTML() {
  return `
  <header class="site-header">
    <div class="header-inner">
      <a href="../index.html" class="logo">
        <span class="logo-icon">💰</span> 국민계산기
      </a>
      <nav class="nav-links" id="navLinks">
        ${buildNavHTML('../calculators/')}
        <a href="../legal/disclaimer.html">법적 고지</a>
        <a href="../docs/api.html">API</a>
      </nav>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <button class="dark-toggle" id="darkToggle">🌙</button>
        <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
      </div>
    </div>
  </header>`;
}

// 홈(index.html)용 헤더 HTML (calculators/ 경로)
function getHomeHeaderHTML() {
  return `
  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="logo">
        <span class="logo-icon">💰</span> 국민계산기
      </a>
      <nav class="nav-links" id="navLinks">
        ${buildNavHTML('calculators/')}
        <a href="legal/disclaimer.html">법적 고지</a>
        <a href="docs/api.html">API</a>
      </nav>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <button class="dark-toggle" id="darkToggle">🌙</button>
        <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
      </div>
    </div>
  </header>`;
}

// 공통 푸터 HTML
function getFooterHTML() {
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="../legal/disclaimer.html">법적 고지</a>
        <a href="../legal/privacy.html">개인정보처리방침</a>
        <a href="../legal/partnership.html">제휴 문의</a>
        <a href="../docs/api.html">API 문서</a>
        <a href="../sitemap.xml">사이트맵</a>
      </div>
      <p class="footer-copy">&copy; 2026 국민계산기 (Kukmin Calculator) | kukmincalc.com</p>
      <p class="footer-contact">문의: <a href="mailto:help@kukmincalc.com">help@kukmincalc.com</a></p>
      <p class="footer-disclaimer">본 계산 결과는 참고용이며 법적 효력이 없습니다. 정확한 금액은 관련 전문가에게 상담하세요.</p>
    </div>
  </footer>`;
}

// 페이지 초기화
function initPage() {
  initDarkMode();
  initMobileMenu();
  initPresets();
}

// DOM 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', initPage);
