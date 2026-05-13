const $=id=>document.getElementById(id);
const state={};
function calcPA(qnh,elev){const q=(qnh>=800&&qnh<=1100)?qnh:1013.25;return Math.round(elev+(1013.25-q)*30);}
function mapCfg(cfg){return cfg==='eaps_off'?'eapsOff':cfg==='eaps_on'?'eapsOn':'standard';}
function activeTab(){return document.querySelector('.viewer-tab.active')?.dataset.tab;}
function showTab(tab){
  $('watCanvas').style.display=tab==='wat'?'':'none';
  $('ddCanvas').style.display=tab==='dropdown'?'':'none';
  $('vizTitle').textContent=tab==='wat'?'WAT Offshore Procedure':'Dropdown Offshore Landing';
  if(tab==='dropdown')requestAnimationFrame(()=>requestAnimationFrame(drawDD));
  else if(tab==='wat')requestAnimationFrame(()=>requestAnimationFrame(drawWAT));
}
function drawDD(){drawDDV7Canvas($('ddCanvas'),state.last?.ddResult,'../dropdown/assets/');}
function drawWAT(){drawWATCanvas($('watCanvas'),state.last?.watResult,'../wat/');}
function calc(){
  const qnh=Number($('qnh').value),elev=Number($('elevation').value||0),pa=calcPA(qnh,elev);
  const oat=Number($('oat').value||0),w=Number($('weight').value||0),hw=Number($('wind').value||0);
  const ac=Number($('aircraft').value||7000),profile=$('profile').value,cfg=$('config').value;
  let wat;
  if(cfg==='eaps_off')wat=calculateExactEapsOff(pa,oat,w,hw);
  else if(cfg==='eaps_on')wat=calculateExactEapsOn(pa,oat,w,hw);
  else if(cfg==='ibf')wat=calculateExactIbfInstalled(pa,oat,w,hw);
  else wat=calculateExactOffshoreStandard(pa,oat,w,hw);
  if(wat.error){state.last={error:wat.error,profile,cfg,qnh,elev,pa,oat,w,hw,ac,watResult:null,ddResult:null};render();return;}
  let ddResult=null;
  try{
    const ddProfile=profile==='descending'?'offshoreDescending':'offshore';
    ddResult=calculateOffshoreDropdown(pa,oat,w,hw,ddProfile,mapCfg(cfg));
  }catch(e){}
  const maxWeight=wat.maxWeight,margin=Math.round(maxWeight-w),ok=margin>=0;
  const dropdown=ddResult?Math.round(ddResult.finalFt):null;
  state.last={qnh,elev,pa,oat,w,hw,ac,profile,cfg,wat:maxWeight,watResult:wat,dropdown,margin,ok,ddResult};
  render();
  localStorage.setItem('aw139_offshore_landing_v1',JSON.stringify({qnh,elev,pa,oat,w,hw,ac,profile,cfg,wat:maxWeight,dropdown,margin,ok}));
  localStorage.setItem('aw139_companion_shared_context_v1',JSON.stringify({lastModule:'pouso-offshore',updatedAt:new Date().toISOString(),weightKg:w,oatC:oat,pressureAltitudeFt:pa,headwindKt:hw,cataAircraftSet:String(ac),cataConfiguration:cfg}));
}
function render(){
  if(!state.last)return;const s=state.last;
  document.querySelector('.result-panel')?.classList.remove('pending');
  const chip=$('statusChip');
  if(s.error){chip.textContent='Erro';chip.className='status-chip bad';$('maxWeight').textContent='—';$('dropdownRes').textContent='—';$('watSummary').textContent=s.error;$('ddSummary').textContent='—';$('margin').textContent='—';$('watBox').className='result-box';$('ddBox').className='result-box';return;}
  const ddOk=s.dropdown!=null?(s.elev-s.dropdown)>=15:null;
  $('watBox').classList.toggle('ok',s.ok);$('watBox').classList.toggle('bad',!s.ok);
  $('ddBox').classList.toggle('ok',ddOk===true);$('ddBox').classList.toggle('bad',ddOk===false);
  $('maxWeight').textContent=`${s.wat} kg`;
  $('dropdownRes').textContent=s.dropdown!=null?`${s.dropdown} ft`:'—';
  $('watSummary').textContent=`Perfil ${s.profile==='level'?'Level':'Descending'} · ${s.cfg} · PA ${s.pa} ft`;
  $('ddSummary').textContent=ddOk!=null?`Clearance ${s.elev-s.dropdown} ft ASL`:'Dropdown Offshore Landing';
  $('margin').textContent=`Margin: ${s.margin} kg`;
  chip.textContent=s.ok?'Viável':'Não viável';chip.className=`status-chip ${s.ok?'ok':'bad'}`;
  const tab=activeTab();
  if(tab==='dropdown')drawDD();
  else if(tab==='wat')drawWAT();
}
function restore(){
  try{
    const s=JSON.parse(localStorage.getItem('aw139_offshore_landing_v1')||'null');
    if(!s){requestAnimationFrame(()=>drawWAT());return;}
    if(s.qnh!=null)$('qnh').value=s.qnh;if(s.elev!=null)$('elevation').value=s.elev;$('oat').value=s.oat;$('weight').value=s.w;$('wind').value=s.hw;$('aircraft').value=String(s.ac);$('profile').value=s.profile;$('config').value=s.cfg;
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
    ec.toBlob(blob=>{
      const url=URL.createObjectURL(blob);
      const win=window.open('','_blank');
      if(!win){window.print();return;}
      win.document.write('<!DOCTYPE html><html><head><title>WAT Export</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}img{display:block;width:100%;height:auto}@media print{@page{margin:6mm}}</style></head><body><img src="'+url+'" onload="window.print()"></body></html>');
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
$('runBtn').onclick=calc;$('resetBtn').onclick=()=>location.reload();$('pdfBtn').onclick=exportPDF;
const _fields=['weight','qnh','elevation','oat','wind'];
_fields.forEach((id,i)=>{$(id).addEventListener('keydown',(e)=>{if(e.key!=='Enter')return;e.preventDefault();if(i<_fields.length-1)$(_fields[i+1]).focus();else calc();});});
restore();
