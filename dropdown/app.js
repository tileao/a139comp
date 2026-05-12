// AW139 Companion — Dropdown Module
// BUILD DD-V6 — real chart background + preliminary calibrated overlay

const paEl = document.getElementById('pressureAltitude');
const oatEl = document.getElementById('oat');
const weightEl = document.getElementById('actualWeight');
const windEl = document.getElementById('headwind');
const profileEl = document.getElementById('profile');
const configurationEl = document.getElementById('configuration');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');

const finalMetric = document.getElementById('finalMetric');
const finalMetricM = document.getElementById('finalMetricM');
const statusBadge = document.getElementById('statusBadge');
const statusTitle = document.getElementById('statusTitle');
const statusText = document.getElementById('statusText');
const statusDetail = document.getElementById('statusDetail');
const interpBox = document.getElementById('interpBox');
const statusCard = document.getElementById('statusCard');

const chartCanvas = document.getElementById('chartCanvas');
const chartStage = document.getElementById('chartStage');

const FT_TO_M = 0.3048;
let currentResult = null;

const OFFSHORE_WEIGHT_CURVES = [
  { weight: 5800, dropFtAtRef: 18 },
  { weight: 6000, dropFtAtRef: 30 },
  { weight: 6200, dropFtAtRef: 45 },
  { weight: 6400, dropFtAtRef: 61 },
  { weight: 6600, dropFtAtRef: 78 },
  { weight: 6800, dropFtAtRef: 96 },
];

const ENHANCED_WEIGHT_CURVES = [
  { weight: 6000, lossFtAtRef: 16 },
  { weight: 6200, lossFtAtRef: 25 },
  { weight: 6400, lossFtAtRef: 36 },
  { weight: 6600, lossFtAtRef: 49 },
  { weight: 6800, lossFtAtRef: 64 },
  { weight: 7000, lossFtAtRef: 82 },
];

const chartImages = {
  offshore6400: new Image(),
  offshore6800: new Image(),
  enhanced7000: new Image(),
};
chartImages.offshore6400.src = 'assets/dropdown-offshore-6400.png';
chartImages.offshore6800.src = 'assets/dropdown-offshore-6800.png';
chartImages.enhanced7000.src = 'assets/dropdown-enhanced-7000.png';
Object.values(chartImages).forEach(img => img.addEventListener('load', () => refreshCharts()));

function fmt(num, digits = 0) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(num);
}

function parseField(el) {
  const raw = String(el.value || '').trim();
  if (!raw || raw === '-') return NaN;
  return Number(raw.replace(/[^0-9-]/g, ''));
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function bracketBy(items, value, key) {
  const sorted = [...items].sort((a, b) => a[key] - b[key]);
  if (value < sorted[0][key] || value > sorted[sorted.length - 1][key]) return null;
  for (let i = 1; i < sorted.length; i += 1) {
    const low = sorted[i - 1];
    const high = sorted[i];
    if (value >= low[key] && value <= high[key]) return { low, high };
  }
  return { low: sorted[sorted.length - 1], high: sorted[sorted.length - 1] };
}

function interpolateWeight(curves, weight, valueKey) {
  const bracket = bracketBy(curves, weight, 'weight');
  if (!bracket) throw new Error(`Peso fora do envelope desta carta (${curves[0].weight} a ${curves[curves.length - 1].weight} kg).`);
  if (bracket.low.weight === bracket.high.weight) return { value: bracket.low[valueKey], low: bracket.low.weight, high: bracket.high.weight };
  const t = (weight - bracket.low.weight) / (bracket.high.weight - bracket.low.weight);
  return { value: lerp(bracket.low[valueKey], bracket.high[valueKey], t), low: bracket.low.weight, high: bracket.high.weight };
}

function isaAtPa(paFt) { return 15 - (paFt / 1000) * 1.98; }

function validateCommon(pa, oat, weight, wind, enhanced) {
  if ([pa, oat, weight, wind].some(Number.isNaN)) throw new Error('Preencha todos os campos.');
  if (wind < 0 || wind > 40) throw new Error('Headwind válido: 0 a 40 kt.');
  if (enhanced) {
    if (pa < -1000 || pa > 1000) throw new Error('Enhanced: PA válida aproximada de -1000 a 1000 ft.');
  } else if (pa < -1000 || pa > 5000) {
    throw new Error('Offshore: PA válida de -1000 a 5000 ft.');
  }
  const maxOat = isaAtPa(pa) + 35;
  if (oat > maxOat) throw new Error(`OAT acima do limite ISA+35°C nesta PA. Limite aprox.: ${fmt(maxOat, 1)}°C.`);
}

function calculateOffshore(inputs) {
  validateCommon(inputs.pa, inputs.oat, inputs.weight, inputs.wind, false);
  const weightInterp = interpolateWeight(OFFSHORE_WEIGHT_CURVES, inputs.weight, 'dropFtAtRef');
  const paFactor = (inputs.pa / 1000) * 4.2;
  const oatFactor = ((inputs.oat - 15) / 10) * 6.8;
  const configFactor = inputs.config === 'eapsOn' ? 4 : inputs.config === 'eapsOff' ? 2 : 0;
  const baseFt = weightInterp.value + paFactor + oatFactor + configFactor;
  const windCorrectionFt = -Math.min(40, Math.max(0, inputs.wind));
  const descendingCorrectionFt = inputs.profile === 'offshoreDescending' ? 15 : 0;
  const finalFt = Math.max(0, baseFt + windCorrectionFt + descendingCorrectionFt);
  return { chart: inputs.weight > 6400 ? 'Supplement 50 / Figure 4-74' : 'Supplement 12 / Figure 4I-1', weightInterp, baseFt, windCorrectionFt, descendingCorrectionFt, finalFt };
}

function calculateEnhanced(inputs) {
  validateCommon(inputs.pa, inputs.oat, inputs.weight, inputs.wind, true);
  const weightInterp = interpolateWeight(ENHANCED_WEIGHT_CURVES, inputs.weight, 'lossFtAtRef');
  const paFactor = (inputs.pa / 1000) * 7.5;
  const oatFactor = ((inputs.oat - 15) / 10) * 5.5;
  const baseFt = weightInterp.value + paFactor + oatFactor;
  const windCorrectionFt = -0.65 * Math.min(40, Math.max(0, inputs.wind));
  const finalFt = Math.max(0, baseFt + windCorrectionFt);
  return { chart: 'Supplement 97 / Figure 4-10', weightInterp, baseFt, windCorrectionFt, descendingCorrectionFt: 0, finalFt };
}

function calculateDropdown() {
  const inputs = {
    pa: parseField(paEl),
    oat: parseField(oatEl),
    weight: parseField(weightEl),
    wind: parseField(windEl),
    profile: profileEl.value,
    config: configurationEl.value,
  };
  const computed = inputs.profile === 'enhanced' ? calculateEnhanced(inputs) : calculateOffshore(inputs);
  return { ...inputs, ...computed, finalM: computed.finalFt * FT_TO_M };
}

function xMap(v, min, max, x0, x1) { return x0 + ((v - min) / (max - min)) * (x1 - x0); }
function yMap(v, min, max, y0, y1) { return y1 - ((v - min) / (max - min)) * (y1 - y0); }

function getPageKey(result = currentResult) {
  const profile = result?.profile || profileEl.value;
  if (profile === 'enhanced') return 'enhanced7000';
  const weight = result?.weight ?? parseField(weightEl);
  return !Number.isNaN(weight) && weight > 6400 ? 'offshore6800' : 'offshore6400';
}

function getConfigs() {
  return {
    offshore: {
      left: { x0: 124, y0: 193, x1: 641, y1: 643 },
      right: { x0: 651, y0: 193, x1: 1091, y1: 643 },
      tempSlope: -0.31,
    },
    enhanced: {
      left: { x0: 120, y0: 175, x1: 422, y1: 635 },
      mid: { x0: 425, y0: 175, x1: 742, y1: 635 },
      right: { x0: 746, y0: 175, x1: 1092, y1: 635 },
      tempSlope: -0.12,
    }
  };
}

function drawDot(ctx, x, y, color, r = 8) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawLine(ctx, x1, y1, x2, y2, color, width = 4, dashed = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  drawLine(ctx, x1, y1, x2, y2, color, 4, false);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFallback(result = null, canvas = chartCanvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f7f7f2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('Carregando carta…', 60, 60);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Se a imagem de fundo não carregar, verifique os arquivos em dropdown/assets/.', 60, 95);
}

function drawOffshoreOverlay(ctx, result, cfg) {
  const left = cfg.left;
  const right = cfg.right;
  const xPa = clamp(xMap(result.pa, -1000, 5000, left.x0, left.x1), left.x0, left.x1);
  const yBaseTemp = yMap(result.oat, -30, 50, left.y1 - 15, left.y0 + 20);
  const yTemp = clamp(yBaseTemp + cfg.tempSlope * (xPa - left.x0), left.y0 + 8, left.y1 - 8);
  const xBase = clamp(xMap(result.baseFt, 0, 150, right.x0, right.x1), right.x0, right.x1);
  const xFinal = clamp(xMap(result.finalFt, 0, 150, right.x0, right.x1), right.x0, right.x1);
  const bottomGuide = right.y1 - 16;

  drawLine(ctx, xPa, left.y1, xPa, yTemp, '#f3b447', 4, false);
  drawDot(ctx, xPa, yTemp, '#f3b447');

  drawLine(ctx, xPa, yTemp, right.x0 + 8, yTemp, '#4ef0ff', 3, true);

  drawLine(ctx, xBase, right.y1, xBase, yTemp, '#8bff6f', 4, false);
  drawDot(ctx, xBase, yTemp, '#8bff6f');

  drawArrow(ctx, xBase, bottomGuide, xFinal, bottomGuide, '#ff79cb');
  drawDot(ctx, xFinal, bottomGuide, '#ff79cb', 6);

  ctx.fillStyle = '#111';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`${fmt(result.finalFt, 0)} ft`, clamp(xFinal - 18, right.x0, right.x1 - 55), right.y0 - 10);
}

function drawEnhancedOverlay(ctx, result, cfg) {
  const left = cfg.left;
  const mid = cfg.mid;
  const right = cfg.right;
  const xPa = clamp(xMap(result.pa, -1000, 1000, left.x0, left.x1), left.x0, left.x1);
  const yBaseTemp = yMap(result.oat, -30, 50, left.y1 - 12, left.y0 + 18);
  const yTemp = clamp(yBaseTemp + cfg.tempSlope * (xPa - left.x0), left.y0 + 8, left.y1 - 8);
  const xWind = clamp(xMap(result.wind, 0, 40, mid.x0, mid.x1), mid.x0, mid.x1);
  const xFinal = clamp(xMap(result.finalFt, 0, 150, right.x0, right.x1), right.x0, right.x1);
  const guideY = clamp(yTemp, right.y0 + 18, right.y1 - 80);

  drawLine(ctx, xPa, left.y1, xPa, yTemp, '#f3b447', 4, false);
  drawDot(ctx, xPa, yTemp, '#f3b447');

  drawLine(ctx, xPa, yTemp, mid.x0 + 6, yTemp, '#4ef0ff', 3, true);
  drawLine(ctx, xWind, mid.y1, xWind, guideY, '#4ef0ff', 4, false);
  drawDot(ctx, xWind, guideY, '#4ef0ff');

  drawLine(ctx, xWind, guideY, right.x0 + 5, guideY, '#8bff6f', 3, true);
  drawLine(ctx, xFinal, right.y1, xFinal, guideY, '#ff79cb', 4, false);
  drawDot(ctx, xFinal, guideY, '#ff79cb');

  ctx.fillStyle = '#111';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`${fmt(result.finalFt, 0)} ft`, clamp(xFinal - 18, right.x0, right.x1 - 55), right.y0 - 10);
}

function drawChart(result = null, canvas = chartCanvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pageKey = getPageKey(result);
  const img = chartImages[pageKey];
  if (!img || !img.complete) {
    drawFallback(result, canvas);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (!result) return;

  const configs = getConfigs();
  if (result.profile === 'enhanced') {
    drawEnhancedOverlay(ctx, result, configs.enhanced);
  } else {
    drawOffshoreOverlay(ctx, result, configs.offshore);
  }
}

function refreshCharts() {
  drawChart(currentResult, chartCanvas);
}

function render(result) {
  currentResult = result;
  finalMetric.textContent = `${fmt(result.finalFt, 0)} ft`;
  finalMetricM.textContent = `${fmt(result.finalM, 1)} m`;
  statusCard.className = 'card status sticky-result within';
  statusBadge.textContent = 'DROPDOWN CALCULADO';
  statusTitle.textContent = result.profile === 'enhanced' ? 'Enhanced Height Loss' : 'Offshore Dropdown';
  statusText.textContent = `Resultado final ${fmt(result.finalFt, 0)} ft`;
  statusDetail.textContent = `${result.chart}. Correções aplicadas automaticamente.`;
  interpBox.innerHTML = `
    <strong>Carta:</strong> ${result.chart}<br>
    <strong>Curvas de peso:</strong> ${fmt(result.weightInterp.low, 0)} / ${fmt(result.weightInterp.high, 0)} kg<br>
    <strong>Leitura base:</strong> ${fmt(result.baseFt, 1)} ft<br>
    <strong>Correção de vento:</strong> ${fmt(result.windCorrectionFt, 1)} ft<br>
    <strong>Correção Descending:</strong> ${fmt(result.descendingCorrectionFt, 1)} ft<br>
    <strong>Resultado final:</strong> ${fmt(result.finalFt, 1)} ft (${fmt(result.finalM, 1)} m)
  `;
  refreshCharts();
}

function reset() {
  [paEl, oatEl, weightEl, windEl].forEach(el => { el.value = ''; });
  currentResult = null;
  finalMetric.textContent = '—';
  finalMetricM.textContent = '—';
  statusCard.className = 'card status sticky-result neutral';
  statusBadge.textContent = 'AGUARDANDO DADOS';
  statusTitle.textContent = 'Dropdown / Height Loss';
  statusText.textContent = 'Preencha os campos e execute o cálculo.';
  statusDetail.textContent = 'Correção de vento e incremento Descending serão aplicados automaticamente.';
  interpBox.textContent = 'Sem cálculo ainda.';
  refreshCharts();
}

function toggleSignedInput(el) {
  const raw = String(el.value || '').trim();
  const digits = raw.replace(/[^0-9]/g, '');
  el.value = raw.startsWith('-') ? digits : `-${digits}`;
  el.focus();
}


document.getElementById('paNegativeBtn')?.addEventListener('click', () => toggleSignedInput(paEl));
document.getElementById('oatNegativeBtn')?.addEventListener('click', () => toggleSignedInput(oatEl));
runBtn?.addEventListener('click', () => {
  try { render(calculateDropdown()); }
  catch (err) {
    statusCard.className = 'card status sticky-result out';
    statusBadge.textContent = 'FORA DO ENVELOPE';
    statusTitle.textContent = 'Sem cálculo';
    statusText.textContent = err.message;
    statusDetail.textContent = 'Confira PA, OAT, GW e Headwind.';
    finalMetric.textContent = '—';
    finalMetricM.textContent = '—';
  }
});
resetBtn?.addEventListener('click', reset);
profileEl?.addEventListener('change', () => { if (!currentResult) refreshCharts(); });
weightEl?.addEventListener('input', () => { if (!currentResult) refreshCharts(); });
refreshCharts();
