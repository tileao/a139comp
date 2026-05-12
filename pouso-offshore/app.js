const $=id=>document.getElementById(id);
const state={};
function calcPA(qnh,elev){const q=(qnh>=800&&qnh<=1100)?qnh:1013.25;return Math.round(elev+(1013.25-q)*30);}
function mapCfg(cfg){return cfg==='eaps_off'?'eapsOff':cfg==='eaps_on'?'eapsOn':'standard';}
function activeTab(){return document.querySelector('.viewer-tab.active')?.dataset.tab;}
function showTab(tab){
  $('chartImg').style.display=tab==='wat'?'':'none';
  $('ddCanvas').style.display=tab==='dropdown'?'':'none';
  $('vizTitle').textContent=tab==='wat'?'WAT Offshore Procedure':'Dropdown Offshore Landing';
  if(tab==='dropdown')setTimeout(drawDD,0);
}
function drawDD(){drawDDV7Canvas($('ddCanvas'),state.last?.ddResult,'../dropdown/assets/');}
function calc(){
  const qnh=Number($('qnh').value),elev=Number($('elevation').value||0),pa=calcPA(qnh,elev);
  const oat=Number($('oat').value||0),w=Number($('weight').value||0),hw=Number($('wind').value||0);
  const ac=Number($('aircraft').value||7000),profile=$('profile').value,cfg=$('config').value;
  let wat;
  if(cfg==='eaps_off')wat=calculateExactEapsOff(pa,oat,w,hw);
  else if(cfg==='eaps_on')wat=calculateExactEapsOn(pa,oat,w,hw);
  else if(cfg==='ibf')wat=calculateExactIbfInstalled(pa,oat,w,hw);
  else wat=calculateExactOffshoreStandard(pa,oat,w,hw);
  if(wat.error){state.last={error:wat.error,profile,cfg,qnh,elev,pa,oat,w,hw,ac,ddResult:null};render();return;}
  let ddResult=null;
  try{
    const ddProfile=profile==='descending'?'offshoreDescending':'offshore';
    ddResult=calculateOffshoreDropdown(pa,oat,w,hw,ddProfile,mapCfg(cfg));
  }catch(e){}
  const maxWeight=wat.maxWeight,margin=Math.round(maxWeight-w),ok=margin>=0;
  const dropdown=ddResult?Math.round(ddResult.finalFt):null;
  state.last={qnh,elev,pa,oat,w,hw,ac,profile,cfg,wat:maxWeight,dropdown,margin,ok,ddResult};
  render();
  localStorage.setItem('aw139_offshore_landing_v1',JSON.stringify({qnh,elev,pa,oat,w,hw,ac,profile,cfg,wat:maxWeight,dropdown,margin,ok}));
  localStorage.setItem('aw139_companion_shared_context_v1',JSON.stringify({lastModule:'pouso-offshore',updatedAt:new Date().toISOString(),weightKg:w,oatC:oat,pressureAltitudeFt:pa,headwindKt:hw,cataAircraftSet:String(ac),cataConfiguration:cfg}));
}
function render(){
  if(!state.last)return;const s=state.last;
  document.querySelector('.result-panel')?.classList.remove('pending');
  const chip=$('statusChip');
  if(s.error){chip.textContent='Erro';chip.className='status-chip bad';$('maxWeight').textContent='—';$('dropdownRes').textContent='—';$('watSummary').textContent=s.error;$('ddSummary').textContent='—';$('margin').textContent='—';return;}
  $('maxWeight').textContent=`${s.wat} kg`;
  $('dropdownRes').textContent=s.dropdown!=null?`${s.dropdown} ft`:'—';
  $('watSummary').textContent=`Perfil ${s.profile==='level'?'Level':'Descending'} · ${s.cfg} · PA ${s.pa} ft`;
  $('ddSummary').textContent='Dropdown Offshore Landing';
  $('margin').textContent=`Margin: ${s.margin} kg`;
  chip.textContent=s.ok?'Viável':'Não viável';chip.className=`status-chip ${s.ok?'ok':'bad'}`;
  if(activeTab()==='dropdown')drawDD();
}
function restore(){try{const s=JSON.parse(localStorage.getItem('aw139_offshore_landing_v1')||'null');if(!s)return;if(s.qnh!=null)$('qnh').value=s.qnh;if(s.elev!=null)$('elevation').value=s.elev;$('oat').value=s.oat;$('weight').value=s.w;$('wind').value=s.hw;$('aircraft').value=String(s.ac);$('profile').value=s.profile;$('config').value=s.cfg;state.last=s;render();}catch{}}
document.querySelectorAll('.viewer-tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.viewer-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  showTab(b.dataset.tab);
}));
$('runBtn').onclick=calc;$('resetBtn').onclick=()=>location.reload();$('pdfBtn').onclick=()=>window.print();restore();
