// AW139 Companion — Dropdown Module
// BUILD DD-V5 FULL — engine + visual overlay + fullscreen chart

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
const openFullscreenBtn = document.getElementById('openFullscreenBtn');
const chartFullscreen = document.getElementById('chartFullscreen');
const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
const fullscreenViewport = document.getElementById('fullscreenViewport');
const fullscreenChartCanvas = document.getElementById('fullscreenChartCanvas');

const FT_TO_M = 0.3048;

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

let currentResult = null;

const fullscreenState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  lastTap: 0,
};

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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

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
  if (!bracket) {
    throw new Error(`Peso fora do envelope desta carta (${curves[0].weight} a ${curves[curves.length - 1].weight} kg).`);
  }

  if (bracket.low.weight === bracket.high.weight) {
    return {
      value: bracket.low[valueKey],
      low: bracket.low.weight,
      high: bracket.high.weight,
    };
  }

  const t = (weight - bracket.low.weight) / (bracket.high.weight - bracket.low.weight);
  return {
    value: lerp(bracket.low[valueKey], bracket.high[valueKey], t),
    low: bracket.low.weight,
    high: bracket.high.weight,
  };
}

function isaAtPa(paFt) {
  return 15 - (paFt / 1000) * 1.98;
}

function validateCommon(pa, oat, weight, wind, enhanced) {
  if ([pa, oat, weight, wind].some(Number.isNaN)) {
    throw new Error('Preencha todos os campos.');
  }

  if (wind < 0 || wind > 40) {
    throw new Error('Headwind válido: 0 a 40 kt.');
  }

  if (enhanced) {
    if (pa < -1000 || pa > 1000) {
      throw new Error('Enhanced: PA válida aproximada de -1000 a 1000 ft.');
    }
  } else if (pa < -1000 || pa > 5000) {
    throw new Error('Offshore: PA válida de -1000 a 5000 ft.');
  }

  const maxOat = isaAtPa(pa) + 35;
  if (oat > maxOat) {
    throw new Error(`OAT acima do limite ISA+35°C nesta PA. Limite aprox.: ${fmt(maxOat, 1)}°C.`);
  }
}

function calculateOffshore(inputs) {
  validateCommon(inputs.pa, inputs.oat, inputs.weight, inputs.wind, false);

  const weightInterp = interpolateWeight(
    OFFSHORE_WEIGHT_CURVES,
    inputs.weight,
    'dropFtAtRef'
  );

  const paFactor = (inputs.pa / 1000) * 4.2;
  const oatFactor = ((inputs.oat - 15) / 10) * 6.8;
  const configFactor =
    inputs.config === 'eapsOn' ? 4 :
    inputs.config === 'eapsOff' ? 2 :
    0;

  const baseFt = weightInterp.value + paFactor + oatFactor + configFactor;
  const windCorrectionFt = -Math.min(40, Math.max(0, inputs.wind));
  const descendingCorrectionFt = inputs.profile === 'offshoreDescending' ? 15 : 0;
  const finalFt = Math.max(0, baseFt + windCorrectionFt + descendingCorrectionFt);

  return {
    chart: inputs.weight > 6400 ? 'Supplement 50 / Figure 4-74' : 'Supplement 12 / Figure 4I-1',
    weightInterp,
    baseFt,
    windCorrectionFt,
    descendingCorrectionFt,
    finalFt,
  };
}

function calculateEnhanced(inputs) {
  validateCommon(inputs.pa, inputs.oat, inputs.weight, inputs.wind, true);

  const weightInterp = interpolateWeight(
    ENHANCED_WEIGHT_CURVES,
    inputs.weight,
    'lossFtAtRef'
  );

  const paFactor = (inputs.pa / 1000) * 7.5;
  const oatFactor = ((inputs.oat - 15) / 10) * 5.5;
  const baseFt = weightInterp.value + paFactor + oatFactor;
  const windCorrectionFt = -0.65 * Math.min(40, Math.max(0, inputs.wind));
  const finalFt = Math.max(0, baseFt + windCorrectionFt);

  return {
    chart: 'Supplement 97 / Figure 4-10',
    weightInterp,
    baseFt,
    windCorrectionFt,
    descendingCorrectionFt: 0,
    finalFt,
  };
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

  const computed = inputs.profile === 'enhanced'
    ? calculateEnhanced(inputs)
    : calculateOffshore(inputs);

  return {
    ...inputs,
    ...computed,
    finalM: computed.finalFt * FT_TO_M,
  };
}

function xMap(value, min, max, x0, x1) {
  return x0 + ((value - min) / (max - min)) * (x1 - x0);
}

function yMap(value, min, max, y0, y1) {
  return y1 - ((value - min) / (max - min)) * (y1 - y0);
}

function drawChart(result = null, canvas = chartCanvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f7f7f2';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#111';
  ctx.font = 'bold 22px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(
    result?.profile === 'enhanced'
      ? 'ENHANCED OFFSHORE PROCEDURE'
      : 'DROP DOWN OFFSHORE HELIDECK PROCEDURE',
    60,
    45
  );

  const left = { x0: 80, y0: 90, x1: 390, y1: 470 };
  const center = { x0: 440, y0: 90, x1: 770, y1: 470 };
  const right = { x0: 820, y0: 90, x1: 1120, y1: 470 };

  [left, center, right].forEach(panel => {
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(panel.x0, panel.y0, panel.x1 - panel.x0, panel.y1 - panel.y0);
  });

  ctx.font = '15px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText('PA / OAT', left.x0, left.y0 - 12);
  ctx.fillText('GW / Drop Down', center.x0, center.y0 - 12);
  ctx.fillText('Wind correction', right.x0, right.y0 - 12);

  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i += 1) {
    const x = xMap(i, 0, 5, left.x0, left.x1);
    ctx.beginPath();
    ctx.moveTo(x, left.y0);
    ctx.lineTo(x, left.y1);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillText(String(i * 1000), x - 12, left.y1 + 20);
  }

  for (let temp = -30; temp <= 50; temp += 10) {
    const y = yMap(temp, -30, 50, left.y0, left.y1);
    ctx.beginPath();
    ctx.moveTo(left.x0, y);
    ctx.lineTo(left.x1, y);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillText(String(temp), left.x0 - 32, y + 4);
  }

  const curves = result?.profile === 'enhanced'
    ? ENHANCED_WEIGHT_CURVES
    : OFFSHORE_WEIGHT_CURVES;

  curves.forEach(curve => {
    const value = curve.dropFtAtRef ?? curve.lossFtAtRef;
    const y = yMap(value, 0, 120, center.y0, center.y1);

    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.moveTo(center.x0, y);
    ctx.quadraticCurveTo((center.x0 + center.x1) / 2, y - 35, center.x1, y - 5);
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.fillText(String(curve.weight), center.x0 + 6, y - 4);
  });

  for (let wind = 0; wind <= 40; wind += 10) {
    const x = xMap(wind, 0, 40, right.x0, right.x1);
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath();
    ctx.moveTo(x, right.y0);
    ctx.lineTo(x, right.y1);
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.fillText(String(wind), x - 8, right.y1 + 20);
  }

  if (!result) return;

  const paMin = result.profile === 'enhanced' ? -1000 : -1000;
  const paMax = result.profile === 'enhanced' ? 1000 : 5000;

  const xPa = xMap(result.pa, paMin, paMax, left.x0, left.x1);
  const yOat = yMap(result.oat, -30, 50, left.y0, left.y1);
  const xCenter = xMap(result.finalFt, 0, 160, center.x0, center.x1);
  const yBase = yMap(result.baseFt, 0, 120, center.y0, center.y1);
  const xWind = xMap(result.wind, 0, 40, right.x0, right.x1);
  const yFinal = yMap(result.finalFt, 0, 160, right.y0, right.y1);

  ctx.lineWidth = 4;

  ctx.strokeStyle = '#f3b447';
  ctx.beginPath();
  ctx.moveTo(xPa, left.y1);
  ctx.lineTo(xPa, yOat);
  ctx.stroke();

  ctx.strokeStyle = '#4ef0ff';
  ctx.beginPath();
  ctx.moveTo(xPa, yOat);
  ctx.lineTo(xCenter, yBase);
  ctx.stroke();

  ctx.strokeStyle = '#8bff6f';
  ctx.beginPath();
  ctx.moveTo(xCenter, center.y1);
  ctx.lineTo(xCenter, yBase);
  ctx.stroke();

  ctx.strokeStyle = '#ff79cb';
  ctx.beginPath();
  ctx.moveTo(xWind, right.y1);
  ctx.lineTo(xWind, yFinal);
  ctx.stroke();

  [
    [xPa, yOat, '#f3b447'],
    [xCenter, yBase, '#8bff6f'],
    [xWind, yFinal, '#ff79cb'],
  ].forEach(([x, y, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.stroke();
  });

  ctx.fillStyle = '#111';
  ctx.font = 'bold 18px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(`${fmt(result.finalFt, 0)} ft`, right.x0, right.y0 - 12);
}

function render(result) {
  currentResult = result;

  finalMetric.textContent = `${fmt(result.finalFt, 0)} ft`;
  finalMetricM.textContent = `${fmt(result.finalM, 1)} m`;

  statusCard.className = 'card status sticky-result within';
  statusBadge.textContent = 'DROPDOWN CALCULADO';
  statusTitle.textContent = result.profile === 'enhanced'
    ? 'Enhanced Height Loss'
    : 'Offshore Dropdown';
  statusText.textContent = `Resultado final ${fmt(result.finalFt, 0)} ft`;
  statusDetail.textContent = `${result.chart}. Correções aplicadas automaticamente.`;

  interpBox.innerHTML = `
    <strong>Carta:</strong> ${result.chart}<br>
    <strong>Curvas de peso:</strong> ${fmt(result.weightInterp.low, 0)} / ${fmt(result.weightInterp.high, 0)} kg<br>
    <strong>Leitura base:</strong> ${fmt(result.baseFt, 1)} ft<br>
    <strong>Correção de vento:</strong> ${fmt(result.windCorrectionFt, 1)} ft<br>
    <strong>Correção Descending:</strong> ${fmt(result.descendingCorrectionFt, 1)} ft<br>
    <strong>Resultado final:</strong> ${fmt(result.finalFt, 1)} ft (${fmt(result.finalM, 1)} m)<br>
    <small>DD-V5: overlay esquemático com fullscreen, zoom e pan. Próximo passo: imagem real da carta + calibração X/Y.</small>
  `;

  drawChart(result, chartCanvas);
  if (chartFullscreen && !chartFullscreen.classList.contains('hidden')) {
    drawChart(result, fullscreenChartCanvas);
  }
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

  drawChart(null, chartCanvas);
}

function toggleSignedInput(el) {
  const raw = String(el.value || '').trim();
  const digits = raw.replace(/[^0-9]/g, '');
  el.value = raw.startsWith('-') ? digits : `-${digits}`;
  el.focus();
}

function resetFullscreenTransform() {
  fullscreenState.zoom = 1;
  fullscreenState.panX = 0;
  fullscreenState.panY = 0;
  fullscreenState.dragging = false;

  if (fullscreenChartCanvas) {
    fullscreenChartCanvas.style.transform = 'translate(0px, 0px) scale(1)';
    fullscreenChartCanvas.style.transformOrigin = 'center center';
    fullscreenChartCanvas.style.touchAction = 'none';
  }
}

function applyFullscreenTransform() {
  if (!fullscreenChartCanvas) return;
  fullscreenChartCanvas.style.transform =
    `translate(${fullscreenState.panX}px, ${fullscreenState.panY}px) scale(${fullscreenState.zoom})`;
}

function openFullscreenChart() {
  if (!chartFullscreen || !fullscreenChartCanvas) return;

  chartFullscreen.classList.remove('hidden');
  chartFullscreen.setAttribute('aria-hidden', 'false');
  document.body.classList.add('fullscreen-open');
  document.body.style.overflow = 'hidden';

  drawChart(currentResult, fullscreenChartCanvas);
  resetFullscreenTransform();
}

function closeFullscreenChart() {
  if (!chartFullscreen) return;

  chartFullscreen.classList.add('hidden');
  chartFullscreen.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('fullscreen-open');
  document.body.style.overflow = '';
  resetFullscreenTransform();
}

function handleFullscreenTap(event) {
  const now = Date.now();
  if (now - fullscreenState.lastTap < 320) {
    fullscreenState.zoom = fullscreenState.zoom === 1 ? 2.3 : 1;
    if (fullscreenState.zoom === 1) {
      fullscreenState.panX = 0;
      fullscreenState.panY = 0;
    }
    applyFullscreenTransform();
  }
  fullscreenState.lastTap = now;
}

document.getElementById('paNegativeBtn')?.addEventListener('click', () => toggleSignedInput(paEl));
document.getElementById('oatNegativeBtn')?.addEventListener('click', () => toggleSignedInput(oatEl));

runBtn?.addEventListener('click', () => {
  try {
    render(calculateDropdown());
  } catch (err) {
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

openFullscreenBtn?.addEventListener('click', openFullscreenChart);
chartStage?.addEventListener('click', openFullscreenChart);
closeFullscreenBtn?.addEventListener('click', closeFullscreenChart);

fullscreenChartCanvas?.addEventListener('pointerdown', event => {
  fullscreenState.dragging = true;
  fullscreenState.startX = event.clientX - fullscreenState.panX;
  fullscreenState.startY = event.clientY - fullscreenState.panY;
  fullscreenChartCanvas.setPointerCapture?.(event.pointerId);
});

fullscreenChartCanvas?.addEventListener('pointermove', event => {
  if (!fullscreenState.dragging) return;
  fullscreenState.panX = event.clientX - fullscreenState.startX;
  fullscreenState.panY = event.clientY - fullscreenState.startY;
  applyFullscreenTransform();
});

fullscreenChartCanvas?.addEventListener('pointerup', event => {
  fullscreenState.dragging = false;
  fullscreenChartCanvas.releasePointerCapture?.(event.pointerId);
});

fullscreenChartCanvas?.addEventListener('pointercancel', () => {
  fullscreenState.dragging = false;
});

fullscreenChartCanvas?.addEventListener('click', handleFullscreenTap);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeFullscreenChart();
});

drawChart(null, chartCanvas);
