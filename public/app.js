const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const L=localStorage,hex=()=>'#'+[0,1,2].map(()=>(100+Math.random()*155|0).toString(16)).join('');
const me={id:L.vid||(L.vid=crypto.randomUUID()),name:L.vname||'Guest'+(10+Math.random()*89|0),color:L.vcolor||(L.vcolor=hex())};
const socket=io();let S=null,P=null,P2=null,joined=false,cv=null,cv2=null,recv=0,seeking=false,rtt=0,clockOff=0,pendT=null,needCatchup=false;
/* v13: measure the round-trip to this device so the position estimate can
   subtract half of it (the one-way delay) — otherwise every listener lags
   by their own network delay. Smoothed so one slow packet can't jerk it. */
setInterval(()=>{if(socket.connected)socket.emit('ping',Date.now())},5000);
socket.on('pong',t=>{const d=Date.now()-t;rtt=rtt?rtt*.7+d*.3:d});
const code=(location.pathname.match(/^\/room\/(\w+)/)||[])[1];
const act=a=>socket.emit('act',a),fmt=t=>{t=Math.max(0,t|0);return(t/60|0)+':'+String(t%60).padStart(2,'0')};
const toast=m=>{const d=document.createElement('div');d.className='toast';d.textContent=m;$('#toasts').append(d);setTimeout(()=>d.remove(),3500)};
const volumeOnIcon=$('#vm').innerHTML,volumeMutedIcon='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="17" y1="9" x2="22" y2="14"/><line x1="22" y1="9" x2="17" y2="14"/></svg>';
let volume=80,lastVolume=80,volumeMuted=false;
function applyVolume(pl){if(!pl)return;if(volumeMuted){pl.setVolume?.(0);pl.mute?.()}else{pl.setVolume?.(volume);pl.unMute?.()}}
function setVolume(value){volume=Math.max(0,Math.min(100,Math.round(Number(value)||0)));if(volume>0)lastVolume=volume;volumeMuted=volume===0;$('#vol').value=String(volume);[P,P2].forEach(applyVolume);$('#vm').innerHTML=volumeMuted?volumeMutedIcon:volumeOnIcon;$('#vm').setAttribute('aria-label',volumeMuted?'Unmute':'Mute');$('#vm').setAttribute('aria-pressed',String(volumeMuted))}
/* clean line icons (Feather-style) for the header, like the mockup */
const AIC=(p)=>'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const AIC_LOCK=AIC('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
const AIC_UNLOCK=AIC('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>');
const AIC_USERS='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const showJoinError=message=>{$('#gate').classList.add('gate-error');$('#gt').textContent='Room unavailable';$('#gs').textContent='This invite link may be incorrect or expired.';$('#ge').textContent=message+' Create a new room to get a fresh invite link.';$('#join-fields').hidden=true;$('#go').hidden=true;$('#new-room').hidden=false;$('#home-link').hidden=false};
if(!code){$('#home').hidden=false;
 $('#create').onclick=()=>socket.emit('create',me,r=>location.href='/room/'+r.code);
 $('#jf').onsubmit=e=>{e.preventDefault();const c=$('#jc').value.trim().toUpperCase();if(c)location.href='/room/'+c};
 const rc=JSON.parse(L.recent||'[]');$('#recent').innerHTML=rc.length?'<p class="steps">Recent rooms</p>'+rc.map(c=>`<a href="/room/${esc(c)}" style="color:var(--cy)">${esc(c)}</a>`).join(' '):''}
else{$('#gate').hidden=false;$('#gn').value=me.name;$('#gc').value=me.color.length==7?me.color:'#ff2d87';
 $('#new-room').onclick=()=>{const b=$('#new-room');b.disabled=true;b.textContent='Creating room…';socket.emit('create',me,r=>{if(!r?.code){b.disabled=false;b.textContent='Create a new room';$('#ge').textContent='Could not create a room. Please try again.';return}location.href='/room/'+r.code})};
 socket.on('connect',()=>{if(joined)return;socket.emit('join',{code,...me},r=>{if(joined)return;if(r.error){showJoinError(r.error);return}
  $('#gate').classList.remove('gate-error');$('#gt').textContent='Room '+code.toUpperCase();$('#gs').textContent='Choose your name, then join the room.';$('#ge').textContent='';$('#join-fields').hidden=false;$('#go').hidden=false;$('#go').disabled=false;$('#new-room').hidden=true;$('#new-room').disabled=false;$('#new-room').textContent='Create a new room';$('#home-link').hidden=true;
  L.recent=JSON.stringify([...new Set([code.toUpperCase(),...JSON.parse(L.recent||'[]')])].slice(0,5))})});
 $('#go').onclick=()=>{me.name=L.vname=$('#gn').value.trim()||me.name;me.color=L.vcolor=$('#gc').value;$('#go').disabled=true;$('#go').textContent='Joining…';socket.emit('join',{code,...me},r=>{if(r.error){showJoinError(r.error);return}
  joined=true;document.body.classList.add('in-room'); /* v14: hide the landing/gate FX once inside a room */
  $('#gate').hidden=true;$('#room').hidden=false;initPlayer();if(S)render()})};
 const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.append(s)}
window.onYouTubeIframeAPIReady=()=>{window.ytr=1};
function pReady(e){applyVolume(e.target);capQuality();sync()}
function pState(e){if(e.target!==P)return;if(e.data===0&&S?.cur)act({type:'ended',v:S.cur.videoId});if(e.data===1||e.data===2)sync()}
function pErr(e){if(e.target===P&&S?.cur)act({type:'bad',v:S.cur.videoId})}
function initPlayer(){if(!window.ytr)return setTimeout(initPlayer,200);
 P=new YT.Player('pl',{width:427,height:240,playerVars:{controls:0,disablekb:1,playsinline:1,modestbranding:1,rel:0,vq:'small'},
 events:{onReady:pReady,onStateChange:pState,onError:pErr}});
 /* v17: a 2nd hidden player that pre-buffers the next track so a song change starts instantly instead of re-buffering */
 try{P2=new YT.Player('pl2',{width:320,height:180,playerVars:{controls:0,disablekb:1,playsinline:1,modestbranding:1,rel:0,vq:'small'},
 events:{onReady:pReady,onStateChange:pState,onError:pErr}})}catch(e){P2=null} /* if the 2nd player can't start, the room still works on the single player */}
/* audio-only room: the video is hidden behind the hub, so cap it at 240p.
   The sound is identical at every quality — only the hidden picture gets
   smaller — and a 240p stream needs a fraction of the bandwidth, so it
   stops re-buffering on ordinary connections. */
function capQuality(){[P,P2].forEach(pl=>{if(!pl||!pl.setPlaybackQuality)return;try{pl.setPlaybackQuality('small');if(pl.setPlaybackQualityRange)pl.setPlaybackQualityRange('tiny','small')}catch(e){}})}
/* v17: keep the next track buffered in the hidden 2nd player while the current one plays */
function preloadNext(){if(!P2||!P2.cueVideoById||!S)return;const n=S.queue&&S.queue[0];
 if(!n)return; /* no next track — leave cv2 alone so a just-preloaded track can still be swapped in when it becomes current */
 if(cv2!==n.videoId){cv2=n.videoId;try{P2.cueVideoById(n.videoId)}catch(e){}capQuality()}}
const est=()=>S?.cur?S.cur.pos+(S.cur.playing?(Date.now()-recv+rtt/2)/1000*(S.cur.speed||1):0):0;
let bufSince=0;
function sync(){if(!P||!P.loadVideoById||!S)return;const c=S.cur;if(!c){P.stopVideo?.();cv=null;needCatchup=false;return}
 /* v17 scheduled start: if this action is for a future server time, don't touch the player yet — wait until that instant, then apply it */
 const at=c.playAt?c.playAt-clockOff:0;
 if(at>Date.now()+30){clearTimeout(pendT);pendT=setTimeout(()=>{pendT=null;sync()},at-Date.now());return}
 if(cv!==c.videoId){
  /* v17 preload swap: if the 2nd player already has this track buffered, make it the live player so it starts instantly */
  if(P2&&cv2===c.videoId&&P2.getPlayerState){const tmp=P;P=P2;P2=tmp;cv2=cv;cv=c.videoId;P2.stopVideo?.();capQuality()}
  else{cv=c.videoId;if(c.playing)P.loadVideoById(c.videoId,est());else P.cueVideoById(c.videoId,est());capQuality()}
  needCatchup=true /* v17: fresh load — jump straight to the live position instead of drifting there */}
 const st=P.getPlayerState(),t=est(),now=P.getCurrentTime?.()||0,d=t-now,ad=Math.abs(d),rate=c.speed||1;
 /* v20 tighter correction so every listener hears the same second: ignore drift
    under 0.15s (YouTube's own clock jitters by about that much), nudge the speed
    ±15% for drift up to 0.5s, and seek past 0.5s — and never seek while the
    player is still buffering, or the seek throws the buffer away and the stall
    starts all over again. */
 let target=rate;if(ad>=.15&&ad<.5)target=rate*(d>0?1.15:.85);
 P.setPlaybackRate(target);
 /* v21: while your own tap is still on its way to the server (~200ms), don't
    let the sync loop undo it — it still sees the old server state. The guard
    expires after 1s, so if the broadcast is ever lost, sync resumes normally. */
 const localPending=localT&&Date.now()-localT<1000&&S.cur.playing===localWas;
 if(!localPending){if(c.playing&&st!==1&&st!==3)P.playVideo();if(!c.playing&&st===1)P.pauseVideo()}
 /* v17 catch-up: on a fresh load, seek straight to the live position the moment the player can seek (don't wait for the drift to grow past the normal threshold) */
 if(needCatchup&&(st===1||st===2)){P.seekTo(t,true);needCatchup=false}
 else if(st===1&&ad>=.5)P.seekTo(t,true);
 else if(st===2&&ad>.5)P.seekTo(t,true);
 const syn=$('#sync');
 if(st===3){syn.className='off';syn.textContent='● Buffering…'}
 else{const ok=ad<.5;syn.className=ok?'':'off';syn.textContent=ok?'● In Sync':'● Syncing…'}}
socket.on('state',s=>{S=s;recv=Date.now();
/* v17: server clock minus this device's clock (one-way delay already removed) — used to run scheduled actions at the same instant on every device */
clockOff=S.now+rtt/2-recv;
render();sync();preloadNext()});socket.on('say',toast);
socket.on('react',r=>{const d=document.createElement('div');d.className='fl';d.textContent=r.e;d.style.left=(10+Math.random()*80)+'%';$('#fl').append(d);setTimeout(()=>d.remove(),2400)});
function render(){if(!joined)return;const isH=S.hostId===me.id,M=isH||S.co.includes(me.id),C=M||(S.ctrl&&S.ctrl.includes(me.id)),can=C,c=S.cur;
 $('#rn').textContent='Room '+S.code;
 $('#who').innerHTML='<span class="pill-who">'+S.users.slice(0,8).map(u=>`<span class="av" style="background:${esc(u.color)}" title="${esc(u.name)}">${esc(u[0]=u.name[0]||'?')}</span>`).join('')+`<small>${AIC_USERS} ${S.users.length} listening</small></span>`;
 const lk=$('#lock');lk.hidden=!isH;lk.innerHTML=S.locked?'<span class="ic" aria-hidden="true">'+AIC_UNLOCK+'</span> <span class="tx">Open requests</span>':'<span class="ic" aria-hidden="true">'+AIC_LOCK+'</span> <span class="tx">Close requests</span>';
 $('#disc').classList.toggle('on',!!c&&c.playing);
 let h=0;if(c)for(const ch of c.videoId)h=(h*31+ch.charCodeAt(0))%360;document.documentElement.style.setProperty('--h',h);
 $('#tt').textContent=c?c.title:'Queue is empty';$('#ch').textContent=c?c.channel:'Paste a YouTube link to start the room.';$('#by').textContent=c?'Added by '+c.by:'';
 $('#pp').innerHTML=c&&c.playing?IC_PAUSE:IC_PLAY;$('#pp').disabled=!can;$('#sk').innerHTML=IC_NEXT;$('#sk').setAttribute('aria-label',C?'Skip':'Vote to skip');$('#sc').disabled=!can||!c;
 $('#au').placeholder=C?'Paste a YouTube link…':'Paste a YouTube link to request it';$('#af button').textContent=C?'Add':'Request';
 /* v20: song requests — a guest's link waits here until the host approves it (into the queue) or rejects it (gone) */
 const rq=S.reqs||[];$('#rqw').hidden=!rq.length;
 $('#rq').innerHTML=rq.map(q=>`<li style="--c:${esc(q.color||'#ff2d87')}"><img src="${esc(q.artwork)}" alt=""><div><b>${esc(q.title)}</b><small>Requested by ${esc(q.by)}${q.byId===me.id?' • Waiting for host approval':''}</small></div>${isH?`<button class="ap" data-ap="${esc(q.rid)}">Approve</button><button class="rj" data-rj="${esc(q.rid)}">Reject</button>`:''}</li>`).join('');
 $('#current-track').hidden=!c;
 $('#current-song').innerHTML=c?`<li class="current-song"><img src="${esc(c.artwork)}" alt=""><div><b>${esc(c.title)}</b><small>${esc(c.by)}</small></div><span class="current-state ${c.playing?'playing':'paused'}">${c.playing?'Playing':'Paused'}</span></li>`:'';
 $('#q').innerHTML=S.queue.length?S.queue.map((t,i)=>`<li style="--c:${esc(t.color||'#ff2d87')}"><img src="${esc(t.artwork)}" alt=""><div><b>${esc(t.title)}</b><small>${esc(t.by)}</small>${kq(t,M)}</div>${C||t.byId===me.id?`<button data-rm="${i}" aria-label="Remove ${esc(t.title)}">Remove</button>`:''}</li>`).join(''):'<li><div><small>Nothing queued. Paste a link above.</small></div></li>';
 $('#h').innerHTML=S.history.map(t=>`<li><img src="${esc(t.artwork)}" alt=""><div><b>${esc(t.title)}</b><small>${esc(t.by)}</small></div></li>`).reverse().join('');
 $('#ul').innerHTML=S.users.map(u=>{const hasCtrl=S.ctrl&&S.ctrl.includes(u.id);
  return `<li style="--c:${esc(u.color)}"><div><b>${esc(u.name)}${u.id===S.hostId?' 👑':S.co.includes(u.id)?' ★':hasCtrl?' 🎛':''}</b></div>${isH&&u.id!==me.id?`<div class="uacts">${ku(u)}<button data-h="${u.id}">Make host</button><button data-c="${u.id}">Co-host</button><button data-ctrl="${u.id}">${hasCtrl?'Take control':'Give control'}</button><button data-k="${u.id}">Remove</button></div>`:M&&u.id!==S.hostId&&u.id!==me.id?`<div class="uacts"><button data-k="${u.id}">Remove</button></div>`:''}</li>`}).join('');karRender()}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.rm)act({type:'remove',i:+d.rm});if(d.h)act({type:'host',id:d.h});if(d.c)act({type:'cohost',id:d.c});if(d.k)act({type:'kick',id:d.k});if(d.e)act({type:'react',e:d.e});
 if(d.ap)act({type:'approve',rid:d.ap});if(d.rj)act({type:'reject',rid:d.rj});if(d.ctrl)act({type:'ctrl',id:d.ctrl})});
$('#leave').onclick=()=>{socket.emit('leave');setTimeout(()=>{socket.disconnect();location.href='/'},300)}; /* v20: leave the room — the server hands the host on at once if you were the host */
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
const localToggle=()=>{if(!S?.cur||!P)return;localT=Date.now();localWas=S.cur.playing;if(P.unMute)P.unMute();if(S.cur.playing)P.pauseVideo?.();else P.playVideo?.()};
$('#pp').onclick=()=>{if(!S?.cur){toast('Paste a YouTube link to start the room.');return}[P,P2].forEach(pl=>pl&&pl.unMute&&pl.unMute());localToggle();act({type:'play'})};$('#sk').onclick=()=>act({type:'skip'});$('#lock').onclick=()=>act({type:'lock'});
$('#af').onsubmit=e=>{e.preventDefault();const u=$('#au').value.trim();if(u){act({type:'add',url:u});$('#au').value=''}};
$('#vol').oninput=e=>setVolume(e.target.value);
$('#vm').onclick=()=>setVolume(volumeMuted?lastVolume:0);$('#vmx').onclick=()=>setVolume(100);
$('#sc').onpointerdown=()=>seeking=true;$('#sc').onchange=e=>{seeking=false;if(P)act({type:'seek',pos:e.target.value/1000*P.getDuration()})};
$('#share').onclick=()=>{const u=location.origin+'/room/'+S.code;$('#lk').value=u;$('#qr').innerHTML='';
 try{if(window.QRCode)new QRCode($('#qr'),{text:u,width:200,height:200});else throw new Error('no QR lib')}
 catch(e){$('#qr').innerHTML='<small>QR code unavailable — copy the link below.</small>'}
 $('#dlg').showModal()};
$('#cl').onclick=()=>$('#dlg').close();$('#cp').onclick=()=>{navigator.clipboard.writeText($('#lk').value);$('#cp').textContent='Copied'};
setInterval(()=>{if(!P||!P.getDuration||!S?.cur)return;const d=P.getDuration()||0,t=est();$('#t1').textContent=fmt(t);$('#t2').textContent=fmt(d);if(!seeking&&d)$('#sc').value=Math.min(1000,t/d*1000);
 /* stuck-buffer safety net: buffering for 12s straight while the room is
    playing means the stream is wedged — reload it at the live position. */
 if(S.cur.playing&&P.getPlayerState){const st=P.getPlayerState();if(st===3){if(!bufSince)bufSince=Date.now();else if(Date.now()-bufSince>12000){bufSince=0;cv=null;sync()}}else bufSince=0}},500);
if('mediaSession'in navigator){navigator.mediaSession.setActionHandler('play',()=>{localToggle();act({type:'play'})});navigator.mediaSession.setActionHandler('pause',()=>{localToggle();act({type:'play'})});navigator.mediaSession.setActionHandler('nexttrack',()=>act({type:'skip'}))}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
