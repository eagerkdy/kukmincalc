/* ================================================================
   loan-interest.js - 대출이자 계산기 페이지 로직
   CalcCore (calculator-core.js) 및 common.js 의존
   ================================================================ */

(function () {
  'use strict';

  // DOM 참조
  const $loanAmount    = document.getElementById('loanAmount');
  const $interestRate  = document.getElementById('interestRate');
  const $loanTerm      = document.getElementById('loanTerm');
  const $repayMethod   = document.getElementById('repayMethod');
  const $gracePeriod   = document.getElementById('gracePeriod');
  const $result        = document.getElementById('result');
  const $aiInsight     = document.getElementById('aiInsight');

  // 2026년 평균 금리 기준치
  const AVG_RATE = 4.2;

  /**
   * 메인 계산 함수
   */
  function calculate() {
    const loanAmount = parseInput($loanAmount.value);
    const rate       = parseFloat($interestRate.value) || 0;
    const months     = parseInt($loanTerm.value) || 240;
    const method     = $repayMethod.value;
    const grace      = parseInt($gracePeriod.value) || 0;

    if (loanAmount <= 0 || rate <= 0) {
      $result.innerHTML = '';
      $aiInsight.innerHTML = '';
      return;
    }

    // 3가지 상환방식 모두 계산 (비교용)
    const ep  = CalcCore.loanEqualPayment(loanAmount, rate, months, grace);
    const epr = CalcCore.loanEqualPrincipal(loanAmount, rate, months, grace);
    const bt  = CalcCore.loanBullet(loanAmount, rate, months);

    renderResult(method, ep, epr, bt, { loanAmount, rate, months, grace });
    renderAiInsight(ep, epr, bt, rate);
  }

  /**
   * 결과 렌더링
   */
  function renderResult(method, ep, epr, bt, params) {
    const { loanAmount, rate, months, grace } = params;

    let primaryHTML = '';
    if (method === 'equal_payment') {
      primaryHTML = `
        <div class="result-item primary">
          <span>월 상환액 (원리금균등)</span>
          <strong>${formatNumber(ep.monthly)}원</strong>
        </div>
        <div class="result-item">
          <span>총 상환액</span>
          <strong>${formatNumber(ep.total)}원</strong>
        </div>
        <div class="result-item warn">
          <span>총 이자</span>
          <strong>${formatNumber(ep.interest)}원</strong>
        </div>
        ${grace > 0 ? `<div class="result-item"><span>거치기간 월 이자</span><strong>${formatNumber(ep.graceMonthly)}원</strong></div>` : ''}
      `;
    } else if (method === 'equal_principal') {
      primaryHTML = `
        <div class="result-item primary">
          <span>첫 달 상환액 (원금균등)</span>
          <strong>${formatNumber(epr.firstMonthly)}원</strong>
        </div>
        <div class="result-item">
          <span>총 상환액</span>
          <strong>${formatNumber(epr.total)}원</strong>
        </div>
        <div class="result-item warn">
          <span>총 이자</span>
          <strong>${formatNumber(epr.totalInterest)}원</strong>
        </div>
      `;
    } else {
      primaryHTML = `
        <div class="result-item primary">
          <span>월 이자 (만기일시)</span>
          <strong>${formatNumber(bt.monthly)}원</strong>
        </div>
        <div class="result-item">
          <span>총 상환액</span>
          <strong>${formatNumber(bt.total)}원</strong>
        </div>
        <div class="result-item warn">
          <span>총 이자</span>
          <strong>${formatNumber(bt.interest)}원</strong>
        </div>
        <div class="result-item highlight">
          <span>만기 시 원금 상환</span>
          <strong>${formatNumber(bt.finalPayment)}원</strong>
        </div>
      `;
    }

    const currentMonthly = method === 'equal_payment' ? ep.monthly
                         : method === 'equal_principal' ? epr.firstMonthly
                         : bt.monthly;

    $result.innerHTML = `
      <div class="result-card animate-fadein">
        <h3>대출이자 계산 결과</h3>
        ${primaryHTML}
        <div class="share-buttons">
          <button class="share-btn copy" onclick="copyResult('대출 ${formatKRW(loanAmount)} / 연 ${rate}% / ${months / 12}년 → 월 ${formatNumber(currentMonthly)}원 (국민계산기)')">📋 복사</button>
        </div>
      </div>

      <div style="margin-top:var(--space-md);">
        <h3 style="color:var(--primary);margin-bottom:var(--space-sm);font-size:1.1rem;">3가지 상환방식 비교</h3>
        <table class="compare-table">
          <thead>
            <tr><th>구분</th><th>원리금균등</th><th>원금균등</th><th>만기일시</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>월 상환액</td>
              <td>${formatNumber(ep.monthly)}원</td>
              <td>${formatNumber(epr.firstMonthly)}원~</td>
              <td>${formatNumber(bt.monthly)}원</td>
            </tr>
            <tr>
              <td>총 이자</td>
              <td>${formatNumber(ep.interest)}원</td>
              <td class="best">${formatNumber(epr.totalInterest)}원</td>
              <td>${formatNumber(bt.interest)}원</td>
            </tr>
            <tr>
              <td>총 상환액</td>
              <td>${formatNumber(ep.total)}원</td>
              <td class="best">${formatNumber(epr.total)}원</td>
              <td>${formatNumber(bt.total)}원</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * AI 인사이트 렌더링
   */
  function renderAiInsight(ep, epr, bt, rate) {
    const rateVsAvg = rate - AVG_RATE;
    const monthlyIncome = ep.monthly * 3;  // 상환비율 33% 기준 역산
    const interestSaved = ep.interest - epr.totalInterest;

    let rateAdvice = '현재 시장 평균 수준입니다.';
    if (rateVsAvg > 0.5) rateAdvice = '금리 인하 여지가 있다면 대환대출을 검토해보세요.';
    else if (rateVsAvg < -0.5) rateAdvice = '우대금리를 잘 적용받고 계십니다.';

    $aiInsight.innerHTML = `
      <div class="ai-card animate-fadein delay-1">
        <h3>🤖 AI 분석 인사이트</h3>
        <div class="insight-item">
          <span class="icon">📊</span>
          <div>
            <strong>금리 수준 분석: 평균 ${AVG_RATE}% 대비 ${rateVsAvg >= 0 ? '+' : ''}${rateVsAvg.toFixed(1)}%p</strong>
            <p>2026년 주택담보대출 평균 금리(${AVG_RATE}%) 대비 ${Math.abs(rateVsAvg).toFixed(1)}%p ${rateVsAvg >= 0 ? '높은' : '낮은'} 수준입니다. ${rateAdvice}</p>
          </div>
        </div>
        <div class="insight-item">
          <span class="icon">💰</span>
          <div>
            <strong>적정 소득: 월 ${formatNumber(monthlyIncome)}원 이상 권장</strong>
            <p>원리금 상환액이 월 소득의 30% 이내가 적정합니다. 원리금균등 기준 월 ${formatNumber(ep.monthly)}원 상환 시 최소 월 소득 ${formatNumber(monthlyIncome)}원 이상이 권장됩니다.</p>
          </div>
        </div>
        <div class="insight-item">
          <span class="icon">🎯</span>
          <div>
            <strong>이자 절감 팁: 원금균등 선택 시 ${formatNumber(interestSaved)}원 절약</strong>
            <p>원금균등상환을 선택하면 원리금균등 대비 총 ${formatNumber(interestSaved)}원의 이자를 절약할 수 있습니다. 초기 부담이 다소 크지만, 장기적으로 유리합니다.</p>
          </div>
        </div>
      </div>
    `;
  }

  // 헤더/푸터 삽입
  document.getElementById('header').innerHTML = getHeaderHTML();
  document.getElementById('footer').innerHTML = getFooterHTML();

  // 실시간 계산 바인딩
  bindCalculation(calculate);
})();
