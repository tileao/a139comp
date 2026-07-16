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
  var confirmStatus = document.getElementById('confirmStatus');

  var fieldTemplate = document.getElementById('fieldTemplate');
  var routeRowTemplate = document.getElementById('routeRowTemplate');
  var stopCardTemplate = document.getElementById('stopCardTemplate');
  var helideckCardTemplate = document.getElementById('helideckCardTemplate');
  var wxCardTemplate = document.getElementById('wxCardTemplate');

  var modeTabPdf = document.getElementById('modeTabPdf');
  var modeTabText = document.getElementById('modeTabText');
  var modePanelPdf = document.getElementById('modePanelPdf');
  var modePanelText = document.getElementById('modePanelText');
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
    'especificado abaixo. Não adicione nenhum comentário, explicação ou markdown',
    'extra antes ou depois — a resposta deve ser SOMENTE o texto no formato pedido,',
    'sem cercas de código (```).',
    '',
    'Regras gerais:',
    '- Se um campo não estiver legível ou não existir no documento, deixe o valor',
    '  em branco (depois dos dois-pontos, ou a célula vazia no CSV). NUNCA invente',
    '  ou estime um valor que não está no documento.',
    '- Números: use ponto decimal (ex.: 17.2), sem separador de milhar.',
    '- Datas/horas: mantenha o formato original do documento.',
    '- Coordenadas: converta de graus/minutos/segundos para decimal (ex.:',
    '  22°55\'05"S vira -22.918056).',
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
    'lat = latitude decimal',
    'lon = longitude decimal',
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

  // ---------------------------------------------------------------------
  // pdf.js (vendorizado, sem CDN) — carregado sob demanda via import()
  // dinâmico, que funciona mesmo fora de um <script type="module">.
  // ---------------------------------------------------------------------
  var pdfjsLibPromise = null;
  function loadPdfJs() {
    if (!pdfjsLibPromise) {
      // URL absoluta: em alguns contextos (ex.: arquivo aberto via file://
      // direto, sem servidor) o import() dinâmico não consegue resolver um
      // especificador relativo a partir de um script clássico. Com URL
      // absoluta pelo menos a resolução funciona — o fetch em si ainda falha
      // sob file://, tratado abaixo com uma mensagem específica.
      var vendorUrl = new URL('./vendor/pdf.min.mjs', document.baseURI).href;
      var workerUrl = new URL('./vendor/pdf.worker.min.mjs', document.baseURI).href;
      pdfjsLibPromise = import(vendorUrl).then(function (mod) {
        mod.GlobalWorkerOptions.workerSrc = workerUrl;
        return mod;
      }).catch(function (err) {
        pdfjsLibPromise = null; // permite tentar de novo (ex.: após servir por http)
        var wrapped = new Error('Falha ao carregar o pdf.js (' + vendorUrl + '): ' + err.message);
        wrapped.isLibraryLoadError = true;
        throw wrapped;
      });
    }
    return pdfjsLibPromise;
  }

  async function extractPages(arrayBuffer) {
    var pdfjsLib = await loadPdfJs();
    var doc;
    try {
      doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      var wrapped = new Error('O pdf.js não conseguiu abrir este PDF: ' + (err && err.message ? err.message : err));
      wrapped.isPdfOpenError = true;
      throw wrapped;
    }
    var pages = [];
    var pageErrors = [];
    for (var p = 1; p <= doc.numPages; p++) {
      // Isola cada página: uma falha interna do pdf.js processando UMA
      // página (fonte incomum, anotação, assinatura) não deve derrubar as
      // demais — o parser já é tolerante a páginas ausentes/incompletas.
      try {
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
      } catch (err) {
        console.error('[importar-voo] falha ao extrair a página ' + p, err);
        pageErrors.push(p + ': ' + (err && err.message ? err.message : err));
        pages.push({ pageNumber: p, items: [] });
      }
    }
    if (pageErrors.length) {
      console.warn('[importar-voo] páginas com falha na extração:', pageErrors.join(' | '));
    }
    if (pageErrors.length === doc.numPages) {
      var allFailedErr = new Error('Todas as ' + doc.numPages + ' página(s) falharam na extração: ' + pageErrors.join(' | '));
      allFailedErr.isPdfOpenError = true;
      throw allFailedErr;
    }
    return { pages: pages, pageErrors: pageErrors };
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
      var extracted = await extractPages(buffer);
      var pages = extracted.pages;
      var result = window.AW139ImportarVooParser.parseFlightPreview(pages);
      var pageErrorMsgs = extracted.pageErrors.map(function (e) { return 'Falha ao ler página ' + e + ' — os campos dela ficaram vazios.'; });
      result.meta.warnings = (result.meta.warnings || []).concat(pageErrorMsgs);
      var ok = applyParseResult(result, setUploadStatus, 'este PDF como um Flight Preview');
      if (ok) setUploadStatus('PDF "' + file.name + '" lido — ' + pages.length + ' página(s). Revise os dados abaixo antes de gravar.', 'ok');
    } catch (err) {
      console.error('[importar-voo] falha ao ler o Flight Preview', err);
      if (err && err.isLibraryLoadError) {
        showError(
          location.protocol === 'file:'
            ? 'Não foi possível carregar o leitor de PDF (pdf.js) porque o módulo foi aberto diretamente do arquivo (file://). Sirva a pasta por um servidor local — ex.: "python3 -m http.server" — e acesse por http://localhost:8000/importar-voo/, ou instale/abra o app pela URL publicada.'
            : 'Não foi possível carregar o leitor de PDF (pdf.js). Verifique se a pasta vendor/ foi publicada junto com o restante do módulo e recarregue a página.'
        );
      } else if (err && err.isPdfOpenError) {
        var openDetail = (err && (err.message || String(err))) || 'erro desconhecido';
        showError('O leitor de PDF (pdf.js) não conseguiu processar este arquivo — provavelmente por algum recurso interno do PDF (fonte, anotação, assinatura) que essa versão da biblioteca não suporta. Isso não é um problema com o app em si, mas sim com esse arquivo específico.\nDetalhe técnico: ' + openDetail);
      } else {
        var detail = (err && (err.message || String(err))) || 'erro desconhecido';
        showError('Não foi possível ler este PDF. Verifique se o arquivo não está corrompido e tente novamente.\nDetalhe técnico: ' + detail);
      }
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

  function setConfirmStatus(text, kind) {
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
    fileInput.value = '';
    setUploadStatus('', '');
    textImportArea.value = '';
    setTextImportStatus('', '');
    setConfirmStatus('', '');
  });

  // ---------------------------------------------------------------------
  // Modo alternativo: importar texto gerado por IA (Copilot etc.), sem
  // depender do pdf.js no dispositivo. Reaproveita a mesma tela de
  // conferência da importação por PDF.
  // ---------------------------------------------------------------------
  copilotPromptBox.textContent = COPILOT_PROMPT;

  function setTextImportStatus(text, kind) {
    textImportStatus.textContent = text || '';
    textImportStatus.className = 'upload-status' + (kind === 'busy' ? ' is-busy' : kind === 'error' ? ' is-error' : '');
  }

  function setActiveMode(mode) {
    var isPdf = mode === 'pdf';
    modeTabPdf.classList.toggle('is-active', isPdf);
    modeTabPdf.setAttribute('aria-selected', String(isPdf));
    modeTabText.classList.toggle('is-active', !isPdf);
    modeTabText.setAttribute('aria-selected', String(!isPdf));
    modePanelPdf.hidden = !isPdf;
    modePanelText.hidden = isPdf;
  }
  modeTabPdf.addEventListener('click', function () { setActiveMode('pdf'); });
  modeTabText.addEventListener('click', function () { setActiveMode('text'); });

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
    errorPanel.hidden = true;
    state.data = result.data;
    state.debug = result.debug || {};
    state.meta = result.meta;
    state.inputs = [];
    renderReview();
    return true;
  }

  processTextBtn.addEventListener('click', function () {
    var raw = textImportArea.value;
    if (!raw || !raw.trim()) {
      setTextImportStatus('Cole o texto gerado pelo Copilot antes de processar.', 'error');
      return;
    }
    reviewRoot.hidden = true;
    var result = window.AW139ImportarVooTextParser.parseFlightPreviewText(raw);
    var ok = applyParseResult(result, setTextImportStatus, 'este texto');
    if (ok) setTextImportStatus('Texto processado. Revise os dados abaixo antes de gravar.', 'ok');
  });

  function warnIfFileProtocol() {
    if (location.protocol === 'file:') {
      var warning = document.getElementById('fileProtocolWarning');
      if (warning) warning.hidden = false;
    }
  }

  applyQueryParams();
  warnIfFileProtocol();
})();
