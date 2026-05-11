// AW139 Dropdown DD-V7 fullscreen UX hotfix
// Purpose: stable fullscreen using native scroll/pan + button/double-tap zoom.
// Also adds automatic advance to the next input field.
(() => {
  const $ = id => document.getElementById(id);
  const layer = $('chartFullscreen');
  const viewport = $('fullscreenViewport');
  const canvas = $('fullscreenChartCanvas');
  const openBtn = $('openFullscreenBtn');
  const chartStage = $('chartStage');
  const closeBtn = $('closeFullscreenBtn');

  const paEl = $('pressureAltitude');
  const oatEl = $('oat');
  const weightEl = $('actualWeight');
  const windEl = $('headwind');

  if (!layer || !viewport || !canvas) return;

  const css = document.createElement('style');
  css.textContent = `
    .chart-fullscreen:not(.hidden){
      position:fixed!important;
      inset:0!important;
      z-index:999999!important;
      background:#05080d!important;
      padding:calc(env(safe-area-inset-top) + 58px) 8px calc(env(safe-area-inset-bottom) + 74px)!important;
      box-sizing:border-box!important;
    }
    .chart-fullscreen-viewport{
      position:relative!important;
      display:block!important;
      width:100%!important;
      height:100%!important;
      overflow:auto!important;
      touch-action:pan-x pan-y!important;
      -webkit-overflow-scrolling:touch!important;
      overscroll-behavior:contain!important;
      background:#05080d!important;
      border-radius:10px!important;
      text-align:left!important;
    }
    #fullscreenChartCanvas{
      position:relative!important;
      display:block!important;
      left:auto!important;
      top:auto!important;
      max-width:none!important;
      max-height:none!important;
      transform:none!important;
      transform-origin:0 0!important;
      touch-action:pan-x pan-y!important;
      user-select:none!important;
      -webkit-user-select:none!important;
      background:#fff!important;
      border-radius:8px!important;
      box-shadow:0 16px 52px rgba(0,0,0,.48)!important;
      margin:0!important;
    }
    .fullscreen-close-btn{
      position:fixed!important;
      top:calc(env(safe-area-inset-top) + 12px)!important;
      right:14px!important;
      z-index:1000002!important;
    }
    .ddv7-fs-toolbar{
      position:fixed!important;
      left:50%!important;
      bottom:calc(env(safe-area-inset-bottom) + 14px)!important;
      transform:translateX(-50%)!important;
      z-index:1000001!important;
      display:flex!important;
      gap:10px!important;
      align-items:center!important;
      padding:8px 10px!important;
      border-radius:999px!important;
      background:rgba(15,23,32,.92)!important;
      border:1px solid rgba(148,163,184,.35)!important;
      box-shadow:0 10px 34px rgba(0,0,0,.38)!important;
    }
    .ddv7-fs-toolbar button{
      min-width:46px!important;
      height:40px!important;
      padding:0 12px!important;
      border-radius:999px!important;
      border:1px solid rgba(148,163,184,.34)!important;
      background:rgba(255,255,255,.10)!important;
      color:#fff!important;
      font:700 16px system-ui,-apple-system,Segoe UI,sans-serif!important;
    }
  `;
  document.head.appendChild(css);

  const toolbar = document.createElement('div');
  toolbar.className = 'ddv7-fs-toolbar';
  toolbar.innerHTML = `<button type="button" data-ddv7-zoom="out">−</button><button type="button" data-ddv7-zoom="fit">Fit</button><button type="button" data-ddv7-zoom="in">+</button>`;
  layer.appendChild(toolbar);

  const state = {
    zoom: 1,
    baseW: 0,
    baseH: 0,
    lastTap: 0,
  };

  function isOpen() {
    return !layer.classList.contains('hidden');
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function viewportRect() {
    return viewport.getBoundingClientRect();
  }

  function canvasAspect() {
    if (canvas.width > 0 && canvas.height > 0) return canvas.width / canvas.height;
    return 842 / 595;
  }

  function neutralizeOldTransform() {
    canvas.style.transform = 'none';
    canvas.style.left = 'auto';
    canvas.style.top = 'auto';
    canvas.style.position = 'relative';
  }

  function applySize() {
    neutralizeOldTransform();
    const w = Math.max(260, Math.round(state.baseW * state.zoom));
    const h = Math.max(180, Math.round(state.baseH * state.zoom));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }

  function centerIfSmaller() {
    const r = viewportRect();
    const w = state.baseW * state.zoom;
    const h = state.baseH * state.zoom;
    canvas.style.marginLeft = w < r.width ? `${Math.round((r.width - w) / 2)}px` : '0px';
    canvas.style.marginTop = h < r.height ? `${Math.round((r.height - h) / 2)}px` : '0px';
  }

  function measureAndFit() {
    if (!isOpen()) return;

    neutralizeOldTransform();
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;

    const r = viewportRect();
    const ar = canvasAspect();
    let w = Math.max(280, r.width - 8);
    let h = w / ar;

    if (h > r.height - 8) {
      h = Math.max(220, r.height - 8);
      w = h * ar;
    }

    state.baseW = w;
    state.baseH = h;
    state.zoom = 1;
    applySize();
    centerIfSmaller();
  }

  function scheduleFit(delay = 180) {
    setTimeout(measureAndFit, delay);
  }

  function setZoom(newZoom, focalClientX = null, focalClientY = null) {
    if (!isOpen()) return;

    const oldZoom = state.zoom;
    const oldW = state.baseW * oldZoom;
    const oldH = state.baseH * oldZoom;
    const r = viewportRect();
    const focusX = focalClientX == null ? r.left + r.width / 2 : focalClientX;
    const focusY = focalClientY == null ? r.top + r.height / 2 : focalClientY;
    const localX = (viewport.scrollLeft + focusX - r.left) / Math.max(1, oldW);
    const localY = (viewport.scrollTop + focusY - r.top) / Math.max(1, oldH);

    state.zoom = clamp(newZoom, 1, 4.5);
    applySize();
    centerIfSmaller();

    const newW = state.baseW * state.zoom;
    const newH = state.baseH * state.zoom;
    viewport.scrollLeft = Math.max(0, localX * newW - (focusX - r.left));
    viewport.scrollTop = Math.max(0, localY * newH - (focusY - r.top));
  }

  function fitZoom() {
    state.zoom = 1;
    applySize();
    centerIfSmaller();
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }

  // Stop older DD-V7 fullscreen transform handlers from grabbing the canvas,
  // but do not prevent default scrolling; native overflow pan remains active.
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(type => {
    canvas.addEventListener(type, e => {
      if (!isOpen()) return;
      e.stopImmediatePropagation();
    }, true);
  });

  canvas.addEventListener('click', e => {
    if (!isOpen()) return;
    e.stopImmediatePropagation();
    const now = Date.now();
    if (now - state.lastTap < 330) {
      if (state.zoom < 1.4) setZoom(2.4, e.clientX, e.clientY);
      else fitZoom();
      state.lastTap = 0;
    } else {
      state.lastTap = now;
    }
  }, true);

  viewport.addEventListener('wheel', e => {
    if (!isOpen()) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.18 : 0.84;
    setZoom(state.zoom * factor, e.clientX, e.clientY);
  }, { passive: false });

  toolbar.addEventListener('click', e => {
    const action = e.target?.dataset?.ddv7Zoom;
    if (!action) return;
    e.preventDefault();
    e.stopPropagation();
    const r = viewportRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (action === 'fit') fitZoom();
    if (action === 'in') setZoom(state.zoom * 1.45, cx, cy);
    if (action === 'out') setZoom(state.zoom / 1.45, cx, cy);
  });

  openBtn?.addEventListener('click', () => scheduleFit(240));
  chartStage?.addEventListener('click', () => scheduleFit(240));
  closeBtn?.addEventListener('click', () => fitZoom());

  const observer = new MutationObserver(() => {
    if (isOpen()) scheduleFit(220);
  });
  observer.observe(layer, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });

  window.addEventListener('resize', () => { if (isOpen()) scheduleFit(220); }, true);
  window.addEventListener('orientationchange', () => { if (isOpen()) scheduleFit(380); }, true);

  function shouldAdvance(el) {
    const raw = String(el.value || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (!raw || raw === '-') return false;
    if (el === paEl) return raw === '0' || digits.length >= 4;
    if (el === oatEl) return raw === '0' || digits.length >= 2 || (raw.startsWith('-') && digits.length >= 1);
    if (el === weightEl) return digits.length >= 4;
    if (el === windEl) return digits.length >= 2;
    return false;
  }

  function setupAutoAdvance() {
    const fields = [paEl, oatEl, weightEl, windEl].filter(Boolean);
    fields.forEach((field, idx) => {
      let timer = null;
      field.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!shouldAdvance(field)) return;
          const next = fields[idx + 1];
          if (next) {
            next.focus();
            next.select?.();
          } else {
            field.blur();
          }
        }, 360);
      });
      field.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const next = fields[idx + 1];
        if (next) {
          next.focus();
          next.select?.();
        } else {
          field.blur();
        }
      });
    });
  }

  setupAutoAdvance();
})();
