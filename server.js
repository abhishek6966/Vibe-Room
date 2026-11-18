const express=require('express'),http=require('http'),path=require('path'),{Server}=require('socket.io');
const app=express(),srv=http.createServer(app),io=new Server(srv);
app.use(express.static(path.join(__dirname,'public')));
app.get('/room/:c',(q,r)=>r.sendFile(path.join(__dirname,'public/index.html')));
const rooms=new Map(),CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789',now=()=>Date.now(),SCHED=200; /* v21: scheduled start — play/pause/seek/track-change take effect at server time now()+SCHED so every device starts together. Was 800; cut to 200 because the host heard the pause land ~1s late. The tapping device also pauses/plays its own player instantly now (localToggle in app.js), so the tap feels instant and the group still follows at once. */
const newCode=()=>{let c;do c=Array.from({length:6},()=>CH[Math.random()*CH.length|0]).join('');while(rooms.has(c));return c};
const pos=r=>r.cur?((r.cur.playing?now():r.cur.pausedAt)-r.cur.anchor)/1000*(r.cur.speed||1):0;
const online=r=>[...r.users.values()].filter(u=>u.connected);
const mod=(r,id)=>r.hostId===id||r.co.has(id);
/* v20: control access — who may play/pause/seek/skip/add directly. The host and
   co-hosts always have it; the host can also grant it to specific people (r.ctrl).
   Everyone else can only request a song (it waits for the host to approve it). */
const ctrl=(r,id)=>mod(r,id)||r.ctrl.has(id);
const pub=r=>({code:r.code,hostId:r.hostId,co:[...r.co],ctrl:[...r.ctrl],reqs:r.reqs,locked:r.locked,repeat:r.repeat,mode:r.mode,adders:[...r.adders],queue:r.queue,history:r.history.slice(-20),
  users:[...r.users.values()].filter(u=>u.connected).map(({id,name,color})=>({id,name,color})),
  cur:r.cur&&{videoId:r.cur.videoId,title:r.cur.title,channel:r.cur.channel,artwork:r.cur.artwork,by:r.cur.by,tid:r.cur.tid,reqs:r.cur.reqs,singerId:r.cur.singerId,singerName:r.cur.singerName,speed:r.cur.speed||1,live:r.cur.live,playing:r.cur.playing,playAt:r.cur.playAt||0,pos:pos(r)},now:now()});
const push=r=>io.to(r.code).emit('state',pub(r));
const say=(r,m)=>io.to(r.code).emit('say',m);
function start(r,t,at){at=at||now();r.cur={...t,anchor:at,playing:true,pausedAt:0,live:false,speed:r.speed,playAt:at};r.bad=new Set()}
function next(r,man){r.votes.clear();const T=now()+SCHED;if(r.cur&&r.repeat==='one'&&!man)start(r,r.cur,T);else{if(r.cur){r.history.push(r.cur);if(r.repeat==='all')r.queue.push({...r.cur,reqs:[],singerId:null,singerName:null})}const t=r.queue.shift();t?start(r,t,T):r.cur=null}push(r)}
const vid=u=>{const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);return m&&m[1]};
function succeed(r){const c=online(r).filter(u=>u.id!==r.hostId);if(!c.length)return;
  const n=c.find(u=>r.co.has(u.id))||c.sort((a,b)=>a.at-b.at)[0];r.co.delete(n.id);r.hostId=n.id;say(r,n.name+' is now the host');push(r)}
io.on('connection',s=>{let r=null,me=null;
  s.on('ping',t=>s.emit('pong',t)); /* v13: round-trip measurement for sync */
  s.on('create',(u,cb)=>{const c=newCode();rooms.set(c,{code:c,hostId:u.id,co:new Set(),ctrl:new Set(),reqs:[],locked:false,queue:[],history:[],cur:null,votes:new Set(),bans:new Set(),bad:new Set(),users:new Map(),speed:1,repeat:'off',mode:'music',adders:new Set(),last:now()});cb({code:c})});
  s.on('join',(u,cb)=>{const x=rooms.get(String(u.code||'').toUpperCase());if(!x)return cb({error:'That room doesn\u2019t exist or has ended.'});
    if(x.bans.has(u.id))return cb({error:'You were removed from this room.'});
    r=x;s.join(r.code);const old=r.users.get(u.id);
    me={id:u.id,name:String(u.name).slice(0,20)||'Guest',color:String(u.color).slice(0,30),connected:true,at:old?old.at:now(),sid:s.id};
    r.users.set(me.id,me);clearTimeout(r.t);if(!old)say(r,me.name+' joined');
    if(r.hostId===me.id){clearTimeout(r.gone)}push(r);cb({ok:1})});
  s.on('act',async a=>{if(!r||!me)return;const id=me.id,M=mod(r,id),C=ctrl(r,id),host=r.hostId===id;
    switch(a.type){
    case'play':if(!C||!r.cur)return;{const T=now()+SCHED,P=pos(r),sp=r.cur.speed||1;
      if(r.cur.playing){r.cur.pausedAt=T;r.cur.anchor=T-P*1000/sp;r.cur.playing=false}
      else{r.cur.anchor=T-P*1000/sp;r.cur.playing=true}
      r.cur.playAt=T}push(r);break;
    case'seek':if(!C||!r.cur)return;{const T=now()+SCHED,Q=Math.max(0,+a.pos),sp=r.cur.speed||1;
      r.cur.anchor=T-Q*1000/sp;r.cur.pausedAt=T;r.cur.playAt=T}push(r);break;
    case'skip':if(!r.cur)return;if(C)return next(r,1);r.votes.add(id);const need=Math.ceil(online(r).length/2);
      if(r.votes.size>=need){say(r,'Vote passed. Skipping.');next(r,1)}else{say(r,me.name+' voted to skip ('+r.votes.size+'/'+need+')')}break;
    case'add':{if(r.mode==='karaoke'&&!M&&!r.adders.has(id))return s.emit('say','Ask the host to let you add songs.');const v=vid(a.url);if(!v)return s.emit('say','That doesn\u2019t look like a YouTube link.');
      let title='YouTube track',channel='';try{const j=await(await fetch('https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v='+v)).json();title=j.title;channel=j.author_name}catch{return s.emit('say','That video can\u2019t be played here. Try another link.')}
      const t={videoId:v,title,channel,artwork:'https://i.ytimg.com/vi/'+v+'/hqdefault.jpg',by:me.name,byId:id,color:me.color,tid:Math.random().toString(36).slice(2,9),reqs:[],singerId:null,singerName:null};
      if(C){ /* host, co-host or a person the host gave control to: straight into the queue */
      if(r.queue.length>=100)return s.emit('say','The queue is full (100 tracks).');
      const dup=r.queue.find(t=>t.videoId===v)||(r.cur&&r.cur.videoId===v&&r.cur);if(dup)return s.emit('say','Already queued by '+dup.by);
      if(r.queue.slice(0,10).filter(t=>t.byId===id).length>=3)return s.emit('say','You already have 3 of the next 10 tracks. Let others add one.');
      r.cur?r.queue.push(t):start(r,t);say(r,me.name+' added '+title);push(r);break}
      /* a guest without control access: the link becomes a request the host approves or rejects */
      if(r.locked)return s.emit('say','Requests are closed by the host right now.');
      if(r.reqs.find(q=>q.videoId===v))return s.emit('say','That song is already requested.');
      if(r.queue.find(q=>q.videoId===v)||(r.cur&&r.cur.videoId===v))return s.emit('say','That song is already in the room.');
      if(r.reqs.filter(q=>q.byId===id).length>=3)return s.emit('say','You already have 3 requests waiting. Wait for the host to approve one.');
      if(r.reqs.length>=20)return s.emit('say','Too many requests waiting right now.');
      r.reqs.push({...t,rid:t.tid});say(r,me.name+' requested '+title);s.emit('say','Request sent — the host will approve it.');push(r);break}
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
    case'sing':{const t=r.cur&&r.cur.tid===a.tid?r.cur:r.queue.find(x=>x.tid===a.tid);if(!t||t.singerId)return;const i=t.reqs.findIndex(x=>x.id===id);i<0?t.reqs.push({id,name:me.name}):t.reqs.splice(i,1);push(r);break}
    case'assign':{const t=r.cur&&r.cur.tid===a.tid?r.cur:r.queue.find(x=>x.tid===a.tid);if(!M||!t)return;const u=a.id&&r.users.get(a.id);t.singerId=u?u.id:null;t.singerName=u?u.name:null;t.reqs=t.reqs.filter(x=>x.id!==a.id);t.live=false;if(u)say(r,u.name+' will sing '+t.title);push(r);break}
    case'live':if(r.cur&&r.cur.singerId===id){r.cur.live=!!a.on;push(r)}break;
    case'prev':if(!C||!r.cur)return;{const T=now()+SCHED;
      if(pos(r)>3||!r.history.length){r.cur.anchor=T;r.cur.pausedAt=T;r.cur.playing=true;r.cur.playAt=T}
      else{const p=r.history.pop();r.queue.unshift(r.cur);start(r,p,T)}}push(r);break;
    case'shuffle':if(!C)return;for(let i=r.queue.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[r.queue[i],r.queue[j]]=[r.queue[j],r.queue[i]]}say(r,'Queue shuffled');push(r);break;
    case'repeat':if(!C)return;r.repeat={off:'all',all:'one',one:'off'}[r.repeat];push(r);break;
    case'speed':{if(!C)return;const p=pos(r),sp=Math.min(1.25,Math.max(.75,+a.v||1)),T=now()+SCHED;r.speed=sp;if(r.cur){r.cur.speed=sp;r.cur.anchor=T-p*1000/sp;if(!r.cur.playing)r.cur.pausedAt=T;r.cur.playAt=T}say(r,'Speed '+sp+'×');push(r);break}
    case'ended':if(r.cur&&r.cur.videoId===a.v&&now()-r.cur.anchor>3000)next(r);break;
    case'bad':if(r.cur&&r.cur.videoId===a.v){r.bad.add(id);if(r.bad.size>=Math.ceil(online(r).length/2)){say(r,'That track can\u2019t be played here. Skipped to the next one.');next(r)}}break}});
  s.on('leave',()=>{if(!r||!me)return;const u=r.users.get(me.id);if(!u||u.sid!==s.id)return;u.connected=false;if(r.cur&&r.cur.singerId===me.id)r.cur.live=false;clearTimeout(r.gone);push(r);const rr=r;
    if(rr.hostId===me.id)succeed(rr);rr.last=now()}); /* v20: explicit Leave — host passes on at once instead of the 30s disconnect grace */
  s.on('rtc',m=>{const u=r&&me&&r.users.get(m.to);if(u&&u.connected)io.to(u.sid).emit('rtc',{from:me.id,data:m.data})});
  s.on('disconnect',()=>{if(!r||!me)return;const u=r.users.get(me.id);if(!u||u.sid!==s.id)return;u.connected=false;if(r.cur&&r.cur.singerId===me.id)r.cur.live=false;push(r);const rr=r;
    if(rr.hostId===me.id)rr.gone=setTimeout(()=>succeed(rr),30000);rr.last=now()})});
setInterval(()=>{for(const [c,r] of rooms){if(r.cur&&r.cur.playing)push(r);else if(online(r).length)push(r);if(!online(r).length&&now()-r.last>864e5)rooms.delete(c)}},2000); /* v13: 2s heartbeat (was 5s) so drift is corrected sooner */
srv.listen(process.env.PORT||3000,()=>console.log('Vibe Room on :'+(process.env.PORT||3000)));
