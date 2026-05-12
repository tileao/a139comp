// AW139 Dropdown final UI polish
// Adds kg/lb weight input mode, trims explanatory text, and keeps DD-V7 engine untouched.
(() => {
  const $ = id => document.getElementById(id);
  const KG_PER_LB = 0.45359237;
  const LB_PER_KG = 2.2046226218;

  const weightEl = $('actualWeight');
  const runBtn = $('runBtn');
  const resetBtn = $('resetBtn');
  const finalMetric = $('finalMetric');
  const finalMetricM = $('finalMetricM');
  const statusBadge = $('statusBadge');
  const statusTitle = $('statusTitle');
  const statusText = $('statusText');
  const statusDetail = $('statusDetail');

  if (!weightEl) return;

  function numberFromInput(el) {
    const raw = String(el.value || '').trim();
    if (!raw || raw === '-') return NaN;
    return Number(raw.replace(/[^0-9.-]/g, ''));
  }

  function roundWeight(v) {
    return Number.isFinite(v) ? String(Math.round(v)) : '';
  }

  function unitSelect() {
    return document.getElementById('weightUnit');
  }

  function getUnit() {
    return unitSelect()?.value || 'kg';
  }

  function setWeightPlaceholder() {
    weightEl.placeholder = getUnit() === 'lb' ? 'ex. 15000' : 'ex. 6800';
  }

  function installUnitSelector() {
    if (unitSelect()) return;

    const label = weightEl.closest('label');
    const title = label?.querySelector('span');
    if (title) title.textContent = 'Gross Weight';

    const wrap = document.createElement('div');
    wrap.className = 'weight-unit-wrap';

    weightEl.parentNode.insertBefore(wrap, weightEl);
    wrap.appendChild(weightEl);

    const select = document.createElement('select');
    select.id = 'weightUnit';
    select.className = 'weight-unit-select';
    select.setAttribute('aria-label', 'Unidade de peso');
    select.innerHTML = '<option value="kg">kg</option><option value="lb">lb</option>';
    select.value = localStorage.getItem('dropdownWeightUnit') || 'kg';
    wrap.appendChild(select);

    const style = document.createElement('style');
    style.textContent = `
      .weight-unit-wrap{display:grid;grid-template-columns:1fr 74px;gap:8px;align-items:center;width:100%;}
      .weight-unit-select{height:44px;border-radius:12px;border:1px solid rgba(148,163,184,.28);background:rgba(15,23,42,.06);color:inherit;font:700 15px system-ui,-apple-system,Segoe UI,sans-serif;padding:0 10px;}
      .form-card .hint,.chart-reference{display:none!important;}
      .hero .subtitle{margin-bottom:0!important;}
      .hero .build-version{opacity:.82!important;}
      .card.compact{display:none!important;}
      #statusDetail{opacity:.78!important;}
    `;
    document.head.appendChild(style);

    select.addEventListener('change', () => {
      const newUnit = select.value;
      localStorage.setItem('dropdownWeightUnit', newUnit);
      const current = numberFromInput(weightEl);
      const previous = weightEl.dataset.currentUnit || 'kg';

      if (Number.isFinite(current) && current > 0 && previous !== newUnit) {
        weightEl.value = newUnit === 'lb'
          ? roundWeight(current * LB_PER_KG)
          : roundWeight(current * KG_PER_LB);
      }

      weightEl.dataset.currentUnit = newUnit;
      setWeightPlaceholder();
    });

    weightEl.dataset.currentUnit = select.value;
    setWeightPlaceholder();
  }

  function polishStaticText() {
    const heroSubtitle = document.querySelector('.hero .subtitle');
    if (heroSubtitle) heroSubtitle.textContent = 'Dropdown / Height Loss';

    const build = document.querySelector('.build-version');
    if (build) build.textContent = 'Versão final';

    const productSub = document.querySelector('.product-sub');
    if (productSub) productSub.textContent = 'Dropdown';

    if (runBtn) runBtn.textContent = 'Calcular';
    if (resetBtn) resetBtn.textContent = 'Limpar';

    if (statusBadge && /AGUARDANDO|DD-V7/i.test(statusBadge.textContent)) statusBadge.textContent = 'PRONTO';
    if (statusTitle && /Dropdown|Height Loss/i.test(statusTitle.textContent)) statusTitle.textContent = 'Dropdown';
    if (statusText && /Preencha/i.test(statusText.textContent)) statusText.textContent = 'Informe os dados e calcule.';
    if (statusDetail && /DD-V7|Headwind/i.test(statusDetail.textContent)) statusDetail.textContent = 'Headwind vazio = 0 kt.';
  }

  function prepareWeightForEngine() {
    delete weightEl.dataset.originalDisplayValue;
    delete weightEl.dataset.originalDisplayUnit;

    if (getUnit() !== 'lb') return;

    const lb = numberFromInput(weightEl);
    if (!Number.isFinite(lb)) return;

    weightEl.dataset.originalDisplayValue = String(weightEl.value);
    weightEl.dataset.originalDisplayUnit = 'lb';
    weightEl.value = roundWeight(lb * KG_PER_LB);
  }

  function restoreDisplayedWeight() {
    if (weightEl.dataset.originalDisplayUnit !== 'lb') return;
    weightEl.value = weightEl.dataset.originalDisplayValue || '';
    delete weightEl.dataset.originalDisplayValue;
    delete weightEl.dataset.originalDisplayUnit;
  }

  function polishResultText() {
    restoreDisplayedWeight();

    if (statusBadge) {
      if (/FORA/i.test(statusBadge.textContent)) statusBadge.textContent = 'FORA DO ENVELOPE';
      else if (finalMetric && finalMetric.textContent.trim() !== '—') statusBadge.textContent = 'CALCULADO';
      else statusBadge.textContent = 'PRONTO';
    }

    if (statusTitle) {
      if (/Enhanced/i.test(statusTitle.textContent)) statusTitle.textContent = 'Enhanced';
      else if (/Offshore/i.test(statusTitle.textContent)) statusTitle.textContent = 'Offshore';
      else statusTitle.textContent = 'Dropdown';
    }

    if (statusText) {
      const ft = finalMetric?.textContent?.trim();
      const m = finalMetricM?.textContent?.trim();
      if (ft && ft !== '—') statusText.textContent = m && m !== '—' ? `${ft} / ${m}` : ft;
    }

    if (statusDetail) statusDetail.textContent = 'Headwind vazio = 0 kt.';
  }

  function wireCalculationConversion() {
    if (!runBtn || runBtn.dataset.finalUiWired === '1') return;
    runBtn.dataset.finalUiWired = '1';

    runBtn.addEventListener('click', () => {
      prepareWeightForEngine();
      setTimeout(polishResultText, 80);
      setTimeout(polishResultText, 260);
    }, true);
  }

  function wireReset() {
    resetBtn?.addEventListener('click', () => {
      setTimeout(() => {
        restoreDisplayedWeight();
        polishStaticText();
        setWeightPlaceholder();
      }, 80);
    });
  }

  installUnitSelector();
  polishStaticText();
  wireCalculationConversion();
  wireReset();

  setTimeout(polishStaticText, 100);
  setTimeout(polishStaticText, 500);
})();
