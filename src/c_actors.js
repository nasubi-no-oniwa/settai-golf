
// ===== 理由に出てくるもの（人・動物・乗り物・物） =====
const hex=c=>typeof c==='string'?parseInt(c.replace('#',''),16):c;
// 4本足の動物
const QUAD={dog:[0x9a6a3a,.8,.45,.32,1,'ear'],cat:[0xe0913a,.55,.3,.22,1,'pt'],monkey:[0x8a5a30,.6,.55,.3,1,'ear'],deer:[0xb98a50,1.1,.7,.32,1.4,'ant'],boar:[0x4a3a2a,1,.55,.45,.8,'tusk'],bear:[0x2a2422,1.4,.8,.6,1,'ear'],
 kangaroo:[0xc09060,.9,.9,.4,1.3,'ear'],cow:[0xf2f2f2,1.6,.8,.6,1.1,'horn'],horse:[0x7a4a2a,1.7,.75,.45,1.5,'ear'],rabbit:[0xf6f6f6,.4,.3,.25,.6,'long'],squirrel:[0xc06a2a,.3,.22,.16,.5,'pt'],
 tanuki:[0x7a6a5a,.6,.4,.36,.7,'ear'],fox:[0xe0742a,.7,.38,.26,1,'pt'],goat:[0xeeeeea,.9,.5,.35,1.1,'horn'],capybara:[0x8a6040,1,.55,.5,.6,'ear']};
const BIRD={crow:[0x1a1a1e,.35],pigeon:[0x8a8f9a,.3],eagle:[0x6a4a2a,.6],duck:[0xf6f6f2,.35],seagull:[0xf6f6f6,.4],owl:[0x8a6a40,.38],pelican:[0xf2f2f0,.6],penguin:[0x1d1d22,.45],ostrich:[0x2a2a2a,1]};
function makeQuad(k,c,s){
 const [cc,L,H,T,legL,ear]=QUAD[k]||QUAD.dog;const M=STD(c!=null?c:cc);const g=new THREE.Group(),b=new THREE.Group();g.add(b);
 const up=k==='kangaroo'||k==='monkey';
 const body=mesh(GEO.sph,M,T*.9,H*.55,L*.6,0,legL*.55+H*.3,0);b.add(body);if(up){body.rotation.x=-.9;body.position.y+=.25;}
 const head=new THREE.Group();head.position.set(0,legL*.55+H*.65+(up?.5:0),-L*.6);b.add(head);head.add(mesh(GEO.sph,M,T*.75,T*.7,T*.85,0,0,0));
 head.add(mesh(GEO.sph,M,T*.4,T*.35,T*.5,0,-T*.15,-T*.7));head.add(mesh(GEO.sph,MB(0x111111),.035,.035,.035,T*.35,T*.2,-T*.6),mesh(GEO.sph,MB(0x111111),.035,.035,.035,-T*.35,T*.2,-T*.6));
 if(ear==='ant'){for(const sx of [-1,1]){const a=mesh(GEO.cyl,STD(0x6a4a2a),.03,.5,.03,sx*.15,T+.2,0);a.rotation.z=sx*-.5;head.add(a);}}
 else if(ear==='horn'){for(const sx of [-1,1]){const a=mesh(GEO.cone,STD(0xe0d8c0),.05,.22,.05,sx*.18,T*.75,0);a.rotation.z=sx*-.4;head.add(a);}}
 else if(ear==='tusk'){for(const sx of [-1,1]){const a=mesh(GEO.cone,STD(0xf2f2e8),.03,.16,.03,sx*.12,-T*.3,-T*.9);a.rotation.x=-1;head.add(a);}}
 else if(ear==='long'){for(const sx of [-1,1])head.add(mesh(GEO.sph,M,.05,.25,.07,sx*.1,T+.18,0));}
 else{for(const sx of [-1,1])head.add(mesh(ear==='pt'?GEO.cone:GEO.sph,M,T*.25,T*.3,T*.15,sx*T*.45,T*.65,0));}
 if(k==='tanuki')head.add(mesh(GEO.sph,MB(0x2a2018),T*.78,T*.25,T*.6,0,T*.15,-T*.25));
 const legs=[];const lw=Math.max(.05,T*.22);
 for(const [x,z] of [[-T*.5,-L*.38],[T*.5,-L*.38],[-T*.5,L*.38],[T*.5,L*.38]]){const lg=new THREE.Group();lg.position.set(x,legL*.55,z);const m=mesh(GEO.cyl,M,lw,legL*.55,lw,0,-legL*.27,0);lg.add(m);b.add(lg);legs.push(lg);}
 if(up){legs[0].visible=legs[1].visible=false;}
 const tail=mesh(GEO.sph,M,T*.18,T*.18,T*.6,0,legL*.55+H*.35,L*.62);if(k==='squirrel'||k==='fox'){tail.scale.set(T*.4,T*.8,T*.9);tail.position.y+=.1;}if(k==='kangaroo'){tail.scale.set(.12,.12,.8);tail.position.set(0,.4,.6);}b.add(tail);
 g.scale.setScalar(s||1);return {g,legs,head,kind:'quad',hold:new THREE.Vector3(0,legL*.55+H*.5,-L*.6-T*.9),hop:k==='kangaroo'||k==='rabbit'};
}
function makeBird(k,c,s){
 const [cc,z]=BIRD[k]||BIRD.crow;const M=STD(c!=null?c:cc);const g=new THREE.Group(),b=new THREE.Group();g.add(b);
 const stand=k==='penguin'||k==='ostrich';
 const body=mesh(GEO.sph,M,z*.55,z*.5,z*.85,0,stand?z*1.1:z*.6,0);b.add(body);if(stand)body.rotation.x=-1.2;
 if(k==='penguin')b.add(mesh(GEO.sph,STD(0xf6f6f6),z*.4,z*.7,z*.3,0,z*1.1,-z*.3));
 const head=mesh(GEO.sph,M,z*.35,z*.35,z*.35,0,stand?z*(k==='ostrich'?2.6:1.9):z*.85,stand?-z*.1:-z*.85);b.add(head);
 if(k==='ostrich')b.add(mesh(GEO.cyl,STD(0xd8b8a0),.05,z*1.1,.05,0,z*2,-z*.05));
 const bk=mesh(GEO.cone,STD(k==='duck'||k==='pelican'?0xf0a020:k==='crow'?0x222222:0xe8c040),z*.12,k==='pelican'?z*.9:z*.35,z*.12,0,head.position.y,head.position.z-z*.4);bk.rotation.x=-Math.PI/2;b.add(bk);
 b.add(mesh(GEO.sph,MB(0x111111),.03,.03,.03,z*.18,head.position.y+z*.08,head.position.z-z*.22),mesh(GEO.sph,MB(0x111111),.03,.03,.03,-z*.18,head.position.y+z*.08,head.position.z-z*.22));
 const wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*z*.45,stand?z*1.2:z*.7,0);const wm=mesh(GEO.box,M,z*1.3,z*.05,z*.6,sx*z*.65,0,0);w.add(wm);b.add(w);wings.push({w,sx});if(stand)w.scale.setScalar(.35);}
 if(stand){for(const sx of [-1,1])b.add(mesh(GEO.cyl,STD(0xe0a040),.03,k==='ostrich'?z*1.2:z*.3,.03,sx*z*.2,k==='ostrich'?z*.6:z*.15,0));}
 g.scale.setScalar(s||1);return {g,wings,head,kind:'bird',fly:!stand,hold:new THREE.Vector3(0,stand?z*.3:-z*.05,-z*.9)};
}
function makeSmall(k,c,s){
 const g=new THREE.Group();let hold=new THREE.Vector3(0,.3,-.3);
 if(k==='mole'){const M=STD(c!=null?c:0x4a4048);g.add(mesh(GEO.sph,M,.35,.32,.35,0,0,0));g.add(mesh(GEO.sph,STD(0xf0a0b0),.07,.06,.07,0,.08,-.33));g.add(mesh(GEO.sph,MB(0x111),.03,.03,.03,.1,.16,-.28),mesh(GEO.sph,MB(0x111),.03,.03,.03,-.1,.16,-.28));for(const sx of [-1,1])g.add(mesh(GEO.sph,STD(0xf0c0c8),.12,.04,.09,sx*.3,.05,-.2));hold.set(0,.4,-.2);}
 else if(k==='turtle'){const M=STD(c!=null?c:0x3a7a3a);g.add(mesh(new THREE.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI/2),M,.5,.32,.6,0,.08,0));g.add(mesh(GEO.sph,STD(0x8ab060),.14,.12,.18,0,.12,-.68));hold.set(0,.45,0);}
 else if(k==='frog'){const M=STD(c!=null?c:0x4aa040);g.add(mesh(GEO.sph,M,.35,.25,.38,0,.25,0));for(const sx of [-1,1]){g.add(mesh(GEO.sph,M,.1,.1,.1,sx*.16,.48,-.18),mesh(GEO.sph,MB(0x111),.05,.05,.05,sx*.16,.52,-.26));g.add(mesh(GEO.sph,M,.12,.08,.25,sx*.32,.08,.1));}hold.set(0,.55,-.3);}
 else if(k==='snake'){const M=STD(c!=null?c:0x6a9a3a);for(let i=0;i<9;i++)g.add(mesh(GEO.sph,M,.12,.12,.12,Math.sin(i*.9)*.25,.1,i*.2-.8));g.add(mesh(GEO.sph,M,.16,.12,.2,0,.15,-1));hold.set(0,.3,-1.1);}
 else{const fish=k==='carp';const M=STD(c!=null?c:fish?0xe8562a:0xb8c4d0);g.add(mesh(GEO.sph,M,.22,.3,.6,0,0,0));const tl=mesh(GEO.cone,M,.25,.35,.08,0,0,.7);tl.rotation.x=Math.PI/2;g.add(tl);g.add(mesh(GEO.sph,MB(0x111),.04,.04,.04,.15,.08,-.42),mesh(GEO.sph,MB(0x111),.04,.04,.04,-.15,.08,-.42));if(fish)g.add(mesh(GEO.sph,STD(0xffffff),.23,.2,.3,0,.12,.05));hold.set(0,.25,-.65);}
 g.scale.setScalar(s||1);return {g,kind:'small',k,hold};
}
function makeVeh(k,c){
 const g=new THREE.Group();let hold=new THREE.Vector3(0,1,0),air=false;const col=c!=null?c:{cart:0xf6f6f2,mower:0xd8352a,drone:0x2a2a2e,heli:0x2a5aa8,balloon:0xe8352a,ufo:0xb8c0c8,plane:0xf6f6f6,truck:0x3a6ab8,bike:0x1a8a4a,rocket:0xf2f2f2,robot:0xa8b0b8,boat:0xf6f6f2,blimp:0xc8c8c8}[k]||0x888888;const M=STD(col),D=STD(0x2a2a2a);
 const wheel=(x,y,z,r)=>{const w=mesh(GEO.cyl,D,r,.12,r,x,y,z);w.rotation.z=Math.PI/2;g.add(w);};
 if(k==='cart'){g.add(mesh(GEO.box,M,1.2,.5,2,0,.55,0));g.add(mesh(GEO.box,M,1.25,.06,1.8,0,1.95,.1));for(const [x,z] of [[-.55,-.8],[.55,-.8],[-.55,.9],[.55,.9]])g.add(mesh(GEO.cyl,D,.03,1.2,.03,x,1.35,z));g.add(mesh(GEO.box,STD(0x2a5a8a),1.1,.4,.6,0,1,.2));wheel(-.6,.25,-.65,.25);wheel(.6,.25,-.65,.25);wheel(-.6,.25,.65,.25);wheel(.6,.25,.65,.25);hold.set(0,1.1,-.9);}
 else if(k==='mower'){g.add(mesh(GEO.box,M,1.1,.5,1.4,0,.45,0));g.add(mesh(GEO.box,D,.5,.3,.4,0,.85,.3));wheel(-.55,.25,-.5,.25);wheel(.55,.25,-.5,.25);wheel(-.55,.3,.5,.3);wheel(.55,.3,.5,.3);hold.set(0,.9,-.8);}
 else if(k==='drone'){air=true;g.add(mesh(GEO.box,M,.4,.15,.4,0,0,0));const ro=[];for(const [x,z] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){g.add(mesh(GEO.box,M,.05,.04,.5,x/2,0,z/2)).rotation.y=Math.atan2(x,z);const r=mesh(GEO.cyl,STD(0x999999),.2,.01,.2,x,.08,z);g.add(r);ro.push(r);}g.userData.ro=ro;hold.set(0,-.2,0);}
 else if(k==='heli'){air=true;g.add(mesh(GEO.sph,M,.9,.8,1.5,0,0,0));g.add(mesh(GEO.box,M,.15,.25,2.2,0,.2,2));const r=mesh(GEO.box,D,5,.04,.2,0,.95,0);g.add(r);g.userData.rot=r;g.add(mesh(GEO.sph,STD(0x9ad0f0),.6,.5,.6,0,.15,-.9));hold.set(0,-1.1,0);g.add(mesh(GEO.cyl,D,.02,1,.02,0,-.6,0));}
 else if(k==='balloon'){air=true;g.add(mesh(GEO.sph,M,2.2,2.6,2.2,0,4.2,0));g.add(mesh(GEO.box,STD(0x8a5a30),.9,.6,.9,0,.3,0));hold.set(0,-.1,0);}
 else if(k==='ufo'){air=true;g.add(mesh(GEO.sph,M,2,.35,2,0,0,0));g.add(mesh(GEO.sph,STD(0x8af0a0),.8,.6,.8,0,.3,0));const beam=new THREE.Mesh(new THREE.CylinderGeometry(.2,1.2,4,16,1,true),new THREE.MeshBasicMaterial({color:0xaaffaa,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}));beam.position.y=-2.2;g.add(beam);g.userData.beam=beam;hold.set(0,-1.2,0);}
 else if(k==='plane'){air=true;g.add(mesh(GEO.sph,M,.5,.5,2.6,0,0,0));g.add(mesh(GEO.box,M,4.4,.08,.8,0,0,0));g.add(mesh(GEO.box,STD(0xd8352a),.08,.8,.6,0,.5,2.2));g.add(mesh(GEO.box,M,1.6,.06,.5,0,.1,2.3));hold.set(0,-.6,0);}
 else if(k==='blimp'){air=true;g.add(mesh(GEO.sph,M,1.6,1.6,4.5,0,0,0));g.add(mesh(GEO.box,STD(0xd8352a),.1,1.4,1,0,.8,4));g.add(mesh(GEO.box,STD(0x444444),.6,.4,1.2,0,-1.7,0));hold.set(0,-2,0);}
 else if(k==='truck'){g.add(mesh(GEO.box,M,1.8,1.4,1.4,0,1,-1.8));g.add(mesh(GEO.box,STD(0xe8e8e8),1.9,1.9,3,0,1.3,.6));g.add(mesh(GEO.box,STD(0x9ad0f0),1.6,.6,.05,0,1.3,-2.51));for(const z of [-1.8,.2,1.4]){wheel(-.95,.4,z,.4);wheel(.95,.4,z,.4);}hold.set(0,1.2,-2.6);}
 else if(k==='bike'){wheel(0,.35,-.55,.35);wheel(0,.35,.55,.35);g.add(mesh(GEO.box,M,.06,.06,1.1,0,.6,0));const r=makeStick({c:0x3a3a3a,hat:'helmet'});r.man.position.set(0,.05,.05);r.legL.rotation.x=-1;r.legR.rotation.x=-1;r.hip.position.y=1.05;r.armL.rotation.x=-1.2;r.armR.rotation.x=-1.2;g.add(r.man);g.userData.rider=r;hold.set(0,1.3,-.6);}
 else if(k==='rocket'){air=true;g.add(mesh(GEO.cyl,M,.5,3,.5,0,0,0));g.add(mesh(GEO.cone,STD(0xd8352a),.5,1,.5,0,2,0));for(let i=0;i<3;i++){const f=mesh(GEO.box,STD(0xd8352a),.05,.8,.6,Math.cos(i*2.1)*.5,-1.2,Math.sin(i*2.1)*.5);f.rotation.y=-i*2.1;g.add(f);}const fl=mesh(GEO.cone,MB(0xffa020),.35,1.2,.35,0,-2.1,0);fl.rotation.x=Math.PI;g.add(fl);g.rotation.x=-Math.PI/2;hold.set(0,-.6,-1);}
 else if(k==='robot'){g.add(mesh(GEO.box,M,.7,.8,.5,0,1.1,0));g.add(mesh(GEO.box,M,.5,.4,.45,0,1.75,0));g.add(mesh(GEO.box,MB(0x40e0ff),.36,.08,.05,0,1.8,-.24));for(const sx of [-1,1]){g.add(mesh(GEO.box,M,.18,.7,.18,sx*.48,1.05,0));g.add(mesh(GEO.box,M,.2,.7,.2,sx*.2,.35,0));}hold.set(0,1,-.4);}
 else if(k==='boat'){g.add(mesh(GEO.box,M,1.2,.5,2.6,0,.2,0));g.add(mesh(GEO.box,STD(0x2a5a8a),.8,.6,.8,0,.75,.4));hold.set(0,.9,-1.2);}
 else g.add(mesh(GEO.box,M,1,1,1,0,.5,0));
 return {g,kind:'veh',k,air,hold};
}
function makeObj(k,c){
 const g=new THREE.Group();let hit=1;const col=c!=null?c:0;const M=STD(col||0x8a8a8a);
 if(k==='tree'){g.add(mesh(GEO.cyl,LAM(0x6b4a2a),.25,2.4,.25,0,1.2,0));g.add(mesh(GEO.cone,LAM(col||0x3f7a34),1.6,4,1.6,0,4,0));hit=3;}
 else if(k==='sign'){g.add(mesh(GEO.cyl,STD(0x999999),.06,2,.06,0,1,0));g.add(mesh(GEO.box,STD(col||0xf2e7c4),1.6,.9,.08,0,2.2,0));g.add(mesh(GEO.box,STD(0x1f8a4c),1.4,.15,.09,0,2.4,0));hit=2.2;}
 else if(k==='rock'){g.add(mesh(GEO.sph,STD(col||0x8a8680),.9,.6,.8,0,.4,0));hit=.6;}
 else if(k==='wall'){g.add(mesh(GEO.box,STD(col||0xc8b8a0),3,2,.4,0,1,0));hit=1.2;}
 else if(k==='spring'){for(let i=0;i<6;i++)g.add(mesh(GEO.tor,STD(col||0xc8c8d0),.3,.3,.3,0,.12+i*.13,0)).rotation.x=Math.PI/2;g.add(mesh(GEO.cyl,STD(0xd8352a),.4,.05,.4,0,.9,0));hit=.9;}
 else if(k==='tramp'){g.add(mesh(GEO.cyl,STD(0x2a2a2a),1.2,.05,1.2,0,.6,0));g.add(mesh(GEO.tor,STD(col||0x2a6ad8),1.2,1.2,1.2,0,.6,0)).rotation.x=Math.PI/2;for(let i=0;i<4;i++)g.add(mesh(GEO.cyl,STD(0x777777),.04,.6,.04,Math.cos(i*1.57),.3,Math.sin(i*1.57)));hit=.6;}
 else if(k==='pole'){g.add(mesh(GEO.cyl,STD(col||0x9a9a9a),.15,7,.15,0,3.5,0));hit=2;}
 else if(k==='statue'){g.add(mesh(GEO.box,STD(0xb8b0a0),1,1,1,0,.5,0));const st=makeStick({c:col||0x9a8a6a});st.man.position.y=1;st.armR.rotation.z=2.6;g.add(st.man);hit=2;}
 else if(k==='fan'){g.add(mesh(GEO.cyl,STD(0xf2f2f2),.4,.1,.4,0,.05,0));g.add(mesh(GEO.cyl,STD(0xf2f2f2),.05,1.2,.05,0,.6,0));const h=mesh(GEO.tor,STD(col||0x6ab0e0),.6,.6,.6,0,1.3,0);g.add(h);const bl=mesh(GEO.box,STD(0x6ab0e0),1,.15,.02,0,1.3,0);g.add(bl);g.userData.rot=bl;hit=1.3;}
 else if(k==='magnet'){const r=STD(col||0xd8352a),s=STD(0xd0d0d0);g.add(mesh(GEO.box,r,1.4,.35,.35,0,1.4,0));for(const sx of [-1,1]){g.add(mesh(GEO.box,r,.35,.9,.35,sx*.52,.9,0));g.add(mesh(GEO.box,s,.36,.3,.36,sx*.52,.35,0));}hit=1;}
 else if(k==='portal'){const m=new THREE.MeshBasicMaterial({color:col||0xb050ff});g.add(mesh(GEO.tor,m,1,1,1,0,1.2,0));const d=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:0x3a1060,transparent:true,opacity:.8,side:THREE.DoubleSide}));d.scale.setScalar(.95);d.position.y=1.2;g.add(d);g.userData.spin=d;hit=1.2;}
 else if(k==='geyser'){const w=new THREE.Mesh(new THREE.CylinderGeometry(.35,.6,1,14,1,true),new THREE.MeshLambertMaterial({color:col||0x8fd0ff,transparent:true,opacity:.7,side:THREE.DoubleSide}));w.position.y=.5;g.add(w);g.userData.col=w;hit=1;}
 else if(k==='sprinkler'){g.add(mesh(GEO.cyl,STD(0x2a2a2a),.08,.25,.08,0,.12,0));const w=new THREE.Mesh(new THREE.ConeGeometry(1.2,1.5,14,1,true),new THREE.MeshLambertMaterial({color:0x9ad8ff,transparent:true,opacity:.45,side:THREE.DoubleSide}));w.position.y=.9;w.rotation.x=Math.PI;g.add(w);g.userData.col=w;hit=.5;}
 else if(k==='vending'){g.add(mesh(GEO.box,STD(col||0xd8352a),1,1.8,.8,0,.9,0));g.add(mesh(GEO.box,STD(0xe8f4ff),.7,.9,.05,0,1.15,-.41));hit=1.2;}
 else if(k==='mirror'){g.add(mesh(GEO.box,STD(0x8a6a40),1.4,2.2,.1,0,1.3,0));g.add(mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xd8f0ff,metalness:.9,roughness:.05}),1.2,2,.12,0,1.3,0));hit=1.3;}
 else if(k==='cone'){g.add(mesh(GEO.cone,STD(col||0xff7a1a),.35,.8,.35,0,.4,0));hit=.4;}
 else if(k==='bucket'){g.add(mesh(new THREE.CylinderGeometry(.35,.28,.6,14,1,true),new THREE.MeshStandardMaterial({color:col||0x3a7ad8,side:THREE.DoubleSide}),1,1,1,0,.3,0));hit=.4;}
 else if(k==='pipe'){g.add(mesh(GEO.cyl,STD(col||0x2aa040),.6,1.1,.6,0,.55,0));g.add(mesh(GEO.cyl,STD(col||0x2aa040),.72,.3,.72,0,1.15,0));g.add(mesh(GEO.disc,MB(0x0a2a0a),.55,.55,1,0,1.31,0)).rotation.x=-Math.PI/2;hit=1.2;}
 else if(k==='hand'){const sk=STD(col||0xf0c8a0);g.add(mesh(GEO.box,sk,1.6,.5,1.8,0,0,0));for(let i=0;i<4;i++)g.add(mesh(GEO.box,sk,.32,.4,1.2,-.6+i*.4,0,-1.4));g.add(mesh(GEO.box,sk,.35,.4,.9,.95,0,-.3)).rotation.y=-.6;g.add(mesh(GEO.cyl,sk,.6,8,.6,0,4,.6));hit=0;}
 else if(k==='whirl'){const m=new THREE.MeshLambertMaterial({color:col||0xb8b8b8,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});for(let i=0;i<6;i++)g.add(mesh(new THREE.CylinderGeometry(.3+i*.35,.2+i*.3,1,16,1,true),m,1,1,1,0,.5+i,0));g.userData.whirl=1;hit=1.5;}
 const hold=k==='hand'?new THREE.Vector3(0,-.45,-1.3):k==='whirl'?new THREE.Vector3(0,2.5,0):new THREE.Vector3(0,hit||.5,0);
 return {g,kind:'obj',k,hit,hold};
}
function buildActor(spec){const a=buildActor0(spec);if(a)a.base=a.g.scale.x;return a;}
function buildActor0(spec){
 spec=spec||{};
 if(spec.p){const p=spec.p;const m=makeStick({c:hex(p.c!=null?p.c:'#3a5a8a'),hat:p.hat,prop:p.prop,s:p.s,w:p.w});return {g:m.man,stick:m,kind:'person',hold:new THREE.Vector3(.25,.85,-.2)};}
 if(spec.a){const a=spec.a,c=spec.c!=null?hex(spec.c):null;if(QUAD[a])return makeQuad(a,c,spec.s);if(BIRD[a])return makeBird(a,c,spec.s);return makeSmall(a,c,spec.s);}
 if(spec.v)return makeVeh(spec.v,spec.c!=null?hex(spec.c):null);
 if(spec.o&&spec.o!=='none')return makeObj(spec.o,spec.c!=null?hex(spec.c):null);
 return null;
}
