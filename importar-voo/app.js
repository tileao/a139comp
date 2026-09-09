'use strict';

(function () {
  // Precisa bater com o data-importar-build do <body> em index.html e com o
  // BUILD em sw.js. Se o HTML carregado for de uma geração diferente deste
  // app.js (skew de cache), a guarda abaixo se recupera sozinha em vez de
  // deixar o app estourar erros crípticos com elementos que não existem.
  var IMPORTAR_BUILD = '10';
  var SKEW_RELOAD_FLAG = 'aw139_importar_skew_reload';

  function recoverFromVersionSkew() {
    var htmlBuild = (document.body && document.body.dataset) ? document.body.dataset.importarBuild : null;
    if (htmlBuild === IMPORTAR_BUILD) {
      // Em sincronia: limpa o flag para que um skew futuro tenha nova chance
      // de auto-recarregar.
      try { sessionStorage.removeItem(SKEW_RELOAD_FLAG); } catch (e) { /* noop */ }
      return false;
    }

    var alreadyReloaded = false;
    try { alreadyReloaded = sessionStorage.getItem(SKEW_RELOAD_FLAG) === '1'; } catch (e) { /* noop */ }

    if (!alreadyReloaded) {
      // Primeira detecção: força o SW a checar atualização e recarrega uma
      // única vez (o flag evita loop). Com o cache imutável do sw.js, o
      // reload deve trazer HTML e JS da mesma geração.
      try { sessionStorage.setItem(SKEW_RELOAD_FLAG, '1'); } catch (e) { /* noop */ }
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg && reg.update) { try { reg.update(); } catch (e) { /* noop */ } }
        }).catch(function () { /* noop */ }).then(function () { location.reload(); });
      } else {
        location.reload();
      }
      return true;
    }

    // Já recarregou uma vez e ainda está inconsistente: não fica em loop —
    // mostra um aviso pedindo para fechar/reabrir (ou reinstalar) o app.
    var banner = document.createElement('div');
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top));z-index:99999;background:rgba(224,97,90,.16);border:1px solid rgba(224,97,90,.5);color:#e5eef8;border-radius:12px;padding:12px 14px;font:600 13px/1.5 Inter,system-ui,sans-serif;box-shadow:0 18px 40px rgba(0,0,0,.35)';
    banner.textContent = 'Detectamos uma versão desatualizada em cache. Feche o app completamente e reabra (ou remova e readicione o ícone da tela de início) para carregar a versão correta.';
    if (document.body) document.body.appendChild(banner);
    return true;
  }

  if (recoverFromVersionSkew()) return;

  var SHARED_KEY = 'aw139_companion_shared_context_v1';
  var FP_KEY = 'aw139_flight_preview_v1';

  var state = { data: null, debug: {}, meta: null, inputs: [] };

  var errorPanel = document.getElementById('errorPanel');
  var errorMessage = document.getElementById('errorMessage');
  var errorRetryBtn = document.getElementById('errorRetryBtn');
  var reviewRoot = document.getElementById('reviewRoot');
  var warningsList = document.getElementById('warningsList');
  var parseStatusChip = document.getElementById('parseStatusChip');
  var confirmBtn = document.getElementById('confirmBtn');
  var discardBtn = document.getElementById('discardBtn');
  var confirmStatus = document.getElementById('confirmStatus');

  var fieldTemplate = document.getElementById('fieldTemplate');
  var routeRowTemplate = document.getElementById('routeRowTemplate');
  var stopCardTemplate = document.getElementById('stopCardTemplate');
  var helideckCardTemplate = document.getElementById('helideckCardTemplate');
  var wxCardTemplate = document.getElementById('wxCardTemplate');

  var copilotPromptBox = document.getElementById('copilotPromptBox');
  var copyPromptBtn = document.getElementById('copyPromptBtn');
  var textImportArea = document.getElementById('textImportArea');
  var processTextBtn = document.getElementById('processTextBtn');
  var textImportStatus = document.getElementById('textImportStatus');

  // Mantido em sincronia com COPILOT_PROMPT.md (a documentação tem o mesmo
  // texto com mais contexto ao redor).
  var COPILOT_PROMPT = [
    'Você vai ler um Flight Preview de helicóptero offshore (formulário F-OPR 184)',
    'em PDF e devolver os dados em um formato de texto específico, EXATAMENTE como',
    'especificado abaixo. Responda com TODO o conteúdo dentro de UM ÚNICO bloco de',
    'código (envolto em ``` no início e no fim), e nada fora do bloco — sem',
    'comentário, explicação, negrito, itálico ou tabela. Isso preserva a',
    'formatação exata (o app remove as cercas ``` automaticamente na importação).',
    '',
    'Regras gerais:',
    '- Se um campo não estiver legível ou não existir no documento, deixe o valor',
    '  em branco (depois dos dois-pontos, ou a célula vazia no CSV). NUNCA invente',
    '  ou estime um valor que não está no documento.',
    '- Números: use ponto decimal (ex.: 17.2), sem separador de milhar.',
    '- Datas/horas: mantenha o formato original do documento.',
    '- Coordenadas: copie EXATAMENTE como aparecem no documento, sem converter',
    '  nem arredondar (ex.: 2526.87S, 25°26.87\'S, 25°26\'52"S). NÃO transforme em',
    '  grau decimal — o aplicativo faz a conversão.',
    '- Nos blocos CSV, NÃO use vírgulas dentro de um campo de texto livre (troque',
    '  por ponto e vírgula se precisar).',
    '',
    'Formato de saída (preencha com os dados reais do PDF anexado):',
    '',
    'AW139-FLIGHT-PREVIEW-TEXT-V1',
    '',
    '### HEADER',
    'flightId: <Flight N°/ID>',
    'dateRaw: <Date, formato dd/mm/aaaa hh:mm>',
    'minimalReserveMin: <Minimal Reserve, só o número em minutos>',
    'plKg: <PL, só o número em kg>',
    'crew.p1.name: <nome do 1P>',
    'crew.p1.weightKg: <peso do 1P em kg>',
    'crew.p1.code: <código numérico ao lado do peso do 1P>',
    'crew.p1.side: <RH ou LH do 1P>',
    'crew.p2.name: <nome do 2P>',
    'crew.p2.weightKg: <peso do 2P em kg>',
    'crew.p2.code: <código numérico ao lado do peso do 2P>',
    'crew.p2.side: <RH ou LH do 2P>',
    'crew.fa.name: <nome do FA, ou vazio se [EMPTY]>',
    'crew.fa.weightKg: <peso do FA em kg>',
    'crew.fa.code: <código do FA, se houver>',
    'crew.fa.side: <RH ou LH do FA, se houver>',
    'aircraft.registration: <matrícula>',
    'aircraft.model: <ex.: AW139 7T>',
    'aircraft.cruiseKt: <Cruise, só o número>',
    'aircraft.fuelFlowGndKgH: <FuelFlow(Gnd), só o número>',
    'aircraft.fuelFlowFlightKgH: <FuelFlow(Flight), só o número>',
    'aircraft.maxFuelKg: <MaxFuel, só o número>',
    'aircraft.eewKg: <EEW, só o número>',
    'aircraft.cg: <CG, só o número>',
    'aircraft.oewKg: <OEW, só o número>',
    'aircraft.minReqFuelKg: <MinReqFuel, só o número>',
    'totals.rideNm: <Totals => Ride=, só o número em Nm>',
    'totals.totalTimeHms: <Totals => Total Time=, formato hh:mm>',
    'defaults.paxStdKg: <DEFAULTS Pax:, só o número em kg>',
    'defaults.bagStdKg: <DEFAULTS Bag:, só o número em kg>',
    '',
    '### LEGS',
    'idx,from,to,mcDeg,distNm,ftMin,ttMin,windDirDeg,windKt,fuelRemKg,paxIn,paxOut,mtowKg',
    '<uma linha por perna numerada da rota, nessa ordem exata de colunas:',
    'idx = número da perna',
    'from = nome do ponto de origem da perna',
    'to = nome do ponto de destino da perna',
    'mcDeg = rumo magnético (MC), só o número',
    'distNm = distância em Nm, só o número',
    'ftMin = tempo de voo (FT) convertido para minutos decimais (ex.: 00:09:21 vira 9.35)',
    'ttMin = tempo total (TT) convertido para minutos decimais',
    'windDirDeg = direção do vento da perna em graus, se houver (em branco se não houver)',
    'windKt = intensidade do vento da perna em nós, se houver',
    'fuelRemKg = combustível remanescente (kg) na chegada ao ponto de destino',
    'paxIn = pax de chegada no ponto de destino (só se for parada/aeródromo/helideque; em branco senão)',
    'paxOut = pax de saída no ponto de destino (idem)',
    'mtowKg = MTOW aplicável no ponto de destino (idem)>',
    '',
    '### STOPS',
    'name,icao,freq,fuelArrKg,fuelDepKg,paxArr,paxDep,mtowKg,gndTimeMin',
    '<uma linha para cada PARADA da rota (aeródromos e helideques, NÃO inclua',
    'fixos/waypoints de sobrevoo sem parada), nessa ordem:',
    'name = nome do aeródromo ou helideque',
    'icao = código ICAO (aeródromos, ex. SBMI) ou código de 4 caracteres (helideques, ex. 9PWG)',
    'freq = frequência (aeródromos; em branco para helideques se não houver)',
    'fuelArrKg = combustível na chegada (kg)',
    'fuelDepKg = combustível na saída (kg)',
    'paxArr = pax na chegada',
    'paxDep = pax na saída',
    'mtowKg = MTOW aplicável',
    'gndTimeMin = tempo de solo em minutos>',
    '',
    '### HELIDECKS',
    'icao,nome,elevFt,dValueM,maxT,classe,lat,lon,freq',
    '<uma linha por helideque citado na rota, nessa ordem:',
    'icao = código de 4 caracteres',
    'nome = nome do helideque/unidade marítima',
    'elevFt = elevação em pés',
    'dValueM = valor-D em metros',
    'maxT = capacidade em toneladas',
    'classe = classe do helideque (1, 2 ou 3)',
    'lat = latitude como está no documento',
    'lon = longitude como está no documento',
    'freq = frequência, se houver>',
    '',
    '### METARS',
    'icao,sr,ss,windDirDeg,windKt,raw,taf',
    '<uma linha por aeródromo com METAR/TAF no documento, nessa ordem:',
    'icao = código ICAO do aeródromo',
    'sr = horário do nascer do sol (SR-hh:mm, só o hh:mm)',
    'ss = horário do pôr do sol (SS-hh:mm, só o hh:mm)',
    'windDirDeg = direção do vento extraída do METAR (formato dddffKT), em graus',
    'windKt = intensidade do vento extraída do METAR, em nós',
    'raw = o texto do METAR completo (sem vírgulas — troque por ponto e vírgula)',
    'taf = o texto do TAF completo (sem vírgulas — troque por ponto e vírgula)>',
  ].join('\n');

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

  function showError(msg) {
    errorMessage.textContent = msg;
    errorPanel.hidden = false;
    reviewRoot.hidden = true;
  }

  errorRetryBtn.addEventListener('click', function () {
    errorPanel.hidden = true;
    if (textImportArea) { textImportArea.value = ''; textImportArea.focus(); }
    setTextImportStatus('', '');
  });

  // ---------------------------------------------------------------------
  // Renderização da tela de conferência
  // ---------------------------------------------------------------------
  function debugTitle(path) {
    var dbg = state.debug[path];
    if (!dbg) return 'Não encontrado — preencha manualmente.';
    if (dbg.source === 'text') return 'Importado do texto' + (dbg.raw ? (': "' + dbg.raw + '"') : '');
    if (dbg.page != null) return 'Origem: página ' + dbg.page + ', posição (' + Math.round(dbg.x) + ', ' + Math.round(dbg.y) + ')';
    return 'Importado';
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
      // Carimbo exclusivo da importação: os outros módulos usam isto para
      // detectar um voo importado NOVO e se autopreencher uma única vez
      // (updatedAt muda a cada gravação de qualquer módulo, então não serve).
      fpImportedAt: new Date().toISOString(),
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

  function setConfirmStatus(text, kind) {
    // Defensivo: se o HTML carregado for de uma versão diferente do app.js
    // (skew de cache do service worker — ex.: index.html antigo + app.js
    // novo, ou vice-versa), este elemento pode não existir ainda. Melhor
    // degradar em silêncio aqui do que travar o fluxo inteiro por causa de
    // uma linha de status.
    if (!confirmStatus) return;
    confirmStatus.textContent = text || '';
    confirmStatus.className = 'upload-status' + (kind === 'busy' ? ' is-busy' : kind === 'error' ? ' is-error' : '');
  }

  confirmBtn.addEventListener('click', function () {
    if (!state.data) return;
    // Feedback logo abaixo do próprio botão — o status no topo da tela
    // (chip da conferência, status do upload) fica fora da vista quando o
    // piloto já rolou até o fim para clicar aqui, dando a impressão de que
    // nada aconteceu.
    setConfirmStatus('Gravando…', 'busy');
    try {
      var edited = collectEdited();
      var ok = persistSharedContext(edited);
      parseStatusChip.dataset.state = ok ? 'saved' : 'error';
      parseStatusChip.textContent = ok ? 'Gravado no contexto compartilhado' : 'Falha ao gravar (armazenamento local indisponível)';
      setConfirmStatus(ok ? 'Voo gravado. Os demais módulos já podem ler estes dados.' : 'Não foi possível gravar — verifique o armazenamento do navegador.', ok ? 'ok' : 'error');
    } catch (err) {
      console.error('[importar-voo] falha ao confirmar e gravar', err);
      setConfirmStatus('Não foi possível gravar. Detalhe técnico: ' + (err && err.message ? err.message : err), 'error');
    }
  });

  discardBtn.addEventListener('click', function () {
    state.data = null;
    state.debug = {};
    state.meta = null;
    state.inputs = [];
    reviewRoot.hidden = true;
    errorPanel.hidden = true;
    textImportArea.value = '';
    setTextImportStatus('', '');
    setConfirmStatus('', '');
  });

  // ---------------------------------------------------------------------
  // Importar texto gerado por IA (Copilot etc.) — leitura do Flight Preview
  // feita fora do app, sem depender de nenhuma biblioteca no dispositivo.
  // ---------------------------------------------------------------------
  copilotPromptBox.textContent = COPILOT_PROMPT;

  function setTextImportStatus(text, kind) {
    if (!textImportStatus) return;
    textImportStatus.textContent = text || '';
    textImportStatus.className = 'upload-status' + (kind === 'busy' ? ' is-busy' : kind === 'error' ? ' is-error' : '');
  }

  copyPromptBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(COPILOT_PROMPT);
      copyPromptBtn.textContent = 'Copiado!';
    } catch (err) {
      copyPromptBtn.textContent = 'Não foi possível copiar — selecione o texto manualmente';
    }
    window.setTimeout(function () { copyPromptBtn.textContent = 'Copiar prompt'; }, 2200);
  });

  function applyParseResult(result, statusSetter, sourceLabel) {
    // Sempre limpa o status de "Confirmar e gravar" de uma importação
    // anterior: sem isso, reimportar outro voo sem clicar em "Descartar"
    // deixava a mensagem de sucesso antiga visível embaixo do formulário
    // novo, dando a falsa impressão de que o voo atual já tinha sido salvo.
    setConfirmStatus('', '');
    if (!result.meta.valid) {
      showError((result.meta.warnings && result.meta.warnings.join(' ')) || 'Não foi possível interpretar ' + sourceLabel + '.');
      statusSetter('', '');
      return false;
    }
    // A renderização é a parte mais arriscada deste caminho: dados reais
    // (de PDF ou de IA) podem ter uma forma que nenhum dos exemplos usados
    // em teste cobriu. Sem isso, uma exceção aqui deixava o botão de
    // processar/importar parecendo não fazer nada — nem erro, nem
    // resultado, só silêncio.
    try {
      errorPanel.hidden = true;
      state.data = result.data;
      state.debug = result.debug || {};
      state.meta = result.meta;
      state.inputs = [];
      renderReview();
      return true;
    } catch (err) {
      console.error('[importar-voo] falha ao renderizar a conferência', err);
      showError('Os dados foram interpretados, mas não foi possível montar a tela de conferência. Detalhe técnico: ' + (err && err.message ? err.message : err));
      statusSetter('', '');
      return false;
    }
  }

  processTextBtn.addEventListener('click', function () {
    var raw = textImportArea.value;
    if (!raw || !raw.trim()) {
      setTextImportStatus('Cole o texto gerado pelo Copilot antes de processar.', 'error');
      return;
    }
    reviewRoot.hidden = true;
    try {
      var result = window.AW139ImportarVooTextParser.parseFlightPreviewText(raw);
      var ok = applyParseResult(result, setTextImportStatus, 'este texto');
      if (ok) setTextImportStatus('Texto processado. Revise os dados abaixo antes de gravar.', 'ok');
    } catch (err) {
      console.error('[importar-voo] falha ao processar o texto', err);
      showError('Não foi possível processar este texto. Detalhe técnico: ' + (err && err.message ? err.message : err));
      setTextImportStatus('', '');
    }
  });

  function showBuildTag() {
    var tag = document.getElementById('buildTag');
    if (tag) tag.textContent = 'v' + IMPORTAR_BUILD;
  }

  applyQueryParams();
  showBuildTag();
})();
