'use strict';
(function () {
  // Flight Preview — tela SÓ de consulta. Lê o voo já importado
  // (chave `aw139_flight_preview_v1`, gravada pelo módulo Importar Voo) e o
  // contexto compartilhado (para o carimbo de importação) e mostra tudo num
  // lugar só: cabeçalho, aeronave/pesos, tripulação, rota, paradas,
  // helideques e meteorologia. Não calcula nada e não grava nada — para
  // planejar use o Importar Voo + Planejamento do Voo (Pesos).

  var FP_KEY = 'aw139_flight_preview_v1';
  var SHARED_KEY = 'aw139_companion_shared_context_v1';

  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Formatação tolerante: null/undefined/'' viram travessão.
  function txt(v) {
    if (v == null) return '—';
    var s = String(v).trim();
    return s === '' ? '—' : s;
  }

  function num(v, opts) {
    if (v == null || v === '' || !Number.isFinite(Number(v))) return '—';
    var n = Number(v);
    var suffix = (opts && opts.suffix) || '';
    var digits = opts && opts.digits != null ? opts.digits : 0;
    var str = digits > 0 ? n.toFixed(digits) : String(Math.round(n));
    return str + suffix;
  }

  function minutesToHm(min) {
    if (min == null || !Number.isFinite(Number(min))) return '—';
    var m = Math.round(Number(min));
    var h = Math.floor(m / 60);
    var r = m % 60;
    return h + ':' + (r < 10 ? '0' : '') + r;
  }

  function fmtImportedAt(iso) {
    if (!iso) return null;
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  // O import guarda coordenada em grau decimal (é o que o prompt pede ao
  // Copilot, por não ter ambiguidade), mas o padrão de uso é grau + minuto
  // decimal — ex.: -22.4025 vira 22°24.15'S.
  function toDegMin(value, kind) {
    if (value == null || value === '' || !Number.isFinite(Number(value))) return null;
    var v = Number(value);
    var isLat = kind === 'lat';
    if (Math.abs(v) > (isLat ? 90 : 180)) return null;
    var hemi = isLat ? (v < 0 ? 'S' : 'N') : (v < 0 ? 'W' : 'E');
    var abs = Math.abs(v);
    var deg = Math.floor(abs);
    var min = (abs - deg) * 60;
    // O arredondamento pode estourar 60.00' (ex.: 22.9999997) — sobe o grau.
    if (Number(min.toFixed(2)) >= 60) { deg += 1; min = 0; }
    var degStr = String(deg);
    while (degStr.length < (isLat ? 2 : 3)) degStr = '0' + degStr;
    var minStr = min.toFixed(2);
    if (min < 10) minStr = '0' + minStr;
    return degStr + '°' + minStr + "'" + hemi;
  }

  // ---- Consolidação de trechos (decolagem → pouso) -------------------------

  // O Flight Preview quebra a rota em pernas que incluem os fixos de
  // sobrevoo. O que interessa em voo é o tempo entre a decolagem e o pouso
  // seguinte — então somamos as pernas entre duas paradas consecutivas.

  function routeToken(s) {
    if (s == null) return null;
    var t = String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/[^A-Z0-9]/g, '');
    return t === '' ? null : t;
  }

  function matchesStop(point, stop) {
    var p = routeToken(point);
    if (!p || !stop) return false;
    return p === routeToken(stop.icao) || p === routeToken(stop.name);
  }

  function stopLabel(stop) {
    if (!stop) return null;
    return stop.icao || stop.name || null;
  }

  function sumNum(acc, v) {
    if (v == null || !Number.isFinite(Number(v))) return acc;
    return (acc == null ? 0 : acc) + Number(v);
  }

  // Fallback: sem paradas (ou sem casamento entre pernas e paradas) não dá
  // para consolidar — mostra as pernas do Flight Preview como vieram.
  function legsAsSegments(legs) {
    return legs.map(function (leg, i) {
      return {
        seq: i + 1, from: leg.from, to: leg.to, via: [],
        ftMin: leg.ftMin, ftApprox: false, distNm: leg.distNm,
        fuelDepKg: null, fuelArrKg: null, burnKg: null, pax: leg.paxIn
      };
    });
  }

  function buildSegments(stops, legs) {
    if (!legs || !legs.length) return { rows: [], derived: false, partial: false };
    if (!stops || stops.length < 2) {
      return { rows: legsAsSegments(legs), derived: false, partial: false };
    }

    var rows = [];
    var stopIdx = 0;
    var acc = { ftMin: null, ftMissing: 0, distNm: null, via: [] };

    for (var i = 0; i < legs.length && stopIdx < stops.length - 1; i++) {
      var leg = legs[i] || {};
      acc.ftMin = sumNum(acc.ftMin, leg.ftMin);
      if (leg.ftMin == null) acc.ftMissing++;
      acc.distNm = sumNum(acc.distNm, leg.distNm);

      var next = stops[stopIdx + 1];
      if (matchesStop(leg.to, next)) {
        var from = stops[stopIdx] || {};
        var dep = from.fuelDepKg, arr = next.fuelArrKg;
        rows.push({
          seq: rows.length + 1,
          from: stopLabel(from), to: stopLabel(next), via: acc.via,
          ftMin: acc.ftMin, ftApprox: acc.ftMissing > 0, distNm: acc.distNm,
          fuelDepKg: dep, fuelArrKg: arr,
          burnKg: (dep != null && arr != null) ? Number(dep) - Number(arr) : null,
          pax: from.paxDep
        });
        stopIdx++;
        acc = { ftMin: null, ftMissing: 0, distNm: null, via: [] };
      } else if (leg.to != null) {
        acc.via.push(leg.to);
      }
    }

    if (!rows.length) return { rows: legsAsSegments(legs), derived: false, partial: false };
    return { rows: rows, derived: true, partial: rows.length < stops.length - 1 };
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---- Blocos de UI --------------------------------------------------------

  // Painel de pares chave/valor (grid de "stats").
  function statPanel(title, kicker, pairs) {
    var panel = el('section', 'fp-panel');
    var head = el('div', 'fp-panel-head');
    head.appendChild(el('div', 'fp-panel-kicker', escapeHtml(kicker || '')));
    head.appendChild(el('h2', null, escapeHtml(title)));
    panel.appendChild(head);
    var grid = el('div', 'fp-stat-grid');
    pairs.forEach(function (p) {
      if (!p) return;
      var cell = el('div', 'fp-stat' + (p.wide ? ' fp-stat-wide' : ''));
      cell.appendChild(el('div', 'fp-stat-label', escapeHtml(p.label)));
      var val = el('div', 'fp-stat-value', escapeHtml(p.value));
      if (p.value === '—') val.classList.add('is-empty');
      cell.appendChild(val);
      grid.appendChild(cell);
    });
    panel.appendChild(grid);
    return panel;
  }

  // Painel com uma tabela (rola horizontalmente em telas estreitas).
  function tablePanel(title, kicker, columns, rows, emptyMsg) {
    var panel = el('section', 'fp-panel');
    var head = el('div', 'fp-panel-head');
    head.appendChild(el('div', 'fp-panel-kicker', escapeHtml(kicker || '')));
    head.appendChild(el('h2', null, escapeHtml(title)));
    panel.appendChild(head);

    if (!rows || !rows.length) {
      panel.appendChild(el('p', 'fp-panel-empty', escapeHtml(emptyMsg || 'Sem dados nesta seção.')));
      return panel;
    }

    var scroller = el('div', 'fp-table-scroll');
    var table = el('table', 'fp-table');
    var thead = el('thead');
    var trh = el('tr');
    columns.forEach(function (c) {
      trh.appendChild(el('th', c.numeric ? 'num' : null, escapeHtml(c.label)));
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    var tbody = el('tbody');
    rows.forEach(function (row) {
      var tr = el('tr');
      columns.forEach(function (c) {
        var v = row[c.key];
        var cellText = v == null || v === '' ? '—' : String(v);
        var td = el('td', c.numeric ? 'num' : null, escapeHtml(cellText));
        if (cellText === '—') td.classList.add('is-empty');
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroller.appendChild(table);
    panel.appendChild(scroller);
    return panel;
  }

  // ---- Render --------------------------------------------------------------

  function render(fp, shared) {
    var content = document.getElementById('fpContent');
    var empty = document.getElementById('fpEmpty');
    var title = document.getElementById('fpTitle');
    var chip = document.getElementById('fpImportedChip');

    if (!fp) {
      if (empty) empty.hidden = false;
      if (content) content.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (content) { content.hidden = false; content.innerHTML = ''; }

    var aircraft = fp.aircraft || {};
    var crew = fp.crew || {};
    var totals = fp.totals || {};
    var defaults = fp.defaults || {};

    // Título + carimbo de importação.
    if (title) {
      var flightLabel = fp.flightId ? ('Flight N° ' + fp.flightId) : 'Flight Preview';
      title.textContent = flightLabel;
    }
    var importedAt = fmtImportedAt(shared && shared.fpImportedAt);
    if (chip) {
      if (importedAt) {
        chip.textContent = 'Importado em ' + importedAt;
        chip.hidden = false;
      } else {
        chip.hidden = true;
      }
    }

    // 1) Cabeçalho do voo.
    content.appendChild(statPanel('Voo', 'Cabeçalho', [
      { label: 'Flight N°', value: txt(fp.flightId) },
      { label: 'Data / hora', value: txt(fp.dateRaw) },
      { label: 'Aeronave', value: txt(aircraft.registration) },
      { label: 'Modelo', value: txt(aircraft.model) },
      { label: 'Distância total', value: num(totals.rideNm, { suffix: ' nm' }) },
      { label: 'Tempo total', value: totals.totalTimeHms ? txt(totals.totalTimeHms) : minutesToHm(totals.totalTimeMin) },
      { label: 'Reserva mínima', value: num(fp.minimalReserveMin, { suffix: ' min' }) },
      { label: 'Payload (PL)', value: num(fp.plKg, { suffix: ' kg' }) }
    ]));

    // 2) Aeronave e pesos.
    content.appendChild(statPanel('Aeronave e combustível', 'Pesos e performance', [
      { label: 'EEW (vazio equipado)', value: num(aircraft.eewKg, { suffix: ' kg' }) },
      { label: 'OEW (operacional)', value: num(aircraft.oewKg, { suffix: ' kg' }) },
      { label: 'CG', value: txt(aircraft.cg) },
      { label: 'Combustível máximo', value: num(aircraft.maxFuelKg, { suffix: ' kg' }) },
      { label: 'Comb. mín. requerido', value: num(aircraft.minReqFuelKg, { suffix: ' kg' }) },
      { label: 'Cruzeiro', value: num(aircraft.cruiseKt, { suffix: ' kt' }) },
      { label: 'Fluxo em voo', value: num(aircraft.fuelFlowFlightKgH, { suffix: ' kg/h' }) },
      { label: 'Fluxo em solo', value: num(aircraft.fuelFlowGndKgH, { suffix: ' kg/h' }) },
      { label: 'Pax padrão', value: num(defaults.paxStdKg, { suffix: ' kg' }) },
      { label: 'Bagagem padrão', value: num(defaults.bagStdKg, { suffix: ' kg' }) }
    ]));

    // 3) Tripulação.
    var crewRows = [
      { role: 'P1', c: crew.p1 },
      { role: 'P2', c: crew.p2 },
      { role: 'FA / Tripulante', c: crew.fa }
    ].filter(function (r) {
      var c = r.c || {};
      return c.name != null || c.weightKg != null || c.code != null || c.side != null;
    }).map(function (r) {
      var c = r.c || {};
      return {
        role: r.role,
        name: c.name == null ? '—' : c.name,
        code: c.code == null ? '—' : c.code,
        side: c.side == null ? '—' : c.side,
        weightKg: c.weightKg == null ? '—' : num(c.weightKg, { suffix: ' kg' })
      };
    });
    content.appendChild(tablePanel('Tripulação', 'Peso a bordo', [
      { key: 'role', label: 'Posição' },
      { key: 'name', label: 'Nome' },
      { key: 'code', label: 'Código' },
      { key: 'side', label: 'Lado' },
      { key: 'weightKg', label: 'Peso', numeric: true }
    ], crewRows, 'Sem tripulação informada.'));

    var legs = (fp.legs && fp.legs.length ? fp.legs : fp.fpRoute) || [];
    var stops = fp.waypoints || [];

    // 4) Trechos: decolagem → pouso. É o tempo que interessa em voo — as
    // pernas do Flight Preview quebram no sobrevoo dos fixos, então aqui
    // elas são somadas entre uma parada e a seguinte.
    var segInfo = buildSegments(stops, legs);
    var segRows = segInfo.rows.map(function (s) {
      return {
        seq: s.seq,
        seg: txt(s.from) + ' → ' + txt(s.to),
        ftMin: s.ftMin == null ? '—' : ((s.ftApprox ? '≈ ' : '') + minutesToHm(s.ftMin)),
        distNm: s.distNm == null ? '—' : num(s.distNm, { digits: 1, suffix: ' nm' }),
        via: (s.via && s.via.length) ? s.via.join(' · ') : 'direto',
        fuelDepKg: s.fuelDepKg == null ? '—' : num(s.fuelDepKg, { suffix: ' kg' }),
        fuelArrKg: s.fuelArrKg == null ? '—' : num(s.fuelArrKg, { suffix: ' kg' }),
        burnKg: s.burnKg == null ? '—' : num(s.burnKg, { suffix: ' kg' }),
        pax: s.pax == null ? '—' : num(s.pax)
      };
    });
    var segPanel = tablePanel('Trechos', 'Decolagem → pouso', [
      { key: 'seq', label: '#', numeric: true },
      { key: 'seg', label: 'Trecho' },
      { key: 'ftMin', label: 'FT', numeric: true },
      { key: 'distNm', label: 'Dist', numeric: true },
      { key: 'via', label: 'Via' },
      { key: 'fuelDepKg', label: 'Comb. saída', numeric: true },
      { key: 'fuelArrKg', label: 'Comb. cheg.', numeric: true },
      { key: 'burnKg', label: 'Queima', numeric: true },
      { key: 'pax', label: 'Pax', numeric: true }
    ], segRows, 'Sem trechos para mostrar.');
    if (segRows.length && !segInfo.derived) {
      segPanel.appendChild(el('p', 'fp-panel-note',
        'Sem paradas para consolidar — estas são as pernas do Flight Preview como vieram, não os trechos entre pousos.'));
    } else if (segInfo.partial) {
      segPanel.appendChild(el('p', 'fp-panel-note',
        'Nem todas as paradas casaram com as pernas importadas — confira os trechos com o documento oficial.'));
    }
    content.appendChild(segPanel);

    // 5) Rota — detalhe perna a perna, já incluindo os fixos de sobrevoo.
    var legRows = legs.map(function (leg) {
      return {
        idx: leg.idx == null ? '—' : leg.idx,
        seg: txt(leg.from) + ' → ' + txt(leg.to),
        mcDeg: leg.mcDeg == null ? '—' : num(leg.mcDeg, { suffix: '°' }),
        distNm: leg.distNm == null ? '—' : num(leg.distNm, { digits: 1, suffix: ' nm' }),
        ftMin: minutesToHm(leg.ftMin),
        ttMin: minutesToHm(leg.ttMin),
        wind: (leg.windDirDeg == null && leg.windKt == null) ? '—'
          : (num(leg.windDirDeg, { suffix: '°' }) + ' / ' + num(leg.windKt, { suffix: ' kt' })),
        fuelRemKg: leg.fuelRemKg == null ? '—' : num(leg.fuelRemKg, { suffix: ' kg' }),
        pax: (leg.paxIn == null && leg.paxOut == null) ? '—'
          : (num(leg.paxIn) + ' / ' + num(leg.paxOut)),
        mtowKg: leg.mtowKg == null ? '—' : num(leg.mtowKg, { suffix: ' kg' })
      };
    });
    content.appendChild(tablePanel('Rota', 'Detalhe perna a perna (com fixos)', [
      { key: 'idx', label: '#', numeric: true },
      { key: 'seg', label: 'Trecho' },
      { key: 'mcDeg', label: 'MC', numeric: true },
      { key: 'distNm', label: 'Dist', numeric: true },
      { key: 'ftMin', label: 'FT', numeric: true },
      { key: 'ttMin', label: 'TT', numeric: true },
      { key: 'wind', label: 'Vento', numeric: true },
      { key: 'fuelRemKg', label: 'Comb. rem.', numeric: true },
      { key: 'pax', label: 'Pax (in/out)', numeric: true },
      { key: 'mtowKg', label: 'MTOW', numeric: true }
    ], legRows, 'Sem pernas de rota importadas.'));

    // 6) Paradas.
    var kindLabel = { aerodromo: 'Aeródromo', helideque: 'Helideque', fixo: 'Fixo' };
    var stopRows = stops.map(function (s) {
      return {
        name: txt(s.name) + (s.icao ? ' (' + s.icao + ')' : ''),
        kind: kindLabel[s.kind] || txt(s.kind),
        freq: txt(s.freq),
        fuelArrKg: s.fuelArrKg == null ? '—' : num(s.fuelArrKg, { suffix: ' kg' }),
        fuelDepKg: s.fuelDepKg == null ? '—' : num(s.fuelDepKg, { suffix: ' kg' }),
        pax: (s.paxArr == null && s.paxDep == null) ? '—'
          : (num(s.paxArr) + ' / ' + num(s.paxDep)),
        gndTimeMin: s.gndTimeMin == null ? '—' : num(s.gndTimeMin, { suffix: ' min' }),
        mtowKg: s.mtowKg == null ? '—' : num(s.mtowKg, { suffix: ' kg' })
      };
    });
    content.appendChild(tablePanel('Paradas', 'Onde a aeronave pousa', [
      { key: 'name', label: 'Ponto' },
      { key: 'kind', label: 'Tipo' },
      { key: 'freq', label: 'Freq' },
      { key: 'fuelArrKg', label: 'Comb. cheg.', numeric: true },
      { key: 'fuelDepKg', label: 'Comb. saída', numeric: true },
      { key: 'pax', label: 'Pax (ch/sa)', numeric: true },
      { key: 'gndTimeMin', label: 'Solo', numeric: true },
      { key: 'mtowKg', label: 'MTOW', numeric: true }
    ], stopRows, 'Sem paradas importadas.'));

    // 7) Helideques.
    var helidecks = fp.fpHelidecks || fp.helidecks || [];
    var deckRows = helidecks.map(function (h) {
      return {
        icao: txt(h.icao),
        nome: txt(h.nome),
        elevFt: h.elevFt == null ? '—' : num(h.elevFt, { suffix: ' ft' }),
        dValueM: h.dValueM == null ? '—' : num(h.dValueM, { digits: 1, suffix: ' m' }),
        // maxT vem em toneladas pelo formato do import; se a extração
        // devolver kg (valor grande demais para toneladas), mostra em kg.
        maxT: h.maxT == null ? '—'
          : (Number(h.maxT) >= 100 ? num(h.maxT, { suffix: ' kg' })
            : num(h.maxT, { digits: 1, suffix: ' t' })),
        classe: h.classe == null ? '—' : num(h.classe),
        lat: toDegMin(h.lat, 'lat') || '—',
        lon: toDegMin(h.lon, 'lon') || '—',
        freq: txt(h.freq)
      };
    });
    content.appendChild(tablePanel('Helideques', 'Dados dos destinos offshore', [
      { key: 'icao', label: 'ICAO' },
      { key: 'nome', label: 'Nome' },
      { key: 'elevFt', label: 'Elevação', numeric: true },
      { key: 'dValueM', label: 'D-value', numeric: true },
      { key: 'maxT', label: 'Peso máx.', numeric: true },
      { key: 'classe', label: 'Classe', numeric: true },
      { key: 'lat', label: 'Latitude', numeric: true },
      { key: 'lon', label: 'Longitude', numeric: true },
      { key: 'freq', label: 'Freq' }
    ], deckRows, 'Sem helideques importados.'));

    // 8) Meteorologia.
    var metars = fp.metars || [];
    if (metars.length) {
      var wx = el('section', 'fp-panel');
      var wxHead = el('div', 'fp-panel-head');
      wxHead.appendChild(el('div', 'fp-panel-kicker', 'Condições reportadas'));
      wxHead.appendChild(el('h2', null, 'Meteorologia'));
      wx.appendChild(wxHead);
      metars.forEach(function (m) {
        var card = el('div', 'fp-wx-card');
        var top = el('div', 'fp-wx-top');
        top.appendChild(el('span', 'fp-wx-icao', escapeHtml(txt(m.icao))));
        var meta = [];
        if (m.sr != null || m.ss != null) meta.push('SR ' + txt(m.sr) + ' · SS ' + txt(m.ss));
        if (m.windDirDeg != null || m.windKt != null) {
          meta.push('Vento ' + num(m.windDirDeg, { suffix: '°' }) + ' / ' + num(m.windKt, { suffix: ' kt' }));
        }
        top.appendChild(el('span', 'fp-wx-meta', escapeHtml(meta.join('   '))));
        card.appendChild(top);
        if (m.raw) {
          var raw = el('div', 'fp-wx-block');
          raw.appendChild(el('span', 'fp-wx-tag', 'METAR'));
          raw.appendChild(el('code', 'fp-wx-code', escapeHtml(m.raw)));
          card.appendChild(raw);
        }
        if (m.taf) {
          var taf = el('div', 'fp-wx-block');
          taf.appendChild(el('span', 'fp-wx-tag', 'TAF'));
          taf.appendChild(el('code', 'fp-wx-code', escapeHtml(m.taf)));
          card.appendChild(taf);
        }
        wx.appendChild(card);
      });
      content.appendChild(wx);
    } else {
      content.appendChild(tablePanel('Meteorologia', 'Condições reportadas', [
        { key: 'icao', label: 'ICAO' }
      ], [], 'Sem METAR/TAF importados.'));
    }

    // Rodapé: aviso operacional.
    content.appendChild(el('p', 'fp-note',
      'Tela só de consulta — confira os dados com o Flight Preview oficial antes do voo. ' +
      'Para planejar pesos e combustível, use o Planejamento do Voo.'));
  }

  function init() {
    var fp = readJson(FP_KEY);
    var shared = readJson(SHARED_KEY);
    render(fp, shared);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Se o voo for (re)importado noutra aba/módulo, atualiza ao voltar o foco.
  window.addEventListener('storage', function (e) {
    if (e.key === FP_KEY || e.key === SHARED_KEY) init();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') init();
  });
})();
