const $=id=>document.getElementById(id);
_loadConfinedDataFrom('../wat/data/');
const KG_TO_LB=2.2046226218;
function isLbUnit(){return $('weightUnit')?.value==='lb';}
function parseWeightKg(){const r=Number($('weight').value||0);return isLbUnit()?r/KG_TO_LB:r;}
function fmtWt(kg){return isLbUnit()?`${Math.round(kg*KG_TO_LB)} lb`:`${kg} kg`;}
function updateWeightUi(){const lb=isLbUnit();const lbl=$('weightLabel');if(lbl)lbl.textContent=`Weight (${lb?'lb':'kg'})`;$('weight').placeholder=lb?'14330':'6500';}
const state={};
function calcPA(qnh,elev){const q=(qnh>=800&&qnh<=1100)?qnh:1013.25;return Math.round(elev+(1013.25-q)*30);}
function mapCfg(cfg){return cfg==='eaps_off'?'eapsOff':cfg==='eaps_on'?'eapsOn':'standard';}
function activeTab(){return document.querySelector('.viewer-tab.active')?.dataset.tab;}
function showTab(tab){
  $('watCanvas').style.display=tab==='wat'?'':'none';
  $('ddCanvas').style.display=tab==='dropdown'?'':'none';
  $('vizTitle').textContent=tab==='wat'?'WAT Offshore':'Dropdown Offshore';
  if(tab==='dropdown')requestAnimationFrame(()=>requestAnimationFrame(drawDD));
  else if(tab==='wat')requestAnimationFrame(()=>requestAnimationFrame(drawWAT));
}
function drawDD(){drawDDV7Canvas($('ddCanvas'),state.last?.ddResult,'../dropdown/assets/');}
function drawWAT(){drawWATCanvas($('watCanvas'),state.last?.watResult,'../wat/',false);}
function calc(){
  const qnh=Number($('qnh').value),elev=Number($('elevation').value||0),pa=calcPA(qnh,elev);
  const oat=Number($('oat').value||0),wRaw=Number($('weight').value||0),w=isLbUnit()?wRaw/KG_TO_LB:wRaw,hw=Number($('wind').value||0);
  const ac=Number($('aircraft').value||7000),proc=$('procedure').value,cfg=$('config').value;
  let wat;
  if(proc==='enhanced'){
    if(cfg==='eaps_off')wat=calculateEnhancedEapsOff(pa,oat,w);
    else if(cfg==='eaps_on')wat=calculateEnhancedEapsOn(pa,oat,w);
    else if(cfg==='ibf')wat=calculateEnhancedIbf(pa,oat,w);
    else wat=calculateEnhancedStandard(pa,oat,w);
  }else if(proc==='confined'){
    if(cfg==='eaps_off')wat=calculateExactConfinedEapsOff(pa,oat,w);
    else if(cfg==='eaps_on')wat=calculateExactConfinedEapsOn(pa,oat,w);
    else if(cfg==='ibf')wat=calculateExactConfinedIbf(pa,oat,w);
    else wat=calculateExactConfinedStandard(pa,oat,w);
  }else{
    if(cfg==='eaps_off')wat=calculateExactEapsOff(pa,oat,w,hw);
    else if(cfg==='eaps_on')wat=calculateExactEapsOn(pa,oat,w,hw);
    else if(cfg==='ibf')wat=calculateExactIbfInstalled(pa,oat,w,hw);
    else wat=calculateExactOffshoreStandard(pa,oat,w,hw);
  }
  if(wat.error){state.last={error:wat.error,proc,cfg,qnh,elev,pa,oat,w,hw,ac,watResult:null,ddResult:null};render();return;}
  let ddResult=null;
  try{
    if(proc!=='confined')ddResult=proc==='enhanced'?calculateEnhancedDropdown(pa,oat,w,hw):calculateOffshoreDropdown(pa,oat,w,hw,'offshore',mapCfg(cfg));
  }catch(e){}
  const maxWeight=wat.maxWeight,margin=Math.round(maxWeight-w),ok=margin>=0;
  const dropdown=ddResult?Math.round(ddResult.finalFt):null;
  state.last={qnh,elev,pa,oat,w,wRaw,hw,ac,proc,cfg,wat:maxWeight,watResult:wat,dropdown,margin,ok,ddResult};
  render();
  localStorage.setItem('aw139_offshore_takeoff_v1',JSON.stringify({qnh,elev,pa,oat,w,wRaw,weightUnit:isLbUnit()?'lb':'kg',hw,ac,proc,cfg,wat:maxWeight,dropdown,margin,ok}));
  localStorage.setItem('aw139_companion_shared_context_v1',JSON.stringify({lastModule:'decolagem-offshore',updatedAt:new Date().toISOString(),weightKg:w,oatC:oat,pressureAltitudeFt:pa,headwindKt:hw,cataAircraftSet:String(ac),cataConfiguration:cfg}));
}
function render(){
  if(!state.last)return;const s=state.last;
  document.querySelector('.result-panel')?.classList.remove('pending');
  const chip=$('statusChip');
  if(s.error){chip.textContent='Erro';chip.className='status-chip bad';$('maxWeight').textContent='—';$('dropdownRes').textContent='—';$('watSummary').textContent=s.error;$('ddSummary').textContent='—';$('margin').textContent='—';$('watBox').className='result-box';$('ddBox').className='result-box';return;}
  const ddOk=s.dropdown!=null?(s.elev-s.dropdown)>=15:null;
  $('watBox').classList.toggle('ok',s.ok);$('watBox').classList.toggle('bad',!s.ok);
  $('ddBox').classList.toggle('ok',ddOk===true);$('ddBox').classList.toggle('bad',ddOk===false);
  $('maxWeight').textContent=fmtWt(s.wat);
  $('dropdownRes').textContent=s.dropdown!=null?`${s.dropdown} ft`:'—';
  $('watSummary').textContent=`${s.proc==='confined'?'Confined Area':s.proc==='enhanced'?'Enhanced':'Offshore'} · ${s.cfg} · PA ${s.pa} ft`;
  $('ddSummary').textContent=ddOk!=null?`Clearance ${s.elev-s.dropdown} ft ASL`:'Dropdown Offshore Takeoff';
  $('margin').textContent=`Margin: ${fmtWt(s.margin)}`;
  chip.textContent=s.ok?'Viável':'Não viável';chip.className=`status-chip ${s.ok?'ok':'bad'}`;
  const tab=activeTab();
  if(tab==='dropdown')drawDD();
  else if(tab==='wat')drawWAT();
}
function restore(){
  try{
    const s=JSON.parse(localStorage.getItem('aw139_offshore_takeoff_v1')||'null');
    if(!s){requestAnimationFrame(()=>drawWAT());return;}
    if(s.qnh!=null)$('qnh').value=s.qnh;if(s.elev!=null)$('elevation').value=s.elev;$('oat').value=s.oat;if($('weightUnit')&&s.weightUnit)$('weightUnit').value=s.weightUnit;$('weight').value=s.wRaw!=null?s.wRaw:s.w;$('wind').value=s.hw;$('aircraft').value=String(s.ac);$('procedure').value=s.proc;$('config').value=s.cfg;updateWeightUi();
    state.last=s;
    requestAnimationFrame(()=>render());
  }catch{}
}
function openFS(){
  const tab=activeTab();
  $('fsOverlay').hidden=false;document.body.classList.add('fullscreen-body');
  $('fsOverlay').scrollTop=0;
  requestAnimationFrame(()=>{
    const fc=$('fsCanvas');
    if(tab==='dropdown')drawDDV7Canvas(fc,state.last?.ddResult,'../dropdown/assets/');
    else drawWATCanvas(fc,state.last?.watResult,'../wat/',false);
  });
}
function closeFS(){$('fsOverlay').hidden=true;document.body.classList.remove('fullscreen-body');}
function exportPDF(){
  if(!state.last?.watResult||state.last.watResult.error){window.print();return;}
  createWATExportCanvas(state.last.watResult,'../wat/',(ec)=>{
    ec.toBlob(async blob=>{
      const file=new File([blob],'wat-offshore.png',{type:'image/png'});
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        try{await navigator.share({files:[file],title:'WAT Offshore'});return;}catch(e){if(e.name==='AbortError')return;}
      }
      const url=URL.createObjectURL(blob);
      const win=window.open('','_blank');
      if(!win){window.print();return;}
      win.document.write('<!DOCTYPE html><html><head><title>WAT Export</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;font-family:system-ui,sans-serif}.bar{position:sticky;top:0;z-index:9;display:flex;gap:8px;padding:10px 12px;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-bottom:1px solid #ddd}.btn{height:40px;padding:0 16px;border-radius:8px;border:1px solid #ccc;background:#f0f0f0;font-size:14px;font-weight:600;cursor:pointer}.btn.ok{background:#2FA7A0;color:#fff;border-color:#2FA7A0}img{display:block;width:100%;height:auto}@media print{.bar{display:none}@page{margin:6mm}}</style></head><body><div class="bar"><button class="btn" onclick="window.close()">&#x2715; Fechar</button><button class="btn ok" onclick="window.print()">&#x1F4E4; Compartilhar</button></div><img src="'+url+'"></body></html>');
      win.document.close();
    },'image/png');
  });
}
document.querySelectorAll('.viewer-tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.viewer-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  showTab(b.dataset.tab);
}));
$('watCanvas').addEventListener('click',openFS);$('ddCanvas').addEventListener('click',openFS);
$('fsClose').addEventListener('click',closeFS);document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeFS();});
$('procedure').addEventListener('change',render);$('runBtn').onclick=calc;$('resetBtn').onclick=()=>location.reload();$('pdfBtn').onclick=exportPDF;
$('weightUnit')?.addEventListener('change',updateWeightUi);
const _fields=['weight','qnh','elevation','oat','wind'];
_fields.forEach((id,i)=>{$(id).addEventListener('keydown',(e)=>{if(e.key!=='Enter')return;e.preventDefault();if(i<_fields.length-1)$(_fields[i+1]).focus();else calc();});});
restore();
