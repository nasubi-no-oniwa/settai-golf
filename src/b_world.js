
// ===== 3D =====
const cv=$('c');
const R3=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:!!window.__SGPV});
R3.setPixelRatio(Math.min(devicePixelRatio,2));
const S3=new THREE.Scene();
const SKY=0x9fd3f5;S3.background=new THREE.Color(SKY);S3.fog=new THREE.Fog(SKY,120,700);
const cam=new THREE.PerspectiveCamera(50,1,.05,1500);
S3.add(new THREE.HemisphereLight(0xffffff,0x5a7a3a,1.15));
const sun=new THREE.DirectionalLight(0xffffff,1.25);sun.position.set(-30,60,20);S3.add(sun);
const LAM=c=>new THREE.MeshLambertMaterial({color:c});
const STD=c=>new THREE.MeshStandardMaterial({color:c,roughness:.4,metalness:.05});
const MB=c=>new THREE.MeshBasicMaterial({color:c});
const GEO={sph:new THREE.SphereGeometry(1,20,14),box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,16),cone:new THREE.ConeGeometry(1,1,16),disc:new THREE.CircleGeometry(1,40),tor:new THREE.TorusGeometry(1,.12,8,28)};
function mesh(g,m,sx,sy,sz,x,y,z){const o=new THREE.Mesh(g,m);o.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);o.position.set(x||0,y||0,z||0);return o;}
function flat(r,c,x,y,z,sx,sz){const o=new THREE.Mesh(GEO.disc,LAM(c));o.rotation.x=-Math.PI/2;o.scale.set(r*(sx||1),r*(sz||1),1);o.position.set(x,y,z);return o;}
// 地面・フェアウェイ・グリーン
S3.add(flat(1400,0x5d8c3a,0,0,0));
{const fw=new THREE.Mesh(new THREE.PlaneGeometry(46,520),LAM(0x78aa48));fw.rotation.x=-Math.PI/2;fw.position.set(0,.004,250);S3.add(fw);
 for(let i=0;i<26;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(46,10),LAM(i%2?0x80b24f:0x74a344));s.rotation.x=-Math.PI/2;s.position.set(0,.005,20+i*20);S3.add(s);}}
S3.add(flat(15,0x7fbb4c,CUP.x,.007,CUP.z,1,.85));
S3.add(flat(13.2,0x93d05e,CUP.x,.009,CUP.z,1,.85));
for(let i=0;i<6;i++)S3.add(flat(13.2-i*.02,i%2?0x98d562:0x8ecb59,CUP.x,.0095+i*.0001,CUP.z+(i-2.5)*1.9,.98,.12));
// 池
S3.add(flat(POND.r+.35,0x6f8c4a,POND.x,.011,POND.z));
const pondM=new THREE.MeshLambertMaterial({color:0x3a86c8});const pondMesh=flat(POND.r,0x3a86c8,POND.x,.013,POND.z);pondMesh.material=pondM;S3.add(pondMesh);
S3.add(flat(POND.r*.55,0x5aa2dc,POND.x+.6,.014,POND.z-.5));
// バンカー
S3.add(flat(3.2,0xe8d7a0,6.5,.012,-9.5,1.4,.8));S3.add(flat(2.4,0xe8d7a0,-3.5,.012,-13,1.2,.7));
// カップと旗
const cupG=new THREE.Group();S3.add(cupG);
{const h=flat(.11,0x111111,0,.016,0);cupG.add(h);const rim=new THREE.Mesh(new THREE.RingGeometry(.11,.135,24),MB(0xffffff));rim.rotation.x=-Math.PI/2;rim.position.y=.017;cupG.add(rim);
 const pole=mesh(GEO.cyl,STD(0xf4f4f4),.018,2.3,.018,0,1.15,0);cupG.add(pole);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(.7,.45),new THREE.MeshLambertMaterial({color:0xe8352a,side:THREE.DoubleSide}));fl.position.set(.35,2.05,0);cupG.add(fl);cupG.userData.flag=fl;
 cupG.position.set(CUP.x,0,CUP.z);}
// 木（たくさん）。カメラの近くと、カメラと球のあいだの木は消して見やすくする
const TREES=[];let treeT=null,treeC=null;
{const N=420,trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.26,2.2,7),LAM(0x6b4a2a),N),crown=new THREE.InstancedMesh(new THREE.ConeGeometry(1.5,4,8),LAM(0x3f7a34),N);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3();let k=0;const rr=SG.rng(77);
 const put=(x,z,s)=>{if(k>=N)return;const hy=.9+rr()*.4;m.compose(new THREE.Vector3(x,1.1*s,z),q,sc.set(s,s,s));trunk.setMatrixAt(k,m);const m1=m.clone();m.compose(new THREE.Vector3(x,(2.2+2)*s,z),q,sc.set(s,s*hy,s));crown.setMatrixAt(k,m);TREES.push({x,z,m1,m2:m.clone(),hid:false});k++;};
 treeT=trunk;treeC=crown;
 for(let i=0;i<120;i++){const z=-60+i*4.6,s=1+rr()*.6;put(-27-rr()*10,z,s);put(27+rr()*10,z+2,s);}
 for(let i=0;i<180;i++){const a=rr()*Math.PI*2,d=40+rr()*330;const x=Math.cos(a)*d,z=-5+Math.sin(a)*d;if(Math.abs(x)<30&&z>-40)continue;put(x,z,1+rr()*.8);}
 trunk.count=crown.count=k;S3.add(trunk,crown);}
const M0=new THREE.Matrix4().makeScale(0,0,0);
function treeCull(cp,bp){let ch=false;const sx=bp.x-cp.x,sz=bp.z-cp.z,L2=sx*sx+sz*sz||1;
 for(let i=0;i<TREES.length;i++){const T=TREES[i];const dx=T.x-cp.x,dz=T.z-cp.z;let hide=dx*dx+dz*dz<81;
  if(!hide){const u=Math.max(0,Math.min(1,(dx*sx+dz*sz)/L2));const ex=cp.x+sx*u-T.x,ez=cp.z+sz*u-T.z;hide=ex*ex+ez*ez<6.5&&u<.97;}
  if(hide!==T.hid){T.hid=hide;treeT.setMatrixAt(i,hide?M0:T.m1);treeC.setMatrixAt(i,hide?M0:T.m2);ch=true;}}
 if(ch){treeT.instanceMatrix.needsUpdate=true;treeC.instanceMatrix.needsUpdate=true;}}
// クラブハウス
{const g=new THREE.Group();g.add(mesh(GEO.box,LAM(0xf1ebdd),26,7,12,0,3.5,0));const roof=mesh(GEO.cone,LAM(0x8a3b2a),20,5,10,0,9.5,0);roof.rotation.y=Math.PI/4;roof.scale.set(19,4,10);g.add(roof);
 for(let i=0;i<8;i++)g.add(mesh(GEO.box,LAM(0x6aa0c8),1.8,1.4,.1,-10.5+i*3,4,6.05));g.position.set(-14,0,-95);S3.add(g);}

// ===== 棒人間 =====
function makeStick(o){
 o=o||{};const M=STD(o.c!=null?o.c:0x2f2f35);
 const man=new THREE.Group(),root=new THREE.Group();man.add(root);
 const hip=new THREE.Group();root.add(hip);
 const w=o.w||1;
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.55,8,16),M);torso.position.y=.38;torso.scale.set(w,1,w);hip.add(torso);
 const neck=new THREE.Group();neck.position.y=.75;hip.add(neck);
 const head=new THREE.Mesh(GEO.sph,M);head.scale.setScalar(.24);head.position.y=.2;neck.add(head);
 const limb=len=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CapsuleGeometry(.065,len,6,10),M);m.position.y=-len/2;g.add(m);return g;};
 const armL=limb(.6),armR=limb(.6);armL.position.set(-.2*w,.68,0);armR.position.set(.2*w,.68,0);hip.add(armL,armR);
 const legL=limb(.8),legR=limb(.8);legL.position.set(-.1*w,0,0);legR.position.set(.1*w,0,0);hip.add(legL,legR);
 const hand=new THREE.Group();hand.position.y=-.68;armR.add(hand);
 if(o.hat)addHat(neck,o.hat,o.hc);
 if(o.tie){const tie=mesh(GEO.box,STD(o.tie),.07,.32,.02,0,.48,.14*w);hip.add(tie);}
 if(o.prop&&o.prop!=='none')addProp(hand,o.prop);
 man.scale.setScalar(o.s||1);
 return {man,root,hip,torso,neck,head,armL,armR,legL,legR,hand,M};
}
function addHat(neck,h,hc){
 const c=hc!=null?hc:{cap:0xffffff,helmet:0xf0c020,straw:0xe6cf8a,chef:0xffffff,top:0x1d1d1d,band:0xe8352a,bun:0x2a2a2a}[h];if(c==null)return;const m=STD(c);
 if(h==='cap'){neck.add(mesh(new THREE.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI/2),m,.255,.2,.255,0,.27,0));const b=mesh(GEO.cyl,m,.17,.02,.14,0,.28,.2);neck.add(b);}
 else if(h==='helmet')neck.add(mesh(new THREE.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI/1.8),m,.28,.26,.28,0,.24,0));
 else if(h==='straw'){neck.add(mesh(GEO.cyl,m,.45,.02,.45,0,.3,0));neck.add(mesh(GEO.cyl,m,.2,.14,.2,0,.37,0));}
 else if(h==='chef')neck.add(mesh(GEO.cyl,m,.2,.35,.2,0,.55,0));
 else if(h==='top'){neck.add(mesh(GEO.cyl,m,.32,.02,.32,0,.36,0));neck.add(mesh(GEO.cyl,m,.18,.34,.18,0,.53,0));}
 else if(h==='band')neck.add(mesh(GEO.tor,m,.245,.245,.4,0,.27,0)).rotation.x=Math.PI/2;
 else if(h==='bun')neck.add(mesh(GEO.sph,m,.11,.11,.11,0,.42,-.08));
}
function addProp(hand,p){
 const g=new THREE.Group();hand.add(g);const W=STD(0x8a6a40),S=STD(0xc8c8d0),D=STD(0x2a2a2a);
 const stick=(len,m,r)=>{const s=mesh(GEO.cyl,m,r||.025,len,r||.025,0,-len/2+.1,0);g.add(s);return s;};
 if(p==='club'){stick(1,S,.015);g.add(mesh(GEO.box,D,.12,.06,.05,.04,-.9,0));}
 else if(p==='bat'){const s=mesh(new THREE.CylinderGeometry(.05,.025,.9,10),W);s.position.y=-.35;g.add(s);}
 else if(p==='racket'){stick(.35,D);const r=mesh(GEO.tor,STD(0xe8352a),.16,.22,.6,0,-.45,0);g.add(r);}
 else if(p==='broom'){stick(1,W);g.add(mesh(GEO.box,STD(0xd8b060),.3,.2,.06,0,-.95,0));}
 else if(p==='net'){stick(.9,W);g.add(mesh(GEO.tor,STD(0xffffff),.18,.18,.5,0,-.95,0));}
 else if(p==='rake'){stick(1.1,W);g.add(mesh(GEO.box,D,.4,.04,.04,0,-1,0));}
 else if(p==='umbrella'){stick(.9,D);g.add(mesh(GEO.cone,STD(0xe8352a),.55,.3,.55,0,.4,0));}
 else if(p==='pan'){stick(.35,D);g.add(mesh(GEO.cyl,D,.2,.04,.2,0,-.5,0));}
 else if(p==='stick')stick(.9,W);
 else if(p==='flag'){stick(1,S);const f=new THREE.Mesh(new THREE.PlaneGeometry(.5,.32),new THREE.MeshLambertMaterial({color:0xe8352a,side:THREE.DoubleSide}));f.position.set(.25,.45,0);g.add(f);}
 else if(p==='fan'){g.add(mesh(GEO.cyl,STD(0xf6f6f6),.18,.02,.18,0,-.05,0));}
 g.rotation.x=-.3;
}
// 人の向き：角度 a（ラジアン。0が -z 方向）
function faceTo(o,fx,fz){o.rotation.y=Math.atan2(fx,fz);}
function poseReset(m){m.root.position.set(0,0,0);m.root.rotation.set(0,0,0);m.hip.position.set(0,1,0);m.hip.rotation.set(0,0,0);m.neck.rotation.set(0,0,0);for(const l of [m.armL,m.armR,m.legL,m.legR])l.rotation.set(0,0,0);}
function walkPose(m,ph,amp){const s=Math.sin(ph)*(amp||.8);m.legL.rotation.x=s;m.legR.rotation.x=-s;m.armL.rotation.x=-s*.85;m.armR.rotation.x=s*.85;m.hip.position.y=1+Math.abs(Math.cos(ph))*.05;}

// 自分と部長
const me=makeStick({c:0x2f2f35,hat:'cap'});S3.add(me.man);
const club=new THREE.Group();me.hand.add(club);
const clubShaft=mesh(GEO.cyl,STD(0xc8c8d0),.014,1,.014,0,-.4,0);club.add(clubShaft);
const clubHead=new THREE.Group();clubHead.position.set(0,-.92,0);club.add(clubHead);
const headMesh=mesh(GEO.box,STD(0x2a2a2a),.12,.07,.05,.04,0,0);clubHead.add(headMesh);
const flyHead=new THREE.Group();flyHead.add(mesh(GEO.box,STD(0x2a2a2a),.14,.08,.06,0,0,0),mesh(GEO.cyl,STD(0xc8c8d0),.014,.35,.014,-.05,.17,0));flyHead.visible=false;S3.add(flyHead);
const boss=makeStick({c:0x23315a,hat:'cap',hc:0xf2e7c4,tie:0xd8352a,w:1.28,prop:'club'});S3.add(boss.man);
const bossBall=mesh(GEO.sph,STD(0xffffff),.055,.055,.055,0,.055,0);S3.add(bossBall);
const ball=mesh(GEO.sph,STD(0xffffff),.06,.06,.06,0,.06,0);S3.add(ball);
const ballGlow=new THREE.Mesh(new THREE.RingGeometry(.12,.2,20),new THREE.MeshBasicMaterial({color:0xffee55,transparent:true,opacity:.7,depthWrite:false}));ballGlow.rotation.x=-Math.PI/2;S3.add(ballGlow);
const aimArrow=new THREE.Group();S3.add(aimArrow);
{const m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false});for(let i=0;i<7;i++){const d=mesh(GEO.disc,m,.06,.06,1,0,.03,-.6-i*.55);d.rotation.x=-Math.PI/2;aimArrow.add(d);}
 const tip=new THREE.Mesh(new THREE.ConeGeometry(.16,.35,3),m);tip.rotation.x=-Math.PI/2;tip.position.set(0,.04,-4.6);aimArrow.add(tip);}
