// AW139 Dropdown DD-V7 fullscreen UX hotfix
// Purpose: replace unstable transform handling with focal zoom + bounded pan.
(() => {
  const $ = id => document.getElementById(id);
  const layer = $('chartFullscreen');
  const viewport = $('fullscreenViewport');
  const canvas = $('fullscreenChartCanvas');
  const openBtn = $('openFullscreenBtn');
  const chartStage = $('chartStage');
  const closeBtn = $('closeFullscreenBtn');

  if (!layer || !viewport || !canvas) return;

  const css = document.createElement('style');
  css.textContent = `
    .chart-fullscreen:not(.hidden){
      position:fixed!important;
      inset:0!important;
      z-index:999999!important;
      background:#05080d!important;
      padding:calc(env(safe-area-inset-top) + 58px) 8px calc(env(safe-area-inset-bottom) + 12px)!important;
      box-sizing:border-box!important;
    }
    .chart-fullscreen-viewport{
      position:relative!important;
      display:block!important;
      width:100%!important;
      height:100%!important;
      overflow:hidden!important;
      touch-action:none!important;
      background:#05080d!important;
      border-radius:10px!important;
    }
    #fullscreenChartCanvas{
      position:absolute!important;
      left:0!important;
      top:0!important;
      max-width:none!important;
      max-height:none!important;
      width:auto;
      height:auto;
      transform-origin:0 0!important;
      touch-action:none!important;
      user-select:none!important;
      -webkit-user-select:none!important;
      background:#fff!important;
      border-radius:8px!important;
      box-shadow:0 16px 52px rgba(0,0,0,.48)!important;
      will-change:transform!important;
    }
    .fullscreen-close-btn{
      position:fixed!important;
      top:calc(env(safe-area-inset-top) + 12px)!important;
      right:14px!important;
      z-index:1000000!important;
    }
  `;
  document.head.appendChild(css);

  const state = {
    zoom: 1,
    x: 0,
    y: 0,
    baseW: 0,
    baseH: 0,
    dragging: false,
    startClientX: 0,
    startClientY: 0,
    startX: 0,
    startY: 0,
    moved: false,
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

  function applyTransform() {
    canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.zoom})`;
  }

  function clampPan() {
    const r = viewportRect();
    const scaledW = state.baseW * state.zoom;
    const scaledH = state.baseH * state.zoom;

    if (scaledW <= r.width) {
      state.x = (r.width - scaledW) / 2;
    } else {
      state.x = clamp(state.x, r.width - scaledW, 0);
    }

    if (scaledH <= r.height) {
      state.y = (r.height - scaledH) / 2;
    } else {
      state.y = clamp(state.y, r.height - scaledH, 0);
    }
  }

  function measureAndFit() {
    if (!isOpen()) return;

    canvas.style.transform = 'none';
    canvas.style.transformOrigin = '0 0';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';

    const r = viewportRect();
    const ar = canvasAspect();
    let w = Math.max(260, r.width - 4);
    let h = w / ar;

    if (h > r.height - 4) {
      h = Math.max(220, r.height - 4);
      w = h * ar;
    }

    state.baseW = w;
    state.baseH = h;
    state.zoom = 1;
    state.x = (r.width - w) / 2;
    state.y = (r.height - h) / 2;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    applyTransform();
  }

  function scheduleFit(delay = 120) {
    setTimeout(measureAndFit, delay);
  }

  function setZoomAt(newZoom, clientX, clientY) {
    if (!isOpen()) return;
    const r = viewportRect();
    const focalX = clientX - r.left;
    const focalY = clientY - r.top;
    const localX = (focalX - state.x) / state.zoom;
    const localY = (focalY - state.y) / state.zoom;

    state.zoom = clamp(newZoom, 1, 5);
    state.x = focalX - localX * state.zoom;
    state.y = focalY - localY * state.zoom;
    clampPan();
    applyTransform();
  }

  function resetZoom() {
    state.zoom = 1;
    clampPan();
    applyTransform();
  }

  function beginDrag(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    state.dragging = true;
    state.moved = false;
    state.startClientX = e.clientX;
    state.startClientY = e.clientY;
    state.startX = state.x;
    state.startY = state.y;
    canvas.setPointerCapture?.(e.pointerId);
  }

  function moveDrag(e) {
    if (!state.dragging || !isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const dx = e.clientX - state.startClientX;
    const dy = e.clientY - state.startClientY;
    if (Math.hypot(dx, dy) > 3) state.moved = true;
    state.x = state.startX + dx;
    state.y = state.startY + dy;
    clampPan();
    applyTransform();
  }

  function endDrag(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    state.dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  function handleTap(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (state.moved) return;

    const now = Date.now();
    if (now - state.lastTap < 330) {
      if (state.zoom < 1.4) {
        setZoomAt(2.4, e.clientX, e.clientY);
      } else {
        resetZoom();
      }
      state.lastTap = 0;
    } else {
      state.lastTap = now;
    }
  }

  function handleWheel(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const factor = e.deltaY < 0 ? 1.18 : 0.84;
    setZoomAt(state.zoom * factor, e.clientX, e.clientY);
  }

  // Let DD-V7 draw first, then override only the interaction/layout layer.
  openBtn?.addEventListener('click', () => scheduleFit(180));
  chartStage?.addEventListener('click', () => scheduleFit(180));
  closeBtn?.addEventListener('click', () => {
    state.zoom = 1;
    state.x = 0;
    state.y = 0;
    applyTransform();
  });

  const observer = new MutationObserver(() => {
    if (isOpen()) scheduleFit(140);
  });
  observer.observe(layer, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });

  window.addEventListener('resize', () => { if (isOpen()) scheduleFit(180); }, true);
  window.addEventListener('orientationchange', () => { if (isOpen()) scheduleFit(320); }, true);

  canvas.addEventListener('pointerdown', beginDrag, true);
  canvas.addEventListener('pointermove', moveDrag, true);
  canvas.addEventListener('pointerup', endDrag, true);
  canvas.addEventListener('pointercancel', endDrag, true);
  canvas.addEventListener('click', handleTap, true);
  canvas.addEventListener('wheel', handleWheel, { passive: false, capture: true });
})();
