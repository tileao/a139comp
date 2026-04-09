const SHARED_KEY = 'aw139_companion_shared_context_v1';
const adcFrame = document.getElementById('adcFrame');
const watFrame = document.getElementById('watFrame');
const rtoFrame = document.getElementById('rtoFrame');
const frameMap = { adc: adcFrame, wat: watFrame, rto: rtoFrame };
const adcPreviewState = { payload: null };
const imageCache = new Map();

const els = {
  base: document.getElementById('baseSelect'),
  departure: document.getElementById('departureEndSelect'),
  aircraftSet: document.getElementById('aircraftSetSelect'),
  config: document.getElementById('configurationSelect'),
  pa: document.getElementById('pressureAltitude'),
  paNegativeBtn: document.getElementById('paNegativeBtn'),
  oat: document.getElementById('oat'),
  oatNegativeBtn: document.getElementById('oatNegativeBtn'),
  weight: document.getElementById('actualWeight'),
  wind: document.getElementById('headwind'),
  runBtn: document.getElementById('runBtn'),
  visualSelect: document.getElementById('visualSelect'),
  registration: document.getElementById('aircraftRegistration'),
  statusChip: document.getElementById('statusChip'),
  resultCard: document.getElementById('resultCard'),
  watMax: document.getElementById('watMaxMetric'),
  watBox: document.getElementById('watBox'),
  watSummary: document.getElementById('watSummary'),
  watMarginSummary: document.getElementById('watMarginSummary'),
  rtoBox: document.getElementById('rtoBox'),
  rtoMetric: document.getElementById('rtoMetric'),
  rtoSummary: document.getElementById('rtoSummary'),
  decisionBody: document.getElementById('decisionTableBody'),
  vizSubtitle: document.getElementById('vizSubtitle'),
  vizPlaceholder: document.getElementById('vizPlaceholder'),
  openWATBtn: document.getElementById('openWATBtn'),
  openRTOBtn: document.getElementById('openRTOBtn'),
  openADCBtn: document.getElementById('openADCBtn'),
  viewerPane: document.getElementById('viewerPane'),
  sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
  viewerMeta: document.getElementById('viewerMeta'),
  vizLegend: document.getElementById('vizLegend'),
  vizFacts: document.getElementById('vizFacts'),
  vizPreviewCanvas: document.getElementById('vizPreviewCanvas'),
  vizWrap: document.getElementById('vizWrap'),
};

function loadCtx() { try { return JSON.parse(localStorage.getItem(SHARED_KEY) || '{}'); } catch { return {}; } }
function saveCtx(patch) { localStorage.setItem(SHARED_KEY, JSON.stringify({ ...loadCtx(), ...patch, updatedAt: new Date().toISOString(), lastModule: 'cata' })); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function resolveFrameAssetSrc(frame, src) {
  if (!src) return '';
  if (/^(?:[a-z]+:)?\/\//i.test(src) || /^(?:data|blob):/i.test(src)) return src;
  try {
    const baseHref = frame?.contentWindow?.location?.href || frame?.src || window.location.href;
    return new URL(src, baseHref).href;
  } catch {
    return src;
  }
}

function chartKey(src) {
  const raw = String(src || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw, window.location.href);
    return url.pathname.split('/').pop() || raw;
  } catch {
    return raw.split('?')[0].split('#')[0].split('/').pop() || raw;
  }
}

async function waitForAdcChartMatch(expectedSrc = '', timeoutMs = 1800) {
  try {
    const bridge = adcFrame.contentWindow?.__adcBridge;
    if (!bridge) return null;
    if (bridge.waitForChart) return await bridge.waitForChart(expectedSrc, timeoutMs);
    const expectedKey = chartKey(expectedSrc);
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const info = bridge.getRenderInfo ? bridge.getRenderInfo() : null;
      const loadedKey = info?.loadedKey || '';
      const requestedKey = info?.requestedKey || '';
      const canvasReady = (info?.canvasWidth || 0) > 32 && (info?.canvasHeight || 0) > 32;
      if ((!expectedKey || loadedKey === expectedKey || requestedKey === expectedKey) && canvasReady) return info;
      await sleep(60);
    }
  } catch {}
  return null;
}

async function loadImage(src) {
  if (!src) return null;
  if (imageCache.has(src)) return imageCache.get(src);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  }).catch(() => null);
  imageCache.set(src, p);
  return p;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function pointAlongRunway(runway, metersFromRef) {
  const len = Number(runway?.lengthM || 0) || 1;
  const t = Math.max(0, Math.min(1, Number(metersFromRef || 0) / len));
  const a = runway?.pavementRef || runway?.thresholdRef;
  const b = runway?.pavementOpp || runway?.thresholdOpp;
  if (!a || !b) return { x: 0, y: 0 };
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}
function runwayGeometry(runway) {
  const pRef = runway?.pavementRef || runway?.thresholdRef;
  const pOpp = runway?.pavementOpp || runway?.thresholdOpp;
  const dx = (pOpp?.x || 0) - (pRef?.x || 0);
  const dy = (pOpp?.y || 0) - (pRef?.y || 0);
  const len = Math.max(1, Math.hypot(dx, dy));
  return { pRef, pOpp, dx, dy, len, ux: dx / len, uy: dy / len, px: -dy / len, py: dx / len };
}
function pointAtMetersFromRef(runway, metersFromRef) {
  return pointAlongRunway(runway, metersFromRef);
}
function oppositeEnd(runway) {
  const ref = String(runway?.referenceEnd || '');
  return (runway?.ends || []).find(end => String(end) !== ref) || (runway?.ends || [])[0] || '';
}
function displayTaxiLabel(name = '') {
  const raw = String(name || '').trim();
  return raw.replace(/^TWY\s+/i, '') || raw;
}
function measureLabeledBox(ctx, lines, scale = 1) {
  const useScale = Math.max(1, Number(scale || 1));
  const padX = Math.round(14 * useScale);
  const padY = Math.round(11 * useScale);
  const fontSize = Math.round(20 * useScale);
  const lineH = Math.round(31 * useScale);
  ctx.save();
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
  const minWidth = Math.round(82 * useScale);
  const width = Math.max(...lines.map(line => ctx.measureText(line).width), minWidth) + padX * 2;
  const height = lines.length * lineH + padY * 2 - Math.round(8 * useScale);
  ctx.restore();
  return { w: width, h: height };
}
function drawLabeledBox(ctx, x, y, lines, ok = true, opts = {}) {
  const scale = Math.max(1, Number(opts.scale || 1));
  const padX = Math.round(14 * scale);
  const padY = Math.round(11 * scale);
  const fontSize = Math.round(20 * scale);
  const lineH = Math.round(31 * scale);
  const textBase = Math.round(20 * scale);
  const boxX = x + (opts.dx || 0);
  const boxY = y + (opts.dy || 0);
  const measured = measureLabeledBox(ctx, lines, scale);
  const width = measured.w;
  const height = measured.h;
  ctx.save();
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
  ctx.strokeStyle = ok ? '#7CFC00' : '#ef4444';
  ctx.fillStyle = '#0f1b2a';
  ctx.lineWidth = Math.max(4, Math.round(4 * scale));
  const radius = Math.round(16 * scale);
  ctx.beginPath();
  const w = width, h = height;
  const rx = boxX, ry = boxY;
  ctx.moveTo(rx + radius, ry);
  ctx.arcTo(rx + w, ry, rx + w, ry + h, radius);
  ctx.arcTo(rx + w, ry + h, rx, ry + h, radius);
  ctx.arcTo(rx, ry + h, rx, ry, radius);
  ctx.arcTo(rx, ry, rx + w, ry, radius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ok ? '#7CFC00' : '#ef4444';
  lines.forEach((line, idx) => ctx.fillText(line, boxX + padX, boxY + padY + textBase + idx * lineH));
  ctx.restore();
  return { x: boxX, y: boxY, w: width, h: height };
}
function nearestPointOnBox(box, anchor) {
  return {
    x: Math.max(box.x, Math.min(anchor.x, box.x + box.w)),
    y: Math.max(box.y, Math.min(anchor.y, box.y + box.h))
  };
}
function boxesOverlap(a, b, margin = 10) {
  return !(a.x + a.w + margin < b.x || b.x + b.w + margin < a.x || a.y + a.h + margin < b.y || b.y + b.h + margin < a.y);
}
function drawLeaderLine(ctx, anchor, box, color, scale = 1) {
  const edge = nearestPointOnBox(box, anchor);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, Math.round(3 * Math.min(scale, 1.6)));
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(edge.x, edge.y);
  ctx.stroke();
  ctx.restore();
}
function drawCalloutLabel(ctx, textLines, anchor, candidates, ok, scale, occupied, bounds) {
  const color = ok ? '#7CFC00' : '#ef4444';
  const size = measureLabeledBox(ctx, textLines, scale);
  const fits = (box) => box.x >= 6 && box.y >= 6 && box.x + box.w <= bounds.w - 6 && box.y + box.h <= bounds.h - 6;
  const candidateBoxes = (candidates || []).map(candidate => {
    const align = candidate.align === 'right' ? 'right' : 'left';
    return {
      ...candidate,
      x: align === 'right' ? Math.round(candidate.x - size.w) : Math.round(candidate.x),
      y: Math.round(candidate.y),
      w: size.w,
      h: size.h,
      align
    };
  });
  let chosen = candidateBoxes.find(box => fits(box) && !(occupied || []).some(other => boxesOverlap(box, other, Math.round(12 * Math.min(scale, 1.5)))));
  if (!chosen) chosen = candidateBoxes.find(box => fits(box)) || candidateBoxes[0] || { x: anchor.x + 20, y: anchor.y - 20, w: size.w, h: size.h, align: 'left' };
  const rendered = drawLabeledBox(ctx, chosen.x, chosen.y, textLines, ok, { scale, dx: 0, dy: 0 });
  drawLeaderLine(ctx, anchor, rendered, color, scale);
  occupied?.push(rendered);
  return rendered;
}
function anchorMetersFromToken(runway, dep, token, features = {}) {
  const raw = String(token || '').trim();
  if (!raw) return null;
  const [kind, target] = raw.split(':');
  const ref = String(runway?.referenceEnd || '');
  const opp = String(oppositeEnd(runway) || '');
  if (kind === 'PAV' || kind === 'THR') return String(target) === ref ? 0 : Number(runway?.lengthM || 0);
  if (kind === 'INT') {
    const it = (runway?.intersections || []).find(item => String(item.id) === String(target));
    return it ? Number(it.metersFromRef || 0) : null;
  }
  if (kind === 'OP') {
    const op = Number(features?.[target]?.operationalStartM || features?.operationalStartM || 0);
    if (!(op > 0)) return null;
    return String(target) === ref ? Math.min(Number(runway?.lengthM || 0), op) : Math.max(0, Number(runway?.lengthM || 0) - op);
  }
  return null;
}
async function renderAdcPreviewToCanvas(out) {
  const payload = adcPreviewState.payload;
  if (!payload?.chart?.src || !payload?.runway) return false;
  const imgSrc = resolveFrameAssetSrc(adcFrame, payload.chart.src);
  const img = await loadImage(imgSrc);
  if (!img) return false;
  const canonicalWidth = Number(payload.chart.size?.width || 0);
  const canonicalHeight = Number(payload.chart.size?.height || 0);
  const width = canonicalWidth > 0 ? canonicalWidth : (img.naturalWidth || 1000);
  const height = canonicalHeight > 0 ? canonicalHeight : (img.naturalHeight || 1400);
  const bounds = { w: width, h: height };
  const labelScale = Math.max(1.18, Math.min(2.45, width / 980));
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const runway = payload.runway;
  const analysis = payload.analysis || {};
  const rows = [...(analysis.rows || [])];
  const fullRow = rows.find(row => row.id === 'FULL') || rows[0] || null;
  const g = runwayGeometry(runway);
  const occupied = [];

  const drawRequiredArrow = () => {
    const rto = Math.round(Number(payload.rto || 0));
    const available = Number(analysis.metrics?.asda?.fullLength || fullRow?.availableAsda || runway.lengthM || 0);
    const startMeters = Number(analysis.metrics?.asda?.startMeters);
    const endMeters = Number(analysis.metrics?.asda?.endMeters);
    const hasMetrics = Number.isFinite(startMeters) && Number.isFinite(endMeters);
    const startBase = hasMetrics ? startMeters : (Number(analysis.meta?.fullLengthMetersFromRef));
    const endBase = hasMetrics ? endMeters : Number(runway.lengthM || 0);
    const usable = Math.max(0, available);
    const req = Math.max(0, Math.min(usable, rto));
    const dep = String(payload.departureEnd || '');
    const depIsOpp = dep === String(oppositeEnd(runway) || '');
    const startMRef = depIsOpp ? startBase - Math.max(0, usable - req) : startBase + Math.max(0, usable - req);
    const endMRef = endBase;
    const s = pointAtMetersFromRef(runway, startMRef);
    const e = pointAtMetersFromRef(runway, endMRef);
    ctx.save();
    ctx.strokeStyle = rto <= usable ? '#7CFC00' : '#ef4444';
    ctx.fillStyle = rto <= usable ? '#7CFC00' : '#ef4444';
    ctx.lineWidth = Math.max(5, runway.widthPx * 0.18);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    const len = Math.max(1, Math.hypot(e.x - s.x, e.y - s.y));
    const ux = (e.x - s.x) / len, uy = (e.y - s.y) / len, px = -uy, py = ux;
    const ah = 16, aw = 10;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.x - ux * ah + px * aw, e.y - uy * ah + py * aw);
    ctx.lineTo(e.x - ux * ah - px * aw, e.y - uy * ah - py * aw);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const anchor = { x: s.x + (e.x - s.x) * 0.28, y: s.y + (e.y - s.y) * 0.28 };
    const side = depIsOpp ? -1 : 1;
    drawCalloutLabel(ctx, ['RTO', `${rto} m`], anchor, [
      { x: anchor.x + g.px * 108 * side, y: anchor.y + g.py * 108 * side - 28, align: (g.px * side) > 0 ? 'left' : 'right' },
      { x: anchor.x + g.px * 126 * side, y: anchor.y + g.py * 126 * side - 4, align: (g.px * side) > 0 ? 'left' : 'right' },
      { x: anchor.x - g.px * 96 * side, y: anchor.y - g.py * 96 * side - 18, align: (g.px * side) > 0 ? 'right' : 'left' }
    ], rto <= usable, labelScale, occupied, bounds);
  };

  const drawOperationalRestriction = () => {
    const visual = analysis.visual || {};
    const features = analysis.features || runway.endFeatures?.[payload.departureEnd] || {};
    const dep = String(payload.departureEnd || '');
    const defaultStart = `PAV:${dep}`;
    const defaultEnd = `OP:${dep}`;
    const startToken = visual?.restrictedSegment?.start || defaultStart;
    const endToken = visual?.restrictedSegment?.end || defaultEnd;
    const featureMap = runway.endFeatures || { [dep]: features };
    const startMeters = anchorMetersFromToken(runway, dep, startToken, featureMap);
    const endMeters = anchorMetersFromToken(runway, dep, endToken, featureMap);
    if (!Number.isFinite(startMeters) || !Number.isFinite(endMeters) || Math.abs(endMeters - startMeters) < 1) return;
    const aM = Math.min(startMeters, endMeters);
    const bM = Math.max(startMeters, endMeters);
    const s1 = pointAtMetersFromRef(runway, aM);
    const s2 = pointAtMetersFromRef(runway, bM);
    const bandHalf = Math.max(runway.widthPx * 0.72, 12);
    ctx.save();
    ctx.fillStyle = visual?.restrictedBandColor || 'rgba(239,68,68,0.96)';
    ctx.beginPath();
    ctx.moveTo(s1.x + g.px * bandHalf, s1.y + g.py * bandHalf);
    ctx.lineTo(s2.x + g.px * bandHalf, s2.y + g.py * bandHalf);
    ctx.lineTo(s2.x - g.px * bandHalf, s2.y - g.py * bandHalf);
    ctx.lineTo(s1.x - g.px * bandHalf, s1.y - g.py * bandHalf);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const opPoint = pointAtMetersFromRef(runway, endMeters);
    const half = Math.max(runway.widthPx * 1.9, 28);
    ctx.save();
    ctx.strokeStyle = visual?.restrictedBarColor || '#ef4444';
    ctx.lineWidth = Math.max(10, runway.widthPx * 0.42);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(opPoint.x + g.px * half, opPoint.y + g.py * half);
    ctx.lineTo(opPoint.x - g.px * half, opPoint.y - g.py * half);
    ctx.stroke();
    ctx.restore();
  };

  const drawGateBar = () => {
    const gate = pointAtMetersFromRef(runway, Number(analysis.gateMetersFromRef || 0));
    const half = runway.widthPx * 1.12;
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(gate.x + g.px * half, gate.y + g.py * half);
    ctx.lineTo(gate.x - g.px * half, gate.y - g.py * half);
    ctx.stroke();
    ctx.restore();
  };

  const drawStatusBarAtPoint = (metersFromRef, label, valueMeters, ok, dep, labelPoint = null, style = null) => {
    const axisPoint = pointAtMetersFromRef(runway, metersFromRef);
    const styleMode = style === 'twy' ? 'twy' : 'default';
    const halfMultiplier = styleMode === 'twy' ? 0.60 : 0.95;
    const minHalf = styleMode === 'twy' ? 7 : 14;
    const half = Math.max(runway.widthPx * halfMultiplier, minHalf);
    ctx.save();
    ctx.strokeStyle = ok ? '#7CFC00' : '#ef4444';
    ctx.lineWidth = styleMode === 'twy' ? Math.max(1.8, runway.widthPx * 0.072) : Math.max(4, runway.widthPx * 0.18);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(axisPoint.x + g.px * half, axisPoint.y + g.py * half);
    ctx.lineTo(axisPoint.x - g.px * half, axisPoint.y - g.py * half);
    ctx.stroke();
    ctx.restore();
    const side = dep === String(oppositeEnd(runway) || '') ? 1 : -1;
    const preferred = labelPoint || { x: axisPoint.x + g.px * side * 84, y: axisPoint.y + g.py * side * 84 };
    const alignPref = preferred.x >= axisPoint.x ? 'left' : 'right';
    drawCalloutLabel(ctx, [label, `${Math.round(valueMeters || 0)} m`], axisPoint, [
      { x: preferred.x + (alignPref === 'left' ? 10 : -10), y: preferred.y - 32, align: alignPref },
      { x: preferred.x + (alignPref === 'left' ? 14 : -14), y: preferred.y + 4, align: alignPref },
      { x: axisPoint.x + g.px * side * 104, y: axisPoint.y + g.py * side * 104 - 18, align: side * g.px >= 0 ? 'left' : 'right' },
      { x: axisPoint.x - g.px * side * 104, y: axisPoint.y - g.py * side * 104 - 18, align: side * g.px >= 0 ? 'right' : 'left' }
    ], ok, labelScale, occupied, bounds);
  };

  drawOperationalRestriction();
  drawRequiredArrow();
  drawGateBar();

  if (fullRow) {
    const dep = String(payload.departureEnd || '');
    const startPoint = analysis.metrics?.asda?.startPoint || pointAtMetersFromRef(runway, Number(analysis.meta?.fullLengthMetersFromRef || 0));
    const depLabelPoint = dep === String(oppositeEnd(runway) || '')
      ? { x: startPoint.x + g.px * 58 + g.ux * 12, y: startPoint.y + g.py * 58 + g.uy * 12 }
      : { x: startPoint.x - g.px * 58 - g.ux * 12, y: startPoint.y - g.py * 58 - g.uy * 12 };
    drawStatusBarAtPoint(Number(analysis.meta?.fullLengthMetersFromRef || fullRow.metersFromRef || 0), String(analysis.meta?.startLabel || fullRow.name || dep).trim(), Number(fullRow.availableAsda || 0), fullRow.go !== false, dep, depLabelPoint, 'default');
  }

  const dep = String(payload.departureEnd || '');
  const sorted = rows.filter(row => row.id !== 'FULL').sort((a, b) => Number(a.distStart || 0) - Number(b.distStart || 0));
  sorted.forEach(row => {
    drawStatusBarAtPoint(Number(row.metersFromRef || 0), displayTaxiLabel(row.name || row.id || ''), Number(row.availableAsda || 0), row.go !== false, dep, row.labelPoint || null, 'twy');
  });
  return true;
}
function setField(doc, id, value) {
  const el = doc.getElementById(id);
  if (!el) return false;
  el.value = value ?? '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}
function setRadio(doc, name, value) {
  const el = doc.querySelector(`input[name="${name}"][value="${value}"]`);
  if (!el) return false;
  el.checked = true;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}
function clickField(doc, id) { const el = doc.getElementById(id); if (!el) return false; el.click(); return true; }
function text(doc, id) { return (doc.getElementById(id)?.textContent || '').trim(); }
function parseLocaleNumber(raw) {
  const normalized = String(raw || '').trim().replace(/\s+/g, '');
  if (!normalized) return null;
  const tokenMatch = normalized.match(/-?[\d.,]+/);
  if (!tokenMatch) return null;
  let token = tokenMatch[0];

  const hasDot = token.includes('.');
  const hasComma = token.includes(',');

  if (hasDot && hasComma) {
    const lastDot = token.lastIndexOf('.');
    const lastComma = token.lastIndexOf(',');
    if (lastComma > lastDot) {
      token = token.replace(/\./g, '').replace(',', '.');
    } else {
      token = token.replace(/,/g, '');
    }
  } else if (hasDot) {
    const parts = token.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      token = parts.join('');
    }
  } else if (hasComma) {
    const parts = token.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      token = parts.join('');
    } else {
      token = token.replace(',', '.');
    }
  }

  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

function numberFromText(value) {
  return parseLocaleNumber(value);
}
function parseDepartureSelection(value) {
  const raw = String(value || '').trim();
  if (!raw) return { token: '', runwayId: '', dep: '' };
  if (raw.includes('::')) {
    const [runwayId, dep] = raw.split('::');
    return { token: raw, runwayId: runwayId || '', dep: dep || '' };
  }
  return { token: raw, runwayId: '', dep: raw };
}

function selectDepartureOption(select, preferredToken = '', preferredDep = '') {
  if (!select) return '';
  const options = [...select.options];
  const token = String(preferredToken || '').trim();
  const dep = String(preferredDep || '').trim();
  let match = token ? options.find(opt => opt.value === token) : null;
  if (!match && dep) {
    match = options.find(opt => String(opt.value || '').split('::')[1] === dep || String(opt.textContent || '').trim() === dep);
  }
  if (!match) match = options[0] || null;
  if (match) select.value = match.value;
  return match?.value || '';
}
function mapRtoConfig(config) {
  return ({ standard: 'standard', eaps_off: 'eapsOff', eaps_on: 'eapsOn', ibf: 'ibfInstalled' })[config] || 'standard';
}
function mapVizLabel(v) { return ({ adc: 'Carta ADC', wat: 'Carta WAT', rto: 'Carta RTO', '': 'Em branco' })[v] || 'Em branco'; }

function sanitizeDigitsInput(el, maxLen = null) {
  const allowNegative = el === els.pa || el === els.oat;
  let raw = String(el.value ?? '').trim();
  let negative = '';
  if (allowNegative && raw.startsWith('-')) negative = '-';
  const digits = raw.replace(/[^0-9]/g, '');
  el.value = negative + (maxLen ? digits.slice(0, maxLen) : digits);
}

function toggleSignedInput(el, maxLen = null) {
  const raw = String(el.value ?? '').trim();
  const wantsNegative = !raw.startsWith('-');
  const digits = raw.replace(/[^0-9]/g, '');
  el.value = `${wantsNegative ? '-' : ''}${maxLen ? digits.slice(0, maxLen) : digits}`;
  el.focus();
  const caret = el.value.length;
  try { el.setSelectionRange(caret, caret); } catch {}
}

function digitsOnlyLength(el) {
  return String(el.value ?? '').replace(/[^0-9]/g, '').length;
}

function focusNext(target) {
  if (!target) return;
  if (target === els.runBtn) { els.runBtn.focus(); return; }
  target.focus();
  target.select?.();
}


async function waitForIframe(frame, ids = []) {
  for (let i = 0; i < 120; i++) {
    try {
      const doc = frame.contentWindow?.document;
      if (doc && (!ids.length || ids.every(id => doc.getElementById(id)))) return doc;
    } catch {}
    await sleep(120);
  }
  throw new Error('iframe não ficou pronto: ' + frame.id);
}

async function waitForTruthy(readFn, timeoutMs = 5000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const value = readFn();
    if (value) return value;
    await sleep(120);
  }
  return null;
}

async function waitForFieldValue(doc, id, expected, timeoutMs = 3000) {
  const end = Date.now() + timeoutMs;
  const normalize = (value) => String(value ?? '').trim();
  while (Date.now() < end) {
    const el = doc.getElementById(id);
    if (el && normalize(el.value) === normalize(expected)) return true;
    await sleep(60);
  }
  return false;
}

async function waitForNoPendingRto(doc, timeoutMs = 4000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const pending = /recalculando|aguardando|loading|carregando/i.test(text(doc, 'statusDetail')) || /recalculando|aguardando|loading|carregando/i.test(text(doc, 'statusText'));
    if (!pending) return true;
    await sleep(60);
  }
  return false;
}

async function populateBaseOptions() {
  const doc = await waitForIframe(adcFrame, ['baseSelect', 'departureEndSelect']);
  const baseSelect = doc.getElementById('baseSelect');
  const depSelect = doc.getElementById('departureEndSelect');
  els.base.innerHTML = baseSelect.innerHTML;
  els.departure.innerHTML = depSelect.innerHTML;
  if (!els.base.value) els.base.value = baseSelect.value;
  if (!els.departure.value) els.departure.value = depSelect.value;
}

async function syncAdcSelection({ renderPreviewIfActive = false } = {}) {
  const doc = await waitForIframe(adcFrame, ['baseSelect', 'departureEndSelect']);
  const baseSelect = doc.getElementById('baseSelect');
  const depSelect = doc.getElementById('departureEndSelect');
  const desired = parseDepartureSelection(els.departure.value);
  const bridge = adcFrame.contentWindow?.__adcBridge;
  let selectedToken = desired.token;

  if (bridge?.analyzeFromBridge) {
    const payload = await bridge.analyzeFromBridge({
      baseId: els.base.value,
      runwayId: desired.runwayId || undefined,
      departureEnd: desired.dep || undefined,
      departureToken: desired.token || undefined,
      rto: numberFromText(els.rtoMetric.textContent) ?? loadCtx().rtoMeters ?? 0,
    });
    adcPreviewState.payload = payload || null;
  } else {
    setField(doc, 'baseSelect', els.base.value);
    await sleep(80);
    selectedToken = selectDepartureOption(depSelect, desired.token, desired.dep);
    if (selectedToken) setField(doc, 'departureEndSelect', selectedToken);
    await sleep(80);
    try { doc.defaultView?.analyze?.(); } catch { clickField(doc, 'analyzeBtn'); }
  }

  els.base.innerHTML = baseSelect.innerHTML;
  if (baseSelect.value) els.base.value = baseSelect.value;
  els.departure.innerHTML = depSelect.innerHTML;
  selectedToken = selectDepartureOption(els.departure, depSelect.value || desired.token, desired.dep);

  if (renderPreviewIfActive && els.visualSelect.value === 'adc') {
    await prepareEmbeddedView('adc');
    await renderPreview('adc');
    renderVisualizationMeta('adc');
  }

  pushSharedContext(collectInputs());
  return selectedToken;
}

function collectInputs() {
  const departure = parseDepartureSelection(els.departure.value);
  return {
    base: els.base.value,
    departureToken: departure.token,
    runwayId: departure.runwayId,
    departureEnd: departure.dep || els.departure.options[els.departure.selectedIndex]?.text || '',
    aircraftSet: els.aircraftSet.value || '7000',
    configuration: els.config.value,
    pressureAltitudeFt: Number(els.pa.value || 0),
    oatC: Number(els.oat.value || 0),
    weightKg: Number(els.weight.value || 0),
    headwindKt: Number(els.wind.value || 0),
    registration: (els.registration?.value || '').trim()
  };
}

function pushSharedContext(input, patch = {}) {
  const merged = {
    pressureAltitudeFt: input.pressureAltitudeFt,
    oatC: input.oatC,
    weightKg: input.weightKg,
    headwindKt: input.headwindKt,
    adcBase: input.base,
    adcDepartureEnd: input.departureEnd,
    adcDepartureToken: input.departureToken || '',
    adcRunwayId: input.runwayId || '',
    cataAircraftSet: input.aircraftSet,
    cataConfiguration: input.configuration,
    aircraftRegistration: input.registration || '',
    cataProcedure: 'clear',
    ...patch
  };
  saveCtx(merged);
}

function restoreInputsFromContext() {
  const ctx = loadCtx();
  if (ctx.adcBase) els.base.value = ctx.adcBase;
  selectDepartureOption(els.departure, ctx.adcDepartureToken || ctx.adcDepartureEnd || '', ctx.adcDepartureEnd || '');
  if (ctx.cataAircraftSet) els.aircraftSet.value = ctx.cataAircraftSet;
  if (ctx.cataConfiguration) els.config.value = ctx.cataConfiguration;
  if (ctx.aircraftRegistration && els.registration) els.registration.value = ctx.aircraftRegistration;
  if (ctx.pressureAltitudeFt != null) els.pa.value = String(ctx.pressureAltitudeFt);
  if (ctx.oatC != null) els.oat.value = String(ctx.oatC);
  if (ctx.weightKg != null) els.weight.value = String(ctx.weightKg);
  if (ctx.headwindKt != null) els.wind.value = String(ctx.headwindKt);
  if (ctx.cataVizMode) els.visualSelect.value = ctx.cataVizMode;
}

async function runWAT(input) {
  const doc = await waitForIframe(watFrame, ['procedure', 'configuration', 'pressureAltitude', 'oat', 'actualWeight', 'headwind', 'runBtn', 'maxWeight', 'margin']);
  setRadio(doc, 'aircraftSet', input.aircraftSet || '6800');
  setField(doc, 'procedure', 'clear');
  setField(doc, 'configuration', input.configuration);
  await waitForFieldValue(doc, 'procedure', 'clear');
  await waitForFieldValue(doc, 'configuration', input.configuration);
  setField(doc, 'headwind', input.headwindKt);
  setField(doc, 'pressureAltitude', input.pressureAltitudeFt);
  setField(doc, 'oat', input.oatC);
  setField(doc, 'actualWeight', input.weightKg);
  await waitForFieldValue(doc, 'pressureAltitude', input.pressureAltitudeFt);
  await waitForFieldValue(doc, 'oat', input.oatC);
  await waitForFieldValue(doc, 'actualWeight', input.weightKg);
  await waitForFieldValue(doc, 'headwind', input.headwindKt);
  await sleep(120);
  try { await doc.defaultView?.runCalculation?.(); } catch { clickField(doc, 'runBtn'); }

  const maxText = await waitForTruthy(() => {
    const t = text(doc, 'maxWeight');
    const summary = text(doc, 'statusText');
    const pending = /recalculando|aguardando|loading|carregando/i.test(summary);
    return t && t !== '—' && !pending ? t : null;
  }, 7000);
  const marginText = text(doc, 'margin');
  const summary = text(doc, 'statusText');
  const result = {
    maxText: maxText || text(doc, 'maxWeight'),
    marginText,
    maxWeightKg: numberFromText(maxText || text(doc, 'maxWeight')),
    marginKg: numberFromText(marginText),
    summary
  };
  pushSharedContext(input, { watMaxWeightKg: result.maxWeightKg, watMarginKg: result.marginKg });
  return result;
}

async function runRTO(input) {
  const doc = await waitForIframe(rtoFrame, ['configuration', 'pressureAltitude', 'oat', 'actualWeight', 'headwind', 'runBtn', 'finalMetric']);
  const metricEl = doc.getElementById('finalMetric');
  const metricFtEl = doc.getElementById('finalMetricFt');
  const statusDetailEl = doc.getElementById('statusDetail');
  const statusTextEl = doc.getElementById('statusText');
  const previousMetric = text(doc, 'finalMetric');
  if (metricEl) metricEl.textContent = '—';
  if (metricFtEl) metricFtEl.textContent = '—';
  if (statusDetailEl) statusDetailEl.textContent = 'Recalculando…';
  if (statusTextEl) statusTextEl.textContent = 'Aguardando nova leitura.';

  const mappedConfig = mapRtoConfig(input.configuration);
  setField(doc, 'configuration', mappedConfig);
  await waitForFieldValue(doc, 'configuration', mappedConfig, 3500);
  try {
    await doc.defaultView?.ensureEffectiveProfileLoaded?.({ preserveInputs: true, autoRun: false });
  } catch {}
  await waitForNoPendingRto(doc, 2500);
  try { await doc.defaultView?.clearResultsOnly?.(); } catch {}

  setField(doc, 'headwind', input.headwindKt);
  setField(doc, 'pressureAltitude', input.pressureAltitudeFt);
  setField(doc, 'oat', input.oatC);
  setField(doc, 'actualWeight', input.weightKg);

  await waitForFieldValue(doc, 'pressureAltitude', input.pressureAltitudeFt);
  await waitForFieldValue(doc, 'oat', input.oatC);
  await waitForFieldValue(doc, 'actualWeight', input.weightKg);
  await waitForFieldValue(doc, 'headwind', input.headwindKt);
  await sleep(120);

  try { await doc.defaultView?.refreshWeightSensitiveProfileIfNeeded?.(); } catch {}
  try { await doc.defaultView?.ensureEffectiveProfileLoaded?.({ preserveInputs: true, autoRun: false }); } catch {}
  await waitForNoPendingRto(doc, 2500);

  try {
    await doc.defaultView?.runCalculation?.();
  } catch {
    clickField(doc, 'runBtn');
  }

  let metricText = await waitForTruthy(() => {
    const t = text(doc, 'finalMetric');
    const pending = /recalculando|aguardando|loading|carregando/i.test(text(doc, 'statusDetail')) || /recalculando|aguardando|loading|carregando/i.test(text(doc, 'statusText'));
    return /\d/.test(t) && t !== '—' && !pending && (t !== previousMetric || previousMetric === '—') ? t : null;
  }, 8000);

  if (!metricText) {
    try { await doc.defaultView?.runCalculation?.(); } catch { clickField(doc, 'runBtn'); }
    metricText = await waitForTruthy(() => {
      const t = text(doc, 'finalMetric');
      const pending = /recalculando|aguardando|loading|carregando/i.test(text(doc, 'statusDetail')) || /recalculando|aguardando|loading|carregando/i.test(text(doc, 'statusText'));
      return /\d/.test(t) && t !== '—' && !pending ? t : null;
    }, 6000);
  }

  metricText = metricText || text(doc, 'finalMetric');
  const summary = text(doc, 'statusDetail') || text(doc, 'statusText');
  const result = {
    metricText,
    rtoMeters: numberFromText(metricText),
    summary
  };
  pushSharedContext(input, { rtoMeters: result.rtoMeters });
  return result;
}

async function runADC(input, rtoResult) {
  const doc = await waitForIframe(adcFrame, ['baseSelect', 'departureEndSelect', 'rtoInput', 'analyzeBtn', 'decisionTable']);
  const bridge = adcFrame.contentWindow?.__adcBridge;
  if (bridge?.analyzeFromBridge) {
    const payload = await bridge.analyzeFromBridge({
      baseId: input.base,
      runwayId: input.runwayId || undefined,
      departureEnd: input.departureEnd,
      departureToken: input.departureToken || undefined,
      rto: rtoResult?.rtoMeters ?? 0,
    });
    adcPreviewState.payload = payload;
    const rows = (payload?.analysis?.rows || []).map(row => ({
      id: row.id || '',
      point: row.name,
      rtoOk: row.rtoOk ? 'OK' : 'NO',
      decision: row.go ? 'PODE' : 'NO GO',
      go: !!row.go,
      availableAsda: Number(row.availableAsda || 0),
      availableMeters: Number(row.availableAsda || 0)
    }));
    const fullRow = rows.find(row => row.id === 'FULL') || rows[0] || null;
    return {
      gateText: fullRow ? `${Math.round(fullRow.availableAsda)} m` : '—',
      fullText: fullRow ? `${Math.round(fullRow.availableAsda)} m` : '—',
      rows,
      basisMetric: payload?.analysis?.basisMetric || payload?.analysis?.meta?.basisMetric || 'ASDA',
      primaryPoint: payload?.analysis?.meta?.startLabel || fullRow?.point || input?.departureEnd || '',
      payload
    };
  }

  const table = doc.getElementById('decisionTable');
  if (table) table.innerHTML = '';
  setField(doc, 'baseSelect', input.base);
  await sleep(120);
  setField(doc, 'departureEndSelect', input.departureEnd);
  if (rtoResult?.rtoMeters != null) setField(doc, 'rtoInput', rtoResult.rtoMeters);
  await sleep(60);
  try { doc.defaultView?.analyze?.(); } catch { clickField(doc, 'analyzeBtn'); }
  await waitForTruthy(() => doc.querySelectorAll('#decisionTable tr').length > 0, 4500);

  const rows = [...doc.querySelectorAll('#decisionTable tr')].map(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length < 3) return null;
    const point = tds[0].textContent.trim();
    const asdaText = (tds[1]?.textContent || '').trim();
    const rtoOkText = (tds[tds.length - 1]?.textContent || '').trim();
    const go = /^OK$/i.test(rtoOkText);
    const availableAsda = numberFromText(asdaText) || 0;
    return { id: /^(full|pista|full length|pav|thr)/i.test(point) ? 'FULL' : point, point, rtoOk: rtoOkText, decision: go ? 'PODE' : 'NO GO', go, availableAsda, availableMeters: availableAsda };
  }).filter(Boolean);

  const fullRow = rows.find(row => row.id === 'FULL') || rows[0] || null;
  return {
    gateText: fullRow ? `${Math.round(fullRow.availableAsda)} m` : text(doc, 'gateMetric'),
    fullText: fullRow ? `${Math.round(fullRow.availableAsda)} m` : text(doc, 'fullLengthMetric'),
    rows,
    basisMetric: 'ASDA',
    primaryPoint: fullRow?.point || input?.departureEnd || ''
  };
}

function renderResults(wat, rto, adc) {
  els.resultCard.classList.remove('pending');
  const decisionRows = adc?.rows || [];
  const basisMetric = adc?.basisMetric || 'ASDA';
  const watOk = wat?.marginKg != null ? wat.marginKg >= 0 : false;
  const badPoints = decisionRows.filter(row => !row.go && row.id !== 'FULL').map(row => row.point);
  const fullRunwayRow = decisionRows.find(row => row.id === 'FULL')
    || decisionRows.find(row => /^(full|pista|full length|pav|thr)/i.test(String(row.point || '').trim()))
    || decisionRows.reduce((best, row) => {
      if (row?.availableAsda == null) return best;
      if (!best || row.availableAsda > best.availableAsda) return row;
      return best;
    }, null);
  const runwayAsdaOk = fullRunwayRow ? fullRunwayRow.go : false;
  const overallOk = watOk && runwayAsdaOk;

  els.watMax.textContent = wat?.maxText || '—';
  els.rtoMetric.textContent = rto?.metricText || '—';

  if (wat?.marginKg == null) {
    els.watSummary.textContent = wat?.summary || 'Sem cálculo ainda.';
    els.watMarginSummary.textContent = '—';
  } else if (watOk) {
    els.watSummary.textContent = 'GO — peso dentro do limite WAT.';
    els.watMarginSummary.textContent = `+${Math.round(wat.marginKg)} kg de margem`;
  } else {
    els.watSummary.textContent = 'NO GO — item negativo: WAT abaixo do peso requerido.';
    els.watMarginSummary.textContent = `${Math.abs(Math.round(wat.marginKg))} kg acima do limite`;
  }

  if (!decisionRows.length) {
    els.rtoSummary.textContent = rto?.summary || 'Sem cálculo ainda.';
  } else if (runwayAsdaOk) {
    els.rtoSummary.textContent = badPoints.length
      ? `GO — ${basisMetric} da pista comporta o RTO. Restrição por ponto: ${badPoints.join(', ')}.`
      : `GO — ${basisMetric} da pista comporta o RTO.`;
  } else {
    const refPoint = adc?.primaryPoint || fullRunwayRow?.point || '';
    const refSuffix = refPoint ? ` (${refPoint})` : '';
    els.rtoSummary.textContent = `NO GO — item negativo: RTO maior que a ${basisMetric} disponível da pista${refSuffix}.`;
  }

  els.watBox.classList.remove('ok', 'bad');
  els.rtoBox.classList.remove('ok', 'bad');
  if (wat?.marginKg != null) els.watBox.classList.add(watOk ? 'ok' : 'bad');
  if (decisionRows.length) els.rtoBox.classList.add(runwayAsdaOk ? 'ok' : 'bad');

  els.statusChip.textContent = overallOk ? 'OK para decolagem' : 'NO GO / revisar limites';
  els.statusChip.className = 'status-chip ' + (overallOk ? 'ok' : 'bad');
  els.resultCard.classList.remove('result-ok', 'result-bad', 'pending');
  els.resultCard.classList.add(overallOk ? 'result-ok' : 'result-bad');

  if (!decisionRows.length) {
    els.decisionBody.innerHTML = '<tr><td colspan="2" class="muted-cell">Sem análise ainda.</td></tr>';
    return;
  }
  els.decisionBody.innerHTML = decisionRows.map(row => `
    <tr>
      <td>${row.point}</td>
      <td class="${row.go ? 'td-ok' : 'td-bad'}">${row.go ? 'OK' : 'NO'}</td>
    </tr>
  `).join('');
}

function saveResultSnapshot(input, wat, rto, adc) {
  pushSharedContext(input, {
    cataLastResults: {
      input,
      wat: wat || null,
      rto: rto || null,
      adc: adc || null,
      savedAt: new Date().toISOString()
    }
  });
}

function restoreSavedResults() {
  const ctx = loadCtx();
  const snap = ctx?.cataLastResults;
  if (!snap?.wat || !snap?.rto || !snap?.adc) return false;
  const current = collectInputs();
  const saved = snap.input || {};
  const sameInput = [
    current.base === saved.base,
    current.departureEnd === saved.departureEnd,
    current.runwayId === saved.runwayId,
    current.aircraftSet === saved.aircraftSet,
    current.configuration === saved.configuration,
    Number(current.pressureAltitudeFt || 0) === Number(saved.pressureAltitudeFt || 0),
    Number(current.oatC || 0) === Number(saved.oatC || 0),
    Number(current.weightKg || 0) === Number(saved.weightKg || 0),
    Number(current.headwindKt || 0) === Number(saved.headwindKt || 0)
  ].every(Boolean);
  if (!sameInput) return false;
  adcPreviewState.payload = snap?.adc?.payload || null;
  renderResults(snap.wat, snap.rto, snap.adc);
  return true;
}

function toggleVizFullscreen(force = null) {
  if (force === false) { closeFullscreenChart(); return; }
  const activeMode = els.visualSelect.value || document.querySelector('.viewer-tab.active')?.dataset.viz;
  if (!activeMode) return;
  openFullscreenChart(activeMode);
}
window.toggleCataVizFullscreen = toggleVizFullscreen;

function setSidebarCollapsed(force = null) {
  const on = force == null ? !document.body.classList.contains('sidebar-collapsed') : !!force;
  document.body.classList.toggle('sidebar-collapsed', on);
}

function addFullscreenClick(doc, selector) {
  const target = doc.querySelector(selector);
  if (!target || target.dataset.cataFullscreenBound === '1') return;
  target.dataset.cataFullscreenBound = '1';
  target.addEventListener('click', () => parent.toggleCataVizFullscreen?.(), { passive: true });
}

function applyUnifiedChartView(doc, mode) {
  if (doc.getElementById('cataEmbedStyleUnified')) return;

  if (mode === 'wat') {
    doc.getElementById('chartPanel')?.classList.remove('hidden');
    const main = doc.querySelector('main.app-shell');
    const section = doc.getElementById('chartPanel')?.closest('section');
    if (!main || !section) return;
    [...main.children].forEach(el => { el.style.display = el === section ? '' : 'none'; });
    section.style.padding = '0';
    section.style.margin = '0';
    section.style.border = '0';
    section.style.borderRadius = '0';
    section.style.background = '#000';
    const style = doc.createElement('style');
    style.id = 'cataEmbedStyleUnified';
    style.textContent = `
      html,body{height:100%;margin:0;background:#000!important}
      body{overflow:hidden}
      main.app-shell{padding:0!important;display:block!important}
      #chartPanel{display:block!important;padding:0!important;margin:0!important}
      .card-title-row,.toolbar-row,.legend,#chartHint,#chartReference,.hero,.topbar,.form-card,.status,.interp-box,#interpSection,.top-embed-bar,.back-chip,.home-chip{display:none!important}
      .chart-stage{margin:0!important;display:block!important;overflow:hidden!important;background:#000!important;border-radius:0!important;padding:0!important;height:auto!important;min-height:0!important}
      #chartBaseImage{display:block!important;width:100%!important;height:auto!important;max-width:100%!important;max-height:none!important}
      #chartCanvas{width:100%!important;height:auto!important;display:block!important}
    `;
    doc.head.appendChild(style);
    addFullscreenClick(doc, '.chart-stage');
    return;
  }

  if (mode === 'rto') {
    doc.getElementById('chartPanel')?.classList.remove('hidden');
    const main = doc.querySelector('main.app-shell');
    const section = doc.getElementById('chartPanel')?.closest('section');
    if (!main || !section) return;
    [...main.children].forEach(el => { el.style.display = el === section || el.id === 'chartFullscreen' ? '' : 'none'; });
    section.style.padding = '0';
    section.style.margin = '0';
    section.style.border = '0';
    section.style.borderRadius = '0';
    section.style.background = '#000';
    const style = doc.createElement('style');
    style.id = 'cataEmbedStyleUnified';
    style.textContent = `
      html,body{height:100%;margin:0;background:#000!important}
      body{overflow:hidden}
      main.app-shell{padding:0!important;display:block!important}
      #chartPanel{display:block!important;padding:0!important;margin:0!important}
      .card-title-row,.toolbar-row,.legend,#chartHint,#chartReference,.hero,.topbar,.form-card,.status,.compact,#interpSection,.pill,.top-embed-bar,.back-chip,.home-chip{display:none!important}
      .chart-stage{margin:0!important;display:block!important;overflow:hidden!important;background:#000!important;border-radius:0!important;cursor:zoom-in;padding:0!important;height:auto!important;min-height:0!important}
      #chartCanvas{width:100%!important;height:auto!important;max-width:100%!important;display:block!important}
    `;
    doc.head.appendChild(style);
    addFullscreenClick(doc, '.chart-stage');
    return;
  }

  if (mode === 'adc') {
    const style = doc.createElement('style');
    style.id = 'cataEmbedStyleUnified';
    style.textContent = `
      html,body{margin:0;background:#000!important;height:auto!important;min-height:0!important}
      body{overflow:hidden}
      .shell{padding:0!important;gap:0!important;display:block!important;grid-template-columns:1fr!important;min-height:0!important;height:auto!important}
      .left{display:none!important}
      .right{display:block!important;border:0!important;border-radius:0!important;box-shadow:none!important;min-height:0!important;height:auto!important;background:#000!important}
      .viz-head,.legend,.capture-banner,.topbar,.top-embed-bar,.back-chip,.home-chip{display:none!important}
      .viz-wrap{background:#000!important;cursor:zoom-in;display:block!important;overflow:hidden!important;height:auto!important;min-height:0!important;line-height:0!important;flex:none!important}
      #vizCanvas{width:100%!important;height:auto!important;max-width:100%!important;max-height:none!important;background:#000!important;display:block!important;vertical-align:top}
      .right,.shell{height:auto!important;min-height:0!important;align-items:flex-start!important}
      .chart-close{display:none!important}
    `;
    doc.head.appendChild(style);
    addFullscreenClick(doc, '#vizWrap');
  }
}

async function refreshEmbeddedSizing(mode, doc = null) {
  const frame = frameMap[mode];
  if (!frame) return;
  try {
    const targetDoc = doc || frame.contentDocument || frame.contentWindow?.document;
    const win = frame.contentWindow || targetDoc?.defaultView;
    if (mode === 'adc') {
      frame.style.width = '1280px';
      if (!frame.style.height) frame.style.height = '1800px';
      frame.style.visibility = 'visible';
      frame.style.opacity = '0';
      await sleep(40);
      try { win?.resizeCanvas?.(); } catch {}
      try { win?.draw?.(); } catch {}
      await sleep(80);
      resizeActiveFrame(mode);
      try { win?.resizeCanvas?.(); } catch {}
      try { win?.draw?.(); } catch {}
      await sleep(40);
      return;
    }
    try { win?.dispatchEvent?.(new Event('resize')); } catch {}
    await sleep(40);
    resizeActiveFrame(mode);
  } catch (error) {
    console.warn('Falha ao reajustar visualização', mode, error);
  }
}

async function prepareEmbeddedView(mode) {
  try {
    const doc = await waitForIframe(frameMap[mode]);
    applyUnifiedChartView(doc, mode);
    await refreshEmbeddedSizing(mode, doc);
    return doc;
  } catch (error) {
    console.warn('Falha ao preparar visualização', mode, error);
    return null;
  }
}


function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;' }[ch]));
}

function parseReferenceHtml(html) {
  if (!html) return [];
  const lines = String(html).split(/<br\s*\/?>(?:\s*)/i).map(line => line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  return lines.map(line => {
    const idx = line.indexOf(':');
    if (idx > -1) return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    return { label: 'Info', value: line.trim() };
  });
}

function getLegendForMode(mode) {
  if (mode === 'wat') return [
    { color: '#ffffff', label: 'Max weight interpolado' },
    { color: '#52a8ff', label: 'Peso atual' },
    { color: '#62FF9C', label: 'Dentro' },
    { color: '#FF4040', label: 'Fora' },
  ];
  if (mode === 'rto') return [
    { color: '#f3b447', label: 'PA / curvas OAT usadas' },
    { color: '#3dd9ff', label: 'Transferência' },
    { color: '#62FF9C', label: 'Curvas de peso usadas' },
    { color: '#ff66cc', label: 'Correction / Reference line' },
  ];
  if (mode === 'adc') return [
    { color: '#7CFC00', label: 'OK / disponível' },
    { color: '#ef4444', label: 'Não OK' },
    { color: '#f59e0b', label: 'Gate operacional' },
  ];
  return [];
}

function getVisualizationMeta(mode) {
  if (!mode) return { legend: [], facts: [] };
  if (mode === 'adc') {
    const baseText = els.base.options[els.base.selectedIndex]?.text || els.base.value || '—';
    const depText = els.departure.options[els.departure.selectedIndex]?.text || els.departure.value || '—';
    return {
      legend: getLegendForMode('adc'),
      facts: [
        { label: 'Gráfico', value: 'ADC' },
        { label: 'Página', value: 'Page 1' },
        { label: 'Base', value: baseText },
        { label: 'Cabeceira', value: depText },
      ]
    };
  }

  const frame = frameMap[mode];
  const doc = frame?.contentDocument;
  const refHtml = doc?.getElementById('chartReference')?.innerHTML || '';
  const facts = parseReferenceHtml(refHtml);
  return {
    legend: getLegendForMode(mode),
    facts
  };
}

function renderVisualizationMeta(mode) {
  const meta = getVisualizationMeta(mode);
  if (!mode) {
    els.viewerMeta.hidden = true;
    els.vizLegend.innerHTML = '';
    els.vizFacts.innerHTML = '';
    return;
  }
  els.viewerMeta.hidden = false;
  els.vizLegend.innerHTML = (meta.legend || []).map(item => `
    <span class="viz-legend-item"><span class="viz-swatch" style="background:${escapeHtml(item.color)}"></span>${escapeHtml(item.label)}</span>
  `).join('');
  els.vizFacts.innerHTML = (meta.facts || []).map(item => `
    <div class="viz-fact">
      <span class="viz-fact-label">${escapeHtml(item.label)}</span>
      <span class="viz-fact-value">${escapeHtml(item.value)}</span>
    </div>
  `).join('');
}


function getModeContentHeight(doc, mode) {
  if (!doc) return 0;
  const byRect = (el) => el ? Math.ceil(el.getBoundingClientRect().height) : 0;
  if (mode === 'adc') {
    return Math.ceil(doc.defaultView?.__cataEmbedContentHeight || 0) || byRect(doc.getElementById('vizCanvas')) || byRect(doc.getElementById('vizWrap'));
  }
  if (mode === 'wat') {
    return Math.max(byRect(doc.getElementById('chartBaseImage')), byRect(doc.getElementById('chartCanvas')), 0);
  }
  if (mode === 'rto') {
    return byRect(doc.getElementById('chartCanvas')) || byRect(doc.getElementById('chartStage'));
  }
  const body = doc.body;
  const html = doc.documentElement;
  return Math.max(body?.scrollHeight || 0, body?.offsetHeight || 0, html?.scrollHeight || 0, html?.offsetHeight || 0);
}


function getSourceCanvas(mode) {
  try {
    if (mode === 'adc') return adcFrame.contentDocument?.getElementById('vizCanvas') || null;
    if (mode === 'wat') return watFrame.contentDocument?.getElementById('chartCanvas') || null;
    if (mode === 'rto') return rtoFrame.contentDocument?.getElementById('chartCanvas') || null;
  } catch {}
  return null;
}

function getCanvasCrop(source, mode = '') {
  if (!source) return null;
  try {
    if (mode === 'adc') {
      const rect = adcFrame.contentWindow?.__cataEmbedSourceRect;
      if (rect && rect.w > 0 && rect.h > 0) return rect;
    }
  } catch {}
  const tmp = document.createElement('canvas');
  tmp.width = source.width;
  tmp.height = source.height;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  tctx.drawImage(source, 0, 0);
  const data = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
  let minX = tmp.width, minY = tmp.height, maxX = -1, maxY = -1;
  for (let y = 0; y < tmp.height; y++) {
    for (let x = 0; x < tmp.width; x++) {
      const i = (y * tmp.width + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a < 8) continue;
      const isDarkBg = (r < 20 && g < 30 && b < 45);
      if (isDarkBg) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0 || maxY < 0) return { x: 0, y: 0, w: tmp.width, h: tmp.height };
  const pad = 12;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(tmp.width - 1, maxX + pad);
  maxY = Math.min(tmp.height - 1, maxY + pad);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function syncViewerStageHeight(px = null) {
  if (!els.vizWrap) return;
  if (px == null) {
    els.vizWrap.style.height = '';
    els.vizWrap.style.minHeight = '';
    return;
  }
  const h = Math.max(120, Math.round(px));
  els.vizWrap.style.height = `${h}px`;
  els.vizWrap.style.minHeight = `${h}px`;
}

async function renderPreview(mode) {
  const out = els.vizPreviewCanvas;

  const stageWidth = Math.max(320, els.viewerPane.getBoundingClientRect().width - 2);
  if (mode === 'adc') {
    await refreshEmbeddedSizing(mode);
    const expectedSrc = adcPreviewState.payload?.chart?.src ? resolveFrameAssetSrc(adcFrame, adcPreviewState.payload.chart.src) : '';
    if (expectedSrc) await waitForAdcChartMatch(expectedSrc, 1800);
    const ok = await renderAdcPreviewToCanvas(out);
    if (ok) {
      const scale = stageWidth / out.width;
      const displayHeight = Math.round(out.height * scale);
      out.style.width = stageWidth + 'px';
      out.style.height = displayHeight + 'px';
      out.hidden = false;
      out.dataset.mode = mode;
      syncViewerStageHeight(displayHeight);
      return true;
    }
  }

  const source = getSourceCanvas(mode);
  const sourceReady = !!source && source.width > 48 && source.height > 48;
  if (sourceReady) {
    const crop = getCanvasCrop(source, mode);
    const scale = stageWidth / crop.w;
    const displayHeight = Math.round(crop.h * scale);
    out.width = crop.w;
    out.height = crop.h;
    out.style.width = stageWidth + 'px';
    out.style.height = displayHeight + 'px';
    const ctx = out.getContext('2d');
    ctx.clearRect(0, 0, out.width, out.height);
    ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    out.hidden = false;
    out.dataset.mode = mode;
    syncViewerStageHeight(displayHeight);
    return true;
  }

  out.hidden = true;
  syncViewerStageHeight(null);
  return false;
}

function resizeActiveFrame(mode) {
  const frame = frameMap[mode];
  if (!frame) return;
  try {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    const h = getModeContentHeight(doc, mode);
    if (h > 0) frame.style.height = `${h}px`;
  } catch (error) {
    console.warn('Falha ao ajustar altura do frame', mode, error);
  }
}

function clearVisualization() {
  Object.values(frameMap).forEach(frame => frame.classList.remove('active'));
  document.querySelectorAll('.viewer-tab').forEach(btn => btn.classList.remove('active'));
  els.viewerPane.classList.add('is-empty');
  els.vizPlaceholder.hidden = false;
  els.vizPreviewCanvas.hidden = true;
  syncViewerStageHeight(null);
  adcPreviewState.payload = null;
  els.vizSubtitle.textContent = mapVizLabel('');
  els.visualSelect.value = '';
  saveCtx({ cataVizMode: '' });
  renderVisualizationMeta('');
}

const fullscreenEls = {
  overlay: document.getElementById('chartFullscreenOverlay'),
  viewport: document.getElementById('chartFullscreenViewport'),
  canvas: document.getElementById('chartFullscreenCanvas'),
  close: document.getElementById('chartFullscreenClose'),
};
const fullscreenState = { active: false, scale: 1, minScale: 1, maxScale: 4, x: 0, y: 0, startX: 0, startY: 0, dragging: false, moved: false };


function drawFullscreenSource(mode) {
  const out = fullscreenEls.canvas;
  const ctx = out.getContext('2d');

  const preview = els.vizPreviewCanvas;
  if (preview && !preview.hidden && preview.width > 1 && preview.height > 1 && (preview.dataset.mode || els.visualSelect.value) === mode) {
    out.width = preview.width;
    out.height = preview.height;
    ctx.clearRect(0, 0, out.width, out.height);
    ctx.drawImage(preview, 0, 0, preview.width, preview.height, 0, 0, preview.width, preview.height);
    return true;
  }

  const source = getSourceCanvas(mode);
  if (!source) return false;
  const crop = getCanvasCrop(source, mode);
  out.width = crop.w;
  out.height = crop.h;
  ctx.clearRect(0,0,out.width,out.height);
  ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  return true;
}


function clampFullscreenPan() {
  const vp = fullscreenEls.viewport;
  const c = fullscreenEls.canvas;
  const scaledW = c.width * fullscreenState.scale;
  const scaledH = c.height * fullscreenState.scale;
  const minX = Math.min(0, vp.clientWidth - scaledW);
  const minY = Math.min(0, vp.clientHeight - scaledH);
  const maxX = Math.max(0, vp.clientWidth - scaledW);
  const maxY = Math.max(0, vp.clientHeight - scaledH);
  if (scaledW <= vp.clientWidth) {
    fullscreenState.x = (vp.clientWidth - scaledW) / 2;
  } else {
    fullscreenState.x = Math.min(maxX, Math.max(minX, fullscreenState.x));
  }
  if (scaledH <= vp.clientHeight) {
    fullscreenState.y = (vp.clientHeight - scaledH) / 2;
  } else {
    fullscreenState.y = Math.min(maxY, Math.max(minY, fullscreenState.y));
  }
}

function applyFullscreenTransform() {
  clampFullscreenPan();
  fullscreenEls.canvas.style.transform = `translate(${fullscreenState.x}px, ${fullscreenState.y}px) scale(${fullscreenState.scale})`;
}

function fitFullscreenCanvas() {
  const vp = fullscreenEls.viewport;
  const c = fullscreenEls.canvas;
  const scale = Math.min(vp.clientWidth / c.width, vp.clientHeight / c.height);
  fullscreenState.scale = scale;
  fullscreenState.minScale = scale;
  fullscreenState.maxScale = Math.max(4, scale * 4);
  fullscreenState.x = (vp.clientWidth - c.width * scale) / 2;
  fullscreenState.y = (vp.clientHeight - c.height * scale) / 2;
  applyFullscreenTransform();
}

function zoomFullscreen(nextScale, cx = null, cy = null) {
  const vp = fullscreenEls.viewport;
  const prevScale = fullscreenState.scale;
  const clamped = Math.max(fullscreenState.minScale, Math.min(fullscreenState.maxScale, nextScale));
  if (Math.abs(clamped - prevScale) < 0.001) return;
  if (cx == null) cx = vp.clientWidth / 2;
  if (cy == null) cy = vp.clientHeight / 2;
  const worldX = (cx - fullscreenState.x) / prevScale;
  const worldY = (cy - fullscreenState.y) / prevScale;
  fullscreenState.scale = clamped;
  fullscreenState.x = cx - worldX * clamped;
  fullscreenState.y = cy - worldY * clamped;
  applyFullscreenTransform();
}

function closeFullscreenChart() {
  fullscreenState.active = false;
  fullscreenState.dragging = false;
  fullscreenState.moved = false;
  fullscreenEls.overlay.hidden = true;
  document.body.classList.remove('fullscreen-body');
}

function openFullscreenChart(mode) {
  if (!drawFullscreenSource(mode)) return;
  fullscreenState.active = true;
  fullscreenState.moved = false;
  fullscreenEls.overlay.hidden = false;
  document.body.classList.add('fullscreen-body');
  fitFullscreenCanvas();
}

function setVisualization(mode, forceShow = true) {
  if (!mode) {
    clearVisualization();
    return;
  }
  if (forceShow) {
    els.viewerPane.classList.remove('is-empty');
    els.vizPlaceholder.hidden = true;
  }
  Object.entries(frameMap).forEach(([key, frame]) => frame.classList.toggle('active', key === mode));
  document.querySelectorAll('.viewer-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.viz === mode));
  els.visualSelect.value = mode;
  saveCtx({ cataVizMode: mode });
  els.vizSubtitle.textContent = mapVizLabel(mode);
  renderVisualizationMeta(mode);
  const prep = prepareEmbeddedView(mode);
  prep.then(async () => {
    await sleep(mode === 'adc' ? 90 : 120);
    await renderPreview(mode);
    renderVisualizationMeta(mode);
  });
}

function setupAutoAdvance() {
  const rules = [
    { el: els.aircraftSet, next: els.config },
    { el: els.config, next: els.base },
    { el: els.base, next: els.departure },
    { el: els.departure, next: els.registration },
    { el: els.registration, next: els.pa },
    { el: els.pa, next: els.oat, minDigits: 3, maxDigits: 5 },
    { el: els.oat, next: els.weight, minDigits: 2, maxDigits: 2 },
    { el: els.weight, next: els.wind, minDigits: 4, maxDigits: 4 },
    { el: els.wind, next: els.runBtn, minDigits: 1, maxDigits: 2 },
  ];

  rules.forEach((rule) => {
    if (!rule.el) return;
    if (rule.el.tagName === 'SELECT') {
      rule.el.addEventListener('change', () => focusNext(rule.next));
      return;
    }

    if (rule.el === els.registration) {
      rule.el.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        focusNext(rule.next);
      });
      return;
    }

    rule.el.addEventListener('input', () => {
      sanitizeDigitsInput(rule.el, rule.maxDigits);
      const digits = digitsOnlyLength(rule.el);
      if (rule.el === els.oat ? digits === rule.minDigits : digits >= rule.minDigits) {
        focusNext(rule.next);
      }
    });

    rule.el.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (rule.next === els.runBtn) els.runBtn.click();
      else focusNext(rule.next);
    });
  });

  els.paNegativeBtn?.addEventListener('click', () => toggleSignedInput(els.pa, 5));
  els.oatNegativeBtn?.addEventListener('click', () => toggleSignedInput(els.oat, 2));
}

async function runFlow() {
  const input = collectInputs();
  pushSharedContext(input);
  els.statusChip.textContent = 'Calculando…';
  els.statusChip.className = 'status-chip warn';
  els.resultCard.classList.remove('result-ok', 'result-bad');
  try {
    const wat = await runWAT(input);
    const rto = await runRTO(input);
    const adc = await runADC(input, rto);
    renderResults(wat, rto, adc);
    saveResultSnapshot(input, wat, rto, adc);
    setVisualization(els.visualSelect.value || 'adc');
  } catch (error) {
    console.error(error);
    els.statusChip.textContent = 'Erro na integração';
    els.statusChip.className = 'status-chip bad';
    els.resultCard.classList.remove('result-ok');
    els.resultCard.classList.add('result-bad');
  }
}

function saveCurrentInputsForModuleOpen() {
  const input = collectInputs();
  pushSharedContext(input);
  return input;
}

function bindEvents() {
  els.runBtn.addEventListener('click', runFlow);
  els.visualSelect.addEventListener('change', e => setVisualization(e.target.value, !!e.target.value));
  document.querySelectorAll('.viewer-tab').forEach(btn => btn.addEventListener('click', () => setVisualization(btn.dataset.viz, true)));
  els.base.addEventListener('change', () => { syncAdcSelection({ renderPreviewIfActive: true }).catch(console.warn); });
  els.departure.addEventListener('change', () => { syncAdcSelection({ renderPreviewIfActive: true }).catch(console.warn); });
  els.openWATBtn.addEventListener('click', () => {
    saveCurrentInputsForModuleOpen();
    location.href = '../wat/?back=1&return=' + encodeURIComponent('../cata/');
  });
  els.openRTOBtn.addEventListener('click', () => {
    saveCurrentInputsForModuleOpen();
    location.href = '../rto/?back=1&return=' + encodeURIComponent('../cata/');
  });
  els.openADCBtn.addEventListener('click', () => {
    saveCurrentInputsForModuleOpen();
    location.href = '../adc/?back=1&return=' + encodeURIComponent('../cata/');
  });
  els.sidebarToggleBtn.addEventListener('click', () => setSidebarCollapsed());
  els.vizPreviewCanvas.addEventListener('click', () => { const mode = els.vizPreviewCanvas.dataset.mode || els.visualSelect.value; if (mode) openFullscreenChart(mode); });
  fullscreenEls.close.addEventListener('click', (event) => {
    event.stopPropagation();
    closeFullscreenChart();
  });

  fullscreenEls.viewport.addEventListener('click', (event) => {
    if (event.target === fullscreenEls.close) return;
    if (fullscreenState.scale <= fullscreenState.minScale + 0.01 && !fullscreenState.moved) closeFullscreenChart();
    fullscreenState.moved = false;
  });
  fullscreenEls.viewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = fullscreenEls.viewport.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.15 : 0.87;
    zoomFullscreen(fullscreenState.scale * factor, cx, cy);
  }, { passive: false });
  fullscreenEls.viewport.addEventListener('pointerdown', (event) => {
    if (fullscreenState.scale <= fullscreenState.minScale + 0.01) {
      fullscreenState.dragging = false;
      fullscreenState.moved = false;
      return;
    }
    fullscreenState.dragging = true;
    fullscreenState.moved = false;
    fullscreenState.startX = event.clientX - fullscreenState.x;
    fullscreenState.startY = event.clientY - fullscreenState.y;
    fullscreenEls.viewport.setPointerCapture?.(event.pointerId);
  });
  fullscreenEls.viewport.addEventListener('pointermove', (event) => {
    if (!fullscreenState.dragging) return;
    fullscreenState.x = event.clientX - fullscreenState.startX;
    fullscreenState.y = event.clientY - fullscreenState.startY;
    fullscreenState.moved = true;
    applyFullscreenTransform();
  });
  const endDrag = (event) => {
    fullscreenState.dragging = false;
    if (event?.pointerId != null) fullscreenEls.viewport.releasePointerCapture?.(event.pointerId);
  };
  fullscreenEls.viewport.addEventListener('pointerup', endDrag);
  fullscreenEls.viewport.addEventListener('pointercancel', endDrag);
  let touchDist = null;
  let touchScale = null;
  let touchCenter = null;
  fullscreenEls.viewport.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      const [a,b] = event.touches;
      touchDist = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      touchScale = fullscreenState.scale;
      const rect = fullscreenEls.viewport.getBoundingClientRect();
      touchCenter = { x: ((a.clientX+b.clientX)/2)-rect.left, y: ((a.clientY+b.clientY)/2)-rect.top };
      fullscreenState.moved = true;
    }
  }, { passive: true });
  fullscreenEls.viewport.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && touchDist) {
      const [a,b] = event.touches;
      const newDist = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      zoomFullscreen(touchScale * (newDist / touchDist), touchCenter?.x, touchCenter?.y);
      fullscreenState.moved = true;
    }
  }, { passive: true });
  fullscreenEls.viewport.addEventListener('touchend', () => { touchDist = null; touchScale = null; touchCenter = null; });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && fullscreenState.active) closeFullscreenChart();
  });
  window.addEventListener('resize', () => { if (fullscreenState.active) fitFullscreenCanvas(); });
}

window.addEventListener('load', async () => {
  bindEvents();
  setupAutoAdvance();
  clearVisualization();
  try {
    await Promise.all([
      waitForIframe(adcFrame, ['baseSelect', 'departureEndSelect']),
      waitForIframe(watFrame, ['procedure', 'configuration', 'runBtn']),
      waitForIframe(rtoFrame, ['configuration', 'runBtn'])
    ]);
    await populateBaseOptions();
    restoreInputsFromContext();
    await syncAdcSelection({ renderPreviewIfActive: false });
    const hadSavedResults = restoreSavedResults();
    await Promise.all([prepareEmbeddedView('adc'), prepareEmbeddedView('wat'), prepareEmbeddedView('rto')]);
    if (els.visualSelect.value) setVisualization(els.visualSelect.value, true);
    else if (hadSavedResults) setVisualization('adc', true);
  } catch (error) {
    console.error('Falha ao inicializar integração', error);
  }
});
