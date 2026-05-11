// AW139 Dropdown DD-V7 fullscreen UX hotfix
// Purpose: native pinch-zoom/pan behavior, high-resolution fullscreen chart, PDF sharing,
// and automatic field advance. No custom transform zoom is used here.
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
      padding:calc(env(safe-area-inset-top) + 58px) 6px calc(env(safe-area-inset-bottom) + 72px)!important;
      box-sizing:border-box!important;
      overflow:auto!important;
      touch-action:auto!important;
      -webkit-overflow-scrolling:touch!important;
    }
    .chart-fullscreen-viewport{
      position:relative!important;
      display:block!important;
      width:100%!important;
      height:100%!important;
      overflow:auto!important;
      touch-action:auto!important;
      -webkit-overflow-scrolling:touch!important;
      overscroll-behavior:auto!important;
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
      transform-origin:center center!important;
      touch-action:auto!important;
      user-select:none!important;
      -webkit-user-select:none!important;
      background:#fff!important;
      border-radius:8px!important;
      box-shadow:0 16px 52px rgba(0,0,0,.48)!important;
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
      padding:8px 10px!important;
      border-radius:999px!important;
      background:rgba(15,23,32,.94)!important;
      border:1px solid rgba(148,163,184,.35)!important;
      box-shadow:0 10px 34px rgba(0,0,0,.38)!important;
      max-width:calc(100vw - 18px)!important;
      overflow-x:auto!important;
      -webkit-overflow-scrolling:touch!important;
    }
    .ddv7-fs-toolbar button{
      min-width:54px!important;
      height:40px!important;
      padding:0 13px!important;
      border-radius:999px!important;
      border:1px solid rgba(148,163,184,.34)!important;
      background:rgba(255,255,255,.10)!important;
      color:#fff!important;
      font:700 15px system-ui,-apple-system,Segoe UI,sans-serif!important;
      white-space:nowrap!important;
    }
    .ddv7-fs-toolbar button[data-ddv7-action="pdf"]{
      background:rgba(69,196,255,.18)!important;
    }
  `;
  document.head.appendChild(css);

  const toolbar = document.createElement('div');
  toolbar.className = 'ddv7-fs-toolbar';
  toolbar.innerHTML = `
    <button type="button" data-ddv7-action="fit">Fit</button>
    <button type="button" data-ddv7-action="pdf">PDF</button>
  `;
  layer.appendChild(toolbar);

  function isOpen() {
    return !layer.classList.contains('hidden');
  }

  function viewportRect() {
    return viewport.getBoundingClientRect();
  }

  function copyCanvas(source) {
    const tmp = document.createElement('canvas');
    tmp.width = source.width || 1200;
    tmp.height = source.height || 760;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(source, 0, 0);
    return tmp;
  }

  function centerCanvas() {
    const r = viewportRect();
    const cssW = parseFloat(canvas.style.width) || canvas.clientWidth;
    const cssH = parseFloat(canvas.style.height) || canvas.clientHeight;
    canvas.style.marginLeft = cssW < r.width ? `${Math.round((r.width - cssW) / 2)}px` : '0px';
    canvas.style.marginTop = cssH < r.height ? `${Math.round((r.height - cssH) / 2)}px` : '0px';
  }

  function renderHighResolutionFullscreen() {
    if (!isOpen()) return;

    const source = normalCanvas && normalCanvas.width && normalCanvas.height ? normalCanvas : canvas;
    const snapshot = copyCanvas(source);
    const sourceAR = snapshot.width / snapshot.height;

    // High backing resolution for pinch zoom / PDF. Keeps the same visual aspect as the approved overlay canvas.
    const targetW = Math.max(2400, snapshot.width * 2);
    const targetH = Math.round(targetW / sourceAR);

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(snapshot, 0, 0, targetW, targetH);

    canvas.style.transform = 'none';
    canvas.style.position = 'relative';
    canvas.style.left = 'auto';
    canvas.style.top = 'auto';
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';

    const r = viewportRect();
    let cssW = Math.max(280, r.width - 8);
    let cssH = cssW / sourceAR;
    if (cssH > r.height - 8) {
      cssH = Math.max(220, r.height - 8);
      cssW = cssH * sourceAR;
    }

    canvas.style.width = `${Math.round(cssW)}px`;
    canvas.style.height = `${Math.round(cssH)}px`;
    centerCanvas();
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }

  function scheduleRender(delay = 260) {
    setTimeout(renderHighResolutionFullscreen, delay);
  }

  function fitView() {
    renderHighResolutionFullscreen();
  }

  // Block the older custom transform handlers from ddv7-patch, but do not prevent default.
  // This preserves native browser pinch zoom and scroll/pan behavior.
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(type => {
    canvas.addEventListener(type, e => {
      if (!isOpen()) return;
      e.stopImmediatePropagation();
    }, true);
  });

  toolbar.addEventListener('click', e => {
    const action = e.target?.dataset?.ddv7Action;
    if (!action) return;
    e.preventDefault();
    e.stopPropagation();
    if (action === 'fit') fitView();
    if (action === 'pdf') sharePdf();
  });

  openBtn?.addEventListener('click', () => scheduleRender(360));
  chartStage?.addEventListener('click', () => scheduleRender(360));
  closeBtn?.addEventListener('click', () => {
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  });

  const observer = new MutationObserver(() => {
    if (isOpen()) scheduleRender(340);
  });
  observer.observe(layer, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });

  window.addEventListener('resize', () => { if (isOpen()) scheduleRender(260); }, true);
  window.addEventListener('orientationchange', () => { if (isOpen()) scheduleRender(520); }, true);

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

  function canvasToJpegBlob(sourceCanvas, quality = 0.94) {
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
    const margin = 20;
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
      if (isOpen()) renderHighResolutionFullscreen();
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
