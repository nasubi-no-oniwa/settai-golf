
// ===== 打ったあとの流れ（時刻 t を入れると、その瞬間の場面になる） =====
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const lerp=(a,b,u)=>a+(b-a)*u;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=u=>u<.5?2*u*u:1-2*(1-u)*(1-u);
const BR=.06;
let PL=null; // いまの一打
let ballShrink=1;
function segOf(P,t){const S=P.segs;for(let i=0;i<S.length;i++){const s=S[i];if(t<s.t0+s.d||i===S.length-1)return {i,k:s.k,u:clamp((t-s.t0)/Math.max(1e-6,s.d),0,1),s};}return null;}
function segByK(P,k){return P.segs.find(s=>s.k===k);}
// 打ったあとの球（理由が起きる前）
function physPos(P,t){
 if(P.c===0){const r=P.roll,tt=Math.min(t,r.stopT),s=P.v*tt-SG.DECEL*tt*tt/2;let y=BR;
  if(P.water&&t>r.stopT){const k=clamp((t-r.stopT)/.5,0,1);return V3(P.dx*(s+.4*k),BR-.3*k,P.dz*(s+.4*k));}
  return V3(P.dx*s,y,P.dz*s);}
 const f=P.fl;if(t<=f.tl){const h=f.vh*t;return V3(P.dx*h,BR+f.vy*t-SG.G*t*t/2,P.dz*h);}
 const lx=P.dx*f.carry,lz=P.dz*f.carry;
 if(P.water){const k=clamp((t-f.tl)/.5,0,1);return V3(lx,BR-.3*k,lz);}
 const u=clamp((t-f.tl)/.6,0,1);return V3(lerp(lx,P.rest.x,u),BR+Math.sin(Math.PI*u)*.35,lerp(lz,P.rest.z,u));
}
function cupPos(P,t){
 if(P.type!=='cupmove')return V3(CUP.x,0,CUP.z);
 const s=segByK(P,'move');if(!s||t<s.t0)return V3(CUP.x,0,CUP.z);const u=ease(clamp((t-s.t0)/s.d,0,1));return V3(lerp(CUP.x,P.E.x,u),0,lerp(CUP.z,P.E.z,u));
}
function arcP(A,B,d,u,hmin){const H=Math.min(30,Math.max(hmin||.6,SG.G*d*d/8));return V3(lerp(A.x,B.x,u),lerp(A.y,B.y,u)+H*4*u*(1-u),lerp(A.z,B.z,u));}
// 理由に合わせて置く場所
function layout(P){
 const E=V3(P.E.x,P.E.y,P.E.z),C=V3(CUP.x,0,CUP.z);let ux=C.x-E.x,uz=C.z-E.z;const L=Math.hypot(ux,uz)||1;ux/=L;uz/=L;
 const side=P.j>1?1:-1,nx=-uz*side,nz=ux*side;
 const Lo={E,ux,uz,nx,nz};
 const da=P.da||6;
 Lo.A0=V3(E.x+nx*da*.8-ux*da*.6,0,E.z+nz*da*.8-uz*da*.6);
 if(P.q.mv==='fly')Lo.A0.y=9;
 Lo.near=V3(E.x-ux*.7,0,E.z-uz*.7);
 return Lo;
}
let ACT=null,ACT2=null;
function clearActors(){for(const a of [ACT,ACT2])if(a&&a.g.parent)a.g.parent.remove(a.g);ACT=ACT2=null;}
function setPlan(P,o){
 clearActors();PL=P;if(!P)return;P.o=o||{};P.L=layout(P);
 const r=SG.R[P.ri];const spec=r?r[3]:{o:'portal'};P.R0=spec&&spec.o||'';
 if(P.type!=='boss'){ACT=buildActor(spec);if(ACT){S3.add(ACT.g);ACT.g.visible=false;}}
 if(P.type==='warp'){ACT2=makeObj('portal');S3.add(ACT2.g);ACT2.g.visible=false;}
 // 音の出る瞬間
 const ev=[{t:0,s:'hit'}];if(P.c!==0&&!P.water)ev.push({t:P.fl.tl,s:'land'});if(P.water)ev.push({t:P.tl,s:'splash'});
 const SND={kick:'kick',swing:'kick',burst:'pop',emerge:'splash',vanish:'warp',grab:'flap',pick:'pop',act:'ding',move:'rumble',drop:'pop',fall:'whoosh'};
 for(const s of P.segs){if(SND[s.k])ev.push({t:s.t0,s:SND[s.k]});}
 if(P.type==='bounce')ev.push({t:P.te,s:ACT&&ACT.kind==='obj'&&/spring|tramp/.test(ACT.k)?'boing':'clank'});
 if(P.type==='roll')ev.push({t:segByK(P,'roll').t0,s:'whoosh'});
 if(ACT&&ACT.kind==='veh')ev.push({t:Math.max(0,P.te-.6),s:'motor'});
 ev.sort((a,b)=>a.t-b.t);P.ev=ev;
 P.capT=(P.segs.find(s=>s.k!=='wait')||P.segs[0]).t0;
 if(P.type==='bounce'||P.type==='air')P.capT=P.te-.2;
}
// その瞬間の場面をつくる。戻り値：見せる文字など
function sceneAt(P,t){
 const o=P.o||{},L=P.L,T=P.T,E=L.E;ballShrink=1;
 const out={ball:null,act:null,actVis:false,cup:cupPos(P,t),phase:'fly'};
 let b=null;const A=ACT;
 const S=t>=P.te?segOf(P,Math.min(t,T)):null;
 const actorAt=(p,fx,fz)=>{if(!A)return;A.g.visible=true;A.g.position.copy(p);if(fx!=null)A.g.rotation.y=Math.atan2(fx,fz)+(A.kind==='person'?0:Math.PI);out.actVis=true;out.act=p;};
 const holdPos=()=>{const h=A.hold.clone();A.g.updateMatrixWorld();return A.g.localToWorld(h);};
 if(A)A.g.visible=false;if(ACT2)ACT2.g.visible=false;
 if(t<P.te){b=physPos(P,t);out.phase='fly';
  if(A&&(P.type==='bounce')&&t>P.te-.35){const k=clamp((P.te-t)/.35,0,1);placeBounce(P,1-k*.9);out.actVis=true;out.act=A.g.position;}
  if(A&&P.type==='air'&&t>P.te-1.2){const k=clamp((P.te-t)/1.2,0,1),bp=physPos(P,P.te);actorAt(V3(bp.x+L.nx*9*k,bp.y+.4+6*k,bp.z+L.nz*9*k),-L.nx,-L.nz);animActor(A,t,'fly');}
 }else{
  const k=S.k,u=S.u,s=S.s,C=out.cup;out.phase='rsn';
  const restBall=()=>{const y=P.water?BR-.3:BR;if(P.lip&&k==='wait'){const w=Math.sin(t*9)*.012*(1+u);return V3(E.x+w,y,E.z);}return V3(E.x,P.water?-.5:y,E.z);};
  const ty=P.type;
  if(ty==='kick'){
   if(k==='wait'){b=restBall();}
   else if(k==='come'){b=restBall();const p=V3(lerp(L.A0.x,L.near.x,u),0,lerp(L.A0.z,L.near.z,u));actorAt(p,L.near.x-L.A0.x,L.near.z-L.A0.z);animActor(A,t,'walk');}
   else if(k==='kick'){b=restBall();actorAt(L.near,L.ux,L.uz);animActor(A,t,'kick',u);}
   else{actorAt(L.near,L.ux,L.uz);animActor(A,t,'stand');const e=1-(1-u)*(1-u);b=V3(lerp(E.x,C.x,e),BR,lerp(E.z,C.z,e));}
  }else if(ty==='carry'){
   const mv=P.q.mv||'walk',fly=mv==='fly'||(A&&A.air);const hy=fly?6:0;
   if(k==='wait'){b=restBall();}
   else if(k==='come'){b=restBall();const p=V3(lerp(L.A0.x,E.x-L.ux*.3,u),fly?lerp(9,.6,u):0,lerp(L.A0.z,E.z-L.uz*.3,u));actorAt(p,E.x-L.A0.x,E.z-L.A0.z);animActor(A,t,fly?'fly':mv);}
   else if(k==='pick'){const p=V3(E.x-L.ux*.3,fly?.6:0,E.z-L.uz*.3);actorAt(p,L.ux,L.uz);animActor(A,t,fly?'fly':'bend',u);b=u<.5?restBall():holdPos();}
   else if(k==='go'){const e=ease(u);const p=V3(lerp(E.x,C.x,e),fly?.6+hy*Math.sin(Math.PI*u):0,lerp(E.z,C.z,e));actorAt(p,L.ux,L.uz);animActor(A,t,fly?'fly':mv);b=holdPos();}
   else{const p=V3(C.x-L.ux*.25,fly?.6:0,C.z-L.uz*.25);actorAt(p,L.ux,L.uz);animActor(A,t,fly?'fly':'bend',1);const h=holdPos();b=V3(lerp(h.x,C.x,u),lerp(h.y,BR,u*u),lerp(h.z,C.z,u));}
  }else if(ty==='hit'){
   const pop=k==='appear'?clamp(u*1.6,0,1):1;
   if(k==='wait'){b=restBall();}
   else{if(A){actorAt(L.near,L.ux,L.uz);A.g.scale.setScalar(Math.max(.01,pop*(A.base||1)));animActor(A,t,k==='swing'?'swing':'stand',u);}
    b=k==='arc'?arcP(V3(E.x,BR,E.z),V3(C.x,BR,C.z),s.d,u,2):restBall();}
  }else if(ty==='bounce'){
   if(A){placeBounce(P,1);}
   b=arcP(V3(E.x,Math.max(BR,E.y),E.z),V3(C.x,BR,C.z),s.d,u,1.2);
  }else if(ty==='air'){
   const ap=physPos(P,P.te);
   if(k==='grab'){actorAt(V3(ap.x,ap.y+.4,ap.z),L.ux,L.uz);animActor(A,t,'fly');b=holdPos();}
   else if(k==='fly'){const nat=P.ec/Math.max(2,(P.q.spd||14)*P.j)+.3,loops=Math.max(0,(s.d-nat)/5);const e=ease(u);
    let x=lerp(ap.x,C.x,e),y=lerp(ap.y+.4,7,e),z=lerp(ap.z,C.z,e);if(loops>0){const a=Math.PI*2*loops*u,R=5*Math.sin(Math.PI*u);x+=Math.cos(a)*R-R;z+=Math.sin(a)*R;y+=Math.sin(a*2)*1.5*Math.sin(Math.PI*u);}
    const p=V3(x,y,z);const p2=sceneAir(P,Math.min(T,t+.05));actorAt(p,p2.x-x,p2.z-z);animActor(A,t,'fly');b=holdPos();}
   else{const p=V3(C.x,7,C.z);actorAt(p,L.ux,L.uz);animActor(A,t,'fly');const h=holdPos();b=V3(C.x,lerp(h.y,BR,u*u),C.z);}
  }else if(ty==='erupt'){
   if(A){A.g.visible=true;out.actVis=true;out.act=V3(E.x,0,E.z);}
   const up=k==='wait'?0:k==='burst'?u:1;
   if(A){placeErupt(A,E,up,t);}
   if(k==='arc')b=arcP(V3(E.x,BR+(A&&A.kind==='obj'?1:.4),E.z),V3(C.x,BR,C.z),s.d,u,1.5);else{b=restBall();if(k==='burst')b.y+=u*.5;}
   if(k==='wait'&&u>.7)out.shake=.3;
  }else if(ty==='roll'){
   if(A){const fp=P.R0==='magnet'?V3(C.x+L.ux*1.3,0,C.z+L.uz*1.3):V3(E.x-L.ux*1.6,0,E.z-L.uz*1.6);actorAt(fp,L.ux,L.uz);animActor(A,t,'spin');}
   if(k==='wait')b=restBall();else{const cv=clamp(P.q.curve||0,-1,1),e=ease(u),off=cv*Math.sin(Math.PI*u)*P.ec*.35;b=V3(lerp(E.x,C.x,e)+L.nx*off,BR,lerp(E.z,C.z,e)+L.nz*off);}
   if(!A&&k==='wait'&&u>.6)out.wind=1;
  }else if(ty==='cupmove'){
   b=restBall();
   if(A){const p=V3(C.x+L.nx*.7,0,C.z+L.nz*.7);actorAt(p,-L.ux,-L.uz);animActor(A,t,k==='move'?'walk':'stand');}
   if(k==='drop'){b=V3(E.x,lerp(BR,-.05,u),E.z);}
  }else if(ty==='boss'){
   b=restBall();if(k!=='wait'){out.actVis=true;out.act=boss.man.position;}
   if(k==='push'){const e=1-(1-u)*(1-u);b=V3(lerp(E.x,C.x,e),BR+Math.sin(Math.PI*u)*.4,lerp(E.z,C.z,e));}
  }else if(ty==='water'){
   if(k==='wait'){b=V3(E.x,-.5,E.z);}
   else if(k==='emerge'){const p=V3(E.x,lerp(-1.2,-.1,u),E.z);actorAt(p,L.ux,L.uz);animActor(A,t,'stand');b=V3(E.x,lerp(-.5,.4,u),E.z);}
   else{actorAt(V3(E.x,-.1,E.z),L.ux,L.uz);animActor(A,t,'swing',Math.min(1,u*3));b=arcP(V3(E.x,.4,E.z),V3(C.x,BR,C.z),s.d,u,2);}
  }else{ // warp
   const pg=A||ACT2;
   if(k==='wait'||k==='vanish'){b=restBall();if(pg){pg.g.visible=true;pg.g.position.set(E.x,P.water?-.6:-.6+Math.min(1,(k==='wait'?u:1)*1.2),E.z);pg.g.scale.setScalar(k==='vanish'?1:Math.min(1,u*3+.2));spinObj(pg,t);out.actVis=true;out.act=pg.g.position;}
    if(k==='vanish'){b.y+=u*1.2;ballShrink=Math.max(.001,1-u);}}
   else{const h=lerp(30,BR,u*u);b=V3(C.x,h,C.z);if(pg){pg.g.visible=true;pg.g.position.set(C.x,30.5-u*2,C.z);pg.g.scale.setScalar(Math.max(.01,1-u));spinObj(pg,t);}}
  }
 }
 // 折ったクラブの先
 out.headIn=false;
 if(o.b!=null&&t>=o.b){const hd=Math.min(.9,Math.max(.15,T-o.b-.15)),u=clamp((t-o.b)/hd,0,1);const cp=cupPos(P,Math.min(t,o.b+hd));
  const from=me.man.position.clone().add(V3(0,.9,0));const p=arcP(from,V3(cp.x,.06,cp.z),hd,u,2);if(u>=1){p.copy(cupPos(P,t));p.y=.06;out.headIn=true;}
  flyHead.visible=true;flyHead.position.copy(p);flyHead.rotation.set(u<1?t*14:-.4,u<1?t*9:.3,0);}
 else flyHead.visible=false;
 // カップに入る／はじかれて池へ
 if(t>=T){const C=out.cup;
  if(o.b!=null){const u=clamp((t-T)/1.4,0,1);const pc=V3(POND.x+.6,BR-.05,POND.z+.4);b=u<1?arcP(V3(C.x,BR,C.z),pc,1.4,u,3.5):V3(pc.x,-.4,pc.z);out.phase=u<1?'clink':'pond';}
  else{b=V3(C.x,-.05,C.z);out.phase='in';}}
 if(b){ball.position.copy(b);}
 out.ball=ball.position;
 cupG.position.set(out.cup.x,0,out.cup.z);
 return out;
}
function sceneAir(P,t){const S=segOf(P,t);if(!S||S.k!=='fly')return V3(CUP.x,7,CUP.z);const ap=physPos(P,P.te),C=cupPos(P,t),e=ease(S.u);return V3(lerp(ap.x,C.x,e),0,lerp(ap.z,C.z,e));}
function placeBounce(P,sc){
 const A=ACT,E=P.L.E;A.g.visible=true;
 if(A.kind==='obj'){A.g.position.set(E.x+P.L.ux*.3,Math.max(0,E.y-A.hit),E.z+P.L.uz*.3);A.g.rotation.y=Math.atan2(P.L.ux,P.L.uz);}
 else if(A.kind==='veh'){A.g.position.set(E.x+P.L.ux*.8,Math.max(0,E.y-1),E.z+P.L.uz*.8);A.g.rotation.y=Math.atan2(P.L.nx,P.L.nz);}
 else{A.g.position.set(E.x+P.L.ux*.4,Math.max(0,E.y-1.2),E.z+P.L.uz*.4);A.g.rotation.y=Math.atan2(-P.L.ux,-P.L.uz)+(A.kind==='person'?0:Math.PI);}
 A.g.scale.setScalar(Math.max(.01,sc*(A.base||1)));spinObj(A,performance.now()/1000);
}
function placeErupt(A,E,up,t){
 A.g.position.set(E.x,0,E.z);
 if(A.kind==='obj'){if(A.g.userData.col){A.g.userData.col.scale.y=Math.max(.01,up*3);A.g.userData.col.position.y=up*1.5;}A.g.scale.setScalar(Math.max(.01,Math.min(1,up*1.5)));A.g.position.y=A.k==='spring'||A.k==='pipe'?(up-1)*1.2:0;}
 else{A.g.position.y=lerp(-1,0,up);}
}
function spinObj(A,t){if(!A)return;const u=A.g.userData;if(u.spin)u.spin.rotation.z=t*6;if(u.rot)u.rot.rotation.z=t*20;if(u.whirl)A.g.rotation.y=t*6;if(u.ro)for(const r of u.ro)r.rotation.y=t*40;}
function animActor(A,t,mode,u){
 if(!A)return;spinObj(A,t);const ud=A.g.userData;if(ud.rot)ud.rot.rotation.y=t*30;
 if(A.kind==='person'){const m=A.stick;poseReset(m);
  if(mode==='walk'||mode==='run'||mode==='hop'){walkPose(m,t*(mode==='run'?16:11),mode==='run'?1:.7);if(mode==='hop')m.root.position.y=Math.abs(Math.sin(t*8))*.4;}
  else if(mode==='kick'){m.legR.rotation.x=-1.3*Math.sin(Math.PI*clamp(u||0,0,1));}
  else if(mode==='swing'){const a=clamp(u||0,0,1);m.armR.rotation.z=m.armL.rotation.z=lerp(-2.2,1.8,a);m.armR.rotation.x=m.armL.rotation.x=-.4;}
  else if(mode==='bend'){m.hip.rotation.x=.9*Math.sin(Math.PI*clamp(u||0,0,1));m.armR.rotation.x=-1;}
  else if(mode==='fly'){m.armL.rotation.z=-2.6;m.armR.rotation.z=2.6;m.legL.rotation.x=.3;}
  else if(mode==='crawl'){m.hip.rotation.x=1.3;m.hip.position.y=.45;walkPose(m,t*6,.5);m.hip.position.y=.45;}
  else if(mode==='drive'){m.hip.position.y=.9;m.legL.rotation.x=m.legR.rotation.x=-1.3;m.armL.rotation.x=m.armR.rotation.x=-1.2;}
  else{m.armL.rotation.z=-.2;m.armR.rotation.z=.2;}
 }else if(A.kind==='quad'){const run=mode==='walk'||mode==='run'||mode==='hop'||mode==='crawl'||mode==='drive';
  if(A.hop&&run){A.g.position.y+=Math.abs(Math.sin(t*9))*.5;}
  A.legs.forEach((l,i)=>{l.rotation.x=run?Math.sin(t*14+(i%2?Math.PI:0)+(i>1?1.5:0))*.6:0;});
  A.head.rotation.x=mode==='bend'?.6*Math.sin(Math.PI*clamp(u||0,0,1)):mode==='kick'?.5:0;
 }else if(A.kind==='bird'){const f=mode==='fly'||(A.fly&&mode!=='stand');for(const w of A.wings)w.w.rotation.z=f?w.sx*Math.sin(t*18)*.8:w.sx*-.1;}
 else if(A.kind==='small'){A.g.rotation.z=Math.sin(t*10)*.1;}
 else if(A.kind==='veh'){if(ud.beam)ud.beam.material.opacity=.15+.15*Math.sin(t*8);}
}
