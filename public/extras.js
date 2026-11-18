(()=>{const $$=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e},rnd=(a,b)=>a+Math.random()*(b-a),cols=['#ff3d9a','#2de2ff','#c8ff3d','#ffb020','#9b5cff'];
/* clean line icons (Feather-style) instead of emoji, like the mockup */
const XIC=(p)=>'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const X_SHUF=XIC('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>');
const X_REP=XIC('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>');
const X_HEART=c=>'<svg viewBox="0 0 24 24" width="18" height="18" fill="'+c+'" stroke="none" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
const X_HEART_O=XIC('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>');
const X_VIDEO=XIC('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>');
const X_CHEV='<svg class="chev" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
const X_MUSIC=XIC('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>');
for(let i=0;i<7;i++){const o=$$('span','orb'),s=rnd(80,260);o.style.cssText=`width:${s}px;height:${s}px;left:${rnd(-5,95)}%;top:${rnd(0,90)}%;--o:${cols[i%5]};animation-delay:${-rnd(0,14)}s`;document.body.append(o)}
for(let i=0;i<9;i++){const n=$$('span','note',X_MUSIC);n.style.cssText=`left:${rnd(0,95)}%;animation-duration:${rnd(12,24)}s;animation-delay:${-rnd(0,20)}s;color:${cols[i%5]}`;document.body.append(n)}
const disc=$('#disc'),stage=$('.stage'),deck=$$('div','deck');disc.before(deck);deck.append(disc,$$('div','arm'));
/* gradient hub button over the disc centre — the YouTube player stays mounted behind it; Show Video reveals it */
const dp=$$('button','disc-btn',IC.play);dp.id='dp';dp.setAttribute('aria-label','Play or pause');dp.onclick=()=>{if(!S?.cur){toast('Paste a YouTube link to start the room.');return}localToggle();act({type:'play'})};deck.append(dp);
const viz=$$('div','viz');viz.setAttribute('aria-hidden','true');
const vcols=['#ff3d71','#ff3d71','#ff5c8a','#e14eca','#c026d3','#9b5cff','#7a5cff','#22e1ff'];
for(let i=0;i<28;i++){const b=$$('i');b.style.animationDuration=rnd(.35,1)+'s';b.style.animationDelay=-rnd(0,1)+'s';b.style.background=vcols[Math.min(vcols.length-1,i*8/28|0)];b.style.height=rnd(8,34)+'px';viz.append(b)}deck.after(viz);
const X=$$('div','xtra',`<div class="xrow"><button class="pill" id="xs" aria-label="Shuffle">${X_SHUF}</button><button class="pill" id="xr" aria-label="Repeat">${X_REP}<b id="xrb" hidden></b></button><label class="pill sel" aria-label="Playback speed"><select id="xv"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option></select>${X_CHEV}</label><button class="pill" id="xl" aria-label="Like">${X_HEART_O}<span>Like</span></button><button class="pill" id="xp" aria-label="Previous">⏮</button><button class="pill" id="xd" aria-label="Show video">${X_VIDEO}<span>Show Video</span></button></div>`);$('.ctl').after(X);
/* Compact transport bar for non-Play tabs. */
const miniIcon=p=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">${p}</svg>`;
const miniPlay=miniIcon('<path d="M7 4.5v15L19.5 12z"/>'),miniPause=miniIcon('<rect x="6" y="5" width="4.5" height="14" rx="1"/><rect x="13.5" y="5" width="4.5" height="14" rx="1"/>');
const mini=$$('div','',`<img id="mi" alt="" width="36" height="36"><b id="mt" style="flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"></b><button id="mprev" aria-label="Previous track">${miniIcon('<path d="M18 5v14l-9-7zM5 5h2v14H5z"/>')}</button><button id="mp" aria-label="Play">${miniPlay}</button><button id="mnext" aria-label="Next track">${miniIcon('<path d="M6 5v14l9-7zM17 5h2v14h-2z"/>')}</button>`);mini.id='mini';document.body.append(mini);
const updMini=()=>mini.classList.toggle('show',document.body.classList.contains('in-room')&&$('#room').dataset.tab!=='play'&&!!S?.cur);window.updMini=updMini;
/* pink fill on the seek + volume sliders */
const setFill=el=>{if(el)el.style.setProperty('--p',((el.value-el.min)/(el.max-el.min)*100)+'%')};
setInterval(()=>{setFill($('#sc'));setFill($('#vol'))},300);
const likes=()=>JSON.parse(L.likes||'[]'),showLikes=()=>{const C=S&&(S.hostId===me.id||S.co.includes(me.id)||(S.ctrl&&S.ctrl.includes(me.id)));const el=$('#likes-list');if(!el)return;el.innerHTML=likes().map(x=>`<li><img src="https://i.ytimg.com/vi/${x.id}/mqdefault.jpg" alt="" loading="lazy" onerror="this.style.display='none'"><div><b>${esc(x.t)}</b></div><button data-like="${x.id}">${C?'Add to queue':'Request'}</button><button class="unlike" data-unlike="${x.id}" aria-label="Remove from liked songs">✕</button></li>`).join('')||'<li class="empty"><div><small>Tap Like on a song to save it here.</small></div></li>'};
/* v43: liked songs slide-in panel — heart icon in the header opens it,
   ✕ / backdrop / Escape closes it. Songs are saved forever on the device. */
const likesPanel=$('#likes-panel'),likesBackdrop=$('#likes-backdrop');
const openLikes=()=>{showLikes();likesPanel.hidden=false;likesBackdrop.hidden=false;requestAnimationFrame(()=>{likesPanel.classList.add('open');likesBackdrop.classList.add('open')})};
const closeLikes=()=>{likesPanel.classList.remove('open');likesBackdrop.classList.remove('open');setTimeout(()=>{likesPanel.hidden=true;likesBackdrop.hidden=true},320)};
$('#likes-btn').onclick=openLikes;$('#likes-x').onclick=closeLikes;likesBackdrop.onclick=closeLikes;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!likesPanel.hidden)closeLikes()});
document.addEventListener('click',e=>{const u=e.target.closest('[data-unlike]');if(u){L.likes=JSON.stringify(likes().filter(x=>x.id!==u.dataset.unlike));paint()}});
function paint(){const c=S?.cur,M=S&&(S.hostId===me.id||S.co.includes(me.id)),C=M||(S&&S.ctrl&&S.ctrl.includes(me.id)),can=C;stage.classList.toggle('on',!!c&&c.playing);deck.classList.toggle('on',!!c&&c.playing);
 dp.innerHTML=c&&c.playing?IC.pause:IC.play;dp.disabled=!can;
 const rp=S?.repeat||'off';$('#xr').classList.toggle('on',rp!=='off');const xrb=$('#xrb');xrb.hidden=rp==='off';xrb.textContent=rp==='one'?'1':'ALL';
 $('#xp').disabled=!can;['#xs','#xr','#xv'].forEach(i=>$(i).disabled=!C);$('#xv').closest('.pill').classList.toggle('off',!C);if(c)$('#xv').value=String(c.speed||1);
 $('#xl').innerHTML=(c&&likes().some(x=>x.id===c.videoId)?X_HEART('#ff5c8a'):X_HEART_O)+'<span>Like</span>';
 if(c){$('#mi').src=c.artwork;$('#mt').textContent=c.title;$('#mp').innerHTML=c.playing?miniPause:miniPlay;$('#mp').setAttribute('aria-label',c.playing?'Pause':'Play')}$('#mp').disabled=!C;$('#mprev').disabled=!C;$('#mnext').disabled=!C;updMini();showLikes()}
socket.on('state',paint);
$('#xp').onclick=()=>act({type:'prev'});$('#xs').onclick=()=>act({type:'shuffle'});$('#xr').onclick=()=>act({type:'repeat'});$('#xv').onchange=e=>act({type:'speed',v:parseFloat(e.target.value)});$('#mp').onclick=()=>{localToggle();act({type:'play'})};$('#mprev').onclick=()=>act({type:'prev'});$('#mnext').onclick=()=>act({type:'skip'});
$('#xl').onclick=()=>{const c=S?.cur;if(!c){toast('Paste a YouTube link to start the room.');return}let a=likes();a=a.some(x=>x.id===c.videoId)?a.filter(x=>x.id!==c.videoId):[...a,{id:c.videoId,t:c.title}];L.likes=JSON.stringify(a);paint()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-like]');if(b)act({type:'add',url:'https://youtu.be/'+b.dataset.like})});
$('#xd').onclick=e=>{const v=deck.classList.toggle('vid');deck.style.transform='';e.currentTarget.innerHTML=v?X_MUSIC+'<span>Audio only</span>':X_VIDEO+'<span>Show Video</span>'};
/* 3D tilt: the deck floats and turns with the pointer; a light follows it */
stage.onpointermove=e=>{if(deck.classList.contains('vid'))return;const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;stage.style.setProperty('--mx',(x*100)+'%');stage.style.setProperty('--my',(y*100)+'%');deck.style.transform=`rotateX(${(.5-y)*24}deg) rotateY(${(x-.5)*28}deg)`};
stage.onpointerleave=()=>{deck.style.transform='';stage.style.setProperty('--mx','50%');stage.style.setProperty('--my','28%')};
socket.on('react',()=>{const x=innerWidth/2,y=innerHeight*.6;for(let i=0;i<12;i++){const d=$$('i'),w=$$('div','burst');d.style.cssText=`left:${x}px;top:${y}px;background:${cols[i%5]};--dx:${rnd(-160,160)}px;--dy:${rnd(-220,40)}px`;w.append(d);document.body.append(w);setTimeout(()=>w.remove(),900)}});
/* v14: landing + gate atmosphere — twinkling stars + flowing notes + hero 3D tilt */
(function(){const stars=$('#stars'),notes=$('#fnotes');
 if(stars){const sc=['#fff','#ffd166','#ff8ac2','#7fe8ff','#c9ff55'];
  for(let i=0;i<70;i++){const s=document.createElement('span');
   s.style.cssText=`left:${rnd(0,100)}%;top:${rnd(0,100)}%;width:${rnd(1,3.5)}px;height:${rnd(1,3.5)}px;background:${sc[i%5]};animation-duration:${rnd(1.8,4.5)}s;animation-delay:${-rnd(0,4)}s;box-shadow:0 0 ${rnd(4,10)}px ${sc[i%5]}`;
   stars.append(s)}}
 if(notes){const nc=['#ff8ac2','#7fe8ff','#ffd166','#c9ff55','#ff5c9a'];
  for(let i=0;i<12;i++){const n=document.createElement('span');n.innerHTML=X_MUSIC;
   n.style.cssText=`left:${rnd(2,96)}%;font-size:${rnd(1.1,2.2)}rem;color:${nc[i%5]};animation-duration:${rnd(14,26)}s;animation-delay:${-rnd(0,24)}s`;
   notes.append(n)}}
 const hero=document.querySelector('.hero3d');
 if(hero){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;hero.style.transform=`rotateX(${(-y*14).toFixed(1)}deg) rotateY(${(x*16).toFixed(1)}deg)`});
  hero.addEventListener('pointerleave',()=>{hero.style.transform=''})}
})();
/* v16: header Invite/Lock are icon-only — tap the icon to drop its label below, tap the label (or the icon again) to act; hover reveals it on desktop */
(function(){const share=$('#share'),lock=$('#lock'),hdr=document.querySelector('header');
 if(!share||!lock||!hdr)return;
 /* take over the click: keep the original action, but only run it on the 2nd tap (or a tap on the label) */
 const orig={share:share.onclick,lock:lock.onclick};
 const tip=document.createElement('div');tip.className='hdr-tip';tip.hidden=true;hdr.append(tip);
 let openFor=null,hideT=null,lastTap={};
 const label=btn=>{const tx=btn.querySelector('.tx');return tx?tx.textContent.trim():(btn.id==='share'?'Invite':'Lock Playback')};
 const hideTip=()=>{clearTimeout(hideT);tip.hidden=true;openFor=null};
 const doAct=btn=>{hideTip();const h=orig[btn.id];if(h)h()};
 const showTip=btn=>{clearTimeout(hideT);tip.textContent=label(btn);tip.hidden=false;openFor=btn;
  const hr=hdr.getBoundingClientRect(),br=btn.getBoundingClientRect();
  tip.style.top=(br.bottom-hr.top+8)+'px';
  const left=Math.max(4,Math.min(br.left-hr.left+br.width/2-tip.offsetWidth/2,hr.width-tip.offsetWidth-4));
  const arrowX=Math.max(10,Math.min(br.left-hr.left+br.width/2-left,tip.offsetWidth-10));
  tip.style.left=left+'px';tip.style.setProperty('--tip-arrow-x',arrowX+'px')};
 const schedHide=()=>{clearTimeout(hideT);hideT=setTimeout(hideTip,250)};
 [share,lock].forEach(btn=>{
  btn.onclick=e=>{const now=Date.now();if(now-(lastTap[btn.id]||0)<300)return;lastTap[btn.id]=now;
   if(openFor===btn){doAct(btn)}else{showTip(btn)}};
 });
 tip.addEventListener('click',()=>{if(openFor)doAct(openFor)});
 document.addEventListener('click',e=>{if(openFor&&!tip.contains(e.target)&&!openFor.contains(e.target))hideTip()});
 if(window.matchMedia('(hover: hover)').matches){
  [share,lock].forEach(btn=>{btn.addEventListener('mouseenter',()=>showTip(btn));btn.addEventListener('mouseleave',schedHide)});
  tip.addEventListener('mouseenter',()=>clearTimeout(hideT));
  tip.addEventListener('mouseleave',schedHide);
 }
})();
showLikes()})();
