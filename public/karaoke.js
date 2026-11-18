const FX={clean:['Dry',{rev:.05,size:.6,echo:0,fb:.2,low:0,mid:0,high:0,lp:20000,cr:0}],hall:['Hall',{rev:.45,size:3.2,echo:.1,fb:.25,low:0,mid:0,high:2,lp:20000,cr:0}],
party:['Party',{rev:.18,size:1.2,echo:.18,fb:.3,low:-1,mid:2,high:4,lp:20000,cr:0}],warm:['Warm',{rev:.2,size:1.4,echo:0,fb:.2,low:5,mid:1,high:-2,lp:12000,cr:0}],
fascinating:['Fascinating',{rev:.3,size:2,echo:.25,fb:.35,low:1,mid:0,high:3,lp:20000,cr:0}],distant:['Distant',{rev:.55,size:4,echo:.15,fb:.4,low:-2,mid:-3,high:-6,lp:5000,cr:0}],
vinyl:['Vinyl',{rev:.1,size:.8,echo:0,fb:.1,low:2,mid:3,high:-8,lp:5500,cr:.04}],church:['Church',{rev:.6,size:5.5,echo:.1,fb:.3,low:0,mid:0,high:1,lp:20000,cr:0}],
dreamland:['Dreamland',{rev:.5,size:4,echo:.4,fb:.5,low:0,mid:-1,high:4,lp:16000,cr:0}],hifi:['Hi-Fi',{rev:.08,size:.8,echo:0,fb:.1,low:2,mid:0,high:5,lp:20000,cr:0}],super:['Super reverb',{rev:.8,size:6,echo:.3,fb:.4,low:0,mid:0,high:2,lp:20000,cr:0}]};
let cfg={...FX.party[1],dn:.3,fx:'party'},AC,G={},peers={},inc={},lpc=null,rec=null,chunks=[],ksz=0;
/* v26: the host (or co-host) can sing a track directly — no request, no wait
   to be picked. `data-pick` with their own id assigns them as the singer. */
const kq=(t,M)=>{if(S.mode!=='karaoke')return'';const mine=t.reqs.some(r=>r.id===me.id);
 return(t.singerId?`<small style="color:var(--li)">🎤 ${esc(t.singerName)}</small>`:'')+t.reqs.map(r=>`<small>${esc(r.name)} wants to sing${M?`<button data-pick="${t.tid}|${r.id}">Pick</button>`:''}</small>`).join('')+
 (t.singerId===me.id?'':M?`<button data-pick="${t.tid}|${me.id}">Sing</button>`:`<button data-sing="${t.tid}">${mine?'Cancel request':'Request to sing'}</button>`)+(M&&t.singerId?`<button data-pick="${t.tid}|">Clear singer</button>`:'')};
const ku=u=>S.mode==='karaoke'?`<button data-adder="${u.id}">${S.adders.includes(u.id)?'Remove add access':'Let add songs'}</button>`:'';
/* v26: redesigned Sing tab — four clean sections instead of one crowded card.
   STAGE (who is singing + live voice visualizer) · YOUR TURN (the one action
   that matters right now) · MIC (singer controls, only when you are the
   singer) · VOICE EFFECTS (FX presets in a grid). */
const K=document.createElement('section');K.id='kar';K.hidden=true;
K.innerHTML=`<div class="kar-stage"><div class="kar-stage-top"><div class="kar-avatar" id="kav">🎤</div><div class="kar-stage-info"><div class="kar-stage-label" id="ksl">NO SINGER YET</div><div class="kar-stage-name" id="ksn">—</div><div class="kar-stage-song" id="kss">—</div></div><div class="kar-live" id="klv" hidden>LIVE</div></div><div class="kar-viz" id="kvis" aria-hidden="true">${'<i></i>'.repeat(24)}</div></div>
<div class="kar-action" id="ks"></div>
<div class="kar-mic" id="kc" hidden><p class="kar-tip">Wear headphones so the song doesn’t leak into your microphone.</p><div class="kar-row"><button id="kl" class="kar-big">Start singing</button><label class="kar-hear"><input type="checkbox" id="km"> Hear myself</label></div><div class="kar-row"><button id="kr">Record my vocals</button><a id="kd" hidden download="my-take.webm">Save take</a></div></div>
<div class="kar-fx"><h4>Voice effects</h4><div id="kf">${Object.entries(FX).map(([k,v])=>`<button data-fx="${k}" aria-label="Effect ${v[0]}">${v[0]}</button>`).join('')}</div>
<details><summary>Custom voice</summary>${[['rev','Reverb',0,1,.01],['size','Room size',.3,6,.1],['low','Bass',-12,12,1],['mid','Mids',-12,12,1],['high','Treble',-12,12,1],['dn','Denoise',0,1,.01]].map(([k,n,a,b,s])=>`<label class="sl">${n}<input type="range" data-k="${k}" min="${a}" max="${b}" step="${s}"></label>`).join('')}</details></div>`;
document.querySelector('.ctl').after(K);
const mb=document.createElement('button');mb.id='mb';mb.hidden=true;$('#share').before(mb);mb.onclick=()=>act({type:'mode',m:S.mode==='karaoke'?'music':'karaoke'});
/* v26: live voice visualizer. The bars are driven by the singer's actual mic
   level (their own AnalyserNode) — and on every listener's screen by the
   voice stream arriving over WebRTC, so the animation moves with the voice
   they actually hear. */
let vizAn=null,vizRAF=null,vizSrc=null,vizAC=null;
function vizDraw(){if(!vizAn)return;const bars=document.querySelectorAll('#kvis i');const n=bars.length,data=new Uint8Array(vizAn.frequencyBinCount);
 vizAn.getByteFrequencyData(data);for(let i=0;i<n;i++){const v=data[Math.floor(i/n*data.length*.6)]||0;bars[i].style.height=(6+Math.round(v/255*46))+'px'}
 vizRAF=requestAnimationFrame(vizDraw)}
function vizStart(an,src){if(vizSrc===src&&vizAn===an)return;vizStop();vizAn=an;vizSrc=src;if(an)vizRAF=requestAnimationFrame(vizDraw)}
function vizStop(){if(vizRAF)cancelAnimationFrame(vizRAF);vizRAF=null;vizAn=null;vizSrc=null;document.querySelectorAll('#kvis i').forEach(b=>b.style.height='8px')}
function ir(sec){const n=AC.sampleRate*sec|0,b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.5)}return b}
function apply(){K.querySelectorAll('[data-fx]').forEach(b=>b.classList.toggle('on',b.dataset.fx===cfg.fx));K.querySelectorAll('[data-k]').forEach(i=>i.value=cfg[i.dataset.k]);
 if(!AC)return;const t=AC.currentTime;G.revG.gain.setTargetAtTime(cfg.rev,t,.05);G.dry.gain.setTargetAtTime(1-cfg.rev*.5,t,.05);G.ec.gain.setTargetAtTime(cfg.echo,t,.05);G.fb.gain.value=cfg.fb;
 G.lo.gain.value=cfg.low;G.mi.gain.value=cfg.mid;G.hi.gain.value=cfg.high;G.lp.frequency.value=cfg.lp;G.cr.gain.value=cfg.cr;if(ksz!==cfg.size){G.rv.buffer=ir(cfg.size);ksz=cfg.size}}
function setFx(k){cfg={...FX[k][1],dn:cfg.dn,fx:k};apply()}
K.oninput=e=>{const k=e.target.dataset.k;if(k){cfg[k]=+e.target.value;cfg.fx='custom';apply()}};
const bq=(t,f,g)=>{const n=AC.createBiquadFilter();n.type=t;n.frequency.value=f;if(g)n.Q.value=g;return n},gn=v=>{const n=AC.createGain();n.gain.value=v;return n};
async function micStart(){const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 AC=new AudioContext();await AC.resume();G={st,hp:bq('highpass',90),gate:gn(1),an:AC.createAnalyser(),lo:bq('lowshelf',200),mi:bq('peaking',1500,1),hi:bq('highshelf',5000),lp:bq('lowpass',20000),comp:AC.createDynamicsCompressor(),
 dry:gn(1),rv:AC.createConvolver(),revG:gn(0),dl:AC.createDelay(1),fb:gn(.3),ec:gn(0),out:gn(1),mon:gn(0),cr:gn(0),dest:AC.createMediaStreamDestination()};
 const g=G;g.dl.delayTime.value=.28;g.an.fftSize=512;AC.createMediaStreamSource(st).connect(g.hp);g.hp.connect(g.an);
 g.hp.connect(g.gate);g.gate.connect(g.lo);g.lo.connect(g.mi);g.mi.connect(g.hi);g.hi.connect(g.lp);g.lp.connect(g.comp);g.comp.connect(g.dry);g.dry.connect(g.out);
 g.comp.connect(g.rv);g.rv.connect(g.revG);g.revG.connect(g.out);g.comp.connect(g.dl);g.dl.connect(g.ec);g.ec.connect(g.out);g.dl.connect(g.fb);g.fb.connect(g.dl);
 const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()<.002?Math.random()*2-1:0;
 const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;ns.connect(g.cr);g.cr.connect(g.out);ns.start();
 g.out.connect(g.dest);g.out.connect(g.mon);g.mon.connect(AC.destination);ksz=0;apply();vizStart(g.an,'mic');
 const buf=new Float32Array(512);g.timer=setInterval(()=>{g.an.getFloatTimeDomainData(buf);let s=0;for(const v of buf)s+=v*v;const r=Math.sqrt(s/512);g.gate.gain.setTargetAtTime(cfg.dn>0&&r<cfg.dn*.02?.08:1,AC.currentTime,.05)},40)}
function micStop(){clearInterval(G.timer);G.st?.getTracks().forEach(t=>t.stop());Object.values(peers).forEach(p=>p.close());peers={};AC?.close();AC=null;G={};vizStop();if(rec&&rec.state!=='inactive')rec.stop();$('#kl').textContent='Start singing'}
function offerTo(id){if(peers[id])return;const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});peers[id]=pc;G.dest.stream.getTracks().forEach(t=>pc.addTrack(t,G.dest.stream));
 pc.onicecandidate=e=>e.candidate&&socket.emit('rtc',{to:id,data:{c:e.candidate}});pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)){pc.close();delete peers[id]}};
 pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>socket.emit('rtc',{to:id,data:{d:pc.localDescription}}))}
let chain=Promise.resolve();
socket.on('rtc',({from,data})=>{chain=chain.then(async()=>{try{
 if(data.d&&data.d.type==='offer'){lpc?.close();const pc=lpc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
  pc.onicecandidate=e=>e.candidate&&socket.emit('rtc',{to:from,data:{c:e.candidate}});
  /* v26: when the singer's voice arrives, play it AND analyse the same
     stream for the stage visualizer — so the bars on this screen move with
     the voice this person actually hears. The analysis is read-only; the
     audio element keeps playing the stream directly. */
  pc.ontrack=e=>{let a=$('#kv');if(!a){a=new Audio();a.id='kv';a.autoplay=true;document.body.append(a)}a.srcObject=e.streams[0];a.play().catch(()=>{});
   try{vizAC=vizAC||new AudioContext();vizAC.resume().catch(()=>{});const src=vizAC.createMediaStreamSource(e.streams[0]);const an=vizAC.createAnalyser();an.fftSize=512;src.connect(an);vizStart(an,'peer')}catch{}};
  await pc.setRemoteDescription(data.d);await pc.setLocalDescription(await pc.createAnswer());socket.emit('rtc',{to:from,data:{d:pc.localDescription}})}
 else if(data.d){await peers[from]?.setRemoteDescription(data.d)}
 else if(data.c){await(peers[from]||lpc)?.addIceCandidate(data.c)}}catch(e){}})});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.sing)act({type:'sing',tid:d.sing});if('pick'in d){const[t,i]=d.pick.split('|');act({type:'assign',tid:t,id:i||null})}
 if(d.adder)act({type:'adder',id:d.adder});if(d.fx)setFx(d.fx);
 if(b.id==='kl'){if(AC){micStop();act({type:'live',on:false})}else{try{await micStart();b.textContent='Stop singing';act({type:'live',on:true})}catch{toast('Allow microphone access to sing. Microphones need https or localhost.')}}}
 if(b.id==='kr'&&AC){if(rec&&rec.state==='recording'){rec.stop();b.textContent='Record my vocals'}else{chunks=[];rec=new MediaRecorder(G.dest.stream);rec.ondataavailable=x=>chunks.push(x.data);
  rec.onstop=()=>{const a=$('#kd');a.href=URL.createObjectURL(new Blob(chunks,{type:'audio/webm'}));a.hidden=false};rec.start();b.textContent='Stop recording'}}});
$('#km').onchange=e=>AC&&G.mon.gain.setTargetAtTime(e.target.checked?.9:0,AC.currentTime,.05);
function karRender(){const k=S.mode==='karaoke',isH=S.hostId===me.id,M=isH||S.co.includes(me.id),c=S.cur;mb.hidden=!isH;mb.textContent=k?'Karaoke: on':'Karaoke: off';K.hidden=!k;
 $('#au').disabled=k&&!M&&!S.adders.includes(me.id);$('#au').placeholder=$('#au').disabled?'Ask the host for add access':'Paste a YouTube link…';
 const mine=c&&c.singerId===me.id;if(!k||!mine){if(AC)micStop()}
 if(!k){vizStop();return}
 /* v26: the stage — one clean card that always shows who is singing, the
    song, and whether they are live. The visualizer bars animate with the
    singer's voice (mic on their screen, WebRTC stream on everyone else's). */
 const st=document.querySelector('.kar-stage'),sl=$('#ksl'),sn=$('#ksn'),ss=$('#kss'),lv=$('#klv');
 if(!c){sl.textContent='NO SINGER YET';sn.textContent='Add a karaoke track to begin';ss.textContent='';lv.hidden=true;st.classList.remove('live');vizStop()}
 else if(c.singerId){sl.textContent=c.live?'SINGING LIVE':'SINGER';sn.textContent=c.singerName;ss.textContent=c.title;lv.hidden=!c.live;st.classList.toggle('live',!!c.live);
  if(mine&&AC&&c.live)vizStart(G.an,'mic');else if(!mine&&c.live){/* listener viz starts in ontrack */}else vizStop()}
 else{sl.textContent='NO SINGER YET';sn.textContent='';ss.textContent=c.title;lv.hidden=true;st.classList.remove('live');vizStop()}
 /* v26: your turn — one clear action. The host (or co-host) sings directly
    with no request and no wait to be picked. Everyone else requests. */
 $('#ks').innerHTML=!c?'':c.singerId?`<div class="kar-now">🎤 <b>${esc(c.singerName)}</b> is singing${c.live?' live now':' — waiting for their mic'}</div>${M?`<button data-pick="${c.tid}|">Clear singer</button>`:''}`:
  (M?`<button class="kar-sing" data-pick="${c.tid}|${me.id}">🎤 Sing this song</button><span class="kar-hint">You are the host — no request needed.</span>`:
  `<button class="kar-sing" data-sing="${c.tid}">${c.reqs.some(r=>r.id===me.id)?'Cancel request':'Request to sing'}</button>`)+
  (c.reqs.length?`<div class="kar-reqs"><h4>Waiting to sing</h4>${c.reqs.map(r=>`<div class="kar-req"><span>${esc(r.name)}</span>${M?`<button data-pick="${c.tid}|${r.id}">Pick</button>`:''}</div>`).join('')}</div>`:'');
 $('#kc').hidden=!mine;
 if(mine&&AC&&c.live)S.users.forEach(u=>u.id!==me.id&&offerTo(u.id));
 if(mine)Object.keys(peers).forEach(id=>{if(!S.users.some(u=>u.id===id)){peers[id].close();delete peers[id]}});
 if(!(c&&c.live&&!mine)&&lpc){lpc.close();lpc=null;const a=$('#kv');if(a)a.srcObject=null;vizStop()}}
apply();
