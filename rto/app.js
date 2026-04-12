const paEl = document.getElementById('pressureAltitude');
const oatEl = document.getElementById('oat');
const weightEl = document.getElementById('actualWeight');
const windEl = document.getElementById('headwind');
const paNegativeBtn = document.getElementById('paNegativeBtn');
const oatNegativeBtn = document.getElementById('oatNegativeBtn');
const configurationEl = document.getElementById('configuration');
const runBtn = document.getElementById('runBtn');
const demoBtn = document.getElementById('demoBtn');
const resetBtn = document.getElementById('resetBtn');
const toggleChartBtn = document.getElementById('toggleChart');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const chartPanel = document.getElementById('chartPanel');
const chartCanvas = document.getElementById('chartCanvas');
const chartStage = document.getElementById('chartStage');
const chartFullscreen = document.getElementById('chartFullscreen');
const fullscreenChartCanvas = document.getElementById('fullscreenChartCanvas');
const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
const fullscreenViewport = document.getElementById('fullscreenViewport');
const fullscreenContent = document.getElementById('fullscreenContent');
const subtitleEl = document.getElementById('subtitleEl');
const buildVersionEl = document.getElementById('buildVersionEl');

const statusCard = document.getElementById('statusCard');
const statusBadge = document.getElementById('statusBadge');
const statusTitle = document.getElementById('statusTitle');
const statusText = document.getElementById('statusText');
const statusDetail = document.getElementById('statusDetail');
const finalMetric = document.getElementById('finalMetric');
const finalMetricFt = document.getElementById('finalMetricFt');
const interpBox = document.getElementById('interpBox');
const chartFacts = document.getElementById('chartFacts');

const BASE_PAGE_WIDTH = 842;
const BASE_PAGE_HEIGHT = 595;
const BUILD_LABEL = 'BUILD V65 • IBF 7000 left OAT micro-drop';
const BUILD_CACHE_KEY = 'v65';

const state = {
  engine: null,
  image: null,
  currentResult: null,
  profileKey: 'standard',
  activeProfileKey: 'standard',
};

const fullscreenState = {
  zoom: 1,
  minZoom: 1,
  maxZoom: 6,
  panX: 0,
  panY: 0,
  baseWidth: 0,
  baseHeight: 0,
  pointers: new Map(),
  dragOriginX: 0,
  dragOriginY: 0,
  pinchStartDistance: 0,
  pinchContentX: 0,
  pinchContentY: 0,
};

const tabletLayoutQuery = window.matchMedia('(min-width: 768px) and (max-width: 1366px)');

function applyAdaptiveLayout() {
  const tabletDashboard = tabletLayoutQuery.matches;
  document.body.classList.toggle('tablet-dashboard', tabletDashboard);
  if (tabletDashboard) toggleChartVisibility(true);
}

function isReferenceOnlyEngine(engine = state.engine) {
  return !!engine && engine.status === 'reference-assets-staged-only';
}

function resolveEffectiveProfileKey(profileKey, weightKg = parseUnsignedField(weightEl)) {
  if (profileKey === 'standard') {
    if (Number.isFinite(weightKg) && weightKg > 6800) return 'standard7000';
    return 'standard';
  }
  if (profileKey === 'eapsOff') {
    if (Number.isFinite(weightKg) && weightKg > 6800) return 'eapsOff7000';
    return 'eapsOff';
  }
  if (profileKey === 'eapsOn') {
    if (Number.isFinite(weightKg) && weightKg > 6800) return 'eapsOn7000';
    return 'eapsOn';
  }
  if (profileKey === 'ibfInstalled') {
    if (Number.isFinite(weightKg) && weightKg > 6800) return 'ibfInstalled7000';
    return 'ibfInstalled';
  }
  return profileKey;
}

function getSelectedConfigurationLabel() {
  const selected = configurationEl?.selectedOptions?.[0]?.textContent?.trim();
  return selected || profiles[state.profileKey]?.label || '—';
}

function renderChartFacts(src) {
  if (!chartFacts) return;
  if (!src) {
    chartFacts.innerHTML = '';
    return;
  }
  const facts = [
    ['Gráfico', `Figure ${src.figure}`],
    ['Suplemento', `Supplement ${src.supplement}`],
    ['Página', src.page || '—'],
    ['Configuração', getSelectedConfigurationLabel()],
    ['Fonte', src.rfm_source || '—'],
  ];
  chartFacts.innerHTML = facts.map(([label, value]) => `
    <div class="viz-fact">
      <span class="viz-fact-label">${label}</span>
      <span class="viz-fact-value">${value}</span>
    </div>
  `).join('');
}

async function ensureEffectiveProfileLoaded({ preserveInputs = true, autoRun = false } = {}) {
  const desiredProfileKey = resolveEffectiveProfileKey(state.profileKey, parseUnsignedField(weightEl));
  if (state.engine && state.activeProfileKey === desiredProfileKey) return;
  await loadProfile(state.profileKey, { preserveInputs, autoRun, effectiveWeightKg: parseUnsignedField(weightEl) });
}

async function refreshWeightSensitiveProfileIfNeeded() {
  if (!['standard', 'eapsOff', 'eapsOn', 'ibfInstalled'].includes(state.profileKey)) return;
  const digits = digitsOnlyLength(weightEl);
  if (digits < 4) return;
  const desiredProfileKey = resolveEffectiveProfileKey(state.profileKey, parseUnsignedField(weightEl));
  if (state.activeProfileKey === desiredProfileKey) return;
  await loadProfile(state.profileKey, { preserveInputs: true, autoRun: false, effectiveWeightKg: parseUnsignedField(weightEl) });
}

const profiles = {
  standard: {
    label: 'Standard',
    json: 'data/figure_4_54_engine_data.json',
    image: 'docs/page_s50_85_figure_4_54.png',
  },
  eapsOff: {
    label: 'EAPS OFF',
    json: 'data/figure_4_56_engine_data.json',
    image: 'docs/page_s50_89_figure_4_56.png',
  },
  eapsOff7000: {
    label: '7000 EAPS OFF',
    json: 'data/figure_4_94_engine_data.json',
    image: 'docs/page_s90_127_figure_4_94.png',
  },
  eapsOn: {
    label: 'EAPS ON',
    json: 'data/figure_4_58_engine_data.json',
    image: 'docs/page_s50_93_figure_4_58.png',
  },
  eapsOn7000: {
    label: '7000 EAPS ON',
    json: 'data/figure_4_96_engine_data.json',
    image: 'docs/page_s90_131_figure_4_96.png',
  },
  ibfInstalled: {
    label: 'IBF Installed',
    json: 'data/figure_4_68a_engine_data.json',
    image: 'docs/page_s50_108a_figure_4_68a.png',
  },
  ibfInstalled7000: {
    label: '7000 IBF Installed',
    json: 'data/figure_4_98_engine_data.json',
    image: 'docs/page_s90_135_figure_4_98.png',
  },
  standard7000: {
    label: '7000 Standard',
    json: 'data/figure_4_92_engine_data.json',
    image: 'docs/page_s90_123_figure_4_92.png',
  },
};

const autoAdvanceRules = [
  { el: paEl, next: oatEl, minDigits: 3, maxDigits: 4 },
  { el: oatEl, next: weightEl, minDigits: 2, maxDigits: 2 },
  { el: weightEl, next: windEl, minDigits: 4, maxDigits: 4 },
  { el: windEl, next: runBtn, minDigits: 1, maxDigits: 2 },
];

function fmt(num, digits = 0) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(num);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sanitizeDigitsInput(el, maxLen = null) {
  const allowNegative = el === paEl || el === oatEl;
  let raw = String(el.value ?? '');
  let negative = '';
  if (allowNegative && raw.trim().startsWith('-')) negative = '-';
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
  try { el.setSelectionRange(caret, caret); } catch (_) {}
}

function digitsOnlyLength(el) {
  return String(el.value ?? '').replace(/[^0-9]/g, '').length;
}

function canAdvance(rule) {
  const raw = String(rule.el.value ?? '').trim();
  const digits = digitsOnlyLength(rule.el);
  if (rule.specialZero && raw === '0') return true;
  return digits >= rule.minDigits;
}

function focusNext(target) {
  if (!target) return;
  if (target === runBtn) {
    runBtn.focus();
    return;
  }
  target.focus();
  target.select?.();
}

function setupAutoAdvance() {
  autoAdvanceRules.forEach((rule) => {
    rule.el.addEventListener('input', () => {
      sanitizeDigitsInput(rule.el, rule.maxDigits);
      if (canAdvance(rule)) focusNext(rule.next);
    });
    rule.el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        focusNext(rule.next);
      }
    });
  });
}

function parseSignedField(el) {
  const raw = String(el.value ?? '').trim();
  if (!raw || raw === '-') return NaN;
  return Number(raw);
}

function parseUnsignedField(el) {
  const raw = String(el.value ?? '').trim();
  if (!raw) return NaN;
  return Number(raw);
}

function setStatus(kind, badge, title, text, detail = '') {
  statusCard.className = `card status sticky-result ${kind}`;
  statusBadge.textContent = badge;
  statusTitle.textContent = title;
  statusText.textContent = text;
  if (statusDetail) statusDetail.textContent = detail;
}

function setMetricsEmpty() {
  finalMetric.textContent = '—';
  finalMetricFt.textContent = '—';
}

function interpolateByTicks(value, tickMap) {
  const entries = Object.entries(tickMap)
    .map(([k, v]) => ({ value: Number(k), x: Number(v) }))
    .sort((a, b) => a.value - b.value);
  if (!entries.length) return null;
  if (value < entries[0].value || value > entries[entries.length - 1].value) return null;
  for (let i = 1; i < entries.length; i += 1) {
    const a = entries[i - 1];
    const b = entries[i];
    if (value >= a.value && value <= b.value) {
      if (value === a.value) return a.x;
      if (value === b.value) return b.x;
      if (b.value === a.value) return a.x;
      return lerp(a.x, b.x, (value - a.value) / (b.value - a.value));
    }
  }
  return entries[entries.length - 1].x;
}

function xForPressureAltitudeFt(ft) {
  const panel = state.engine.panels.left;
  const axisTicks = panel.pressure_altitude_ft.axis_x_by_ft;
  if (axisTicks) {
    const x = interpolateByTicks(ft, axisTicks);
    if (x !== null) return x;
  }
  const min = panel.pressure_altitude_ft.min;
  const max = panel.pressure_altitude_ft.max;
  const ratio = (max - ft) / (max - min);
  return panel.x0 + ratio * (panel.x1 - panel.x0);
}

function distanceMFromCenterX(x) {
  const panel = state.engine.panels.center;
  const ratio = (x - panel.x0) / (panel.x1 - panel.x0);
  return ratio * panel.distance_m.max;
}

function correctionMPerKtFromRightX(x) {
  const panel = state.engine.panels.right;
  const ratio = (x - panel.x0) / (panel.x1 - panel.x0);
  return ratio * (panel.correction_m_per_kt.min - panel.correction_m_per_kt.max) + panel.correction_m_per_kt.max;
}

function yAtX(points, x) {
  if (!points.length) return null;
  const xs = points.map((pt) => pt[0]);
  if (x < Math.min(...xs) || x > Math.max(...xs)) return null;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if ((x0 <= x && x <= x1) || (x1 <= x && x <= x0)) {
      if (x1 === x0) return y0;
      return lerp(y0, y1, (x - x0) / (x1 - x0));
    }
  }
  return null;
}

function xAtY(points, y) {
  if (!points.length) return null;
  const ys = points.map((pt) => pt[1]);
  if (y < Math.min(...ys) || y > Math.max(...ys)) return null;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if ((y0 <= y && y <= y1) || (y1 <= y && y <= y0)) {
      if (y1 === y0) return x0;
      return lerp(x0, x1, (y - y0) / (y1 - y0));
    }
  }
  return null;
}

function getAvailableOatFamilies(xPa) {
  return Object.entries(state.engine.lines.left_oat_families)
    .map(([temp, points]) => ({ temp: Number(temp), y: yAtX(points, xPa) }))
    .filter((entry) => entry.y !== null)
    .sort((a, b) => a.temp - b.temp);
}

function bracketValue(value, sortedNumbers) {
  const low = [...sortedNumbers].reverse().find((n) => n <= value);
  const high = sortedNumbers.find((n) => n >= value);
  return { low, high };
}

function computeCurrentFigure({ paFt, oatC, weightKg, headwindKt }) {
  const panelLeft = state.engine.panels.left;
  if (paFt < panelLeft.pressure_altitude_ft.min || paFt > panelLeft.pressure_altitude_ft.max) {
    throw new Error(`Fora da faixa: Pressure Altitude válida nesta carta = ${panelLeft.pressure_altitude_ft.min} a ${panelLeft.pressure_altitude_ft.max} ft.`);
  }
  const weightValues = Object.keys(state.engine.lines.center_weight_curves).map(Number).sort((a, b) => a - b);
  const minWeight = weightValues[0];
  const maxWeight = weightValues[weightValues.length - 1];
  if (weightKg < minWeight || weightKg > maxWeight) {
    throw new Error(`Fora da faixa: Gross Weight válido nesta carta = ${minWeight} a ${maxWeight} kg.`);
  }

  const xPa = xForPressureAltitudeFt(paFt);
  const oatFamilies = getAvailableOatFamilies(xPa);
  if (oatFamilies.length < 2) {
    throw new Error('Sem cálculo nesta configuração: não foi possível montar famílias OAT suficientes nessa altitude.');
  }

  const minTemp = oatFamilies[0].temp;
  const maxTemp = oatFamilies[oatFamilies.length - 1].temp;
  if (oatC < minTemp || oatC > maxTemp) {
    throw new Error(`Fora da faixa / sem cálculo nesta configuração: OAT disponível nesta altitude = ${minTemp}°C a ${maxTemp}°C.`);
  }

  const oatTemps = oatFamilies.map((item) => item.temp);
  const oatBracket = bracketValue(oatC, oatTemps);
  const oatLow = oatFamilies.find((item) => item.temp === oatBracket.low);
  const oatHigh = oatFamilies.find((item) => item.temp === oatBracket.high);
  const yRef = oatBracket.low === oatBracket.high
    ? oatLow.y
    : lerp(oatLow.y, oatHigh.y, (oatC - oatBracket.low) / (oatBracket.high - oatBracket.low));

  const weightCurves = state.engine.lines.center_weight_curves;
  const weightBracket = bracketValue(weightKg, weightValues);
  const xCenterLow = xAtY(weightCurves[String(weightBracket.low)], yRef);
  const xCenterHigh = xAtY(weightCurves[String(weightBracket.high)], yRef);
  if (xCenterLow === null || xCenterHigh === null) {
    throw new Error('Sem cálculo nesta configuração: a leitura do painel central saiu da faixa geométrica da carta.');
  }

  const xCenter = weightBracket.low === weightBracket.high
    ? xCenterLow
    : lerp(xCenterLow, xCenterHigh, (weightKg - weightBracket.low) / (weightBracket.high - weightBracket.low));

  const xCorrection = xAtY(state.engine.lines.right_correction_curve, yRef);
  if (xCorrection === null) {
    throw new Error('Sem cálculo nesta configuração: a leitura da distance correction saiu da faixa geométrica da carta.');
  }

  const baseDistanceM = distanceMFromCenterX(xCenter);
  const correctionPerKtM = correctionMPerKtFromRightX(xCorrection);
  const totalCorrectionM = correctionPerKtM * headwindKt;
  const finalDistanceM = baseDistanceM + totalCorrectionM;

  return {
    inputs: { paFt, oatC, weightKg, headwindKt },
    geometry: { xPa, yRef, xCenter, xCorrection },
    brackets: {
      oatLow: oatBracket.low,
      oatHigh: oatBracket.high,
      weightLow: weightBracket.low,
      weightHigh: weightBracket.high,
    },
    outputs: {
      baseDistanceM,
      correctionPerKtM,
      totalCorrectionM,
      finalDistanceM,
      baseDistanceFt: baseDistanceM * 3.28084,
      correctionPerKtFt: correctionPerKtM * 3.28084,
      finalDistanceFt: finalDistanceM * 3.28084,
    },
  };
}

function scaledPoint(x, y, sx, sy) {
  return [x * sx, y * sy];
}


function drawPolyline(ctx, points, sx, sy, color, width, alpha = 1, dash = []) {
  if (!Array.isArray(points) || points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.setLineDash(dash);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const [x0, y0] = points[0];
  ctx.moveTo(x0 * sx, y0 * sy);
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    ctx.lineTo(x * sx, y * sy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawCurvesUsedInCalculation(ctx, result, sx, sy, scaleFactor) {
  const lines = state.engine?.lines;
  if (!lines || !result?.brackets) return;

  const leftLowKey = String(result.brackets.oatLow);
  const leftHighKey = String(result.brackets.oatHigh);
  const centerLowKey = String(result.brackets.weightLow);
  const centerHighKey = String(result.brackets.weightHigh);

  const leftLow = lines.left_oat_families?.[leftLowKey];
  const leftHigh = lines.left_oat_families?.[leftHighKey];
  const centerLow = lines.center_weight_curves?.[centerLowKey];
  const centerHigh = lines.center_weight_curves?.[centerHighKey];
  const rightCurve = lines.right_correction_curve;

  const strong = 2.8 * scaleFactor;
  const soft = 2.0 * scaleFactor;
  const dash = [8 * scaleFactor, 7 * scaleFactor];

  if (leftLow && leftHighKey === leftLowKey) {
    drawPolyline(ctx, leftLow, sx, sy, '#ff9f1c', strong, 0.72);
  } else {
    if (leftLow) drawPolyline(ctx, leftLow, sx, sy, '#ff9f1c', soft, 0.55, dash);
    if (leftHigh) drawPolyline(ctx, leftHigh, sx, sy, '#ffd166', soft, 0.58, dash);
  }

  if (centerLow && centerHighKey === centerLowKey) {
    drawPolyline(ctx, centerLow, sx, sy, '#8bff6f', strong, 0.72);
  } else {
    if (centerLow) drawPolyline(ctx, centerLow, sx, sy, '#6de06d', soft, 0.55, dash);
    if (centerHigh) drawPolyline(ctx, centerHigh, sx, sy, '#b7ff7a', soft, 0.58, dash);
  }

  if (rightCurve) drawPolyline(ctx, rightCurve, sx, sy, '#ff79cb', soft, 0.62);
}

function drawOverlayToCanvas(canvas, result = null) {
  if (!state.image || !state.engine) return;
  const ctx = canvas.getContext('2d');
  canvas.width = state.image.naturalWidth;
  canvas.height = state.image.naturalHeight;
  const sx = canvas.width / BASE_PAGE_WIDTH;
  const sy = canvas.height / BASE_PAGE_HEIGHT;
  const s = Math.max(1, (sx + sy) / 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);

  if (!result) return;

  drawCurvesUsedInCalculation(ctx, result, sx, sy, s);

  const { xPa, yRef, xCenter, xCorrection } = result.geometry;
  const left = state.engine.panels.left;
  const center = state.engine.panels.center;
  const right = state.engine.panels.right;

  const [xPaS, yRefS] = scaledPoint(xPa, yRef, sx, sy);
  const [xCenterS] = scaledPoint(xCenter, yRef, sx, sy);
  const [xCorrS] = scaledPoint(xCorrection, yRef, sx, sy);
  const [, leftBottomS] = scaledPoint(left.x0, left.y1, sx, sy);
  const [, centerBottomS] = scaledPoint(center.x0, center.y1, sx, sy);
  const [, rightBottomS] = scaledPoint(right.x0, right.y1, sx, sy);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = '#f3b447';
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(xPaS, leftBottomS);
  ctx.lineTo(xPaS, yRefS);
  ctx.stroke();

  ctx.strokeStyle = '#4ef0ff';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(xPaS, yRefS);
  ctx.lineTo(xCorrS, yRefS);
  ctx.stroke();

  ctx.strokeStyle = '#8bff6f';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(xCenterS, yRefS);
  ctx.lineTo(xCenterS, centerBottomS);
  ctx.stroke();

  ctx.strokeStyle = '#ff79cb';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(xCorrS, yRefS);
  ctx.lineTo(xCorrS, rightBottomS);
  ctx.stroke();

  const radius = 7 * s;
  const points = [
    [xPaS, yRefS, '#f3b447'],
    [xCenterS, yRefS, '#8bff6f'],
    [xCorrS, yRefS, '#ff79cb'],
  ];
  points.forEach(([x, y, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2 * s;
    ctx.strokeStyle = '#08111d';
    ctx.stroke();
  });

  ctx.font = `bold ${Math.round(18 * s)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  ctx.fillStyle = '#08111d';
  ctx.fillText('PA', xPaS + 10 * s, yRefS - 10 * s);
  ctx.fillText('DIST', xCenterS + 10 * s, yRefS - 10 * s);
  ctx.fillText('CORR', xCorrS + 10 * s, yRefS - 10 * s);
  ctx.restore();
}

function drawOverlay(result = null) {
  drawOverlayToCanvas(chartCanvas, result);
  if (!chartFullscreen.classList.contains('hidden')) drawOverlayToCanvas(fullscreenChartCanvas, result);
}

function resetFullscreenView() {
  fullscreenState.zoom = 1;
  fullscreenState.panX = 0;
  fullscreenState.panY = 0;
  fullscreenState.pointers.clear();
  fullscreenViewport?.classList.remove('is-dragging');
}

function getFullscreenViewportCenter() {
  const rect = fullscreenViewport.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
}

function clampFullscreenPan() {
  const { width, height } = getFullscreenViewportCenter();
  const scaledWidth = fullscreenState.baseWidth * fullscreenState.zoom;
  const scaledHeight = fullscreenState.baseHeight * fullscreenState.zoom;
  const maxPanX = Math.max(0, (scaledWidth - width) / 2);
  const maxPanY = Math.max(0, (scaledHeight - height) / 2);
  fullscreenState.panX = Math.min(maxPanX, Math.max(-maxPanX, fullscreenState.panX));
  fullscreenState.panY = Math.min(maxPanY, Math.max(-maxPanY, fullscreenState.panY));
  if (fullscreenState.zoom <= fullscreenState.minZoom + 0.001) {
    fullscreenState.panX = 0;
    fullscreenState.panY = 0;
  }
}

function applyFullscreenTransform() {
  if (!fullscreenContent) return;
  clampFullscreenPan();
  fullscreenContent.style.transform = `translate(-50%, -50%) translate(${fullscreenState.panX}px, ${fullscreenState.panY}px) scale(${fullscreenState.zoom})`;
}

function layoutFullscreenCanvas(preserveView = false) {
  if (!fullscreenViewport || chartFullscreen.classList.contains('hidden')) return;
  const rect = fullscreenViewport.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const fitScale = Math.min(rect.width / fullscreenChartCanvas.width, rect.height / fullscreenChartCanvas.height);
  fullscreenState.baseWidth = fullscreenChartCanvas.width * fitScale;
  fullscreenState.baseHeight = fullscreenChartCanvas.height * fitScale;
  fullscreenContent.style.width = `${fullscreenState.baseWidth}px`;
  fullscreenContent.style.height = `${fullscreenState.baseHeight}px`;
  fullscreenChartCanvas.style.width = `${fullscreenState.baseWidth}px`;
  fullscreenChartCanvas.style.height = `${fullscreenState.baseHeight}px`;
  if (!preserveView) resetFullscreenView();
  applyFullscreenTransform();
}

function zoomFullscreenAt(clientX, clientY, zoomFactor) {
  const nextZoom = Math.min(fullscreenState.maxZoom, Math.max(fullscreenState.minZoom, fullscreenState.zoom * zoomFactor));
  const { x: centerX, y: centerY } = getFullscreenViewportCenter();
  const contentX = (clientX - centerX - fullscreenState.panX) / fullscreenState.zoom;
  const contentY = (clientY - centerY - fullscreenState.panY) / fullscreenState.zoom;
  fullscreenState.zoom = nextZoom;
  fullscreenState.panX = clientX - centerX - (contentX * nextZoom);
  fullscreenState.panY = clientY - centerY - (contentY * nextZoom);
  applyFullscreenTransform();
}

function openFullscreenChart() {
  if (chartPanel.classList.contains('hidden')) return;
  chartFullscreen.classList.remove('hidden');
  chartFullscreen.setAttribute('aria-hidden', 'false');
  document.body.classList.add('fullscreen-open');
  drawOverlayToCanvas(fullscreenChartCanvas, state.currentResult);
  requestAnimationFrame(() => layoutFullscreenCanvas(false));
}

function closeFullscreenChart() {
  chartFullscreen.classList.add('hidden');
  chartFullscreen.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('fullscreen-open');
  resetFullscreenView();
}

function renderCompositeCanvas(result = state.currentResult) {
  if (!state.image || !result) return null;
  const baseCanvas = document.createElement('canvas');
  drawOverlayToCanvas(baseCanvas, result);

  const footerHeight = Math.round(baseCanvas.width * 0.23);
  const out = document.createElement('canvas');
  out.width = baseCanvas.width;
  out.height = baseCanvas.height + footerHeight;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(baseCanvas, 0, 0);

  ctx.fillStyle = '#f3f5f8';
  ctx.fillRect(0, baseCanvas.height, out.width, footerHeight);
  ctx.strokeStyle = '#d8dee7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, baseCanvas.height + 0.5);
  ctx.lineTo(out.width, baseCanvas.height + 0.5);
  ctx.stroke();

  const s = out.width / 842;
  ctx.fillStyle = '#0b0f14';
  ctx.font = `bold ${Math.round(24 * s)}px Inter, Arial, sans-serif`;
  const src = state.engine.source;
  ctx.fillText(`AW139 RTO Module — Figure ${src.figure}`, 28 * s, baseCanvas.height + 38 * s);

  ctx.font = `${Math.round(16 * s)}px Inter, Arial, sans-serif`;
  const lines = [
    `Supplement ${src.supplement} • Page ${src.page} • ${src.title}`,
    `Inputs: PA ${fmt(result.inputs.paFt, 0)} ft • OAT ${fmt(result.inputs.oatC, 0)} °C • GW ${fmt(result.inputs.weightKg, 0)} kg • Headwind ${fmt(result.inputs.headwindKt, 0)} kt`,
    `Base distance: ${fmt(result.outputs.baseDistanceM, 0)} m (${fmt(result.outputs.baseDistanceFt, 0)} ft)`,
    `Correction / kt: ${fmt(result.outputs.correctionPerKtM, 1)} m/kt (${fmt(result.outputs.correctionPerKtFt, 1)} ft/kt)`,
    `RTO final: ${fmt(result.outputs.finalDistanceM, 0)} m (${fmt(result.outputs.finalDistanceFt, 0)} ft)`
  ];
  let y = baseCanvas.height + 72 * s;
  lines.forEach((line) => {
    ctx.fillText(line, 28 * s, y);
    y += 28 * s;
  });

  ctx.font = `${Math.round(14 * s)}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#455468';
  const sourceText = src.rfm_source || 'Leonardo AW139 Rotorcraft Flight Manual (RFM)';
  ctx.fillText(`Fonte: ${sourceText}.`, 28 * s, out.height - 24 * s);
  return out;
}

function buildPdfBlobFromCanvas(canvas) {
  const jpegData = canvas.toDataURL('image/jpeg', 0.92);
  const base64 = jpegData.split(',')[1];
  const imageBytes = atob(base64);
  const imgLen = imageBytes.length;
  const pageWidth = 595.28;
  const pageHeight = pageWidth * canvas.height / canvas.width;
  const pdfParts = [];
  const offsets = [];
  const encoder = new TextEncoder();
  const push = (s) => pdfParts.push(typeof s === 'string' ? s : s);
  const offset = () => pdfParts.reduce((n, part) => n + (typeof part === 'string' ? encoder.encode(part).length : part.length), 0);
  const bin = Uint8Array.from(imageBytes, (c) => c.charCodeAt(0));

  push('%PDF-1.4\n');
  offsets.push(offset()); push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets.push(offset()); push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  offsets.push(offset()); push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  offsets.push(offset()); push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen} >>\nstream\n`);
  push(bin); push('\nendstream\nendobj\n');
  const content = `q\n${pageWidth.toFixed(2)} 0 0 ${pageHeight.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
  offsets.push(offset()); push(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  const xrefStart = offset();
  push('xref\n0 6\n0000000000 65535 f \n');
  for (const off of offsets) push(`${String(off).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
  return new Blob(pdfParts, { type: 'application/pdf' });
}

async function shareOrDownloadPdfFromCanvas(canvas, fileName) {
  const blob = buildPdfBlobFromCanvas(canvas);
  const file = new File([blob], fileName, { type: 'application/pdf' });
  if (navigator.canShare && navigator.share) {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'AW139 RTO PDF', text: 'PDF do cálculo documentado.' });
        return;
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isiOS) {
    const opened = window.open(url, '_blank');
    if (opened) {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function exportInterpolatedPdf() {
  if (!state.currentResult) {
    alert('Rode primeiro um cálculo válido para gerar o PDF.');
    return;
  }
  const canvas = renderCompositeCanvas(state.currentResult);
  if (!canvas) {
    alert('A página do RFM ainda não carregou.');
    return;
  }
  const src = state.engine.source;
  const safeFigure = String(src.figure).replace(/[^0-9a-zA-Z-]+/g, '-');
  await shareOrDownloadPdfFromCanvas(canvas, `aw139-rto-s${src.supplement}-figure-${safeFigure}.pdf`);
}

function updatePdfButtonLabel() {
  if (navigator.canShare && navigator.share) {
    try {
      const probe = new File([new Blob(['x'], { type: 'application/pdf' })], 'x.pdf', { type: 'application/pdf' });
      if (navigator.canShare({ files: [probe] })) {
        exportPdfBtn.textContent = 'Compartilhar PDF';
        return;
      }
    } catch (_) {}
  }
  exportPdfBtn.textContent = 'Baixar PDF';
}

function updateResultCards(result) {
  const o = result.outputs;
  finalMetric.textContent = `${fmt(o.finalDistanceM, 0)} m`;
  finalMetricFt.textContent = `${fmt(o.finalDistanceFt, 0)} ft`;
}

function showSuccess(result) {
  const o = result.outputs;
  const windText = `${fmt(result.inputs.headwindKt, 0)} kt headwind`;
  setStatus(
    'within',
    'CÁLCULO OK',
    'RTO calculada',
    `Fator de correção: ${fmt(o.correctionPerKtM, 1)} m/kt × ${windText}.`,
    `Base calculada ${fmt(o.baseDistanceM, 0)} m e correção total ${fmt(o.totalCorrectionM, 0)} m com ${windText}.`
  );
  updateResultCards(result);

  const oatInterp = result.brackets.oatLow === result.brackets.oatHigh
    ? `OAT direta na linha ${result.brackets.oatLow} °C.`
    : `OAT interpolada entre ${result.brackets.oatLow} °C e ${result.brackets.oatHigh} °C.`;
  const weightInterp = result.brackets.weightLow === result.brackets.weightHigh
    ? `Peso direto na curva ${result.brackets.weightLow} kg.`
    : `Peso interpolado entre ${result.brackets.weightLow} kg e ${result.brackets.weightHigh} kg.`;

  const curvesUsed = result.brackets.oatLow === result.brackets.oatHigh
    ? `Curva OAT usada no painel esquerdo: ${result.brackets.oatLow} °C.`
    : `Curvas OAT usadas no painel esquerdo: ${result.brackets.oatLow} °C e ${result.brackets.oatHigh} °C.`;
  const weightsUsed = result.brackets.weightLow === result.brackets.weightHigh
    ? `Curva de peso usada no painel central: ${result.brackets.weightLow} kg.`
    : `Curvas de peso usadas no painel central: ${result.brackets.weightLow} kg e ${result.brackets.weightHigh} kg.`;

  interpBox.innerHTML = `
    <strong>Leitura esquerda:</strong> ${oatInterp}<br>
    <strong>Leitura central:</strong> ${weightInterp}<br>
    <strong>Curvas usadas no cálculo:</strong> ${curvesUsed} ${weightsUsed}<br>
    <strong>Correção por headwind:</strong> ${fmt(o.correctionPerKtM, 1)} m/kt × ${windText}.<br>
    <strong>Transferência horizontal:</strong> y = ${fmt(result.geometry.yRef, 2)} px da carta.
  `;
}

function showReferencePending() {
  state.currentResult = null;
  setMetricsEmpty();
  const src = state.engine?.source || {};
  const confLabel = getSelectedConfigurationLabel();
  interpBox.innerHTML = `Visualização da Figure ${src.figure || '—'} pronta para auditoria. A engine deste perfil ainda está sendo reconstruída do zero.`;
  setStatus('neutral', 'REFERÊNCIA', `Engine Figure ${src.figure || '—'} pendente`, 'Visualização correta carregada.', `Cálculo temporariamente desabilitado para ${confLabel} acima de 6800 kg.`);
  drawOverlay(null);
}


function showError(message, kind = 'warn') {
  setMetricsEmpty();
  interpBox.textContent = 'Sem cálculo válido para os dados informados.';
  if (kind === 'warn') {
    setStatus('warn', 'FORA DA FAIXA', 'Sem cálculo', message, '');
  } else {
    setStatus('out', 'ERRO', 'Falha de engine', message, '');
  }
}

async function runCalculation({ skipEnsureProfile = false } = {}) {
  if (!skipEnsureProfile) {
    try {
      await ensureEffectiveProfileLoaded({ preserveInputs: true, autoRun: false });
    } catch (error) {
      state.currentResult = null;
      drawOverlay(null);
      showError(`Falha ao carregar o perfil: ${error.message}`, 'err');
      return;
    }
  }
  if (!state.engine) return;
  if (isReferenceOnlyEngine()) {
    showReferencePending();
    return;
  }
  const payload = {
    paFt: parseSignedField(paEl),
    oatC: parseSignedField(oatEl),
    weightKg: parseUnsignedField(weightEl),
    headwindKt: String(windEl?.value ?? '').trim() === '' ? 0 : parseUnsignedField(windEl),
  };

  if ([payload.paFt, payload.oatC, payload.weightKg, payload.headwindKt].some(Number.isNaN)) {
    state.currentResult = null;
    drawOverlay(null);
    showError('Preencha os campos numéricos antes de calcular.', 'warn');
    return;
  }

  try {
    const result = computeCurrentFigure(payload);
    state.currentResult = result;
    showSuccess(result);
    drawOverlay(result);
    if (chartPanel.classList.contains('hidden')) toggleChartVisibility(true);
  } catch (error) {
    state.currentResult = null;
    drawOverlay(null);
    showError(error.message, /fora da faixa|sem cálculo/i.test(error.message) ? 'warn' : 'err');
  }
}

function loadDemo() {
  paEl.value = '0';
  oatEl.value = '25';
  weightEl.value = '6700';
  windEl.value = '5';
  runCalculation();
}

function clearResultsOnly() {
  state.currentResult = null;
  setMetricsEmpty();
  if (interpBox) interpBox.textContent = 'Sem cálculo ainda.';
  const figure = state.engine?.source?.figure || '—';
  if (isReferenceOnlyEngine()) {
    setStatus('neutral', 'REFERÊNCIA', `RTO Figure ${figure}`, 'Visualização correta carregada.', 'Engine pendente para este perfil acima de 6800 kg.');
  } else {
    setStatus('neutral', 'AGUARDANDO DADOS', `RTO Figure ${figure}`, 'Fator de correção: —', 'Preencha os campos e execute o cálculo.');
  }
  drawOverlay(null);
}

function resetForm() {
  paEl.value = '';
  oatEl.value = '';
  weightEl.value = '';
  windEl.value = '';
  clearResultsOnly();
}

function toggleChartVisibility(forceShow = null) {
  if (forceShow === true) chartPanel.classList.remove('hidden');
  else if (forceShow === false) { chartPanel.classList.add('hidden'); closeFullscreenChart(); }
  else chartPanel.classList.toggle('hidden');
  if (toggleChartBtn) toggleChartBtn.textContent = chartPanel.classList.contains('hidden') ? 'Mostrar gráfico' : 'Ocultar gráfico';
  if (!chartPanel.classList.contains('hidden')) drawOverlay(state.currentResult);
}


function updateProfileTexts() {
  const src = state.engine?.source;
  if (!src) return;
  if (subtitleEl) subtitleEl.textContent = `Reject Take Off Distance — Supplement ${src.supplement} — Figure ${src.figure}`;
  if (buildVersionEl) buildVersionEl.textContent = BUILD_LABEL;
  const confLabel = getSelectedConfigurationLabel();
  const standardRule = state.profileKey === 'standard'
    ? ' Padrão Standard: até 6800 kg usa Supplement 50; acima de 6800 kg usa Supplement 90.'
    : '';
  const eapsOffRule = state.profileKey === 'eapsOff'
    ? ' No EAPS OFF: até 6800 kg usa Supplement 50; acima de 6800 kg usa a Figure 4-94 do Supplement 90.'
    : '';
  const eapsOnRule = state.profileKey === 'eapsOn'
    ? ' No EAPS ON: até 6800 kg usa Supplement 50; acima de 6800 kg usa a Figure 4-96 do Supplement 90.'
    : '';
  const ibfRule = state.profileKey === 'ibfInstalled'
    ? ' No IBF Installed: até 6800 kg usa Supplement 50; acima de 6800 kg usa a Figure 4-98 do Supplement 90.'
    : '';
  const formHint = document.getElementById('formHint');
  if (formHint) {
    if (isReferenceOnlyEngine()) {
      formHint.textContent = `Escopo atual: Supplement ${src.supplement}, Figure ${src.figure}, ${confLabel}. Visualização correta pronta; engine ainda em reconstrução.${standardRule}${eapsOffRule}${eapsOnRule}${ibfRule}`;
    } else {
      const paRange = state.engine.panels.left.pressure_altitude_ft;
      formHint.textContent = `Escopo atual: Supplement ${src.supplement}, Figure ${src.figure}, ${confLabel}. Faixa de PA = ${fmt(paRange.min, 0)} a ${fmt(paRange.max, 0)} ft.${standardRule}${eapsOffRule}${eapsOnRule}${ibfRule}`;
    }
  }
  chartReference.innerHTML = `<strong>Gráfico em uso:</strong> Figure ${src.figure} — ${src.title}.<br><strong>Suplemento:</strong> Supplement ${src.supplement}<br><strong>Página:</strong> ${src.page}<br><strong>Fonte:</strong> ${src.rfm_source}.`;
  renderChartFacts(src);
  const chartHint = document.getElementById('chartHint');
  if (chartHint) {
    chartHint.textContent = isReferenceOnlyEngine()
      ? `Página correta da Figure ${src.figure} carregada como referência limpa. O cálculo deste perfil ainda não foi religado.`
      : 'Overlay direto sobre a página completa do RFM: altitude, curvas usadas no cálculo, transferência horizontal, leitura da distância e correção por headwind.';
  }
}

async function loadProfile(profileKey, { preserveInputs = true, autoRun = true, effectiveWeightKg = null } = {}) {
  const effectiveProfileKey = resolveEffectiveProfileKey(profileKey, effectiveWeightKg ?? parseUnsignedField(weightEl));
  const profile = profiles[effectiveProfileKey];
  if (!profile) throw new Error(`Perfil não suportado: ${effectiveProfileKey}`);

  const snapshot = preserveInputs ? {
    pa: paEl.value,
    oat: oatEl.value,
    weight: weightEl.value,
    wind: windEl.value,
  } : null;

  state.profileKey = profileKey;
  state.activeProfileKey = effectiveProfileKey;
  const [engine, image] = await Promise.all([
    fetch(`${profile.json}?v=${BUILD_CACHE_KEY}`).then((r) => {
      if (!r.ok) throw new Error(`Falha ao carregar ${profile.json}`);
      return r.json();
    }),
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar ${profile.image}`));
      img.src = `${profile.image}?v=${BUILD_CACHE_KEY}`;
    }),
  ]);

  state.engine = engine;
  state.image = image;
  updateProfileTexts();

  if (snapshot) {
    paEl.value = snapshot.pa;
    oatEl.value = snapshot.oat;
    weightEl.value = snapshot.weight;
    windEl.value = snapshot.wind;
    const enoughToRun =
      String(paEl.value).trim() !== '' &&
      String(oatEl.value).trim() !== '' &&
      String(weightEl.value).trim() !== '';
    if (enoughToRun && autoRun) {
      runCalculation({ skipEnsureProfile: true });
      return;
    }
  }
  clearResultsOnly();
}

async function init() {
  setupAutoAdvance();
  updatePdfButtonLabel();
  applyAdaptiveLayout();
  if (typeof tabletLayoutQuery.addEventListener === 'function') tabletLayoutQuery.addEventListener('change', applyAdaptiveLayout);
  else if (typeof tabletLayoutQuery.addListener === 'function') tabletLayoutQuery.addListener(applyAdaptiveLayout);

  paNegativeBtn.addEventListener('click', () => toggleSignedInput(paEl, 4));
  oatNegativeBtn.addEventListener('click', () => toggleSignedInput(oatEl, 2));
  runBtn.addEventListener('click', runCalculation);
  if (demoBtn) demoBtn.addEventListener('click', loadDemo);
  resetBtn.addEventListener('click', resetForm);
  if (toggleChartBtn) toggleChartBtn.addEventListener('click', () => toggleChartVisibility());
  exportPdfBtn.addEventListener('click', exportInterpolatedPdf);
  chartStage.addEventListener('click', () => openFullscreenChart());
  chartStage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFullscreenChart();
    }
  });
  closeFullscreenBtn.addEventListener('click', closeFullscreenChart);
  fullscreenViewport.addEventListener('wheel', (event) => {
    if (chartFullscreen.classList.contains('hidden')) return;
    event.preventDefault();
    zoomFullscreenAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });
  fullscreenViewport.addEventListener('dblclick', (event) => {
    event.preventDefault();
    if (fullscreenState.zoom > 1.05) {
      resetFullscreenView();
      applyFullscreenTransform();
    } else {
      zoomFullscreenAt(event.clientX, event.clientY, 2);
    }
  });
  fullscreenViewport.addEventListener('pointerdown', (event) => {
    if (chartFullscreen.classList.contains('hidden')) return;
    fullscreenViewport.setPointerCapture(event.pointerId);
    fullscreenState.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (fullscreenState.pointers.size === 1) {
      fullscreenState.dragOriginX = event.clientX - fullscreenState.panX;
      fullscreenState.dragOriginY = event.clientY - fullscreenState.panY;
      if (fullscreenState.zoom > 1.001) fullscreenViewport.classList.add('is-dragging');
    } else if (fullscreenState.pointers.size === 2) {
      const [a, b] = [...fullscreenState.pointers.values()];
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const { x: viewportCenterX, y: viewportCenterY } = getFullscreenViewportCenter();
      fullscreenState.pinchStartDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      fullscreenState.pinchContentX = (center.x - viewportCenterX - fullscreenState.panX) / fullscreenState.zoom;
      fullscreenState.pinchContentY = (center.y - viewportCenterY - fullscreenState.panY) / fullscreenState.zoom;
      fullscreenViewport.classList.remove('is-dragging');
    }
  });
  fullscreenViewport.addEventListener('pointermove', (event) => {
    if (!fullscreenState.pointers.has(event.pointerId)) return;
    fullscreenState.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (fullscreenState.pointers.size === 1) {
      if (fullscreenState.zoom <= 1.001) return;
      fullscreenState.panX = event.clientX - fullscreenState.dragOriginX;
      fullscreenState.panY = event.clientY - fullscreenState.dragOriginY;
      fullscreenViewport.classList.add('is-dragging');
      applyFullscreenTransform();
    } else if (fullscreenState.pointers.size === 2) {
      const [a, b] = [...fullscreenState.pointers.values()];
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const nextZoom = Math.min(fullscreenState.maxZoom, Math.max(fullscreenState.minZoom, fullscreenState.zoom * (distance / fullscreenState.pinchStartDistance)));
      const { x: viewportCenterX, y: viewportCenterY } = getFullscreenViewportCenter();
      fullscreenState.zoom = nextZoom;
      fullscreenState.panX = center.x - viewportCenterX - (fullscreenState.pinchContentX * nextZoom);
      fullscreenState.panY = center.y - viewportCenterY - (fullscreenState.pinchContentY * nextZoom);
      fullscreenState.pinchStartDistance = distance;
      const localX = (center.x - viewportCenterX - fullscreenState.panX) / fullscreenState.zoom;
      const localY = (center.y - viewportCenterY - fullscreenState.panY) / fullscreenState.zoom;
      fullscreenState.pinchContentX = localX;
      fullscreenState.pinchContentY = localY;
      applyFullscreenTransform();
    }
  });
  function handleFullscreenPointerEnd(event) {
    fullscreenState.pointers.delete(event.pointerId);
    if (fullscreenState.pointers.size === 1) {
      const remaining = [...fullscreenState.pointers.values()][0];
      fullscreenState.dragOriginX = remaining.x - fullscreenState.panX;
      fullscreenState.dragOriginY = remaining.y - fullscreenState.panY;
      if (fullscreenState.zoom > 1.001) fullscreenViewport.classList.add('is-dragging');
    } else {
      fullscreenViewport.classList.remove('is-dragging');
    }
  }
  fullscreenViewport.addEventListener('pointerup', handleFullscreenPointerEnd);
  fullscreenViewport.addEventListener('pointercancel', handleFullscreenPointerEnd);
  fullscreenViewport.addEventListener('pointerleave', handleFullscreenPointerEnd);
  window.addEventListener('resize', () => {
    if (!chartFullscreen.classList.contains('hidden')) layoutFullscreenCanvas(true);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !chartFullscreen.classList.contains('hidden')) closeFullscreenChart();
  });
  configurationEl.addEventListener('change', async () => {
    try {
      await loadProfile(configurationEl.value);
    } catch (error) {
      showError(`Falha ao carregar o perfil: ${error.message}`, 'err');
    }
  });

  [paEl, oatEl, weightEl, windEl].forEach((el) => {
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runCalculation();
      }
    });
  });

  weightEl.addEventListener('input', () => {
    refreshWeightSensitiveProfileIfNeeded().catch(() => {});
  });
  weightEl.addEventListener('blur', () => {
    refreshWeightSensitiveProfileIfNeeded().catch(() => {});
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  await loadProfile(configurationEl.value || 'standard', { preserveInputs: false });
  applyAdaptiveLayout();
}

init().catch((error) => {
  showError(`Falha ao carregar a engine: ${error.message}`, 'err');
});
