
// ===== 自分と部長のポーズ =====
const AIM={c:0,d:0,f:0,p:0};
function aimDir(){return SG.DIR[AIM.d];}
function placeMe(dx,dz,swing,brk){
 // 右打ち：目標が体の左。体はボールの方を向く
 const Fx=-dz,Fz=dx;poseReset(me);
 me.man.position.set(-Fx*.55,0,-Fz*.55);me.man.rotation.y=Math.atan2(Fx,Fz);
 const a=swing==null?0:swing;
 me.armL.rotation.x=me.armR.rotation.x=-.35;me.armL.rotation.z=me.armR.rotation.z=a;me.hip.rotation.x=.25;me.neck.rotation.x=.3;
 club.visible=true;clubHead.visible=!brk;
 if(brk){me.armL.rotation.z=-.6;me.armR.rotation.z=.6;me.legR.rotation.x=-.9;me.armL.rotation.x=me.armR.rotation.x=-.9;}
}
function placeBoss(mode,t,P){
 poseReset(boss);boss.M.color.setHex(mode==='angry'?0xc8302a:0x23315a);
 let x=BOSS.x,z=BOSS.z,fx=-x,fz=-z;
 if(P&&P.type==='boss'&&PL===P){const s=segOf(P,Math.min(t,P.T));const E=P.L.E;const tx=E.x-P.L.ux*.6,tz=E.z-P.L.uz*.6;
  if(s&&t>=P.te&&(s.k==='act'||s.k==='push')){const u=s.k==='act'?s.u:1,e=ease(u);x=lerp(BOSS.x,tx,e);z=lerp(BOSS.z,tz,e);fx=E.x-x;fz=E.z-z;
   if(s.k==='act'&&u<.85)walkPose(boss,t*10,.7);else bossAct(P.q.mode,s.k==='act'?(u-.85)/.15:1);mode='none';}
  else if(t>=P.T){x=tx;z=tz;fx=E.x-x;fz=E.z-z;}}
 boss.man.position.set(x,0,z);boss.man.rotation.y=Math.atan2(fx,fz);
 if(mode==='idle'){boss.armL.rotation.z=-.15;boss.armR.rotation.z=.15;boss.hip.rotation.z=Math.sin(t*1.3)*.04;boss.neck.rotation.y=Math.sin(t*.7)*.3;}
 else if(mode==='nervous'){boss.armL.rotation.x=boss.armR.rotation.x=-.8;boss.armL.rotation.z=.6;boss.armR.rotation.z=-.6;boss.root.position.y=Math.abs(Math.sin(t*6))*.04;boss.neck.rotation.y=Math.sin(t*2)*.4;}
 else if(mode==='putt'){boss.hip.rotation.x=.4;boss.armL.rotation.x=boss.armR.rotation.x=-.4;boss.armL.rotation.z=boss.armR.rotation.z=Math.sin(clamp(t,0,1)*Math.PI)*.4-.2;}
 else if(mode==='shock'){boss.armL.rotation.z=-2.6;boss.armR.rotation.z=2.6;boss.armL.rotation.x=boss.armR.rotation.x=-.5;boss.hip.rotation.x=-.15;}
 else if(mode==='walk'){walkPose(boss,t*9,.6);}
 else if(mode==='freeze'){boss.hip.rotation.x=-.08;boss.armL.rotation.z=-.05;boss.armR.rotation.z=.05;}
 else if(mode==='dance'){const s=Math.sin(t*8.6);boss.root.position.y=Math.abs(s)*.35;boss.armL.rotation.z=-2.2+s*.6;boss.armR.rotation.z=2.2+s*.6;boss.hip.rotation.z=s*.2;boss.legL.rotation.x=s*.4;boss.legR.rotation.x=-s*.4;}
 else if(mode==='angry'){const s=Math.sin(t*14);boss.root.position.y=Math.abs(s)*.25;boss.armL.rotation.z=-2.7;boss.armR.rotation.z=2.7;boss.armL.rotation.x=boss.armR.rotation.x=s*.3;}
 else if(mode==='hit'){boss.hip.rotation.x=-.5;boss.neck.rotation.x=-.6;boss.armL.rotation.z=-1.2;boss.armR.rotation.z=1.2;}
}
function bossAct(m,u){u=clamp(u,0,1);
 if(m==='trip'){boss.hip.rotation.x=1.2*u;boss.hip.position.y=1-.6*u;boss.armL.rotation.x=boss.armR.rotation.x=-2*u;}
 else if(m==='head'){boss.neck.rotation.x=-.5*u;boss.root.position.y=.2*Math.sin(Math.PI*u);}
 else if(m==='swing'){boss.armL.rotation.z=boss.armR.rotation.z=lerp(-2,1.6,u);boss.armL.rotation.x=boss.armR.rotation.x=-.4;}
 else if(m==='sneeze'){boss.hip.rotation.x=.7*Math.sin(Math.PI*u);boss.neck.rotation.x=.6*Math.sin(Math.PI*u);}
 else{boss.legR.rotation.x=-1.4*Math.sin(Math.PI*u);}
}

// ===== カメラ =====
const camP=V3(0,6,10),camL=V3(0,0,-5);let camShake=0;
function camGo(pos,look,dt,k){const a=1-Math.exp(-dt*(k||3.5));camP.lerp(pos,a);camL.lerp(look,a);}
function camSnap(pos,look){camP.copy(pos);camL.copy(look);}
function camApply(){cam.position.copy(camP);if(camShake>0){cam.position.x+=(Math.random()-.5)*camShake;cam.position.y+=(Math.random()-.5)*camShake;}cam.lookAt(camL);}
function camForShot(P,t,out,dt,spd){
 const b=out.ball,C=out.cup;const db=Math.hypot(b.x-C.x,b.z-C.z);
 if(t>=P.T-2.2&&db<14||t>=P.T){camGo(V3(C.x+3.2,2.3,C.z+5.6),V3(C.x+.4,.3,C.z-.2),dt*spd,3);return;}
 if(out.phase==='fly'){const D=aimDir();const h=Math.max(0,b.y);camGo(V3(b.x-D[0]*7,b.y+3+h*.15,b.z-D[1]*7),V3(b.x,b.y,b.z),dt*spd,4);return;}
 // 長く何も起きない間は、そわそわする部長を映す
 const sg=t>=P.te&&t<P.T?segOf(P,t):null;
 if(sg&&sg.k==='wait'&&sg.s.d>3&&sg.u>.3&&sg.u<.72){camGo(V3(BOSS.x+1.3,1.75,BOSS.z+3.1),V3(BOSS.x,1.25,BOSS.z),dt*spd,14);return;}
 let fx=b.x-C.x,fz=b.z-C.z,L=Math.hypot(fx,fz);if(L<1){fx=0;fz=1;L=1;}fx/=L;fz/=L;
 const look=db<12?V3(lerp(b.x,C.x,.35),Math.max(0,b.y)*.8,lerp(b.z,C.z,.35)):V3(b.x,Math.max(0,b.y),b.z);
 const k=7+Math.min(10,Math.max(0,b.y)*.35);
 camGo(V3(b.x+fx*k+fz*2.5,Math.max(2.6,b.y*.7+3),b.z+fz*k-fx*2.5),look,dt*spd,3);
}

// ===== 遊び =====
let mode='title';
const G={};
function newRun(){for(const k in G)delete G[k];Object.assign(G,{P:null,P0:null,st:null,seed:null,offline:false,t0:0,b:null,res:null,afterT:0,mvT:0,kubiT:0,introT:0,introLong:false,sent:null,wait:false,ticketAt:null});}
newRun();
// ゲージ
let charge=null;
function powerNow(){if(!charge)return 0;const ph=((performance.now()-charge.t0)/850)%2;return Math.round((ph<1?ph:2-ph)*100);}
// 入力：画面をなぞって向き
const pad=$('pad');let drag=null;
pad.addEventListener('pointerdown',e=>{e.preventDefault();if(!e.isTrusted)return;ac();if(drag)return;drag={id:e.pointerId,x:e.clientX};try{pad.setPointerCapture(e.pointerId)}catch(_){}} ,{passive:false});
pad.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;drag.x=e.clientX;if(mode==='aim'){AIM.f-=dx/14;AIM.d=((Math.round(AIM.f)%72)+72)%72;}});
const padEnd=e=>{if(drag&&e.pointerId===drag.id)drag=null;};pad.addEventListener('pointerup',padEnd);pad.addEventListener('pointercancel',padEnd);
addEventListener('contextmenu',e=>e.preventDefault());
// クラブ
function drawClubs(){$('clubs').innerHTML=t('clubs').map((n,i)=>'<button data-c="'+i+'"'+(i===AIM.c?' class="on"':'')+'>'+esc(n)+'</button>').join('');}
$('clubs').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b||mode!=='aim'||charge)return;e.stopPropagation();ac();AIM.c=+b.dataset.c;ls.set('sg_club',AIM.c);drawClubs();SFX.ding();});
// 打つボタン（横にずらすと下のボタンが見える）
const hb=$('hitBtn');let hdn=null,slid=0;
hb.addEventListener('pointerdown',e=>{e.preventDefault();if(!e.isTrusted||hdn)return;ac();try{hb.setPointerCapture(e.pointerId)}catch(_){}hdn={id:e.pointerId,x:e.clientX,s0:slid,moved:false};hb.classList.add('hold');
 if(mode==='aim'&&slid===0)charge={t0:performance.now()};},{passive:false});
hb.addEventListener('pointermove',e=>{if(!hdn||e.pointerId!==hdn.id)return;const dx=e.clientX-hdn.x;if(Math.abs(dx)>12&&!hdn.moved){hdn.moved=true;charge=null;}
 if(hdn.moved){slid=Math.max(-150,Math.min(0,hdn.s0+dx));hb.style.transform='translateX('+slid+'px)';}});
function hbUp(e){if(!hdn||e.pointerId!==hdn.id)return;const moved=hdn.moved;hdn=null;hb.classList.remove('hold');if(slid>-70){slid=0;hb.style.transform='';}
 if(!moved&&charge&&mode==='aim'){const p=powerNow();charge=null;doShot(p);}else charge=null;}
hb.addEventListener('pointerup',hbUp);hb.addEventListener('pointercancel',hbUp);
$('subBtn').addEventListener('click',e=>{if(!e.isTrusted||slid>-70)return;if(mode==='aim')startKubi();else if(mode==='shot')doBreak();});
function resetHit(){slid=0;hdn=null;hb.style.transform='';hb.classList.remove('hold','done');}
// キーボード
const KD=new Set();
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;
 if(mode==='aim'){if(e.code==='ArrowLeft'||e.code==='KeyA'){AIM.f+=1;AIM.d=((Math.round(AIM.f)%72)+72)%72;e.preventDefault();}
  if(e.code==='ArrowRight'||e.code==='KeyD'){AIM.f-=1;AIM.d=((Math.round(AIM.f)%72)+72)%72;e.preventDefault();}
  if((e.code==='ArrowUp'||e.code==='KeyW')&&!charge){AIM.c=(AIM.c+4)%5;ls.set('sg_club',AIM.c);drawClubs();e.preventDefault();}
  if((e.code==='ArrowDown'||e.code==='KeyS')&&!charge){AIM.c=(AIM.c+1)%5;ls.set('sg_club',AIM.c);drawClubs();e.preventDefault();}
  if(/^Digit[1-5]$/.test(e.code)&&!charge){AIM.c=+e.code.slice(5)-1;ls.set('sg_club',AIM.c);drawClubs();}
  if(e.code==='Space'&&!e.repeat&&e.isTrusted){e.preventDefault();ac();charge={t0:performance.now()};}}
 else if(e.code==='Space')e.preventDefault();});
addEventListener('keyup',e=>{if(e.code==='Space'&&mode==='aim'&&charge){const p=powerNow();charge=null;doShot(p);}});

function bigText(s,sub){const b=$('big');b.innerHTML=s+(sub?'<small>'+sub+'</small>':'');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}
function capText(s){const c=$('cap');if(c.textContent===s)return;c.textContent=s;c.classList.remove('pop');void c.offsetWidth;if(s)c.classList.add('pop');}
const bubs={boss:$('bubBoss'),act:$('bubAct')};
function bub(which,txt,pos,yOff){const el=bubs[which];if(!txt||!pos){el.hidden=true;return;}const p=pos.clone();p.y+=yOff||2.2;p.project(cam);
 if(p.z>1||Math.abs(p.x)>1.15||Math.abs(p.y)>1.15){el.hidden=true;return;}el.hidden=false;if(el.textContent!==txt)el.textContent=txt;
 el.style.left=clamp((p.x*.5+.5)*innerWidth,60,innerWidth-60)+'px';el.style.top=clamp((-p.y*.5+.5)*innerHeight,70,innerHeight-20)+'px';}
function hideBubs(){bubs.boss.hidden=bubs.act.hidden=true;}
function setUI(m){
 const aim=m==='aim',shot=m==='shot';
 $('clubs').hidden=!aim;$('gauge').hidden=$('gaugeTxt').hidden=!aim;$('hint').hidden=!aim;$('dist').hidden=true;
 $('ctrl').hidden=!(aim||shot);$('hud').hidden=!(shot||m==='after'||m==='replay');
 if(aim){hb.innerHTML=t('hit');hb.classList.remove('done');$('subBtn').innerHTML=t('throwBtn');$('subBtn').classList.remove('brk');}
 if(shot){hb.innerHTML=t('hitDone');hb.classList.add('done');$('subBtn').innerHTML=t('breakBtn');$('subBtn').classList.add('brk');}
}

// ---- はじめのムービー（部長のパット） ----
function startIntro(){
 show(null);clearActors();newRun();resetHit();hideBubs();capText('');$('big').innerHTML='';$('freeze').style.opacity=0;
 G.introLong=!ls.get('sg_intro',0);ls.set('sg_intro',1);G.introT=0;mode='intro';setUI('intro');$('skipBtn').hidden=false;$('skipBtn').textContent=t('skip');
 ball.visible=true;ball.position.set(0,BR,0);cupG.position.set(CUP.x,0,CUP.z);flyHead.visible=false;
 if(G.introLong)camSnap(V3(6,3.4,1.2),V3(.8,.4,-4.2));else camSnap(V3(3.2,2.3,.6),V3(CUP.x+.4,.3,CUP.z));
}
const BB={x:CUP.x+.16,z:CUP.z+.04};
function introFrame(dt){
 const T0=G.introLong?6.6:2.4;G.introT+=dt;const k=G.introT;
 placeMe(0,-1,0,false);
 if(G.introLong){
  const bs=V3(1.4,0,-2.4);
  if(k<2.3){const u=1-Math.pow(1-clamp(k/2.2,0,1),2.2);bossBall.position.set(lerp(bs.x,BB.x,u),.055,lerp(bs.z,BB.z,u));boss.man.position.set(bs.x+.5,0,bs.z+.05);placeBoss('putt',k*1.2);boss.man.position.set(bs.x+.5,0,bs.z+.05);boss.man.rotation.y=Math.atan2(BB.x-bs.x,BB.z-bs.z)+Math.PI/2;
   camGo(V3(5.8,3.2,.8),V3(lerp(bs.x,BB.x,u),.2,lerp(bs.z,BB.z,u)),dt,3);if(k>2.2)bub('boss',t('introA'),boss.man.position);}
  else if(k<3.6){bossBall.position.set(BB.x+Math.sin(k*20)*.006,.055,BB.z);placeBoss('shock',k);boss.man.position.set(bs.x+.5,0,bs.z+.05);bub('boss',t('introA'),boss.man.position);camGo(V3(2.4,1.4,CUP.z+2.6),V3(CUP.x+.3,.2,CUP.z),dt,3);}
  else{const u=clamp((k-3.6)/1.4,0,1);bossBall.position.set(BB.x,.055,BB.z);placeBoss(u<1?'walk':'idle',k);boss.man.position.set(lerp(bs.x+.5,BOSS.x,u),0,lerp(bs.z+.05,BOSS.z,u));
   if(u<1)boss.man.rotation.y=Math.atan2(BOSS.x-bs.x,BOSS.z-bs.z);else boss.man.rotation.y=Math.atan2(-BOSS.x,-BOSS.z);
   if(k>4.6){bub('boss',t('introB'),boss.man.position);capText(t('introCap'));camGo(V3(0,2,4.5),V3(0,.4,-5),dt,2.5);}else{bubs.boss.hidden=true;camGo(V3(3,2.4,1),V3(1,.6,-4),dt,2.5);}}
 }else{bossBall.position.set(BB.x,.055,BB.z);placeBoss('idle',k);bub('boss',t('introB'),boss.man.position);capText(t('introCap'));camGo(V3(0,2,4.5),V3(0,.4,-5),dt,2);}
 if(k>=T0)startAim();
}
$('skipBtn').onclick=()=>{if(mode==='intro')startAim();else if(mode==='mv')endMV();};
// ---- ねらう ----
function startAim(){
 ballShrink=1;mode='aim';setUI('aim');$('skipBtn').hidden=true;hideBubs();capText('');bossBall.position.set(BB.x,.055,BB.z);
 AIM.c=ls.get('sg_club',0);if(!(AIM.c>=0&&AIM.c<=4))AIM.c=0;AIM.d=0;AIM.f=0;drawClubs();$('hint').innerHTML=esc(t('ctl'))+(isPC()?'<br>'+esc(t('pcHow')):'');
 ball.position.set(0,BR,0);ball.scale.setScalar(.06);ball.visible=true;resetHit();setUI('aim');
}
let idleI=0;
function aimFrame(dt,now){
 const D=aimDir(),pw=powerNow();
 const back=charge?-.3-(pw/100)*(AIM.c===0?.9:2.1):-.05;placeMe(D[0],D[1],back,false);placeBoss('idle',now);
 aimArrow.visible=true;aimArrow.position.set(0,0,0);aimArrow.rotation.y=Math.atan2(-D[0],-D[1]);
 {const cl=SG.CLUBS[AIM.c];const m=AIM.c===0?cl[3]*cl[3]/(2*SG.DECEL):cl[3]*cl[3]*2*cl[1]*cl[2]/SG.G;$('dist').hidden=false;$('dist').textContent=t('clubs')[AIM.c]+'　'+t('maxd',{m:Math.round(m)});}
 $('gaugeFill').style.height=pw+'%';$('gaugeTxt').textContent=charge?pw:t('power');
 camGo(V3(-D[0]*6.2+D[1]*.6,2.9,-D[1]*6.2-D[0]*.6),V3(D[0]*7,.4,D[1]*7),dt,6);
 ballGlow.visible=false;
}
// ---- 打つ ----
let swingT=-1;
function doShot(p){
 if(mode!=='aim')return;
 AIM.p=p;mode='shot';setUI('shot');aimArrow.visible=false;swingT=0;SFX.swing();
 lastEvT=0;G.t0=performance.now();G.P0=SG.shot(AIM.c,AIM.d,p,0);G.in=AIM.c+'.'+AIM.d+'.'+p;G.P=null;G.wait=true;
 setTimeout(()=>SFX.hit(AIM.c),0);
 takeTicket(G.in).then(st=>{if(mode!=='shot'||G.P)return;const el=(performance.now()-G.t0)/1000;
  if(typeof st==='number'){const P=SG.shot(AIM.c,AIM.d,p,SG.seedOf(st));if(P.te>el+.03){G.st=st;useP(P);return;}}
  fallback(el);});
}
function fallback(el){if(G.P)return;let P=null;for(let i=0;i<60;i++){const q=SG.shot(AIM.c,AIM.d,AIM.p,(Math.random()*4294967296)>>>0);if(q.te>el+.03){P=q;break;}if(!P||q.te>P.te)P=q;}G.offline=true;useP(P);}
function useP(P){G.P=P;G.wait=false;setPlan(P,{b:G.b});lastEvT=Math.min(lastEvT,(performance.now()-G.t0)/1000);}
function doBreak(){
 if(mode!=='shot'||G.b!=null)return;const el=(performance.now()-G.t0)/1000;
 if(G.P&&el>G.P.T-.3)return;
 G.b=el;if(G.P)G.P.o.b=el;SFX.snap();hb.classList.add('done');$('ctrl').hidden=true;
}
let lastEvT=0;
function playEv(P,t0,t1){for(const e of P.ev)if(e.t>t0&&e.t<=t1)(SFX[e.s]||(()=>{}))();
 const b=P.o&&P.o.b;if(b!=null){if(P.T>t0&&P.T<=t1)SFX.clink();if(P.T+1.4>t0&&P.T+1.4<=t1)SFX.splash();}else if(P.T>t0&&P.T<=t1)SFX.cup();}
function shotFrame(dt,now){
 const ts=(now-G.t0)/1000;
 const tt=ts;
 // 部長の打った後の構え
 const D=aimDir();const sw=swingT>=0?Math.min(1,swingT/.25):1;swingT+=dt;
 placeMe(D[0],D[1],G.b!=null?0:lerp(-.3-(AIM.p/100)*(AIM.c===0?.9:2.1),AIM.c===0?.7:1.9,ease(sw)),G.b!=null);
 if(!G.P){
  const b=physPos(G.P0,ts);ball.position.copy(b);ball.scale.setScalar(.06);placeBoss('nervous',now/1000);
  const phEnd=G.P0.tl;if(ts>phEnd-.05||ts>4)fallback(ts);
  camForShot(G.P0,ts,{ball:ball.position,cup:V3(CUP.x,0,CUP.z),phase:'fly'},dt,1);
  $('hudTime').textContent=ts.toFixed(2);ballGlow.visible=true;ballGlow.position.set(b.x,.02,b.z);ballGlow.scale.setScalar(1+Math.max(0,b.y)*.05);
  return;}
 const P=G.P;if(G.b!=null)P.o.b=G.b;
 const out=sceneAt(P,ts);playEv(P,lastEvT,ts);lastEvT=ts;
 placeBoss(ts<P.T?'nervous':'freeze',now/1000,P);
 camForShot(P,ts,out,dt,1);camShake=out.shake||0;
 ballGlow.visible=ts<P.T;ballGlow.position.set(out.ball.x,.02,out.ball.z);ballGlow.scale.setScalar(1+Math.max(0,out.ball.y)*.05);
 $('hudTime').textContent=Math.min(ts,P.T).toFixed(2);
 const [rs,rb]=reasonTxt(P.ri);
 if(ts>=P.capT&&ts<P.T+1.5)capText(rs);else capText('');
 if(out.actVis&&ts>=P.capT&&ts<P.T)bub('act',rb,out.act,ACT&&ACT.kind==='veh'?2.8:ACT&&ACT.air?1.6:1.9);else bubs.act.hidden=true;
 if(ts<P.T){const i=Math.floor(ts/3.4);if(i!==idleI){idleI=i;}const il=t('idle');if(ts%3.4<2.4&&!(out.actVis&&ts>=P.capT))bub('boss',il[(i+P.ri)%il.length],boss.man.position);else bubs.boss.hidden=true;}
 if(ts>=P.T){
  if(G.b!=null){if(ts>=P.T+.05&&!G.clinkShown){G.clinkShown=1;bigText(t('clink'));}if(ts>=P.T+1.4&&!G.pondShown){G.pondShown=1;bigText(t('pond'));sendYuzu();}
   if(ts>=P.T+2.6)startMV();}
  else{G.res={kind:'win',ms:P.ms,ri:P.ri};markSeen(P.ri);submit();mode='after';G.afterT=0;$('ctrl').hidden=true;SFX.cup();bigText(t('cupIn'));}
 }
}
// ---- 入ってしまったあと ----
function afterFrame(dt,now){
 G.afterT+=dt;const k=G.afterT,P=G.P;
 const out=sceneAt(P,P.T+k);placeMe(aimDir()[0],aimDir()[1],1.9,false);placeBoss('freeze',now/1000,P);
 camGo(V3(BOSS.x+1.4,1.9,BOSS.z+3.2),V3(BOSS.x,1.2,BOSS.z),dt,2.2);
 if(k>.9&&!G.fz){G.fz=1;$('freeze').style.opacity=.35;SFX.freeze();bigText(t('silence'));}
 if(k>1.2)bub('boss',t('bossWin'),boss.man.position);
 if(k>2.2&&!G.cw){G.cw=1;SFX.caw();}
 bubs.act.hidden=true;
 if(k>3.6){$('freeze').style.opacity=0;mode='result';showResult();}
}
// ---- 部長のMV ----
let CONF=[];
function startMV(){
 mode='mv';G.mvT=0;setUI('mv');$('hud').hidden=true;capText('');hideBubs();$('big').innerHTML='';
 G.res={kind:'yuzu',ri:G.P.ri};markSeen(G.P.ri);
 const n=ls.get('sg_mvseen',0);$('skipBtn').hidden=!n;$('skipBtn').textContent=t('skip');ls.set('sg_mvseen',n+1);
 mvMusic();SFX.fanfare();
 const cols=[0xe8352a,0xffcc00,0x1aa34a,0x2a7ad8,0xff7ad8,0xffffff];
 for(let i=0;i<90;i++){const m=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:cols[i%6]}));m.scale.set(.08,.02,.12);S3.add(m);CONF.push({m,x:BOSS.x+(Math.random()-.5)*6,z:BOSS.z+(Math.random()-.5)*6,y:4+Math.random()*4,v:.6+Math.random()*.8,r:Math.random()*6});}
}
function endMV(){for(const c of CONF)S3.remove(c.m);CONF=[];mvStop&&mvStop();$('skipBtn').hidden=true;mode='result';showResult();}
function mvFrame(dt,now){
 G.mvT+=dt;const k=G.mvT;placeBoss('dance',k);placeMe(aimDir()[0],aimDir()[1],0,true);me.armL.rotation.z=-2.4+Math.sin(k*8.6)*.3;me.armR.rotation.z=2.4-Math.sin(k*8.6)*.3;
 const a=k*.5;camGo(V3(BOSS.x+Math.sin(a)*4.2,1.6+Math.sin(k*1.7)*.4,BOSS.z+Math.cos(a)*4.2),V3(BOSS.x,1.1,BOSS.z),dt,3);
 for(const c of CONF){c.y-=c.v*dt*1.6;if(c.y<0)c.y=5;c.m.position.set(c.x+Math.sin(k*2+c.r)*.3,c.y,c.z);c.m.rotation.set(k*3+c.r,k*2,c.r);}
 const msg=k<3?t('mvA'):k<6?t('mvB'):t('mvC');if($('big').dataset.m!==msg){$('big').dataset.m=msg;bigText(msg);}
 bub('boss',k%2<1?t('mvLaugh'):'♪',boss.man.position,2.4);
 if(k>9)endMV();
}
// ---- クビ ----
function startKubi(){
 if(mode!=='aim')return;mode='kubi';G.kubiT=0;setUI('kubi');aimArrow.visible=false;charge=null;SFX.whoosh();G.res={kind:'kubi'};sendKubi();
}
function kubiFrame(dt,now){
 G.kubiT+=dt;const k=G.kubiT;const D=aimDir();
 placeMe(D[0],D[1],0,false);const bx=BOSS.x,bz=BOSS.z;
 me.man.rotation.y=Math.atan2(bx-me.man.position.x,bz-me.man.position.z);me.armR.rotation.x=k<.25?-2.6:lerp(-2.6,-.6,clamp((k-.25)/.15,0,1));
 const from=V3(me.man.position.x,1.6,me.man.position.z),hd=V3(bx,2.05,bz);
 if(k<.25){ball.position.copy(from);}
 else if(k<.95){const u=(k-.25)/.7;ball.position.copy(arcP(from,hd,.7,u,1));}
 else{const u=clamp((k-.95)/.8,0,1);ball.position.copy(arcP(hd,V3(bx+1.2,BR,bz+1.4),.8,u,.8));}
 if(k>=.95&&!G.bk){G.bk=1;SFX.bonk();camShake=.15;}
 if(k>1.2&&!G.ag){G.ag=1;SFX.angry();bigText(t('kubiHead'));}
 placeBoss(k<.95?'idle':k<1.3?'hit':'angry',now/1000);
 if(k>1.2)bub('boss',t('kubiBub'),boss.man.position,2.5);
 camGo(V3(BOSS.x+2.2,1.9,BOSS.z+4.8),V3(BOSS.x-.5,1.15,BOSS.z+.9),dt,3);camShake=Math.max(0,camShake-dt);
 if(k>3.4){camShake=0;mode='result';showResult();}
}
// 見た理由
function markSeen(ri){if(ri==null||ri<0||G.offline&&false)return;const s=ls.get('sg_seen',[]);const id=SG.R[ri]&&SG.R[ri][0];if(id&&!s.includes(id)){s.push(id);ls.set('sg_seen',s);}}
function seenCount(){const s=ls.get('sg_seen',[]);const ids=new Set(SG.R.map(r=>r[0]));return s.filter(x=>ids.has(x)).length;}
