(function(){
  const KEY='aw139_companion_shared_context_v1';
  const params = new URLSearchParams(location.search);
  const mod = location.pathname.includes('/wat/') ? 'wat'
    : location.pathname.includes('/rto/') ? 'rto'
    : location.pathname.includes('/adc/') ? 'adc'
    : location.pathname.includes('/cata/') ? 'cata'
    : location.pathname.includes('/pouso-offshore/') ? 'pouso-offshore'
    : location.pathname.includes('/decolagem-offshore/') ? 'decolagem-offshore'
    : 'unknown';
  const isEmbed = params.get('embed') === '1';
  const hasBack = params.has('back') || /\/cata\//.test(document.referrer || '');
  const returnUrl = params.get('return');
  function loadCtx(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}} }
  function saveCtx(ctx){ localStorage.setItem(KEY, JSON.stringify({...loadCtx(), ...ctx, updatedAt:new Date().toISOString(), lastModule:mod})); }
  function num(v){ if(v==null) return null; const s=String(v).replace(',', '.').trim(); if(!s) return null; const n=Number(s); return Number.isFinite(n)?n:null; }
  // Números exibidos em pt-BR usam "." como separador de milhar (ex.: "6.800 kg").
  // Extrair dígitos com um replace ingênuo trataria o ponto como decimal (6.8);
  // aqui removemos o ponto de milhar antes de converter vírgula decimal, se houver.
  function numFromLocaleText(text){
    if(text==null) return null;
    let s=String(text).replace(/[^0-9.,-]/g,'').trim();
    if(!s) return null;
    if(s.indexOf(',')!==-1) s=s.replace(/\./g,'').replace(',', '.');
    else s=s.replace(/\./g,'');
    const n=Number(s);
    return Number.isFinite(n)?n:null;
  }
  function setIf(id,val){ const el=document.getElementById(id); if(!el || val==null || val==='') return; el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  function setSelectByDeparture(id, token, dep){ const el=document.getElementById(id); if(!el) return false; const rawToken=token==null?'':String(token).trim(); const rawDep=dep==null?'':String(dep).trim(); let opt=rawToken?[...el.options].find(o=>o.value===rawToken):null; if(!opt && rawDep) opt=[...el.options].find(o=>String(o.value||'').split('::')[1]===rawDep || String(o.textContent||'').trim()===rawDep); if(!opt) return false; el.value=opt.value; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true; }
  function setRadio(name,val){ if(val==null || val==='') return; const el=document.querySelector(`input[name="${name}"][value="${val}"]`); if(!el) return; el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true})); }
  function getIf(id){ const el=document.getElementById(id); return el?el.value:null; }
  function mapRtoConfig(v){ return ({standard:'standard', eaps_off:'eapsOff', eaps_on:'eapsOn', ibf:'ibfInstalled'})[v] || v || 'standard'; }
  // Weather do módulo Pesos (pesoWeatherPorPerna) na perna crítica (pesoPernaCritica),
  // usado como sugestão de OAT/vento quando o WAT/RTO ainda não têm valor próprio.
  function pesoCriticalWeather(ctx){
    const list=ctx.pesoWeatherPorPerna;
    if(!Array.isArray(list) || !list.length) return null;
    const idx=(ctx.pesoPernaCritica!=null ? ctx.pesoPernaCritica-1 : 0);
    const entry=list[idx] || list[0];
    return (entry && entry.weather) || null;
  }
  function applyContext(){
    const ctx=loadCtx();
    if(mod==='wat' || mod==='rto'){
      const wx=pesoCriticalWeather(ctx);
      const wxTempC=wx && wx.temperatura!=null ? num(wx.temperatura) : null;
      const wxWindKt=wx && wx.vento ? num(String(wx.vento).split('/')[1]) : null;
      setIf('pressureAltitude', ctx.pressureAltitudeFt);
      setIf('oat', ctx.oatC!=null ? ctx.oatC : wxTempC);
      setIf('actualWeight', ctx.weightKg);
      setIf('headwind', ctx.headwindKt!=null ? ctx.headwindKt : wxWindKt);
    }
    if(mod==='wat'){
      setRadio('aircraftSet', ctx.cataAircraftSet || '6800');
      setIf('procedure', ctx.cataProcedure || 'clear');
      setIf('configuration', ctx.cataConfiguration || 'standard');
    }
    if(mod==='rto'){
      setIf('configuration', mapRtoConfig(ctx.cataConfiguration));
    }
    if(mod==='adc'){
      setIf('rtoInput', ctx.rtoMeters);
      setIf('ctoInput', ctx.ctoMeters);
      setIf('baseSelect', ctx.adcBase);
      if(!setSelectByDeparture('departureEndSelect', ctx.adcDepartureToken, ctx.adcDepartureEnd)){
        setIf('departureEndSelect', ctx.adcDepartureToken || ctx.adcDepartureEnd);
      }
    }
  }
  function captureContext(opts){
    const silent = !!(opts && opts.silent);
    if(mod==='wat'){
      const maxWeightKg=numFromLocaleText((document.getElementById('maxWeight')||{}).textContent);
      if(maxWeightKg==null) return; // nada calculado ainda
      saveCtx({
        pressureAltitudeFt:num(getIf('pressureAltitude')),
        oatC:num(getIf('oat')),
        weightKg:num(getIf('actualWeight')),
        headwindKt:num(getIf('headwind')),
        cataAircraftSet:(document.querySelector('input[name="aircraftSet"]:checked')||{}).value||'6800',
        cataProcedure:getIf('procedure'),
        cataConfiguration:getIf('configuration'),
        watMaxWeightKg:maxWeightKg,
        watMarginKg:numFromLocaleText((document.getElementById('margin')||{}).textContent)
      });
      if(!silent) alert('Contexto WAT salvo.');
    } else if(mod==='rto'){
      const rtoMeters=numFromLocaleText((document.getElementById('finalMetric')||{}).textContent);
      if(rtoMeters==null) return; // nada calculado ainda
      saveCtx({
        pressureAltitudeFt:num(getIf('pressureAltitude')),
        oatC:num(getIf('oat')),
        weightKg:num(getIf('actualWeight')),
        headwindKt:num(getIf('headwind')),
        cataConfiguration:getIf('configuration'),
        rtoMeters
      });
      if(!silent) alert('Contexto RTO salvo.');
    } else if(mod==='adc'){
      const depSelect=document.getElementById('departureEndSelect');
      const depToken=(depSelect||{}).value||null;
      const depEnd=String(depToken||'').split('::')[1] || depToken;
      saveCtx({
        rtoMeters:num(getIf('rtoInput')),
        ctoMeters:num(getIf('ctoInput')),
        adcBase:(document.getElementById('baseSelect')||{}).value||null,
        adcDepartureToken:depToken,
        adcDepartureEnd:depEnd || null
      });
      alert('Contexto ADC salvo.');
    }
  }
  function writeAdcInbox(){
    const ctx=loadCtx();
    const inbox={rto: ctx.rtoMeters ?? num(getIf('rtoInput')), cto: ctx.ctoMeters ?? num(getIf('ctoInput'))};
    localStorage.setItem('aw139_adc_inbox_v1', JSON.stringify(inbox));
    alert('Inbox do ADC atualizado.');
  }
  function goBack(){
    if(returnUrl) location.href = returnUrl;
    else if(history.length > 1) history.back();
    else location.href = '../cata/';
  }
  function addBar(){
    if(isEmbed) return;
    // Só nos módulos que sempre tiveram a barra da ponte (voltar/home no
    // topbar). Nos demais, a navegação fica com a barra global do app.
    if(mod!=='wat' && mod!=='rto' && mod!=='adc') return;
    const slot=document.querySelector('.topbar-right, .appbar-right');
    const isTopbarMode=!!slot;
    const bar=document.createElement('div');
    bar.id='integrationBridgeBar';
    bar.className = isTopbarMode ? 'bridge-topbar' : (hasBack ? 'bridge-inline' : 'bridge-floating');
    if (isTopbarMode) {
      bar.innerHTML=`${hasBack?'<button type="button" data-act="back" aria-label="Voltar">←</button>':''}<a href="../index.html" aria-label="Home">⌂</a>`;
    } else {
      bar.innerHTML=`${hasBack?'<button type="button" data-act="back">Voltar</button>':''}<a href="../index.html">Home</a>`;
    }
    const style=document.createElement('style');
    style.textContent=`
      #integrationBridgeBar{display:flex;gap:8px;flex-wrap:wrap;max-width:min(96vw,720px);padding:0;border-radius:14px;background:transparent;border:0;box-shadow:none}
      #integrationBridgeBar a,#integrationBridgeBar button{border:1px solid rgba(255,255,255,.12);background:#243447;color:#e5eef8;text-decoration:none;padding:8px 10px;border-radius:10px;font:700 12px Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;cursor:pointer;line-height:1.2}
      #integrationBridgeBar.bridge-topbar a,#integrationBridgeBar.bridge-topbar button{width:34px;height:34px;padding:0;border-radius:10px;display:grid;place-items:center;font-size:18px;font-weight:800}
      #integrationBridgeBar button:hover,#integrationBridgeBar a:hover{border-color:rgba(70,194,186,.55);box-shadow:0 0 0 3px rgba(47,167,160,.12)}
      #integrationBridgeBar.bridge-floating{position:fixed;right:14px;bottom:14px;z-index:99999;background:rgba(5,10,18,.92);padding:10px;border-radius:14px;border:1px solid rgba(148,163,184,.18);box-shadow:0 12px 32px rgba(0,0,0,.28)}
      #integrationBridgeBar.bridge-inline{position:relative;z-index:20;margin:12px auto 0;justify-content:center}
      #integrationBridgeBar.bridge-topbar{align-items:center;justify-content:flex-end;max-width:none}
      body.bridge-with-inline{padding-top:0!important}
      @media (max-width: 900px){#integrationBridgeBar.bridge-inline{max-width:calc(100vw - 20px);margin-top:10px} #integrationBridgeBar.bridge-topbar{width:100%;justify-content:flex-end}}
      @media (max-width: 640px){#integrationBridgeBar.bridge-topbar a,#integrationBridgeBar.bridge-topbar button{padding:7px 9px;font-size:11px}}
    `;
    document.head.appendChild(style);
    if(isTopbarMode){
      slot.appendChild(bar);
    } else if(hasBack){
      document.body.classList.add('bridge-with-inline');
      document.body.insertBefore(bar, document.body.firstChild);
    } else {
      document.body.appendChild(bar);
    }
    bar.addEventListener('click',(e)=>{ const act=e.target?.dataset?.act; if(!act) return; if(act==='load') applyContext(); if(act==='save') captureContext(); if(act==='inbox') writeAdcInbox(); if(act==='back') goBack();});
  }
  // Faixa com as localidades da rota do módulo Pesos: um botão por perna.
  // Módulos de DECOLAGEM (wat/rto/cata/decolagem-offshore) listam as origens
  // (peso = TOW; wx = o registrado na chegada àquela localidade — o wx de
  // cada perna no Pesos é o do destino/pouso — ou o "WX dec." na 1ª perna).
  // Módulos de POUSO (pouso-offshore) listam os destinos (peso = LW; wx = o
  // da própria perna).
  const STRIP_CONFIG={
    wat: { kind:'dep', weightId:'actualWeight', oatId:'oat', windId:'headwind' },
    rto: { kind:'dep', weightId:'actualWeight', oatId:'oat', windId:'headwind' },
    cata:{ kind:'dep', weightId:'actualWeight', oatId:'oat', qnhId:'qnh', windDirId:'windDir', windSpeedId:'windSpeed' },
    'decolagem-offshore': { kind:'dep', weightId:'weight', oatId:'oat', qnhId:'qnh', windId:'wind', unitId:'weightUnit' },
    'pouso-offshore':     { kind:'arr', weightId:'weight', oatId:'oat', qnhId:'qnh', windId:'wind', unitId:'weightUnit' }
  };
  // Cat A: além de peso/wx, seleciona a base (carta ADC) pela localidade do
  // chip e sugere a cabeceira em uso pelo vento (maior componente de proa,
  // proa magnética = número da cabeceira × 10). O Cat A espelha os selects
  // do ADC por iframe, então a cabeceira é aplicada quando as opções da
  // base terminam de sincronizar.
  function importCataBaseRunway(loc, wx){
    const baseSel=document.getElementById('baseSelect');
    const depSel=document.getElementById('departureEndSelect');
    if(!baseSel || !depSel) return;
    const locUp=String(loc||'').trim().toUpperCase();
    const opt=[...baseSel.options].find(o=>String(o.value).trim().toUpperCase()===locUp || String(o.textContent).trim().toUpperCase().indexOf(locUp)===0);
    if(!opt) return; // origem não é uma base do Cat A (ex.: decolagem de UM)
    const baseChanged=baseSel.value!==opt.value;
    const depSnapshot=depSel.innerHTML;
    if(baseChanged){
      baseSel.value=opt.value;
      baseSel.dispatchEvent(new Event('input',{bubbles:true}));
      baseSel.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const dirKt=wx && wx.vento ? String(wx.vento).split('/') : null;
    const dir=dirKt?num(dirKt[0]):null;
    const kt=dirKt?num(dirKt[1]):null;
    if(dir==null || !kt) return; // sem vento, fica a cabeceira padrão da base
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const ready=!baseChanged || depSel.innerHTML!==depSnapshot || tries>25;
      if(!ready){ if(tries>30) clearInterval(timer); return; }
      const cands=[...depSel.options].map(o=>{
        const end=String(o.value||'').split('::')[1] || String(o.textContent||'').trim();
        const m=/^(\d{2})/.exec(String(end).trim());
        return m ? { o, hdg:Number(m[1])*10 } : null;
      }).filter(Boolean);
      if(!cands.length){ if(tries>30) clearInterval(timer); return; }
      let best=null, bestHw=-Infinity;
      cands.forEach(c=>{
        const hw=kt*Math.cos((dir-c.hdg)*Math.PI/180);
        if(hw>bestHw){ bestHw=hw; best=c; }
      });
      if(best && depSel.value!==best.o.value){
        depSel.value=best.o.value;
        depSel.dispatchEvent(new Event('input',{bubbles:true}));
        depSel.dispatchEvent(new Event('change',{bubbles:true}));
      }
      clearInterval(timer);
    },200);
  }
  // ---- Faixa da rota: estado persistido -----------------------------------
  // A perna escolhida e os valores que a faixa aplicou ficam guardados por
  // módulo. Assim a escolha sobrevive à navegação, e dá para saber se o
  // piloto editou um campo à mão depois (nesse caso não sobrescrevemos).
  const SEL_KEY='aw139_strip_sel_v1_'+mod;
  const APPLIED_KEY='aw139_strip_applied_v1_'+mod;
  function loadJson(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
  function saveJson(k,v){ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
  // Muda quando o voo é reimportado ou o Planejamento recalcula a rota.
  function ctxSignature(ctx){
    return [ctx.updatedAt||'', ctx.fpImportedAt||'', (ctx.pesoPernas||[]).length].join('|');
  }
  function stripFieldIds(cfg){
    return [cfg.weightId,cfg.oatId,cfg.qnhId,cfg.windId,cfg.windDirId,cfg.windSpeedId].filter(Boolean);
  }
  function readFields(cfg){
    const out={};
    stripFieldIds(cfg).forEach(id=>{ const el=document.getElementById(id); if(el) out[id]=String(el.value==null?'':el.value); });
    return out;
  }
  // "Intocado" = os campos ainda estão exatamente como a faixa os deixou.
  function fieldsUntouched(cfg,applied){
    if(!applied || !applied.values) return false;
    const now=readFields(cfg);
    return Object.keys(applied.values).every(id=>now[id]===applied.values[id]);
  }
  function applyLeg(cfg,legs,i,sig){
    const l=legs[i];
    if(!l) return;
    const isArr=cfg.kind==='arr';
    if(cfg.unitId) setIf(cfg.unitId,'kg');
    setIf(cfg.weightId, isArr ? l.lw : l.tow);
    // Decolagem: override do piloto (weatherOrigem) tem prioridade; senão
    // herda o pouso da perna anterior (mesma localidade).
    const wx=isArr ? l.weather : (l.weatherOrigem || (i>0 ? legs[i-1].weather : null));
    if(wx){
      if(cfg.oatId && wx.temperatura!=null && wx.temperatura!=='') setIf(cfg.oatId, num(wx.temperatura));
      if(cfg.qnhId && wx.qnh) setIf(cfg.qnhId, num(wx.qnh));
      if(wx.vento){
        const parts=String(wx.vento).split('/');
        const dir=num(parts[0]), kt=num(parts[1]);
        if(cfg.windId && kt!=null) setIf(cfg.windId, kt);
        if(cfg.windDirId && dir!=null) setIf(cfg.windDirId, dir);
        if(cfg.windSpeedId && kt!=null) setIf(cfg.windSpeedId, kt);
      }
    }
    if(mod==='cata') importCataBaseRunway(l.origem, wx);
    saveJson(SEL_KEY,{perna:l.perna, loc:isArr?l.destino:l.origem});
    saveJson(APPLIED_KEY,{sig:sig, values:readFields(cfg)});
  }
  // Reencontra a perna escolhida depois que a rota mudou: casa pelo número
  // da perna + localidade e, se a rota encolheu/mudou, cai fora em vez de
  // aplicar valores de outra localidade.
  function findSelected(cfg,legs){
    const sel=loadJson(SEL_KEY);
    if(!sel || !Array.isArray(legs)) return -1;
    const isArr=cfg.kind==='arr';
    const locOf=l=>isArr?l.destino:l.origem;
    let i=legs.findIndex(l=>l.perna===sel.perna && locOf(l)===sel.loc);
    if(i<0) i=legs.findIndex(l=>locOf(l)===sel.loc);
    return i;
  }
  let stripEl=null;
  function renderStrip(){
    const cfg=STRIP_CONFIG[mod];
    if(!cfg || !stripEl) return;
    const ctx=loadCtx();
    const legs=ctx.pesoPernas;
    const hasLegs=Array.isArray(legs) && legs.length>0;
    const isArr=cfg.kind==='arr';
    const sig=ctxSignature(ctx);
    const selIdx=hasLegs?findSelected(cfg,legs):-1;

    // Sem voo publicado, a faixa vira um aviso com atalho — assim dá para
    // ver que a integração está ativa mesmo antes do primeiro cálculo.
    stripEl.innerHTML=`<span class="strip-label">${isArr?'Pouso':'Decolagem'} (Voo)</span>`
      +`<div class="strip-legs">`+(hasLegs
        ? legs.map((l,i)=>
            `<button type="button" data-leg="${i}" class="${i===selIdx?'active':''}" title="Perna ${l.perna}: ${l.origem} → ${l.destino}">${isArr?l.destino:l.origem}<small>${Math.round(isArr?l.lw:l.tow).toLocaleString('pt-BR')} kg</small></button>`
          ).join('')
        : '<span class="strip-hint">Sem voo publicado — calcule a rota no Planejamento do Voo.</span><a class="strip-open" href="../pesos/?embed=1&back=1">Abrir Planejamento</a>')
      +`</div>`
      +`<button type="button" class="strip-refresh" data-act="refresh" title="Atualizar com os dados do voo" aria-label="Atualizar com os dados do voo">↻</button>`;

    if(selIdx<0) return;
    const applied=loadJson(APPLIED_KEY);
    if(fieldsUntouched(cfg,applied)){
      // Campos ainda são os que a faixa pôs: pode atualizar sozinho.
      if(!applied || applied.sig!==sig) applyLeg(cfg,legs,selIdx,sig);
    } else if(!applied || applied.sig!==sig){
      // O piloto mexeu à mão E o voo mudou: não sobrescreve na marra —
      // acende o botão para ele decidir.
      const btn=stripEl.querySelector('.strip-refresh');
      if(btn){ btn.classList.add('has-update'); btn.title='Os dados do voo mudaram — tocar para atualizar'; }
    }
  }
  function addRouteStrip(){
    const cfg=STRIP_CONFIG[mod];
    if(!cfg) return;
    const style=document.createElement('style');
    style.textContent=`
      #pesoRouteStrip{display:flex;align-items:center;gap:8px;margin:calc(8px + env(safe-area-inset-top, 0px)) 12px 0;padding:8px 12px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.24);backdrop-filter:blur(12px)}
      #pesoRouteStrip .strip-legs{display:flex;align-items:center;gap:8px;flex:1;min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      #pesoRouteStrip .strip-legs::-webkit-scrollbar{display:none}
      #pesoRouteStrip .strip-label{flex:none;font:800 10px Inter,-apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9db0c4}
      #pesoRouteStrip button{flex:none;width:auto;min-height:40px;display:grid;justify-items:center;align-content:center;gap:1px;border:1px solid rgba(148,163,184,.22);background:#1b2836;color:#e5eef8;border-radius:12px;padding:5px 14px;font:700 13px Inter,-apple-system,sans-serif;cursor:pointer;line-height:1.15}
      #pesoRouteStrip button small{font-size:10px;font-weight:600;color:#9db0c4}
      #pesoRouteStrip button.active{border-color:rgba(70,194,186,.65);background:rgba(70,194,186,.14)}
      #pesoRouteStrip button.active small{color:#46c2ba}
      #pesoRouteStrip .strip-hint{flex:none;font:600 12px Inter,-apple-system,sans-serif;color:#9db0c4}
      #pesoRouteStrip .strip-open{flex:none;min-height:40px;display:grid;place-items:center;border:1px solid rgba(70,194,186,.45);background:rgba(70,194,186,.12);color:#a9e6e2;text-decoration:none;border-radius:12px;padding:5px 14px;font:700 13px Inter,-apple-system,sans-serif}
      #pesoRouteStrip .strip-refresh{flex:none;width:40px;padding:0;font-size:17px;color:#9db0c4}
      #pesoRouteStrip .strip-refresh.has-update{border-color:rgba(240,178,58,.6);background:rgba(240,178,58,.14);color:#f0b23a}
    `;
    document.head.appendChild(style);
    stripEl=document.createElement('div');
    stripEl.id='pesoRouteStrip';
    stripEl.addEventListener('click',(e)=>{
      const ctx=loadCtx();
      const legs=ctx.pesoPernas;
      const sig=ctxSignature(ctx);
      if(e.target.closest('.strip-refresh')){
        // Botão atualizar: relê o contexto e reaplica a perna escolhida,
        // mesmo que os campos tenham sido editados à mão.
        renderStrip();
        if(Array.isArray(legs) && legs.length){
          const i=findSelected(cfg,legs);
          if(i>=0){ applyLeg(cfg,legs,i,sig); renderStrip(); }
        }
        return;
      }
      const btn=e.target.closest('button[data-leg]');
      if(!btn || !Array.isArray(legs)) return;
      applyLeg(cfg,legs,Number(btn.dataset.leg),sig);
      renderStrip();
    });
    // No topo do body, antes do shell: os shells são grids com
    // grid-template-areas, e um filho extra cairia numa linha implícita
    // lá no fim da página.
    document.body.insertBefore(stripEl, document.body.firstChild);
    renderStrip();
  }
  // A faixa era montada só no DOMContentLoaded. No PWA do iOS, voltar para
  // uma página já visitada a restaura do bfcache — o evento não dispara de
  // novo e a faixa ficava com os pesos do voo anterior até "furar" o cache
  // navegando várias vezes. Estes gatilhos cobrem os caminhos reais de volta
  // ao módulo: bfcache (pageshow), app voltando ao primeiro plano
  // (visibilitychange/focus) e gravação vinda de outra aba (storage).
  // Só a faixa. O applyContext() continua rodando uma vez, no carregamento:
  // ele escreve direto nos campos do WAT/RTO/ADC sem checar se o piloto
  // editou algo à mão, então repeti-lo a cada volta ao primeiro plano
  // apagaria valores digitados. A faixa tem essa proteção; o applyContext não.
  function refreshFromContext(){ renderStrip(); }
  window.addEventListener('pageshow',(e)=>{ if(e.persisted) refreshFromContext(); });
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') refreshFromContext(); });
  window.addEventListener('focus',refreshFromContext);
  window.addEventListener('storage',(e)=>{ if(e.key===KEY) refreshFromContext(); });
  // Grava automaticamente no contexto compartilhado sempre que o WAT/RTO
  // terminam um cálculo (sem exigir clique manual em "salvar"), para que o
  // watMaxWeightKg apareça na tabela do módulo Pesos assim que disponível.
  function autoSaveOnResult(){
    const targetId = mod==='wat' ? 'maxWeight' : mod==='rto' ? 'finalMetric' : null;
    if(!targetId) return;
    const target=document.getElementById(targetId);
    if(!target) return;
    let timer=null;
    const trigger=()=>{ clearTimeout(timer); timer=setTimeout(()=>captureContext({silent:true}), 250); };
    new MutationObserver(trigger).observe(target, { childList:true, characterData:true, subtree:true });
    trigger();
  }
  window.addEventListener('DOMContentLoaded',()=>{ applyContext(); addBar(); addRouteStrip(); autoSaveOnResult(); });
})();