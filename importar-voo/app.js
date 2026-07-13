'use strict';

(function () {
  var SHARED_KEY = 'aw139_companion_shared_context_v1';
  var FP_KEY = 'aw139_flight_preview_v1';

  var state = { data: null, debug: {}, meta: null, inputs: [] };

  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  var uploadStatus = document.getElementById('uploadStatus');
  var errorPanel = document.getElementById('errorPanel');
  var errorMessage = document.getElementById('errorMessage');
  var errorRetryBtn = document.getElementById('errorRetryBtn');
  var reviewRoot = document.getElementById('reviewRoot');
  var warningsList = document.getElementById('warningsList');
  var parseStatusChip = document.getElementById('parseStatusChip');
  var confirmBtn = document.getElementById('confirmBtn');
  var discardBtn = document.getElementById('discardBtn');

  var fieldTemplate = document.getElementById('fieldTemplate');
  var routeRowTemplate = document.getElementById('routeRowTemplate');
  var stopCardTemplate = document.getElementById('stopCardTemplate');
  var helideckCardTemplate = document.getElementById('helideckCardTemplate');
  var wxCardTemplate = document.getElementById('wxCardTemplate');

  // ---------------------------------------------------------------------
  // Query params: ?embed=1  ?back=1&return=<url>
  // ---------------------------------------------------------------------
  function applyQueryParams() {
    var params = new URLSearchParams(location.search);
    if (params.get('embed') === '1') {
      var topbar = document.getElementById('topbar');
      if (topbar) topbar.hidden = true;
    }
    if (params.get('back') === '1') {
      var backBtn = document.getElementById('backBtn');
      var returnUrl = params.get('return');
      backBtn.hidden = false;
      document.body.classList.add('has-back-btn');
      backBtn.addEventListener('click', function () {
        if (returnUrl) location.href = returnUrl;
        else history.back();
      });
    }
  }

  // ---------------------------------------------------------------------
  // Utilidades de caminho (path) para ler/gravar campos aninhados
  // (ex.: "crew.p1.name", "fpRoute[2].mcDeg", "waypoints[5].fuelArrKg").
  // ---------------------------------------------------------------------
  function pathTokens(path) {
    return path.split(/\.|\[|\]/).filter(function (t) { return t !== ''; }).map(function (t) {
      return /^\d+$/.test(t) ? Number(t) : t;
    });
  }
  function getPath(obj, path) {
    var tokens = pathTokens(path);
    var cur = obj;
    for (var i = 0; i < tokens.length; i++) {
      if (cur == null) return null;
      cur = cur[tokens[i]];
    }
    return cur === undefined ? null : cur;
  }
  function setPath(obj, path, value) {
    var tokens = pathTokens(path);
    var cur = obj;
    for (var i = 0; i < tokens.length - 1; i++) {
      if (cur[tokens[i]] == null) cur[tokens[i]] = (typeof tokens[i + 1] === 'number') ? [] : {};
      cur = cur[tokens[i]];
    }
    cur[tokens[tokens.length - 1]] = value;
  }
  function coerceValue(raw, type) {
    if (type === 'number') {
      var s = raw == null ? '' : String(raw).trim();
      if (!s) return null;
      var n = Number(s.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    }
    var str = raw == null ? '' : String(raw).trim();
    return str === '' ? null : str;
  }

  // ---------------------------------------------------------------------
  // pdf.js (vendorizado, sem CDN) — carregado sob demanda via import()
  // dinâmico, que funciona mesmo fora de um <script type="module">.
  // ---------------------------------------------------------------------
  var pdfjsLibPromise = null;
  function loadPdfJs() {
    if (!pdfjsLibPromise) {
      pdfjsLibPromise = import('./vendor/pdf.min.mjs').then(function (mod) {
        mod.GlobalWorkerOptions.workerSrc = './vendor/pdf.worker.min.mjs';
        return mod;
      });
    }
    return pdfjsLibPromise;
  }

  async function extractPages(arrayBuffer) {
    var pdfjsLib = await loadPdfJs();
    var doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    var pages = [];
    for (var p = 1; p <= doc.numPages; p++) {
      var page = await doc.getPage(p);
      var content = await page.getTextContent();
      var items = [];
      for (var i = 0; i < content.items.length; i++) {
        var it = content.items[i];
        if (!it.str || !it.str.trim()) continue;
        var tr = it.transform;
        items.push({ str: it.str, x: tr[4], y: tr[5], w: it.width, h: it.height, fontName: it.fontName });
      }
      pages.push({ pageNumber: p, items: items });
    }
    return pages;
  }

  // ---------------------------------------------------------------------
  // Upload: seleção de arquivo + arrastar-soltar
  // ---------------------------------------------------------------------
  function setUploadStatus(text, kind) {
    uploadStatus.textContent = text || '';
    uploadStatus.className = 'upload-status' + (kind === 'busy' ? ' is-busy' : kind === 'error' ? ' is-error' : '');
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorPanel.hidden = false;
    reviewRoot.hidden = true;
  }

  async function handleFile(file) {
    if (!file) return;
    var name = (file.name || '').toLowerCase();
    var looksPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    errorPanel.hidden = true;
    if (!looksPdf) {
      showError('Selecione um arquivo PDF (Flight Preview).');
      return;
    }
    setUploadStatus('Lendo PDF localmente (nada é enviado pela rede)…', 'busy');
    reviewRoot.hidden = true;
    try {
      var buffer = await file.arrayBuffer();
      var pages = await extractPages(buffer);
      var result = window.AW139ImportarVooParser.parseFlightPreview(pages);
      if (!result.meta.valid) {
        showError((result.meta.warnings && result.meta.warnings.join(' ')) || 'Não foi possível interpretar este PDF como um Flight Preview.');
        setUploadStatus('', '');
        return;
      }
      state.data = result.data;
      state.debug = result.debug || {};
      state.meta = result.meta;
      state.inputs = [];
      renderReview();
      setUploadStatus('PDF "' + file.name + '" lido — ' + pages.length + ' página(s). Revise os dados abaixo antes de gravar.', 'ok');
    } catch (err) {
      console.error('[importar-voo] falha ao ler o Flight Preview', err);
      showError('Não foi possível ler este PDF. Verifique se o arquivo não está corrompido e tente novamente.');
      setUploadStatus('', '');
    }
  }

  fileInput.addEventListener('change', function () {
    handleFile(fileInput.files && fileInput.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropZone.classList.add('drop-zone-active');
    });
  });
  ['dragleave', 'dragend'].forEach(function (evt) {
    dropZone.addEventListener(evt, function () { dropZone.classList.remove('drop-zone-active'); });
  });
  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('drop-zone-active');
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  errorRetryBtn.addEventListener('click', function () {
    errorPanel.hidden = true;
    fileInput.value = '';
    fileInput.click();
  });

  // ---------------------------------------------------------------------
  // Renderização da tela de conferência
  // ---------------------------------------------------------------------
  function debugTitle(path) {
    var dbg = state.debug[path];
    return dbg ? ('Origem: página ' + dbg.page + ', posição (' + Math.round(dbg.x) + ', ' + Math.round(dbg.y) + ')') : 'Não encontrado no PDF — preencha manualmente.';
  }

  function addField(container, path, label, type, placeholder) {
    var frag = fieldTemplate.content.cloneNode(true);
    var fieldEl = frag.querySelector('.field');
    var labelEl = frag.querySelector('span');
    var input = frag.querySelector('input');
    labelEl.textContent = label;
    if (placeholder) input.placeholder = placeholder;
    bindInput(input, path, type);
    if (input.classList.contains('field-missing')) fieldEl.classList.add('field-missing');
    container.appendChild(frag);
    return input;
  }

  function bindInput(input, path, type) {
    var value = getPath(state.data, path);
    var missing = value === null || value === undefined || value === '';
    input.value = missing ? '' : String(value);
    input.dataset.path = path;
    input.dataset.type = type || 'string';
    input.classList.toggle('field-missing', missing);
    input.title = debugTitle(path);
    state.inputs.push(input);
    return input;
  }

  function clearContainer(el) { el.innerHTML = ''; }

  function renderWarnings() {
    clearContainer(warningsList);
    var warnings = (state.meta && state.meta.warnings) || [];
    if (!warnings.length) {
      parseStatusChip.textContent = 'PDF interpretado sem alertas';
      parseStatusChip.dataset.state = 'ok';
      return;
    }
    parseStatusChip.textContent = warnings.length + ' alerta(s) do parser';
    parseStatusChip.dataset.state = 'warn';
    warnings.forEach(function (w) {
      var div = document.createElement('div');
      div.className = 'alert-item warn';
      div.textContent = w;
      warningsList.appendChild(div);
    });
  }

  function renderFlightFields() {
    var grid = document.getElementById('flightFieldsGrid');
    clearContainer(grid);
    addField(grid, 'flightId', 'Flight N°/ID', 'string');
    addField(grid, 'dateRaw', 'Data/hora (dd/mm/aaaa hh:mm)', 'string');
    addField(grid, 'minimalReserveMin', 'Reserva mínima (min)', 'number');
    addField(grid, 'plKg', 'PL — carga paga (kg)', 'number');

    var crewGrid = document.getElementById('crewFieldsGrid');
    clearContainer(crewGrid);
    [['p1', '1P'], ['p2', '2P'], ['fa', 'FA']].forEach(function (pair) {
      var key = pair[0], label = pair[1];
      addField(crewGrid, 'crew.' + key + '.name', label + ' — Nome', 'string');
      addField(crewGrid, 'crew.' + key + '.weightKg', label + ' — Peso (kg)', 'number');
      addField(crewGrid, 'crew.' + key + '.code', label + ' — Código', 'string');
      addField(crewGrid, 'crew.' + key + '.side', label + ' — Lado (RH/LH)', 'string');
    });
  }

  function renderAircraftFields() {
    var grid = document.getElementById('aircraftFieldsGrid');
    clearContainer(grid);
    addField(grid, 'aircraft.registration', 'Matrícula', 'string');
    addField(grid, 'aircraft.model', 'Modelo', 'string');
    addField(grid, 'aircraft.cruiseKt', 'Cruzeiro (kt)', 'number');
    addField(grid, 'aircraft.fuelFlowGndKgH', 'FuelFlow solo (kg/h)', 'number');
    addField(grid, 'aircraft.fuelFlowFlightKgH', 'FuelFlow voo (kg/h)', 'number');
    addField(grid, 'aircraft.maxFuelKg', 'Combustível máx. (kg)', 'number');
    addField(grid, 'aircraft.eewKg', 'EEW (kg)', 'number');
    addField(grid, 'aircraft.cg', 'CG', 'number');
    addField(grid, 'aircraft.oewKg', 'OEW (kg)', 'number');
    addField(grid, 'aircraft.minReqFuelKg', 'Comb. mín. requerido (kg)', 'number');
  }

  function renderTotalsFields() {
    var grid = document.getElementById('totalsFieldsGrid');
    clearContainer(grid);
    addField(grid, 'totals.rideNm', 'Distância total (Nm)', 'number');
    addField(grid, 'totals.totalTimeHms', 'Tempo total (hh:mm)', 'string');
    addField(grid, 'defaults.paxStdKg', 'Peso padrão pax (kg)', 'number');
    addField(grid, 'defaults.bagStdKg', 'Peso padrão bag (kg)', 'number');
  }

  function renderRouteTable() {
    var tbody = document.getElementById('routeTableBody');
    clearContainer(tbody);
    var legs = state.data.fpRoute || [];
    legs.forEach(function (leg, i) {
      var frag = routeRowTemplate.content.cloneNode(true);
      frag.querySelector('.leg-idx-cell').textContent = leg.idx != null ? leg.idx : (i + 1);
      bindInput(frag.querySelector('.from-input'), 'fpRoute[' + i + '].from', 'string');
      bindInput(frag.querySelector('.to-input'), 'fpRoute[' + i + '].to', 'string');
      bindInput(frag.querySelector('.mc-input'), 'fpRoute[' + i + '].mcDeg', 'number');
      bindInput(frag.querySelector('.dist-input'), 'fpRoute[' + i + '].distNm', 'number');
      bindInput(frag.querySelector('.ft-input'), 'fpRoute[' + i + '].ftMin', 'number');
      bindInput(frag.querySelector('.tt-input'), 'fpRoute[' + i + '].ttMin', 'number');
      bindInput(frag.querySelector('.wind-dir-input'), 'fpRoute[' + i + '].windDirDeg', 'number');
      bindInput(frag.querySelector('.wind-kt-input'), 'fpRoute[' + i + '].windKt', 'number');
      bindInput(frag.querySelector('.fuel-input'), 'fpRoute[' + i + '].fuelRemKg', 'number');
      bindInput(frag.querySelector('.pax-in-input'), 'fpRoute[' + i + '].paxIn', 'number');
      bindInput(frag.querySelector('.pax-out-input'), 'fpRoute[' + i + '].paxOut', 'number');
      bindInput(frag.querySelector('.mtow-input'), 'fpRoute[' + i + '].mtowKg', 'number');
      tbody.appendChild(frag);
    });
  }

  function renderStops() {
    var container = document.getElementById('stopsContainer');
    clearContainer(container);
    var waypoints = state.data.waypoints || [];
    var stops = waypoints.filter(function (w) { return w.kind !== 'fixo'; });
    stops.forEach(function (wp) {
      var frag = stopCardTemplate.content.cloneNode(true);
      frag.querySelector('.review-card-title').textContent = wp.name || ('Ponto ' + (wp.seq + 1));
      frag.querySelector('.review-card-tag').textContent = wp.kind === 'aerodromo' ? 'Aeródromo' : 'Helideque';
      var grid = frag.querySelector('.stop-fields-grid');
      var base = 'waypoints[' + wp.seq + '].';
      addField(grid, base + 'name', 'Nome', 'string');
      addField(grid, base + 'icao', 'ICAO/código', 'string');
      addField(grid, base + 'freq', 'Frequência', 'string');
      addField(grid, base + 'fuelArrKg', 'Combustível chegada (kg)', 'number');
      addField(grid, base + 'fuelDepKg', 'Combustível saída (kg)', 'number');
      addField(grid, base + 'autonomyArr', 'Autonomia chegada (hh:mm)', 'string');
      addField(grid, base + 'autonomyDep', 'Autonomia saída (hh:mm)', 'string');
      addField(grid, base + 'paxArr', 'Pax chegada', 'number');
      addField(grid, base + 'paxDep', 'Pax saída', 'number');
      addField(grid, base + 'loadArrKg', 'Carga chegada (kg)', 'number');
      addField(grid, base + 'loadDepKg', 'Carga saída (kg)', 'number');
      addField(grid, base + 'ulArrKg', 'UL chegada (kg)', 'number');
      addField(grid, base + 'ulDepKg', 'UL saída (kg)', 'number');
      addField(grid, base + 'wtArrKg', 'WT chegada (kg)', 'number');
      addField(grid, base + 'wtDepKg', 'WT saída (kg)', 'number');
      addField(grid, base + 'freeArrKg', 'Free chegada (kg)', 'number');
      addField(grid, base + 'freeDepKg', 'Free saída (kg)', 'number');
      addField(grid, base + 'mtowKg', 'MTOW aplicável (kg)', 'number');
      addField(grid, base + 'gndTimeMin', 'Tempo de solo (min)', 'number');
      container.appendChild(frag);
    });
  }

  function renderHelidecks() {
    var container = document.getElementById('helidecksContainer');
    var hint = document.getElementById('noHelidecksHint');
    clearContainer(container);
    var decks = state.data.fpHelidecks || [];
    hint.hidden = decks.length > 0;
    decks.forEach(function (deck, i) {
      var frag = helideckCardTemplate.content.cloneNode(true);
      frag.querySelector('.review-card-title').textContent = deck.nome || deck.icao || ('Helideque ' + (i + 1));
      var grid = frag.querySelector('.helideck-fields-grid');
      var base = 'fpHelidecks[' + i + '].';
      addField(grid, base + 'icao', 'Código', 'string');
      addField(grid, base + 'nome', 'Nome', 'string');
      addField(grid, base + 'elevFt', 'Elevação (ft)', 'number');
      addField(grid, base + 'dValueM', 'Valor-D (m)', 'number');
      addField(grid, base + 'maxT', 'Capacidade (T)', 'number');
      addField(grid, base + 'classe', 'Classe', 'number');
      addField(grid, base + 'lat', 'Latitude', 'number');
      addField(grid, base + 'lon', 'Longitude', 'number');
      addField(grid, base + 'freq', 'Frequência', 'string');
      container.appendChild(frag);
    });
  }

  function renderWx() {
    var container = document.getElementById('wxContainer');
    var hint = document.getElementById('noWxHint');
    clearContainer(container);
    var metars = state.data.metars || [];
    hint.hidden = metars.length > 0;
    metars.forEach(function (m, i) {
      var frag = wxCardTemplate.content.cloneNode(true);
      frag.querySelector('.review-card-title').textContent = m.icao || ('METAR ' + (i + 1));
      var grid = frag.querySelector('.wx-fields-grid');
      var base = 'metars[' + i + '].';
      addField(grid, base + 'icao', 'ICAO', 'string');
      addField(grid, base + 'sr', 'Nascer do sol (SR)', 'string');
      addField(grid, base + 'ss', 'Pôr do sol (SS)', 'string');
      addField(grid, base + 'windDirDeg', 'Vento (°)', 'number');
      addField(grid, base + 'windKt', 'Vento (kt)', 'number');
      addField(grid, base + 'raw', 'METAR', 'string');
      addField(grid, base + 'taf', 'TAF', 'string');
      container.appendChild(frag);
    });
  }

  function renderReview() {
    state.inputs = [];
    renderWarnings();
    renderFlightFields();
    renderAircraftFields();
    renderRouteTable();
    renderStops();
    renderHelidecks();
    renderWx();
    renderTotalsFields();
    reviewRoot.hidden = false;
  }

  // ---------------------------------------------------------------------
  // Confirmar e gravar / Descartar
  // ---------------------------------------------------------------------
  function collectEdited() {
    var edited = JSON.parse(JSON.stringify(state.data));
    state.inputs.forEach(function (input) {
      var path = input.dataset.path;
      if (!path) return;
      setPath(edited, path, coerceValue(input.value, input.dataset.type));
    });
    return edited;
  }

  function persistSharedContext(edited) {
    var patch = {
      fpFlightId: edited.flightId,
      fpDate: edited.dateISO || edited.dateRaw,
      fpAircraft: edited.aircraft ? edited.aircraft.registration : null,
      fpOewKg: edited.aircraft ? edited.aircraft.oewKg : null,
      fpMaxFuelKg: edited.aircraft ? edited.aircraft.maxFuelKg : null,
      fpFuelFlowFlightKgH: edited.aircraft ? edited.aircraft.fuelFlowFlightKgH : null,
      fpFuelFlowGndKgH: edited.aircraft ? edited.aircraft.fuelFlowGndKgH : null,
      fpCruiseKt: edited.aircraft ? edited.aircraft.cruiseKt : null,
      fpMinReserveMin: edited.minimalReserveMin,
      fpPaxStdKg: edited.defaults ? edited.defaults.paxStdKg : null,
      fpBagStdKg: edited.defaults ? edited.defaults.bagStdKg : null,
      fpRoute: edited.fpRoute || [],
      fpHelidecks: edited.fpHelidecks || [],
      updatedAt: new Date().toISOString(),
      lastModule: 'importar',
    };

    var firstDeck = (edited.fpHelidecks || [])[0];
    if (firstDeck && firstDeck.icao) patch.circuitoUmIcao = firstDeck.icao;

    var departure = (edited.waypoints || [])[0];
    var oew = edited.aircraft ? edited.aircraft.oewKg : null;
    var depFuel = departure ? (departure.fuelDepKg != null ? departure.fuelDepKg : departure.fuelArrKg) : null;
    if (oew != null && depFuel != null) {
      patch.weightKg = oew + (edited.plKg || 0) + depFuel;
    }

    try {
      var existingRaw = localStorage.getItem(SHARED_KEY);
      var existing = existingRaw ? JSON.parse(existingRaw) : {};
      var updated = Object.assign({}, existing, patch);
      localStorage.setItem(SHARED_KEY, JSON.stringify(updated));
      localStorage.setItem(FP_KEY, JSON.stringify(edited));
      return true;
    } catch (e) {
      console.error('[importar-voo] falha ao gravar no contexto compartilhado', e);
      return false;
    }
  }

  confirmBtn.addEventListener('click', function () {
    if (!state.data) return;
    var edited = collectEdited();
    var ok = persistSharedContext(edited);
    parseStatusChip.dataset.state = ok ? 'saved' : 'error';
    parseStatusChip.textContent = ok ? 'Gravado no contexto compartilhado' : 'Falha ao gravar (armazenamento local indisponível)';
    setUploadStatus(ok ? 'Voo gravado. Os demais módulos já podem ler estes dados.' : 'Não foi possível gravar — verifique o armazenamento do navegador.', ok ? 'ok' : 'error');
  });

  discardBtn.addEventListener('click', function () {
    state.data = null;
    state.debug = {};
    state.meta = null;
    state.inputs = [];
    reviewRoot.hidden = true;
    errorPanel.hidden = true;
    fileInput.value = '';
    setUploadStatus('', '');
  });

  applyQueryParams();
})();
