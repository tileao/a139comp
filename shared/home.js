const KEY='aw139_companion_shared_context_v1';
const clearBtn=document.getElementById('clearContextBtn');
const resumeCard=document.getElementById('resumeCard');
const resumeTitle=document.getElementById('resumeTitle');
const resumeSummary=document.getElementById('resumeSummary');
const resumeChips=document.getElementById('resumeChips');
const continueText=document.getElementById('continueText');
const continueLink=document.getElementById('continueLink');
const installGuideBtn=document.getElementById('installGuideBtn');
const installStatusText=document.getElementById('installStatusText');

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

function setContinueDisabled(){
  if(!continueLink) return;
  continueLink.classList.add('disabled');
  continueLink.setAttribute('aria-disabled','true');
  continueLink.href='cata/';
}

function setContinueEnabled(href){
  if(!continueLink) return;
  continueLink.classList.remove('disabled');
  continueLink.removeAttribute('aria-disabled');
  continueLink.href=href;
}

function render(){
  const ctx=loadCtx();
  const hasCtx=Object.keys(ctx).length>0;
  if(resumeChips) resumeChips.innerHTML='';

  if(!hasCtx){
    if(resumeTitle) resumeTitle.textContent='Sem contexto salvo';
    if(resumeSummary) resumeSummary.textContent='Abra um fluxo ou módulo para começar.';
    if(continueText) continueText.textContent='Ainda não há uma última sessão salva.';
    setContinueDisabled();
    if(resumeCard) resumeCard.hidden=false;
    return;
  }

  const lastModule=ctx.lastModule||'cata';
  const lastLabel=({wat:'WAT',rto:'RTO',adc:'ADC'})[lastModule]||'Cat A Clear Area';
  if(resumeTitle) resumeTitle.textContent=lastLabel;

  const summaryParts=[];
  if(ctx.adcBase && ctx.adcDepartureEnd) summaryParts.push(`${String(ctx.adcBase).toUpperCase()} ${ctx.adcDepartureEnd}`);
  if(ctx.weightKg!=null) summaryParts.push(`${ctx.weightKg} kg`);
  if(ctx.oatC!=null) summaryParts.push(`${ctx.oatC}°C`);
  if(ctx.headwindKt!=null) summaryParts.push(`${ctx.headwindKt} kt`);
  if(ctx.updatedAt){
    const d=new Date(ctx.updatedAt);
    if(!Number.isNaN(d.getTime())) summaryParts.push(d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}));
  }
  if(resumeSummary) resumeSummary.textContent=summaryParts.length?summaryParts.join(' · '):'Contexto salvo pronto para retomada.';

  const chips=[];
  if(ctx.cataAircraftSet) chips.push(`Aeronave ${ctx.cataAircraftSet}`);
  if(ctx.cataConfiguration) chips.push(labelConfig(ctx.cataConfiguration));
  if(ctx.pressureAltitudeFt!=null) chips.push(`PA ${ctx.pressureAltitudeFt}`);
  if(ctx.oatC!=null) chips.push(`OAT ${ctx.oatC}`);
  if(ctx.weightKg!=null) chips.push(`Peso ${ctx.weightKg}`);
  if(ctx.rtoMeters!=null) chips.push(`RTO ${ctx.rtoMeters} m`);
  chips.slice(0,6).forEach(item=>resumeChips?.appendChild(chip(item)));

  if(continueText) continueText.textContent=`Retomar ${lastLabel} com o último contexto salvo.`;
  setContinueEnabled(routeForModule(lastModule));
  if(resumeCard) resumeCard.hidden=false;
}

clearBtn?.addEventListener('click',()=>{
  localStorage.removeItem(KEY);
  render();
});

render();

installGuideBtn?.addEventListener('click',()=>{
  if (typeof window.showAw139InstallGuide === 'function') window.showAw139InstallGuide();
});
window.addEventListener('aw139-pwa-state',(event)=>{
  const detail=event.detail||{};
  if (!installStatusText) return;
  if (detail.installed){
    installStatusText.textContent='O app já está instalado neste aparelho. Abra pela tela inicial para a melhor experiência.';
    if (installGuideBtn){installGuideBtn.textContent='App instalado';installGuideBtn.disabled=true;installGuideBtn.style.opacity='.7';}
    return;
  }
  if (detail.platform==='ios') installStatusText.textContent='Instale pela Safari em Compartilhar → Adicionar à Tela de Início para usar como app no iPhone e no iPad.';
  else if (detail.platform==='android') installStatusText.textContent='Use a opção Instalar app do navegador para abrir em tela cheia e fixar na tela inicial.';
  else installStatusText.textContent='Instale o app pelo navegador para abrir em tela cheia e acessar as ferramentas mais rápido.';
});
