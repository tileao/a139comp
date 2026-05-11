// AW139 Dropdown DD-V7 vector validation patch
(() => {
  const G = window.DROPDOWN_GRAPH_DATA;
  const FT_TO_M = 0.3048, PAGE_W = G?.pageSizePts?.[0] || 842, PAGE_H = G?.pageSizePts?.[1] || 595;
  const $ = id => document.getElementById(id);
  const paEl=$('pressureAltitude'), oatEl=$('oat'), weightEl=$('actualWeight'), windEl=$('headwind'), profileEl=$('profile'), cfgEl=$('configuration');
  const runBtn=$('runBtn'), resetBtn=$('resetBtn'), chartCanvas=$('chartCanvas'), fsCanvas=$('fullscreenChartCanvas');
  const finalMetric=$('finalMetric'), finalMetricM=$('finalMetricM'), statusBadge=$('statusBadge'), statusTitle=$('statusTitle'), statusText=$('statusText'), statusDetail=$('statusDetail'), interpBox=$('interpBox'), statusCard=$('statusCard');
  let last=null;
  const imgs={offshore6400:new Image(),offshore6800:new Image(),enhanced7000:new Image()};
  imgs.offshore6400.src='assets/dropdown-offshore-6400.png';
  imgs.offshore6800.src='assets/dropdown-offshore-6800.png';
  imgs.enhanced7000.src='assets/dropdown-enhanced-7000.png';
  Object.values(imgs).forEach(i=>i.addEventListener('load',()=>draw(last,chartCanvas)));

  const fmt=(n,d=0)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
  const parseReq=el=>{const r=String(el.value||'').trim();return(!r||r==='-')?NaN:Number(r.replace(/[^0-9-]/g,''));};
  const parseWind=el=>{const r=String(el.value||'').trim();return(!r||r==='-')?0:Number(r.replace(/[^0-9-]/g,''));};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const inv=(a,b,v)=>Math.abs(b-a)<1e-9?0:(v-a)/(b-a);
  const num=c=>Number(c.label);
  const sorted=f=>[...f].sort((a,b)=>num(a)-num(b));

  function bracket(fam,value,name){
    const f=sorted(fam), min=num(f[0]), max=num(f[f.length-1]);
    if(value<min||value>max) throw new Error(`${name} fora do envelope aprovado (${min} a ${max}).`);
    for(let i=1;i<f.length;i++){
      if(value>=num(f[i-1])&&value<=num(f[i])) return {lo:f[i-1],hi:f[i],t:inv(num(f[i-1]),num(f[i]),value)};
    }
    return {lo:f[f.length-1],hi:f[f.length-1],t:0};
  }
  function yAtX(pts,x){
    let best=null;
    for(let i=1;i<pts.length;i++){
      const a=pts[i-1],b=pts[i], mn=Math.min(a[0],b[0]), mx=Math.max(a[0],b[0]);
      if(x>=mn-1e-6&&x<=mx+1e-6&&Math.abs(b[0]-a[0])>1e-6){
        const t=inv(a[0],b[0],x), y=lerp(a[1],b[1],t), score=Math.abs(t-.5);
        if(!best||score<best.score) best={y,score};
      }
    }
    if(best) return best.y;
    return pts.reduce((p,c)=>Math.abs(c[0]-x)<Math.abs(p[0]-x)?c:p,pts[0])[1];
  }
  function xAtY(pts,y){
    let best=null;
    for(let i=1;i<pts.length;i++){
      const a=pts[i-1],b=pts[i], mn=Math.min(a[1],b[1]), mx=Math.max(a[1],b[1]);
      if(y>=mn-1e-6&&y<=mx+1e-6&&Math.abs(b[1]-a[1])>1e-6){
        const t=inv(a[1],b[1],y), x=lerp(a[0],b[0],t), score=Math.abs(t-.5);
        if(!best||score<best.score) best={x,score};
      }
    }
    if(best) return best.x;
    return pts.reduce((p,c)=>Math.abs(c[1]-y)<Math.abs(p[1]-y)?c:p,pts[0])[0];
  }
  const frame=(chart,id)=>{const v=chart.frames[id];return{x0:v[0],y0:v[1],x1:v[2],y1:v[3]};};
  const mapX=(v,min,max,f)=>f.x0+((v-min)/(max-min))*(f.x1-f.x0);
  const unmapX=(x,min,max,f)=>min+((x-f.x0)/(f.x1-f.x0))*(max-min);

  function chartKey(profile,weight){return profile==='enhanced'?'enhanced7000':weight>6400?'offshore6800':'offshore6400';}
  function validate(i,key){
    if([i.pa,i.oat,i.weight].some(Number.isNaN)) throw new Error('Preencha PA, OAT e peso. Headwind vazio = 0 kt.');
    if(Number.isNaN(i.wind)||i.wind<0||i.wind>40) throw new Error('Headwind válido: 0 a 40 kt.');
    if(i.oat<-30||i.oat>50) throw new Error('OAT fora das curvas aprovadas (-30 a 50°C).');
    if(key==='enhanced7000'){
      if(i.pa<-1000||i.pa>1000) throw new Error('Enhanced: PA aprovada -1000 a 1000 ft.');
      if(i.weight<6000||i.weight>7000) throw new Error('Enhanced: peso aprovado 6000 a 7000 kg.');
    } else {
      if(i.pa<-1000||i.pa>5000) throw new Error('Offshore: PA aprovada -1000 a 5000 ft.');
      const maxW=key==='offshore6400'?6400:6800;
      if(i.weight<5800||i.weight>maxW) throw new Error(`Offshore: peso aprovado 5800 a ${maxW} kg.`);
    }
  }

  function readOffshore(i,key){
    const c=G.charts[key], lf=frame(c,'left_panel'), rf=frame(c,'right_panel');
    const xPa=mapX(i.pa,-1000,5000,lf), ob=bracket(c.families.oat,i.oat,'OAT');
    const y=lerp(yAtX(ob.lo.points,xPa),yAtX(ob.hi.points,xPa),ob.t);
    const wb=bracket(c.families.gw,i.weight,'GW');
    const xBase=lerp(xAtY(wb.lo.points,y),xAtY(wb.hi.points,y),wb.t);
    const base=unmapX(xBase,0,150,rf), wind=-clamp(i.wind||0,0,40), desc=i.profile==='offshoreDescending'?15:0, final=Math.max(0,base+wind+desc);
    return {...i,chartKey:key,chart:key==='offshore6400'?'Supplement 12 / Figure 4I-1':'Supplement 50 / Figure 4-74',baseFt:base,windCorrectionFt:wind,descendingCorrectionFt:desc,finalFt:final,finalM:final*FT_TO_M,oatInterp:{low:num(ob.lo),high:num(ob.hi)},weightInterp:{low:num(wb.lo),high:num(wb.hi)},debug:{mode:'offshore',xPa,yTransfer:y,xBase,xFinal:mapX(final,0,150,rf),curves:[['OAT',ob.lo],['OAT',ob.hi],['GW',wb.lo],['GW',wb.hi]]}};
  }
  function headwindTransfer(c,yEntry,wind){
    const mf=frame(c,'middle_panel'), x=mapX(wind,0,40,mf);
    const refs=(c.families.headwindTransfer||[]).map(curve=>({curve,yLeft:yAtX(curve.points,mf.x0+.5)})).sort((a,b)=>a.yLeft-b.yLeft);
    let lo=refs[0],hi=refs[refs.length-1];
    for(let k=1;k<refs.length;k++){
      if(yEntry>=Math.min(refs[k-1].yLeft,refs[k].yLeft)&&yEntry<=Math.max(refs[k-1].yLeft,refs[k].yLeft)){lo=refs[k-1];hi=refs[k];break;}
    }
    const t=clamp(inv(lo.yLeft,hi.yLeft,yEntry),0,1);
    return {x,y:lerp(yAtX(lo.curve.points,x),yAtX(hi.curve.points,x),t),lo:lo.curve,hi:hi.curve,t};
  }
  function readEnhanced(i,key){
    const c=G.charts[key], lf=frame(c,'left_panel'), rf=frame(c,'right_panel');
    const xPa=mapX(i.pa/1000,-1,1,lf), ob=bracket(c.families.oat,i.oat,'OAT');
    const y1=lerp(yAtX(ob.lo.points,xPa),yAtX(ob.hi.points,xPa),ob.t);
    const ht=headwindTransfer(c,y1,i.wind||0);
    const wb=bracket(c.families.gw,i.weight,'GW');
    const xBase=lerp(xAtY(wb.lo.points,ht.y),xAtY(wb.hi.points,ht.y),wb.t);
    const base=unmapX(xBase,0,150,rf), final=Math.max(0,base);
    return {...i,chartKey:key,chart:'Supplement 97 / Figure 4-10',baseFt:base,windCorrectionFt:0,descendingCorrectionFt:0,finalFt:final,finalM:final*FT_TO_M,oatInterp:{low:num(ob.lo),high:num(ob.hi)},weightInterp:{low:num(wb.lo),high:num(wb.hi)},debug:{mode:'enhanced',xPa,yTransfer:y1,xHeadwind:ht.x,yAfterHeadwind:ht.y,xBase,xFinal:xBase,curves:[['OAT',ob.lo],['OAT',ob.hi],['HEADWIND',ht.lo],['HEADWIND',ht.hi],['GW',wb.lo],['GW',wb.hi]]}};
  }
  function calc(){
    if(!G?.charts) throw new Error('graphData.js não carregou.');
    const i={pa:parseReq(paEl),oat:parseReq(oatEl),weight:parseReq(weightEl),wind:parseWind(windEl),profile:profileEl.value,config:cfgEl?.value};
    const key=chartKey(i.profile,i.weight);
    validate(i,key);
    return key==='enhanced7000'?readEnhanced(i,key):readOffshore(i,key);
  }

  const cp=(canvas,p)=>[(p[0]/PAGE_W)*canvas.width,(p[1]/PAGE_H)*canvas.height];
  function curve(ctx,canvas,pts,color,width=4,dashed=false){
    if(!pts||pts.length<2)return;
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';if(dashed)ctx.setLineDash([8,6]);
    const a=cp(canvas,pts[0]);ctx.beginPath();ctx.moveTo(a[0],a[1]);
    for(let k=1;k<pts.length;k++){const p=cp(canvas,pts[k]);ctx.lineTo(p[0],p[1]);}
    ctx.stroke();ctx.restore();
  }
  function line(ctx,canvas,a,b,color,width=3,dashed=true){
    const p=cp(canvas,a),q=cp(canvas,b);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;if(dashed)ctx.setLineDash([9,7]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore();
  }
  function dot(ctx,canvas,p,color){
    const q=cp(canvas,p);ctx.save();ctx.fillStyle=color;ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q[0],q[1],7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
  }
  function color(f){return f==='OAT'?'#f3b447':f==='GW'?'#47e074':f==='HEADWIND'?'#4ef0ff':'#ff79cb';}
  function draw(r,canvas=chartCanvas){
    if(!canvas)return;
    const ctx=canvas.getContext('2d'), key=r?.chartKey||chartKey(profileEl.value,parseReq(weightEl)), img=imgs[key]||imgs.offshore6400;
    if(!img.complete){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f7f7f2';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#111';ctx.fillText('Carregando carta DD-V7…',30,40);return;}
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    if(!r?.debug)return;
    const seen=new Set();
    for(const [fam,c] of r.debug.curves){const k=fam+(c.label||c.id);if(seen.has(k))continue;seen.add(k);curve(ctx,canvas,c.points,color(fam),fam==='HEADWIND'?3:4,fam==='HEADWIND');}
    if(r.debug.mode==='offshore'){
      const ch=G.charts[r.chartKey], rf=frame(ch,'right_panel');
      line(ctx,canvas,[r.debug.xPa,r.debug.yTransfer],[rf.x0,r.debug.yTransfer],'#4ef0ff',3,true);
      line(ctx,canvas,[r.debug.xBase,r.debug.yTransfer],[r.debug.xFinal,r.debug.yTransfer],'#ff79cb',4,true);
      dot(ctx,canvas,[r.debug.xPa,r.debug.yTransfer],'#f3b447');dot(ctx,canvas,[r.debug.xBase,r.debug.yTransfer],'#47e074');dot(ctx,canvas,[r.debug.xFinal,r.debug.yTransfer],'#ff79cb');
    } else {
      const ch=G.charts[r.chartKey], mf=frame(ch,'middle_panel'), rf=frame(ch,'right_panel');
      line(ctx,canvas,[r.debug.xPa,r.debug.yTransfer],[mf.x0,r.debug.yTransfer],'#4ef0ff',3,true);
      line(ctx,canvas,[r.debug.xHeadwind,r.debug.yAfterHeadwind],[rf.x0,r.debug.yAfterHeadwind],'#4ef0ff',3,true);
      dot(ctx,canvas,[r.debug.xPa,r.debug.yTransfer],'#f3b447');dot(ctx,canvas,[r.debug.xHeadwind,r.debug.yAfterHeadwind],'#4ef0ff');dot(ctx,canvas,[r.debug.xBase,r.debug.yAfterHeadwind],'#ff79cb');
    }
    ctx.save();ctx.fillStyle='#111';ctx.font='bold 18px system-ui,sans-serif';ctx.fillText(`DD-V7 vector: ${fmt(r.finalFt,0)} ft`,22,canvas.height-24);ctx.restore();
  }
  function render(r){
    last=r; finalMetric.textContent=`${fmt(r.finalFt,0)} ft`; finalMetricM.textContent=`${fmt(r.finalM,1)} m`;
    statusCard.className='card status sticky-result within'; statusBadge.textContent='DD-V7 EM VALIDAÇÃO';
    statusTitle.textContent=r.profile==='enhanced'?'Enhanced — leitura vetorial':'Offshore — leitura vetorial';
    statusText.textContent=`Resultado vetorial: ${fmt(r.finalFt,0)} ft`;
    statusDetail.textContent=`${r.chart}. Base A/B/C aprovada; Etapa D em teste no app.`;
    interpBox.innerHTML=`<strong>Modo:</strong> DD-V7 engine vetorial em validação<br><strong>Carta:</strong> ${r.chart}<br><strong>Bracket OAT:</strong> ${r.oatInterp.low} / ${r.oatInterp.high} °C<br><strong>Bracket GW:</strong> ${r.weightInterp.low} / ${r.weightInterp.high} kg<br><strong>Leitura base do gráfico:</strong> ${fmt(r.baseFt,1)} ft<br><strong>Correção de vento:</strong> ${fmt(r.windCorrectionFt,1)} ft<br><strong>Correção Descending:</strong> ${fmt(r.descendingCorrectionFt,1)} ft<br><strong>Resultado final:</strong> ${fmt(r.finalFt,1)} ft (${fmt(r.finalM,1)} m)<br><small>Usa curvas vetoriais aprovadas nas Etapas A/B/C. Ainda requer casos-âncora.</small>`;
    draw(r,chartCanvas);
  }
  function runDDV7(){
    setTimeout(()=>{try{render(calc());}catch(e){statusCard.className='card status sticky-result out';statusBadge.textContent='DD-V7 FORA DO ENVELOPE';statusTitle.textContent='Sem cálculo vetorial';statusText.textContent=e.message;statusDetail.textContent='Confira PA, OAT, GW e Headwind.';finalMetric.textContent='—';finalMetricM.textContent='—';}},0);
  }
  runBtn?.addEventListener('click',runDDV7);
  resetBtn?.addEventListener('click',()=>{last=null;setTimeout(()=>draw(null,chartCanvas),0);});
  $('openFullscreenBtn')?.addEventListener('click',()=>setTimeout(()=>draw(last,fsCanvas),80));
  $('chartStage')?.addEventListener('click',()=>setTimeout(()=>draw(last,fsCanvas),80));
  statusDetail && (statusDetail.textContent='DD-V7 carregado. Headwind vazio será considerado 0 kt.');
})();
