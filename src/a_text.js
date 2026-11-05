<script type="module">
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const $=id=>document.getElementById(id);
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const GAME_URL='https://nasubi-no-oniwa.github.io/settai-golf/';

const {CUP,POND,BOSS}=SG;

// ===== ことば（日本語・英語・繁体中文・韓国語） =====
const TX={
ja:{title:'<em>接待</em>ゴルフ<small>上司を勝たせろ</small>',hud:'接待ゴルフ',
 how:'最終ホール。部長のパットはカップのふちで止まった。<br>あなたが入れたら、勝ってしまう。<b>でも、どう打っても入ってしまう。</b><br>入るまでの時間が長いほど上。どこまで粘れるか。',
 ctl:'上でクラブを選ぶ・画面を左右になぞって向きを変える・右のボタンを長押しして離すと打つ',
 pcHow:'←→で向き、↑↓でクラブ、スペース長押しで打つ',
 name:'なまえ（12文字まで）',anon:'名無しの平社員',start:'ラウンドに出る',rank:'ランキング',best:'自己ベスト',none:'まだなし',skip:'スキップ ▶▶',
 clubs:['パター','ウェッジ','アイアン','ウッド','ドライバー'],hit:'打つ',hitDone:'打った',throwBtn:'上司に<br>ボールを<br>投げる',breakBtn:'ゴルフ<br>クラブを<br>折る',
 power:'強さ',back:'もどる',
 introA:'ああっ…！',introB:'次、君の番だね',introCap:'入れたら、勝ってしまう。',
 idle:['おっ…','あっ…','入るなよ…','いい天気だなあ','君、ゴルフ歴は？','……','おいおい','ほう…','今期の数字、どうだ？','まさかな…'],
 cupIn:'入ってしまった…',silence:'シーン…',bossWin:'……ナイスイン。',
 won:'勝ってしまった',sec:'秒',ttl:'称号',
 grades:['空気が読めない新人','忖度ゼロ社員','出世コースから外れた人','左遷候補','気まずい係長','粘りの課長補佐','忖度見習い','接待の苦労人','根回しの達人','接待の鬼','ほぼ譲った人'],
 newbest:'自己ベスト更新！',sending:'送信中…',sent:'ランキングに載りました（{r}位）',notbetter:'ランキングにある記録の方が上です',
 offline:'打ったときに通信が間に合わなかったので、この回は記録されません',senderr:'送れませんでした',
 rename:'この名前でランキングに載せる',renamed:'名前を変えました',needname:'なまえを入れてね',badname:'その名前は使えません',
 again:'もう一回',video:'動画をつくる',making:'動画をつくっています…',share:'動画を共有',save:'動画を保存',xpost:'Xに投稿',top:'タイトルへ',
 today:'今日',alltime:'全期間',rkNote:'勝つまでの時間が長い順',loading:'読み込み中…',empty:'まだ誰もいません',rankerr:'ランキングを読み込めませんでした',yuzuRow:'上司に勝ちを譲った人',people:'{n}人',
 replaying:'{n} さんの一打',shareHint:'保存した動画を、Xの投稿に貼ってね',vfail:'この端末では動画をつくれませんでした',vmade:'できました',ff:'早送り ▶▶',
 yuzuHead:'上司に勝ちを譲った',yuzuBig:'接待成功',yuzuNote:'部長はたいへんご機嫌だ。',yuzuCount:'譲った人 {n}人',
 mvA:'部長の勝ち！',mvB:'ナイスです、部長！',mvC:'さすがです！',pond:'池ポチャ',clink:'カキーン',
 kubiHead:'クビ',kubiBig:'懲戒解雇',kubiNote:'上司にボールを投げて、クビになった。',kubiBub:'クビだ！！',
 post:'接待ゴルフで {s}秒 ねばったけど、上司に勝ってしまった\n称号「{g}」',postYuzu:'上司に勝ちを譲りました。',postKubi:'上司にボールを投げて、クビになりました。',maxd:'最大 約{m}m',mvLaugh:'ワッハッハ',seen:'見た理由 {n}／{m}',kubiCount:'クビになった人 {n}人',tags:'#接待ゴルフ'},
en:{title:'<em>Let the Boss</em> Win<small>a golf game</small>',hud:'Let the Boss Win',
 how:'The final hole. Your boss\'s putt stopped on the lip.<br>If you sink yours, you win — and that\'s bad. <b>But no matter how you hit it, it goes in.</b><br>The longer it takes to go in, the higher you rank.',
 ctl:'Pick a club at the top, drag left/right to aim, hold the right button and release to hit',
 pcHow:'←→ aim, ↑↓ club, hold Space to hit',
 name:'Name (up to 12)',anon:'Nameless employee',start:'Tee off',rank:'Ranking',best:'Best',none:'none yet',skip:'Skip ▶▶',
 clubs:['Putter','Wedge','Iron','Wood','Driver'],hit:'HIT',hitDone:'...',throwBtn:'Throw<br>the ball at<br>the boss',breakBtn:'Snap<br>your<br>club',
 power:'Power',back:'Back',
 introA:'Argh...!',introB:'Your turn, kid',introCap:'If it goes in, you win. Don\'t.',
 idle:['Oh...','Uh-oh...','Don\'t go in...','Nice weather','Played long?','......','Hey now','Hmm...','How are the numbers?','No way...'],
 cupIn:'It went in...',silence:'*silence*',bossWin:'...Nice putt.',
 won:'You beat the boss',sec:'s',ttl:'Title',
 grades:['Can\'t Read the Room','Zero Flattery','Off the Promotion Track','Transfer Candidate','Awkward Manager','Persistent Assistant','Flattery Trainee','Seasoned Schmoozer','Master Fixer','Demon of Corporate Golf','Almost Let Him Win'],
 newbest:'New personal best!',sending:'Sending…',sent:'You are #{r}',notbetter:'Your ranked record is better',
 offline:'The connection was too slow when you hit, so this round is not recorded',senderr:'Could not send',
 rename:'Use this name on the ranking',renamed:'Name changed',needname:'Enter a name',badname:'That name can’t be used',
 again:'Again',video:'Make a video',making:'Making the video…',share:'Share video',save:'Save video',xpost:'Post on X',top:'Title',
 today:'Today',alltime:'All time',rkNote:'Longest time to sink it first',loading:'Loading…',empty:'No one yet',rankerr:'Could not load the ranking',yuzuRow:'Let the boss win',people:'{n}',
 replaying:'{n}’s shot',shareHint:'Attach the saved video to your post on X',vfail:'This device can’t make videos',vmade:'Done',ff:'Fast-forward ▶▶',
 yuzuHead:'You let the boss win',yuzuBig:'Mission complete',yuzuNote:'The boss is in a great mood.',yuzuCount:'{n} people let him win',
 mvA:'The boss wins!',mvB:'Nice one, boss!',mvC:'Amazing, sir!',pond:'SPLASH',clink:'CLINK',
 kubiHead:'FIRED',kubiBig:'You\'re fired',kubiNote:'You threw the ball at your boss. You\'re fired.',kubiBub:'YOU\'RE FIRED!!',
 post:'I stalled {s}s in corporate golf, but still beat my boss\nTitle: "{g}"',postYuzu:'I let my boss win.',postKubi:'I threw the ball at my boss and got fired.',maxd:'Max ≈{m}m',mvLaugh:'HA HA HA',seen:'Reasons seen {n}／{m}',kubiCount:'{n} people fired',tags:'#接待ゴルフ'},
zh:{title:'<em>接待</em>高爾夫<small>讓上司贏</small>',hud:'接待高爾夫',
 how:'最後一洞。部長的推桿停在洞口邊。<br>你要是進了，就贏了。<b>但是不管怎麼打，都會進。</b><br>進洞前的時間越長排名越高。看你能拖多久。',
 ctl:'上面選球桿・左右滑動畫面調整方向・長按右邊的按鈕放開就擊球',
 pcHow:'←→方向，↑↓球桿，長按空白鍵擊球',
 name:'名字（12字以內）',anon:'無名小職員',start:'上場',rank:'排行榜',best:'個人最佳',none:'尚無',skip:'跳過 ▶▶',
 clubs:['推桿','挖起桿','鐵桿','木桿','一號木'],hit:'擊球',hitDone:'打了',throwBtn:'把球<br>丟向<br>上司',breakBtn:'折斷<br>高爾夫<br>球桿',
 power:'力道',back:'返回',
 introA:'啊啊…！',introB:'換你了喔',introCap:'要是進了，就贏了。',
 idle:['喔…','啊…','別進啊…','天氣真好','你打幾年了？','……','喂喂','嗯…','這季業績怎樣？','不會吧…'],
 cupIn:'進了…',silence:'一片寂靜…',bossWin:'……好球。',
 won:'不小心贏了',sec:'秒',ttl:'稱號',
 grades:['不會看氣氛的新人','零逢迎社員','脫離升遷之路的人','外放候補','尷尬的股長','頑強的課長助理','逢迎見習生','接待的辛苦人','打點關係的達人','接待之鬼','差點就讓了'],
 newbest:'刷新個人最佳！',sending:'傳送中…',sent:'登上排行榜（第{r}名）',notbetter:'排行榜上的紀錄比較好',
 offline:'擊球時連線來不及，這次不會被記錄',senderr:'傳送失敗',
 rename:'用這個名字登上排行榜',renamed:'已改名',needname:'請輸入名字',badname:'這個名字不能用',
 again:'再一次',video:'製作影片',making:'影片製作中…',share:'分享影片',save:'儲存影片',xpost:'發到X',top:'回標題',
 today:'今天',alltime:'全部',rkNote:'進洞前的時間越長越前面',loading:'讀取中…',empty:'還沒有人',rankerr:'無法讀取排行榜',yuzuRow:'讓上司贏的人',people:'{n}人',
 replaying:'{n} 的一桿',shareHint:'把儲存的影片貼到X的貼文裡',vfail:'這台裝置無法製作影片',vmade:'完成',ff:'快轉 ▶▶',
 yuzuHead:'讓上司贏了',yuzuBig:'接待成功',yuzuNote:'部長心情大好。',yuzuCount:'讓了的人 {n}人',
 mvA:'部長贏了！',mvB:'部長好球！',mvC:'不愧是部長！',pond:'掉進池裡',clink:'鏘',
 kubiHead:'開除',kubiBig:'懲戒解僱',kubiNote:'把球丟向上司，被開除了。',kubiBub:'你被開除了！！',
 post:'在接待高爾夫拖了 {s}秒，還是不小心贏了上司\n稱號「{g}」',postYuzu:'我讓上司贏了。',postKubi:'我把球丟向上司，被開除了。',maxd:'最遠 約{m}m',mvLaugh:'哇哈哈',seen:'看過的理由 {n}／{m}',kubiCount:'被開除的人 {n}人',tags:'#接待ゴルフ'},
ko:{title:'<em>접대</em> 골프<small>상사를 이기게 하라</small>',hud:'접대 골프',
 how:'마지막 홀. 부장님의 퍼트는 홀컵 가장자리에서 멈췄다.<br>당신이 넣으면 이겨 버린다. <b>그런데 어떻게 쳐도 들어가 버린다.</b><br>들어갈 때까지 오래 걸릴수록 순위가 높다. 얼마나 버틸 수 있을까.',
 ctl:'위에서 클럽 선택・화면을 좌우로 문질러 방향 조절・오른쪽 버튼을 길게 눌렀다 떼면 샷',
 pcHow:'←→ 방향, ↑↓ 클럽, 스페이스 길게 눌러 샷',
 name:'이름 (12자까지)',anon:'이름 없는 평사원',start:'라운드 나가기',rank:'랭킹',best:'최고 기록',none:'아직 없음',skip:'건너뛰기 ▶▶',
 clubs:['퍼터','웨지','아이언','우드','드라이버'],hit:'샷',hitDone:'쳤다',throwBtn:'상사에게<br>공을<br>던진다',breakBtn:'골프<br>클럽을<br>꺾는다',
 power:'세기',back:'돌아가기',
 introA:'아아…!',introB:'다음은 자네 차례야',introCap:'넣으면 이겨 버린다.',
 idle:['오…','앗…','들어가지 마라…','날씨 좋네','골프 몇 년 쳤나?','……','어이어이','호오…','이번 분기 실적은?','설마…'],
 cupIn:'들어가 버렸다…',silence:'정적…',bossWin:'……나이스 인.',
 won:'이겨 버렸다',sec:'초',ttl:'칭호',
 grades:['눈치 없는 신입','아부 제로 사원','승진 코스에서 벗어난 사람','좌천 후보','어색한 계장','끈질긴 과장 대리','아부 견습생','접대의 고생꾼','물밑 작업의 달인','접대의 귀신','거의 양보한 사람'],
 newbest:'최고 기록 갱신!',sending:'보내는 중…',sent:'랭킹에 올랐습니다 ({r}위)',notbetter:'랭킹에 있는 기록이 더 좋습니다',
 offline:'샷을 칠 때 연결이 늦어서 이번 기록은 남지 않습니다',senderr:'보내지 못했습니다',
 rename:'이 이름으로 랭킹에 올리기',renamed:'이름을 바꿨습니다',needname:'이름을 입력해 주세요',badname:'그 이름은 쓸 수 없습니다',
 again:'한 번 더',video:'영상 만들기',making:'영상 만드는 중…',share:'영상 공유',save:'영상 저장',xpost:'X에 올리기',top:'타이틀로',
 today:'오늘',alltime:'전체',rkNote:'들어갈 때까지 오래 걸린 순',loading:'불러오는 중…',empty:'아직 아무도 없어요',rankerr:'랭킹을 불러오지 못했습니다',yuzuRow:'상사에게 승리를 양보한 사람',people:'{n}명',
 replaying:'{n} 님의 샷',shareHint:'저장한 영상을 X 게시물에 붙여 주세요',vfail:'이 기기에서는 영상을 만들 수 없습니다',vmade:'완료',ff:'빨리 감기 ▶▶',
 yuzuHead:'상사에게 승리를 양보했다',yuzuBig:'접대 성공',yuzuNote:'부장님 기분이 아주 좋다.',yuzuCount:'양보한 사람 {n}명',
 mvA:'부장님 승리!',mvB:'나이스 샷, 부장님!',mvC:'역시 부장님!',pond:'퐁당',clink:'깡',
 kubiHead:'해고',kubiBig:'징계 해고',kubiNote:'상사에게 공을 던져서 해고당했다.',kubiBub:'자넨 해고야!!',
 post:'접대 골프에서 {s}초 버텼지만 상사를 이겨 버렸다\n칭호 "{g}"',postYuzu:'상사에게 승리를 양보했습니다.',postKubi:'상사에게 공을 던져서 해고당했습니다.',maxd:'최대 약 {m}m',mvLaugh:'와하하',seen:'본 이유 {n}／{m}',kubiCount:'해고된 사람 {n}명',tags:'#接待ゴルフ'}};
const LANGS=[['ja','日本語'],['en','English'],['zh','繁中'],['ko','한국어']];
let lang=(q=>['ja','en','zh','ko'].includes(q)?q:null)(new URLSearchParams(location.search).get('lang'))||ls.get('sg_lang',null)||(n=>n.startsWith('ja')?'ja':n.startsWith('zh')?'zh':n.startsWith('ko')?'ko':'en')((navigator.language||'ja').toLowerCase());
const LI={ja:5,en:6,zh:7,ko:8};
const t=(k,o)=>{let s=(TX[lang]||TX.ja)[k];if(s==null)s=TX.ja[k];if(o)for(const [a,b] of Object.entries(o))s=String(s).replace('{'+a+'}',b);return s;};
const fmt=ms=>(ms/1000).toFixed(2);
const GR_AT=[13,16,20,25,30,35,40,45,50,55];
function grade(ms){const s=ms/1000,g=t('grades');let i=0;while(i<GR_AT.length&&s>=GR_AT[i])i++;return g[i];}
function reasonTxt(ri){const r=SG.R[ri];if(!r)return ['',''];const s=String(r[LI[lang]]||r[5]||'');const k=s.indexOf('|');return k<0?[s,'']:[s.slice(0,k),s.slice(k+1)];}
const isPC=()=>matchMedia('(pointer:fine)').matches&&!('ontouchstart' in window);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ===== 音 =====
let AC=null,master=null,bus=null;
function ac(){try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();bus=AC.createGain();bus.gain.value=1;master=AC.createGain();master.gain.value=.85;master.connect(bus).connect(AC.destination);}if(AC.state==='suspended')AC.resume();}catch(e){}return AC;}
function tone(at,f,dur,type,vol,f2){const c=AC;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+dur);
 g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol||.3,at+.01);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g).connect(master);o.start(at);o.stop(at+dur+.02);}
const NB={};function noiseBuf(sec){const k=Math.round(sec*10);if(NB[k])return NB[k];const c=AC,n=c.sampleRate*sec|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return NB[k]=b;}
function noise(at,dur,type,f,q,vol,f2){const c=AC;if(!c)return;const s=c.createBufferSource();s.buffer=noiseBuf(dur+.1);const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,at);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,at+dur);fl.Q.value=q;const g=c.createGain();
 g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.connect(fl).connect(g).connect(master);s.start(at);s.stop(at+dur+.1);}
const SFX={
 swing(){if(!ac())return;const n=AC.currentTime;noise(n,.25,'bandpass',900,1.4,.35,2600);},
 hit(c){if(!ac())return;const n=AC.currentTime;if(c===0){tone(n,1400,.08,'triangle',.25);noise(n,.05,'highpass',3000,1,.2);}else{tone(n,1800,.06,'square',.18);noise(n,.09,'highpass',2500,1,.5);tone(n,320,.15,'sine',.3,120);}},
 land(){if(!ac())return;const n=AC.currentTime;noise(n,.12,'lowpass',600,1,.35,200);},
 pop(){if(!ac())return;const n=AC.currentTime;tone(n,500,.18,'sine',.25,1100);noise(n,.06,'bandpass',2000,2,.2);},
 kick(){if(!ac())return;const n=AC.currentTime;tone(n,180,.12,'sine',.4,70);noise(n,.06,'lowpass',1200,1,.3);},
 boing(){if(!ac())return;const n=AC.currentTime;tone(n,220,.35,'sine',.3,660);tone(n+.08,330,.3,'triangle',.12,120);},
 clank(){if(!ac())return;const n=AC.currentTime;[1200,1830,2470].forEach((f,i)=>tone(n,f,.35-i*.08,'triangle',.12));},
 whoosh(){if(!ac())return;const n=AC.currentTime;noise(n,.5,'bandpass',500,.8,.3,1800);},
 flap(){if(!ac())return;const n=AC.currentTime;for(let i=0;i<3;i++)noise(n+i*.12,.08,'lowpass',700,1,.25,300);},
 motor(){if(!ac())return;const n=AC.currentTime;tone(n,90,1.0,'sawtooth',.08,110);},
 rumble(){if(!ac())return;const n=AC.currentTime;noise(n,1.0,'lowpass',180,.7,.6,60);},
 splash(){if(!ac())return;const n=AC.currentTime;noise(n,.7,'lowpass',2400,.6,.7,300);noise(n+.05,.3,'bandpass',3500,1,.25);},
 warp(){if(!ac())return;const n=AC.currentTime;tone(n,300,.8,'sine',.25,1800);tone(n+.1,450,.7,'triangle',.12,2400);},
 cup(){if(!ac())return;const n=AC.currentTime;tone(n,900,.09,'triangle',.3);tone(n+.11,700,.12,'triangle',.28);tone(n+.25,520,.25,'sine',.2);},
 clink(){if(!ac())return;const n=AC.currentTime;tone(n,2600,.25,'triangle',.25);tone(n,3900,.15,'sine',.15);},
 snap(){if(!ac())return;const n=AC.currentTime;noise(n,.08,'highpass',1800,1,.8);tone(n,260,.15,'square',.15,90);},
 bonk(){if(!ac())return;const n=AC.currentTime;tone(n,420,.18,'square',.25,160);noise(n,.08,'lowpass',900,1,.5);},
 caw(){if(!ac())return;const n=AC.currentTime;for(let i=0;i<2;i++){tone(n+i*.45,620,.3,'sawtooth',.08,420);noise(n+i*.45,.25,'bandpass',1200,3,.15);}},
 freeze(){if(!ac())return;const n=AC.currentTime;tone(n,140,1.6,'sine',.12,110);},
 ding(){if(!ac())return;const n=AC.currentTime;tone(n,1320,.4,'sine',.2);},
 fanfare(){if(!ac())return;const n=AC.currentTime;[523,659,784,1047].forEach((f,i)=>{tone(n+i*.12,f,.5,'square',.08);tone(n+i*.12,f,.5,'triangle',.14);});tone(n+.5,1047,1.2,'triangle',.18);tone(n+.5,784,1.2,'triangle',.12);},
 angry(){if(!ac())return;const n=AC.currentTime;tone(n,110,.5,'sawtooth',.18,90);tone(n+.05,165,.5,'square',.08,120);}
};
// 宣伝動画を作るときだけ、鳴った音を記録する
for(const k of Object.keys(SFX)){const f=SFX[k];SFX[k]=(...a)=>{if(window.__sfxLog)window.__sfxLog.push([k,performance.now(),a[0]]);return f(...a);};}
// 部長のMVの曲（自作の明るい曲。8小節を鳴らす）
let mvStop=null;
function mvMusic(){if(window.__sfxLog)window.__sfxLog.push(['mv',performance.now()]);if(!ac())return;const n=AC.currentTime+.05,b=60/132,mel=[523,659,784,659,880,784,659,587,523,587,659,784,880,988,1047,1047];
 const bass=[131,131,165,165,175,175,196,196];let on=true;
 for(let i=0;i<32;i++){const at=n+i*b/2;if(i%2===0)noise(at,.05,'highpass',6000,1,.12);if(i%4===0)tone(at,70,.18,'sine',.5,40);if(i%4===2)noise(at,.12,'bandpass',1800,1,.25);}
 for(let i=0;i<16;i++){const at=n+i*b;tone(at,mel[i],b*.9,'square',.06);tone(at,mel[i]*2,b*.4,'triangle',.05);}
 for(let i=0;i<8;i++){tone(n+i*b*2,bass[i],b*1.8,'triangle',.22);}
 mvStop=()=>{on=false;};}
