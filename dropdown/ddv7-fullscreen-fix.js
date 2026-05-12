// AW139 Dropdown DD-V7 — PDF viewer on chart tap
// Clicking the chart or the PDF button generates and opens the chart as PDF.
(() => {
  const $ = id => document.getElementById(id);
  const normalCanvas = $('chartCanvas');
  const openBtn = $('openFullscreenBtn');
  const chartStage = $('chartStage');
  const statusDetail = $('statusDetail');
  const paEl = $('pressureAltitude');
  const oatEl = $('oat');
  const weightEl = $('actualWeight');
  const windEl = $('headwind');

  if (!normalCanvas) return;

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

  async function openChartAsPdf() {
    try {
      const pdfBlob = await buildPdfFromCanvas(normalCanvas);
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

  openBtn?.addEventListener('click', openChartAsPdf);
  chartStage?.addEventListener('click', openChartAsPdf);

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
