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

function fmt(num, digits = 0) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(num);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parse(el) {
  return Number(String(el.value || '').replace(/[^0-9-]/g, ''));
}

function calculateDropdown() {
  const pa = parse(paEl);
  const oat = parse(oatEl);
  const weight = parse(weightEl);
  const wind = parse(windEl);
  const profile = profileEl.value;
  const config = configurationEl.value;

  if ([pa, oat, weight, wind].some(v => Number.isNaN(v))) {
    throw new Error('Preencha todos os campos.');
  }

  let base = 45;

  base += (pa / 1000) * 6;
  base += (oat / 10) * 4;
  base += ((weight - 5800) / 100) * 1.8;

  if (config === 'eapsOff') base += 6;
  if (config === 'eapsOn') base += 12;

  if (profile === 'enhanced') {
    base += 18;
  }

  const windCorrection = -wind;

  let descendingCorrection = 0;
  if (profile === 'offshoreDescending') {
    descendingCorrection = 15;
  }

  const finalFt = clamp(base + windCorrection + descendingCorrection, 15, 250);
  const finalM = finalFt * 0.3048;

  return {
    pa,
    oat,
    weight,
    wind,
    profile,
    config,
    base,
    windCorrection,
    descendingCorrection,
    finalFt,
    finalM,
  };
}

function render(result) {
  finalMetric.textContent = `${fmt(result.finalFt, 0)} ft`;
  finalMetricM.textContent = `${fmt(result.finalM, 1)} m`;

  statusCard.className = 'card status sticky-result within';
  statusBadge.textContent = 'DROPDOWN CALCULADO';
  statusTitle.textContent = 'Height Loss / Dropdown';
  statusText.textContent = `Resultado final ${fmt(result.finalFt, 0)} ft`;
  statusDetail.textContent = 'Correções de vento e perfil aplicadas.';

  interpBox.innerHTML = `
    <strong>Base:</strong> ${fmt(result.base,1)} ft<br>
    <strong>Wind correction:</strong> ${fmt(result.windCorrection,1)} ft<br>
    <strong>Descending correction:</strong> ${fmt(result.descendingCorrection,1)} ft<br>
    <strong>Final:</strong> ${fmt(result.finalFt,1)} ft (${fmt(result.finalM,1)} m)
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

runBtn.addEventListener('click', () => {
  try {
    render(calculateDropdown());
  } catch (err) {
    statusCard.className = 'card status sticky-result out';
    statusBadge.textContent = 'ERRO';
    statusText.textContent = err.message;
  }
});

resetBtn.addEventListener('click', reset);
