
// ===== 動画（自分の回を作り直す。途中は早送り） =====
let vidBlob=null,vidExt='mp4';
$('vidBtn').onclick=()=>makeVideo();
$('vBack').onclick=()=>show('result');
function drawBub(g,txt,pos,yOff,W,H,boss){if(!txt||!pos)return;const p=pos.clone();p.y+=yOff||2.2;p.project(cam);if(p.z>1||Math.abs(p.x)>1.1||Math.abs(p.y)>1.1)return;
 const x=clamp((p.x*.5+.5)*W,70,W-70),y=clamp((-p.y*.5+.5)*H,80,H-30);g.font='900 22px "Hiragino Maru Gothic ProN",system-ui,sans-serif';const w=g.measureText(txt).width+22;
 g.fillStyle=boss?'#fff4cc':'#fff';g.strokeStyle='#1d1d1d';g.lineWidth=3;g.beginPath();g.roundRect(x-w/2,y-40,w,34,12);g.fill();g.stroke();g.beginPath();g.moveTo(x-7,y-6);g.lineTo(x,y+4);g.lineTo(x+7,y-6);g.fill();g.stroke();
 g.fillStyle='#1d1d1d';g.textAlign='center';g.fillText(txt,x,y-16);}
async function makeVideo(){
 const r=G.res;if(!r)return;
 const can=document.createElement('canvas');const VW=540,VH=960;can.width=VW;can.height=VH;
 if(!can.captureStream||!window.MediaRecorder){show('vidPanel');$('vMsg').textContent=t('vfail');return;}
 show(null);const keepMode=mode;mode='video';$('recBadge').hidden=false;$('recBadge').textContent='● '+t('making');
 const g=can.getContext('2d');
 const VR=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});VR.setSize(VW,VH,false);VR.setPixelRatio(1);
 const oldA=cam.aspect;cam.aspect=VW/VH;cam.updateProjectionMatrix();
 ac();const dest=AC.createMediaStreamDestination();bus.connect(dest);
 const stream=can.captureStream(30);dest.stream.getAudioTracks().forEach(tr=>stream.addTrack(tr));
 const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc3,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
 const mime=types.find(x=>{try{return MediaRecorder.isTypeSupported(x)}catch(e){return false}})||'';
 vidExt=mime.includes('mp4')?'mp4':'webm';
 let rec;try{rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:4e6}:{});}catch(e){finish(null);return;}
 const chunks=[];rec.ondataavailable=ev=>{if(ev.data&&ev.data.size)chunks.push(ev.data);};
 const kind=r.kind,P=G.P,b=G.b;
 if(kind!=='kubi')setPlan(P,{b:kind==='yuzu'?b:null});
 const CK=kind==='kubi'?null:makeClock(P.T,kind==='yuzu'?b:null);
 const L1=kind==='kubi'?0:CK.len+(kind==='yuzu'?2.6:0),L2=kind==='win'?3:kind==='yuzu'?3.5:3.6;let pipFirst=true;
 const done=new Promise(res=>{rec.onstop=res;});rec.start(200);
 let real=0,last=-1,lastF=performance.now(),fired={},vPip=false,snapT=false;const D=SG.DIR[AIM.d];
 if(kind!=='kubi'){camSnap(V3(-D[0]*6.2,2.9,-D[1]*6.2),V3(D[0]*7,.4,D[1]*7));}else camSnap(V3(BOSS.x+2.2,1.9,BOSS.z+4.8),V3(BOSS.x-.5,1.15,BOSS.z+.9));
 const conf=[];
 await new Promise(resolve=>{
  function step(now){
   const dt=Math.min(.05,(now-lastF)/1000);lastF=now;real+=dt;
   g.clearRect(0,0,VW,VH);let cap='',ff=false,timer=null,endTxt=null,sub=null,bubB=null,bubA=null;
   if(kind==='kubi'){G.kubiT=real-dt;kubiFrame(dt,now);if(real>1.2){bubB=t('kubiBub');endTxt=t('kubiHead');sub=t('kubiBig');}}
   else if(real<L1){const c=CK.at(Math.min(real,CK.len));let tt=real<=CK.len?c.t:P.T+(real-CK.len);ff=c.ff;
    const out=sceneAt(P,tt);if(last>=0&&tt>last)playEv(P,last,tt);const spd=ff?(tt-Math.max(0,last))/Math.max(1e-4,dt):1;last=tt;
    placeMe(D[0],D[1],kind==='yuzu'&&tt>=b?0:(tt<.25?lerp(-.3-(P.p/100)*2,1.9,tt/.25):1.9),kind==='yuzu'&&tt>=b);placeBoss(tt<P.T?'nervous':'freeze',now/1000,P);
    const bv=kind==='yuzu'?breakView(P,tt,b):null;
    if(bv)camGo(bv.pos,bv.look,dt*Math.max(1,spd),5);else camForShot(P,tt,out,dt,Math.max(1,spd));timer=Math.min(tt,P.T);
    if(bv&&bv.pip){pipFollow(P,tt,dt*Math.max(1,spd),pipFirst);pipFirst=false;vPip=true;}else vPip=false;
    if(kind==='yuzu'&&tt>=b&&tt<b+1)snapT=true;else snapT=false;
    const [rs,rb]=reasonTxt(P.ri);if(tt>=P.capT)cap=rs;if(out.actVis&&tt>=P.capT&&tt<Math.min(P.T,P.capT+2.5)&&!bv)bubA=[rb,out.act];
    if(kind==='yuzu'&&tt>=P.T+.05)endTxt=tt>=P.T+1.4?t('pond'):t('clink');}
   else{const k=real-L1;
    if(kind==='win'){sceneAt(P,P.T+k);placeBoss('freeze',now/1000,P);camGo(V3(BOSS.x+1.4,1.9,BOSS.z+3.2),V3(BOSS.x,1.2,BOSS.z),dt,2.2);timer=P.T;if(k>.6){endTxt=fmt(P.ms)+t('sec');sub=t('ttl')+'「'+grade(P.ms)+'」';bubB=t('bossWin');}if(k>.6&&!fired.fz){fired.fz=1;SFX.freeze();}if(k>1.6&&!fired.cw){fired.cw=1;SFX.caw();}}
    else{if(!fired.mv){fired.mv=1;mvMusic();SFX.fanfare();for(let i=0;i<70;i++){const m=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:[0xe8352a,0xffcc00,0x1aa34a,0x2a7ad8,0xff7ad8][i%5]}));m.scale.set(.08,.02,.12);S3.add(m);conf.push({m,x:BOSS.x+(Math.random()-.5)*6,z:BOSS.z+(Math.random()-.5)*6,y:2+Math.random()*4,v:.6+Math.random()*.8,r:Math.random()*6});}}
     placeBoss('dance',k);placeMe(D[0],D[1],0,true);const a=k*.5;camGo(V3(BOSS.x+Math.sin(a)*4.2,1.6,BOSS.z+Math.cos(a)*4.2),V3(BOSS.x,1.1,BOSS.z),dt,3);
     for(const c of conf){c.y-=c.v*dt*1.6;if(c.y<0)c.y=5;c.m.position.set(c.x,c.y,c.z);c.m.rotation.set(k*3+c.r,k*2,c.r);}
     endTxt=t('mvA');sub=t('yuzuHead');if(k>.6&&k<2.6)bubB=t('mvLaugh');}}
   camApply();ballSize();treeCull(cam.position,ball.position);VR.render(S3,cam);g.drawImage(VR.domElement,0,0,VW,VH);
   if(vPip){pipDraw();const R=88,cx=22+R,cy=236+R;g.save();g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.clip();g.drawImage(pipR.domElement,cx-R,cy-R,R*2,R*2);g.restore();g.lineWidth=6;g.strokeStyle='#fff';g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.stroke();
    g.fillStyle='#fff';g.font='900 18px "Hiragino Maru Gothic ProN",system-ui,sans-serif';g.textAlign='center';g.lineWidth=5;g.strokeStyle='#000a';g.strokeText(t('pipLbl'),cx,cy+R+24);g.fillText(t('pipLbl'),cx,cy+R+24);}
   if(kind==='yuzu'&&$('freeze'))0;
   if(kind==='win'&&real>=L1+.6){g.fillStyle='rgba(42,90,154,.3)';g.fillRect(0,0,VW,VH);}
   if(bubB)drawBub(g,bubB,boss.man.position,2.2,VW,VH,true);if(bubA)drawBub(g,bubA[0],bubA[1],1.9,VW,VH);
   g.textAlign='center';g.lineJoin='round';g.lineWidth=8;g.strokeStyle='#000a';const txt=(s,x,y)=>{g.strokeText(s,x,y);g.fillText(s,x,y);};
   g.fillStyle='#fff';g.font='900 30px "Hiragino Maru Gothic ProN",system-ui,sans-serif';txt(t('hud'),VW/2,52);
   if(timer!=null){g.font='900 54px system-ui,sans-serif';txt(timer.toFixed(2),VW/2,112);}
   if(snapT){g.fillStyle='#fff';g.font='900 80px "Hiragino Maru Gothic ProN",system-ui,sans-serif';txt(t('snapTxt'),VW/2,VH*.42);}
   if(ff){g.fillStyle='#ffdd55';g.font='900 26px "Hiragino Maru Gothic ProN",system-ui,sans-serif';txt(t('ff'),VW/2,152);}
   if(cap){g.fillStyle='#fff';g.font='900 24px "Hiragino Maru Gothic ProN",system-ui,sans-serif';wrapTxt(g,cap,VW/2,198,VW-40,30,txt);}
   if(endTxt){g.fillStyle=kind==='yuzu'?'#7dff8a':kind==='kubi'?'#ff6a5a':'#ffcc00';g.font='900 62px "Hiragino Maru Gothic ProN",system-ui,sans-serif';txt(endTxt,VW/2,VH-230);}
   if(sub){g.fillStyle='#fff';g.font='900 30px "Hiragino Maru Gothic ProN",system-ui,sans-serif';txt(sub,VW/2,VH-176);}
   g.fillStyle='#fffc';g.font='700 22px system-ui,sans-serif';txt(GAME_URL.replace('https://',''),VW/2,VH-40);
   if(real>=L1+L2)resolve();else requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
 });
 rec.stop();await done;
 try{bus.disconnect(dest);}catch(_){}
 for(const c of conf)S3.remove(c.m);mvStop&&mvStop();
 VR.dispose();cam.aspect=oldA;cam.updateProjectionMatrix();mode=keepMode;
 finish(new Blob(chunks,{type:(mime||'video/webm').split(';')[0]}));
 function finish(blob){
  $('recBadge').hidden=true;mode='result';show('vidPanel');vidBlob=blob;
  if(!blob||!blob.size){$('vMsg').textContent=t('vfail');$('vShare').hidden=true;$('vSave').hidden=true;return;}
  const url=URL.createObjectURL(blob);$('vidPrev').src=url;$('vidPrev').play().catch(()=>{});
  const file=new File([blob],'settai-golf.'+vidExt,{type:blob.type});
  const canShare=navigator.canShare&&navigator.canShare({files:[file]});
  $('vShare').hidden=!canShare;$('vSave').hidden=false;
  $('vMsg').textContent=canShare?t('vmade'):t('shareHint');
  $('vShare').onclick=async()=>{try{await navigator.share({files:[file],text:postText()+'\n'+GAME_URL});}catch(e){}};
  $('vSave').onclick=()=>{const a=document.createElement('a');a.href=url;a.download='settai-golf_'+(r.kind==='win'?fmt(r.ms):r.kind)+'.'+vidExt;document.body.appendChild(a);a.click();a.remove();};
 }
}
function wrapTxt(g,s,x,y,maxW,lh,txt){let line='',yy=y;for(const ch of s){if(g.measureText(line+ch).width>maxW&&line){txt(line,x,yy);line='';yy+=lh;}line+=ch;}if(line)txt(line,x,yy);}

// 遠くの球も見えるように、画面の上で小さくなりすぎないようにする
function ballSize(){const d=cam.position.distanceTo(ball.position);ball.scale.setScalar(Math.max(.06,d*.0065)*ballShrink);}
// ===== 毎フレーム =====
function fit(){const w=innerWidth,h=innerHeight;R3.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
addEventListener('resize',fit);
let lastNow=performance.now();
function frame(now){
 const dt=Math.min(.1,(now-lastNow)/1000);lastNow=now;
 if(mode==='video'){requestAnimationFrame(frame);return;}
 const fl=cupG.userData.flag;fl.rotation.y=Math.sin(now/600)*.25;
 if(mode==='title'||mode==='result'){titleT+=dt;const a=titleT*.12;placeMe(0,-1,0,G.b!=null&&mode==='result');if(mode==='title'){placeBoss('idle',now/1000);hideBubs();}
  if(mode==='title'){bossBall.position.set(BB.x,.055,BB.z);}
  camGo(V3(CUP.x+Math.sin(a)*15,7,CUP.z+Math.cos(a)*15+4),V3(CUP.x,.5,CUP.z+2),dt,1.5);}
 else if(mode==='intro')introFrame(dt);
 else if(mode==='aim')aimFrame(dt,now/1000);
 else if(mode==='shot')shotFrame(dt,now);
 else if(mode==='after')afterFrame(dt,now);
 else if(mode==='mv')mvFrame(dt,now);
 else if(mode==='kubi')kubiFrame(dt,now);
 else if(mode==='replay')replayFrame(dt,now);
 if(mode!=='aim')aimArrow.visible=false;
 if(window.__norender){camApply();requestAnimationFrame(frame);return;}
 camApply();ballSize();treeCull(cam.position,ball.position);R3.render(S3,cam);if(G.pipOn&&mode==='shot')pipDraw();
 requestAnimationFrame(frame);
}
// ===== はじめ =====
fit();applyLang();showTitle();camSnap(V3(CUP.x,7,CUP.z+19),V3(CUP.x,.5,CUP.z+2));try{R3.compile(S3,cam);}catch(e){}requestAnimationFrame(frame);
window.__sg={G,get mode(){return mode},SG,AIM,setPlanT:(P,o)=>setPlan(P,o||{}),chargeStart:()=>{charge={t0:performance.now()};},chargeEnd:p=>{charge=null;doShot(p);},drawClubs:()=>drawClubs(),showTitle:()=>showTitle(),doShot,doBreak,startKubi,startIntro,startAim,show,get PL(){return PL},sceneAt,set slid(v){slid=v},get slid(){return slid},openRank,makeVideo};
</script>
</body>
</html>
