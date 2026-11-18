const express=require('express'),http=require('http'),path=require('path'),fs=require('fs'),{Server}=require('socket.io'),{randomUUID}=require('crypto');
const app=express(),srv=http.createServer(app),io=new Server(srv);
app.use(express.static(path.join(__dirname,'public')));
app.get('/room/:c',(q,r)=>r.sendFile(path.join(__dirname,'public/index.html')));
/* v52: UPLOAD AN AUDIO FILE — the real background-audio fix. A YouTube
   iframe is a video element: iOS suspends it the moment the screen locks
   or the user switches apps, and no web code can stop that. A plain
   <audio> element is treated as audio, so it keeps playing through lock
   and app-switching. The client uploads the user's own audio file here
   (their file, not a YouTube download), the server saves it under a
   random id and serves it back to the whole room. Files live in
   public/uploads/ (ephemeral on the free plan — a server restart wipes
   them, and a missing file is reported as a bad track and skipped). */
const uploads=new Map(),UPL=path.join(__dirname,'public/uploads');
try{fs.mkdirSync(UPL,{recursive:true})}catch(e){}
const AU_EXT={'.mp3':1,'.m4a':1,'.wav':1,'.ogg':1};
app.post('/upload',express.raw({type:'*/*',limit:'25mb'}),(q,r)=>{ /* v52: the browser sends the file with its own MIME type (audio/mpeg, audio/mp4...), NOT application/octet-stream, so the raw parser must accept any content type on this route only. */
  const raw=String(q.query.name||'song').slice(0,100);
  const ext=path.extname(raw).toLowerCase();
  if(!AU_EXT[ext])return r.status(400).json({ok:false,message:'Only audio files (.mp3, .m4a, .wav, .ogg) can be uploaded.'});
  const buf=q.body;
  if(!buf||!Buffer.isBuffer(buf)||buf.length<1024)return r.status(400).json({ok:false,message:'That file looks empty.'});
  const id=Math.random().toString(36).slice(2,10),file=id+ext;
  try{fs.writeFileSync(path.join(UPL,file),buf)}catch(e){return r.status(500).json({ok:false,message:'Could not save the file.'})}
  const title=raw.replace(/\.[^.]+$/,'').replace(/[_\-]+/g,' ').trim().slice(0,80)||'Uploaded audio';
  uploads.set(id,{url:'/uploads/'+file,title});
  r.json({ok:true,id,url:'/uploads/'+file,title});
});
const rooms=new Map(),CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789',now=()=>Date.now(),SCHED=200; /* v21: scheduled start — play/pause/seek/track-change take effect at server time now()+SCHED so every device starts together. Was 800; cut to 200 because the host heard the pause land ~1s late. The tapping device also pauses/plays its own player instantly now (localToggle in app.js), so the tap feels instant and the group still follows at once. */
const newCode=()=>{let c;do c=Array.from({length:6},()=>CH[Math.random()*CH.length|0]).join('');while(rooms.has(c));return c};
const pos=r=>{if(!r.cur)return 0;if(r.cur.pending)return 0;return ((r.cur.playing?now():r.cur.pausedAt)-r.cur.anchor)/1000*(r.cur.speed||1)};
const online=r=>[...r.users.values()].filter(u=>u.connected);
const mod=(r,id)=>r.hostId===id||r.co.has(id);
/* v20: control access — who may play/pause/seek/skip/add directly. The host and
   co-hosts always have it; the host can also grant it to specific people (r.ctrl).
   Everyone else can only request a song (it waits for the host to approve it). */
const ctrl=(r,id)=>mod(r,id)||r.ctrl.has(id);
const pub=r=>({code:r.code,hostId:r.hostId,co:[...r.co],ctrl:[...r.ctrl],reqs:r.reqs,locked:r.locked,repeat:r.repeat,mode:r.mode,adders:[...r.adders],queue:r.queue,history:r.history.slice(-20),
  users:[...r.users.values()].filter(u=>u.connected).map(({id,name,color})=>({id,name,color})),
  cur:r.cur&&{videoId:r.cur.videoId,kind:r.cur.kind||'youtube',src:r.cur.src||'',title:r.cur.title,channel:r.cur.channel,artwork:r.cur.artwork,by:r.cur.by,tid:r.cur.tid,duration:r.cur.duration||0,reqs:r.cur.reqs,singerId:r.cur.singerId,singerName:r.cur.singerName,speed:r.cur.speed||1,live:r.cur.live,playing:r.cur.playing,playAt:r.cur.playAt||0,pending:r.cur.pending||false,pos:pos(r)},now:now()});
const push=r=>io.to(r.code).emit('state',pub(r));
const say=(r,m)=>io.to(r.code).emit('say',m);
function start(r,t,at){at=at||now();if(r.pendingT){clearTimeout(r.pendingT);r.pendingT=null}r.cur={...t,anchor:at,playing:true,pausedAt:0,live:false,speed:r.speed,playAt:at,pending:true,pendingPos:0};r.bad=new Set();/* v45: the clock does NOT start until a controller's player actually sounds (see 'started' below). Fallback: if nobody reports within 8s, start anyway so a stuck player can't freeze the room. */r.pendingT=setTimeout(()=>{if(r.cur&&r.cur.pending){r.cur.pending=false;r.cur.anchor=now();r.cur.playAt=now();r.pendingT=null;push(r)}},8000)}
function next(r,man){const T=now()+SCHED;if(r.cur&&r.repeat==='one'&&!man)start(r,r.cur,T);else{if(r.cur){r.history.push(r.cur);if(r.repeat==='all')r.queue.push({...r.cur,reqs:[],singerId:null,singerName:null})}const t=r.queue.shift();t?start(r,t,T):r.cur=null}push(r)}
const vid=u=>{const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);return m&&m[1]};
const embedCheckCache=new Map(),embedCheckPending=new Map(),EMBED_CHECK_TTL=15*60*1000;
async function youtubeEmbedStatus(id){
  if(!process.env.YOUTUBE_API_KEY)return{status:'unconfigured'};
  const cached=embedCheckCache.get(id);if(cached&&cached.expires>now())return cached.result;
  if(cached)embedCheckCache.delete(id);
  if(embedCheckPending.has(id))return embedCheckPending.get(id);
  const request=(async()=>{try{
    const url=new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part','status');url.searchParams.set('id',id);url.searchParams.set('key',process.env.YOUTUBE_API_KEY);
    const response=await fetch(url,{signal:AbortSignal.timeout(8000)});
    if(!response.ok)return{status:'error',httpStatus:response.status};
    const data=await response.json(),video=data.items?.[0];
    if(!video)return{status:'unavailable'};
    if(typeof video.status?.embeddable!=='boolean')return{status:'error'};
    return{status:video.status.embeddable?'embeddable':'blocked'};
  }catch{return{status:'error'}}})();
  embedCheckPending.set(id,request);
  const result=await request;embedCheckPending.delete(id);
  if(result.status!=='error'){
    if(embedCheckCache.size>=1000)embedCheckCache.delete(embedCheckCache.keys().next().value);
    embedCheckCache.set(id,{result,expires:now()+EMBED_CHECK_TTL});
  }
  return result;
}
function succeed(r){const c=online(r).filter(u=>u.id!==r.hostId);if(!c.length)return;
  const n=c.find(u=>r.co.has(u.id))||c.sort((a,b)=>a.at-b.at)[0];r.co.delete(n.id);r.hostId=n.id;say(r,n.name+' is now the host');push(r)}
io.on('connection',s=>{let r=null,me=null,lastVideoCheck=0;
  s.on('ping',t=>s.emit('pong',t)); /* v13: round-trip measurement for sync */
  s.on('create',(u,cb)=>{const c=newCode();rooms.set(c,{code:c,hostId:u.id,co:new Set(),ctrl:new Set(),reqs:[],locked:false,queue:[],history:[],cur:null,bans:new Set(),bad:new Set(),users:new Map(),speed:1,repeat:'off',mode:'music',adders:new Set(),last:now()});cb({code:c})});
  s.on('join',(u,cb)=>{const x=rooms.get(String(u.code||'').toUpperCase());if(!x)return cb({error:'That room doesn\u2019t exist or has ended.'});
    const requestedId=String(u.id||'');if(!requestedId)return cb({error:'Could not identify this session. Reload the page and try again.'});
    if(x.bans.has(requestedId))return cb({error:'You were removed from this room.'});
    let id=requestedId,old=x.users.get(id);
    /* v25: if this id is already in the room on a DIFFERENT socket, it is
       normally a second tab — give that tab a fresh id so the two tabs do not
       fight over one identity. BUT if the old socket is already dead, this is
       not a second tab, it is the same person reconnecting (their phone went
       to another app and the connection dropped, or the network blipped).
       In that case keep the SAME id, so they keep their name, their role,
       and — if they were the host — the host seat. Giving them a new id here
       was the bug: the host came back from another app as a "new" person and
       lost the host seat on the spot. */
    if(old&&old.connected&&old.sid!==s.id){const oldSock=io.sockets.sockets.get(old.sid);if(oldSock&&oldSock.connected){id=randomUUID();old=null}}
    r=x;s.join(r.code);old=r.users.get(id);
    me={id,name:String(u.name).slice(0,20)||'Guest',color:String(u.color).slice(0,30),connected:true,at:old?old.at:now(),sid:s.id};
    r.users.set(me.id,me);clearTimeout(r.t);if(!old)say(r,me.name+' joined');
    if(r.hostId===me.id){clearTimeout(r.gone)}push(r);cb({ok:1,id:me.id})});
  s.on('check-video',async(url,cb)=>{if(typeof cb!=='function')return;if(!r||!me)return cb({status:'error'});
    if(now()-lastVideoCheck<600)return cb({status:'rate-limited'});lastVideoCheck=now();
    const v=vid(url);if(!v)return cb({status:'invalid'});cb(await youtubeEmbedStatus(v))});
  s.on('act',async(a,cb)=>{if(!r||!me){if(typeof cb==='function')cb({ok:false,message:'Reconnect to the room and try again.'});return}const id=me.id,M=mod(r,id),C=ctrl(r,id),host=r.hostId===id;
    switch(a.type){
    case'play':if(!C||!r.cur)return;{const T=now()+SCHED,P=pos(r),sp=r.cur.speed||1;
      if(r.cur.playing){r.cur.pausedAt=T;r.cur.anchor=T-P*1000/sp;r.cur.playing=false}
      else{r.cur.anchor=T-P*1000/sp;r.cur.playing=true}
      r.cur.playAt=T}push(r);break;
    case'seek':if(!C||!r.cur)return;{const T=now()+SCHED,Q=Math.max(0,+a.pos),sp=r.cur.speed||1;
      r.cur.anchor=T-Q*1000/sp;r.cur.pausedAt=T;r.cur.playAt=T;if(r.cur.pending)r.cur.pendingPos=Q}push(r);break;
    case'started':{if(!C||!r.cur||r.cur.videoId!==a.v||!r.cur.pending)break;if(r.pendingT){clearTimeout(r.pendingT);r.pendingT=null}const sp=r.cur.speed||1,pp=r.cur.pendingPos||0;r.cur.pending=false;r.cur.anchor=now()-pp*1000/sp;r.cur.playAt=now();push(r);break}
    case'skip':if(!C||!r.cur)return;next(r,1);break;
    case'add':{const fail=m=>{if(typeof cb==='function')cb({ok:false,message:m});else s.emit('say',m)};
      if(r.mode==='karaoke'&&!M&&!r.adders.has(id))return fail('Ask the host to let you add songs.');
      let t=null;
      if(a.au){ /* v52: an uploaded audio file — the user's own file, served by this server. No YouTube check at all. */
        const up=uploads.get(a.au);
        if(!up)return fail('That upload could not be found. Upload the file again.');
        t={kind:'audio',videoId:'au:'+a.au,src:up.url,title:up.title,channel:'Your upload',artwork:'/logo.png',by:me.name,byId:id,color:me.color,tid:Math.random().toString(36).slice(2,9),duration:0,reqs:[],singerId:null,singerName:null};
      }else{
      const v=vid(a.url);if(!v)return fail('That doesn\u2019t look like a YouTube link.');
      const check=await youtubeEmbedStatus(v);if(check.status==='blocked')return fail('YouTube marks this video as not embeddable, so it cannot play in this room.');
      if(check.status==='unavailable')return fail('YouTube could not find a public video for that link.');
      let title='YouTube track',channel='';try{const j=await(await fetch('https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v='+v,{signal:AbortSignal.timeout(8000)})).json();title=j.title;channel=j.author_name}catch{return fail('That video can\u2019t be played here. Try another link.')}
      t={videoId:v,title,channel,artwork:'https://i.ytimg.com/vi/'+v+'/hqdefault.jpg',by:me.name,byId:id,color:me.color,tid:Math.random().toString(36).slice(2,9),duration:0,reqs:[],singerId:null,singerName:null};
      }
      const v=t.videoId,title=t.title;
      if(C){ /* host, co-host or a person the host gave control to: straight into the queue */
      if(r.queue.length>=100)return fail('The queue is full (100 tracks).');
      const dup=r.queue.find(t=>t.videoId===v)||(r.cur&&r.cur.videoId===v&&r.cur);if(dup)return fail('Already queued by '+dup.by);
      if(r.queue.slice(0,10).filter(t=>t.byId===id).length>=3)return fail('You already have 3 of the next 10 tracks. Let others add one.');
      r.cur?r.queue.push(t):start(r,t);say(r,me.name+' added '+title);push(r);if(typeof cb==='function')cb({ok:true});break}
      /* a guest without control access: the link becomes a request the host approves or rejects */
      if(r.locked)return fail('Requests are closed by the host right now.');
      if(r.reqs.find(q=>q.videoId===v))return fail('That song is already requested.');
      if(r.queue.find(q=>q.videoId===v)||(r.cur&&r.cur.videoId===v))return fail('That song is already in the room.');
      if(r.reqs.filter(q=>q.byId===id).length>=3)return fail('You already have 3 requests waiting. Wait for the host to approve one.');
      if(r.reqs.length>=20)return fail('Too many requests waiting right now.');
      r.reqs.push({...t,rid:t.tid});say(r,me.name+' requested '+title);push(r);
      if(typeof cb==='function')cb({ok:true,message:'Request sent — the host will approve it.'});else s.emit('say','Request sent — the host will approve it.');break}
    case'remove':{const t=r.queue[a.i];if(t&&(C||t.byId===id)){r.queue.splice(a.i,1);push(r)}break}
    case'lock':if(!host)return;r.locked=!r.locked;say(r,r.locked?'Requests are closed by the host':'Requests are open — anyone can request a song');push(r);break;
    case'ctrl':{if(!host||!r.users.has(a.id)||a.id===id)return;const u=r.users.get(a.id);
      if(r.ctrl.has(a.id)){r.ctrl.delete(a.id);say(r,u.name+' can no longer control playback')}
      else{r.ctrl.add(a.id);say(r,u.name+' can now control playback')}push(r);break}
    case'approve':{if(!host)return;const i=r.reqs.findIndex(q=>q.rid===a.rid);if(i<0)return;const q=r.reqs.splice(i,1)[0];
      const t={...q,tid:Math.random().toString(36).slice(2,9),reqs:[],singerId:null,singerName:null};delete t.rid;
      if(r.queue.length>=100)return s.emit('say','The queue is full (100 tracks).');
      r.cur?r.queue.push(t):start(r,t);say(r,'Host approved '+q.title);push(r);break}
    case'reject':{if(!host)return;const i=r.reqs.findIndex(q=>q.rid===a.rid);if(i<0)return;const q=r.reqs.splice(i,1)[0];
      const u=r.users.get(q.byId);if(u&&u.connected)io.to(u.sid).emit('say','The host declined your request: '+q.title);
      say(r,'Host declined '+q.title);push(r);break}
    case'host':{if(!host||!r.users.has(a.id))return;r.co.add(id);r.co.delete(a.id);r.hostId=a.id;say(r,r.users.get(a.id).name+' is now the host');push(r);break}
    case'cohost':if(!host||a.id===id)return;r.co.has(a.id)?r.co.delete(a.id):r.co.add(a.id);push(r);break;
    case'kick':{const u=r.users.get(a.id);if(!M||!u||a.id===r.hostId)return;r.bans.add(a.id);say(r,u.name+' was removed');io.sockets.sockets.get(u.sid)?.disconnect(true);u.connected=false;push(r);break}
    case'react':if(now()-(me.rl||0)<250)return;me.rl=now();io.to(r.code).emit('react',{e:String(a.e).slice(0,4),c:me.color});break;
    case'mode':if(!host)return;r.mode=a.m==='karaoke'?'karaoke':'music';say(r,r.mode==='karaoke'?'Karaoke mode is on':'Karaoke mode is off');push(r);break;
    case'adder':if(!host||!r.users.has(a.id))return;r.adders.has(a.id)?r.adders.delete(a.id):r.adders.add(a.id);push(r);break;
    case'sing':{const t=r.cur&&r.cur.tid===a.tid?r.cur:r.queue.find(x=>x.tid===a.tid);if(!t||t.singerId)return;const i=t.reqs.findIndex(x=>x.id===id);if(i<0){t.reqs.push({id,name:me.name});say(r,me.name+' wants to sing '+t.title)}else t.reqs.splice(i,1);push(r);break}
    case'assign':{const t=r.cur&&r.cur.tid===a.tid?r.cur:r.queue.find(x=>x.tid===a.tid);if(!M||!t)return;const u=a.id&&r.users.get(a.id);t.singerId=u?u.id:null;t.singerName=u?u.name:null;t.reqs=t.reqs.filter(x=>x.id!==a.id);t.live=false;if(u)say(r,u.name+' will sing '+t.title);push(r);break}
    case'live':if(r.cur&&r.cur.singerId===id){r.cur.live=!!a.on;push(r)}break;
    /* v27: the song's total length is shared, not per-device. Whichever
       participant's player first learns the real length (from YouTube's
       metadata) reports it; the server keeps it on the track and sends it to
       everyone, so every screen shows the same duration. First valid report
       wins — the length of one video never changes. */
    case'dur':{if(!r.cur||r.cur.tid!==a.tid||r.cur.duration>0)return;const d=Math.round(+a.dur);if(!Number.isFinite(d)||d<=0||d>86400)return;r.cur.duration=d;push(r);break}
    case'prev':if(!C||!r.cur)return;{const T=now()+SCHED;
      if(pos(r)>3||!r.history.length){r.cur.anchor=T;r.cur.pausedAt=T;r.cur.playing=true;r.cur.playAt=T}
      else{const p=r.history.pop();r.queue.unshift(r.cur);start(r,p,T)}}push(r);break;
    case'shuffle':if(!C)return;for(let i=r.queue.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[r.queue[i],r.queue[j]]=[r.queue[j],r.queue[i]]}say(r,'Queue shuffled');push(r);break;
    case'repeat':if(!C)return;r.repeat={off:'all',all:'one',one:'off'}[r.repeat];push(r);break;
    case'speed':{if(!C)return;const p=pos(r),sp=Math.min(1.25,Math.max(.75,+a.v||1)),T=now()+SCHED;r.speed=sp;if(r.cur){r.cur.speed=sp;r.cur.anchor=T-p*1000/sp;if(!r.cur.playing)r.cur.pausedAt=T;r.cur.playAt=T}say(r,'Speed '+sp+'×');push(r);break}
    case'ended':if(r.cur&&r.cur.videoId===a.v&&now()-r.cur.anchor>3000)next(r);break;
    case'bad':if(r.cur&&r.cur.videoId===a.v){r.bad.add(id);if(r.bad.size>=Math.floor(online(r).length/2)+1){say(r,a.code===101||a.code===150?'YouTube blocked embedded playback for "'+r.cur.title+'". Try a video that allows embedding.':'That track can\u2019t be played here. Skipped to the next one.');next(r)}}break}});
  s.on('leave',()=>{if(!r||!me)return;const u=r.users.get(me.id);if(!u||u.sid!==s.id)return;u.connected=false;if(r.cur&&r.cur.singerId===me.id)r.cur.live=false;clearTimeout(r.gone);push(r);const rr=r;
    if(rr.hostId===me.id)succeed(rr);rr.last=now()}); /* v20: explicit Leave — host passes on at once instead of the 12s disconnect grace */
  s.on('rtc',m=>{const u=r&&me&&r.users.get(m.to);if(u&&u.connected)io.to(u.sid).emit('rtc',{from:me.id,data:m.data})});
  s.on('disconnect',()=>{if(!r||!me)return;const u=r.users.get(me.id);if(!u||u.sid!==s.id)return;u.connected=false;if(r.cur&&r.cur.singerId===me.id)r.cur.live=false;push(r);const rr=r;
    /* v25: the host only loses the seat after being offline for 12 seconds.
       Going to another app (or a short network blip) drops the connection,
       but if the host comes back within 12s the rejoin clears this timer and
       they keep the seat. */
    if(rr.hostId===me.id)rr.gone=setTimeout(()=>succeed(rr),12000);rr.last=now()})});
setInterval(()=>{for(const [c,r] of rooms){if(r.cur&&r.cur.playing)push(r);else if(online(r).length)push(r);if(!online(r).length&&now()-r.last>864e5)rooms.delete(c)}},1000); /* v53: 1s heartbeat (was 2s) so drift is corrected sooner — fresher state for the tighter sync */
srv.listen(process.env.PORT||3000,()=>console.log('Vibe Room on :'+(process.env.PORT||3000)));
