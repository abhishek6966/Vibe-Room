/* v93: real-screen fit for the iPhone home-screen app (standalone) — see style.css v93 block.
   In standalone the page can be reported SHORTER than the physical screen (innerHeight/100dvh miss
   a strip at the bottom), which leaves a dead band under the nav. We measure that strip (--gap) and
   let the app shell + bottom nav extend into it. Browsers (Safari/Chrome) get gap=0: untouched. */
(()=>{const r=document.documentElement,ios=/iPhone|iPod/.test(navigator.userAgent);let hud;
const sa=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function fit(){const st=sa(),portrait=innerHeight>=innerWidth;let gap=0;
 if(st&&ios&&portrait){const H=Math.max(screen.height,screen.width);gap=Math.max(0,Math.min(H-innerHeight,100))}
 r.classList.add('v93');r.classList.toggle('standalone',st);r.style.setProperty('--gap',gap+'px');
 if(/[?&]debug=1/.test(location.search)){hud=hud||document.body&&document.body.appendChild(Object.assign(document.createElement('div'),{style:'position:fixed;top:50px;left:6px;z-index:9999;background:#000c;color:#0f0;font:11px/1.3 monospace;padding:6px;border-radius:6px;pointer-events:none;white-space:pre'}));
  if(hud)hud.textContent=`standalone:${st} ios:${ios}\ninnerH:${innerHeight} clientH:${r.clientHeight}\nscreenH:${screen.height} gap:${gap}\nsab:${getComputedStyle(r).getPropertyValue('--sab')}`}}
fit();[100,400,1200,3000].forEach(t=>setTimeout(fit,t));
addEventListener('resize',fit);addEventListener('pageshow',fit);addEventListener('orientationchange',()=>setTimeout(fit,350));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)fit()})})();
