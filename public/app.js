const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const L=localStorage,T=sessionStorage,hex=()=>'#'+[0,1,2].map(()=>(100+Math.random()*155|0).toString(16)).join('');
/* v69: APK SMOOTH — backup native-app detection (the <head> script already checks the "wv" user agent; this catches Capacitor even if the UA does not say "wv"). When the app runs inside the Android APK (or any native shell), the <html> gets class "apk" and the CSS below turns ALL backdrop-filter off — Android WebView re-renders a blurred backdrop on every frame, so any animation makes every blurred element on every page flicker. With blur off the APK uses the solid backgrounds that are already there, and everything stops flickering. */
try{if(window.Capacitor||/\bwv\b/.test(navigator.userAgent))document.documentElement.classList.add('apk')}catch(e){}
/* v42: SAFE-AREA AUTO-DETECT — the app measures the device's real screen
   cutout (notch / Dynamic Island / home indicator) and adjusts every
   element automatically. CSS env() is the source of truth, but it can read
   0 in some webviews / cached shells, so we measure it with a probe and
   write it into --sat/--sab variables the layout uses. If the probe reads
   0 on a tall notched iPhone, we fall back to the island values (59/34)
   so nothing ever hides behind the camera. Re-runs on resize/rotate. */
const safeArea=()=>{
  try{
    let pr=document.querySelector('#sa-probe');
    if(!pr){pr=document.createElement('div');pr.id='sa-probe';
      pr.style.cssText='position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)';
      document.body.appendChild(pr);}
    const cs=getComputedStyle(pr);
    let t=parseFloat(cs.paddingTop)||0,b=parseFloat(cs.paddingBottom)||0,
        l=parseFloat(cs.paddingLeft)||0,r=parseFloat(cs.paddingRight)||0;
    /* Fallback: a tall iPhone (X and later, 812px+) always has a notch or
       Dynamic Island. If env() reported 0 here, the browser didn't expose
       it — use the island values rather than letting content hide.
       BUT only when running full-screen (home-screen app). In a browser
       (Chrome/Safari) env()=0 is CORRECT — the browser's own URL bar
       already sits below the island — so forcing 59px here doubles the
       gap and leaves a big empty space above the room header. */
    if(!t&&/iPhone/.test(navigator.userAgent)&&Math.max(screen.width,screen.height)>=812){
      const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;
      if(standalone){t=59;b=b||34}
    }
    const root=document.documentElement.style;
    root.setProperty('--sat',t+'px');root.setProperty('--sab',b+'px');
    root.setProperty('--sal',l+'px');root.setProperty('--sar',r+'px');
    document.documentElement.classList.toggle('has-notch',t>0);
  }catch(e){}
};
safeArea();
addEventListener('resize',()=>setTimeout(safeArea,120));
addEventListener('orientationchange',()=>setTimeout(safeArea,250));
/* v86: SELF-UPDATE — the home-screen app can get stuck on an old version
   (the page is resumed from a suspended state instead of freshly loaded,
   so it keeps serving the old cached shell and the user keeps seeing an
   old bug even though the live site already has the fix). This check fetches
   the live version and reloads the page the moment it differs from the
   version this page was built with. It runs once on load and again every
   time the app comes back to the foreground, so a pushed fix reaches the
   home-screen app on its very next open. It never reloads while a song is
   playing in a room (that would cut the music) — it waits until the app is
   on the landing page or the room is idle. */
const APP_VERSION='v89';
let verChecked=false;
const checkVersion=()=>{
  if(verChecked) return; verChecked=true;
  try{
    fetch('version.json?'+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
      verChecked=false;
      if(j&&j.version&&j.version!==APP_VERSION){
        const playing=document.body.classList.contains('in-room')&&document.body.classList.contains('playing');
        if(!playing) location.reload();
        else setTimeout(()=>{verChecked=false;checkVersion()},30000);
      }
    }).catch(()=>{verChecked=false});
  }catch(e){verChecked=false}
};
setTimeout(checkVersion,1500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(checkVersion,800)});
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{location.reload()});
}
/* v43: BEAT-REACTIVE SMOKE — the clouds used to drift at one fixed rate.
   Honest limit: the smoke CANNOT read the real YouTube audio (it plays
   inside YouTube's own frame, which the page cannot analyse), so there is
   no live frequency data. Instead the smoke dances to a musical beat
   driven by playback: on every beat each cloud jumps to a new RANDOM
   direction, distance and size at a random speed, the glow thumps, and
   particles burst — so it moves randomly in every direction with the
   song's rhythm instead of one steady drift. While paused the beat stops
   and the slow CSS drift takes over again. Skipped when the user asked
   for reduced motion. */
let smokeT=null,smokeBeat=0;
const smokeStart=()=>{
  if(smokeT)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const beat=()=>{
    smokeBeat++;
    const strong=smokeBeat%4===1; /* downbeat every 4th beat hits harder */
    document.querySelectorAll('.cosmic .cb').forEach(b=>{
      const ang=Math.random()*Math.PI*2,dist=24+Math.random()*56;
      const dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist;
      const s=0.9+Math.random()*0.35;
      b.animate({transform:`translate(${dx}px,${dy}px) scale(${s})`},
        {duration:380+Math.random()*700,easing:'ease-in-out',fill:'forwards'});
    });
    const pulse=document.querySelector('.cosmic .cpulse');
    if(pulse)pulse.animate([
      {transform:'translate(-50%,-50%) scale(1.14)',opacity:.95},
      {transform:'translate(-50%,-50%) scale(.86)',opacity:.5}
    ],{duration:strong?520:340,easing:'ease-out',fill:'forwards'});
    document.querySelectorAll('.cosmic .cp').forEach(p=>{
      if(Math.random()<0.5)p.animate(
        {transform:`translateY(-${20+Math.random()*44}px)`},
        {duration:480+Math.random()*520,easing:'ease-out',fill:'forwards'});
    });
    smokeT=setTimeout(beat,document.documentElement.classList.contains('apk')?1400+Math.random()*400:420+Math.random()*180); /* ~120 BPM with jitter — v70: in the APK the beat is ~3x slower (~40 BPM) so far fewer WAAPI animations fire while playing, which stops the playing flicker in the Android WebView. */
  };
  beat();
};
const smokeStop=()=>{
  if(smokeT){clearTimeout(smokeT);smokeT=null}
  document.querySelectorAll('.cosmic .cb,.cosmic .cpulse,.cosmic .cp')
    .forEach(el=>el.getAnimations().forEach(a=>a.cancel()));
};
const newId=()=>crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
/* Migrate the old shared ID once, then keep each tab's identity in sessionStorage. */
const getId=()=>{if(T.vid)return T.vid;const old=L.vid;if(old){L.removeItem('vid');return T.vid=old}return T.vid=newId()};
const me={id:getId(),name:L.vname||'Guest'+(10+Math.random()*89|0),color:L.vcolor||(L.vcolor=hex())};
const socket=io();let S=null,P=null,P2=null,PYT=null,PAU=null,auEl=null,joined=false,cv=null,cv2=null,recv=0,seeking=false,rtt=0,clockOff=0,pendT=null,needCatchup=false,lastSeek=0,lastRate=null;
/* v13: measure the round-trip to this device so the position estimate can
   subtract half of it (the one-way delay) — otherwise every listener lags
   by their own network delay. Smoothed so one slow packet can't jerk it. */
setInterval(()=>{if(socket.connected)socket.emit('ping',Date.now())},2000); /* v53: 2s ping (was 5s) so the RTT/clock-offset estimate stays fresh for the tighter sync */
socket.on('pong',t=>{const d=Date.now()-t;rtt=rtt?rtt*.7+d*.3:d});
const code=(location.pathname.match(/^\/room\/(\w+)/)||[])[1];
let rejoinRoom=()=>{};
/* v31: premium icons — one shared set of clean inline SVG icons (stroke
   based, currentColor, so they match the text around them). Every emoji in
   the app is replaced by one of these. app.js loads first, so karaoke.js
   and extras.js use the same set. */
const IC={
 speaker:'<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span>',
 check:'<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></span>',
 mic:'<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span>',
 crown:'<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7l4.5 4L12 4l5.5 7L22 7l-1.5 11h-17L2 7z"/><path d="M5 21h14"/></svg></span>',
 star:'<span class="ic"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>',
 ctrl:'<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg></span>',
 play:'<span class="ic"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"/></svg></span>',
 pause:'<span class="ic"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg></span>'};
const act=(a,cb)=>cb?socket.emit('act',a,cb):socket.emit('act',a),fmt=t=>{t=Math.max(0,t|0);return(t/60|0)+':'+String(t%60).padStart(2,'0')};
/* v30: ask for sound at the start. A browser will not play sound until the
   person taps the page — that tap is the "permission". There is no system
   "Allow audio?" popup for speakers (that popup is only for the microphone),
   so the app asks with one clear tap when it opens: it resumes an audio
   context and unmutes the player, which unlocks sound for the whole session.
   It runs on the landing page and on the join screen, so by the time a song
   plays the sound is already on. In an installed app (home screen) this is
   the first thing the person sees. */
/* v60: SOUND PERMISSION IS REMEMBERED ON THIS DEVICE — sndOn used to start as false on every page load, so the "Enable sound" popup appeared every time a room was joined, even though unlockAudio() had already saved L.snd='1'. Nothing ever read that saved value back. Now sndOn is initialised from localStorage at startup: once the user has enabled sound on this device, it stays enabled and the popup never asks again. */
let __ac=null,sndOn=false;try{sndOn=L.snd==='1'}catch{}
async function unlockAudio(){try{__ac=__ac||new (window.AudioContext||window.webkitAudioContext)();await __ac.resume()}catch{}if(P){try{applyVolume(P)}catch{}/* v57: the Enable-sound tap is a real user gesture — start the player NOW if the room is playing, so a guest who joins a live song actually hears it. Before this, unlockAudio only resumed the AudioContext and the player stayed paused (the browser blocks playVideo on a timer, so only a gesture can start it — a guest whose tap did not start the player heard nothing while everyone else heard the song). */if(S?.cur?.playing&&P.playVideo){try{P.playVideo()}catch{}}}/* v32: a tap also unlocks the singer's voice (the karaoke audio element) if it is already streaming. */
 if(typeof kvPlay==='function')kvPlay();sndOn=true;hideSndModal();
 document.querySelectorAll('.snd').forEach(b=>{b.innerHTML=IC.check+' Sound on';b.classList.add('on');b.disabled=true});
 try{L.snd='1'}catch{}}
/* v35: the sound prompt is a small premium popup that appears the moment
   someone creates or joins a room (not a big button on the home screen).
   It shows once per page load, and only if sound is not already enabled. */
let sndAsked=false;
function showSndModal(){if(sndAsked||sndOn)return;sndAsked=true;const m=$('#snd-modal');if(m)m.hidden=false}
/* v61: show the one-line iOS volume tip (YouTube volume is locked to the device buttons on iPhone/iPad) — only on iOS, nowhere else. */
try{if(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)){const t=document.querySelector('#ios-vol-tip');if(t)t.hidden=false}}catch{}
function hideSndModal(){const m=$('#snd-modal');if(m)m.hidden=true}
$('#snd-go').onclick=async()=>{await unlockAudio();hideSndModal()};
$('#snd-x').onclick=hideSndModal;$('#snd-later').onclick=hideSndModal;
$('#snd-modal').addEventListener('click',e=>{if(e.target.id==='snd-modal')hideSndModal()});
document.querySelectorAll('.snd').forEach(b=>b.onclick=unlockAudio);
/* v36: history that survives a refresh — rooms you visited and songs played,
   saved on this device (localStorage). A refresh never loses them, and the
   room you were in is rejoined automatically. */
const histGet=(k)=>{try{return JSON.parse(L[k]||'[]')}catch{return[]}};
const histSet=(k,v)=>{try{L[k]=JSON.stringify(v)}catch{}};
const histWhen=(t)=>{const s=Math.floor((Date.now()-t)/1000);if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago'};
/* rooms: [{code, at}] — most recent first, cap 20. Migrates the old L.recent
   (plain codes) once, so nothing you already had is lost. */
const getRooms=()=>{let r=histGet('rooms');if(!r.length){const old=histGet('recent');if(old.length){r=old.map(c=>({code:typeof c==='string'?c:c.code,at:Date.now()}));histSet('rooms',r)}}return r.filter(x=>x&&x.code)};
const saveRoom=(code)=>{const c=code.toUpperCase(),r=getRooms().filter(x=>x.code!==c);r.unshift({code:c,at:Date.now()});histSet('rooms',r.slice(0,20));try{L.lastRoom=c}catch{}};
/* songs: [{id, title, at, room}] — most recent first, cap 100, one entry per
   song (a replay moves it to the top). */
const getSongs=()=>histGet('songs').filter(x=>x&&x.id);
let lastHistTid=null;
const recordSong=()=>{const c=S?.cur;if(!c||!c.videoId||c.tid===lastHistTid)return;lastHistTid=c.tid;
 const s=getSongs().filter(x=>x.id!==c.videoId);
 s.unshift({id:c.videoId,title:c.title||c.videoId,at:Date.now(),room:S.code});
 histSet('songs',s.slice(0,100))};
/* v46: YOUR PLAYLIST — every YouTube link YOU paste is saved here, on this
   device (localStorage), so your favourite songs are one tap away in any
   room. It stores links only (videoId + title/channel/artwork), not the
   video files — YouTube does not allow downloading, so the songs still
   stream from YouTube and need the internet. Tapping a playlist song
   queues it into the room. `myPastes` remembers the videoIds you pasted
   (the current track has no byId in the state the server sends, so the
   queue's byId alone cannot catch a song that became current at once). */
const vidFromUrl=u=>{const m=String(u||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/);return m?m[1]:null};
const myPastes=new Set();
const getPlaylist=()=>histGet('playlist').filter(x=>x&&x.id);
const savePlaylist=p=>histSet('playlist',p.slice(0,100));
const addToPlaylist=t=>{if(!t||!t.videoId)return;const p=getPlaylist();if(p.some(x=>x.id===t.videoId))return;
 p.unshift({id:t.videoId,title:t.title||'YouTube video',channel:t.channel||'',artwork:t.artwork||('https://i.ytimg.com/vi/'+t.videoId+'/hqdefault.jpg'),at:Date.now()});savePlaylist(p)};
const renderPlaylist=()=>{const p=getPlaylist(),el=document.querySelector('#playlist');if(!el)return;
 const n=document.querySelector('#playlist-n');if(n)n.textContent=p.length;
 el.innerHTML=p.length?p.map(s=>`<li><img src="${esc(s.artwork)}" alt=""><div><b>${esc(s.title)}</b><small>${esc(s.channel||'YouTube')}</small></div><button data-plq="${esc(s.id)}" aria-label="Queue ${esc(s.title)}">Queue</button><button class="pl-x" data-plx="${esc(s.id)}" aria-label="Remove ${esc(s.title)} from playlist">✕</button></li>`).join(''):'<li class="empty"><div><small>No songs saved yet. Paste a link above and it lands here.</small></div></li>';
 const cl=document.querySelector('#playlist-clear');if(cl)cl.hidden=!p.length};
/* the three-dots history menu */
const histPanel=$('#hist-panel');
const renderHist=()=>{
 const songs=getSongs();
 $('#hist-songs').innerHTML=songs.length?songs.map(s=>`<div class="hist-item"><div class="ht"><b>${esc(s.title)}</b><small>${histWhen(s.at)}${s.room?' · Room '+esc(s.room):''}</small></div><button data-copy="${esc(s.id)}">Copy link</button><button class="go" data-add="${esc(s.id)}">Add to queue</button></div>`).join(''):'<div class="hist-empty">No songs played yet.</div>'};
$('#hist').onclick=e=>{e.stopPropagation();renderHist();histPanel.hidden=!histPanel.hidden};
$('#hist-x').onclick=()=>{histPanel.hidden=true};
document.addEventListener('click',e=>{if(!histPanel.hidden&&!e.target.closest('#hist-panel')&&!e.target.closest('#hist'))histPanel.hidden=true});
$('#hist-clear').onclick=()=>{histSet('songs',[]);renderHist();toast('History cleared')};
const fallbackCopy=(text,done)=>{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch{}ta.remove()};
histPanel.addEventListener('click',e=>{
 const rj=e.target.closest('[data-rejoin]');if(rj){location.href='/room/'+rj.dataset.rejoin;return}
 const cp=e.target.closest('[data-copy]');if(cp){const u='https://www.youtube.com/watch?v='+cp.dataset.copy;
  const done=()=>toast('Song link copied');
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(u).then(done,()=>fallbackCopy(u,done));else fallbackCopy(u,done);return}
 const ad=e.target.closest('[data-add]');if(ad){myPastes.add(ad.dataset.add);act({type:'add',url:'https://youtu.be/'+ad.dataset.add});histPanel.hidden=true;toast('Adding to the queue…')}});
let toastTimer,videoCheckTimer=0,videoCheckSequence=0,checkedVideoUrl='',checkedVideoStatus='';
const toast=m=>{const box=$('#toasts');clearTimeout(toastTimer);box.textContent='';const d=document.createElement('div');d.className='toast';d.textContent=m;box.append(d);toastTimer=setTimeout(()=>{if(d.parentNode===box)d.remove()},3500);
 /* v45: swipe a notification UP to dismiss it early — the toast follows
    your finger as you drag it up and fades, and past ~50px it flies off
    and is gone. A short drag snaps it back. Works with a finger (touch)
    and with a mouse drag. The 3.5s auto-dismiss still applies if you
    leave it alone. */
 let sy=null,dragging=false;
 const dismiss=()=>{clearTimeout(toastTimer);d.style.transition='transform .22s ease-out,opacity .22s ease-out';d.style.transform='translateY(-120%)';d.style.opacity='0';setTimeout(()=>d.remove(),220)};
 d.addEventListener('pointerdown',e=>{sy=e.clientY;dragging=true;d.style.animation='none';try{d.setPointerCapture(e.pointerId)}catch(_){}});
 d.addEventListener('pointermove',e=>{if(!dragging||sy===null)return;const dy=e.clientY-sy;if(dy<0){d.style.transform='translateY('+dy+'px)';d.style.opacity=String(Math.max(.25,1+dy/160))}});
 const end=e=>{if(!dragging)return;dragging=false;const dy=sy===null?0:e.clientY-sy;sy=null;if(dy<-50){dismiss()}else{d.style.transition='transform .22s ease-out,opacity .22s ease-out';d.style.transform='';d.style.opacity='';setTimeout(()=>{d.style.transition=''},230)}};
 d.addEventListener('pointerup',end);d.addEventListener('pointercancel',end)};
function renderVideoCheck(result){
 const status=result?.status||'error',messages={
  checking:'Checking YouTube embed restrictions…',
  embeddable:'YouTube marks this video as embeddable. Availability may still vary by account or region.',
  blocked:'YouTube marks this video as not embeddable; it will not play in Vibe Room.',
  unavailable:'YouTube could not find a public video for this link. It may be private, removed, or unavailable.',
  unconfigured:'Playback restrictions cannot be checked yet. You can still try adding this video.',
  invalid:'Paste a valid YouTube video link to check it.',
  'rate-limited':'Wait a moment before checking another video.',
  error:'Could not check YouTube restrictions'+(result?.httpStatus?' (HTTP '+result.httpStatus+')':'')+'. You can still try adding it.'
 };
 const statusBox=$('#video-check');statusBox.dataset.status=status;statusBox.textContent=messages[status]||messages.error;statusBox.hidden=false
}
const volumeOnIcon=$('#vm').innerHTML,volumeMutedIcon='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="17" y1="9" x2="22" y2="14"/><line x1="22" y1="9" x2="17" y2="14"/></svg>';
let volume=80,lastVolume=80,volumeMuted=false;
function applyVolume(pl){if(!pl)return;pl.setVolume?.(volume) /* v49: never mute()/unMute() — mute is just volume 0. mute() is a separate player state the phone's volume buttons cannot undo, so a muted player stayed silent even when the user pressed volume up. setVolume(0) mutes, setVolume(n) unmutes, and the phone buttons always work. */}
function setVolume(value,immediate){volume=Math.max(0,Math.min(100,Math.round(Number(value)||0)));if(volume>0)lastVolume=volume;const wasMuted=volumeMuted;volumeMuted=volume===0;const vEl=$('#vol');vEl.value=String(volume);vEl.style.setProperty('--p',volume+'%');/* v49: the mute icon is only rebuilt when the muted state actually flips — the old code replaced the SVG innerHTML on EVERY input event while dragging, and that rebuild is what made the slider stutter. */if(wasMuted!==volumeMuted){$('#vm').innerHTML=volumeMuted?volumeMutedIcon:volumeOnIcon;$('#vm').setAttribute('aria-label',volumeMuted?'Unmute':'Mute');$('#vm').setAttribute('aria-pressed',String(volumeMuted))}/* v47: keep the karaoke Mix music slider in sync with the main volume slider — both control the same YouTube volume. */const mm=document.querySelector('#kmix-m');if(mm){mm.value=String(volume);mm.style.setProperty('--p',volume+'%')}const mmv=document.querySelector('#kmix-mv');if(mmv)mmv.textContent=String(volume);/* v45: the iframe is told at most once every 60ms while dragging, and immediately on release (change) or on a button tap. */if(immediate){if(volT){clearTimeout(volT);volT=null}[P,P2].forEach(applyVolume);return}if(volT)return;volT=setTimeout(()=>{volT=null;[P,P2].forEach(applyVolume)},60)}
let volT=null;
/* clean line icons (Feather-style) for the header, like the mockup */
const AIC=(p)=>'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const AIC_LOCK=AIC('<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/><path d="M12 16v2"/>');
const AIC_UNLOCK=AIC('<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 7.8-1"/><circle cx="12" cy="15" r="1"/><path d="M12 16v2"/>');
const AIC_USERS='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const showJoinError=message=>{$('#gate').classList.add('gate-error');$('#gt').textContent='Room unavailable';$('#gs').textContent='This invite link may be incorrect or expired.';$('#ge').textContent=message+' Create a new room to get a fresh invite link.';$('#join-fields').hidden=true;$('#go').hidden=true;$('#new-room').hidden=false;$('#home-link').hidden=false};
if(!code){$('#home').hidden=false;
 $('#create').onclick=()=>socket.emit('create',me,r=>location.href='/room/'+r.code);
 $('#jf').onsubmit=e=>{e.preventDefault();const c=$('#jc').value.trim().toUpperCase();if(c)location.href='/room/'+c};
 /* v45: SCAN QR TO JOIN — opens the camera (back camera on phones) in a
    premium viewfinder and decodes the room invite QR with the local jsQR
    library. No photo is taken, stored or sent anywhere — the camera feed
    is read frame-by-frame in the page and stopped the moment the modal
    closes. A scanned invite is just a room URL (/room/XXXXXX) or a bare
    6-letter code; anything else gets a polite "not a Vibe Room invite"
    message and keeps scanning. Camera needs https (the live site) or
    localhost; if it is denied or unavailable, the message says so and
    the code box stays as the fallback. */
 let qrStream=null,qrRaf=null;
 const qrModal=$('#qr-modal'),qrVideo=$('#qr-video'),qrMsg=$('#qr-msg');
 const closeQrScan=()=>{if(qrRaf){cancelAnimationFrame(qrRaf);qrRaf=null}if(qrStream){qrStream.getTracks().forEach(t=>t.stop());qrStream=null}if(qrVideo)qrVideo.srcObject=null;if(qrModal)qrModal.hidden=true};
 const handleQrCode=text=>{
   const m=text.match(/\/room\/([A-Za-z0-9]{6})/i)||text.trim().match(/^([A-Za-z0-9]{6})$/);
   if(m){closeQrScan();location.href='/room/'+m[1].toUpperCase();return}
   if(qrMsg)qrMsg.textContent='That QR code is not a Vibe Room invite — try another one.'};
 const scanLoop=()=>{
   if(qrVideo&&qrVideo.readyState===qrVideo.HAVE_ENOUGH_DATA){
     const cv=$('#qr-canvas'),ctx=cv.getContext('2d');
     cv.width=qrVideo.videoWidth;cv.height=qrVideo.videoHeight;
     ctx.drawImage(qrVideo,0,0,cv.width,cv.height);
     try{const img=ctx.getImageData(0,0,cv.width,cv.height);
       const code=window.jsQR&&jsQR(img.data,img.width,img.height);
       if(code&&code.data){handleQrCode(code.data);return}}catch(e){}
   }
   qrRaf=requestAnimationFrame(scanLoop)};
 const openQrScan=async()=>{
   if(!qrModal)return;qrModal.hidden=false;if(qrMsg)qrMsg.textContent='';
   if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
     if(qrMsg)qrMsg.textContent='This browser cannot open the camera — type the 6-letter code instead.';return}
   try{
     qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
     qrVideo.srcObject=qrStream;await qrVideo.play();scanLoop();
   }catch(e){
     if(qrMsg)qrMsg.textContent='Camera unavailable — please allow camera access, or type the 6-letter code instead.'}};
 $('#scan-qr').onclick=openQrScan;
 $('#qr-x').onclick=closeQrScan;$('#qr-cancel').onclick=closeQrScan;
 if(qrModal)qrModal.addEventListener('click',e=>{if(e.target===qrModal)closeQrScan()});
 const rc=getRooms().slice(0,5);$('#recent').innerHTML=rc.length?'<p class="recent-title">Recent rooms</p><div class="recent-list">'+rc.map(c=>`<a href="/room/${esc(c.code)}">${esc(c.code)}</a>`).join('')+'</div>':''}
else{$('#gate').hidden=false;$('#home-link').hidden=false;$('#gn').value=me.name;$('#gc').value=me.color.length==7?me.color:'#ff2d87';
 $('#new-room').onclick=()=>{const b=$('#new-room');b.disabled=true;b.textContent='Creating room…';socket.emit('create',me,r=>{if(!r?.code){b.disabled=false;b.textContent='Create a new room';$('#ge').textContent='Could not create a room. Please try again.';return}location.href='/room/'+r.code})};
 const joinRoom=()=>socket.emit('join',{code,...me},r=>{if(r.error){if(joined){joined=false;document.body.classList.remove('in-room');$('#room').hidden=true;$('#gate').hidden=false}showJoinError(r.error);return}if(r.id)me.id=T.vid=r.id;
  if(joined){if(S)render();return}
  $('#gate').classList.remove('gate-error');$('#gt').textContent='Room '+code.toUpperCase();$('#gs').textContent='Choose your name, then join the room.';$('#ge').textContent='';$('#join-fields').hidden=false;$('#go').hidden=false;$('#go').disabled=false;$('#new-room').hidden=true;$('#new-room').disabled=false;$('#new-room').textContent='Create a new room';
  /* v36: if you refresh while in this room, you are back in it instantly —
     your name is already filled in from last time, so join right away. */
  try{if(L.lastRoom===code.toUpperCase())setTimeout(()=>{if(!joined&&!$('#go').disabled)$('#go').click()},400)}catch{}});
 rejoinRoom=joinRoom;socket.on('connect',joinRoom);
 /* v24: create the player NOW, while the gate is showing, so it already exists
    when the person taps "Join audio stream". That tap is the gesture the
    browser needs to allow sound — if the player is only created after the
    join comes back (as before), the tap has already finished and the browser
    may still block the sound. */
 initPlayer();
 $('#go').onclick=()=>{me.name=L.vname=$('#gn').value.trim()||me.name;me.color=L.vcolor=$('#gc').value;$('#go').disabled=true;$('#go').textContent='Joining…';
  /* v24: unlock this person's sound INSIDE the Join tap, while it is still a
     user gesture. The browser only allows sound after THIS person taps on
     THIS device — the host pressing Play does nothing for a guest's browser.
     So the Join tap (which everyone already does) is the moment to unlock
     it. After this, when the host plays a song, it just plays. */
  if(P){applyVolume(P);if(P.playVideo&&S?.cur?.playing)P.playVideo()}
  socket.emit('join',{code,...me},r=>{if(r.error){showJoinError(r.error);return}if(r.id)me.id=T.vid=r.id;
  joined=true;document.body.classList.add('in-room'); /* v14: hide the landing/gate FX once inside a room */
  $('#gate').hidden=true;$('#room').hidden=false;initPlayer();if(S)render();showSndModal();saveRoom(code)})};
 const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.append(s)}
window.onYouTubeIframeAPIReady=()=>{window.ytr=1};
function pReady(e){applyVolume(e.target);capQuality();sync()}
function pState(e){if(e.target!==P)return;
 if(document.hidden&&e.target!==PAU&&e.data===1){try{e.target.pauseVideo?.()}catch(err){}return}
 if(e.data===0&&S?.cur)act({type:'ended',v:S.cur.videoId});if(e.data===1){$('#audio-unlock').hidden=true;/* v45: tell the server this controller's player is actually sounding, so the server starts the track clock NOW (from 0) instead of from when the track was queued — the song then starts from second 1 instead of a few seconds in. */if(S?.cur&&me){const cc=S.hostId===me.id||(S.co||[]).includes(me.id)||(S.ctrl||[]).includes(me.id);if(cc)act({type:'started',v:S.cur.videoId})}}if(e.data===1||e.data===2)sync()}
function pErr(e){if(e.target===P&&S?.cur)act({type:'bad',v:S.cur.videoId,code:e.data})}
/* v52: UPLOADED AUDIO — a plain <audio> element plays the user's own
   uploaded file. Unlike the YouTube iframe (a video element, which iOS
   suspends the moment the screen locks or the user switches apps), a real
   <audio> element keeps playing through lock and app-switching — the
   system treats it as audio, so it is not suspended, and it gets proper
   lock-screen controls through Media Session. This adapter makes the
   <audio> element speak the same API as the YouTube player
   (playVideo/pauseVideo/seekTo/getCurrentTime/getPlayerState/setVolume/
   loadVideoById/cueVideoById/getDuration/setPlaybackRate/...) so the sync
   loop, volume, seek and Media Session code all work unchanged. P is the
   CURRENT player: it points at PYT (YouTube) or PAU (this adapter)
   depending on the current track's kind; sync() swaps it when the track
   changes. (auEl is declared with the other globals at the top of this
   file, so it exists before initPlayer() runs on the gate.) */
function makeAudioPlayer(){
  auEl=document.querySelector('#au-el');
  if(!auEl)return null;
  /* v76: BACKGROUND-FRIENDLY UPLOADED AUDIO — the <audio> element's output is
     intentionally NOT routed through Web Audio. A Web Audio AudioContext can be
     suspended by the OS when the app is backgrounded, silencing its
     MediaElementAudioSource even though the <audio> element is still playing.
     Native element output keeps the browser's media lifecycle and lets the
     song continue with the screen locked on supported devices. YouTube stays
     a foreground embed. (Trade-off, stated plainly: on iPhone/iPad the app's
     volume slider no longer changes uploaded songs — <audio>.volume is
     read-only there, and the GainNode that made the slider work is what
     could go silent in the background. Use the side buttons for uploaded
     songs on iOS. On Android and desktop the slider still works, because
     <audio>.volume is controllable there.) */
  const ap={_st:2,_src:null,
    _fire(st){if(ap._st===st)return;ap._st=st;pState({target:ap,data:st});updateMediaSession()},
    playVideo(){const result=auEl.play();if(result&&result.catch)result.catch(()=>{
      if(!document.hidden&&S?.cur?.playing){const b=$('#audio-unlock');if(b)b.hidden=false}
    })},
    pauseVideo(){auEl.pause()},
    stopVideo(){auEl.pause();auEl.removeAttribute('src');auEl.load();ap._src=null;ap._st=2},
    seekTo(t){try{auEl.currentTime=Math.max(0,t||0)}catch(e){}},
    getCurrentTime(){return auEl.currentTime||0},
    getDuration(){return (auEl.duration&&isFinite(auEl.duration))?auEl.duration:0},
    getPlayerState(){return ap._st},
    setVolume(v){const vv=Math.max(0,Math.min(100,v||0))/100;try{auEl.volume=vv}catch(e){}},
    getVolume(){return volume},
    isMuted(){return volume===0},
    getPlaybackQuality(){return 'small'},
    setPlaybackQuality(){},setPlaybackQualityRange(){},
    setPlaybackRate(r){try{auEl.playbackRate=r||1}catch(e){}},
    getPlaybackRate(){return auEl.playbackRate||1},
    loadVideoById(vid,t){ap._load(vid,t,true)},
    cueVideoById(vid,t){ap._load(vid,t,false)},
    _load(vid,t,play){
      const src=S?.cur?.src;
      if(!src)return;
      if(ap._src!==src){ap._src=src;auEl.src=src;auEl.load()}
      if(typeof t==='number'){try{auEl.currentTime=Math.max(0,t)}catch(e){}}
      if(play)ap.playVideo()
    }
  };
  auEl.addEventListener('play',()=>ap._fire(1));
  auEl.addEventListener('pause',()=>{if(!auEl.ended)ap._fire(2)});
  auEl.addEventListener('ended',()=>ap._fire(0));
  auEl.addEventListener('waiting',()=>ap._fire(3));
  auEl.addEventListener('playing',()=>ap._fire(1));
  auEl.addEventListener('error',()=>{pErr({target:ap,data:2})});
  return ap;
}
function initPlayer(){if(PYT)return; /* v24: only create the player once — it is now created early (on the gate) so it exists when the user taps Join, and again after joining */
 if(!PAU)PAU=makeAudioPlayer();
 if(!window.ytr)return setTimeout(initPlayer,200);
 PYT=new YT.Player('pl',{width:427,height:240,playerVars:{controls:0,disablekb:1,playsinline:1,modestbranding:1,rel:0,vq:'tiny'},
 events:{onReady:pReady,onStateChange:pState,onError:pErr,onAutoplayBlocked:()=>{/* v43: never ask again here — the only audio ask is the mandatory popup right after joining/creating a room */}}});
 /* v52: P is the CURRENT player — the audio adapter when the current track is an uploaded file, the YouTube player otherwise. */
 P=(S?.cur?.kind==='audio'&&PAU)?PAU:PYT;
 /* v17: a 2nd hidden player that pre-buffers the next track so a song change starts instantly instead of re-buffering */
 try{P2=new YT.Player('pl2',{width:320,height:180,playerVars:{controls:0,disablekb:1,playsinline:1,modestbranding:1,rel:0,vq:'tiny'},
 events:{onReady:pReady,onStateChange:pState,onError:pErr}})}catch(e){P2=null} /* if the 2nd player can't start, the room still works on the single player */}
/* audio-only room: the video is hidden behind the hub, so cap it at 144p.
   The sound is identical at every quality — only the hidden picture gets
   smaller — and a 144p stream needs a fraction of the bandwidth, so it
   stops re-buffering on ordinary connections. v54: was 240p ('small') —
   240p decode is the #1 reason the phone heats up while a song plays
   (v50 fixed the CSS blur, but not the decode). 144p cuts the decoded
   pixels by ~60% and the audio is untouched. */
function capQuality(){[P,P2].forEach(pl=>{if(!pl||!pl.setPlaybackQuality)return;try{/* v54: cap to 144p ('tiny'). Only touch the quality when it actually crept up, so a forced change never cuts the audio. */const q=pl.getPlaybackQuality&&pl.getPlaybackQuality();if(q==='tiny')return;pl.setPlaybackQuality('tiny');if(pl.setPlaybackQualityRange)pl.setPlaybackQualityRange('tiny','tiny')}catch(e){}})}
/* v17: keep the next track buffered in the hidden 2nd player while the current one plays */
function preloadNext(){if(!P2||!P2.cueVideoById||!S)return;const n=S.queue&&S.queue[0];
 if(!n)return; /* no next track — leave cv2 alone so a just-preloaded track can still be swapped in when it becomes current */
 if(n.kind==='audio')return; /* v52: the 2nd player is a YouTube player — it cannot preload an uploaded audio file. The <audio> element loads fast enough on its own. */
 if(P&&P.getPlayerState&&P.getPlayerState()===3)return; /* v23: don't preload while the current track is buffering — the 2nd player would steal bandwidth and make the stall worse. It resumes once the current track is playing again. */
 if(cv2!==n.videoId){cv2=n.videoId;try{P2.cueVideoById(n.videoId)}catch(e){}capQuality()}}
/* v23: re-apply the 240p cap every 2s. YouTube's adaptive streaming can creep
   the hidden player's quality up mid-song (more data = more buffering on a
   slow connection), and the cap was only applied when a track loaded. */
/* v45: the 2s capQuality interval is REMOVED — it was still cutting the audio.
   v43 made capQuality check first, but YouTube's adaptive streaming keeps
   raising the quality back up on a good connection, so every 2s capQuality
   forced it back down to small — and each forced quality change gaps the
   audio for a moment, over and over. The cap is now applied only at track
   load (pReady / sync load / preload swap), where no audio is playing yet
   to cut, and setPlaybackQualityRange('tiny','tiny') keeps adaptive
   streaming inside the cap (v54: 144p, was 240p, to keep the phone cool).
   A higher quality mid-song does not cut audio;
   only a FORCED change does, so there is nothing to re-apply. */
const est=()=>S?.cur?(S.cur.pending?0:S.cur.pos+(S.cur.playing?(Date.now()-recv+rtt/2)/1000*(S.cur.speed||1):0)):0;
let bufSince=0;
function sync(){if(!P||!P.loadVideoById||!S)return;const c=S.cur;if(!c){P.stopVideo?.();cv=null;needCatchup=false;return}
 /* v17 scheduled start: if this action is for a future server time, don't touch the player yet — wait until that instant, then apply it */
 const at=c.playAt?c.playAt-clockOff:0;
 if(at>Date.now()+30){clearTimeout(pendT);pendT=setTimeout(()=>{pendT=null;sync()},at-Date.now());return}
 if(cv!==c.videoId){
  /* v52: pick the player for this track — the <audio> element for an uploaded file (it keeps playing when the phone locks or the user switches apps), the YouTube player otherwise. When swapping, stop the old player so the two never sound at once. */
  const want=(c.kind==='audio'&&PAU)?PAU:PYT;
  if(want&&P!==want){const old=P;P=want;try{old&&old.stopVideo&&old.stopVideo()}catch(e){}}
  if(P===PAU){cv=c.videoId;if(c.playing)P.loadVideoById(c.videoId,est());else P.cueVideoById(c.videoId,est());capQuality()}
  /* v17 preload swap: if the 2nd player already has this track buffered, make it the live player so it starts instantly */
  else if(P2&&cv2===c.videoId&&P2.getPlayerState){const tmp=P;P=P2;P2=tmp;cv2=cv;cv=c.videoId;P2.stopVideo?.();capQuality()}
  else{cv=c.videoId;if(c.playing)P.loadVideoById(c.videoId,est());else P.cueVideoById(c.videoId,est());capQuality()}
  needCatchup=true /* v17: fresh load — jump straight to the live position instead of drifting there */}
 /* v76: YOUTUBE IS FOREGROUND-ONLY — the YouTube IFrame API must not be used
    for background video/audio playback. When the app hides, pause an active
    YouTube video and leave the room state untouched. Once visible, the room
    reloads the current video at the room position. Uploaded audio is
    deliberately exempt; it uses the direct <audio> path. */
 if(document.hidden&&c.kind!=='audio'){
   if(P===PAU){try{P.stopVideo()}catch(e){} P=PYT||P}
   try{if(P!==PAU&&P?.getPlayerState?.()===1)P.pauseVideo()}catch(e){}
   cv=null;needCatchup=false;return
 }
 const st=P.getPlayerState(),t=est(),now=P.getCurrentTime?.()||0,d=t-now,ad=Math.abs(d),rate=c.speed||1;
 /* v45: no cuts, completely. Three changes. (1) Seeks are now rare — only
    past 2.0s while playing (was 1.0s). Drift up to 2.0s is corrected gently
    by the speed nudge, which never interrupts the audio. A seek is the
    only thing that throws the buffer away, so the threshold is the cut.
    (2) The playback rate is only set when it actually CHANGES — sync()
    used to call setPlaybackRate on every run even for the same value, and
    a rate that flips around the 0.15s threshold churns the player.
    (3) The 2s capQuality interval is gone (see above) — it was forcing a
    quality change every 2s whenever YouTube raised the quality, and each
    forced change gaps the audio. Sync is now within ~2s instead of ~1s;
    that is the price of a song that never cuts, and the user asked for
    continuous playback above tight sync. */
 /* v45: GENTLE speed nudge — the old 1.15x/0.85x (15% faster/slower) was
    clearly audible: the song suddenly sounded fast, then normal, then fast
    again, as the drift crossed the 0.15s threshold. Now the deadband is
    0.5s (drift under half a second is ignored — nobody can hear it), and
    the correction is proportional and capped at 5%: a 0.5s drift gets
    ~1.25%, a 2s drift gets 5%. That is barely audible, and the song no
    longer surges. Drift past 2s is still fixed by a seek (below). */
 /* v53: tighter sync — the speed nudge now covers 0.5s–1.5s (was 0.5s–2s) and the drift seek below fires at 1.5s (was 2s), so the room holds within ~1.5s instead of ~2s. The 3s seek cooldown stays, so seeks still cannot loop and cut the audio. */
 let target=rate;if(!document.hidden&&ad>=0.5&&ad<1.5){const corr=Math.min(0.05,ad*0.025);target=rate*(d>0?1+corr:1-corr)}
 if(target!==lastRate){P.setPlaybackRate(target);lastRate=target}
 /* v21: while your own tap is still on its way to the server (~200ms), don't
    let the sync loop undo it — it still sees the old server state. The guard
    expires after 1s, so if the broadcast is ever lost, sync resumes normally. */
 const localPending=localT&&Date.now()-localT<1000&&S.cur.playing===localWas;
 if(!localPending){if(c.playing&&st!==1&&st!==3)P.playVideo();if(!c.playing&&st===1)P.pauseVideo()}
 /* v76: a background audio element must be allowed to continue playing
    without repeated seek/speed corrections. Browser timer throttling can
    make the estimated room clock unreliable and turn those corrections
    into skips. On return to the foreground, normal room synchronization
    resumes. */
 if(document.hidden&&P===PAU)return;
 /* v17 catch-up: on a fresh load, seek straight to the live position the moment the player can seek (don't wait for the drift to grow past the normal threshold) */
 /* v43: seek cooldown — a seek itself briefly interrupts the audio, so
    never seek twice within 3s. Without this a drifting player could seek,
    re-buffer, drift again and seek again in a loop (cut, play, cut, play).
    The fresh-load catch-up seek is exempt (it must jump once, immediately). */
 /* v53: RESCUE SEEK — the old code never sought while buffering (st===3), so a slow WebView that kept buffering sat further and further behind with no correction at all (the 5s+ lag). If it is buffering AND more than 3s behind, seek anyway: YouTube re-buffers at the right position instead of staying behind. */
 if(!seeking&&needCatchup&&(st===1||st===2)){P.seekTo(t,true);needCatchup=false;lastSeek=Date.now()}
 else if(!seeking&&Date.now()-lastSeek>3000){if(st===1&&ad>=1.5){P.seekTo(t,true);lastSeek=Date.now()}else if(st===2&&ad>.5){P.seekTo(t,true);lastSeek=Date.now()}else if(st===3&&ad>=3){P.seekTo(t,true);lastSeek=Date.now()}}
 const syn=$('#sync');
 if(st===3){syn.className='off';syn.textContent='● Buffering…'}
 else{const ok=ad<1.5;syn.className=ok?'':'off';syn.textContent=ok?'● In Sync':'● Syncing…'}}
socket.on('state',s=>{S=s;recv=Date.now();
/* v17: server clock minus this device's clock (one-way delay already removed) — used to run scheduled actions at the same instant on every device */
clockOff=S.now+rtt/2-recv;
if(!S.cur||!S.cur.playing)$('#audio-unlock').hidden=true;
render();sync();updateMediaSession();preloadNext()});socket.on('say',toast);
socket.on('react',r=>{const d=document.createElement('div');d.className='fl';d.textContent=r.e;d.style.left=(10+Math.random()*80)+'%';$('#fl').append(d);setTimeout(()=>d.remove(),2400)});
/* v55: COOL MODE + AUTO-DIM. Two ways to keep the phone cool while a song
   plays. (1) Cool mode — a manual toggle (More tab) that dims the whole
   page to near-black and freezes the decorative animations; the music
   keeps playing, only the visuals rest. It is saved on the device, so it
   survives a refresh. (2) Auto-dim — if Cool mode is off and nobody
   touches the page for 30s while a song plays, the page goes still
   (v56: STATIC, not black — all decorative animations freeze but the
   colours stay, because the blackout looked bad); any tap, scroll, key
   or slider move wakes it and restarts the 30s countdown. Pausing the
   song also wakes it. Cool mode is the 'cool' body class (black);
   auto-dim is the 'idle' body class (static, colourful). */
let coolMode=false;try{coolMode=L.getItem('cool')==='1'}catch(e){}
let autoDimmed=false,idleT=null;
function applyDim(){document.body.classList.toggle('cool',coolMode);document.body.classList.toggle('idle',autoDimmed&&!coolMode);const sw=document.querySelector('#cool-toggle');if(sw){sw.setAttribute('aria-checked',String(coolMode));sw.classList.toggle('on',coolMode)}}
function setCool(on){coolMode=!!on;try{L.setItem('cool',coolMode?'1':'0')}catch(e){}applyDim();armIdle();wakeSync(); /* v68: toggling Cool mode immediately releases (on) or re-acquires (off) the wake lock, and stops (on) or restarts (off) the smoke beat — so the phone starts cooling the moment Cool mode is switched on. */ if(coolMode)smokeStop();else if(S?.cur?.playing)smokeStart();}
function armIdle(){const should=S&&S.cur&&S.cur.playing&&!coolMode;if(!should){if(idleT){clearTimeout(idleT);idleT=null}return}if(idleT)return;idleT=setTimeout(()=>{idleT=null;autoDimmed=true;applyDim()},30000)}
function wakeCool(){if(autoDimmed){autoDimmed=false;applyDim()}if(idleT){clearTimeout(idleT);idleT=null}armIdle()}
document.addEventListener('pointerdown',wakeCool);
document.addEventListener('touchstart',wakeCool,{passive:true});
document.addEventListener('click',wakeCool);
document.addEventListener('keydown',wakeCool);
document.addEventListener('input',wakeCool);
document.addEventListener('wheel',wakeCool,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wakeCool()});
const coolBtn=document.querySelector('#cool-toggle');if(coolBtn)coolBtn.addEventListener('click',()=>setCool(!coolMode));
applyDim();
let lastRenderSig=''; /* v71: signature of the last state render() actually rebuilt. See render() — the server pushes the full room state every 1s (heartbeat), and render() used to destroy and recreate the whole UI (queue, history, users, header, buttons — with images) on EVERY push, even when nothing had changed. In the Android WebView that 1-second destroy-and-rebuild is visibly flickery, and it gets worse while playing (the lists are full and the playing animations run on top). render() now skips the rebuild when the signature matches. */
function render(){if(!joined)return;
 /* v71: THE FLICKER FIX — only rebuild the DOM when something actually changed. The server heartbeat re-sends the identical room state every 1s, and render() used to innerHTML-rebuild the queue, history, user list, header pills, play/pause and skip buttons on EVERY one of those pushes — destroying and recreating every element (and its images) once a second. On a desktop browser that is fast enough to hide; in the Android WebView it flashes the whole UI once a second, and worse while playing (full lists + disc + smoke + equalizer on top). The signature below covers EVERYTHING render() paints, and NOTHING that changes continuously: the song position (pos/anchor/pausedAt) and the server clock (now) are deliberately left out — the clock is painted by the 500ms interval, not by render(). So an identical heartbeat now costs nothing (the DOM is left alone), and a real change (new song, queue add/remove, user joins/leaves, play/pause, karaoke mode, control change) still rebuilds at once. The two lightweight per-tick syncs (karRender, wakeSync) still run on a skip, so karaoke and the wake lock never go stale. */
 const cur=S.cur?{v:S.cur.videoId,t:S.cur.title,ch:S.cur.channel,by:S.cur.by,p:!!S.cur.playing,k:S.cur.kind,a:S.cur.artwork}:null;
 const sig=JSON.stringify([S.code,S.hostId,S.locked,S.co,S.ctrl,S.mode,S.adders,(S.users||[]).map(u=>({i:u.id,n:u.name,c:u.color})),cur,(S.queue||[]).map(t=>({v:t.videoId,t:t.title,by:t.by,b:t.byId,c:t.color,r:t.rid,a:t.artwork,tid:t.tid,si:t.singerId,sn:t.singerName,rq:(t.reqs||[]).map(x=>({i:x.id,n:x.name}))})),(S.reqs||[]).map(q=>({r:q.rid,v:q.videoId,t:q.title,by:q.by,b:q.byId,c:q.color,a:q.artwork})),(S.history||[]).map(t=>({v:t.videoId,t:t.title,by:t.by,a:t.artwork})),me.id,coolMode,autoDimmed]);
 if(sig===lastRenderSig){karRender();wakeSync();return;}
 lastRenderSig=sig;
 const isH=S.hostId===me.id,M=isH||S.co.includes(me.id),C=M||(S.ctrl&&S.ctrl.includes(me.id)),can=C,c=S.cur;
 recordSong(); /* v36: every song that becomes the current track is saved to history */
 $('#rn').textContent=S.code;
 $('#who').innerHTML='<span class="pill-who">'+S.users.slice(0,2).map(u=>`<span class="av" style="background:${esc(u.color)}" title="${esc(u.name)}">${esc(u[0]=u.name[0]||'?')}</span>`).join('')+`<small>${AIC_USERS} ${S.users.length} listening</small></span>`;
 const lk=$('#lock');lk.hidden=!isH;lk.innerHTML=S.locked?'<span class="ic" aria-hidden="true">'+AIC_UNLOCK+'</span> <span class="tx">Open requests</span>':'<span class="ic" aria-hidden="true">'+AIC_LOCK+'</span> <span class="tx">Close requests</span>';
 $('#disc').classList.toggle('on',!!c&&c.playing);
 document.querySelector('.stage')?.classList.toggle('playing',!!c&&c.playing); /* v37: the cosmic smoke breathes harder while the music plays, calms when paused */
 if(c&&c.playing&&!coolMode)smokeStart();else smokeStop(); /* v43: beat-reactive smoke — v68: never start the beat while Cool mode is on (the smoke is hidden then, so the ~500ms timer would only burn CPU for nothing). */
 let h=0;if(c)for(const ch of c.videoId)h=(h*31+ch.charCodeAt(0))%360;document.documentElement.style.setProperty('--h',h);
 $('#tt-in').textContent=c?c.title:'Queue is empty';fitTitle();$('#ch').textContent=c?c.channel:'Paste a YouTube link to start the room.';$('#by').textContent=c?'Added by '+c.by:'';$('#addlink').hidden=!!c; /* v40: the empty-state button shows only while the queue is empty */
 $('#pp').innerHTML=c&&c.playing?IC_PAUSE:IC_PLAY;$('#pp').disabled=!can;/* v50: tell the page whether a song is playing, so the decorative motion (smoke, orbs, notes) freezes when nothing plays instead of burning battery and heating the phone for nothing. */document.body.classList.toggle('playing',!!(c&&c.playing));/* v55: COOL MODE + AUTO-DIM — if the song stopped, wake the page (no need to stay dimmed when paused); (re)arm the 30s idle timer when playing. armIdle() never resets a running timer, so this is safe even though render() runs often. */if(!(c&&c.playing)&&autoDimmed){autoDimmed=false;applyDim()}armIdle();$('#sk').innerHTML=IC_NEXT;$('#sk').disabled=!can||!c;$('#sk').setAttribute('aria-label',C?'Skip':'Skip (host control only)');$('#sk').title=C?'Skip to next track':'Only the host, co-hosts, or authorized controllers can skip';$('#sc').disabled=!can||!c;/* v49: 10s skip buttons follow the same rule as the seek bar — only controllers can move the room. */const b10=$('#b10'),f10=$('#f10');if(b10)b10.disabled=!can||!c;if(f10)f10.disabled=!can||!c;
 $('#au').placeholder=C?'Paste a YouTube link…':'Paste a YouTube link to request it';$('#af button').textContent=C?'Add':'Request';
 /* v20: song requests — a guest's link waits here until the host approves it (into the queue) or rejects it (gone) */
 const rq=S.reqs||[];$('#rqw').hidden=!rq.length;
 /* v28: section counts, so the headings read like a premium queue */
 const setH=(sel,txt)=>{const e=document.querySelector(sel);if(e)e.innerHTML=txt};
 setH('#rqw h3',`Requests <em>${rq.length}</em>`);
 const qh=document.querySelector('#q')?.previousElementSibling,hH=document.querySelector('#h')?.previousElementSibling;
 if(qh)qh.innerHTML=`Up next <em>${S.queue.length}</em>`;
 if(hH)hH.innerHTML=`Recently played <em>${S.history.length}</em>`;
 $('#rq').innerHTML=rq.map(q=>`<li style="--c:${esc(q.color||'#ff2d87')}"><img src="${esc(q.artwork)}" alt=""><div><b>${esc(q.title)}</b><small>Requested by ${esc(q.by)}${q.byId===me.id?' • Waiting for host approval':''}</small></div>${isH?`<button class="ap" data-ap="${esc(q.rid)}">Approve</button><button class="rj" data-rj="${esc(q.rid)}">Reject</button>`:''}</li>`).join('');
 $('#current-track').hidden=!c;
 $('#current-song').innerHTML=c?`<li class="current-song"><img src="${esc(c.artwork)}" alt=""><div><b>${esc(c.title)}</b><small>${esc(c.by)}</small></div><span class="current-state ${c.playing?'playing':'paused'}"><i></i>${c.playing?'Playing':'Paused'}</span></li>`:'';
 $('#q').innerHTML=S.queue.length?S.queue.map((t,i)=>`<li style="--c:${esc(t.color||'#ff2d87')}"><img src="${esc(t.artwork)}" alt=""><div><b>${esc(t.title)}</b><small>${esc(t.by)}</small>${kq(t,M)}</div>${C||t.byId===me.id?`<button data-rm="${i}" aria-label="Remove ${esc(t.title)}">Remove</button>`:''}</li>`).join(''):'<li class="empty"><div><small>Nothing queued. Paste a link above.</small></div></li>';
 $('#h').innerHTML=S.history.map(t=>`<li><img src="${esc(t.artwork)}" alt=""><div><b>${esc(t.title)}</b><small>${esc(t.by)}</small></div><button data-replay="${esc(t.videoId)}" aria-label="${C?'Replay':'Request'} ${esc(t.title)}">${C?'Replay':'Request'}</button></li>`).reverse().join('');
 /* v46: save every link YOU paste into Your playlist. A track is yours if
    you pasted it (myPastes, which catches a song that became current at
    once) or if the queue says you added it (byId). Other people's songs
    are never saved to your playlist. Dedupe is by videoId inside
    addToPlaylist, so calling this on every state update is safe. */
 if(S){const ts=[];if(S.cur)ts.push(S.cur);(S.queue||[]).forEach(t=>ts.push(t));ts.forEach(t=>{if(t&&t.videoId&&(myPastes.has(t.videoId)||t.byId===me.id))addToPlaylist(t)})}
 renderPlaylist();
 $('#ul').innerHTML=S.users.map(u=>{const hasCtrl=S.ctrl&&S.ctrl.includes(u.id);
  return `<li style="--c:${esc(u.color)}"><div><b>${esc(u.name)}${u.id===S.hostId?' '+IC.crown:S.co.includes(u.id)?' '+IC.star:hasCtrl?' '+IC.ctrl:''}</b></div>${isH&&u.id!==me.id?`<div class="uacts">${ku(u)}<button data-h="${u.id}">Make host</button><button data-c="${u.id}">Co-host</button><button data-ctrl="${u.id}">${hasCtrl?'Take control':'Give control'}</button><button data-k="${u.id}">Remove</button></div>`:M&&u.id!==S.hostId&&u.id!==me.id?`<div class="uacts"><button data-k="${u.id}">Remove</button></div>`:''}</li>`}).join('');karRender();wakeSync() /* v48: hold/release the screen wake lock with the playing state */
 /* v76: BACKGROUND PLAY TIP — explain the actual playback capabilities
    regardless of install mode. Direct uploaded audio can use the OS
    lock-screen media controls; the YouTube iframe must not be made to play
    while this app is backgrounded. The tip is always shown (not just in a
    PWA), with a status line naming which kind the current track is. */
 const bgTip=document.querySelector('#bg-tip');
 if(bgTip){bgTip.hidden=false;const a=document.querySelector('#bg-safari');
  if(a)a.href=location.origin+'/room/'+S.code;
  const status=bgTip.querySelector('#bg-track-status');
  if(status)status.textContent=S?.cur?.kind==='audio'?'Current track: uploaded audio (background-capable where supported).':S?.cur?'Current track: YouTube (foreground playback only).':'Upload a supported audio file to enable background-capable playback.'}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.rm)act({type:'remove',i:+d.rm});if(d.h)act({type:'host',id:d.h});if(d.c)act({type:'cohost',id:d.c});if(d.k)act({type:'kick',id:d.k});if(d.e)act({type:'react',e:d.e});
 if(d.ap)act({type:'approve',rid:d.ap});if(d.rj)act({type:'reject',rid:d.rj});if(d.ctrl)act({type:'ctrl',id:d.ctrl});if(d.replay){myPastes.add(d.replay);act({type:'add',url:'https://youtu.be/'+d.replay})}
 /* v46: playlist — Queue puts the saved song into the room, ✕ removes it from your playlist, Clear wipes the whole playlist. */
 if(d.plq){myPastes.add(d.plq);act({type:'add',url:'https://youtu.be/'+d.plq});toast('Adding to the queue…')}
 if(d.plx){savePlaylist(getPlaylist().filter(x=>x.id!==d.plx));renderPlaylist();toast('Removed from your playlist')}});
$('#leave').onclick=()=>{try{delete L.lastRoom}catch{};socket.emit('leave');setTimeout(()=>{socket.disconnect();location.href='/'},300)}; /* v20: leave the room — the server hands the host on at once if you were the host */ /* v36: leaving clears the saved room, so a refresh does not rejoin it */
$('#audio-unlock').onclick=()=>{if(!S?.cur?.playing||!P)return;applyVolume(P);P.playVideo?.();sync();$('#audio-unlock').hidden=true};
/* v22: the browser only allows sound after the user taps the page. A joiner
   who never taps anything hears nothing, even though the room is playing.
   So the FIRST tap anywhere in the room (a tab, a button, the page itself)
   unmutes the player and starts it if it should be playing. That one tap is
   the gesture the browser needs — after it, sound works for the whole session.
   It is a no-op once the player is playing and unmuted, and the localT guard
   keeps it from undoing your own intentional pause. */
const unlockOnTap=()=>{/* v32: a tap anywhere also retries the singer's voice if it was blocked. */
 if(typeof kvPlay==='function')kvPlay();
 if(!joined||!S?.cur?.playing||!P||Date.now()-localT<1000)return;const st=P.getPlayerState&&P.getPlayerState();if(st===1&&!P.isMuted?.())return;applyVolume(P);if(st!==1)P.playVideo?.();$('#audio-unlock').hidden=true};
document.addEventListener('pointerdown',unlockOnTap);
/* v21: pause/play acts instantly on the device you tap. The server still
   schedules the action for the group (SCHED 200ms), so the sound used to keep
   playing ~1s after you tapped pause. localToggle pauses/plays THIS player's
   video right now, so you hear it stop the instant you tap; the broadcast
   then lands on the same position, so nothing jumps. Used by the Play button,
   the deck hub, the bottom bar, and the lock-screen controls.
   localT/localWas guard the sync loop: when you tap, the server still says
   the OLD state for ~200ms, and sync() would otherwise "correct" your tap
   away (it sees the player paused while the server still says playing, and
   hits play again). While the broadcast is still on its way, sync() leaves
   the play/pause alone and only fixes the position/rate. */
let localT=0,localWas=null;
const localToggle=()=>{if(!S?.cur||!P)return;localT=Date.now();localWas=S.cur.playing;applyVolume(P);if(S.cur.playing)P.pauseVideo?.();else P.playVideo?.()};
$('#pp').onclick=()=>{if(!S?.cur){toast('Paste a YouTube link to start the room.');return}[P,P2].forEach(applyVolume);localToggle();act({type:'play'})};$('#addlink').onclick=()=>{document.querySelector('[data-t=queue]').click();setTimeout(()=>document.querySelector('#au')?.focus(),120)}; /* v40: empty-state button — jump to the Queue tab and focus the paste box, so a first-time user lands where the link goes */$('#sk').onclick=()=>act({type:'skip'});$('#lock').onclick=()=>act({type:'lock'});
/* v49: 10-SECOND SKIP — jump back or forward 10s in the current song. The
   seek is the same action the seek bar sends, so the whole room moves
   together. The arrow spins once on tap (backwards for -10s, forwards for
   +10s) — the class is re-triggered by forcing a reflow, then removed. */
const seekBy=(d,btn,cls)=>{if(!S?.cur)return;const dur=S.cur.duration||P?.getDuration?.()||0;const pos=dur>0?Math.max(0,Math.min(dur,est()+d)):Math.max(0,est()+d);act({type:'seek',pos});btn.classList.remove(cls);void btn.offsetWidth;btn.classList.add(cls);setTimeout(()=>btn.classList.remove(cls),480)};
$('#b10').onclick=e=>seekBy(-10,e.currentTarget,'spin-back');
$('#f10').onclick=e=>seekBy(10,e.currentTarget,'spin-fwd');
$('#au').addEventListener('input',()=>{
 clearTimeout(videoCheckTimer);const url=$('#au').value.trim(),sequence=++videoCheckSequence;
 checkedVideoUrl='';checkedVideoStatus='';
 const statusBox=$('#video-check');
 if(!url){statusBox.hidden=true;statusBox.textContent='';statusBox.removeAttribute('data-status');return}
 renderVideoCheck({status:'checking'});
 videoCheckTimer=setTimeout(()=>{
  if(!socket.connected){if(sequence===videoCheckSequence)renderVideoCheck({status:'error'});return}
  socket.timeout(9000).emit('check-video',url,(err,result)=>{
   if(sequence!==videoCheckSequence||url!==$('#au').value.trim())return;
   const check=err?{status:'error'}:result;checkedVideoUrl=url;checkedVideoStatus=check.status;renderVideoCheck(check)
  })
 },650)
});
$('#af').onsubmit=e=>{e.preventDefault();const u=$('#au').value.trim(),submit=$('#af button');if(!u||submit.disabled)return;
 /* v60: the Add tap IS a user gesture — unlock the audio right here, so the song that is about to start plays with sound and the app never asks for audio permission again after adding a song. unlockAudio() resumes the AudioContext, applies the volume and starts the player if the room is playing; once it has run, the browser's sticky activation keeps later songs playing without another tap. */
 try{unlockAudio()}catch{}
 const vid=vidFromUrl(u);if(vid)myPastes.add(vid); /* v46: remember this paste so it lands in Your playlist even if it becomes the current song at once */
 if(checkedVideoUrl===u&&['blocked','unavailable'].includes(checkedVideoStatus)){toast($('#video-check').textContent);return}
 if(!socket.connected){toast('Not connected to the room. Reconnect and try again.');return}
 clearTimeout(videoCheckTimer);videoCheckSequence++;
 submit.disabled=true;
 socket.timeout(20000).emit('act',{type:'add',url:u},(err,result)=>{
  submit.disabled=false;
  if(err||!result?.ok){toast(result?.message||'Could not add the video. Check your connection and try again.');return}
  if(result.message)toast(result.message);
  if($('#au').value.trim()!==u)return;
  checkedVideoUrl='';checkedVideoStatus='';$('#au').value='';
  $('#video-check').hidden=true;$('#video-check').textContent='';$('#video-check').removeAttribute('data-status')
 })
};
/* v52: UPLOAD AN AUDIO FILE — the real background-audio fix. A YouTube
   video pauses when the phone locks or you switch apps (iOS suspends
   video embeds, and no web code can stop that). An uploaded audio file
   plays through a plain <audio> element, which keeps playing through
   lock and app-switching. The file is the user's own (picked from their
   device), uploaded to this room's server, and plays for everyone. */
$('#up-file').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';
  if(!f)return;
  const note=$('#up-note');note.hidden=false;note.textContent='Uploading '+f.name+'…';
  if(!socket.connected){note.textContent='Not connected to the room. Reconnect and try again.';return}
  try{
    const res=await fetch('/upload?name='+encodeURIComponent(f.name),{method:'POST',body:f});
    const j=await res.json();
    if(!j.ok)throw new Error(j.message||'Upload failed');
    /* v52: use the same timeout+ack pattern as the YouTube add — a plain
       socket.emit ack passes the server's reply as the FIRST callback
       argument, so a bare act() callback would read {ok:true} as an error. */
    socket.timeout(20000).emit('act',{type:'add',au:j.id},(err,result)=>{
      if(err||!result?.ok){note.textContent=result?.message||'Could not add the file.';return}
      note.textContent='Added '+j.title+' — background audio is available on supported devices.';
      toast('Added '+j.title);
    });
  }catch(err){note.textContent='Upload failed: '+(err&&err.message||'try again')}
});
$('#playlist-clear').onclick=()=>{savePlaylist([]);renderPlaylist();toast('Playlist cleared')};
/* v46: the playlist is rendered on load too, so your saved songs are there
   before the first state update arrives. */
renderPlaylist();
/* v51: VOLUME BAR FIX — v49 made oninput do nothing but move the thumb and
   only applied the volume on `change` (release). On a real phone that
   broke it: the `change` event is unreliable on mobile Safari while
   dragging, so the sound never changed at all even though the bar moved.
   Now oninput applies the volume to the player LIVE while dragging, but
   throttled to once per 60ms and with ONLY the cheap iframe call — no
   icon rebuild, no mix-slider sync (those are what made the old drag
   stutter). onchange still runs the full setVolume once on release so the
   final value is always applied. */
$('#vol').oninput=e=>{volume=Math.max(0,Math.min(100,Math.round(Number(e.target.value)||0)));if(volume>0)lastVolume=volume;e.target.style.setProperty('--p',volume+'%');/* v51: live-apply the volume while dragging (throttled, iframe only) — see the note above. Deliberately does NOT touch volumeMuted, so setVolume on release still sees the real muted-state flip and updates the icon. */if(volT)return;volT=setTimeout(()=>{volT=null;[P,P2].forEach(applyVolume)},60)};
$('#vol').onchange=e=>setVolume(e.target.value,true);
$('#vm').onclick=()=>setVolume(volumeMuted?lastVolume:0,true);$('#vmx').onclick=()=>setVolume(100,true);
/* v45: SMOOTH seek drag — the old code only set `seeking` on pointerdown and only
   sought on release, but the sync loop kept seeking the PLAYER to the live
   position while the user dragged (its seeks were not gated on `seeking`),
   and the 500ms interval kept overwriting the bar value whenever `seeking`
   was not set — so the thumb fought the user and felt laggy. Now: dragging
   updates the time label and the fill live (oninput), the sync loop never
   seeks the player while a drag is in progress, and the server seek fires
   once on release. */
$('#sc').onpointerdown=()=>seeking=true;
$('#sc').oninput=e=>{seeking=true;const d=S?.cur?.duration||P?.getDuration?.()||0;if(d)$('#t1').textContent=fmt(e.target.value/1000*d);e.target.style.setProperty('--p',(e.target.value/10)+'%')};
$('#sc').onpointerup=()=>{seeking=false};
$('#sc').onchange=e=>{seeking=false;if(P)act({type:'seek',pos:e.target.value/1000*(S?.cur?.duration||P.getDuration())})};
$('#share').onclick=()=>{const u=location.origin+'/room/'+S.code;$('#lk').value=u;$('#qr').innerHTML='';
 try{if(window.QRCode)new QRCode($('#qr'),{text:u,width:200,height:200});else throw new Error('no QR lib')}
 catch(e){$('#qr').innerHTML='<small>QR code unavailable — copy the link below.</small>'}
 $('#dlg').showModal()};
$('#cl').onclick=()=>$('#dlg').close();$('#cp').onclick=()=>{navigator.clipboard.writeText($('#lk').value);$('#cp').textContent='Copied'};
let lastDurSent='';
setInterval(()=>{if(!P||!P.getDuration||!S?.cur)return;const ld=P.getDuration()||0,t=est();
 /* v27: the total length is the SERVER's shared value, not each phone's own
    player — that is what kept it different (or 0:00) across participants.
    Whichever phone's player first learns the real length reports it once,
    the server keeps it, and from then on everyone shows the same number. */
 const d=S.cur.duration||ld;
 if(ld>0&&!S.cur.duration){const key=S.cur.tid+':'+Math.round(ld);if(key!==lastDurSent){lastDurSent=key;act({type:'dur',tid:S.cur.tid,dur:ld})}}
 if(!coolMode){ /* v68: in Cool mode the screen is dark / asleep, so nobody is watching the clock — skip the time, seek-bar and Media Session DOM writes (they wake the CPU and force a repaint every 500ms). The buffering watchdog below still runs, so a stuck stream is still rescued. */
 $('#t1').textContent=fmt(t);$('#t2').textContent=fmt(d);if(!seeking&&d){const sc=$('#sc'),v=Math.min(1000,t/d*1000);sc.value=v;sc.style.setProperty('--p',(v/10)+'%')}updateMediaSession();
 }
 /* stuck-buffer safety net: buffering for 5s straight while the room is
    playing means the stream is wedged — reload it at the live position.
    v53: was 12s; a 5s+ lag was already visible to the user before the old
    net fired, so it now fires sooner. */
 if(S.cur.playing&&P.getPlayerState){const st=P.getPlayerState();if(st===3){if(!bufSince)bufSince=Date.now();else if(Date.now()-bufSince>5000){bufSince=0;cv=null;sync()}}else bufSince=0}
 /* v43: the v22 autoplay-blocked button is REMOVED — the only audio ask is
    the mandatory popup right after joining/creating a room, never again.
    Sound still turns on from any tap (unlockOnTap) or the Play button. */
},500);
let mediaMetadataKey=null,mediaPlaybackState='';
function updateMediaSession(){
 if(!navigator.mediaSession)return;const ms=navigator.mediaSession,c=S?.cur;
 const metadataKey=c?[c.videoId,c.title,c.channel,c.artwork].join('|'):'';
 if(metadataKey!==mediaMetadataKey){mediaMetadataKey=metadataKey;if(typeof MediaMetadata==='function')ms.metadata=c?new MediaMetadata({title:c.title,artist:c.channel||'Vibe Room',album:'Vibe Room',artwork:c.artwork?[{src:c.artwork}]:[]}):null}
 /* v64: report the LOCAL player's state, not just the room's. When iOS pauses the video on lock, the room is still "playing" but this device is silent — reporting 'playing' then shows a pause button on the lock screen, and the play action (which only fired when the room was paused) did nothing, so the lock-screen play button was dead. Reporting 'paused' shows a play button, and pressing it resumes this device. */
 const localPlaying=P?.getPlayerState&&P.getPlayerState()===1;
 const playbackState=!c?'none':c.playing?(localPlaying?'playing':'paused'):'paused';
 if(playbackState!==mediaPlaybackState){mediaPlaybackState=playbackState;ms.playbackState=playbackState}
 if(!c||typeof ms.setPositionState!=='function'||!P?.getDuration)return;
 const duration=c.duration||P.getDuration(),position=est();
 if(Number.isFinite(duration)&&duration>0&&Number.isFinite(position))try{ms.setPositionState({duration,position:Math.max(0,Math.min(duration,position)),playbackRate:c.speed||1})}catch(e){}
}
if('mediaSession'in navigator){
 const ms=navigator.mediaSession,setAction=(name,handler)=>{try{ms.setActionHandler(name,handler)}catch(e){if(e.name!=='NotSupportedError'&&e.name!=='TypeError')throw e}};
 const canControl=()=>!!S&&(S.hostId===me.id||S.co.includes(me.id)||(S.ctrl||[]).includes(me.id));
 const seekTo=position=>{if(canControl()&&S?.cur&&Number.isFinite(position))act({type:'seek',pos:Math.max(0,position)})};
 setAction('play',()=>mediaPlay());
 setAction('pause',()=>{if(S?.cur?.playing){localToggle();act({type:'play'})}});
 setAction('nexttrack',()=>{if(canControl())act({type:'skip'})});
 setAction('previoustrack',()=>{if(canControl())act({type:'prev'})});
 setAction('seekto',e=>seekTo(e.seekTime));
 setAction('seekbackward',e=>seekTo(est()-(e.seekOffset||10)));
 setAction('seekforward',e=>seekTo(est()+(e.seekOffset||10)))
}
const resumeRoom=()=>{if(document.hidden||!joined)return;if(socket.connected)rejoinRoom();else socket.connect();keepPlaying()};
/* v45: SONG TITLE MARQUEE — a long song name slowly scrolls in the player
   card instead of being cut off with "…". fitTitle() measures the title
   against its box; if it overflows, it sets --tt-dx (how far to scroll)
   and --tt-dur (slow: ~30px per second) and adds .scroll, which runs a
   ping-pong animation that drifts left, pauses at the end, and drifts
   back. Short titles fit and stay still. Re-runs on resize, since the
   box width changes with the screen. */
function fitTitle(){const t=$('#tt'),inner=$('#tt-in');if(!t||!inner)return;
 const over=inner.scrollWidth-t.clientWidth;
 /* v59: SLOW MARQUEE — the old speed (~30px/s, no minimum) made the title ping-pong frantically on a wide screen: on an iPad the box is ~586px wide so a long title only overflows by ~19px, giving a 0.6s duration — it jerked back and forth almost twice a second. Now it scrolls at 20px/s AND never faster than 5s one-way, so even a tiny overflow drifts slowly and calmly. */
 if(over>4){t.style.setProperty('--tt-dx',over+'px');t.style.setProperty('--tt-dur',Math.max(over/20,5).toFixed(1)+'s');t.classList.add('scroll')}
 else{t.classList.remove('scroll');t.style.removeProperty('--tt-dx');t.style.removeProperty('--tt-dur')}}
window.addEventListener('resize',()=>{clearTimeout(fitTitle._t);fitTitle._t=setTimeout(fitTitle,150)});
const keepPlaying=()=>{if(!S?.cur?.playing||!P||document.hidden&&S.cur.kind!=='audio')return;try{applyVolume(P)}catch(e){}try{if(P.getPlayerState&&P.getPlayerState()!==1&&P.playVideo)P.playVideo()}catch(e){}try{updateMediaSession()}catch(e){}};
/* v64: LOCK-SCREEN RESUME — the Media Session 'play' action is what the lock-screen play button sends. The old handler only fired when the ROOM was paused, so when iOS paused the video on lock (room still "playing"), the button did nothing and Safari background audio looked broken. Now: room paused → resume the room (as before); room playing but THIS device's player not playing → just resume this device (keepPlaying + sync to the live position), no room action, so nobody else's playback is touched. */
const mediaPlay=()=>{if(!S?.cur||document.hidden&&S.cur.kind!=='audio')return;
 if(!S.cur.playing){[P,P2].forEach(applyVolume);localToggle();act({type:'play'})}
 else{keepPlaying();try{sync()}catch{}}};
/* v48: SCREEN WAKE LOCK — the #1 reason music stops on lock is that the
   screen locks and iOS then suspends the app. While a song is playing,
   hold a screen wake lock so the screen stays on and the app stays in
   the foreground — the music cannot stop if the screen never locks.
   Released when the room pauses or the song ends. The system drops the
   lock whenever the page hides, so it is re-requested every time the
   page becomes visible again while a song is playing, and on every state
   update. Not supported everywhere — a missing API is a silent no-op,
   and the app works exactly as before without it. */
let wakeLock=null,wakeWant=false;
const wakeAcquire=async()=>{if(!('wakeLock'in navigator)||wakeLock||document.hidden||!wakeWant)return;
 try{wakeLock=await navigator.wakeLock.request('screen');
  wakeLock.addEventListener('release',()=>{wakeLock=null;if(wakeWant&&!document.hidden)wakeAcquire()})}catch{wakeLock=null}};
const wakeSync=()=>{wakeWant=!!(S?.cur?.playing)&&!coolMode;if(wakeWant)wakeAcquire();else if(wakeLock){try{wakeLock.release()}catch{}wakeLock=null}}; /* v68: COOL MODE releases the wake lock — the screen is the #1 heat source (a lit screen is the biggest battery/heat drain on a phone). When Cool mode is on, the lock is released so the screen can sleep and the phone cools. The music keeps playing via the background paths (uploaded MP3s and the Android APK keep playing with the screen off; iOS Safari + YouTube pauses on lock — press play on the lock screen, v64, to resume). */
/* v48: RESUME SAFETY NET — when the user comes back to the app, the music
   must restart by itself within a second, even if they do not tap
   anything. The visibility/focus handlers already call keepPlaying(),
   but if one is ever missed, this 1s check catches it: while the page
   is visible and the room is playing, a paused player is resumed. The
   localT guard (same as sync) keeps it from undoing your own intentional
   pause — a tap you just made is left alone for 1s. */
/* v57: SOUND CHECK — the app now watches whether sound is actually coming out. If the room is playing but THIS device's player is not playing (and not buffering — it is trying), the browser has blocked it (no valid tap yet) and the timer retries cannot fix it, because only a real tap counts as a gesture. After 2 seconds of silence, show the big "Tap to enable audio" button (it was never shown before — nothing ever unhid it, so a silent guest had no way to start the sound) and say so once. Tapping it calls playVideo() inside the tap, which the browser allows. It hides itself the moment the player starts (pState) or the room stops. */
let silentSecs=0,silentTold=false,silentTick=0,lastSndTrack='',lastSndTrackAt=0;
setInterval(()=>{if(document.hidden||!joined||!S?.cur?.playing||!P||Date.now()-localT<1000)return;
 if(coolMode){silentTick++;if(silentTick%3!==0)return} /* v68: in Cool mode this 1s sound check runs every 3s instead — the screen is asleep, so a paused player resuming within 3s (not 1s) is fine, and the CPU wakes a third as often. */
 try{const st=P.getPlayerState&&P.getPlayerState();
  if(st===1){silentSecs=0;silentTold=false;return}
  /* v76: TRACK-CHANGE GRACE — when a song ends and the next queued song starts, the player is briefly not playing (ended → unstarted → cued) while the new track loads. That is a normal transition, NOT a silent device. If the track just changed, reset the silence counter, hide any stale unlock button left over from the previous track, and give the new track 5 seconds to start before counting silence — otherwise the "Tap to enable audio" button flashes at every song change even though audio was already enabled and the previous song was playing. */
  const vid=S.cur.videoId||'';
  if(vid!==lastSndTrack){lastSndTrack=vid;lastSndTrackAt=Date.now();silentSecs=0;silentTold=false;const u0=$('#audio-unlock');if(u0)u0.hidden=true}
  if(Date.now()-lastSndTrackAt<5000)return;
  if(st!==3){silentSecs++;if(silentSecs>=2){const u=$('#audio-unlock');if(u&&u.hidden){u.hidden=false;if(!silentTold){silentTold=true;toast('Tap to enable sound — the song is playing but your device is silent.')}}}}
  applyVolume(P);P.playVideo?.()}catch(e){}},1000);
/* v76: BACKGROUND AUDIO — let the browser/native media pipeline handle it.
   The old approach retried the YouTube iframe every 2s while hidden, but
   background retries against the YouTube iframe violate YouTube's policies
   and wake the CPU without guaranteeing audio. Now: when the page hides,
   pause the YouTube player at once (uploaded audio is exempt — it uses the
   direct <audio> element and is NOT paused here); when the page is visible
   again, resume the room and the lock-screen controls. The uploaded
   <audio> element keeps playing through lock and app-switching on
   supported devices. YouTube plays only while Vibe Room is visible. */
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){smokeStop();wakeSync();
  if(P&&P!==PAU){try{P.pauseVideo?.()}catch(e){}}
  updateMediaSession()}
 else{resumeRoom();wakeSync();updateMediaSession();if(S?.cur?.playing&&!coolMode&&!autoDimmed)smokeStart()}
});
window.addEventListener('pageshow',()=>{if(!document.hidden)resumeRoom()});
window.addEventListener('focus',()=>{if(!document.hidden)keepPlaying()});
/* v29: installable app — register the service worker so the app shell loads
   fast and the app can be added to the home screen. It never caches rooms or
   live data, so a room is never stale. */
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}
/* v66: ADS — Google AdSense, hovering small-card board. ONE small card, fixed over the screen on EVERY page (landing, Play, Queue, Sing, Room, More). It never changes the layout (position:fixed = no reflow, nothing moves or resizes), it is silent (AdSense display ads make no sound), and it is clean and attractive (small rounded glass card in the app's own purple, tiny "Ad" label, round ×).
   v67: ADS — ONE BIG board too, over the middle of the playboard (Play tab only, 320×250, centred over the vinyl disc, ending just above the seek bar so the seek bar, controls and volume stay tappable). It follows the same rules as the small card (5s idle, joined rooms only, hidden until AdSense is connected) and has its own ×. CLOSE ONE, CLOSE ALL: closing either board (small or big) hides BOTH at the same time (adHide always hides both); after 5s more idle they come back together.
   RULES (Abhi's): (1) they show ONLY inside a joined room — never on the main landing page (Create / Join a room); (2) they show ONLY after 5 seconds of no activity — any tap, key, scroll or swipe hides them and restarts the 5s timer; (3) the × closes them the moment it is touched (and closing one closes both); (4) they NEVER show if Google AdSense is not connected — until the developer replaces ADSENSE_CLIENT and ADSENSE_SLOT below with real AdSense values, both boards stay hidden and the app looks exactly as before (zero change). Both boards share the SAME ad unit (one Publisher ID + one Slot ID to paste), so the developer only creates one Display ad unit.
   HOW TO CONNECT (developer): create a free account at https://adsense.google.com, add the site (vibe-room-0isd.onrender.com), wait for approval, then copy your Publisher ID (ca-pub-XXXXXXXXXXXXXXXX) into ADSENSE_CLIENT and one Ad Unit ID into ADSENSE_SLOT, push, and the board starts showing. Earnings appear in the AdSense dashboard; payout is at $100 to your bank. */
const ADSENSE_CLIENT=(typeof window!=='undefined'&&window.__adsenseClient)?window.__adsenseClient:'ca-pub-XXXXXXXXXXXXXXXX';
const ADSENSE_SLOT=(typeof window!=='undefined'&&window.__adsenseSlot)?window.__adsenseSlot:'0000000000';
const ADS_CONFIGURED=!ADSENSE_CLIENT.includes('XXXX')&&ADSENSE_SLOT!=='0000000000';
const AD_IDLE_MS=5000;
const adBoard=document.querySelector('#ad-board');
const adBoardBig=document.querySelector('#ad-board-big'); /* v67: the BIG board over the middle of the playboard (Play tab only). */
let adTimer=null,adPushed=false,adPushedBig=false,adScriptDone=false;
function adLoadScript(){if(!ADS_CONFIGURED||adScriptDone||window.adsbygoogle)return;adScriptDone=true;try{const s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(ADSENSE_CLIENT);document.head.appendChild(s)}catch(e){}}
function adPlace(){ /* v66: put the small card where it covers NOTHING — measured at show time, so it works on any tab/device. Play tab: just below the extras row / iOS tip (the stage's empty bottom padding). Other tabs: just below the mini-player if it fits above the nav, else just above the mini-player (floating over the scrolling list). v67: also places the BIG board — centred over the vinyl disc, ending just above the seek bar, so it never covers the seek bar, controls or volume. */
  if(!adBoard)return;const H=44,GAP=4;
  const nav=document.querySelector('#tabs');
  const navTop=nav?nav.getBoundingClientRect().top:innerHeight;
  const isPlay=(document.querySelector('#room')?.dataset.tab==='play');
  adBoard.style.top='auto';adBoard.style.bottom='auto';
  if(isPlay){
    const xtra=document.querySelector('.xtra');
    const tip=document.querySelector('.ios-vol-tip');
    let below=0;
    if(xtra)below=Math.max(below,xtra.getBoundingClientRect().bottom);
    if(tip&&tip.getBoundingClientRect().height>0)below=Math.max(below,tip.getBoundingClientRect().bottom);
    let top=below+GAP;
    if(top+H>navTop-7)top=navTop-7-H;
    adBoard.style.top=Math.max(0,top)+'px';
  }else{
    const mini=document.querySelector('#mini');
    const miniShown=mini&&mini.classList.contains('show');
    if(miniShown){
      const mb=mini.getBoundingClientRect().bottom,mt=mini.getBoundingClientRect().top;
      if(mb+GAP+H<=navTop-7){adBoard.style.bottom=(innerHeight-(mb+GAP+H))+'px'}
      else{adBoard.style.bottom=(innerHeight-(mt-GAP))+'px'}
    }else{
      adBoard.style.bottom=(innerHeight-(navTop-7))+'px';
    }
  }
  if(adBoardBig&&isPlay){ /* v67: BIG board over the middle of the playboard — its bottom sits 12px above the seek bar (#sc), so the disc and title are covered but the seek bar, controls and volume stay tappable. */
    const sc=document.querySelector('#sc');
    const scTop=sc?sc.getBoundingClientRect().top:innerHeight*0.5;
    adBoardBig.style.top=Math.max(0,scTop-12-250)+'px';
  }
}
function adShow(){if(!ADS_CONFIGURED||!adBoard||!window.adsbygoogle||!inRoom())return;if(!adPushed){adPushed=true;try{const ins=adBoard.querySelector('ins');if(ins){ins.setAttribute('data-ad-client',ADSENSE_CLIENT);ins.setAttribute('data-ad-slot',ADSENSE_SLOT)}(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}adPlace();adBoard.classList.add('show');
  const isPlay=(document.querySelector('#room')?.dataset.tab==='play'); /* v67: the BIG board shows ONLY on the Play tab, over the middle of the playboard. */
  if(isPlay&&adBoardBig){if(!adPushedBig){adPushedBig=true;try{const ins=adBoardBig.querySelector('ins');if(ins){ins.setAttribute('data-ad-client',ADSENSE_CLIENT);ins.setAttribute('data-ad-slot',ADSENSE_SLOT)}(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}adBoardBig.classList.add('show')}}
function adHide(){if(adBoard)adBoard.classList.remove('show');if(adBoardBig)adBoardBig.classList.remove('show')} /* v67: closing ONE board closes BOTH at the same time — adHide always hides the small card AND the big board. */
const inRoom=()=>document.body.classList.contains('in-room'); /* v66: the app adds 'in-room' to <body> only once the user is inside a joined room (app.js line 281); the landing page (Create / Join) never has it, so ads never show there. */
function adArm(){if(!ADS_CONFIGURED)return;if(adTimer)clearTimeout(adTimer);adHide();if(!inRoom())return;adTimer=setTimeout(adShow,AD_IDLE_MS)}
['pointerdown','touchstart','touchmove','click','keydown','input','wheel'].forEach(ev=>document.addEventListener(ev,adArm,{passive:true}));
document.addEventListener('scroll',adArm,{passive:true,capture:true});
document.querySelector('#ad-x')?.addEventListener('click',()=>{adHide();adArm()});
document.querySelector('#ad-x-big')?.addEventListener('click',()=>{adHide();adArm()}); /* v67: closing the BIG board also closes the small card (adHide hides both). */
if(ADS_CONFIGURED){if(adBoard)adBoard.removeAttribute('hidden');if(adBoardBig)adBoardBig.removeAttribute('hidden');adLoadScript();adArm()}
