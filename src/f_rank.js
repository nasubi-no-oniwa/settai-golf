
// ===== 画面の切りかえ =====
const PANELS=['title','result','vidPanel','rankPanel'];
function show(id){PANELS.forEach(p=>$(p).hidden=(p!==id));}
let bestMs=ls.get('sg_best',0);
function showBest(){const f=bestMs?fmt(bestMs)+t('sec'):t('none');$('tBest').textContent=t('best')+'：'+f;$('hudBest').textContent=t('best')+' '+f;}
function applyLang(){
 document.documentElement.lang=lang==='zh'?'zh-Hant':lang;
 $('tTitle').innerHTML=t('title');$('tHow').innerHTML=t('how');
 $('nameIn').placeholder=t('name');$('rName').placeholder=t('name');
 $('startBtn').textContent=t('start');$('rankBtn').textContent=t('rank');$('hudTitle').textContent=t('hud');
 $('againBtn').textContent=t('again');$('vidBtn').textContent=t('video');$('xBtn').textContent=t('xpost');$('renameBtn').textContent=t('rename');
 $('rRank').textContent=t('rank');$('rTop').textContent=t('top');
 $('vTitle').textContent=t('video');$('vShare').textContent=t('share');$('vSave').textContent=t('save');$('vX').textContent=t('xpost');$('vBack').textContent=t('back');
 $('rkTitle').textContent=t('rank');$('rkNote').textContent=t('rkNote');$('rankBack').textContent=t('back');$('tabDay').textContent=t('today');$('tabAll').textContent=t('alltime');
 $('replayBack').textContent=t('back');$('ff').textContent=t('ff');
 $('langs').innerHTML=LANGS.map(([k,l])=>'<button data-l="'+k+'"'+(k===lang?' class="on"':'')+'>'+l+'</button>').join('');
 drawClubs();showBest();
}
$('langs').onclick=e=>{const b=e.target.closest('button');if(!b)return;lang=b.dataset.l;ls.set('sg_lang',lang);applyLang();};
let titleT=0;
function showTitle(){mode='title';show('title');setUI('title');$('skipBtn').hidden=true;$('replayBar').hidden=true;$('big').innerHTML='';capText('');hideBubs();$('freeze').style.opacity=0;
 $('nameIn').value=ls.get('sg_name','');showBest();clearActors();newRun();PL=null;
 ball.position.set(0,BR,0);ball.scale.setScalar(.06);bossBall.position.set(BB.x,.055,BB.z);cupG.position.set(CUP.x,0,CUP.z);flyHead.visible=false;aimArrow.visible=false;ballGlow.visible=false;}
$('startBtn').onclick=()=>{const n=$('nameIn').value.trim();if(n&&!badName(n))ls.set('sg_name',n);ac();startIntro();};
$('againBtn').onclick=()=>{ac();startIntro();};
$('rTop').onclick=showTitle;
$('rankBtn').onclick=()=>openRank('d');
$('rRank').onclick=()=>openRank('d',true);
$('rankBack').onclick=()=>{if(rankFrom)show('result');else showTitle();};
$('tabDay').onclick=()=>openRank('d',rankFrom);$('tabAll').onclick=()=>openRank('all',rankFrom);
function myName(){return ls.get('sg_name','')||t('anon');}
function showResult(){
 show('result');setUI('result');$('hud').hidden=true;$('big').innerHTML='';capText('');hideBubs();const r=G.res;
 $('rName').hidden=true;$('renameBtn').hidden=true;const sc=t('seen',{n:seenCount(),m:SG.R.length});
 if(r.kind==='yuzu'){
  $('rHead').textContent=t('yuzuHead');$('rHead').style.color='var(--ok)';$('rTime').innerHTML=t('yuzuBig');$('rTime').style.color='var(--ok)';$('rGrade').textContent='';
  $('rNote').innerHTML=esc(t('yuzuNote'))+(yuzuN?'<br>'+esc(t('yuzuCount',{n:yuzuN.toLocaleString()})):'')+'<br><small>'+esc(sc)+'</small>';
 }else if(r.kind==='kubi'){
  $('rHead').textContent=t('kubiHead');$('rHead').style.color='var(--red)';$('rTime').innerHTML=t('kubiBig');$('rTime').style.color='var(--red)';$('rGrade').textContent='';
  $('rNote').innerHTML=esc(t('kubiNote'))+(kubiN?'<br>'+esc(t('kubiCount',{n:kubiN.toLocaleString()})):'');
 }else{
  $('rHead').textContent=t('won');$('rHead').style.color='';$('rTime').innerHTML=fmt(r.ms)+'<small>'+t('sec')+'</small>';$('rTime').style.color='';
  $('rGrade').innerHTML='<span style="font-size:13px;color:var(--sub)">'+t('ttl')+'</span><br>「'+esc(grade(r.ms))+'」';
  $('rNote').innerHTML=esc(reasonTxt(r.ri)[0])+(r.newBest?'<br><b style="color:var(--ok)">'+t('newbest')+'</b>':'')+'<br><small>'+esc(sc)+'</small>';
  if(sendState.canRename&&!ls.get('sg_name','')){$('rName').hidden=false;$('rName').value='';$('renameBtn').hidden=false;}
 }
 $('sendMsg').textContent=r.kind==='win'?(sendState.msg||''):'';$('sendMsg').className='note '+(sendState.cls||'');
 $('vidBtn').hidden=false;
}
function postText(){const r=G.res;return (r.kind==='yuzu'?t('postYuzu'):r.kind==='kubi'?t('postKubi'):t('post',{s:fmt(r.ms),g:grade(r.ms)}))+'\n'+t('tags');}
$('xBtn').onclick=()=>{if(!G.res)return;const u='https://x.com/intent/post?text='+encodeURIComponent(postText())+'&url='+encodeURIComponent(GAME_URL);const w=window.open(u,'_blank');if(!w)location.href=u;};
$('vX').onclick=$('xBtn').onclick;

// ===== ランキング（Firebase：ft-green の sg の下） =====
const FB={apiKey:'AIzaSyCfCUAY7vhCFVF58tGOQzLCQsfPhp-Qi1A',databaseURL:'https://ft-green-default-rtdb.asia-southeast1.firebasedatabase.app'};
const NG=['ちんこ','ちんぽ','まんこ','せっくす','セックス','きんたま','レイプ','死ね','しね','殺す','ころす','ガイジ','キチガイ','きちがい','ニガー','チョン','支那','fuck','shit','bitch','cunt','dick','pussy','nigger','nigga','faggot','retard','whore','slut','rape','porn','nazi','hitler','씨발','시발','병신','좆','肏','屄','屌','幹你','操你','婊子'];
const badName=s=>{const n=s.normalize('NFKC').toLowerCase().replace(/[\s・._\-ー〜~!！?？*＊]/g,'');return NG.some(w=>n.includes(w.normalize('NFKC').toLowerCase()));};
async function fetchR(url,opt){let err;for(let i=0;i<3;i++){try{return await fetch(url,opt);}catch(e){err=e;await new Promise(r=>setTimeout(r,500*(i+1)));}}throw err;}
async function fbAuth(){
 if(window.__SGPV)throw new Error('pv');
 let a=ls.get('sg_auth',null);if(a&&a.exp>Date.now()+60000)return a;
 if(a&&a.refresh){try{const r=await fetchR('https://securetoken.googleapis.com/v1/token?key='+FB.apiKey,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(a.refresh)});
  if(r.ok){const j=await r.json();a={uid:j.user_id,token:j.id_token,refresh:j.refresh_token,exp:Date.now()+(+j.expires_in)*1000};ls.set('sg_auth',a);return a;}}catch(_){}}
 const r=await fetchR('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+FB.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
 if(!r.ok)throw new Error('auth');const j=await r.json();a={uid:j.localId,token:j.idToken,refresh:j.refreshToken,exp:Date.now()+(+j.expiresIn)*1000};ls.set('sg_auth',a);return a;
}
fbAuth().catch(()=>{});
const DB=p=>FB.databaseURL+'/sg/'+p;
const Q=a=>'.json?auth='+encodeURIComponent(a.token);
const PUT=(url,body)=>fetchR(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
// ずる対策：打った瞬間に、打ち方とサーバーの時計を書く。その時刻で理由が決まる
function takeTicket(inp){
 if(window.__SGPV)return new Promise(r=>setTimeout(()=>r(window.__SGPV.st!=null?window.__SGPV.st:Date.now()),window.__SGPV.lag||30));
 return (async()=>{const a=await fbAuth();
  const r=await PUT(DB('runs/'+a.uid)+Q(a),{t:{'.sv':'timestamp'},in:inp});
  if(!r.ok)throw new Error('ticket '+r.status);
  const j=await r.json();let st=j&&j.t;
  if(typeof st!=='number'){const g=await fetchR(DB('runs/'+a.uid+'/t')+Q(a));st=await g.json();}
  return typeof st==='number'?st:null;
 })().catch(e=>{console.warn(e);return null;});
}
const dayKey=ms=>Math.floor((ms+32400000)/86400000);
let sendState={};
async function submit(){
 const r=G.res;r.newBest=!bestMs||r.ms>bestMs;if(r.newBest){bestMs=r.ms;ls.set('sg_best',bestMs);}
 sendState={msg:'',cls:'',canRename:false};
 const setMsg=(m,c)=>{sendState.msg=m;sendState.cls=c;if(!$('result').hidden){$('sendMsg').textContent=m;$('sendMsg').className='note '+c;}};
 if(G.offline||G.st==null){setMsg(t('offline'),'err');return;}
 if(window.__SGPV){setMsg(t('sent',{r:2}),'ok');sendState.canRename=true;return;}
 setMsg(t('sending'),'');
 try{
  const a=await fbAuth();
  const rec={n:myName(),s:r.ms,st:G.st,in:G.in,v:SG.V,t:{'.sv':'timestamp'}};
  const dk=dayKey(Date.now());const recD={...rec,dk};
  G.sent={rec,recD};
  const cur=await fetchR(DB('all/scores/'+a.uid)+'.json').then(x=>x.ok?x.json():null).catch(()=>null);
  const curD=await fetchR(DB('d/scores/'+a.uid)+'.json').then(x=>x.ok?x.json():null).catch(()=>null);
  const okAll=!cur||cur.s<r.ms,okD=!curD||curD.dk!==dk||curD.s<r.ms;
  if(okD){const res=await PUT(DB('d/scores/'+a.uid)+Q(a),recD);if(res.ok)G.sent.d=1;}
  if(okAll){const res=await PUT(DB('all/scores/'+a.uid)+Q(a),rec);if(res.ok)G.sent.all=1;}
  if(!G.sent.d&&!G.sent.all){setMsg(okAll||okD?t('senderr'):t('notbetter'),okAll||okD?'err':'');return;}
  sendState.canRename=true;
  const rk=await myRank(G.sent.d?'d':'all',a.uid);setMsg(t('sent',{r:rk||'?'}),'ok');
  if(!$('result').hidden&&!ls.get('sg_name','')){$('rName').hidden=false;$('renameBtn').hidden=false;}
 }catch(e){console.warn(e);setMsg(t('senderr'),'err');}
}
$('renameBtn').onclick=async()=>{
 const n=$('rName').value.trim(),m=$('sendMsg');
 if(!n){m.textContent=t('needname');m.className='note err';return;}
 if(badName(n)){m.textContent=t('badname');m.className='note err';return;}
 ls.set('sg_name',n);if(!G.sent)return;$('renameBtn').disabled=true;
 try{const a=await fbAuth();
  if(G.sent.d){const res=await PUT(DB('d/scores/'+a.uid)+Q(a),{...G.sent.recD,n});if(!res.ok)throw 0;}
  if(G.sent.all){const res=await PUT(DB('all/scores/'+a.uid)+Q(a),{...G.sent.rec,n});if(!res.ok)throw 0;}
  m.textContent=t('renamed');m.className='note ok';$('rName').hidden=true;$('renameBtn').hidden=true;
 }catch(e){m.textContent=t('senderr');m.className='note err';}
 $('renameBtn').disabled=false;
};
$('nameIn').addEventListener('change',()=>{const n=$('nameIn').value.trim();if(n&&badName(n)){$('nameIn').value='';return;}ls.set('sg_name',n);});
// 譲った人・クビの人
let yuzuN=0,kubiN=0;
async function sendYuzu(){
 try{if(!G.offline&&G.st!=null&&G.b!=null){const a=await fbAuth();await PUT(DB('yuzu/'+a.uid)+Q(a),{t:{'.sv':'timestamp'},st:G.st,in:G.in,b:Math.round(G.b*1000),v:SG.V});}
  yuzuN=await countOf('yuzu');if(!$('result').hidden&&G.res&&G.res.kind==='yuzu')showResult();}catch(e){console.warn(e);}
}
async function sendKubi(){try{const a=await fbAuth();await PUT(DB('kubi/'+a.uid)+Q(a),{t:{'.sv':'timestamp'}});kubiN=await countOf('kubi');if(!$('result').hidden&&G.res&&G.res.kind==='kubi')showResult();}catch(e){console.warn(e);}}
async function countOf(p,since){const url=since?DB(p)+'.json?orderBy=%22t%22&startAt='+since:DB(p)+'.json?shallow=true';const r=await fetchR(url);if(!r.ok)return 0;const j=await r.json();return j?Object.keys(j).length:0;}
async function loadBoard(board){
 const today=dayKey(Date.now());
 const url=board==='d'?DB('d/scores')+'.json?orderBy=%22dk%22&equalTo='+today:DB('all/scores')+'.json?orderBy=%22s%22&limitToLast=300';
 const [d,h]=await Promise.all([fetch(url).then(r=>{if(!r.ok)throw 0;return r.json()}),fetch(DB('hidden')+'.json').then(r=>r.ok?r.json():null).catch(()=>null)]);
 return Object.entries(d||{}).map(([id,v])=>({...v,id})).filter(r=>!(h&&h[r.id])&&typeof r.s==='number').sort((a,b)=>b.s-a.s||a.t-b.t);
}
async function myRank(board,uid){try{const rows=await loadBoard(board);const i=rows.findIndex(r=>r.id===uid);return i>=0?i+2:null;}catch(e){return null;}}
let rankFrom=false,rankRows=[],curBoard='d';
async function openRank(board,fromResult){
 rankFrom=!!fromResult;curBoard=board;show('rankPanel');$('tabDay').classList.toggle('on',board==='d');$('tabAll').classList.toggle('on',board==='all');
 const box=$('rankBox');box.innerHTML='<p>'+t('loading')+'</p>';
 try{
  const since=board==='d'?(dayKey(Date.now())*86400000-32400000):0;
  const [rows,n]=await Promise.all([loadBoard(board),countOf('yuzu',since||undefined).catch(()=>0)]);rankRows=rows;const myId=(ls.get('sg_auth',null)||{}).uid;
  let h='<table class="rank"><tr class="top"><td class="r">1</td><td class="n">'+esc(t('yuzuRow'))+'</td><td class="c">'+esc(t('people',{n:n.toLocaleString()}))+'</td><td></td></tr>';
  h+=rows.slice(0,100).map((r,i)=>'<tr'+(r.id===myId?' class="me"':'')+'><td class="r">'+(i+2)+'</td><td class="n">'+esc(r.n)+'<br><small style="color:var(--sub);font-size:11px">'+esc(grade(r.s))+'</small></td><td class="c">'+fmt(r.s)+t('sec')+'</td><td class="p"><button data-i="'+i+'">▶</button></td></tr>').join('');
  if(!rows.length)h+='<tr><td></td><td colspan="3">'+t('empty')+'</td></tr>';
  box.innerHTML=h+'</table>';
 }catch(e){box.innerHTML='<p>'+t('rankerr')+'</p>';}
}
$('rankBox').onclick=e=>{const b=e.target.closest('button[data-i]');if(!b)return;startReplay(rankRows[+b.dataset.i]);};

// ===== 再生（途中は早送り） =====
// 打ってから3秒はふつう → 入る6秒前まで早送り → 最後はふつう
function playClock(T,real){const a=3,bEnd=Math.max(a,T-6),ffLen=Math.max(0,bEnd-a),ffDur=Math.min(ffLen,Math.max(2,ffLen/6));
 if(real<a)return {t:real,ff:false};if(real<a+ffDur)return {t:a+(real-a)*(ffLen/Math.max(1e-6,ffDur)),ff:ffLen>0};return {t:bEnd+(real-a-ffDur),ff:false};}
function playLen(T){const a=3,ffLen=Math.max(0,Math.max(a,T-6)-a);return a+Math.min(ffLen,Math.max(2,ffLen/6))+(T-Math.max(a,T-6));}
let RP=null;
function startReplay(rec){
 const o=SG.parseIn(rec.in);if(!o)return;const P=SG.shot(o.c,o.d,o.p,SG.seedOf(rec.st));
 show(null);clearActors();newRun();mode='replay';setUI('replay');$('replayBar').hidden=false;$('replayTxt').textContent=t('replaying',{n:rec.n})+'  '+fmt(rec.s)+t('sec');
 AIM.c=o.c;AIM.d=o.d;AIM.p=o.p;setPlan(P,{});RP={P,real:0,last:0};
}
function replayFrame(dt,now){
 RP.real+=dt;const P=RP.P;const end=playLen(P.T)+1.5;if(RP.real>end){RP.real=0;RP.last=0;}
 const c=playClock(P.T,RP.real),tt=Math.min(c.t,P.T+1.5);
 const out=sceneAt(P,tt);if(tt>RP.last)playEv(P,RP.last,tt);const spd=c.ff?(tt-RP.last)/Math.max(1e-4,dt):1;RP.last=tt;
 const D=SG.DIR[P.d];placeMe(D[0],D[1],tt<.25?lerp(-.3-(P.p/100)*2,1.9,tt/.25):1.9,false);placeBoss(tt<P.T?'nervous':'freeze',now/1000,P);
 camForShot(P,tt,out,dt,Math.max(1,spd));$('hudTime').textContent=Math.min(tt,P.T).toFixed(2);$('ff').hidden=!c.ff;
 const [rs]=reasonTxt(P.ri);capText(tt>=P.capT?rs:'');ballGlow.visible=tt<P.T;ballGlow.position.set(out.ball.x,.02,out.ball.z);
}
$('replayBack').onclick=()=>{$('replayBar').hidden=true;$('ff').hidden=true;clearActors();capText('');mode='title';openRank(curBoard,rankFrom);};
