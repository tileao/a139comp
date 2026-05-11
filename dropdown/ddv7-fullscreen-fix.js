// AW139 Dropdown DD-V7 fullscreen UX hotfix
// CAT A style: transform-based fullscreen canvas with pinch zoom, drag pan, Fit and PDF.
// Also keeps automatic field advance. No engine/calculation changes here.
(() => {
  const $ = id => document.getElementById(id);
  const layer = $('chartFullscreen');
  const viewport = $('fullscreenViewport');
  const canvas = $('fullscreenChartCanvas');
  const normalCanvas = $('chartCanvas');
  const openBtn = $('openFullscreenBtn');
  const chartStage = $('chartStage');
  const closeBtn = $('closeFullscreenBtn');
  const paEl = $('pressureAltitude');
  const oatEl = $('oat');
  const weightEl = $('actualWeight');
  const windEl = $('headwind');
  const statusDetail = $('statusDetail');

  if (!layer || !viewport || !canvas) return;

  const css = document.createElement('style');
  css.textContent = `
    .chart-fullscreen:not(.hidden){
      position:fixed!important;
      inset:0!important;
      z-index:999999!important;
      background:#02060d!important;
      display:grid!important;
      grid-template-rows:auto 1fr!important;
      padding:0!important;
      box-sizing:border-box!important;
      overflow:hidden!important;
      touch-action:none!important;
    }
    .chart-fullscreen.hidden{display:none!important;}
    .chart-fullscreen::before{
      content:"";
      display:block;
      height:calc(env(safe-area-inset-top) + 58px);
      grid-row:1;
    }
    .chart-fullscreen-viewport{
      grid-row:2;
      position:relative!important;
      overflow:hidden!important;
      width:100%!important;
      height:100%!important;
      min-height:0!important;
      background:#02060d!important;
      touch-action:none!important;
      user-select:none!important;
      -webkit-user-select:none!important;
    }
    #fullscreenChartCanvas{
      position:absolute!important;
      left:0!important;
      top:0!important;
      display:block!important;
      max-width:none!important;
      max-height:none!important;
      transform-origin:0 0!important;
      touch-action:none!important;
      user-select:none!important;
      -webkit-user-select:none!important;
      background:#fff!important;
      box-shadow:0 18px 40px rgba(0,0,0,.35)!important;
      border-radius:4px!important;
      will-change:transform!important;
    }
    .fullscreen-close-btn{
      position:fixed!important;
      top:calc(env(safe-area-inset-top) + 10px)!important;
      right:12px!important;
      z-index:1000002!important;
      width:44px!important;
      height:44px!important;
      border-radius:999px!important;
      border:1px solid rgba(255,255,255,.18)!important;
      background:rgba(15,23,32,.88)!important;
      color:#fff!important;
      font-size:22px!important;
    }
    .ddv7-fs-toolbar{
      position:fixed!important;
      top:calc(env(safe-area-inset-top) + 10px)!important;
      left:12px!important;
      z-index:1000001!important;
      display:flex!important;
      gap:8px!important;
      align-items:center!important;
      max-width:calc(100vw - 76px)!important;
      overflow-x:auto!important;
      -webkit-overflow-scrolling:touch!important;
      padding:0!important;
    }
    .ddv7-fs-toolbar button{
      height:44px!important;
      min-width:58px!important;
      padding:0 14px!important;
      border-radius:999px!important;
      border:1px solid rgba(255,255,255,.18)!important;
      background:rgba(15,23,32,.88)!important;
      color:#fff!important;
      font:800 14px system-ui,-apple-system,Segoe UI,sans-serif!important;
      white-space:nowrap!important;
    }
    .ddv7-fs-toolbar button[data-ddv7-action="pdf"]{background:rgba(47,167,160,.94)!important;}
  `;
  document.head.appendChild(css);

  const toolbar = document.createElement('div');
  toolbar.className = 'ddv7-fs-toolbar';
  toolbar.innerHTML = '<button type="button" data-ddv7-action="fit">Fit</button><button type="button" data-ddv7-action="pdf">PDF</button>';
  layer.appendChild(toolbar);

  const state = {
    scale: 1,
    minScale: 1,
    maxScale: 6,
    x: 0,
    y: 0,
    baseW: 0,
    baseH: 0,
    pointers: new Map(),
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    startX: 0,
    startY: 0,
    startDistance: 0,
    startScale: 1,
    pinchLocalX: 0,
    pinchLocalY: 0,
    lastTap: 0,
  };

  const isOpen = () => !layer.classList.contains('hidden');
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function viewportRect() {
    return viewport.getBoundingClientRect();
  }

  function sourceCanvas() {
    return normalCanvas && normalCanvas.width > 10 && normalCanvas.height > 10 ? normalCanvas : canvas;
  }

  function snapshotCanvas(src) {
    const out = document.createElement('canvas');
    out.width = src.width || 1755;
    out.height = src.height || 1240;
    out.getContext('2d').drawImage(src, 0, 0, out.width, out.height);
    return out;
  }

  function applyTransform() {
    canvas.style.width = `${state.baseW}px`;
    canvas.style.height = `${state.baseH}px`;
    canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
  }

  function clampPan() {
    const r = viewportRect();
    const w = state.baseW * state.scale;
    const h = state.baseH * state.scale;
    state.x = w <= r.width ? (r.width - w) / 2 : clamp(state.x, r.width - w, 0);
    state.y = h <= r.height ? (r.height - h) / 2 : clamp(state.y, r.height - h, 0);
  }

  function fitCanvas() {
    const r = viewportRect();
    const ar = canvas.width / canvas.height;
    let w = Math.max(300, r.width);
    let h = w / ar;
    if (h > r.height) {
      h = Math.max(220, r.height);
      w = h * ar;
    }
    state.baseW = w;
    state.baseH = h;
    state.scale = 1;
    state.minScale = 1;
    clampPan();
    applyTransform();
  }

  function renderFullscreen() {
    if (!isOpen()) return;
    const snap = snapshotCanvas(sourceCanvas());
    const ar = snap.width / snap.height;
    const targetW = Math.max(2400, snap.width * 2);
    const targetH = Math.round(targetW / ar);
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(snap, 0, 0, targetW, targetH);
    fitCanvas();
  }

  function scheduleRender(delay = 220) {
    setTimeout(renderFullscreen, delay);
  }

  function setScaleAt(nextScale, clientX, clientY) {
    const r = viewportRect();
    const focalX = clientX - r.left;
    const focalY = clientY - r.top;
    const localX = (focalX - state.x) / state.scale;
    const localY = (focalY - state.y) / state.scale;
    state.scale = clamp(nextScale, state.minScale, state.maxScale);
    state.x = focalX - localX * state.scale;
    state.y = focalY - localY * state.scale;
    clampPan();
    applyTransform();
  }

  function distance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function pointerCenter(a, b) {
    return { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 };
  }

  function onPointerDown(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    viewport.setPointerCapture?.(e.pointerId);
    state.pointers.set(e.pointerId, e);

    if (state.pointers.size === 1) {
      state.dragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.startX = state.x;
      state.startY = state.y;
    }

    if (state.pointers.size === 2) {
      const [a, b] = [...state.pointers.values()];
      const c = pointerCenter(a, b);
      const r = viewportRect();
      state.startDistance = Math.max(1, distance(a, b));
      state.startScale = state.scale;
      state.pinchLocalX = (c.clientX - r.left - state.x) / state.scale;
      state.pinchLocalY = (c.clientY - r.top - state.y) / state.scale;
      state.dragging = false;
    }
  }

  function onPointerMove(e) {
    if (!isOpen() || !state.pointers.has(e.pointerId)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    state.pointers.set(e.pointerId, e);

    if (state.pointers.size === 2) {
      const [a, b] = [...state.pointers.values()];
      const c = pointerCenter(a, b);
      const r = viewportRect();
      state.scale = clamp(state.startScale * (distance(a, b) / Math.max(1, state.startDistance)), state.minScale, state.maxScale);
      state.x = c.clientX - r.left - state.pinchLocalX * state.scale;
      state.y = c.clientY - r.top - state.pinchLocalY * state.scale;
      clampPan();
      applyTransform();
      return;
    }

    if (state.dragging && state.pointers.size === 1) {
      state.x = state.startX + (e.clientX - state.dragStartX);
      state.y = state.startY + (e.clientY - state.dragStartY);
      clampPan();
      applyTransform();
    }
  }

  function onPointerEnd(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    state.pointers.delete(e.pointerId);
    viewport.releasePointerCapture?.(e.pointerId);
    if (state.pointers.size === 1) {
      const only = [...state.pointers.values()][0];
      state.dragging = true;
      state.dragStartX = only.clientX;
      state.dragStartY = only.clientY;
      state.startX = state.x;
      state.startY = state.y;
    } else {
      state.dragging = false;
    }
  }

  function onDoubleTap(e) {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const now = Date.now();
    if (now - state.lastTap < 330) {
      if (state.scale < 1.2) setScaleAt(2.5, e.clientX, e.clientY);
      else fitCanvas();
      state.lastTap = 0;
    } else {
      state.lastTap = now;
    }
  }

  viewport.addEventListener('pointerdown', onPointerDown, true);
  viewport.addEventListener('pointermove', onPointerMove, true);
  viewport.addEventListener('pointerup', onPointerEnd, true);
  viewport.addEventListener('pointercancel', onPointerEnd, true);
  canvas.addEventListener('click', onDoubleTap, true);
  viewport.addEventListener('wheel', e => {
    if (!isOpen()) return;
    e.preventDefault();
    setScaleAt(state.scale * (e.deltaY < 0 ? 1.18 : 0.84), e.clientX, e.clientY);
  }, { passive: false });

  toolbar.addEventListener('click', e => {
    const action = e.target?.dataset?.ddv7Action;
    if (!action) return;
    e.preventDefault();
    e.stopPropagation();
    if (action === 'fit') fitCanvas();
    if (action === 'pdf') sharePdf();
  });

  function openFullscreen() {
    if (!layer || !canvas) return;
    layer.classList.remove('hidden');
    layer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    scheduleRender(220);
  }

  function closeFullscreen() {
    if (!layer) return;
    layer.classList.add('hidden');
    layer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.pointers.clear();
    state.dragging = false;
  }

  openBtn?.addEventListener('click', openFullscreen);
  chartStage?.addEventListener('click', openFullscreen);
  closeBtn?.addEventListener('click', closeFullscreen);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFullscreen(); });

  window.addEventListener('resize', () => { if (isOpen()) scheduleRender(180); }, true);
  window.addEventListener('orientationchange', () => { if (isOpen()) scheduleRender(420); }, true);

  window.ddv7RequestFullscreenUpdate = () => { if (isOpen()) scheduleRender(60); };

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

  function canvasToJpegBlob(source, quality = 0.95) {
    return new Promise((resolve, reject) => {
      try {
        source.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível gerar imagem do gráfico.')), 'image/jpeg', quality);
      } catch (err) {
        reject(err);
      }
    });
  }

  function padOffset(n) {
    return String(n).padStart(10, '0');
  }

  async function buildPdfFromCanvas(source) {
    const imgBlob = await canvasToJpegBlob(source);
    const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());
    const enc = new TextEncoder();
    const pageW = 842, pageH = 595, margin = 18;
    const maxW = pageW - margin * 2, maxH = pageH - margin * 2;
    const ar = source.width / source.height;
    let drawW = maxW, drawH = drawW / ar;
    if (drawH > maxH) { drawH = maxH; drawW = drawH * ar; }
    const x = (pageW - drawW) / 2, y = (pageH - drawH) / 2;
    const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    const contentBytes = enc.encode(content);
    const parts = [];
    const add = s => parts.push(typeof s === 'string' ? enc.encode(s) : s);
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const offsets = [0];
    const sizeSoFar = () => parts.reduce((sum, p) => sum + p.length, 0);
    const pushObj = (n, body) => { offsets[n] = sizeSoFar(); add(`${n} 0 obj\n${body}\nendobj\n`); };
    pushObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    pushObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    pushObj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    offsets[4] = sizeSoFar();
    add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${source.width} /Height ${source.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`);
    add(imgBytes); add('\nendstream\nendobj\n');
    offsets[5] = sizeSoFar();
    add(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`); add(contentBytes); add('endstream\nendobj\n');
    const xrefOffset = sizeSoFar();
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) xref += `${padOffset(offsets[i])} 00000 n \n`;
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    add(xref);
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function sharePdf() {
    try {
      if (isOpen()) renderFullscreen();
      const source = isOpen() ? canvas : sourceCanvas();
      const pdfBlob = await buildPdfFromCanvas(source);
      const filename = `AW139-Dropdown-DDV7-${new Date().toISOString().slice(0,10)}.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'AW139 Dropdown DD-V7', text: 'AW139 Dropdown DD-V7 chart overlay', files: [file] });
        return;
      }
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error(err);
      if (statusDetail) statusDetail.textContent = `Falha ao gerar PDF: ${err.message || err}`;
      alert(`Falha ao gerar PDF: ${err.message || err}`);
    }
  }

  setupAutoAdvance();
})();
