const SHARED_KEY = 'aw139_companion_shared_context_v1';
const adcFrame = document.getElementById('adcFrame');
const watFrame = document.getElementById('watFrame');
const rtoFrame = document.getElementById('rtoFrame');
const frameMap = { adc: adcFrame, wat: watFrame, rto: rtoFrame };

const els = {
  base: document.getElementById('baseSelect'),
  departure: document.getElementById('departureEndSelect'),
  config: document.getElementById('configurationSelect'),
  pa: document.getElementById('pressureAltitude'),
  paNegativeBtn: document.getElementById('paNegativeBtn'),
  oat: document.getElementById('oat'),
  oatNegativeBtn: document.getElementById('oatNegativeBtn'),
  weight: document.getElementById('actualWeight'),
  wind: document.getElementById('headwind'),
  runBtn: document.getElementById('runBtn'),
  visualSelect: document.getElementById('visualSelect'),
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
};

function loadCtx() { try { return JSON.parse(localStorage.getItem(SHARED_KEY) || '{}'); } catch { return {}; } }
function saveCtx(patch) { localStorage.setItem(SHARED_KEY, JSON.stringify({ ...loadCtx(), ...patch, updatedAt: new Date().toISOString(), lastModule: 'cata' })); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function setField(doc, id, value) {
  const el = doc.getElementById(id);
  if (!el) return false;
  el.value = value ?? '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
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

async function syncDepartureOptionsFromADC(baseId, preferredDeparture = null) {
  const doc = await waitForIframe(adcFrame, ['baseSelect', 'departureEndSelect']);
  setField(doc, 'baseSelect', baseId);
  await sleep(120);
  const depSelect = doc.getElementById('departureEndSelect');
  const wanted = preferredDeparture ?? els.departure.value;
  els.departure.innerHTML = depSelect.innerHTML;
  const values = [...depSelect.options].map(opt => opt.value);
  if (values.includes(wanted)) els.departure.value = wanted;
  else if (depSelect.value) els.departure.value = depSelect.value;
}

async function populateBaseOptions() {
  const doc = await waitForIframe(adcFrame, ['baseSelect', 'departureEndSelect']);
  const baseSelect = doc.getElementById('baseSelect');
  els.base.innerHTML = baseSelect.innerHTML;
  if (!els.base.value) els.base.value = baseSelect.value;
  await syncDepartureOptionsFromADC(els.base.value, els.departure.value);
}

async function waitForADCChartReady(doc, timeoutMs = 5000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const win = doc.defaultView;
      const canvas = doc.getElementById('vizCanvas');
      const subtitle = text(doc, 'vizSubtitle');
      const rect = canvas?.getBoundingClientRect();
      const chartReady = !!(canvas && rect && rect.width > 150 && rect.height > 150);
      const imageReady = !!win?.document?.querySelector('#vizCanvas');
      if (chartReady || (imageReady && !/falha ao carregar/i.test(subtitle))) return true;
    } catch {}
    await sleep(120);
  }
  return false;
}

function scheduleViewerRefresh(mode) {
  [80, 220, 500, 900, 1500].forEach(delay => {
    setTimeout(() => {
      try { resizeActiveFrame(mode); } catch {}
      try { renderVisualizationMeta(mode); } catch {}
      try { frameMap[mode]?.contentWindow?.postMessage?.({ type: 'aw139-cata-force-resize' }, '*'); } catch {}
    }, delay);
  });
}

function collectInputs() {
  return {
    base: els.base.value,
    departureEnd: els.departure.value,
    configuration: els.config.value,
    pressureAltitudeFt: Number(els.pa.value || 0),
    oatC: Number(els.oat.value || 0),
    weightKg: Number(els.weight.value || 0),
    headwindKt: Number(els.wind.value || 0)
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
    cataConfiguration: input.configuration,
    cataProcedure: 'clear',
    ...patch
  };
  saveCtx(merged);
}

async function runWAT(input) {
  const doc = await waitForIframe(watFrame, ['procedure', 'configuration', 'pressureAltitude', 'oat', 'actualWeight', 'headwind', 'runBtn', 'maxWeight', 'margin']);
  setField(doc, 'procedure', 'clear');
  setField(doc, 'configuration', input.configuration);
  await sleep(250);
  setField(doc, 'pressureAltitude', input.pressureAltitudeFt);
  setField(doc, 'oat', input.oatC);
  setField(doc, 'actualWeight', input.weightKg);
  setField(doc, 'headwind', input.headwindKt);
  try { doc.defaultView?.runCalculation?.(); } catch { clickField(doc, 'runBtn'); }

  const maxText = await waitForTruthy(() => {
    const t = text(doc, 'maxWeight');
    return t && t !== '—' ? t : null;
  }, 5000);
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

  setField(doc, 'configuration', mapRtoConfig(input.configuration));
  await sleep(120);
  try {
    await doc.defaultView?.ensureEffectiveProfileLoaded?.({ preserveInputs: true, autoRun: false });
  } catch {}
  setField(doc, 'pressureAltitude', input.pressureAltitudeFt);
  setField(doc, 'oat', input.oatC);
  setField(doc, 'actualWeight', input.weightKg);
  setField(doc, 'headwind', input.headwindKt);
  await sleep(80);
  try {
    await doc.defaultView?.runCalculation?.({ skipEnsureProfile: true });
  } catch {
    clickField(doc, 'runBtn');
  }

  let metricText = await waitForTruthy(() => {
    const t = text(doc, 'finalMetric');
    const pending = /recalculando|aguardando/i.test(text(doc, 'statusDetail')) || /recalculando|aguardando/i.test(text(doc, 'statusText'));
    return /\d/.test(t) && t !== '—' && !pending && (t !== previousMetric || previousMetric === '—') ? t : null;
  }, 7000);

  if (!metricText) {
    try { await doc.defaultView?.runCalculation?.({ skipEnsureProfile: true }); } catch { clickField(doc, 'runBtn'); }
    metricText = await waitForTruthy(() => {
      const t = text(doc, 'finalMetric');
      const pending = /recalculando|aguardando/i.test(text(doc, 'statusDetail')) || /recalculando|aguardando/i.test(text(doc, 'statusText'));
      return /\d/.test(t) && t !== '—' && !pending ? t : null;
    }, 5000);
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
  const table = doc.getElementById('decisionTable');
  const gateMetric = doc.getElementById('gateMetric');
  const fullMetric = doc.getElementById('fullLengthMetric');
  if (table) table.innerHTML = '';
  if (gateMetric) gateMetric.textContent = '—';
  if (fullMetric) fullMetric.textContent = '—';

  setField(doc, 'baseSelect', input.base);
  await sleep(120);
  await syncDepartureOptionsFromADC(input.base, input.departureEnd);
  setField(doc, 'departureEndSelect', els.departure.value || input.departureEnd);
  if (rtoResult?.rtoMeters != null) setField(doc, 'rtoInput', rtoResult.rtoMeters);
  await waitForADCChartReady(doc, 3500);
  await sleep(80);
  try { doc.defaultView?.analyze?.(); } catch { clickField(doc, 'analyzeBtn'); }
  await waitForTruthy(() => doc.querySelectorAll('#decisionTable tr').length > 0, 4500);
  scheduleViewerRefresh('adc');

  const rows = [...doc.querySelectorAll('#decisionTable tr')].map(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length < 4) return null;
    const rtoOkText = tds[2].textContent.trim();
    const decisionText = tds[3].textContent.trim();
    const go = /^OK$/i.test(rtoOkText) || (/PODE/i.test(decisionText) && !/NÃO PODE|NAO PODE|NO GO/i.test(decisionText));
    return {
      point: tds[0].textContent.trim(),
      rtoOk: rtoOkText,
      decision: decisionText,
      go
    };
  }).filter(Boolean);

  return {
    gateText: text(doc, 'gateMetric'),
    fullText: text(doc, 'fullLengthMetric'),
    rows
  };
}

function renderResults(wat, rto, adc) {
  const decisionRows = adc?.rows || [];
  const watOk = wat?.marginKg != null ? wat.marginKg >= 0 : false;
  const badPoints = decisionRows.filter(row => !row.go).map(row => row.point);
  const fullRunwayRow = decisionRows.find(row => /^(full|pista|full length)$/i.test(String(row.point || '').trim()));
  const runwayToraOk = fullRunwayRow ? fullRunwayRow.go : false;
  const overallOk = watOk && runwayToraOk;

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
  } else if (runwayToraOk) {
    els.rtoSummary.textContent = badPoints.length
      ? `GO — pista comporta o RTO. Restrição por ponto: ${badPoints.join(', ')}.`
      : 'GO — pista comporta o RTO em toda a extensão.';
  } else {
    els.rtoSummary.textContent = 'NO GO — item negativo: RTO maior que a TORA da pista.';
  }

  els.watBox.classList.remove('ok', 'bad');
  els.rtoBox.classList.remove('ok', 'bad');
  if (wat?.marginKg != null) els.watBox.classList.add(watOk ? 'ok' : 'bad');
  if (decisionRows.length) els.rtoBox.classList.add(runwayToraOk ? 'ok' : 'bad');

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
      .viz-wrap{background:#000!important;cursor:zoom-in;display:block!important;overflow:hidden!important;height:auto!important;min-height:0!important;line-height:0}
      #vizCanvas{width:100%!important;height:auto!important;max-width:100%!important;max-height:none!important;background:#000!important;display:block!important}
      .chart-close{display:none!important}
    `;
    doc.head.appendChild(style);
    addFullscreenClick(doc, '#vizWrap');
  }
}

async function prepareEmbeddedView(mode) {
  try {
    const doc = await waitForIframe(frameMap[mode]);
    applyUnifiedChartView(doc, mode);
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
  els.vizSubtitle.textContent = mapVizLabel('');
  els.visualSelect.value = '';
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
  if (mode === 'adc') {
    const doc = adcFrame.contentDocument;
    const src = doc?.getElementById('vizCanvas');
    if (!src) return false;
    out.width = src.width || Math.ceil(src.getBoundingClientRect().width) || 1;
    out.height = src.height || Math.ceil(src.getBoundingClientRect().height) || 1;
    ctx.clearRect(0,0,out.width,out.height);
    ctx.drawImage(src,0,0,out.width,out.height);
    return true;
  }
  if (mode === 'rto') {
    const doc = rtoFrame.contentDocument;
    const src = doc?.getElementById('chartCanvas');
    if (!src) return false;
    out.width = src.width || Math.ceil(src.getBoundingClientRect().width) || 1;
    out.height = src.height || Math.ceil(src.getBoundingClientRect().height) || 1;
    ctx.clearRect(0,0,out.width,out.height);
    ctx.drawImage(src,0,0,out.width,out.height);
    return true;
  }
  if (mode === 'wat') {
    const doc = watFrame.contentDocument;
    const img = doc?.getElementById('chartBaseImage');
    const overlay = doc?.getElementById('chartCanvas');
    if (!img) return false;
    const w = img.naturalWidth || img.width || Math.ceil(img.getBoundingClientRect().width) || 1;
    const h = img.naturalHeight || img.height || Math.ceil(img.getBoundingClientRect().height) || 1;
    out.width = w; out.height = h;
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(img,0,0,w,h);
    if (overlay) ctx.drawImage(overlay,0,0,w,h);
    return true;
  }
  return false;
}

function applyFullscreenTransform() {
  fullscreenEls.canvas.style.transform = `translate(${fullscreenState.x}px, ${fullscreenState.y}px) scale(${fullscreenState.scale})`;
}

function fitFullscreenCanvas() {
  const vp = fullscreenEls.viewport;
  const c = fullscreenEls.canvas;
  const scale = Math.min(vp.clientWidth / c.width, vp.clientHeight / c.height, 1);
  fullscreenState.scale = scale;
  fullscreenState.minScale = scale;
  fullscreenState.x = (vp.clientWidth - c.width * scale) / 2;
  fullscreenState.y = (vp.clientHeight - c.height * scale) / 2;
  applyFullscreenTransform();
}

function closeFullscreenChart() {
  fullscreenState.active = false;
  fullscreenEls.overlay.hidden = true;
  document.body.classList.remove('fullscreen-body');
}

function openFullscreenChart(mode) {
  if (!drawFullscreenSource(mode)) return;
  fullscreenState.active = true;
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
  els.vizSubtitle.textContent = mapVizLabel(mode);
  renderVisualizationMeta(mode);
  prepareEmbeddedView(mode).then(async () => {
    await sleep(80);
    resizeActiveFrame(mode);
    renderVisualizationMeta(mode);
    scheduleViewerRefresh(mode);
  });
}

function setupAutoAdvance() {
  const rules = [
    { el: els.base, next: els.departure },
    { el: els.departure, next: els.config },
    { el: els.config, next: els.visualSelect },
    { el: els.visualSelect, next: els.pa },
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
    setVisualization(els.visualSelect.value || 'adc');
    await sleep(120);
    resizeActiveFrame(els.visualSelect.value || 'adc');
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
  els.base.addEventListener('change', async () => {
    await syncDepartureOptionsFromADC(els.base.value);
    renderVisualizationMeta(els.visualSelect.value || '');
    if ((els.visualSelect.value || '') === 'adc') scheduleViewerRefresh('adc');
  });
  els.visualSelect.addEventListener('change', e => setVisualization(e.target.value, !!e.target.value));
  document.querySelectorAll('.viewer-tab').forEach(btn => btn.addEventListener('click', () => setVisualization(btn.dataset.viz, true)));
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
  fullscreenEls.close.addEventListener('click', (event) => {
    event.stopPropagation();
    closeFullscreenChart();
  });
  fullscreenEls.viewport.addEventListener('click', () => {
    if (fullscreenState.scale <= fullscreenState.minScale + 0.01 && !fullscreenState.moved) closeFullscreenChart();
    fullscreenState.moved = false;
  });
  fullscreenEls.viewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 1.15 : 0.87;
    fullscreenState.scale = Math.max(fullscreenState.minScale, Math.min(fullscreenState.maxScale, fullscreenState.scale * delta));
    applyFullscreenTransform();
  }, { passive: false });
  fullscreenEls.viewport.addEventListener('pointerdown', (event) => {
    fullscreenState.dragging = true;
    fullscreenState.moved = false;
    fullscreenState.startX = event.clientX - fullscreenState.x;
    fullscreenState.startY = event.clientY - fullscreenState.y;
  });
  fullscreenEls.viewport.addEventListener('pointermove', (event) => {
    if (!fullscreenState.dragging || fullscreenState.scale <= fullscreenState.minScale + 0.01) return;
    fullscreenState.x = event.clientX - fullscreenState.startX;
    fullscreenState.y = event.clientY - fullscreenState.startY;
    fullscreenState.moved = true;
    applyFullscreenTransform();
  });
  const endDrag = () => { fullscreenState.dragging = false; };
  fullscreenEls.viewport.addEventListener('pointerup', endDrag);
  fullscreenEls.viewport.addEventListener('pointercancel', endDrag);
  let touchDist = null;
  let touchScale = null;
  fullscreenEls.viewport.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      const [a,b] = event.touches;
      touchDist = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      touchScale = fullscreenState.scale;
    }
  }, { passive: true });
  fullscreenEls.viewport.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && touchDist) {
      const [a,b] = event.touches;
      const newDist = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      fullscreenState.scale = Math.max(fullscreenState.minScale, Math.min(fullscreenState.maxScale, touchScale * (newDist / touchDist)));
      applyFullscreenTransform();
    }
  }, { passive: true });
  fullscreenEls.viewport.addEventListener('touchend', () => { touchDist = null; touchScale = null; });
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
    await Promise.all([prepareEmbeddedView('adc'), prepareEmbeddedView('wat'), prepareEmbeddedView('rto')]);
    resizeActiveFrame('adc');
    resizeActiveFrame('wat');
    resizeActiveFrame('rto');
  } catch (error) {
    console.error('Falha ao inicializar integração', error);
  }
});
