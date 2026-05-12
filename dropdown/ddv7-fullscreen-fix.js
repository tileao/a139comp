// AW139 Dropdown DD-V7 — fullscreen viewer with pan/zoom + PDF export
(() => {
  const $ = id => document.getElementById(id);
  const layer    = $('chartFullscreen');
  const viewport = $('fullscreenViewport');
  const canvas   = $('fullscreenChartCanvas');
  const normalCanvas = $('chartCanvas');
  const openBtn  = $('openFullscreenBtn');
  const chartStage = $('chartStage');
  const closeBtn = $('closeFullscreenBtn');
  const paEl = $('pressureAltitude');
  const oatEl = $('oat');
  const weightEl = $('actualWeight');
  const windEl = $('headwind');
  const statusDetail = $('statusDetail');

  if (!layer || !viewport || !canvas) return;

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css = document.createElement('style');
  css.textContent = `
    .chart-fullscreen:not(.hidden){
      position:fixed!important;inset:0!important;z-index:999999!important;
      background:#02060d!important;display:grid!important;
      grid-template-rows:auto 1fr!important;padding:0!important;
      box-sizing:border-box!important;overflow:hidden!important;touch-action:none!important;
    }
    .chart-fullscreen.hidden{display:none!important;}
    .chart-fullscreen::before{
      content:"";display:block;grid-row:1;
      height:calc(env(safe-area-inset-top,0px) + 58px);
    }
    .chart-fullscreen-viewport{
      grid-row:2;position:relative!important;overflow:hidden!important;
      width:100%!important;height:100%!important;min-height:0!important;
      background:#02060d!important;touch-action:none!important;
      user-select:none!important;-webkit-user-select:none!important;
    }
    #fullscreenChartCanvas{
      position:absolute!important;left:0!important;top:0!important;
      display:block!important;max-width:none!important;max-height:none!important;
      transform-origin:0 0!important;touch-action:none!important;
      user-select:none!important;-webkit-user-select:none!important;
      background:#fff!important;box-shadow:0 18px 40px rgba(0,0,0,.35)!important;
      border-radius:4px!important;will-change:transform!important;
    }
    .fullscreen-close-btn{
      position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 10px)!important;
      right:12px!important;z-index:1000002!important;width:44px!important;height:44px!important;
      border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;
      background:rgba(15,23,32,.88)!important;color:#fff!important;font-size:22px!important;
    }
    .ddv7-fs-toolbar{
      position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 10px)!important;
      left:12px!important;z-index:1000001!important;display:flex!important;gap:8px!important;
      align-items:center!important;
    }
    .ddv7-fs-toolbar button{
      height:44px!important;min-width:58px!important;padding:0 14px!important;
      border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;
      background:rgba(15,23,32,.88)!important;color:#fff!important;
      font:800 14px system-ui,sans-serif!important;white-space:nowrap!important;
    }
    .ddv7-fs-toolbar button[data-action="pdf"]{background:rgba(47,167,160,.94)!important;}
  `;
  document.head.appendChild(css);

  // ── Toolbar ────────────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.className = 'ddv7-fs-toolbar';
  toolbar.innerHTML = '<button type="button" data-action="fit">Fit</button>'
                    + '<button type="button" data-action="pdf">PDF</button>';
  layer.appendChild(toolbar);

  // ── State ──────────────────────────────────────────────────────────────────
  const state = {
    scale: 1, minScale: 1, maxScale: 6,
    x: 0, y: 0,
    baseW: 0, baseH: 0,
    pointers: new Map(),
    dragging: false,
    dragStartX: 0, dragStartY: 0,
    startX: 0, startY: 0,
    startDistance: 0, startScale: 1,
    pinchLocalX: 0, pinchLocalY: 0,
    lastTap: 0,
  };

  const isOpen  = () => !layer.classList.contains('hidden');
  const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));
  const vRect   = () => viewport.getBoundingClientRect();

  // ── Render ─────────────────────────────────────────────────────────────────
  function applyTransform() {
    canvas.style.width  = `${state.baseW}px`;
    canvas.style.height = `${state.baseH}px`;
    canvas.style.transform = `translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
  }

  function clampPan() {
    const r = vRect();
    const w = state.baseW * state.scale, h = state.baseH * state.scale;
    state.x = w <= r.width  ? (r.width  - w) / 2 : clamp(state.x, r.width  - w, 0);
    state.y = h <= r.height ? (r.height - h) / 2 : clamp(state.y, r.height - h, 0);
  }

  function fitCanvas() {
    const r  = vRect();
    const ar = canvas.width / canvas.height;
    let w = Math.max(300, r.width), h = w / ar;
    if (h > r.height) { h = Math.max(220, r.height); w = h * ar; }
    state.baseW = w; state.baseH = h;
    state.scale = 1; state.minScale = 1;
    state.x = 0; state.y = 0;
    clampPan();
    applyTransform();
  }

  function renderFullscreen() {
    if (!isOpen()) return;
    const src  = normalCanvas?.width > 10 ? normalCanvas : canvas;
    const ar   = src.width / src.height;
    const tW   = Math.max(2400, src.width * 2);
    const tH   = Math.round(tW / ar);
    canvas.width  = tW;
    canvas.height = tH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, tW, tH);
    ctx.drawImage(src, 0, 0, tW, tH);
    fitCanvas();
  }

  let renderTimer = null;
  function scheduleRender(delay = 220) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderFullscreen, delay);
  }

  // ── Zoom ───────────────────────────────────────────────────────────────────
  function setScaleAt(next, cx, cy) {
    const r = vRect();
    const fx = cx - r.left, fy = cy - r.top;
    const lx = (fx - state.x) / state.scale;
    const ly = (fy - state.y) / state.scale;
    state.scale = clamp(next, state.minScale, state.maxScale);
    state.x = fx - lx * state.scale;
    state.y = fy - ly * state.scale;
    clampPan();
    applyTransform();
  }

  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function mid(a, b)  { return { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 }; }

  // ── Pointer events ─────────────────────────────────────────────────────────
  function onDown(e) {
    if (!isOpen()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    viewport.setPointerCapture?.(e.pointerId);
    state.pointers.set(e.pointerId, e);
    if (state.pointers.size === 1) {
      state.dragging = true;
      state.dragStartX = e.clientX; state.dragStartY = e.clientY;
      state.startX = state.x;      state.startY = state.y;
    }
    if (state.pointers.size === 2) {
      const [a, b] = [...state.pointers.values()];
      const c = mid(a, b), r = vRect();
      state.startDistance = Math.max(1, dist(a, b));
      state.startScale    = state.scale;
      state.pinchLocalX   = (c.clientX - r.left - state.x) / state.scale;
      state.pinchLocalY   = (c.clientY - r.top  - state.y) / state.scale;
      state.dragging = false;
    }
  }

  function onMove(e) {
    if (!isOpen() || !state.pointers.has(e.pointerId)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    state.pointers.set(e.pointerId, e);
    if (state.pointers.size === 2) {
      const [a, b] = [...state.pointers.values()];
      const c = mid(a, b), r = vRect();
      state.scale = clamp(state.startScale * (dist(a, b) / state.startDistance), state.minScale, state.maxScale);
      state.x = c.clientX - r.left - state.pinchLocalX * state.scale;
      state.y = c.clientY - r.top  - state.pinchLocalY * state.scale;
      clampPan(); applyTransform(); return;
    }
    if (state.dragging && state.pointers.size === 1) {
      state.x = state.startX + (e.clientX - state.dragStartX);
      state.y = state.startY + (e.clientY - state.dragStartY);
      clampPan(); applyTransform();
    }
  }

  function onUp(e) {
    if (!isOpen()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    state.pointers.delete(e.pointerId);
    viewport.releasePointerCapture?.(e.pointerId);
    if (state.pointers.size === 1) {
      const only = [...state.pointers.values()][0];
      state.dragging = true;
      state.dragStartX = only.clientX; state.dragStartY = only.clientY;
      state.startX = state.x;         state.startY = state.y;
    } else {
      state.dragging = false;
    }
  }

  function onDoubleTap(e) {
    if (!isOpen()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const now = Date.now();
    if (now - state.lastTap < 330) {
      state.scale < 1.2 ? setScaleAt(2.5, e.clientX, e.clientY) : fitCanvas();
      state.lastTap = 0;
    } else {
      state.lastTap = now;
    }
  }

  viewport.addEventListener('pointerdown',  onDown, true);
  viewport.addEventListener('pointermove',  onMove, true);
  viewport.addEventListener('pointerup',    onUp,   true);
  viewport.addEventListener('pointercancel',onUp,   true);
  canvas.addEventListener('click', onDoubleTap, true);
  viewport.addEventListener('wheel', e => {
    if (!isOpen()) return;
    e.preventDefault();
    setScaleAt(state.scale * (e.deltaY < 0 ? 1.18 : 0.84), e.clientX, e.clientY);
  }, { passive: false });

  // ── Open / Close ───────────────────────────────────────────────────────────
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
  window.addEventListener('resize',          () => { if (isOpen()) scheduleRender(180); }, true);
  window.addEventListener('orientationchange',() => { if (isOpen()) scheduleRender(420); }, true);

  window.ddv7RequestFullscreenUpdate = () => { if (isOpen()) scheduleRender(60); };

  // ── PDF export ─────────────────────────────────────────────────────────────
  function canvasToJpegBlob(source, quality = 0.95) {
    return new Promise((resolve, reject) => {
      try {
        source.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('Não foi possível gerar imagem.')),
          'image/jpeg', quality
        );
      } catch (err) { reject(err); }
    });
  }

  function padOffset(n) { return String(n).padStart(10, '0'); }

  async function buildPdfFromCanvas(source) {
    const imgBlob  = await canvasToJpegBlob(source);
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
    const sz  = () => parts.reduce((s, p) => s + p.length, 0);
    const obj = (n, body) => { offsets[n] = sz(); add(`${n} 0 obj\n${body}\nendobj\n`); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    offsets[4] = sz();
    add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${source.width} /Height ${source.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`);
    add(imgBytes); add('\nendstream\nendobj\n');
    offsets[5] = sz();
    add(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`); add(contentBytes); add('endstream\nendobj\n');
    const xrefOff = sz();
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) xref += `${padOffset(offsets[i])} 00000 n \n`;
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOff}\n%%EOF\n`;
    add(xref);
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function sharePdf() {
    try {
      const source = canvas.width > 10 ? canvas : normalCanvas;
      const pdfBlob = await buildPdfFromCanvas(source);
      const filename = `AW139-Dropdown-${new Date().toISOString().slice(0, 10)}.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'AW139 Dropdown', files: [file] });
        return;
      }
      const url = URL.createObjectURL(pdfBlob);
      const opened = window.open(url, '_blank');
      if (!opened) {
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 8000);
    } catch (err) {
      console.error(err);
      if (statusDetail) statusDetail.textContent = `Falha ao gerar PDF: ${err.message || err}`;
    }
  }

  toolbar.addEventListener('click', e => {
    const action = e.target?.dataset?.action;
    if (!action) return;
    e.preventDefault(); e.stopPropagation();
    if (action === 'fit') fitCanvas();
    if (action === 'pdf') sharePdf();
  });

  // ── Auto-advance campos ────────────────────────────────────────────────────
  function shouldAdvance(el) {
    const raw = String(el.value || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (!raw || raw === '-') return false;
    if (el === paEl)     return raw === '0' || digits.length >= 4;
    if (el === oatEl)    return raw === '0' || digits.length >= 2 || (raw.startsWith('-') && digits.length >= 1);
    if (el === weightEl) return digits.length >= 4;
    if (el === windEl)   return digits.length >= 2;
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
          if (next) { next.focus(); next.select?.(); } else { field.blur(); }
        }, 360);
      });
      field.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const next = fields[idx + 1];
        if (next) { next.focus(); next.select?.(); } else { field.blur(); }
      });
    });
  }

  setupAutoAdvance();
})();
