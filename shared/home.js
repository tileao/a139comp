const KEY='aw139_companion_shared_context_v1';
const clearBtn=document.getElementById('clearContextBtn');
const resumeTitle=document.getElementById('resumeTitle');
const resumeSummary=document.getElementById('resumeSummary');
const resumeChips=document.getElementById('resumeChips');
const continueText=document.getElementById('continueText');
const continueLink=document.getElementById('continueLink');
const continueLinkHero=document.getElementById('continueLinkHero');
const preferenceList=document.getElementById('preferenceList');

function loadCtx(){
  try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}
}

function chip(text, cls='chip'){
  const el=document.createElement('span');
  el.className=cls;
  el.textContent=text;
  return el;
}

function routeForModule(lastModule){
  if(lastModule==='wat') return 'wat/?back=1&return=../index.html';
  if(lastModule==='rto') return 'rto/?back=1&return=../index.html';
  if(lastModule==='adc') return 'adc/?back=1&return=../index.html';
  return 'cata/';
}

function labelConfig(v){
  const map={standard:'Clean Air Intake',eaps_off:'EAPS OFF',eaps_on:'EAPS ON',ibf:'IBF'};
  return map[v]||String(v||'').toUpperCase();
}

function syncContinueLink(link, enabled, href){
  if(!link) return;
  link.href=href;
  if(enabled){
    link.classList.remove('disabled');
    link.removeAttribute('aria-disabled');
  }else{
    link.classList.add('disabled');
    link.setAttribute('aria-disabled','true');
  }
}

function renderPreferences(ctx){
  preferenceList.innerHTML='';
  const prefs=[];
  if(ctx.cataAircraftSet) prefs.push(`Aeronave ${ctx.cataAircraftSet}`);
  if(ctx.cataConfiguration) prefs.push(`Config ${labelConfig(ctx.cataConfiguration)}`);
  if(ctx.adcBase) prefs.push(`Base ${String(ctx.adcBase).toUpperCase()}`);
  if(ctx.adcDepartureEnd) prefs.push(`Cabeceira ${ctx.adcDepartureEnd}`);
  if(!prefs.length){
    preferenceList.innerHTML='<span class="empty-state">Sem preferências detectadas ainda.</span>';
    return;
  }
  prefs.slice(0,6).forEach(item=>preferenceList.appendChild(chip(item,'pref-chip')));
}

function render(){
  const ctx=loadCtx();
  const hasCtx=Object.keys(ctx).length>0;
  resumeChips.innerHTML='';

  if(!hasCtx){
    resumeTitle.textContent='Sem contexto salvo';
    resumeSummary.textContent='Abra o fluxo principal ou um módulo para começar.';
    continueText.textContent='Ainda não há um último módulo salvo.';
    syncContinueLink(continueLink,false,'cata/');
    syncContinueLink(continueLinkHero,false,'cata/');
    renderPreferences(ctx);
    return;
  }

  const lastModule=ctx.lastModule||'cata';
  const lastLabel=({wat:'WAT',rto:'RTO',adc:'ADC'})[lastModule]||'CAT A Clear Area';
  resumeTitle.textContent=lastLabel;

  const summaryParts=[];
  if(ctx.adcBase && ctx.adcDepartureEnd) summaryParts.push(`${String(ctx.adcBase).toUpperCase()} ${ctx.adcDepartureEnd}`);
  if(ctx.weightKg!=null) summaryParts.push(`${ctx.weightKg} kg`);
  if(ctx.oatC!=null) summaryParts.push(`${ctx.oatC}°C`);
  if(ctx.headwindKt!=null) summaryParts.push(`${ctx.headwindKt} kt`);
  if(ctx.updatedAt){
    const d=new Date(ctx.updatedAt);
    if(!Number.isNaN(d.getTime())) summaryParts.push(d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}));
  }
  resumeSummary.textContent=summaryParts.length?summaryParts.join(' · '):'Contexto salvo pronto para retomada.';

  if(ctx.cataAircraftSet) resumeChips.appendChild(chip(`Aeronave ${ctx.cataAircraftSet}`));
  if(ctx.cataConfiguration) resumeChips.appendChild(chip(labelConfig(ctx.cataConfiguration)));
  if(ctx.pressureAltitudeFt!=null) resumeChips.appendChild(chip(`PA ${ctx.pressureAltitudeFt}`));
  if(ctx.oatC!=null) resumeChips.appendChild(chip(`OAT ${ctx.oatC}`));
  if(ctx.weightKg!=null) resumeChips.appendChild(chip(`Peso ${ctx.weightKg}`));
  if(ctx.rtoMeters!=null) resumeChips.appendChild(chip(`RTO ${ctx.rtoMeters} m`));

  const targetHref=routeForModule(lastModule);
  continueText.textContent=`Retomar ${lastLabel} com o último contexto salvo.`;
  syncContinueLink(continueLink,true,targetHref);
  syncContinueLink(continueLinkHero,true,targetHref);

  renderPreferences(ctx);
}

clearBtn?.addEventListener('click',()=>{
  localStorage.removeItem(KEY);
  render();
});

render();
