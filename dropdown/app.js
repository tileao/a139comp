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

const FT_TO_M = 0.3048;
const M_TO_FT = 3.28084;

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

function isaAtPa(paFt) {
  return 15 - (paFt / 1000) * 1.98;
}

function validateCommon(pa, oat, weight, wind, enhanced) {
  if ([pa, oat, weight, wind].some(v => Number.isNaN(v))) throw new Error('Preencha todos os campos.');
  if (wind < 0 || wind > 40) throw new Error('Headwind válido: 0 a 40 kt.');
  if (enhanced) {
    if (pa < -1000 || pa > 1000) throw new Error('Enhanced: PA válida aproximada de -1000 a 1000 ft.');
  } else {
    if (pa < -1000 || pa > 5000) throw new Error('Offshore: PA válida de -1000 a 5000 ft.');
  }
  const maxOat = isaAtPa(pa) + 35;
  if (oat > maxOat) throw new Error(`OAT acima do limite ISA+35°C nesta PA. Limite aprox.: ${fmt(maxOat,1)}°C.`);
}

function calculateOffshore({ pa, oat, weight, wind, profile, config }) {
  validateCommon(pa, oat, weight, wind, false);
  const weightInterp = interpolateWeight(OFFSHORE_WEIGHT_CURVES, weight, 'dropFtAtRef');
  const paFactor = (pa / 1000) * 4.2;
  const oatFactor = ((oat - 15) / 10) * 6.8;
  const configFactor = config === 'eapsOn' ? 4 : config === 'eapsOff' ? 2 : 0;
  const baseFt = weightInterp.value + paFactor + oatFactor + configFactor;
  const windCorrectionFt = -Math.min(40, Math.max(0, wind));
  const descendingCorrectionFt = profile === 'offshoreDescending' ? 15 : 0;
  const finalFt = Math.max(0, baseFt + windCorrectionFt + descendingCorrectionFt);
  return { chart: weight > 6400 ? 'Supplement 50 / Figure 4-74' : 'Supplement 12 / Figure 4I-1', weightInterp, baseFt, windCorrectionFt, descendingCorrectionFt, finalFt };
}

function calculateEnhanced({ pa, oat, weight, wind }) {
  validateCommon(pa, oat, weight, wind, true);
  const weightInterp = interpolateWeight(ENHANCED_WEIGHT_CURVES, weight, 'lossFtAtRef');
  const paFactor = (pa / 1000) * 7.5;
  const oatFactor = ((oat - 15) / 10) * 5.5;
  const headwindFactor = -0.65 * Math.min(40, Math.max(0, wind));
  const baseFt = weightInterp.value + paFactor + oatFactor;
  const finalFt = Math.max(0, baseFt + headwindFactor);
  return { chart: 'Supplement 97 / Figure 4-10', weightInterp, baseFt, windCorrectionFt: headwindFactor, descendingCorrectionFt: 0, finalFt };
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
  return { ...inputs, ...computed, finalM: computed.finalFt * FT_TO_M };
}

function render(result) {
  finalMetric.textContent = `${fmt(result.finalFt, 0)} ft`;
  finalMetricM.textContent = `${fmt(result.finalM, 1)} m`;
  statusCard.className = 'card status sticky-result within';
  statusBadge.textContent = 'DROPDOWN CALCULADO';
  statusTitle.textContent = result.profile === 'enhanced' ? 'Enhanced Height Loss' : 'Offshore Dropdown';
  statusText.textContent = `Resultado final ${fmt(result.finalFt, 0)} ft`;
  statusDetail.textContent = `${result.chart}. Correções aplicadas automaticamente.`;
  interpBox.innerHTML = `
    <strong>Carta:</strong> ${result.chart}<br>
    <strong>Curvas de peso:</strong> ${fmt(result.weightInterp.low,0)} / ${fmt(result.weightInterp.high,0)} kg<br>
    <strong>Leitura base:</strong> ${fmt(result.baseFt,1)} ft<br>
    <strong>Correção de vento:</strong> ${fmt(result.windCorrectionFt,1)} ft<br>
    <strong>Correção Descending:</strong> ${fmt(result.descendingCorrectionFt,1)} ft<br>
    <strong>Resultado final:</strong> ${fmt(result.finalFt,1)} ft (${fmt(result.finalM,1)} m)<br>
    <small>Nota: engine DD-V2 usa interpolação numérica calibrada pelas escalas das cartas. A próxima etapa é substituir por extração geométrica vetorial/overlay.</small>
  `;
}

function reset() {
  [paEl, oatEl, weightEl, windEl].forEach(el => el.value = '');
  finalMetric.textContent = '—';
  finalMetricM.textContent = '—';
  statusCard.className = 'card status sticky-result neutral';
  statusBadge.textContent = 'AGUARDANDO DADOS';
  statusTitle.textContent = 'Dropdown / Height Loss';
  statusText.textContent = 'Preencha os campos e execute o cálculo.';
  statusDetail.textContent = 'Correção de vento e incremento Descending serão aplicados automaticamente.';
  interpBox.textContent = 'Sem cálculo ainda.';
}

function toggleSignedInput(el) {
  const raw = String(el.value || '').trim();
  const digits = raw.replace(/[^0-9]/g, '');
  el.value = raw.startsWith('-') ? digits : `-${digits}`;
  el.focus();
}

document.getElementById('paNegativeBtn')?.addEventListener('click', () => toggleSignedInput(paEl));
document.getElementById('oatNegativeBtn')?.addEventListener('click', () => toggleSignedInput(oatEl));
runBtn.addEventListener('click', () => {
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
resetBtn.addEventListener('click', reset);
