/* ===== ads/popup-manager.js — 롤체지지식 대형 팝업 매니저 ===== */
/* 캠페인 데이터 기반 팝업. AdSense 광고를 팝업 안에 넣지 않음.
 * sponsor/affiliate 는 "광고" 라벨, official-link 는 "공식 사이트" 라벨. */

(function (global) {
  'use strict';

  function buildPopupHTML(campaign) {
    var labelClass = campaign.type === 'official-link' ? 'kc-popup-label official' : 'kc-popup-label ad';
    var labelText = campaign.type === 'official-link' ? '공식 사이트'
                  : campaign.type === 'sponsor' ? '스폰서'
                  : campaign.type === 'affiliate' ? '광고' : '추천';
    var bodyParts = [];
    bodyParts.push('<button class="kc-popup-close" aria-label="닫기" data-kc-close="1">&times;</button>');
    bodyParts.push('<div class="' + labelClass + '">' + labelText + '</div>');
    bodyParts.push('<h3 class="kc-popup-title">' + escapeHtml(campaign.title || '') + '</h3>');
    if (campaign.description) {
      bodyParts.push('<p class="kc-popup-desc">' + escapeHtml(campaign.description) + '</p>');
    }
    if (campaign.imageUrl) {
      bodyParts.push('<img class="kc-popup-image" src="' + escapeAttr(campaign.imageUrl) + '" alt="" loading="lazy">');
    }
    if (campaign.type === 'official-link' && Array.isArray(campaign.links) && campaign.links.length) {
      bodyParts.push('<div class="kc-popup-links">');
      campaign.links.forEach(function (link) {
        bodyParts.push(
          '<a class="kc-popup-link" href="' + escapeAttr(link.url) + '" target="_blank" rel="noopener noreferrer" ' +
          'data-kc-action="official-link" data-link-name="' + escapeAttr(link.name) + '" ' +
          'data-campaign-id="' + escapeAttr(campaign.id) + '">' +
          '<span class="kc-popup-link-name">' + escapeHtml(link.name) + '</span>' +
          '<span class="kc-popup-link-go">바로가기 →</span>' +
          '</a>'
        );
      });
      bodyParts.push('</div>');
    }
    if (campaign.ctaUrl && (campaign.type === 'sponsor' || campaign.type === 'affiliate')) {
      bodyParts.push(
        '<a class="kc-popup-cta" href="' + escapeAttr(campaign.ctaUrl) + '" target="_blank" ' +
        'rel="sponsored noopener noreferrer" ' +
        'data-kc-action="cta" data-campaign-id="' + escapeAttr(campaign.id) + '">' +
        escapeHtml(campaign.ctaText || '확인하기') +
        '</a>'
      );
    }
    bodyParts.push('<div class="kc-popup-actions kc-popup-actions-bottom">');
    bodyParts.push('  <button class="kc-popup-btn ghost" data-kc-suppress="1">오늘 다시 보지 않기</button>');
    bodyParts.push('  <button class="kc-popup-btn" data-kc-close="1">닫기</button>');
    bodyParts.push('</div>');

    return '<div class="kc-popup-backdrop" data-kc-close="1"></div>' +
           '<div class="kc-popup-card">' + bodyParts.join('') + '</div>';
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
  }); }
  function escapeAttr(s) { return escapeHtml(s); }

  function suppressUntil(campaignId, days) {
    try {
      localStorage.setItem('kc_popup_suppress_' + campaignId,
        String(Date.now() + (days || 1) * 24 * 60 * 60 * 1000));
    } catch (e) {}
  }

  function isSuppressed(campaignId) {
    try {
      var until = parseInt(localStorage.getItem('kc_popup_suppress_' + campaignId) || '0', 10);
      return until > Date.now();
    } catch (e) { return false; }
  }

  function show(campaign, opts) {
    if (!campaign) return false;
    if (isSuppressed(campaign.id)) return false;
    if (document.getElementById('kc-popup-' + campaign.id)) return false;
    var modal = document.createElement('div');
    modal.id = 'kc-popup-' + campaign.id;
    modal.className = 'kc-popup kc-popup-' + campaign.type;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = buildPopupHTML(campaign);
    document.body.appendChild(modal);

    if (global.KCCampaigns) global.KCCampaigns.markShown(campaign);
    if (global.KukmincalcEvents) {
      global.KukmincalcEvents.track('popup_shown', {
        campaignId: campaign.id, type: campaign.type,
        triggerType: (opts && opts.triggerType) || campaign.trigger,
        category: (campaign.targetCategories || [])[0]
      });
    }

    function close() {
      modal.remove();
      if (global.KukmincalcEvents) global.KukmincalcEvents.track('popup_closed', { campaignId: campaign.id });
    }

    modal.addEventListener('click', function (e) {
      var t = e.target;
      if (t.matches('[data-kc-close]')) {
        close();
      } else if (t.matches('[data-kc-suppress]')) {
        var days = parseInt(t.getAttribute('data-kc-suppress'), 10) || 1;
        suppressUntil(campaign.id, days);
        close();
      } else if (t.matches('[data-kc-action="official-link"]')) {
        if (global.KukmincalcEvents) global.KukmincalcEvents.track('official_link_clicked', {
          campaignId: campaign.id, linkName: t.getAttribute('data-link-name')
        });
      } else if (t.matches('[data-kc-action="cta"]')) {
        if (global.KukmincalcEvents) global.KukmincalcEvents.track('popup_cta_clicked', {
          campaignId: campaign.id, ctaUrl: t.getAttribute('href')
        });
      }
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    });
    return true;
  }

  function showForResult(category, opts) {
    if (!global.KCCampaigns) return false;
    var campaign = global.KCCampaigns.pickForCategory(category, 'after_result');
    if (!campaign) return false;
    return show(campaign, { triggerType: 'after_result' });
  }

  global.KCPopupManager = {
    show: show,
    showForResult: showForResult,
    suppressUntil: suppressUntil,
    isSuppressed: isSuppressed
  };
})(typeof window !== 'undefined' ? window : globalThis);
