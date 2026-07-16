'use strict';
(function () {


// Parser do formato "AW139-FLIGHT-PREVIEW-TEXT-V1" — uma codificação de
// texto simples (key:value + CSV) que qualquer ferramenta de IA com leitura
// de PDF (Microsoft 365 Copilot, etc.) pode gerar a partir do Flight
// Preview, para importar no Companion sem depender do pdf.js no
// dispositivo. Veja COPILOT_PROMPT.md para o prompt pronto e a
// especificação completa do formato.
//
// Mesma filosofia tolerante do parser.js: nunca lança para texto malformado
// — campos ausentes/ilegíveis viram null e `meta.warnings` sinaliza o
// problema.

const MARKER = 'AW139-FLIGHT-PREVIEW-TEXT-V1';

function toNum(str) {
  if (str == null) return null;
  const s = String(str).replace(',', '.').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStr(str) {
  if (str == null) return null;
  const s = String(str).trim();
  return s === '' ? null : s;
}

function pathTokens(path) {
  return path.split('.');
}

function setPath(obj, path, value) {
  const tokens = pathTokens(path);
  let cur = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (cur[tokens[i]] == null) cur[tokens[i]] = {};
    cur = cur[tokens[i]];
  }
  cur[tokens[tokens.length - 1]] = value;
}

// Divide o texto bruto em seções "### NOME" -> array de linhas (sem a linha
// do marcador da seção, sem linhas em branco nas pontas).
function splitSections(rawText) {
  // Modelos de IA costumam envolver a resposta em cercas de código markdown
  // (```) mesmo quando instruídos a não fazer isso — remove essas linhas
  // antes de processar, senão elas viram uma linha de dados espúria dentro
  // da seção CSV seguinte.
  const lines = rawText.replace(/\r\n/g, '\n').split('\n').filter((l) => !/^\s*```/.test(l));
  const sections = {};
  let current = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const m = /^###\s*([A-Z_]+)\s*$/.exec(line);
    if (m) {
      current = m[1];
      sections[current] = [];
      continue;
    }
    if (current && line !== '') sections[current].push(rawLine.replace(/\r$/, ''));
  }
  return sections;
}

function parseHeaderSection(lines, debug) {
  const header = {
    flightId: null, dateRaw: null, dateISO: null, minimalReserveMin: null,
    crew: {
      p1: { name: null, weightKg: null, code: null, side: null },
      p2: { name: null, weightKg: null, code: null, side: null },
      fa: { name: null, weightKg: null, code: null, side: null },
    },
    plKg: null,
    aircraft: {
      registration: null, model: null, cruiseKt: null,
      fuelFlowGndKgH: null, fuelFlowFlightKgH: null, maxFuelKg: null,
      eewKg: null, cg: null, oewKg: null, minReqFuelKg: null,
    },
    totals: { rideNm: null, totalTimeHms: null, totalTimeMin: null },
    defaults: { paxStdKg: null, bagStdKg: null },
  };

  const numericKeys = new Set([
    'minimalReserveMin', 'plKg',
    'crew.p1.weightKg', 'crew.p2.weightKg', 'crew.fa.weightKg',
    'aircraft.cruiseKt', 'aircraft.fuelFlowGndKgH', 'aircraft.fuelFlowFlightKgH',
    'aircraft.maxFuelKg', 'aircraft.eewKg', 'aircraft.cg', 'aircraft.oewKg', 'aircraft.minReqFuelKg',
    'totals.rideNm', 'defaults.paxStdKg', 'defaults.bagStdKg',
  ]);

  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    if (!key) continue;
    const value = numericKeys.has(key) ? toNum(rawValue) : toStr(rawValue);
    try {
      setPath(header, key, value);
      if (value != null) debug[key] = { source: 'text', raw: rawValue };
    } catch (err) {
      // chave desconhecida/fora do schema esperado: ignora, não derruba o resto
    }
  }

  if (header.dateRaw) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/.exec(header.dateRaw);
    if (m) header.dateISO = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`;
  }
  header.totals.totalTimeMin = hmToMinutes(header.totals.totalTimeHms);

  return header;
}

function hmToMinutes(hm) {
  const m = /^(\d{1,3}):(\d{2})$/.exec(hm || '');
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

// Parser de CSV simples (sem suporte a vírgulas/aspas dentro de campos — o
// formato pede texto livre sem vírgula justamente para dispensar isso).
function parseCsvSection(lines, columnTypes) {
  if (!lines.length) return [];
  const header = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',');
    const row = {};
    header.forEach((colName, colIdx) => {
      if (!Object.prototype.hasOwnProperty.call(columnTypes, colName)) return;
      const raw = cells[colIdx] != null ? cells[colIdx].trim() : '';
      row[colName] = columnTypes[colName] === 'number' ? toNum(raw) : toStr(raw);
    });
    rows.push(row);
  }
  return rows;
}

function parseLegsSection(lines) {
  const types = {
    idx: 'number', from: 'string', to: 'string', mcDeg: 'number', distNm: 'number',
    ftMin: 'number', ttMin: 'number', windDirDeg: 'number', windKt: 'number',
    fuelRemKg: 'number', paxIn: 'number', paxOut: 'number', mtowKg: 'number',
  };
  return parseCsvSection(lines, types).map((row) => ({
    idx: row.idx ?? null, from: row.from ?? null, to: row.to ?? null,
    mcDeg: row.mcDeg ?? null, distNm: row.distNm ?? null,
    ftMin: row.ftMin ?? null, ttMin: row.ttMin ?? null,
    windDirDeg: row.windDirDeg ?? null, windKt: row.windKt ?? null,
    coordFrom: null, coordTo: null,
    fuelRemKg: row.fuelRemKg ?? null, paxIn: row.paxIn ?? null, paxOut: row.paxOut ?? null,
    mtowKg: row.mtowKg ?? null,
  }));
}

function parseStopsSection(lines) {
  const types = {
    name: 'string', icao: 'string', freq: 'string', fuelArrKg: 'number', fuelDepKg: 'number',
    paxArr: 'number', paxDep: 'number', mtowKg: 'number', gndTimeMin: 'number',
  };
  return parseCsvSection(lines, types).map((row, seq) => ({
    seq,
    name: row.name ?? null,
    kind: row.icao && /^S[A-Z]{3}$/.test(row.icao) ? 'aerodromo' : (row.icao ? 'helideque' : 'fixo'),
    icao: row.icao ?? null,
    freq: row.freq ?? null,
    elevFt: null, dValueM: null, maxT: null, classe: null, coord: null, dmgDeg: null, dmgDir: null,
    fuelArrKg: row.fuelArrKg ?? null, fuelDepKg: row.fuelDepKg ?? null,
    autonomyArr: null, autonomyDep: null,
    paxArr: row.paxArr ?? null, paxDep: row.paxDep ?? null,
    loadArrKg: null, loadDepKg: null, ulArrKg: null, ulDepKg: null, wtArrKg: null, wtDepKg: null,
    freeArrKg: null, freeDepKg: null,
    mtowKg: row.mtowKg ?? null, gndTimeMin: row.gndTimeMin ?? null,
  }));
}

function parseHelidecksSection(lines) {
  const types = {
    icao: 'string', nome: 'string', elevFt: 'number', dValueM: 'number', maxT: 'number',
    classe: 'number', lat: 'number', lon: 'number', freq: 'string',
  };
  return parseCsvSection(lines, types).map((row) => ({
    icao: row.icao ?? null, nome: row.nome ?? null, elevFt: row.elevFt ?? null,
    dValueM: row.dValueM ?? null, maxT: row.maxT ?? null, classe: row.classe ?? null,
    lat: row.lat ?? null, lon: row.lon ?? null, freq: row.freq ?? null,
  }));
}

function parseMetarsSection(lines) {
  const types = {
    icao: 'string', sr: 'string', ss: 'string', windDirDeg: 'number', windKt: 'number',
    raw: 'string', taf: 'string',
  };
  return parseCsvSection(lines, types).map((row) => ({
    icao: row.icao ?? null, sr: row.sr ?? null, ss: row.ss ?? null,
    windDirDeg: row.windDirDeg ?? null, windKt: row.windKt ?? null,
    raw: row.raw ?? null, taf: row.taf ?? null,
  }));
}

function parseFlightPreviewText(rawText) {
  try {
    return parseFlightPreviewTextInner(rawText);
  } catch (err) {
    return {
      meta: { valid: false, warnings: [`Erro inesperado ao interpretar o texto: ${err && err.message ? err.message : err}.`] },
      data: null,
      debug: {},
    };
  }
}

function parseFlightPreviewTextInner(rawText) {
  const warnings = [];
  const debug = {};
  const text = String(rawText || '');

  if (!text.includes(MARKER)) {
    return {
      meta: { valid: false, warnings: [`Texto não reconhecido: não encontrei o marcador "${MARKER}" na primeira linha. Confira se colou a resposta completa do Copilot, sem cortar o início.`] },
      data: null,
      debug,
    };
  }

  const sections = splitSections(text);
  if (!sections.HEADER && !sections.LEGS) {
    return {
      meta: { valid: false, warnings: ['Texto sem as seções "### HEADER" e "### LEGS" — confira se o formato bate com o esperado (veja COPILOT_PROMPT.md).'] },
      data: null,
      debug,
    };
  }

  const header = sections.HEADER ? parseHeaderSection(sections.HEADER, debug) : null;
  const legs = sections.LEGS ? parseLegsSection(sections.LEGS) : [];
  const waypoints = sections.STOPS ? parseStopsSection(sections.STOPS) : [];
  const helidecks = sections.HELIDECKS ? parseHelidecksSection(sections.HELIDECKS) : [];
  const metars = sections.METARS ? parseMetarsSection(sections.METARS) : [];

  if (!header || !header.flightId) warnings.push('Flight N°/ID não encontrado no texto.');
  if (!legs.length) warnings.push('Nenhuma perna de rota encontrada na seção LEGS.');

  const base = header || {
    flightId: null, dateRaw: null, dateISO: null, minimalReserveMin: null,
    crew: { p1: {}, p2: {}, fa: {} }, plKg: null,
    aircraft: {}, totals: { rideNm: null, totalTimeHms: null, totalTimeMin: null },
    defaults: { paxStdKg: null, bagStdKg: null },
  };

  const data = {
    ...base,
    waypoints,
    legs: [],
    metars,
    fpRoute: legs,
    fpHelidecks: helidecks,
  };

  return { meta: { valid: true, warnings, source: 'text' }, data, debug };
}

const textParserApi = { parseFlightPreviewText, MARKER };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = textParserApi;
}
if (typeof window !== 'undefined') {
  window.AW139ImportarVooTextParser = textParserApi;
}

})();
