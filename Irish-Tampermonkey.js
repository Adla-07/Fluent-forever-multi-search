// ==UserScript==
// @name         Irish-Tampermonkey.js
// @namespace    http://local/
// @version      1.3
// @description  Replace Connacht pronunciation audio spans with a working "Copy link" button (copies data-src-mp3). Watches for dynamic content.
// @match        https://www.focloir.ie/*
// @match        https://focloir.ie/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
  'use strict';

  function copyTextToClipboard(text) {
    if (!text) return Promise.reject(new Error('No text to copy'));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback using temporary textarea + execCommand
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      // Prevent visual flash
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand copy failed'));
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  function shouldReplaceSpan(el) {
    if (!el || el.nodeType !== 1) return false;
    if (!el.classList.contains('pron_sound')) return false;
    if (el.dataset.ffProcessed) return false;
    return true;
  }

  function extractSoundBase(onclickValue) {
    if (!onclickValue) return '';
    const match = onclickValue.match(/playSound\(['"]([^'"]+)\.wav['"]\)/);
    return match ? match[1] : '';
  }

  function normalizeSoundBase(base) {
    if (!base) return '';
    const withoutDialect = base.replace(/_[a-z]$/i, '');
    const fadaMap = {
      a: 'á',
      e: 'é',
      i: 'í',
      o: 'ó',
      u: 'ú',
      A: 'Á',
      E: 'É',
      I: 'Í',
      O: 'Ó',
      U: 'Ú'
    };
    return withoutDialect.replace(/([aeiou])_x/gi, function (match, vowel) {
      return fadaMap[vowel] || match;
    });
  }

  function processElement(el) {
    if (!shouldReplaceSpan(el)) return;
    el.dataset.ffProcessed = '1';

    const soundBase = extractSoundBase(el.getAttribute('onclick') || '');
    const normalizedBase = normalizeSoundBase(soundBase);
    const mp3 = normalizedBase
      ? 'https://www.teanglann.ie/CanC/' + encodeURI(normalizedBase) + '.mp3'
      : '';
    const wrapper = document.createElement('span');
    wrapper.className = (el.className || '') + ' ff-modified';
    wrapper.style.display = 'inline-block';
    wrapper.style.margin = '0 6px';
    wrapper.style.verticalAlign = 'middle';
    wrapper.style.pointerEvents = 'auto'; // ensure clickable if site styles interfere
    wrapper.title = el.getAttribute('title') || '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Copy link';
    btn.title = mp3 ? 'Copy MP3 URL to clipboard' : 'No MP3 URL found';
    // Styles to avoid inheriting problematic site CSS
    Object.assign(btn.style, {
      cursor: 'pointer',
      padding: '3px 8px',
      fontSize: '12px',
      borderRadius: '4px',
      border: '1px solid #888',
      background: '#f5f5f5',
      pointerEvents: 'auto'
    });

    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (!mp3) {
        window.alert('No MP3 URL found on this element.');
        return;
      }
      btn.disabled = true;
      copyTextToClipboard(mp3).then(function () {
        const prev = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function () {
          btn.textContent = prev;
          btn.disabled = false;
        }, 1400);
      }).catch(function () {
        // fallback prompt if clipboard blocked
        btn.disabled = false;
        window.prompt('Copy this MP3 URL manually:', mp3);
      });
    });

    // Replace original span with wrapper containing only the Copy button
    try {
      wrapper.appendChild(btn);
      el.parentNode.replaceChild(wrapper, el);
    } catch (err) {
      // fallback: hide original and insert after
      el.style.display = 'none';
      el.parentNode.insertBefore(wrapper, el.nextSibling);
    }
  }

  function scanAndProcess(root) {
    root = root || document;
    const candidates = root.querySelectorAll('span.pron_sound');
    candidates.forEach(processElement);
  }

  // initial pass
  scanAndProcess();

  // Observe for dynamic content
  const mo = new MutationObserver(function (mutations) {
    for (const m of mutations) {
      if (m.type !== 'childList') continue;
      m.addedNodes.forEach(function (node) {
        if (!node || node.nodeType !== 1) return;
        if (node.matches && node.matches('span.pron_sound')) {
          processElement(node);
        } else {
          // scan subtree for matching spans
          scanAndProcess(node);
        }
      });
    }
  });

  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // safety repeats for slow-loading pages
  [250, 800, 2000].forEach(function (t) { setTimeout(scanAndProcess, t); });

  console.log('Focloir userscript (Connacht-only) active.');
})();
