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
  function addRouteStrip(){
    const cfg=STRIP_CONFIG[mod];
    if(!cfg) return;
    const legs=loadCtx().pesoPernas;
    const hasLegs=Array.isArray(legs) && legs.length>0;
    const isArr=cfg.kind==='arr';
    const strip=document.createElement('div');
    strip.id='pesoRouteStrip';
    // Sem voo publicado, a faixa vira um aviso com atalho — assim dá para
    // ver que a integração está ativa mesmo antes do primeiro cálculo.
    strip.innerHTML=`<span class="strip-label">${isArr?'Pouso':'Decolagem'} (Pesos)</span>`+(hasLegs
      ? legs.map((l,i)=>
          `<button type="button" data-leg="${i}" title="Perna ${l.perna}: ${l.origem} → ${l.destino}">${isArr?l.destino:l.origem}<small>${Math.round(isArr?l.lw:l.tow).toLocaleString('pt-BR')} kg</small></button>`
        ).join('')
      : '<span class="strip-hint">Sem voo publicado — calcule a rota no Pesos.</span><a class="strip-open" href="../pesos/?embed=1&back=1">Abrir Pesos</a>');
    const style=document.createElement('style');
    style.textContent=`
      #pesoRouteStrip{display:flex;align-items:center;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:calc(8px + env(safe-area-inset-top, 0px)) 12px 0;padding:8px 12px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.24);backdrop-filter:blur(12px)}
      #pesoRouteStrip::-webkit-scrollbar{display:none}
      #pesoRouteStrip .strip-label{flex:none;font:800 10px Inter,-apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9db0c4}
      #pesoRouteStrip button{flex:none;width:auto;min-height:40px;display:grid;justify-items:center;align-content:center;gap:1px;border:1px solid rgba(148,163,184,.22);background:#1b2836;color:#e5eef8;border-radius:12px;padding:5px 14px;font:700 13px Inter,-apple-system,sans-serif;cursor:pointer;line-height:1.15}
      #pesoRouteStrip button small{font-size:10px;font-weight:600;color:#9db0c4}
      #pesoRouteStrip button.active{border-color:rgba(70,194,186,.65);background:rgba(70,194,186,.14)}
      #pesoRouteStrip button.active small{color:#46c2ba}
      #pesoRouteStrip .strip-hint{flex:none;font:600 12px Inter,-apple-system,sans-serif;color:#9db0c4}
      #pesoRouteStrip .strip-open{flex:none;min-height:40px;display:grid;place-items:center;border:1px solid rgba(70,194,186,.45);background:rgba(70,194,186,.12);color:#a9e6e2;text-decoration:none;border-radius:12px;padding:5px 14px;font:700 13px Inter,-apple-system,sans-serif}
    `;
    document.head.appendChild(style);
    strip.addEventListener('click',(e)=>{
      const btn=e.target.closest('button[data-leg]');
      if(!btn) return;
      const i=Number(btn.dataset.leg);
      const l=legs[i];
      if(cfg.unitId) setIf(cfg.unitId, 'kg');
      setIf(cfg.weightId, isArr ? l.lw : l.tow);
      const wx=isArr ? l.weather : (i>0 ? legs[i-1].weather : (l.weatherOrigem || null));
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
      strip.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b===btn));
    });
    // No topo do body, antes do shell: os shells são grids com
    // grid-template-areas, e um filho extra cairia numa linha implícita
    // lá no fim da página.
    document.body.insertBefore(strip, document.body.firstChild);
  }
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