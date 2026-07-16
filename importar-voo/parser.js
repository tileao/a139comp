'use strict';
(function () {


// Parser do Flight Preview (formulário F-OPR 184) do AW139 Companion.
//
// Recebe os itens de texto (com posição x/y) extraídos pelo pdf.js de cada
// página do PDF e devolve um objeto de dados tolerante a campos ausentes
// (nunca lança para PDF incompleto ou fora do formato — nesse caso os campos
// ficam null e `meta.warnings`/`meta.valid` sinalizam o problema).
//
// O layout do F-OPR 184 é tabular e gerado por iText: cada "célula" da
// tabela chega como um item de texto já semanticamente inteiro (ex.:
// "MC 198º", "17.2Nm", "FT 00:09:21"), então a extração usa regex sobre
// cada item + a posição (x/y/página) para desambiguar valores repetidos
// (ex.: vários "0" ou várias linhas de coordenadas) e agrupar por bloco de
// waypoint — mais robusto do que depender da ordem/join de linha do
// getTextContent(), que pode intercalar colunas distantes (ex.: o painel de
// METAR/TAF à direita) com a tabela de rota à esquerda.

const NUM = '[0-9]+(?:\\.[0-9]+)?';

function toNum(str) {
  if (str == null) return null;
  const s = String(str).replace(',', '.').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function hmsToMinutes(hms) {
  const m = /^(\d{1,3}):(\d{2}):(\d{2})$/.exec(hms || '');
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]), s = Number(m[3]);
  return Math.round((h * 60 + mi + s / 60) * 100) / 100;
}

function hmToMinutes(hm) {
  const m = /^(\d{1,3}):(\d{2})$/.exec(hm || '');
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function dmsToDecimal(deg, min, sec, hemi) {
  if (deg == null || min == null || sec == null || !hemi) return null;
  let dec = Number(deg) + Number(min) / 60 + Number(sec) / 3600;
  if (hemi === 'S' || hemi === 'W') dec = -dec;
  return Math.round(dec * 1e6) / 1e6;
}

function parseCoordText(str) {
  if (!str) return null;
  const re = /(\d+)°(\d+)'(\d+)"([NS])\s+(\d+)°(\d+)'(\d+)"([EW])\s+DMG:\s*(-?\d+)º?\s*([NSEW])/;
  const m = re.exec(str);
  if (!m) return null;
  const lat = dmsToDecimal(m[1], m[2], m[3], m[4]);
  const lon = dmsToDecimal(m[5], m[6], m[7], m[8]);
  return { lat, lon, dmgDeg: toNum(m[9]), dmgDir: m[10] };
}

function parseAltitude(str) {
  if (!str) return null;
  const m = /Altitude:\s*(\d+)?\s*ft/.exec(str);
  if (!m) return null;
  return m[1] != null ? toNum(m[1]) : null;
}

// Agrupa itens em "blocos de linha" por proximidade de y (tolerância em pt).
function clusterByY(items, tol) {
  const sorted = items.slice().sort((a, b) => (a.page - b.page) || (b.y - a.y) || (a.x - b.x));
  const lines = [];
  for (const it of sorted) {
    let line = lines.length ? lines[lines.length - 1] : null;
    if (line && line.page === it.page && Math.abs(line.y - it.y) <= tol) {
      line.items.push(it);
      line.y = (line.y * (line.items.length - 1) + it.y) / line.items.length;
    } else {
      lines.push({ page: it.page, y: it.y, items: [it] });
    }
  }
  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines;
}

function debugSet(debug, path, item) {
  if (!item) return;
  debug[path] = { page: item.page, x: Math.round(item.x * 10) / 10, y: Math.round(item.y * 10) / 10, str: item.str };
}

function findFirst(items, regex, opts) {
  opts = opts || {};
  for (const it of items) {
    if (opts.page != null && it.page !== opts.page) continue;
    if (opts.xMin != null && it.x < opts.xMin) continue;
    if (opts.xMax != null && it.x > opts.xMax) continue;
    if (opts.yMin != null && it.y < opts.yMin) continue;
    const m = regex.exec(it.str);
    if (m) return { match: m, item: it };
  }
  return null;
}

function flattenItems(pages) {
  const out = [];
  for (const page of pages || []) {
    const pageNumber = page.pageNumber;
    for (const it of page.items || []) {
      if (!it || !it.str || !it.str.trim()) continue;
      out.push({ str: it.str, x: it.x, y: it.y, w: it.w, h: it.h, fontName: it.fontName, page: pageNumber });
    }
  }
  return out;
}

function isFlightPreview(items) {
  const hasFlightId = items.some((it) => /Flight\s*N[°º]\/ID/i.test(it.str));
  const hasLeg = items.some((it) => /^MC\s+\d+º$/.test(it.str));
  return hasFlightId && hasLeg;
}

// --- Cabeçalho (página 1, tipicamente) -------------------------------------

function parseHeader(items, debug) {
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
  };

  const fid = findFirst(items, /Flight\s*N[°º]\/ID/i);
  if (fid) {
    const near = items.find((it) => it.page === fid.item.page && Math.abs(it.y - fid.item.y) <= 2 && it.x > fid.item.x && /^\d{4,}$/.test(it.str));
    if (near) { header.flightId = near.str; debugSet(debug, 'flightId', near); }
  }

  const dateItem = items.find((it) => /^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(it.str));
  if (dateItem) {
    header.dateRaw = dateItem.str;
    const m = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/.exec(dateItem.str);
    if (m) header.dateISO = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`;
    debugSet(debug, 'dateRaw', dateItem);
  }

  const reserveLabel = findFirst(items, /Minimal Reserve/i);
  if (reserveLabel) {
    const val = items.find((it) => it.page === reserveLabel.item.page && /^\d+'$/.test(it.str) && it.y > reserveLabel.item.y - 3 && it.y < reserveLabel.item.y + 20);
    if (val) { header.minimalReserveMin = toNum(val.str.replace("'", '')); debugSet(debug, 'minimalReserveMin', val); }
  }

  // Tripulação: "1P:"/"2P:"/"FA:" seguidos do nome na mesma linha, com o
  // peso/código/lado numa linha ~10pt acima, deslocados um pouco à esquerda.
  const crewLabels = [
    { key: 'p1', re: /^1P:$/ },
    { key: 'p2', re: /^2P:$/ },
    { key: 'fa', re: /^FA:$/ },
  ];
  for (const { key, re } of crewLabels) {
    const label = items.find((it) => re.test(it.str));
    if (!label) continue;
    const name = items.find((it) => it.page === label.page && Math.abs(it.y - label.y) <= 2 && it.x > label.x && it.x < label.x + 260);
    if (name) { header.crew[key].name = name.str.trim() || null; debugSet(debug, `crew.${key}.name`, name); }
    const weight = items.find((it) => it.page === label.page && /^\d+kg$/.test(it.str) && it.y < label.y && it.y > label.y - 15 && it.x > label.x - 5 && it.x < label.x + 50);
    if (weight) { header.crew[key].weightKg = toNum(weight.str.replace('kg', '')); debugSet(debug, `crew.${key}.weightKg`, weight); }
    if (weight) {
      const code = items.find((it) => it.page === weight.page && Math.abs(it.y - weight.y) <= 1 && it.x > weight.x && it.x < weight.x + 60 && /^\d{4,8}$/.test(it.str));
      if (code) { header.crew[key].code = code.str; debugSet(debug, `crew.${key}.code`, code); }
      const side = items.find((it) => it.page === weight.page && Math.abs(it.y - weight.y) <= 3 && /^(RH|LH)$/.test(it.str) && it.x > weight.x && it.x < weight.x + 130);
      if (side) { header.crew[key].side = side.str; debugSet(debug, `crew.${key}.side`, side); }
    }
  }

  const pl = findFirst(items, /^PL:\s*(\d+)/);
  if (pl) { header.plKg = toNum(pl.match[1]); debugSet(debug, 'plKg', pl.item); }

  // Linha da aeronave: "<matrícula> AW139 7T" seguida de rótulos e valores.
  const acLine = items.find((it) => /^[A-Z0-9-]+\s+AW139\s+\S+$/.test(it.str));
  if (acLine) {
    const m = /^([A-Z0-9-]+)\s+(AW139\s+\S+)$/.exec(acLine.str);
    header.aircraft.registration = m ? m[1] : null;
    header.aircraft.model = m ? m[2] : null;
    debugSet(debug, 'aircraft.registration', acLine);
    const y = acLine.y, page = acLine.page;
    const grab = (re, key, transform, xAfter) => {
      const it = items.find((i) => i.page === page && Math.abs(i.y - y) <= 2 && re.test(i.str) && (xAfter == null || i.x > xAfter));
      if (it) {
        const mm = re.exec(it.str);
        header.aircraft[key] = transform(mm);
        debugSet(debug, `aircraft.${key}`, it);
      }
    };
    grab(/^(\d+)kt$/, 'cruiseKt', (mm) => toNum(mm[1]));
    grab(/^(\d+)kg\/h$/, 'fuelFlowGndKgH', (mm) => toNum(mm[1]));
    grab(/^(\d+)kg\/h$/, 'fuelFlowFlightKgH', (mm) => toNum(mm[1]), items.find((i) => /^(\d+)kg\/h$/.test(i.str))?.x + 1 || null);
    grab(/^(\d+)kg$/, 'maxFuelKg', (mm) => toNum(mm[1]));
    grab(/^(\d+)\s*kg$/, 'eewKg', (mm) => toNum(mm[1]));
    grab(/^(\d+)$/, 'cg', (mm) => toNum(mm[1]));
    grab(/^(\d+)kg$/, 'oewKg', (mm) => toNum(mm[1]));
    grab(/^(\d+)kg$/, 'minReqFuelKg', (mm) => toNum(mm[1]));

    // FuelFlow tem dois valores "NNNkg/h" na mesma linha (Gnd, depois
    // Flight): resolvemos explicitamente por ordem de x em vez de regex
    // única, já que o `grab` genérico pegaria sempre o primeiro.
    const flowItems = items.filter((i) => i.page === page && Math.abs(i.y - y) <= 2 && /^\d+kg\/h$/.test(i.str)).sort((a, b) => a.x - b.x);
    if (flowItems[0]) { header.aircraft.fuelFlowGndKgH = toNum(flowItems[0].str); debugSet(debug, 'aircraft.fuelFlowGndKgH', flowItems[0]); }
    if (flowItems[1]) { header.aircraft.fuelFlowFlightKgH = toNum(flowItems[1].str); debugSet(debug, 'aircraft.fuelFlowFlightKgH', flowItems[1]); }
    // kg/kg-valores com rótulo textual junto (ex.: "4563 kg") vêm como um só
    // item; os demais ("1670kg" etc.) vêm colados.
    const eewIt = items.find((i) => i.page === page && Math.abs(i.y - y) <= 2 && /^\d+\s*kg$/.test(i.str) && /EEW/.test((items.find((j) => j.page === page && Math.abs(j.y - y) <= 2 && /EEW:/.test(j.str)) || {}).str || '') );
    // fallback simples: localizar pelo rótulo textual precedente mais próximo à esquerda
  }

  // Reforça MaxFuel/EEW/OEW/MinReqFuel/CG usando o rótulo textual como âncora
  // (mais confiável que casar só pelo formato do valor, que se repete).
  const labelValue = (labelRe, key, xGapMax) => {
    const label = items.find((it) => labelRe.test(it.str));
    if (!label) return;
    const val = items.find((it) => it.page === label.page && Math.abs(it.y - label.y) <= 2 && it.x > label.x && it.x < label.x + (xGapMax || 60));
    if (val) {
      const m = /(-?\d+(?:\.\d+)?)/.exec(val.str);
      if (m) { header.aircraft[key] = toNum(m[1]); debugSet(debug, `aircraft.${key}`, val); }
    }
  };
  labelValue(/^Cruise:$/, 'cruiseKt');
  labelValue(/^FuelFlow\(Gnd\):$/, 'fuelFlowGndKgH');
  labelValue(/^\(Flight\):$/, 'fuelFlowFlightKgH');
  labelValue(/^MaxFuel:$/, 'maxFuelKg');
  labelValue(/^EEW:$/, 'eewKg');
  labelValue(/^CG:$/, 'cg');
  labelValue(/^OEW:$/, 'oewKg');
  labelValue(/^MinReqFuel:$/, 'minReqFuelKg', 70);

  return header;
}

// --- Waypoints + pernas ------------------------------------------------

function parseRoute(allItems, debug) {
  // Restringe à tabela de rota (x < 545): a coluna mais à direita usada
  // (Free, DEP) fica em ~505-535. Acima disso começa o painel de METAR/TAF,
  // que ocupa a MESMA faixa de y da tabela em várias páginas — sem esse
  // corte, marcadores de ICAO do painel (ex. "SBCB") vazam para dentro do
  // bloco do waypoint mais próximo.
  const items = allItems.filter((it) => it.x < 545);

  // Marcadores de índice de perna: número isolado, fonte maior (h >= 11.5),
  // coluna esquerda estreita (x entre 15 e 30) — distingue de outros
  // números soltos na tabela (pax, tempo de solo etc.), que usam fonte
  // menor.
  const legMarkers = items
    .filter((it) => /^\d{1,2}$/.test(it.str) && it.h >= 11.3 && it.x >= 14 && it.x <= 30)
    .sort((a, b) => (a.page - b.page) || (b.y - a.y));

  const legsRaw = [];
  for (const marker of legMarkers) {
    const mc = items.find((it) => it.page === marker.page && Math.abs(it.y - marker.y) <= 4 && /^MC\s+\d+º$/.test(it.str) && it.x > marker.x);
    if (!mc) continue;
    legsRaw.push({ marker, mc });
  }

  const legs = [];
  for (let i = 0; i < legsRaw.length; i++) {
    const { marker, mc } = legsRaw[i];
    const rowTol = 3;
    const sameRow = (it) => it.page === mc.page && Math.abs(it.y - mc.y) <= rowTol;

    const idx = toNum(marker.str);
    const mcDeg = toNum(/MC\s+(\d+)º/.exec(mc.str)[1]);
    const distItem = items.find((it) => sameRow(it) && /^[\d.]+Nm$/.test(it.str));
    const ftItem = items.find((it) => sameRow(it) && /^FT\s+\d{1,3}:\d{2}:\d{2}$/.test(it.str));
    const ttItem = items.find((it) => sameRow(it) && /^TT\s+\d{1,3}:\d{2}:\d{2}$/.test(it.str));
    const onboardParens = items.filter((it) => sameRow(it) && /^\(\d+\)$/.test(it.str) && it.x > 300).sort((a, b) => a.x - b.x);

    const windDirItem = items.find((it) => it.page === mc.page && /^\d{1,3}º$/.test(it.str) && it.x >= 35 && it.x <= 70 && it.y > mc.y && it.y <= mc.y + 12);
    const windKtItem = items.find((it) => it.page === mc.page && /^[\d.]+kt$/.test(it.str) && it.x >= 35 && it.x <= 70 && it.y < mc.y && it.y >= mc.y - 12);

    const ftHms = ftItem ? /FT\s+([\d:]+)/.exec(ftItem.str)[1] : null;
    const ttHms = ttItem ? /TT\s+([\d:]+)/.exec(ttItem.str)[1] : null;

    const leg = {
      idx,
      page: mc.page,
      y: mc.y,
      mcDeg,
      distNm: distItem ? toNum(distItem.str.replace('Nm', '')) : null,
      ftHms, ftMin: hmsToMinutes(ftHms),
      ttHms, ttMin: hmsToMinutes(ttHms),
      windDirDeg: windDirItem ? toNum(windDirItem.str.replace('º', '')) : null,
      windKt: windKtItem ? toNum(windKtItem.str.replace('kt', '')) : null,
      paxOnboard: onboardParens[0] ? toNum(onboardParens[0].str.replace(/[()]/g, '')) : null,
      loadOnboardKg: onboardParens[1] ? toNum(onboardParens[1].str.replace(/[()]/g, '')) : null,
    };
    debugSet(debug, `legs[${legs.length}].mcDeg`, mc);
    if (distItem) debugSet(debug, `legs[${legs.length}].distNm`, distItem);
    legs.push(leg);
  }

  // Blocos de waypoint: itens entre um marcador de perna (exclusive) e o
  // próximo (exclusive) formam o bloco do ponto de chegada daquela perna. O
  // primeiro bloco (antes da 1ª perna) é o ponto de partida.
  const sortedItems = items.slice().sort((a, b) => (a.page - b.page) || (b.y - a.y) || (a.x - b.x));
  const boundaries = legsRaw.map(({ marker, mc }) => ({ page: mc.page, y: mc.y }));
  function blockIndexFor(it) {
    for (let i = 0; i < boundaries.length; i++) {
      const b = boundaries[i];
      if (it.page < b.page || (it.page === b.page && it.y > b.y - 1e-6)) return i;
    }
    return boundaries.length;
  }
  const blocks = [];
  for (const it of sortedItems) {
    const bi = blockIndexFor(it);
    if (!blocks[bi]) blocks[bi] = [];
    blocks[bi].push(it);
  }

  const waypoints = blocks.map((blockItems, seq) => parseWaypointBlock(blockItems || [], seq, debug));

  // Liga cada perna ao waypoint de origem/destino pela ordem sequencial.
  for (let i = 0; i < legs.length; i++) {
    legs[i].fromSeq = i;
    legs[i].toSeq = i + 1;
    legs[i].from = waypoints[i] ? waypoints[i].name : null;
    legs[i].to = waypoints[i + 1] ? waypoints[i + 1].name : null;
  }

  return { waypoints, legs };
}

function parseWaypointBlock(blockItems, seq, debug) {
  const wp = {
    seq, name: null, kind: 'fixo', icao: null, freq: null,
    elevFt: null, dValueM: null, maxT: null, classe: null,
    coord: null, dmgDeg: null, dmgDir: null,
    fuelArrKg: null, fuelDepKg: null, autonomyArr: null, autonomyDep: null,
    paxArr: null, paxDep: null, loadArrKg: null, loadDepKg: null,
    ulArrKg: null, ulDepKg: null, wtArrKg: null, wtDepKg: null, freeArrKg: null, freeDepKg: null,
    mtowKg: null, gndTimeMin: null,
  };
  if (!blockItems.length) return wp;

  const prefix = `waypoints[${seq}]`;

  // Coordenadas / altitude / DMG
  const coordItem = blockItems.find((it) => /°.*'.*".*DMG:/.test(it.str));
  if (coordItem) {
    const parsed = parseCoordText(coordItem.str);
    if (parsed) { wp.coord = { lat: parsed.lat, lon: parsed.lon }; wp.dmgDeg = parsed.dmgDeg; wp.dmgDir = parsed.dmgDir; debugSet(debug, `${prefix}.coord`, coordItem); }
    const alt = parseAltitude(coordItem.str);
    if (alt != null) wp.elevFt = alt;
  }

  // Helideque: "<ICAO 4c> <NOME> Elevation: <n> ft <n.nn>m <n.nn>T Classe <n>"
  const hdkRe = /Elevation:\s*(\d+)\s*ft\s+([\d.]+)m\s+([\d.]+)T\s+Classe\s*(\d)/;
  const hdkItem = blockItems.find((it) => hdkRe.test(it.str));
  if (hdkItem) {
    const m = hdkRe.exec(hdkItem.str);
    wp.kind = 'helideque';
    wp.elevFt = toNum(m[1]);
    wp.dValueM = toNum(m[2]);
    wp.maxT = toNum(m[3]);
    wp.classe = toNum(m[4]);
    debugSet(debug, `${prefix}.hdk`, hdkItem);
    // O código de 4 caracteres normalmente é outro item na mesma linha, à
    // esquerda do nome (ex.: "9PWG" antes de "NS62 Elevation: ...").
    // Restrito à margem esquerda (x <= 60) para não casar com valores
    // numéricos de outras colunas (combustível, pesos) na mesma linha.
    const icaoItem = blockItems.find((it) => Math.abs(it.y - hdkItem.y) <= 2 && it !== hdkItem && it.x <= 60 && /^[A-Z0-9]{3,6}$/.test(it.str.trim()));
    const nameMatch = /^([A-Z0-9]+)\s+Elevation:/.exec(hdkItem.str);
    wp.name = icaoItem ? (nameMatch ? nameMatch[1] : icaoItem.str) : (nameMatch ? nameMatch[1] : null);
    wp.icao = icaoItem ? icaoItem.str.trim() : null;
    if (nameMatch) wp.name = nameMatch[1];
  }

  // Aeródromo: "AEROPORTO DE <nome>" + código SBxx próximo + frequência.
  const aeroItem = blockItems.find((it) => /^AEROPORTO DE /.test(it.str));
  if (aeroItem) {
    wp.kind = 'aerodromo';
    wp.name = aeroItem.str.replace(/^AEROPORTO DE /, '').trim();
    debugSet(debug, `${prefix}.name`, aeroItem);
    const icaoItem = blockItems.find((it) => /^S[A-Z]{3}$/.test(it.str));
    if (icaoItem) { wp.icao = icaoItem.str; debugSet(debug, `${prefix}.icao`, icaoItem); }
    const freqItem = blockItems.find((it) => /^\d{3}\.\d{3}$/.test(it.str));
    if (freqItem) { wp.freq = freqItem.str; debugSet(debug, `${prefix}.freq`, freqItem); }
  }

  // Fixo enroute: "<NOME>FIXO (<obs>)" — pode quebrar em duas linhas.
  if (wp.kind === 'fixo' && !wp.name) {
    const fixoItems = blockItems.filter((it) => /FIXO/.test(it.str) || (blockItems.some((j) => /FIXO/.test(j.str)) === false && false));
    const first = blockItems.find((it) => /FIXO/.test(it.str));
    if (first) {
      const wrapLines = blockItems.filter((it) => it.x <= 25 && it.y <= first.y && it.y > first.y - 20 && it !== first && !/°.*DMG:/.test(it.str) && !/Elevation:/.test(it.str) && !/^AEROPORTO/.test(it.str));
      const combined = [first, ...wrapLines].sort((a, b) => b.y - a.y).map((it) => it.str).join(' ');
      const m = /^([A-Z0-9]+)FIXO\s*\(([^)]*)\)/.exec(combined) || /^([A-Z0-9]+)FIXO\s*\(([^)]*)/.exec(combined);
      wp.name = m ? m[1] : combined.replace(/FIXO.*$/, '').trim();
      wp.obs = m ? (m[2] || '').trim() || null : null;
      debugSet(debug, `${prefix}.name`, first);
    }
  }

  // Combustível remanescente + autonomia: pares "NNNN" (kg, negrito) + "hh:mm"
  // empilhados; cada waypoint mostra o par de chegada (ARR) e, quando há
  // parada, também o de saída (DEP), ~10-22pt abaixo.
  const fuelItems = blockItems.filter((it) => it.x >= 383 && it.x <= 414 && /^\d{2,4}$/.test(it.str)).sort((a, b) => b.y - a.y);
  const autonItems = blockItems.filter((it) => it.x >= 383 && it.x <= 414 && /^\d{1,3}:\d{2}$/.test(it.str)).sort((a, b) => b.y - a.y);
  if (fuelItems[0]) { wp.fuelArrKg = toNum(fuelItems[0].str); debugSet(debug, `${prefix}.fuelArrKg`, fuelItems[0]); }
  if (fuelItems[1]) { wp.fuelDepKg = toNum(fuelItems[1].str); debugSet(debug, `${prefix}.fuelDepKg`, fuelItems[1]); }
  else wp.fuelDepKg = wp.fuelArrKg;
  if (autonItems[0]) { wp.autonomyArr = autonItems[0].str; debugSet(debug, `${prefix}.autonomyArr`, autonItems[0]); }
  if (autonItems[1]) { wp.autonomyDep = autonItems[1].str; }
  else wp.autonomyDep = wp.autonomyArr;

  // Pax / Load: pares "N" (sem parênteses) na faixa de colunas 305-345.
  const paxLoadItems = blockItems.filter((it) => it.x >= 305 && it.x <= 345 && /^\d{1,4}$/.test(it.str));
  const rows = clusterByY(paxLoadItems, 3);
  if (rows[0]) {
    const cols = rows[0].items.sort((a, b) => a.x - b.x);
    if (cols[0]) wp.paxArr = toNum(cols[0].str);
    if (cols[1]) wp.loadArrKg = toNum(cols[1].str);
  }
  if (rows[1]) {
    const cols = rows[1].items.sort((a, b) => a.x - b.x);
    if (cols[0]) wp.paxDep = toNum(cols[0].str);
    if (cols[1]) wp.loadDepKg = toNum(cols[1].str);
  } else {
    wp.paxDep = wp.paxArr; wp.loadDepKg = wp.loadArrKg;
  }

  // UL / WT / Free (chegada e saída): três colunas de peso em kg.
  const ulItems = blockItems.filter((it) => it.x >= 440 && it.x <= 472 && /^\d{3,5}$/.test(it.str)).sort((a, b) => b.y - a.y);
  const wtItems = blockItems.filter((it) => it.x >= 472 && it.x <= 505 && /^\d{3,5}$/.test(it.str)).sort((a, b) => b.y - a.y);
  const freeItems = blockItems.filter((it) => it.x >= 505 && it.x <= 540 && /^\d{3,5}$/.test(it.str)).sort((a, b) => b.y - a.y);
  if (ulItems[0]) wp.ulArrKg = toNum(ulItems[0].str);
  if (ulItems[1]) wp.ulDepKg = toNum(ulItems[1].str);
  if (wtItems[0]) wp.wtArrKg = toNum(wtItems[0].str);
  if (wtItems[1]) wp.wtDepKg = toNum(wtItems[1].str);
  if (freeItems[0]) wp.freeArrKg = toNum(freeItems[0].str);
  if (freeItems[1]) wp.freeDepKg = toNum(freeItems[1].str);

  // MTOW aplicável (ex.: "7000"), coluna estreita entre PAX/Load e UL.
  const mtowItem = blockItems.find((it) => it.x >= 412 && it.x <= 432 && /^\d{4}$/.test(it.str));
  if (mtowItem) { wp.mtowKg = toNum(mtowItem.str); debugSet(debug, `${prefix}.mtowKg`, mtowItem); }

  // Tempo de solo (minutos), coluna estreita à esquerda da tabela de pesos.
  const gndItem = blockItems.find((it) => it.x >= 286 && it.x <= 306 && /^\d{1,3}$/.test(it.str));
  if (gndItem) wp.gndTimeMin = toNum(gndItem.str);

  return wp;
}

// --- Totais / defaults ---------------------------------------------------

function parseTotals(items, debug) {
  const totals = { rideNm: null, totalTimeHms: null, totalTimeMin: null };
  const ride = findFirst(items, /Ride=\s*([\d.]+)\s*Nm/);
  if (ride) { totals.rideNm = toNum(ride.match[1]); debugSet(debug, 'totals.rideNm', ride.item); }
  const time = findFirst(items, /Total Time=\s*(\d{1,3}:\d{2})/);
  if (time) { totals.totalTimeHms = time.match[1]; totals.totalTimeMin = hmToMinutes(time.match[1]); debugSet(debug, 'totals.totalTimeHms', time.item); }
  return totals;
}

function parseDefaults(items, debug) {
  const defaults = { paxStdKg: null, bagStdKg: null };
  const pax = findFirst(items, /^(\d+)\s*kg$/, { xMin: 195, xMax: 235 });
  if (pax) { defaults.paxStdKg = toNum(pax.match[1]); debugSet(debug, 'defaults.paxStdKg', pax.item); }
  const bagLabel = items.find((it) => /^Bag:$/.test(it.str));
  if (bagLabel) {
    const val = items.find((it) => it.page === bagLabel.page && Math.abs(it.y - bagLabel.y) <= 2 && it.x > bagLabel.x && /^(\d+)\s*kg$/.test(it.str));
    if (val) { defaults.bagStdKg = toNum(/(\d+)/.exec(val.str)[1]); debugSet(debug, 'defaults.bagStdKg', val); }
  }
  return defaults;
}

// --- METAR/TAF (painel à direita do cabeçalho de página) -------------------

function parseMetars(items, debug) {
  const panel = items.filter((it) => it.x >= 540);
  const icaoMarkers = panel.filter((it) => /^S[A-Z]{3}$/.test(it.str) && it.x <= 560).sort((a, b) => (a.page - b.page) || (b.y - a.y));
  const metars = [];
  for (let i = 0; i < icaoMarkers.length; i++) {
    const marker = icaoMarkers[i];
    const next = icaoMarkers[i + 1];
    // Cada bloco METAR/TAF de aeródromo ocupa tipicamente ~30-42pt abaixo do
    // marcador do ICAO. Sem um próximo marcador para delimitar (último
    // bloco da página), usamos esse teto fixo — senão a varredura
    // continuaria até o rodapé/gráfico à direita, que compartilha a mesma
    // faixa de x.
    const lowerBound = next && next.page === marker.page ? next.y + 6 : marker.y - 35;
    const blockItems = panel.filter((it) => {
      if (it.page !== marker.page) return false;
      if (it.y > marker.y + 6) return false;
      if (it.y <= lowerBound) return false;
      return true;
    }).sort((a, b) => b.y - a.y);

    const sr = blockItems.find((it) => /^SR-\d{2}:\d{2}$/.test(it.str));
    const ss = blockItems.find((it) => /^SS-\d{2}:\d{2}$/.test(it.str));
    const rawText = blockItems.filter((it) => it !== marker).map((it) => it.str).join(' ');
    const metarPart = /(\d{6}Z[^=]*=)/.exec(rawText);
    const tafPart = /(TAF:[^$]*)/.exec(rawText);
    const wind = metarPart ? /\b(\d{3})(\d{2,3})KT\b/.exec(metarPart[1]) : null;

    const entry = {
      icao: marker.str,
      sr: sr ? sr.str.replace('SR-', '') : null,
      ss: ss ? ss.str.replace('SS-', '') : null,
      raw: metarPart ? metarPart[1] : (rawText || null),
      taf: tafPart ? tafPart[1].trim() : null,
      windDirDeg: wind ? toNum(wind[1]) : null,
      windKt: wind ? toNum(wind[2]) : null,
    };
    debugSet(debug, `metars[${metars.length}].icao`, marker);
    metars.push(entry);
  }
  return metars;
}

// --- API pública -----------------------------------------------------------

function buildFpRoute(waypoints, legs) {
  return legs.map((l) => {
    const from = waypoints[l.fromSeq] || null;
    const to = waypoints[l.toSeq] || null;
    return {
      idx: l.idx,
      from: l.from,
      to: l.to,
      mcDeg: l.mcDeg,
      distNm: l.distNm,
      ftMin: l.ftMin,
      ttMin: l.ttMin,
      windDirDeg: l.windDirDeg,
      windKt: l.windKt,
      coordFrom: from && from.coord ? from.coord : null,
      coordTo: to && to.coord ? to.coord : null,
      fuelRemKg: to ? to.fuelArrKg : null,
      paxIn: to ? to.paxArr : null,
      paxOut: to ? to.paxDep : null,
      mtowKg: to ? to.mtowKg : null,
    };
  });
}

function buildFpHelidecks(waypoints) {
  return waypoints
    .filter((w) => w.kind === 'helideque')
    .map((w) => ({
      icao: w.icao,
      nome: w.name,
      elevFt: w.elevFt,
      dValueM: w.dValueM,
      maxT: w.maxT,
      classe: w.classe,
      lat: w.coord ? w.coord.lat : null,
      lon: w.coord ? w.coord.lon : null,
      freq: w.freq,
    }));
}

function parseFlightPreview(pages) {
  try {
    return parseFlightPreviewInner(pages);
  } catch (err) {
    // Rede de segurança final: qualquer exceção não prevista em algum
    // formato de PDF fora do exemplar usado para calibrar o parser vira um
    // resultado inválido tolerante, nunca uma exceção não tratada.
    return {
      meta: { valid: false, warnings: [`Erro inesperado ao interpretar o PDF: ${err && err.message ? err.message : err}.`] },
      data: null,
      debug: {},
    };
  }
}

function parseFlightPreviewInner(pages) {
  const warnings = [];
  const debug = {};
  const items = flattenItems(pages);

  if (!items.length) {
    return { meta: { valid: false, warnings: ['PDF sem texto selecionável extraível.'] }, data: null, debug };
  }

  if (!isFlightPreview(items)) {
    return {
      meta: { valid: false, warnings: ['O PDF não parece ser um Flight Preview (F-OPR 184): não foram encontrados os campos "Flight N°/ID" e/ou linhas de perna "MC ###º".'] },
      data: null,
      debug,
    };
  }

  // Cada seção roda isolada: um formato inesperado numa página real (fora
  // do único exemplar usado para calibrar o parser) não pode derrubar as
  // demais seções — a promessa de tolerância vale também para exceções
  // inesperadas, não só para campos ausentes.
  function safeSection(label, fn, fallback) {
    try {
      return fn();
    } catch (err) {
      warnings.push(`Falha ao interpretar "${label}": ${err && err.message ? err.message : err}.`);
      return fallback;
    }
  }

  const header = safeSection('cabeçalho', () => parseHeader(items, debug), {
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
  });
  const route = safeSection('rota', () => parseRoute(items, debug), { waypoints: [], legs: [] });
  const waypoints = route.waypoints || [];
  const legs = route.legs || [];
  const totals = safeSection('totais', () => parseTotals(items, debug), { rideNm: null, totalTimeHms: null, totalTimeMin: null });
  const defaults = safeSection('defaults', () => parseDefaults(items, debug), { paxStdKg: null, bagStdKg: null });
  const metars = safeSection('METAR/TAF', () => parseMetars(items, debug), []);
  const fpRoute = safeSection('tabela de rota derivada', () => buildFpRoute(waypoints, legs), []);
  const fpHelidecks = safeSection('lista de helideques derivada', () => buildFpHelidecks(waypoints), []);

  if (!header.flightId) warnings.push('Flight N°/ID não encontrado.');
  if (!legs.length) warnings.push('Nenhuma perna de rota encontrada.');
  if (!waypoints.length) warnings.push('Nenhum waypoint encontrado.');

  const data = {
    ...header,
    waypoints,
    legs,
    totals,
    defaults,
    metars,
    fpRoute,
    fpHelidecks,
  };

  return { meta: { valid: true, warnings, pageCount: pages.length }, data, debug };
}

const pdfParserApi = { parseFlightPreview, hmsToMinutes, hmToMinutes, dmsToDecimal, parseCoordText, toNum };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = pdfParserApi;
}
if (typeof window !== 'undefined') {
  window.AW139ImportarVooParser = pdfParserApi;
}

})();
