(function(){
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const state = { installed: !!isStandalone, platform: detectPlatform() };
  window.__aw139PwaState = state;

  function detectPlatform(){
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'other';
  }

  function serviceWorkerConfig(){
    const path = location.pathname;
    if (path.includes('/cata/') || path.includes('/adc/')) return { url: '../sw.js', scope: '../' };
    return { url: 'sw.js', scope: './' };
  }

  async function register(){
    if (!('serviceWorker' in navigator)) return;
    const cfg = serviceWorkerConfig();
    try {
      const reg = await navigator.serviceWorker.register(cfg.url, { scope: cfg.scope });
      if (reg.waiting) notifyUpdate(reg);
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) notifyUpdate(reg);
        });
      });
    } catch (err) {
      console.warn('SW registration failed', err);
    }
  }

  function notifyUpdate(reg){
    const bar = ensureBar();
    bar.querySelector('.pwa-toast-text').textContent = 'Nova versão disponível para o app.';
    const btn = bar.querySelector('.pwa-toast-action');
    btn.hidden = false;
    btn.textContent = 'Atualizar';
    btn.onclick = () => {
      reg.waiting && reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    };
    bar.hidden = false;
  }

  function ensureBar(){
    let bar = document.getElementById('pwaToast');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'pwaToast';
    bar.hidden = true;
    bar.innerHTML = '<div class="pwa-toast-text"></div><button type="button" class="pwa-toast-action" hidden></button><button type="button" class="pwa-toast-close" aria-label="Fechar">×</button>';
    Object.assign(bar.style, {position:'fixed',left:'12px',right:'12px',bottom:'max(12px, env(safe-area-inset-bottom))',zIndex:'9999',display:'flex',gap:'10px',alignItems:'center',padding:'12px 14px',borderRadius:'16px',background:'rgba(15,23,42,.94)',color:'#e5eef7',border:'1px solid rgba(255,255,255,.12)',boxShadow:'0 18px 40px rgba(0,0,0,.28)',backdropFilter:'blur(12px)'});
    const actionStyle = {borderRadius:'12px',border:'1px solid rgba(70,194,186,.45)',background:'linear-gradient(180deg,#2fa7a0,#248d87)',color:'#08131a',fontWeight:'800',minHeight:'40px',padding:'0 14px',cursor:'pointer'};
    Object.assign(bar.querySelector('.pwa-toast-action').style, actionStyle);
    Object.assign(bar.querySelector('.pwa-toast-close').style, {marginLeft:'auto',border:'0',background:'transparent',color:'#a9b8c8',fontSize:'22px',cursor:'pointer'});
    bar.querySelector('.pwa-toast-close').onclick = () => { bar.hidden = true; };
    document.body.appendChild(bar);
    return bar;
  }

  function installGuideHtml(){
    if (state.platform === 'ios') {
      return '<strong>Instalar no iPhone/iPad</strong><br>Abra no Safari, toque em <em>Compartilhar</em> e depois em <em>Adicionar à Tela de Início</em>.';
    }
    if (state.platform === 'android') {
      return '<strong>Instalar no Android</strong><br>Abra o menu do navegador e use <em>Instalar app</em> ou <em>Adicionar à tela inicial</em>.';
    }
    return '<strong>Instalar como app</strong><br>Use a opção de instalar/adicionar à tela inicial no navegador compatível.';
  }

  window.showAw139InstallGuide = function(){
    const bar = ensureBar();
    bar.querySelector('.pwa-toast-text').innerHTML = installGuideHtml();
    const btn = bar.querySelector('.pwa-toast-action');
    btn.hidden = true;
    bar.hidden = false;
  };

  window.addEventListener('load', register);
  window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.toggle('is-standalone', state.installed);
    document.body.classList.toggle('is-standalone', state.installed);
    window.dispatchEvent(new CustomEvent('aw139-pwa-state', { detail: state }));
  });
  navigator.serviceWorker && navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
})();
