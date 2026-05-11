// AW139 Dropdown DD-V7 fullscreen UX hotfix
// Purpose: stable fullscreen using native scroll/pan + button/double-tap zoom.
// Also adds automatic field advance and PDF sharing/export.
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
      background:#05080d!important;
      padding:calc(env(safe-area-inset-top) + 58px) 8px calc(env(safe-area-inset-bottom) + 82px)!important;
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
      bottom:calc(env(safe-area-inset-bottom) + 12px)!important;
      transform:translateX(-50%)!important;
      z-index:1000001!important;
      display:flex!important;
      gap:8px!important;
      align-items:center!important;
      padding:8px 9px!important;
      border-radius:999px!important;
      background:rgba(15,23,32,.94)!important;
      border:1px solid rgba(148,163,184,.35)!important;
      box-shadow:0 10px 34px rgba(0,0,0,.38)!important;
      max-width:calc(100vw - 18px)!important;
      overflow-x:auto!important;
      -webkit-overflow-scrolling:touch!important;
    }
    .ddv7-fs-toolbar button{
      min-width:43px!important;
      height:40px!important;
      padding:0 11px!important;
      border-radius:999px!important;
      border:1px solid rgba(148,163,184,.34)!important;
      background:rgba(255,255,255,.10)!important;
      color:#fff!important;
      font:700 15px system-ui,-apple-system,Segoe UI,sans-serif!important;
      white-space:nowrap!important;
    }
    .ddv7-fs-toolbar button[data-ddv7-action="pdf"]{
      min-width:58px!important;
      background:rgba(69,196,255,.18)!important;
    }
  `;
  document.head.appendChild(css);

  const toolbar = document.createElement('div');
  toolbar.className = 'ddv7-fs-toolbar';
  toolbar.innerHTML = `
    <button type="button" data-ddv7-zoom="out">−</button>
    <button type="button" data-ddv7-zoom="fit">Fit</button>
    <button type="button" data-ddv7-zoom="in">+</button>
    <button type="button" data-ddv7-action="pdf">PDF</button>
  `;
  layer.appendChild(toolbar);

  const state = {
    zoom: 1,
    baseW: 0,
    baseH: 0,
    lastTap: 0,
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    pinchCenterX: 0,
    pinchCenterY: 0,
    pointers: new Map(),
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

    state.zoom = clamp(newZoom, 1, 5.5);
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

  // Block old transform/pointer handlers from ddv7-patch, while preserving native scroll.
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

  // Pinch support on the viewport. Single-finger pan remains native scrolling.
  viewport.addEventListener('pointerdown', e => {
    if (!isOpen()) return;
    state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (state.pointers.size === 2) {
      const pts = [...state.pointers.values()];
      state.pinchStartDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      state.pinchStartZoom = state.zoom;
      state.pinchCenterX = (pts[0].x + pts[1].x) / 2;
      state.pinchCenterY = (pts[0].y + pts[1].y) / 2;
    }
  }, { passive: true });

  viewport.addEventListener('pointermove', e => {
    if (!isOpen() || !state.pointers.has(e.pointerId)) return;
    state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (state.pointers.size === 2 && state.pinchStartDistance > 0) {
      e.preventDefault();
      const pts = [...state.pointers.values()];
      const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      setZoom(state.pinchStartZoom * (distance / state.pinchStartDistance), cx, cy);
    }
  }, { passive: false });

  function clearPointer(e) {
    state.pointers.delete(e.pointerId);
    if (state.pointers.size < 2) state.pinchStartDistance = 0;
  }
  viewport.addEventListener('pointerup', clearPointer, { passive: true });
  viewport.addEventListener('pointercancel', clearPointer, { passive: true });

  toolbar.addEventListener('click', e => {
    const zoomAction = e.target?.dataset?.ddv7Zoom;
    const action = e.target?.dataset?.ddv7Action;
    if (!zoomAction && !action) return;
    e.preventDefault();
    e.stopPropagation();
    const r = viewportRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (zoomAction === 'fit') fitZoom();
    if (zoomAction === 'in') setZoom(state.zoom * 1.45, cx, cy);
    if (zoomAction === 'out') setZoom(state.zoom / 1.45, cx, cy);
    if (action === 'pdf') sharePdf();
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

  function canvasToJpegBlob(sourceCanvas, quality = 0.92) {
    return new Promise((resolve, reject) => {
      try {
        sourceCanvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Não foi possível gerar imagem do gráfico.'));
        }, 'image/jpeg', quality);
      } catch (err) {
        reject(err);
      }
    });
  }

  function padOffset(n) {
    return String(n).padStart(10, '0');
  }

  async function buildPdfFromCanvas(sourceCanvas) {
    const imgBlob = await canvasToJpegBlob(sourceCanvas);
    const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());
    const enc = new TextEncoder();

    const pageW = 842;
    const pageH = 595;
    const margin = 24;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const imgAR = sourceCanvas.width / sourceCanvas.height;
    let drawW = maxW;
    let drawH = drawW / imgAR;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * imgAR;
    }
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    const objects = [];
    objects.push(enc.encode(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`));
    objects.push(enc.encode(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`));
    objects.push(enc.encode(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`));
    objects.push(enc.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${sourceCanvas.width} /Height ${sourceCanvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`));
    objects.push(imgBytes);
    objects.push(enc.encode(`\nendstream\nendobj\n`));
    const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    const contentBytes = enc.encode(content);
    objects.push(enc.encode(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`));
    objects.push(contentBytes);
    objects.push(enc.encode(`endstream\nendobj\n`));

    const header = enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const parts = [header];
    let offset = header.length;
    const offsets = [0];
    let objNo = 1;
    for (let i = 0; i < objects.length; i++) {
      if (i === 0 || i === 1 || i === 2 || i === 3 || i === 6) {
        offsets[objNo] = offset;
        objNo += 1;
      }
      parts.push(objects[i]);
      offset += objects[i].length;
    }

    const xrefOffset = offset;
    let xref = `xref\n0 6\n0000000000 65535 f \n`;
    for (let i = 1; i <= 5; i++) xref += `${padOffset(offsets[i])} 00000 n \n`;
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    parts.push(enc.encode(xref));
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function sharePdf() {
    try {
      const source = isOpen() ? canvas : normalCanvas || canvas;
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
