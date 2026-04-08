(function(){
  const KEY='aw139_companion_shared_context_v1';
  const params = new URLSearchParams(location.search);
  const mod = location.pathname.includes('/wat/') ? 'wat' : location.pathname.includes('/rto/') ? 'rto' : location.pathname.includes('/adc/') ? 'adc' : 'unknown';
  const isEmbed = params.get('embed') === '1';
  const hasBack = params.has('back') || /\/cata\//.test(document.referrer || '');
  const returnUrl = params.get('return');
  function loadCtx(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}} }
  function saveCtx(ctx){ localStorage.setItem(KEY, JSON.stringify({...loadCtx(), ...ctx, updatedAt:new Date().toISOString(), lastModule:mod})); }
  function num(v){ if(v==null) return null; const s=String(v).replace(',', '.').trim(); if(!s) return null; const n=Number(s); return Number.isFinite(n)?n:null; }
  function setIf(id,val){ const el=document.getElementById(id); if(!el || val==null || val==='') return; el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  function setRadio(name,val){ if(val==null || val==='') return; const el=document.querySelector(`input[name="${name}"][value="${val}"]`); if(!el) return; el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true})); }
  function getIf(id){ const el=document.getElementById(id); return el?el.value:null; }
  function mapRtoConfig(v){ return ({standard:'standard', eaps_off:'eapsOff', eaps_on:'eapsOn', ibf:'ibfInstalled'})[v] || v || 'standard'; }
  function applyContext(){
    const ctx=loadCtx();
    if(mod==='wat' || mod==='rto'){
      setIf('pressureAltitude', ctx.pressureAltitudeFt);
      setIf('oat', ctx.oatC);
      setIf('actualWeight', ctx.weightKg);
      setIf('headwind', ctx.headwindKt);
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
      setIf('departureEndSelect', ctx.adcDepartureEnd);
    }
  }
  function captureContext(){
    if(mod==='wat'){
      saveCtx({
        pressureAltitudeFt:num(getIf('pressureAltitude')),
        oatC:num(getIf('oat')),
        weightKg:num(getIf('actualWeight')),
        headwindKt:num(getIf('headwind')),
        cataAircraftSet:(document.querySelector('input[name="aircraftSet"]:checked')||{}).value||'6800',
        cataProcedure:getIf('procedure'),
        cataConfiguration:getIf('configuration'),
        watMaxWeightKg:num((document.getElementById('maxWeight')||{}).textContent?.replace(/[^0-9.-]/g,'')),
        watMarginKg:num((document.getElementById('margin')||{}).textContent?.replace(/[^0-9.-]/g,''))
      });
      alert('Contexto WAT salvo.');
    } else if(mod==='rto'){
      const finalText=(document.getElementById('finalMetric')||{}).textContent||'';
      saveCtx({
        pressureAltitudeFt:num(getIf('pressureAltitude')),
        oatC:num(getIf('oat')),
        weightKg:num(getIf('actualWeight')),
        headwindKt:num(getIf('headwind')),
        cataConfiguration:getIf('configuration'),
        rtoMeters:num(finalText.replace(/[^0-9.-]/g,''))
      });
      alert('Contexto RTO salvo.');
    } else if(mod==='adc'){
      saveCtx({
        rtoMeters:num(getIf('rtoInput')),
        ctoMeters:num(getIf('ctoInput')),
        adcBase:(document.getElementById('baseSelect')||{}).value||null,
        adcDepartureEnd:(document.getElementById('departureEndSelect')||{}).value||null
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
  window.addEventListener('DOMContentLoaded',()=>{ applyContext(); addBar(); });
})();