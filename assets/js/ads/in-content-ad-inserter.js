/* ===== ads/in-content-ad-inserter.js — 블로그스팟 스킨식 H2 자동 광고 삽입 훅 =====
 *
 * 적용 대상: /guides/, /blog/, /articles/ 만.
 * 미적용:    /calculators/* (입력폼/버튼/결과 카드 보호).
 *
 * 동작: post-body 안의 H2 를 찾아 2번째/4번째 H2 뒤에 .ad-slot 컨테이너만 삽입.
 *      실제 광고 채움은 ad-manager 가 담당 (AdSense Auto Ads 가 채우거나 fallback).
 *      기존 .auto-inserted-ad / .ad-slot 이 있으면 중복 삽입 안 함.
 */

(function (global) {
  'use strict';

  function isGuideLikePage() {
    var p = (location.pathname || '').toLowerCase();
    return /^\/(guides|blog|articles)\//.test(p) ||
           document.body.getAttribute('data-page-type') === 'guide';
  }

  function findArticleContainer() {
    return document.querySelector(
      '[data-kc-article], .post-body, article .article-body, main article, main .calculator-page'
    );
  }

  function alreadyInserted(container) {
    return container.querySelectorAll('.ad-slot[data-slot-key="guide-h2-auto"]').length > 0;
  }

  function insertAfter(node, newNode) {
    if (node.nextSibling) node.parentNode.insertBefore(newNode, node.nextSibling);
    else node.parentNode.appendChild(newNode);
  }

  function makeSlot(idx) {
    var slot = document.createElement('div');
    slot.className = 'ad-slot kc-ad-slot kc-ad-slot-h2';
    slot.setAttribute('data-slot-key', 'guide-h2-auto');
    slot.setAttribute('data-slot-index', String(idx));
    slot.setAttribute('aria-hidden', 'false');
    return slot;
  }

  function init() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    if (!isGuideLikePage()) return; // 가이드/블로그 페이지에서만 실행

    var container = findArticleContainer();
    if (!container) return;
    if (alreadyInserted(container)) return;

    var headers = Array.prototype.slice.call(container.querySelectorAll('h2'));
    if (headers.length < 2) return;

    var positions = [1, 3]; // 2번째 H2 (index=1), 4번째 H2 (index=3)
    positions.forEach(function (pos, i) {
      if (headers[pos]) {
        insertAfter(headers[pos], makeSlot(i + 1));
      }
    });

    if (global.KCAdManager) global.KCAdManager.processSlots();
  }

  global.KCContentAdInserter = { init: init, isGuideLikePage: isGuideLikePage };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
