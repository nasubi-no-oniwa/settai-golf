// 接待ゴルフ：打った球の計算（ゲームと記録の確認で同じものを使う）
// 足す・引く・かける・わる・平方根だけで計算するので、どの端末でも同じ「入るまでの時間」になる
(function (root) {
  const V = 1;                    // 計算の版（理由の並びを変えるときは版を上げる）
  const G = 9.8;
  const CUP = { x: 0, z: -5 };    // カップ（打つ場所から5m先）
  const POND = { x: -7, z: -6, r: 3.5 };
  const BOSS = { x: 1.6, z: -5.7 };
  const TMIN = 10, TMAX = 60, K = 35;
  // 72方向（5度ずつ）。0 がカップの方向
  const DIR = [[0,-1],[0.087155743,-0.996194698],[0.173648178,-0.984807753],[0.258819045,-0.965925826],[0.342020143,-0.939692621],[0.422618262,-0.906307787],[0.5,-0.866025404],[0.573576436,-0.819152044],[0.64278761,-0.766044443],[0.707106781,-0.707106781],[0.766044443,-0.64278761],[0.819152044,-0.573576436],[0.866025404,-0.5],[0.906307787,-0.422618262],[0.939692621,-0.342020143],[0.965925826,-0.258819045],[0.984807753,-0.173648178],[0.996194698,-0.087155743],[1,0],[0.996194698,0.087155743],[0.984807753,0.173648178],[0.965925826,0.258819045],[0.939692621,0.342020143],[0.906307787,0.422618262],[0.866025404,0.5],[0.819152044,0.573576436],[0.766044443,0.64278761],[0.707106781,0.707106781],[0.64278761,0.766044443],[0.573576436,0.819152044],[0.5,0.866025404],[0.422618262,0.906307787],[0.342020143,0.939692621],[0.258819045,0.965925826],[0.173648178,0.984807753],[0.087155743,0.996194698],[0,1],[-0.087155743,0.996194698],[-0.173648178,0.984807753],[-0.258819045,0.965925826],[-0.342020143,0.939692621],[-0.422618262,0.906307787],[-0.5,0.866025404],[-0.573576436,0.819152044],[-0.64278761,0.766044443],[-0.707106781,0.707106781],[-0.766044443,0.64278761],[-0.819152044,0.573576436],[-0.866025404,0.5],[-0.906307787,0.422618262],[-0.939692621,0.342020143],[-0.965925826,0.258819045],[-0.984807753,0.173648178],[-0.996194698,0.087155743],[-1,0],[-0.996194698,-0.087155743],[-0.984807753,-0.173648178],[-0.965925826,-0.258819045],[-0.939692621,-0.342020143],[-0.906307787,-0.422618262],[-0.866025404,-0.5],[-0.819152044,-0.573576436],[-0.766044443,-0.64278761],[-0.707106781,-0.707106781],[-0.64278761,-0.766044443],[-0.573576436,-0.819152044],[-0.5,-0.866025404],[-0.422618262,-0.906307787],[-0.342020143,-0.939692621],[-0.258819045,-0.965925826],[-0.173648178,-0.984807753],[-0.087155743,-0.996194698]];
  // クラブ：[名前, 打ち出しの sin, cos, いちばん強いときの初速(m/s)]
  const CLUBS = [['putter', 0, 1, 9], ['wedge', 0.766044443, 0.64278761, 30], ['iron', 0.438371147, 0.898794046, 46], ['wood', 0.275637356, 0.961261696, 60], ['driver', 0.190808995, 0.981627183, 80]];
  const DECEL = 1.3;              // パターの転がりの止まりやすさ
  const LIP = 0.06;

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedOf(st) { return ((st % 4294967296) ^ 0x2c1b3c6d) >>> 0; }
  const dist = (ax, az, bx, bz) => { const dx = ax - bx, dz = az - bz; return Math.sqrt(dx * dx + dz * dz); };
  const num = (v, lo, hi, def) => (typeof v === 'number' && v >= lo && v <= hi) ? v : def;

  let R = [["k_caddie","kick","pn",{"p":{"c":"#f4f4f0","hat":"cap"}},{"spd":3},"キャディさんがこっそり蹴って入れた|しーっ","The caddie secretly kicked it in|Shh...","桿弟偷偷把球踢進去|噓～","캐디가 몰래 차서 넣었다|쉿"],
["k_kohai","kick","pn",{"p":{"c":"#3a5a8a","hat":"none"}},{"spd":4},"後輩がつま先でそっと押し込んだ|気を利かせました","Your junior nudged it in with his toe|Just helping!","後輩用腳尖輕輕推了進去|我是好意","후배가 발끝으로 살짝 밀어 넣었다|센스 있죠"],
["k_shiba","kick","pn",{"a":"dog","c":"#d08a40"},{"spd":3},"迷い込んだ柴犬が鼻で押して入れた|フンッ","A stray shiba nosed it in|Hmph","跑進來的柴犬用鼻子推進去|哼","길 잃은 시바견이 코로 밀어 넣었다|흥"],
["k_cat","kick","pn",{"a":"cat"},{"spd":2},"野良猫が前足でちょいちょい転がした|ニャ","A stray cat batted it in with its paw|Mew","野貓用前腳撥呀撥滾進去|喵","길고양이가 앞발로 톡톡 굴렸다|냥"],
["k_child","kick","pn",{"p":{"c":"#f0c020","hat":"cap","s":0.6}},{"spd":3},"迷子の子どもが「えいっ」と蹴り入れた|えいっ","A lost kid kicked it in|Hiyah!","迷路的小孩「嘿」一腳踢進去|嘿！","길 잃은 아이가 뻥 차 넣었다|에잇"],
["k_shacho","kick","pn",{"p":{"c":"#1d1d1d","hat":"top"}},{"spd":2},"通りがかった社長がうっかり蹴ってしまった|おっと","The company president kicked it by accident|Oops","路過的社長不小心踢到了|哎呀","지나가던 사장님이 실수로 차 버렸다|어이쿠"],
["k_keeper","kick","pn",{"p":{"c":"#3a7a3a","hat":"straw","prop":"rake"}},{"spd":2},"グリーンキーパーが芝をならすついでに押した|ならしときます","The greenkeeper raked it in while smoothing the grass|Just tidying","果嶺管理員整理草皮時順便推進去|順手整理","그린키퍼가 잔디 고르다가 밀어 넣었다|정리해 둘게요"],
["k_monkey","kick","pn",{"a":"monkey"},{"spd":4},"野生のサルが手で転がして入れた|キッ","A wild monkey rolled it in by hand|Ook!","野生猴子用手滾進去|吱","야생 원숭이가 손으로 굴려 넣었다|끽"],
["k_rabbit","kick","pn",{"a":"rabbit"},{"spd":5},"ウサギが跳ねたひょうしに当たった|ピョン","A hopping rabbit bumped it in|Boing","兔子一跳不小心碰進去|蹦","토끼가 뛰다가 툭 건드렸다|깡총"],
["k_squirrel","kick","pn",{"a":"squirrel"},{"spd":4},"リスがどんぐりと間違えて押し込んだ|カリカリ","A squirrel mistook it for an acorn|Nom nom","松鼠以為是橡實把它塞進去|喀喀","다람쥐가 도토리인 줄 알고 밀어 넣었다|오독오독"],
["k_tanuki","kick","pn",{"a":"tanuki"},{"spd":2},"タヌキがお腹で転がして入れた|ポンポコ","A tanuki rolled it in with its belly|Pon-poko","狸貓用肚子滾進去|咚咚","너구리가 배로 굴려 넣었다|퐁퐁"],
["k_soccer","kick","pn",{"p":{"c":"#2a7ad8","hat":"none","s":0.75}},{"spd":5},"サッカー少年がトラップして流し込んだ|ゴール！","A soccer kid trapped it and slotted it in|GOAL!","足球少年停球後推射進去|進球！","축구 소년이 트래핑해서 밀어 넣었다|골!"],
["k_secretary","kick","pn",{"p":{"c":"#c83a6a","hat":"bun"}},{"spd":2},"部長の秘書がヒールで軽く小突いた|失礼しました","The boss's secretary tapped it in with her heel|Pardon me","部長的秘書用高跟鞋輕輕一碰|失禮了","부장님 비서가 구두 굽으로 톡 건드렸다|실례했습니다"],
["k_grandpa","kick","pn",{"p":{"c":"#8a7a5a","hat":"straw","prop":"stick"}},{"spd":1},"散歩中のおじいさんの杖が当たった|ほっほっ","A strolling grandpa's cane tapped it in|Ho ho","散步的阿公拐杖碰到了|呵呵","산책하던 할아버지 지팡이에 맞았다|허허"],
["k_marshal","kick","pn",{"p":{"c":"#1d2a5a","hat":"cap","prop":"flag"}},{"spd":3},"コースの見回り係が「危ないですよ」と押した|危ないですよ","The course marshal pushed it aside — into the cup|Careful now","球場巡邏員說「危險喔」推了一下|危險喔","코스 순찰원이 위험하다며 밀었다|위험해요"],
["k_obachan","kick","pn",{"p":{"c":"#e88a3a","hat":"band","prop":"broom"}},{"spd":2},"売店のおばちゃんがほうきで掃き入れた|はいはい","The snack-bar lady swept it in|There we go","販賣部阿姨用掃把掃進去|好啦好啦","매점 아주머니가 빗자루로 쓸어 넣었다|네네"],
["k_fox","kick","pn",{"a":"fox"},{"spd":5},"キツネがしっぽでぺしっと払った|コン","A fox flicked it in with its tail|Kon!","狐狸用尾巴一甩撥進去|嗯","여우가 꼬리로 툭 쳤다|콘"],
["k_goat","kick","pn",{"a":"goat"},{"spd":2},"ヤギが草と一緒に鼻で押した|メェ","A goat nosed it in along with some grass|Maa","山羊連草一起用鼻子推進去|咩","염소가 풀이랑 같이 코로 밀었다|음매"],
["k_capybara","kick","pn",{"a":"capybara"},{"spd":1},"カピバラがのんびり歩いて蹴っていった|……","A capybara strolled by and kicked it in|......","水豚慢悠悠走過踢了進去|……","카피바라가 느긋하게 걷다가 찼다|……"],
["k_boar","kick","pn",{"a":"boar"},{"spd":6},"イノシシが突進して転がしていった|ブヒッ","A charging boar knocked it in|Snort!","山豬衝過來把它撞進去|齁","멧돼지가 돌진하며 굴리고 갔다|꿀꿀"],
["k_photo","kick","pn",{"p":{"c":"#5a5a60","hat":"cap"}},{"spd":2},"記念撮影のカメラマンが後ずさりして蹴った|もう一歩下がって","The photographer backed up and kicked it in|One step back...","拍紀念照的攝影師後退時踢到|再退一步","기념 촬영 사진사가 뒷걸음질하다 찼다|한 발 뒤로"],
["k_radio","kick","pn",{"p":{"c":"#f2f2f2","hat":"band"}},{"spd":3},"ラジオ体操中の人の足が当たった|いち、に","Someone doing morning exercises kicked it in|One, two","做早操的人腳碰到了|一、二","국민체조 하던 사람 발에 맞았다|하나, 둘"],
["k_newbie","kick","pn",{"p":{"c":"#2f2f35","hat":"none"}},{"spd":5},"新入社員が「拾います！」と走ってきて蹴った|拾いま…あっ","A new hire ran to pick it up and kicked it in|I'll get it — oops","新進員工說「我來撿」結果踢進去|我來…啊","신입사원이 줍겠다며 뛰어오다 찼다|제가 줍…앗"],
["k_ballet","kick","pn",{"p":{"c":"#f2c0d0","hat":"bun"}},{"spd":3},"通りがかったバレリーナのつま先が触れた|アン・ドゥ","A passing ballerina tapped it with her toe|Un, deux","路過的芭蕾舞者腳尖碰到|一、二","지나가던 발레리나 발끝에 닿았다|앙, 되"],
["k_bear","kick","pn",{"a":"bear","s":0.6},{"spd":3},"子グマがじゃれて転がした|クマッ","A bear cub played with it and rolled it in|Grr!","小熊玩著玩著滾進去|熊！","아기곰이 장난치다 굴렸다|곰!"],
["b_trip","boss","pn",{},{"mode":"trip"},"部長がつまずいて蹴ってしまった|おっとっと","The boss tripped and kicked it in|Whoa whoa","部長絆倒踢進去了|哎呀呀","부장님이 넘어지면서 차 버렸다|어이쿠"],
["b_sneeze","boss","pn",{},{"mode":"sneeze"},"部長のくしゃみの風で転がった|ハックション","The boss sneezed and blew it in|ACHOO!","部長打噴嚏的風把它吹進去|哈啾","부장님 재채기 바람에 굴러갔다|에취"],
["b_swing","boss","pnm",{},{"mode":"swing"},"部長の素振りがボールに当たった|あっ","The boss's practice swing hit it in|Ah","部長練習揮桿打到球|啊","부장님 연습 스윙에 공이 맞았다|앗"],
["b_shoe","boss","pn",{},{"mode":"shoe"},"部長の脱げた靴が当たって押し込んだ|靴が！","The boss's flying shoe knocked it in|My shoe!","部長飛掉的鞋子把球撞進去|我的鞋！","부장님 벗겨진 신발이 밀어 넣었다|신발이!"],
["b_head","boss","pnm",{},{"mode":"head"},"跳ねたボールが部長の頭に当たって入った|イテッ","It bounced off the boss's head and in|Ow!","彈起的球打到部長的頭進洞|好痛","튄 공이 부장님 머리 맞고 들어갔다|아얏"],
["b_belly","boss","nm",{},{"mode":"head"},"部長の出っぱったお腹で跳ね返った|ぼよん","It bounced off the boss's round belly|Boing","被部長的大肚子彈回來|啵～","부장님 나온 배에 튕겨 나왔다|뽀용"],
["b_marker","boss","p",{},{"mode":"trip"},"部長がマークしようとして押し込んだ|あれ？","The boss tried to mark it and pushed it in|Huh?","部長想做記號卻推進去了|咦？","부장님이 마크하려다 밀어 넣었다|어라?"],
["b_tee","boss","pn",{},{"mode":"swing"},"部長がティーを拾うとき指ではじいた|ん？","The boss flicked it while picking up his tee|Hm?","部長撿球座時手指彈到|嗯？","부장님이 티를 줍다가 손가락으로 튕겼다|응?"],
["b_read","boss","pn",{},{"mode":"trip"},"部長がラインを読もうとしゃがんで押した|読めた","The boss crouched to read the line and nudged it|I see it now","部長蹲下看線時推到了|看懂了","부장님이 라인 읽으려다 밀었다|읽었다"],
["b_shout","boss","pn",{},{"mode":"sneeze"},"部長の「入るな！」の大声で転がった|入るなー！","The boss yelled 'Don't go in!' and it rolled in|DON'T!","部長大喊「別進！」球就滾進去|別進～！","부장님의 들어가지 마! 고함에 굴러갔다|들어가지 마!"],
["b_dance","boss","pn",{},{"mode":"shoe"},"部長の喜びの小躍りで地面が揺れた|フフフ","The boss's victory dance shook the ground|Heh heh","部長高興跳舞讓地面搖晃|呵呵呵","부장님 기쁨의 춤에 땅이 흔들렸다|후후후"],
["b_glove","boss","pnm",{},{"mode":"swing"},"部長が投げたグローブが当たった|暑いな","The boss tossed his glove and hit it in|So hot","部長丟出的手套打到球|好熱啊","부장님이 던진 장갑에 맞았다|덥구먼"],
["b_phone","boss","pn",{},{"mode":"sneeze"},"部長の着信の振動で転がった|はい、部長です","The boss's phone buzzed and it rolled in|Hello, boss here","部長來電的震動讓球滾進去|喂，我部長","부장님 전화 진동에 굴러갔다|네, 부장입니다"],
["b_foot","boss","pnm",{},{"mode":"shoe"},"部長が「こっちだ」と足で寄せてしまった|あっ、つい","The boss nudged it over with his foot by habit|Oops, habit","部長說「這邊」順腳一撥|啊，順腳","부장님이 이쪽이라며 발로 끌어 버렸다|앗, 그만"],
["b_parasol","boss","pn",{},{"mode":"swing"},"部長の日傘の先が当たった|日差しがな","The tip of the boss's parasol tapped it in|Strong sun","部長陽傘的尖端碰到|太陽好大","부장님 양산 끝에 맞았다|햇볕이 세서"],
["c_keeper","cupmove","pnm",{"p":{"c":"#3a7a3a","hat":"straw","prop":"rake"}},{"spd":1.5},"グリーンキーパーがカップを掘り直した|ここですね","The greenkeeper re-cut the hole under the ball|Right here","果嶺管理員重新挖洞|就這裡吧","그린키퍼가 홀컵을 다시 팠다|여기죠"],
["c_mole","cupmove","pnm",{"a":"mole"},{"spd":1},"モグラがカップごと引っ越してきた|モグッ","A mole moved in — cup and all|Mog!","鼴鼠連洞帶杯搬過來|咕","두더지가 홀컵째 이사 왔다|두둥"],
["c_legs","cupmove","pn",{"o":"none"},{"spd":0.8},"カップに足が生えて歩いてきた|てくてく","The cup grew legs and walked over|Tip-tap","球洞長出腳走過來|噠噠","홀컵에 다리가 나서 걸어왔다|타박타박"],
["c_meeting","cupmove","pnm",{"p":{"c":"#2a3a5a","hat":"none"}},{"spd":1},"会議でカップの移設が決まった|満場一致です","A meeting voted to move the cup|Unanimous","開會決議移動球洞|全員通過","회의에서 홀컵 이전이 결정됐다|만장일치입니다"],
["c_kohai","cupmove","pn",{"p":{"c":"#3a5a8a","hat":"none"}},{"spd":2},"後輩が「こちらの方が良いかと」とカップを動かした|ご提案です","Your junior moved the cup 'to a better spot'|Just a suggestion","後輩說「這邊比較好」移動球洞|小小提案","후배가 이쪽이 낫다며 홀컵을 옮겼다|제안입니다"],
["c_sink","cupmove","pnm",{"o":"none"},{"spd":0.6},"地盤沈下でカップの方がずれてきた|ズズズ","Ground subsidence slid the cup over|Rrrumble","地層下陷讓球洞滑了過來|嘎嘎嘎","지반 침하로 홀컵이 밀려왔다|스르르"],
["c_shacho","cupmove","pnm",{"p":{"c":"#1d1d1d","hat":"top"}},{"spd":1.2},"社長が「ここをカップにしよう」と決めた|鶴の一声","The president declared 'the hole is here now'|Final word","社長一句「洞就在這」|一錘定音","사장님이 여기를 홀컵으로 하자고 했다|사장님 말씀"],
["c_designer","cupmove","pnm",{"p":{"c":"#e8e8e0","hat":"cap"}},{"spd":1.5},"コース設計士がその場で設計を変えた|ひらめいた","The course designer redesigned the hole on the spot|Inspiration!","球場設計師當場改設計|靈光一閃","코스 설계자가 그 자리에서 설계를 바꿨다|번뜩였다"],
["c_turtle","cupmove","pn",{"a":"turtle"},{"spd":0.5},"カメが背中にカップを乗せて来た|……","A turtle carried the cup over on its back|......","烏龜把球洞背了過來|……","거북이가 홀컵을 등에 업고 왔다|……"],
["c_magnet","cupmove","pn",{"o":"none"},{"spd":3},"カップが磁石のように吸い寄せられた|ヒュン","The cup was pulled over like a magnet|Fwip","球洞像磁鐵一樣被吸過來|咻","홀컵이 자석처럼 끌려왔다|휙"],
["c_robot","cupmove","pnm",{"v":"robot"},{"spd":1.2},"芝刈りロボがカップを運んできた|ピピッ","A mowing robot carried the cup over|Beep boop","割草機器人把球洞搬過來|嗶嗶","잔디 깎는 로봇이 홀컵을 옮겨 왔다|삐빅"],
["c_dog","cupmove","pn",{"a":"dog"},{"spd":2},"犬が掘った穴が新しいカップになった|ワンッ","A dog dug a hole that became the new cup|Woof!","狗挖的洞變成新的球洞|汪！","개가 판 구멍이 새 홀컵이 됐다|멍!"],
["c_grandma","cupmove","pn",{"p":{"c":"#b88a6a","hat":"band","prop":"broom"}},{"spd":0.8},"掃除のおばあちゃんが穴ごとほうきで寄せた|よっこいしょ","The cleaning grandma swept the whole hole over|Hup","打掃的阿嬤連洞一起掃過來|嘿咻","청소 할머니가 구멍째 쓸어 왔다|영차"],
["c_ninja","cupmove","pnm",{"p":{"c":"#1a1a22","hat":"band","hc":"#1a1a22"}},{"spd":4},"忍者がカップをすり替えた|ニンニン","A ninja swapped the cup's location|Nin nin","忍者偷偷調換了球洞|忍忍","닌자가 홀컵을 바꿔치기했다|닌닌"],
["c_delivery","cupmove","pnm",{"p":{"c":"#2a6a3a","hat":"cap"}},{"spd":2},"業者が「カップのお届けです」と置いていった|お届けです","A courier dropped off 'one golf cup'|Delivery!","業者說「球洞送到了」放下就走|送到了","업자가 홀컵 배달이라며 두고 갔다|배달입니다"],
["r_fan","roll","pnm",{"o":"fan"},{"spd":1.5,"curve":0.5},"巨大扇風機の風で転がった|ブォー","A giant fan blew it in|WHOOSH","被巨大電風扇吹進去|呼——","거대 선풍기 바람에 굴러갔다|부웅"],
["r_quake","roll","pnm",{"o":"none"},{"spd":1,"curve":-0.8},"突然の地震で転がった|ゴゴゴ","A sudden earthquake rolled it in|RUMBLE","突然地震滾進去了|轟轟轟","갑자기 지진이 나서 굴러갔다|우르르"],
["r_slope","roll","pnm",{"o":"none"},{"spd":2,"curve":0.3},"グリーンが急に傾いた|ギギギ","The green suddenly tilted|Creak","果嶺突然傾斜|嘎嘎嘎","그린이 갑자기 기울었다|끼익"],
["r_magnet","roll","pnm",{"o":"magnet"},{"spd":2.5,"curve":0},"カップの下の磁石に吸い寄せられた|カチッ","A magnet under the cup pulled it in|CLICK","被洞底的磁鐵吸過去|喀","홀컵 밑 자석에 끌려갔다|딸깍"],
["r_wind","roll","pnm",{"o":"none"},{"spd":3,"curve":0.9},"突風にあおられて転がった|ビュー","A gust of wind rolled it in|Fwoosh","被一陣強風吹進去|咻——","돌풍에 휩쓸려 굴러갔다|휘잉"],
["r_whirl","roll","pnm",{"o":"whirl"},{"spd":1.5,"curve":-1},"つむじ風に巻かれて運ばれた|ヒュルル","A dust devil swirled it in|Whirrr","被旋風捲著帶進去|咻嚕嚕","회오리바람에 휘말려 갔다|휘리릭"],
["r_sigh","roll","pnm",{"o":"none"},{"spd":0.8,"curve":0.2},"全員のため息の風で転がった|はぁ…","Everyone's sigh blew it in|Sigh...","大家的嘆氣把它吹進去|唉…","모두의 한숨 바람에 굴러갔다|하아…"],
["r_coriolis","roll","pnm",{"o":"none"},{"spd":0.5,"curve":0.6},"地球の自転で少しずつ寄っていった|コリオリ","The Earth's rotation slowly nudged it in|Coriolis","地球自轉讓它慢慢靠過去|科氏力","지구 자전으로 조금씩 다가갔다|코리올리"],
["r_dew","roll","pnm",{"o":"none"},{"spd":3,"curve":-0.4},"朝露ですべるように転がった|つるん","Morning dew made it slide right in|Sliiide","晨露讓它滑進去|咻溜","아침 이슬에 미끄러지듯 굴러갔다|주르륵"],
["r_ants","roll","pn",{"o":"none"},{"spd":0.5,"curve":0.5},"アリの行列に運ばれていった|ワッショイ","A line of ants carried it in|Heave-ho","被螞蟻大軍搬進去|嘿咻嘿咻","개미 행렬이 옮겨 갔다|영차영차"],
["r_nice","roll","pnm",{"o":"none"},{"spd":1.2,"curve":0.3},"社員一同の「ナイス〜」の声で転がった|ナイス〜","Everyone's 'Nice~!' made it roll in|Niiice~","全體員工喊「好球～」讓它滾進去|好球～","직원 일동의 나이스~ 소리에 굴러갔다|나이스~"],
["r_blower","roll","pnm",{"o":"fan","c":"#f2c040"},{"spd":2,"curve":0.4},"芝を乾かす送風機の風で転がった|乾かしまーす","A blower drying the grass pushed it in|Drying!","吹乾草皮的送風機把它吹進去|吹乾囉","잔디 말리는 송풍기 바람에 굴러갔다|말립니다"],
["r_construction","roll","pnm",{"o":"none"},{"spd":1,"curve":-0.6},"近くの工事の振動で転がった|ドドドド","Vibrations from nearby construction rolled it in|Dun-dun-dun","附近施工的震動讓它滾進去|咚咚咚","근처 공사 진동에 굴러갔다|두두두"],
["r_grain","roll","pnm",{"o":"none"},{"spd":1.8,"curve":0.8},"芝目が全部カップを向いていた|芝目です","Every blade of grass pointed at the cup|It's the grain","草紋全都朝向球洞|是草紋","잔디 결이 전부 홀컵을 향해 있었다|잔디 결이에요"],
["r_haze","roll","pnm",{"o":"none"},{"spd":0.7,"curve":-0.9},"かげろうで地面がゆらいだ|ゆらゆら","Heat haze made the ground wobble|Wobble","熱氣讓地面晃動|晃呀晃","아지랑이에 땅이 일렁였다|일렁일렁"],
["r_rotor","roll","pnm",{"o":"none"},{"spd":2.5,"curve":0.7},"上空のヘリの風で転がった|バラバラ","Downwash from a helicopter rolled it in|Whup-whup","上空直升機的風把它吹進去|噠噠噠","상공 헬기 바람에 굴러갔다|두두두"],
["r_necklace","roll","pnm",{"o":"magnet","c":"#d0d0d0"},{"spd":1.5,"curve":-0.2},"部長の磁気ネックレスに引き寄せられた|健康のためだ","The boss's magnetic necklace pulled it in|It's for my health","被部長的磁力項鍊吸過去|為了健康","부장님 자석 목걸이에 끌려갔다|건강 때문이야"],
["r_drum","roll","pnm",{"o":"none"},{"spd":1,"curve":0.5},"応援団の太鼓の振動で転がった|ドン！ドン！","The cheer squad's drums shook it in|BOOM BOOM","啦啦隊的大鼓震動讓它滾進去|咚！咚！","응원단 북 진동에 굴러갔다|둥! 둥!"],
["r_sensu","roll","pn",{"o":"fan","c":"#f6f6f6"},{"spd":0.8,"curve":0.2},"秘書があおいだ扇子の風で転がった|お暑いですね","The secretary's folding fan breeze rolled it in|So warm today","秘書搧的扇子風把它吹進去|好熱喔","비서가 부친 부채 바람에 굴러갔다|덥네요"],
["r_setup","roll","pnm",{"o":"none"},{"spd":2,"curve":0},"グリーンが接待用に傾けてあった|仕様です","The green was tilted for business golf|By design","果嶺為了接待特地做成傾斜|規格如此","그린이 접대용으로 기울어져 있었다|사양입니다"],
["e_mole","erupt","pnmf",{"a":"mole"},{"delay":1},"モグラに押し上げられた|モグッ","A mole pushed it up|Mog!","被鼴鼠頂上來|咕","두더지가 밀어 올렸다|두둥"],
["e_onsen","erupt","pnmf",{"o":"geyser"},{"delay":1.2},"地面から温泉が湧いた|ゴボゴボ","A hot spring burst out of the ground|Glug glug","地面冒出溫泉|咕嘟咕嘟","땅에서 온천이 솟았다|보글보글"],
["e_sprinkler","erupt","pnm",{"o":"sprinkler"},{"delay":0.8},"スプリンクラーの水ではね上がった|シャー","A sprinkler shot it up|Fssh","被灑水器的水沖上天|唰——","스프링클러 물에 튀어 올랐다|쏴아"],
["e_spring","erupt","pnmf",{"o":"spring"},{"delay":0.6},"地面に埋まっていたバネではねた|ビヨーン","A buried spring launched it|BOYOING","埋在地裡的彈簧把它彈起來|啵嚶～","땅에 묻힌 스프링에 튀었다|뾰옹"],
["e_pipe","erupt","pnmf",{"o":"pipe"},{"delay":1},"地面から土管が出てきて吹き出した|ポーン","A pipe popped out of the ground and shot it out|Pwoom","地面冒出水管把它噴出來|啵","땅에서 토관이 나와 뿜어냈다|뿅"],
["e_frog","erupt","pnm",{"a":"frog"},{"delay":0.7},"カエルが下から跳ね上げた|ケロッ","A frog bounced it up from below|Ribbit","青蛙從下面把它頂起來|呱","개구리가 밑에서 튕겨 올렸다|개굴"],
["e_snake","erupt","pnm",{"a":"snake"},{"delay":0.9},"ヘビが下からしっぽではじいた|シャー","A snake flicked it up with its tail|Hsss","蛇從下面用尾巴彈起來|嘶——","뱀이 밑에서 꼬리로 튕겼다|쉬익"],
["e_oil","erupt","pnmf",{"o":"geyser","c":"#2a2a2a"},{"delay":1.5},"石油が湧いて吹き上げられた|社長に報告だ","Oil struck and blasted it up|Call the CEO!","挖到石油把它噴上天|快報告社長","석유가 솟아 뿜어 올렸다|사장님께 보고다"],
["e_bamboo","erupt","pnm",{"o":"pole","c":"#6a9a3a"},{"delay":0.8},"タケノコが急に伸びて持ち上げた|ニョキッ","A bamboo shoot shot up and lifted it|Sproing","竹筍突然長高把它舉起來|咻","죽순이 갑자기 자라서 들어 올렸다|쑥"],
["e_mole_family","erupt","pnmf",{"a":"mole","s":1.4},{"delay":1.4},"モグラの一家が総出で押し上げた|せーの","A whole mole family pushed it up together|One, two, heave!","鼴鼠一家合力把它頂上來|一、二","두더지 가족이 총출동해 밀어 올렸다|하나 둘"],
["e_waterpipe","erupt","pnmf",{"o":"geyser","c":"#9ad8ff"},{"delay":0.6},"水道管が破裂して吹き飛ばされた|ブシャー","A burst water main blasted it away|SPLOOSH","水管破裂把它沖飛|噗嘶——","수도관이 터져 날아갔다|푸쉬익"],
["e_mushroom","erupt","pnm",{"o":"spring","c":"#d8352a"},{"delay":1},"地面から巨大キノコが生えて弾いた|ぼいん","A giant mushroom sprouted and bounced it|Boing","地面長出巨大香菇把它彈起|啵～","땅에서 거대 버섯이 자라 튕겼다|뽀잉"],
["e_source","erupt","pnmf",{"o":"geyser","c":"#e8f4ff"},{"delay":2},"地下の源泉が「ここだ」と噴き出した|ここ掘れ","An underground spring gushed up right there|Dig here","地下的源泉在這裡噴出來|挖這裡","지하 원천이 여기다 하고 뿜어냈다|여기 파"],
["e_turtle","erupt","pnm",{"a":"turtle"},{"delay":1.6},"冬眠中のカメが起きて押し上げた|ふわぁ","A hibernating turtle woke up and pushed it up|Yawn","冬眠的烏龜醒來把它頂上來|呵欠","겨울잠 자던 거북이가 깨서 밀어 올렸다|하암"],
["e_misfire","erupt","pnmf",{"o":"sprinkler","c":"#4a4a4a"},{"delay":0.5},"誤作動したスプリンクラーに打ち上げられた|ピピッ","A malfunctioning sprinkler launched it|Beep beep","故障的灑水器把它打上天|嗶嗶","오작동한 스프링클러에 쏘아 올려졌다|삐빅"],
["e_burrow","erupt","pnm",{"a":"rabbit"},{"delay":0.9},"ウサギの巣穴から突き上げられた|ピョン","It got bumped up out of a rabbit burrow|Hop!","從兔子洞裡被頂上來|蹦","토끼굴에서 튕겨 올라왔다|깡총"],
["e_vent","erupt","pnmf",{"o":"pipe","c":"#8a8a8a"},{"delay":1.2},"地下の換気口の風で吹き上がった|ゴオォ","Air from an underground vent blew it up|Whooo","地下通風口的風把它吹上去|呼——","지하 환기구 바람에 날아올랐다|우우웅"],
["e_fountain","erupt","pnmf",{"o":"geyser","c":"#bfe8ff"},{"delay":1},"噴水の試運転で水が噴き出した|試運転です","A fountain test run shot it up|Just testing","噴水試運轉把它噴上去|試運轉中","분수 시운전으로 물이 솟았다|시운전입니다"],
["e_volcano","erupt","pnmf",{"o":"geyser","c":"#e85a2a"},{"delay":2},"小さな火山ができて噴火した|ドカン","A tiny volcano formed and erupted|KABOOM","冒出小火山爆發了|轟","작은 화산이 생겨 분화했다|쾅"],
["e_tanuki","erupt","pnm",{"a":"tanuki"},{"delay":1.1},"タヌキが下から腹つづみで突き上げた|ポンッ","A tanuki drummed it up from below|Pon!","狸貓從下面用肚子頂上來|咚！","너구리가 밑에서 배로 튕겨 올렸다|퐁!"],
["w_carp","water","w",{"a":"carp"},{"delay":1.2},"池の鯉に投げ返された|ピチッ","A pond carp flipped it back|Splish","被池裡的鯉魚丟回來|啪","연못 잉어가 던져 돌려보냈다|퐁"],
["w_turtle","water","w",{"a":"turtle"},{"delay":2},"池のカメが甲羅で押し上げて弾いた|……","A pond turtle popped it up with its shell|......","池裡的烏龜用殼頂起來彈出去|……","연못 거북이가 등딱지로 밀어 튕겼다|……"],
["w_frog","water","w",{"a":"frog"},{"delay":1},"池のカエルが投げ返した|ケロケロ","A pond frog threw it back|Ribbit ribbit","池裡的青蛙丟回來|呱呱","연못 개구리가 던져 돌려보냈다|개굴개굴"],
["w_diver","water","w",{"p":{"c":"#2a2a2a","hat":"helmet","hc":"#f0c020"}},{"delay":1.8},"池掃除のダイバーが投げ返した|拾いました","A diver cleaning the pond threw it back|Found it","清池塘的潛水員丟回來|撿到了","연못 청소 잠수부가 던져 돌려보냈다|주웠습니다"],
["w_duck","water","w",{"a":"duck"},{"delay":0.8},"カモがくちばしで放り投げた|クワッ","A duck flung it out with its bill|Quack!","野鴨用嘴把它甩出去|呱！","오리가 부리로 던져 버렸다|꽥"],
["ca_crow","carry","mfxb",{"a":"crow"},{"spd":14,"mv":"fly"},"カラスにくわえて運ばれ、カップに落とされた|カァー","A crow carried it off and dropped it in the cup|Caw!","被烏鴉叼走，丟進了洞裡|嘎——","까마귀가 물고 가서 홀컵에 떨어뜨렸다|까악"],
["ca_cart","carry","mfxb",{"v":"cart"},{"spd":8,"mv":"drive"},"カートの係の人が拾って届けてくれた|お届けです","A cart attendant picked it up and delivered it|Delivery!","球車人員撿起來送回來|送到了","카트 담당자가 주워서 가져다줬다|배달입니다"],
["ca_dog","carry","nmfb",{"a":"dog"},{"spd":5,"mv":"run"},"犬がくわえて持ってきた|ワン","A dog fetched it|Woof","狗叼回來了|汪","개가 물어 왔다|멍"],
["ca_kohai","carry","nmf",{"p":{"c":"#3a5a8a","hat":"none"}},{"spd":4,"mv":"run"},"後輩が全力で走って拾ってきた|ハァハァ","Your junior sprinted to fetch it|Pant pant","後輩全力衝去撿回來|呼呼","후배가 전력으로 달려가 주워 왔다|헉헉"],
["ca_tortoise","carry","nm",{"a":"turtle"},{"spd":0.8,"mv":"crawl"},"カメが甲羅に乗せてゆっくり運んだ|……","A tortoise slowly carried it on its shell|......","烏龜把它背在殼上慢慢搬|……","거북이가 등딱지에 얹어 천천히 옮겼다|……"],
["ca_eagle","carry","fxb",{"a":"eagle"},{"spd":18,"mv":"fly"},"ワシにさらわれてカップに落とされた|ピーッ","An eagle snatched it and dropped it in the cup|SCREECH","被老鷹抓走丟進洞裡|嗶——","독수리가 낚아채 홀컵에 떨어뜨렸다|삐익"],
["ca_drone","carry","mfx",{"v":"drone"},{"spd":12,"mv":"fly"},"配送ドローンに運ばれてきた|配達完了","A delivery drone brought it back|Delivered","被送貨無人機送回來|送達完畢","배송 드론이 날라 왔다|배달 완료"],
["ca_mower","carry","nmf",{"v":"mower"},{"spd":3,"mv":"drive"},"芝刈り機の人がついでに拾ってきた|ついでです","The mower guy grabbed it on the way|While I'm here","割草機大叔順便撿回來|順便啦","잔디 깎던 아저씨가 김에 주워 왔다|김에요"],
["ca_truck","carry","fxb",{"v":"truck","c":"#3a6ab8"},{"spd":15,"mv":"drive"},"宅配便のトラックが届けてくれた|ハンコください","A delivery truck brought it back|Sign here, please","宅配卡車送回來了|請蓋章","택배 트럭이 가져다줬다|도장 부탁해요"],
["ca_deer","carry","mf",{"a":"deer"},{"spd":3,"mv":"walk"},"鹿がくわえて歩いてきた|キュイ","A deer walked it back in its mouth|Mew!","鹿叼著走回來|啾","사슴이 물고 걸어왔다|끼잉"],
["ca_ostrich","carry","fx",{"a":"ostrich"},{"spd":12,"mv":"run"},"ダチョウが拾って全力で走ってきた|ドドドド","An ostrich grabbed it and sprinted back|Thud thud thud","鴕鳥撿起來全力衝回來|咚咚咚","타조가 주워서 전력으로 달려왔다|두두두"],
["ca_kangaroo","carry","fxb",{"a":"kangaroo"},{"spd":9,"mv":"hop"},"カンガルーがお腹の袋に入れて運んだ|ピョーン","A kangaroo carried it back in its pouch|Boing boing","袋鼠把它放進育兒袋帶回來|蹦～","캥거루가 배 주머니에 넣어 옮겼다|껑충"],
["ca_secretary","carry","nm",{"p":{"c":"#c83a6a","hat":"bun"}},{"spd":2,"mv":"walk"},"部長の秘書が拾ってそっと置いた|どうぞ","The boss's secretary picked it up and placed it in|Here you go","部長的秘書撿起來輕輕放進去|請","부장님 비서가 주워서 살며시 넣었다|여기요"],
["ca_sales","carry","mfxb",{"p":{"c":"#2a3a5a","hat":"none"}},{"spd":7,"mv":"run"},"営業部が総出で拾いに走った|営業です","The whole sales team ran to retrieve it|Sales dept!","業務部全員衝去撿|業務部的","영업부가 총출동해 주우러 달렸다|영업부입니다"],
["ca_copbike","carry","mfxb",{"v":"bike"},{"spd":10,"mv":"drive"},"自転車のおまわりさんが届けてくれた|落とし物です","A cop on a bicycle returned it|Lost and found","騎腳踏車的警察送回來|這是失物","자전거 탄 경찰관이 가져다줬다|분실물입니다"],
["ca_horse","carry","fx",{"a":"horse"},{"spd":16,"mv":"run"},"馬がくわえて駆けてきた|ヒヒーン","A horse galloped back with it|NEIGH","馬叼著跑回來|嘶～","말이 물고 달려왔다|히히힝"],
["ca_robot","carry","nmf",{"v":"robot"},{"spd":2,"mv":"walk"},"回収ロボットに回収された|カイシュウシマス","A collection robot collected it|COLLECTING","被回收機器人回收|回收中","회수 로봇이 회수했다|회수합니다"],
["ca_pigeon","carry","nmf",{"a":"pigeon"},{"spd":9,"mv":"fly"},"伝書バトが運んできた|クルックー","A carrier pigeon delivered it|Coo coo","信鴿把它送回來|咕咕","전서구가 날라 왔다|구구"],
["ca_monkey","carry","nmf",{"a":"monkey"},{"spd":6,"mv":"run"},"サルが拾って走ってきた|キキッ","A monkey grabbed it and ran back|Eek eek","猴子撿起來跑回來|吱吱","원숭이가 주워서 달려왔다|끽끽"],
["ca_cow","carry","nm",{"a":"cow"},{"spd":1.5,"mv":"walk"},"牛がのんびり運んできた|モー","A cow slowly brought it back|Moo","牛慢吞吞地送回來|哞","소가 느긋하게 가져왔다|음매"],
["ca_shacho_cart","carry","fx",{"v":"cart","c":"#1d1d1d"},{"spd":12,"mv":"drive"},"社長の専用カートが拾ってきた|乗りたまえ","The president's private cart fetched it|Hop in","社長的專用球車撿回來|上車吧","사장님 전용 카트가 주워 왔다|타게나"],
["ca_pelican","carry","mfx",{"a":"pelican"},{"spd":10,"mv":"fly"},"ペリカンがくちばしに入れて運んだ|ガボッ","A pelican carried it in its beak|Gulp","鵜鶘把它含在嘴裡運回來|咕嘟","펠리컨이 부리에 넣어 옮겼다|꿀꺽"],
["ca_penguin","carry","nm",{"a":"penguin"},{"spd":1,"mv":"walk"},"ペンギンがよちよち運んできた|ペタペタ","A penguin waddled it back|Pat pat","企鵝搖搖擺擺搬回來|啪噠啪噠","펭귄이 뒤뚱뒤뚱 옮겨 왔다|뒤뚱뒤뚱"],
["ca_rescue","carry","xb",{"v":"heli","c":"#e8352a"},{"spd":25,"mv":"fly"},"救助ヘリにつり上げられて運ばれた|救助しました","A rescue helicopter hoisted it back|Rescued!","被救難直升機吊起來運回來|救援成功","구조 헬기가 끌어올려 옮겼다|구조했습니다"],
["ca_rabbit","carry","nm",{"a":"rabbit"},{"spd":5,"mv":"hop"},"ウサギがくわえて跳ねてきた|ピョン","A rabbit hopped back with it|Hop hop","兔子叼著跳回來|蹦蹦","토끼가 물고 깡충 뛰어왔다|깡총"],
["ca_bear","carry","mf",{"a":"bear"},{"spd":3,"mv":"walk"},"クマが拾って届けてくれた|……","A bear picked it up and returned it|......","熊撿起來送回來|……","곰이 주워서 가져다줬다|……"],
["ca_kid","carry","nm",{"p":{"c":"#f0c020","hat":"cap","s":0.6}},{"spd":3,"mv":"run"},"近所の子どもが「落ちてたよ」と持ってきた|落ちてたよ","A neighborhood kid brought it back|You dropped this","附近的小孩說「掉了喔」拿回來|你掉的","동네 아이가 떨어져 있었다며 가져왔다|떨어져 있었어요"],
["ca_scout","carry","mfb",{"p":{"c":"#8a7a3a","hat":"straw"}},{"spd":4,"mv":"walk"},"ボーイスカウトが一日一善で届けた|一日一善","A boy scout returned it as his good deed|One good deed","童軍日行一善送回來|日行一善","보이스카우트가 하루 한 번 선행으로 가져왔다|일일일선"],
["ca_fox","carry","mf",{"a":"fox"},{"spd":7,"mv":"run"},"キツネがくわえて走ってきた|コンコン","A fox ran back with it in its mouth|Kon kon","狐狸叼著跑回來|嗯嗯","여우가 물고 달려왔다|콘콘"],
["ca_balloon","carry","fx",{"v":"balloon"},{"spd":4,"mv":"fly"},"気球に乗った人が拾ってきた|風まかせ","Someone in a hot-air balloon picked it up|Where the wind blows","坐熱氣球的人撿回來|隨風去","열기구 탄 사람이 주워 왔다|바람 따라"],
["ca_ufo","carry","xb",{"v":"ufo"},{"spd":30,"mv":"fly"},"UFOに吸い込まれてカップの上で放された|ワレワレハ","A UFO beamed it up and dropped it over the cup|WE COME IN PEACE","被UFO吸走後在洞上方放下|我們是…","UFO에 빨려 들어갔다가 홀컵 위에서 풀려났다|우리는"],
["ca_goat","carry","nm",{"a":"goat"},{"spd":2,"mv":"walk"},"ヤギが紙と間違えてくわえてきた|メェ","A goat mistook it for paper and carried it back|Maa","山羊以為是紙叼回來|咩","염소가 종이인 줄 알고 물고 왔다|음매"],
["ca_squirrel","carry","nm",{"a":"squirrel"},{"spd":4,"mv":"run"},"リスがほおぶくろに入れて運んだ|モゴモゴ","A squirrel stuffed it in its cheeks and carried it|Mmph","松鼠塞進頰囊裡搬回來|咕嚕咕嚕","다람쥐가 볼주머니에 넣어 옮겼다|우물우물"],
["ca_veteran","carry","nmfb",{"p":{"c":"#f4f4f0","hat":"cap"}},{"spd":5,"mv":"run"},"ベテランキャディが走って拾ってきた|ナイスショット！","A veteran caddie ran and fetched it|Nice shot!","資深桿弟跑去撿回來|好球！","베테랑 캐디가 달려가 주워 왔다|나이스 샷!"],
["ca_boar","carry","mfb",{"a":"boar"},{"spd":9,"mv":"run"},"イノシシが鼻に乗せて突進してきた|ブヒィ","A boar charged back with it on its snout|Snort!","山豬把它頂在鼻子上衝回來|齁齁","멧돼지가 코에 얹고 돌진해 왔다|꿀꿀"],
["ca_seagull","carry","fx",{"a":"seagull"},{"spd":11,"mv":"fly"},"カモメがくわえて飛んできた|ミャー","A seagull flew it back|Mew mew","海鷗叼著飛回來|喵～","갈매기가 물고 날아왔다|끼룩"],
["ca_capybara","carry","nm",{"a":"capybara"},{"spd":1,"mv":"walk"},"カピバラが頭に乗せて運んできた|……","A capybara brought it back on its head|......","水豚把它頂在頭上搬回來|……","카피바라가 머리에 얹어 옮겨 왔다|……"],
["ca_marathon","carry","fxb",{"p":{"c":"#f2f2f2","hat":"band"}},{"spd":6,"mv":"run"},"マラソン大会の人が拾って走ってきた|あと1km","A marathon runner picked it up on the way|1 km to go","馬拉松選手撿起來跑回來|還有1公里","마라톤 대회 참가자가 주워서 달려왔다|1km 남았다"],
["ca_pizza","carry","fx",{"v":"bike","c":"#d8352a"},{"spd":11,"mv":"drive"},"ピザの配達バイクに届けられた|30分以内です","A pizza delivery bike brought it back|Under 30 minutes","被披薩外送機車送回來|30分鐘內送達","피자 배달 오토바이가 가져다줬다|30분 이내입니다"],
["ca_owl","carry","mf",{"a":"owl"},{"spd":7,"mv":"fly"},"フクロウがつかんで運んできた|ホー","An owl grabbed it and flew it back|Hoo","貓頭鷹抓著運回來|咕","부엉이가 움켜쥐고 날라 왔다|부엉"],
["ca_tanuki","carry","nm",{"a":"tanuki"},{"spd":2,"mv":"walk"},"タヌキが葉っぱと交換で持ってきた|ポン","A tanuki traded a leaf for it and brought it back|Pon","狸貓用葉子交換拿回來|咚","너구리가 나뭇잎과 바꿔서 가져왔다|퐁"],
["ca_vp","carry","mf",{"p":{"c":"#3a3a3a","hat":"top"}},{"spd":2,"mv":"walk"},"副社長が自ら拾いに行った|わしが行こう","The vice president went to fetch it himself|I'll go","副社長親自去撿|我去吧","부사장님이 직접 주우러 갔다|내가 가지"],
["ca_ambulance","carry","fx",{"v":"truck","c":"#f6f6f6"},{"spd":14,"mv":"drive"},"救急車に運ばれてきた|ピーポー","An ambulance rushed it back|Wee-woo","被救護車載回來|喔咿喔咿","구급차에 실려 왔다|삐뽀"],
["ca_movers","carry","mfx",{"v":"truck","c":"#f2a020"},{"spd":9,"mv":"drive"},"引っ越し業者が丁寧に運んできた|お運びします","Movers carefully carried it back|Moving through","搬家公司小心翼翼地搬回來|為您搬運","이삿짐센터가 정성껏 옮겨 왔다|옮겨 드립니다"],
["ca_snake","carry","nm",{"a":"snake"},{"spd":2,"mv":"crawl"},"ヘビがぐるぐる巻いて運んだ|シュルル","A snake coiled around it and carried it|Ssslither","蛇把它捲起來搬回來|嘶嚕嚕","뱀이 칭칭 감아서 옮겼다|스르르"],
["ca_cat","carry","nm",{"a":"cat"},{"spd":5,"mv":"run"},"猫がくわえて獲物として届けた|ニャ","A cat brought it back as a 'gift'|Meow","貓叼回來當成獵物送你|喵","고양이가 사냥감처럼 물어다 줬다|냥"],
["ca_hr","carry","mf",{"p":{"c":"#5a6a7a","hat":"none"}},{"spd":3,"mv":"walk"},"人事部が「査定に響く」と拾ってきた|査定です","HR fetched it, citing your performance review|Noted in review","人事部說「會影響考核」撿回來|考核喔","인사부가 고과에 반영된다며 주워 왔다|고과입니다"],
["ca_survey","carry","xb",{"v":"drone","c":"#f0c020"},{"spd":20,"mv":"fly"},"測量ドローンが回収した|ピコン","A survey drone retrieved it|Ping","測量無人機回收了|嗶","측량 드론이 회수했다|삐용"],
["ca_ducks","carry","nm",{"a":"duck","s":0.8},{"spd":1.2,"mv":"walk"},"カルガモの親子に運ばれた|クワクワ","A mother duck and chicks carried it back|Quack quack","花嘴鴨母子把它搬回來|呱呱","흰뺨검둥오리 가족이 옮겨 왔다|꽥꽥"],
["ca_rocket","carry","xb",{"v":"rocket"},{"spd":40,"mv":"fly"},"試験ロケットに回収された|回収成功","A test rocket retrieved it|Recovery complete","被試驗火箭回收了|回收成功","시험 로켓이 회수했다|회수 성공"],
["ca_postman","carry","mfx",{"v":"bike","c":"#d8352a"},{"spd":8,"mv":"drive"},"郵便屋さんが速達で届けた|速達です","The mail carrier delivered it express|Express mail","郵差用限時專送送回來|限時專送","우체부가 빠른우편으로 가져다줬다|빠른우편입니다"],
["ca_newbie","carry","xb",{"p":{"c":"#2f2f35","hat":"none"}},{"spd":8,"mv":"run"},"新人が「取ってきます！」と走っていった|行ってきます","A new hire shouted 'I'll get it!' and ran|On my way!","新人喊「我去撿！」就衝出去|我去去就回","신입이 가져오겠다며 달려갔다|다녀오겠습니다"],
["ca_policedog","carry","fxb",{"a":"dog","c":"#3a2a1a"},{"spd":7,"mv":"run"},"警察犬が匂いをたどって持ってきた|ワフッ","A police dog tracked it down and brought it back|Wuff","警犬循著味道叼回來|汪嗚","경찰견이 냄새를 따라가 가져왔다|왕"],
["ca_garbage","carry","fx",{"v":"truck","c":"#3a8a3a"},{"spd":10,"mv":"drive"},"ゴミ収集車に回収されて届けられた|燃えないゴミ","A garbage truck collected it and dropped it off|Non-burnable","被垃圾車回收後送回來|不可燃垃圾","쓰레기 수거차가 수거해서 가져다줬다|불연성 쓰레기"],
["ca_crows","carry","xb",{"a":"crow","s":1.3},{"spd":16,"mv":"fly"},"カラスの群れがリレーで運んだ|カァカァ","A flock of crows relayed it back|Caw caw","烏鴉群接力把它運回來|嘎嘎","까마귀 떼가 릴레이로 옮겼다|까악까악"],
["h_baseball","hit","nmfxb",{"p":{"c":"#2a5aa8","hat":"cap","prop":"bat"}},{"h":1.5},"野球部に打ち返された|カキーン","The baseball team hit it back|CRACK!","被棒球社打回來|鏘！","야구부가 쳐서 돌려보냈다|깡!"],
["h_tennis","hit","nmf",{"p":{"c":"#f6f6f6","hat":"band","prop":"racket"}},{"h":1},"テニス部にスマッシュで返された|スマッシュ！","The tennis club smashed it back|SMASH!","被網球社殺球打回來|殺球！","테니스부가 스매시로 돌려보냈다|스매시!"],
["h_golfer","hit","mfxb",{"p":{"c":"#6a8a3a","hat":"cap","prop":"club"}},{"h":1.8},"後ろの組のゴルファーに打ち返された|ファー！","A golfer in the group behind hit it back|FORE!","被後面那組的球友打回來|注意球～！","뒤 조 골퍼가 쳐서 돌려보냈다|볼~!"],
["h_kangaroo","hit","nmfb",{"a":"kangaroo"},{"h":1.5},"カンガルーに蹴り返された|ボヨン","A kangaroo kicked it back|BOING","被袋鼠踢回來|啵","캥거루가 차서 돌려보냈다|뽀용"],
["h_soccer","hit","mfxb",{"p":{"c":"#2a7ad8","hat":"none"}},{"h":1.2},"サッカー部にロングパスで返された|ナイスパス","The soccer team sent it back with a long pass|Nice pass","被足球社長傳回來|好傳球","축구부가 롱패스로 돌려보냈다|나이스 패스"],
["h_gateball","hit","nm",{"p":{"c":"#8a7a5a","hat":"straw","prop":"stick"}},{"h":0.8},"ゲートボールのおじいさんに打たれた|ほいっ","A gateball grandpa tapped it back|Hup","被打槌球的阿公打回來|嘿","게이트볼 할아버지가 쳐 보냈다|에잇"],
["h_kendo","hit","nmf",{"p":{"c":"#1d2a5a","hat":"helmet","hc":"#1d2a5a","prop":"stick"}},{"h":1.6},"剣道部に面で打ち返された|メーン！","The kendo club struck it back|MEN!","被劍道社一記面擊打回來|面！","검도부가 머리치기로 돌려보냈다|머리!"],
["h_badminton","hit","nmfb",{"p":{"c":"#f6f6f6","hat":"none","prop":"racket"}},{"h":2.4},"バドミントン部にクリアで返された|クリアー","The badminton club cleared it back|Clear!","被羽球社高遠球打回來|高遠球","배드민턴부가 클리어로 돌려보냈다|클리어"],
["h_cricket","hit","fxb",{"p":{"c":"#f0f0e0","hat":"cap","prop":"bat"}},{"h":1.2},"クリケット選手に打ち返された|ハウザット","A cricketer hit it back|Howzat!","被板球選手打回來|好球！","크리켓 선수가 쳐서 돌려보냈다|하우잿"],
["h_hockey","hit","nmf",{"p":{"c":"#2050c0","hat":"helmet","prop":"stick"}},{"h":0.6},"ホッケー選手に打ち返された|シュート！","A hockey player slapped it back|SHOT!","被曲棍球選手打回來|射門！","하키 선수가 쳐서 돌려보냈다|슛!"],
["h_volley","hit","nmf",{"p":{"c":"#e88a3a","hat":"none"}},{"h":2},"バレー部にスパイクで返された|ナイスキー","The volleyball club spiked it back|Nice kill!","被排球社扣殺回來|好球！","배구부가 스파이크로 돌려보냈다|나이스 키"],
["h_pro","hit","fxb",{"p":{"c":"#1d1d1d","hat":"cap","prop":"club"}},{"h":2.2},"偶然いたプロゴルファーに打ち返された|ナイスオン","A pro golfer who happened by hit it back|Nice on!","被剛好在場的職業選手打回來|上果嶺","우연히 있던 프로 골퍼가 쳐서 돌려보냈다|나이스 온"],
["h_chef","hit","nm",{"p":{"c":"#ffffff","hat":"chef","prop":"pan"}},{"h":1.3},"クラブハウスのシェフにフライパンで返された|へいっ","The clubhouse chef hit it back with a frying pan|Hiya!","被俱樂部主廚用平底鍋打回來|嘿！","클럽하우스 셰프가 프라이팬으로 쳐냈다|헤이!"],
["h_mom","hit","nm",{"p":{"c":"#e86a8a","hat":"bun","prop":"broom"}},{"h":1.1},"近所のお母さんに布団たたきで返された|もうっ","A neighborhood mom swatted it back|Honestly!","被附近的媽媽用拍棉被棒打回來|真是的","동네 아주머니가 이불 털이개로 쳐냈다|아휴"],
["h_karate","hit","nm",{"p":{"c":"#f6f6f2","hat":"band","hc":"#1d1d1d"}},{"h":1.2},"空手家に正拳突きで返された|押忍！","A karateka punched it back|OSU!","被空手家正拳打回來|押忍！","가라테 고수가 정권 지르기로 돌려보냈다|오스!"],
["h_monkey","hit","nmf",{"a":"monkey"},{"h":1.4},"サルにフルスイングで投げ返された|キーッ","A monkey hurled it back full swing|EEK!","被猴子全力丟回來|吱——","원숭이가 풀스윙으로 던져 돌려보냈다|끼익"],
["h_bear","hit","nmf",{"a":"bear"},{"h":1.3},"クマに張り手で返された|ガオー","A bear slapped it back|ROAR","被熊一巴掌打回來|吼——","곰이 손바닥으로 쳐서 돌려보냈다|크앙"],
["h_umbrella","hit","nm",{"p":{"c":"#5a5a6a","hat":"none","prop":"umbrella"}},{"h":1},"雨宿りの人に傘で打ち返された|えいっ","Someone sheltering from rain hit it back with an umbrella|Hah!","躲雨的人用雨傘打回來|嘿！","비 피하던 사람이 우산으로 쳐냈다|에잇"],
["h_gardener","hit","nmf",{"p":{"c":"#6a8a30","hat":"straw","prop":"rake"}},{"h":1.2},"庭師に熊手ではじき返された|そらよ","A gardener flicked it back with a rake|There ya go","被園丁用耙子彈回來|拿去","정원사가 갈퀴로 튕겨냈다|옜다"],
["h_ouendan","hit","mfxb",{"p":{"c":"#1d1d1d","hat":"band","hc":"#ffffff","prop":"flag"}},{"h":2},"応援団長に旗で打ち返された|フレー！","The cheer captain hit it back with his flag|HOORAY!","被啦啦隊長用旗子打回來|加油！","응원단장이 깃발로 쳐서 돌려보냈다|파이팅!"],
["h_net","hit","nm",{"p":{"c":"#f0c020","hat":"straw","prop":"net","s":0.7}},{"h":1.2},"虫取り少年に網ではじき返された|捕まえた","A bug-catching kid swatted it back with his net|Got it!","捕蟲少年用網子彈回來|抓到了","곤충 채집 소년이 잠자리채로 튕겨냈다|잡았다"],
["h_shacho","hit","mfxb",{"p":{"c":"#1d1d1d","hat":"top","prop":"club"}},{"h":2.4},"社長が「わしが打とう」と打ち返した|ナイスわし","The president said 'Let me' and hit it back|Nice one, me","社長說「我來打」打回來|我真行","사장님이 내가 치지 하고 쳐 보냈다|나이스 나"],
["h_horse","hit","fxb",{"a":"horse"},{"h":1.4},"馬に後ろ足で蹴り返された|ヒヒン","A horse back-kicked it|NEIGH","被馬用後腿踢回來|嘶","말이 뒷발로 차서 돌려보냈다|히힝"],
["h_deer","hit","mf",{"a":"deer"},{"h":1.1},"鹿に頭突きで返された|ピイッ","A deer headbutted it back|Peep!","被鹿用頭頂回來|嗶","사슴이 박치기로 돌려보냈다|삐익"],
["h_goat","hit","nmf",{"a":"goat"},{"h":1},"ヤギに頭突きで返された|メェッ","A goat headbutted it back|BAA!","被山羊用頭頂回來|咩！","염소가 박치기로 돌려보냈다|메에"],
["h_ostrich","hit","fx",{"a":"ostrich"},{"h":1.6},"ダチョウに蹴り返された|ドスッ","An ostrich kicked it back|THUD","被鴕鳥踢回來|咚","타조가 차서 돌려보냈다|퍽"],
["h_sumo","hit","nmf",{"p":{"c":"#e8c8a8","hat":"bun","w":1.8}},{"h":1.2},"力士に張り手で返された|どすこい","A sumo wrestler slapped it back|DOSUKOI","被相撲力士一掌推回來|嘿唷","스모 선수가 손바닥으로 밀어 보냈다|도스코이"],
["h_rugby","hit","fxb",{"p":{"c":"#208040","hat":"none","w":1.3}},{"h":2},"ラグビー部にキックで返された|ナイスキック","The rugby team kicked it back|Nice kick","被橄欖球社踢回來|好腳","럭비부가 킥으로 돌려보냈다|나이스 킥"],
["h_samurai","hit","nmf",{"p":{"c":"#3a3a4a","hat":"bun","prop":"stick"}},{"h":1.4},"時代劇の撮影中の役者に刀で返された|成敗！","An actor filming a samurai drama sent it back with a sword|Begone!","拍古裝劇的演員用刀打回來|成敗！","사극 촬영 중인 배우가 칼로 돌려보냈다|성패!"],
["h_lacrosse","hit","mf",{"p":{"c":"#f0f0f0","hat":"cap","prop":"net"}},{"h":1.6},"ラクロス部に投げ返された|ナイス","The lacrosse team flung it back|Nice!","被長曲棍球社丟回來|讚","라크로스부가 던져 돌려보냈다|나이스"],
["h_littleleague","hit","nm",{"p":{"c":"#f6f6f6","hat":"cap","prop":"bat","s":0.7}},{"h":1},"少年野球の子にピッチャー返しされた|えいっ","A Little Leaguer lined it right back|Hyah!","被少棒小朋友打出投手方向回來|嘿！","리틀야구 아이가 투수 앞으로 되받아쳤다|에잇"],
["h_lesson","hit","nmf",{"p":{"c":"#8ab0d8","hat":"cap","prop":"club"}},{"h":1.5},"レッスン中の生徒の空振りが当たった|あっ","A student's missed swing in a lesson hit it back|Oops","上課學員揮空打到球|啊","레슨 중이던 수강생 헛스윙에 맞았다|앗"],
["h_janitor","hit","nm",{"p":{"c":"#3080d0","hat":"cap","prop":"broom"}},{"h":1},"清掃員にモップで打ち返された|お掃除中","A janitor hit it back with a mop|Cleaning!","被清潔員用拖把打回來|打掃中","청소부가 대걸레로 쳐서 돌려보냈다|청소 중"],
["h_boar","hit","mfb",{"a":"boar"},{"h":1.2},"イノシシに牙ではね返された|フゴッ","A boar tossed it back with its tusks|Snork!","被山豬用獠牙頂回來|呼嚕","멧돼지가 엄니로 튕겨냈다|꿀꿀"],
["h_cheer","hit","nm",{"p":{"c":"#f07ab0","hat":"none"}},{"h":1.8},"チアリーダーのハイキックで返された|ゴー！","A cheerleader's high kick sent it back|GO!","被啦啦隊員高踢腿踢回來|加油！","치어리더의 하이킥에 돌려보내졌다|고!"],
["h_pingpong","hit","nm",{"p":{"c":"#d8352a","hat":"none","prop":"racket"}},{"h":0.9},"卓球部にスマッシュで返された|サー！","The table tennis club smashed it back|Saaa!","被桌球社扣殺回來|好！","탁구부가 스매시로 돌려보냈다|짜오!"],
["h_guard","hit","nmf",{"p":{"c":"#1d2a5a","hat":"cap","prop":"stick"}},{"h":1.1},"警備員に警棒で打ち返された|立入禁止です","A security guard batted it back with his baton|Restricted area","被警衛用警棍打回來|禁止進入","경비원이 경봉으로 쳐서 돌려보냈다|출입 금지입니다"],
["h_worker","hit","nmf",{"p":{"c":"#f0a020","hat":"helmet","prop":"rake"}},{"h":1.2},"工事の人にスコップで返された|危ないよ","A construction worker shoveled it back|Watch out","被工地工人用鏟子打回來|危險喔","공사장 인부가 삽으로 돌려보냈다|위험해"],
["h_conductor","hit","nmf",{"p":{"c":"#1d1d1d","hat":"none","prop":"stick"}},{"h":1.8},"野外コンサートの指揮者に返された|ブラボー","An outdoor concert conductor batted it back|Bravo!","被戶外音樂會的指揮打回來|好啊！","야외 콘서트 지휘자가 쳐서 돌려보냈다|브라보"],
["h_sennin","hit","mfxb",{"p":{"c":"#f2f2f2","hat":"none","prop":"stick"}},{"h":2.6},"通りすがりの仙人に杖ではじかれた|喝！","A passing hermit sage flicked it back with his staff|KATSU!","路過的仙人用拐杖一彈|喝！","지나가던 신선이 지팡이로 튕겼다|할!"],
["w_kappa","water","w",{"p":{"c":"#3a8a3a","hat":"none"}},{"delay":1.5},"池のカッパに投げ返された|キュウリくれ","A kappa in the pond threw it back|Got cucumbers?","被池裡的河童丟回來|給我小黃瓜","연못 갓파가 던져 돌려보냈다|오이 줘"],
["w_swanboat","water","w",{"v":"boat","c":"#ffffff"},{"delay":1.2},"スワンボートの人がオールで打ち返した|ギコギコ","Someone in a swan boat paddled it back|Splash splash","天鵝船上的人用槳打回來|嘎吱嘎吱","백조 보트 탄 사람이 노로 쳐서 보냈다|끼익끼익"],
["w_pelican","water","w",{"a":"pelican"},{"delay":1},"ペリカンがすくって放り投げた|ガバッ","A pelican scooped it up and tossed it|Gulp!","鵜鶘舀起來丟出去|嘩啦","펠리컨이 떠서 던져 버렸다|첨벙"],
["w_catfish","water","w",{"a":"fish","c":"#5a5040","s":2},{"delay":2},"池の主の大ナマズにはね返された|ゴボッ","The giant catfish of the pond flipped it back|Bloop","被池塘之主大鯰魚彈回來|咕嚕","연못의 주인 큰 메기가 튕겨냈다|꼬르륵"],
["w_penguin","water","w",{"a":"penguin"},{"delay":1.3},"なぜか池にいたペンギンが投げた|ペンッ","A penguin that was somehow in the pond threw it|Pen!","不知為何在池裡的企鵝丟回來|噗","왠지 연못에 있던 펭귄이 던졌다|펭!"],
["bo_sign","bounce","nmfxh",{"o":"sign"},{"f":0.6,"h":1},"急に立った看板で跳ね返った|ゴン","It bounced off a sign that suddenly popped up|BONK","撞到突然立起的看板彈回來|咚","갑자기 선 간판에 튕겼다|쿵"],
["bo_tree","bounce","mfxb",{"o":"tree"},{"f":0.8,"h":1.2},"木の幹に当たって跳ね返った|コーン","It hit a tree trunk and bounced back|KONK","打到樹幹彈回來|叩","나무 줄기에 맞고 튕겼다|콩"],
["bo_flagpole","bounce","pn",{"o":"pole","c":"#f4f4f4"},{"f":0.7,"h":0.6},"旗竿に当たって真下に落ちた|カーン","It hit the flagstick and dropped straight down|CLANG","打到旗桿直直落下|鏘","깃대에 맞고 바로 떨어졌다|깡"],
["bo_cart","bounce","nmfb",{"v":"cart"},{"f":0.6,"h":1.4},"通りがかったカートの屋根で跳ねた|ポン","It bounced off the roof of a passing cart|Pong","在路過球車的車頂上彈起|砰","지나가던 카트 지붕에 튕겼다|퐁"],
["bo_rock","bounce","nmf",{"o":"rock"},{"f":0.9,"h":1},"岩に当たって跳ね返った|カツン","It ricocheted off a rock|TOCK","打到岩石彈回來|喀","바위에 맞고 튕겼다|딱"],
["bo_wall","bounce","nmfxb",{"o":"wall"},{"f":0.5,"h":1},"突然せり上がった壁で跳ね返った|ズン","A wall rose from the ground and bounced it back|THOOM","突然升起的牆把它彈回來|咚","갑자기 솟은 벽에 튕겼다|쿵"],
["bo_spring","bounce","pnm",{"o":"spring"},{"f":0.6,"h":1.8},"地面のバネで跳ね返った|ビヨーン","A spring in the ground bounced it back|BOYOING","被地上的彈簧彈回來|啵嚶～","땅의 스프링에 튕겼다|뾰옹"],
["bo_tramp","bounce","nmf",{"o":"tramp"},{"f":0.9,"h":2.2},"トランポリンで跳ね返った|ボヨーン","It bounced off a trampoline|BOYOOONG","在彈跳床上彈回來|啵～","트램펄린에 튕겼다|뽀요옹"],
["bo_statue","bounce","mfx",{"o":"statue","c":"#b0905a"},{"f":0.7,"h":1.3},"創業者の銅像に当たって跳ね返った|カーン","It bounced off the founder's bronze statue|CLANG","撞到創辦人的銅像彈回來|鏘","창업자 동상에 맞고 튕겼다|깡"],
["bo_vending","bounce","mfb",{"o":"vending"},{"f":0.8,"h":1},"自販機に当たって跳ね返った|ガコン","It bounced off a vending machine|CLUNK","撞到自動販賣機彈回來|匡噹","자판기에 맞고 튕겼다|덜컹"],
["bo_mirror","bounce","fxh",{"o":"mirror"},{"f":0.5,"h":1.5},"巨大な鏡に反射した|キラーン","It reflected off a giant mirror|SHING","被巨大鏡子反射回來|閃","거대한 거울에 반사됐다|반짝"],
["bo_cone","bounce","pn",{"o":"cone"},{"f":0.6,"h":0.7},"カラーコーンに当たって跳ね返った|ポコン","It bounced off a traffic cone|Bok","撞到三角錐彈回來|啵","라바콘에 맞고 튕겼다|퐁"],
["bo_bucket","bounce","pn",{"o":"bucket"},{"f":0.7,"h":0.8},"バケツのふちで跳ね返った|カコン","It bounced off the rim of a bucket|Clonk","在水桶邊緣彈回來|喀噹","양동이 가장자리에 튕겼다|깡"],
["bo_vinyl","bounce","nm",{"p":{"c":"#5a5a6a","hat":"none","prop":"umbrella"}},{"f":0.7,"h":1},"見物客のビニール傘で跳ね返った|あぶなっ","It bounced off a spectator's umbrella|Whoa!","被觀眾的塑膠傘彈回來|好險","구경꾼의 비닐우산에 튕겼다|위험해"],
["bo_bear","bounce","nmf",{"a":"bear"},{"f":0.8,"h":1.2},"クマのお腹で跳ね返った|ぼよん","It bounced off a bear's belly|Boing","撞到熊的肚子彈回來|啵～","곰 배에 튕겼다|뽀용"],
["bo_balloon","bounce","fxh",{"v":"balloon"},{"f":0.5,"h":1.4},"気球で跳ね返った|ポヨン","It bounced off a hot-air balloon|Poyon","撞到熱氣球彈回來|啵唷","열기구에 튕겼다|뽀용"],
["bo_blimp","bounce","xh",{"v":"blimp"},{"f":0.5,"h":1.6},"広告の飛行船で跳ね返った|ボヨン","It bounced off an advertising blimp|BOYON","撞到廣告飛艇彈回來|啵～","광고 비행선에 튕겼다|뽀용"],
["bo_plane","bounce","xh",{"v":"plane"},{"f":0.5,"h":1.8},"低空飛行の飛行機の翼で跳ねた|キーン","It bounced off the wing of a low-flying plane|WHEEE","撞到低空飛機的機翼彈回來|咻——","저공비행하던 비행기 날개에 튕겼다|슈웅"],
["bo_hand","bounce","mfxh",{"o":"hand"},{"f":0.6,"h":1.5},"空から巨大な手が出てきてはたいた|ぺしっ","A giant hand came out of the sky and swatted it|SLAP","天上伸出一隻巨手把它拍回來|啪","하늘에서 거대한 손이 나와 쳤다|찰싹"],
["bo_heli","bounce","fxh",{"v":"heli"},{"f":0.5,"h":1.4},"ヘリの機体に当たって跳ね返った|カン","It bounced off a helicopter|CLANK","撞到直升機機身彈回來|鏘","헬기 기체에 맞고 튕겼다|깡"],
["bo_drone","bounce","mfh",{"v":"drone"},{"f":0.5,"h":1.2},"撮影ドローンに当たって跳ね返った|ガガッ","It bounced off a filming drone|Bzzt!","撞到空拍無人機彈回來|嘎嘎","촬영 드론에 맞고 튕겼다|지직"],
["bo_ufo","bounce","xh",{"v":"ufo"},{"f":0.5,"h":2},"UFOの底に当たって跳ね返った|ピコーン","It bounced off the bottom of a UFO|BLOOP","撞到UFO底部彈回來|嗶咚","UFO 바닥에 맞고 튕겼다|삐용"],
["bo_pigeon","bounce","mh",{"a":"pigeon"},{"f":0.5,"h":1},"ハトにぶつかって跳ね返った|クルッ","It bounced off a pigeon|Coo!","撞到鴿子彈回來|咕","비둘기에 부딪혀 튕겼다|구구"],
["bo_seagull","bounce","fh",{"a":"seagull"},{"f":0.5,"h":1.2},"カモメに当たって跳ね返った|ミャッ","It bounced off a seagull|Mew!","撞到海鷗彈回來|喵","갈매기에 맞고 튕겼다|끼룩"],
["bo_kohai_head","bounce","nmb",{"p":{"c":"#3a5a8a","hat":"none"}},{"f":0.8,"h":1},"後輩の頭に当たって跳ね返った|いたっ","It bounced off your junior's head|Ow!","打到後輩的頭彈回來|好痛","후배 머리에 맞고 튕겼다|아야"],
["bo_shacho_head","bounce","mf",{"p":{"c":"#1d1d1d","hat":"top"}},{"f":0.8,"h":1.2},"社長のシルクハットで跳ね返った|ナイスヘッド","It bounced off the president's top hat|Nice header","撞到社長的高帽彈回來|好頭槌","사장님 실크햇에 튕겼다|나이스 헤딩"],
["bo_bamboo","bounce","mfb",{"o":"tree","c":"#6a9a3a"},{"f":0.7,"h":1.6},"竹がしなって跳ね返した|ビュン","A flexing bamboo flung it back|THWIP","竹子一彎把它彈回來|咻","대나무가 휘어 튕겨냈다|휙"],
["bo_truck","bounce","fxb",{"v":"truck"},{"f":0.7,"h":1.3},"トラックの荷台で跳ね返った|ドン","It bounced off the back of a truck|THUD","撞到卡車車斗彈回來|咚","트럭 짐칸에 튕겼다|쿵"],
["bo_pole","bounce","fxb",{"o":"pole"},{"f":0.7,"h":1.4},"電柱に当たって跳ね返った|カーン","It hit a utility pole and bounced back|CLANG","打到電線桿彈回來|鏘","전봇대에 맞고 튕겼다|깡"],
["bo_mower","bounce","nmb",{"v":"mower"},{"f":0.8,"h":1},"芝刈り機の刃ではじかれた|ガガガ","A lawnmower blade flicked it back|BRRRT","被割草機的刀刃彈回來|嘎嘎嘎","잔디 깎는 기계 날에 튕겼다|드드득"],
["bo_fan","bounce","nm",{"o":"fan"},{"f":0.7,"h":1.2},"大型扇風機の羽根で跳ね返った|ブン","It bounced off a big fan's blades|VWOOM","撞到大型電風扇扇葉彈回來|嗡","대형 선풍기 날개에 튕겼다|붕"],
["bo_magnet","bounce","mf",{"o":"magnet"},{"f":0.6,"h":1.4},"巨大な磁石にはじかれた|カチーン","A giant magnet repelled it|KA-CHING","被巨大磁鐵彈開|喀鏘","거대한 자석에 튕겼다|깡"],
["bo_robot","bounce","nm",{"v":"robot"},{"f":0.8,"h":1},"案内ロボットのお腹で跳ね返った|イラッシャイマセ","It bounced off a guide robot's belly|WELCOME","撞到導覽機器人的肚子彈回來|歡迎光臨","안내 로봇 배에 튕겼다|어서 오세요"],
["bo_cow","bounce","mf",{"a":"cow"},{"f":0.8,"h":1.2},"牛のお尻で跳ね返った|モッ","It bounced off a cow's rear|Mo!","撞到牛屁股彈回來|哞","소 엉덩이에 튕겼다|음매"],
["bo_horse","bounce","fx",{"a":"horse"},{"f":0.8,"h":1.3},"馬のお尻で跳ね返った|ヒンッ","It bounced off a horse's rear|Neigh!","撞到馬屁股彈回來|嘶","말 엉덩이에 튕겼다|히힝"],
["bo_sign_hairu","bounce","nmf",{"o":"sign","c":"#f6f6f6"},{"f":0.6,"h":1},"「入るな」と書かれた看板で跳ね返った|入るな","It bounced off a sign that said 'Do Not Enter'|DO NOT ENTER","撞到寫著「禁止進入」的看板彈回來|禁止進入","들어가지 마시오 간판에 튕겼다|들어가지 마"],
["bo_panel","bounce","nm",{"o":"statue","c":"#23315a"},{"f":0.7,"h":1},"部長の等身大パネルで跳ね返った|ワシだ","It bounced off a life-size cutout of the boss|It's me","撞到部長的等身大看板彈回來|是我","부장님 등신대 패널에 튕겼다|나다"],
["bo_window","bounce","fxb",{"o":"wall","c":"#9ad0f0"},{"f":0.8,"h":1.3},"クラブハウスの窓で跳ね返った|コン","It bounced off a clubhouse window|Tok","撞到俱樂部的窗戶彈回來|叩","클럽하우스 창문에 튕겼다|똑"],
["bo_rocket","bounce","xh",{"v":"rocket"},{"f":0.5,"h":2},"打ち上げ中のロケットに当たって跳ねた|3、2、1","It bounced off a rocket mid-launch|3, 2, 1","撞到發射中的火箭彈回來|3、2、1","발사 중인 로켓에 맞고 튕겼다|3, 2, 1"],
["bo_pipe","bounce","nmf",{"o":"pipe"},{"f":0.8,"h":1.2},"土管のふちで跳ね返った|ポコン","It bounced off the rim of a pipe|Pokon","在水管口彈回來|啵","토관 가장자리에 튕겼다|퐁"],
["bo_kidtramp","bounce","mfb",{"o":"tramp","c":"#e8352a"},{"f":0.8,"h":2},"子どもが遊んでいたトランポリンで跳ねた|わーい","It bounced on a trampoline some kids were playing on|Wheee","在小孩玩的彈跳床上彈起|耶～","아이들이 놀던 트램펄린에 튕겼다|와아"],
["bo_trap","bounce","pnmh",{"o":"spring","c":"#c8a040"},{"f":0.6,"h":1.6},"隠しバネのワナで跳ね返った|ふふふ","It bounced off a hidden spring trap|Heh heh heh","被隱藏的彈簧陷阱彈回來|呵呵呵","숨겨진 스프링 함정에 튕겼다|후후후"],
["bo_mime","bounce","nmb",{"p":{"c":"#f6f6f6","hat":"none"}},{"f":0.7,"h":1},"パントマイムの人の見えない壁で跳ねた|……","It bounced off a mime's invisible wall|......","撞到默劇演員的隱形牆彈回來|……","마임 아티스트의 보이지 않는 벽에 튕겼다|……"],
["bo_goal","bounce","mfx",{"o":"pole","c":"#ffffff"},{"f":0.7,"h":1.5},"サッカーゴールのバーに当たって跳ねた|バー！","It hit a soccer crossbar and bounced back|Off the bar!","打到足球門橫桿彈回來|中楣！","축구 골대 크로스바를 맞고 튕겼다|크로스바!"],
["bo_wagon","bounce","nmb",{"v":"cart","c":"#f2c040"},{"f":0.7,"h":1},"売店のワゴンで跳ね返った|いらっしゃい","It bounced off the snack wagon|Welcome!","撞到販賣部的推車彈回來|歡迎光臨","매점 왜건에 튕겼다|어서 오세요"],
["w_boat","water","w",{"v":"boat"},{"delay":1.4},"釣り人のボートのオールで打ち返された|釣れたと思った","A fisherman in a boat batted it back with an oar|Thought I had a bite","被釣客船上的槳打回來|以為釣到了","낚시꾼 보트 노에 쳐서 돌려보내졌다|입질인 줄"],
["w_whitecarp","water","w",{"a":"carp","c":"#f6f6f6"},{"delay":1},"池の鯉が口から吹き飛ばした|プッ","A pond carp spat it out|Ptoo","池裡的鯉魚從嘴裡吐出來|噗","연못 잉어가 입으로 뱉어 날렸다|퉤"],
["w_chorus","water","w",{"a":"frog","s":1.4},{"delay":2},"カエルの大合唱の振動で跳ね上がった|ゲロゲロ","A frog chorus shook it out of the water|Ribbit ribbit","青蛙大合唱的震動讓它彈出來|呱呱","개구리 합창 진동에 튀어 올랐다|개굴개굴"],
["w_turtle2","water","w",{"a":"turtle","c":"#5a8a4a"},{"delay":1.6},"池のカメの甲羅で跳ね上がった|コツン","It bounced off a pond turtle's shell|Tonk","撞到池裡烏龜的殼彈起來|叩","연못 거북이 등딱지에 튀어 올랐다|톡"],
["w_school","water","w",{"a":"fish"},{"delay":1.2},"魚の群れがボールを押し上げた|ピチピチ","A school of fish pushed it up|Flip flop","魚群把球頂了上來|啪啪","물고기 떼가 공을 밀어 올렸다|파닥파닥"],
["a_eagle","air","mfxh",{"a":"eagle"},{"spd":16},"ワシにつかまれてカップに落とされた|ピーッ","An eagle grabbed it and dropped it in the cup|SCREECH","被老鷹抓住丟進洞裡|嗶——","독수리가 낚아채 홀컵에 떨어뜨렸다|삐익"],
["a_newsheli","air","fxh",{"v":"heli"},{"spd":20},"報道ヘリに回収された|こちら上空です","A news helicopter picked it up|Live from above","被新聞直升機回收|這裡是空中","보도 헬기가 회수했다|여기는 상공입니다"],
["a_crow","air","nmfh",{"a":"crow"},{"spd":12},"カラスに空中でくわえられた|カァ","A crow caught it in midair|Caw","被烏鴉在空中叼走|嘎","까마귀가 공중에서 물어 갔다|까악"],
["a_drone","air","nmfh",{"v":"drone"},{"spd":10},"撮影ドローンにキャッチされた|ナイスキャッチ","A filming drone caught it|Nice catch","被空拍無人機接住|好接","촬영 드론이 잡았다|나이스 캐치"],
["a_ufo","air","xh",{"v":"ufo"},{"spd":30},"UFOに吸い込まれて運ばれた|ピロピロ","A UFO sucked it up and carried it|Beep boop","被UFO吸進去運走|嗶囉嗶囉","UFO에 빨려 들어가 옮겨졌다|삐리삐리"],
["a_pelican","air","mfh",{"a":"pelican"},{"spd":11},"ペリカンに丸のみにされて運ばれた|ゴクン","A pelican swallowed it and flew it over|Gulp","被鵜鶘整個吞下運走|咕嘟","펠리컨에게 통째로 삼켜져 옮겨졌다|꿀꺽"],
["a_owl","air","nmh",{"a":"owl"},{"spd":8},"フクロウにつかまれた|ホーホー","An owl snatched it|Hoo hoo","被貓頭鷹抓走|咕咕","부엉이가 움켜쥐었다|부엉부엉"],
["a_seagull","air","fxh",{"a":"seagull"},{"spd":13},"カモメにさらわれた|ミャーミャー","A seagull swooped in and took it|Mew mew","被海鷗叼走|喵喵","갈매기가 채 갔다|끼룩끼룩"],
["a_pigeon","air","nmf",{"a":"pigeon"},{"spd":9},"伝書バトに空中で受け取られた|クルッポー","A carrier pigeon caught it midair|Coo-roo","被信鴿在空中接住|咕嚕咕","전서구가 공중에서 받아 갔다|구구구"],
["a_balloon","air","fxh",{"v":"balloon"},{"spd":5},"気球のかごに入って運ばれた|ふわふわ","It landed in a balloon basket and floated over|Float float","掉進熱氣球的籃子被運過去|輕飄飄","열기구 바구니에 들어가 옮겨졌다|둥실둥실"],
["a_blimp","air","xh",{"v":"blimp"},{"spd":8},"飛行船のロープに引っかかった|ボオオ","It got caught on a blimp's rope|Vrrrm","被飛艇的繩子勾住|嗡嗡","비행선 밧줄에 걸렸다|부우웅"],
["a_plane","air","xh",{"v":"plane"},{"spd":40},"旅客機のタイヤに挟まって運ばれた|当機はまもなく","It got stuck in an airliner's wheel and rode along|We will shortly land","卡在客機輪胎裡被載走|本機即將","여객기 바퀴에 끼어 옮겨졌다|본 비행기는 곧"],
["a_hand","air","mfxh",{"o":"hand"},{"spd":14},"空から巨大な手がつまんで置いた|ほいっ","A giant hand from the sky picked it up and placed it|There","天上的巨手捏起來放好|嘿","하늘에서 거대한 손이 집어서 놓았다|옜다"],
["a_tornado","air","fxh",{"o":"whirl"},{"spd":18},"竜巻に巻き上げられて運ばれた|ゴオオ","A tornado sucked it up and carried it|WHOOOSH","被龍捲風捲起運走|轟轟","회오리바람에 휘말려 옮겨졌다|우우웅"],
["a_rocket","air","xh",{"v":"rocket"},{"spd":45},"試験ロケットに乗って戻ってきた|発射！","It rode a test rocket back|LIFTOFF!","搭著試驗火箭回來了|發射！","시험 로켓을 타고 돌아왔다|발사!"],
["a_duck","air","nmf",{"a":"duck"},{"spd":8},"カモがくわえて飛んできた|クワッ","A duck flew it over in its bill|Quack!","野鴨叼著飛過來|呱！","오리가 물고 날아왔다|꽥!"],
["a_shiny","air","mf",{"a":"crow","s":1.2},{"spd":10},"カラスが光り物と間違えてさらった|キラキラ…","A crow mistook it for something shiny|Shiny...","烏鴉以為是亮晶晶的東西叼走|亮晶晶…","까마귀가 반짝이는 물건인 줄 알고 채 갔다|반짝반짝…"],
["a_misdeliver","air","fx",{"v":"drone","c":"#f2f2f2"},{"spd":14},"宅配ドローンに誤配送された|ゴハイソウ","A delivery drone delivered it to the wrong place|MISDELIVERED","被宅配無人機送錯地方|送錯了","택배 드론이 잘못 배송했다|오배송"],
["a_shacho_heli","air","xh",{"v":"heli","c":"#1d1d1d"},{"spd":24},"社長のヘリが拾ってきた|迎えに来たぞ","The president's private helicopter picked it up|Came to get you","社長的直升機撿回來|來接你了","사장님 헬기가 주워 왔다|데리러 왔다"],
["a_falconer","air","fh",{"a":"eagle","c":"#8a6a40"},{"spd":15},"鷹匠の鷹に回収された|ピィッ","A falconer's hawk retrieved it|Kee!","被馴鷹師的老鷹回收|嗶","매사냥꾼의 매가 회수했다|삐익"],
["a_god","air","xh",{"o":"hand","c":"#f6e6c6"},{"spd":20},"雲の上から神様の手が置いていった|よきかな","A divine hand from above the clouds placed it|It is good","雲端上的神之手放下了它|甚好","구름 위 신의 손이 놓고 갔다|좋구나"],
["a_pigeons","air","mfh",{"a":"pigeon","s":1.3},{"spd":10},"ハトの群れが一斉に運んだ|バサバサ","A flock of pigeons carried it together|Flap flap","鴿子群一起運過去|啪沙啪沙","비둘기 떼가 한꺼번에 옮겼다|푸드덕"],
["a_gullfish","air","fx",{"a":"seagull","s":1.2},{"spd":12},"カモメが魚と間違えて運んだ|ミャッ","A seagull mistook it for a fish|Mew!","海鷗以為是魚運走|喵","갈매기가 물고기인 줄 알고 옮겼다|끼룩"],
["a_beam","air","xh",{"v":"ufo","c":"#9a9aa0"},{"spd":28},"宇宙人の牽引ビームで運ばれた|ワレワレハ","An alien tractor beam carried it|WE ARE...","被外星人的牽引光束運走|我們是…","외계인의 견인 빔에 옮겨졌다|우리는"],
["a_bossbreath","air","mfh",{"o":"whirl","c":"#d8d0c0"},{"spd":12},"部長の豪快なため息で竜巻が起きた|ふぅぅ","The boss's mighty sigh whipped up a tornado|Phewww","部長豪邁的嘆氣颳起龍捲風|呼——","부장님의 호쾌한 한숨에 회오리가 일었다|후우우"],
["a_kidballoon","air","mf",{"v":"balloon","c":"#ff7ad8"},{"spd":4},"子どもの風船に結ばれて運ばれた|バイバーイ","It got tied to a kid's balloon and floated over|Bye-bye!","被綁在小孩的氣球上飄過去|掰掰～","아이 풍선에 묶여 옮겨졌다|빠이빠이"],
["a_guarddrone","air","mfx",{"v":"drone","c":"#1d2a5a"},{"spd":14},"警備ドローンに没収された|ボッシュウ","A security drone confiscated it|CONFISCATED","被警備無人機沒收|沒收","경비 드론에 압수당했다|압수"],
["a_paperplane","air","nm",{"v":"plane","c":"#f6f6f6"},{"spd":6},"紙飛行機に乗せられて飛んできた|スイー","It rode a paper airplane over|Swoosh","搭著紙飛機飛過來|咻——","종이비행기를 타고 날아왔다|슈웅"],
["a_condor","air","xh",{"a":"eagle","s":1.6},{"spd":18},"コンドルに巣の材料にされかけた|クアッ","A condor nearly used it for its nest|Kwah!","差點被禿鷹拿去築巢|嘎！","콘도르가 둥지 재료로 쓸 뻔했다|꽉!"],
["a_chairman","air","fxh",{"o":"hand","c":"#e8c8a0"},{"spd":16},"雲の上から会長の手が伸びてきた|ワシが決める","The chairman's hand reached down from above the clouds|I decide","會長的手從雲端伸下來|我說了算","구름 위에서 회장님 손이 뻗어 왔다|내가 정한다"],
["wa_spacetime","warp","pnmfxhbw",{"o":"portal"},{"delay":2},"時空がゆがんでカップの上に出た|ギュイーン","Space-time warped and it popped out above the cup|VWOOM","時空扭曲出現在洞上方|咻——","시공이 일그러져 홀컵 위로 나왔다|위잉"],
["wa_rewind","warp","fxhb",{"o":"none"},{"delay":3},"時間が巻き戻ってカップの上から落ちた|キュルルル","Time rewound and it fell into the cup from above|Rewinding...","時間倒流從洞上方掉下來|嘰嚕嚕","시간이 되감겨 홀컵 위에서 떨어졌다|끼리릭"],
["wa_earth","warp","xb",{"o":"none"},{"delay":5},"地球を一周して戻ってきた|ただいま","It circled the Earth and came back|I'm home","繞地球一圈回來了|我回來了","지구를 한 바퀴 돌고 돌아왔다|다녀왔습니다"],
["wa_aura","warp","nmfh",{"o":"portal","c":"#ffd040"},{"delay":1.5},"部長の接待オーラに引き寄せられた|ワシの力だ","It was drawn in by the boss's aura|My power","被部長的氣場吸過去|我的力量","부장님의 접대 오라에 끌려갔다|내 힘이다"],
["wa_teleport","warp","mfxb",{"o":"portal","c":"#40e0a0"},{"delay":2},"謎の転送装置でカップに送られた|転送完了","A mysterious teleporter sent it to the cup|Transfer complete","被神祕的傳送裝置送到洞裡|傳送完畢","수수께끼의 전송 장치가 홀컵으로 보냈다|전송 완료"],
["wa_blackhole","warp","xhb",{"o":"portal","c":"#1a1a2a"},{"delay":3},"ブラックホールに吸い込まれて出てきた|シュポン","A black hole swallowed it and spat it out|Shpoon","被黑洞吸進去又吐出來|咻啵","블랙홀에 빨려 들어갔다가 나왔다|슈뽕"],
["wa_door","warp","fxb",{"o":"portal","c":"#40c0ff"},{"delay":2.5},"異次元の扉から出てきた|ガチャ","It came out of a door to another dimension|Click","從異次元之門出來|喀嚓","이차원의 문에서 나왔다|철컥"],
["wa_fate","warp","pnm",{"o":"none"},{"delay":1},"運命の力でカップに導かれた|運命です","Destiny guided it into the cup|It's fate","被命運之力引導進洞|這是命運","운명의 힘으로 홀컵에 이끌렸다|운명입니다"],
["wa_deja","warp","mfh",{"o":"none"},{"delay":4},"同じ一打が何度もくり返された|デジャヴ","The same shot repeated over and over|Déjà vu","同一桿一再重複|似曾相識","같은 샷이 몇 번이고 반복됐다|데자뷔"],
["wa_pondhole","warp","w",{"o":"portal","c":"#3a86c8"},{"delay":2},"池の底がカップにつながっていた|ゴボゴボ","The bottom of the pond connected to the cup|Glug glug","池底竟然通到球洞|咕嘟咕嘟","연못 바닥이 홀컵과 이어져 있었다|꼬르륵"],
["wa_goddess","warp","w",{"o":"none"},{"delay":3},"池の女神がきれいなボールを返した|落としたのは…","The pond goddess returned a sparkling ball|Did you drop...","池中女神還回一顆漂亮的球|你掉的是…","연못의 여신이 반짝이는 공을 돌려줬다|떨어뜨린 건…"],
["wa_moon","warp","xh",{"o":"none"},{"delay":6},"月まで行って帰ってきた|おかえり","It went to the moon and came back|Welcome back","飛到月球又回來了|歡迎回來","달까지 갔다가 돌아왔다|어서 와"],
["wa_magician","warp","nmb",{"o":"whirl","c":"#b050ff"},{"delay":1.5},"通りすがりの手品師に消された|はい、こちら","A passing magician made it vanish|Ta-da, here","被路過的魔術師變不見|請看這裡","지나가던 마술사가 사라지게 했다|자, 여기"],
["wa_kamikakushi","warp","pnmw",{"o":"whirl"},{"delay":2},"神隠しにあって、カップの上に出た|あれ？","It was spirited away and reappeared over the cup|Huh?","被神隱後出現在洞上方|咦？","행방불명됐다가 홀컵 위로 나왔다|어라?"],
["wa_rumor","warp","mfxb",{"o":"none"},{"delay":3},"社内のうわさが広まって勝手に入った|聞きました？","An office rumor spread and it just went in|Did you hear?","公司八卦傳開它就自己進去了|你聽說了嗎","사내 소문이 퍼지더니 저절로 들어갔다|들었어요?"],
["w_ducklings","water","w",{"a":"duck","s":0.7},{"delay":1.5},"カルガモの親子が押して放り投げた|ピヨピヨ","A duck family pushed it out of the pond|Peep peep","花嘴鴨母子把它推出去|啾啾","오리 가족이 밀어서 던져 버렸다|삐약삐약"],
["w_trainee","water","w",{"p":{"c":"#2a2a2a","hat":"helmet"}},{"delay":2},"池で潜水訓練中の人に投げ返された|訓練です","Someone doing dive training threw it back|Just training","在池裡做潛水訓練的人丟回來|訓練中","연못에서 잠수 훈련 중인 사람이 던져 보냈다|훈련입니다"],
["w_squirt","water","w",{"a":"carp","c":"#f0a020"},{"delay":1},"池の鯉が口から鉄砲水を吹いた|ブーッ","A pond carp shot out a jet of water|PFFT","池裡的鯉魚噴出水柱|噗——","연못 잉어가 입으로 물대포를 뿜었다|푸웃"],
["w_shacho_swan","water","w",{"v":"boat","c":"#f6f6f2"},{"delay":1.6},"白鳥のボートに乗った社長が拾って投げた|はっはっは","The president in a swan boat picked it up and threw it|Ha ha ha","坐天鵝船的社長撿起來丟回來|哈哈哈","백조 보트 탄 사장님이 주워 던졌다|하하하"],
["w_netcleaner","water","w",{"p":{"c":"#3080d0","hat":"cap","prop":"net"}},{"delay":1.2},"池の清掃員が網ですくって投げた|すくいました","A pond cleaner scooped it with a net and tossed it|Got it","池塘清潔員用網子撈起來丟回來|撈到了","연못 청소부가 뜰채로 떠서 던졌다|건졌습니다"]];                     // 理由の一覧（setReasons で入れる）
  function setReasons(list) { R = list; }

  // 打つ：c クラブ(0-4) / d 向き(0-71) / p 強さ(0-100) / seed
  function shot(c, d, p, seed) {
    c = c | 0; d = ((d | 0) % 72 + 72) % 72; p = Math.max(0, Math.min(100, p | 0));
    const cl = CLUBS[c], dir = DIR[d], dx = dir[0], dz = dir[1];
    const v = cl[3] * (0.1 + 0.9 * p / 100);
    const P = { c, d, p, seed, dx, dz, v, kind: c === 0 ? 'putt' : 'fly', cats: '', water: false, lip: false };
    if (c === 0) {
      // 転がる
      const sd = v * v / (2 * DECEL), ts = v / DECEL;
      const tAt = s => (v - Math.sqrt(Math.max(0, v * v - 2 * DECEL * s))) / DECEL;
      let stopS = sd, stopT = ts;
      // カップに向かってまっすぐなら、ふちで止まる
      const u = -5 * dz, perp = Math.abs(5 * dx);
      if (u > 0 && perp < 0.11 && sd >= u - LIP) { stopS = u - LIP; stopT = tAt(stopS); P.lip = true; }
      // 池
      const b = dx * POND.x + dz * POND.z, cc = POND.x * POND.x + POND.z * POND.z - POND.r * POND.r, disc = b * b - cc;
      if (disc > 0) { const sw = b - Math.sqrt(disc); if (sw > 0 && sw < stopS) { stopS = sw + 0.4; stopT = tAt(Math.min(sd, sw)); P.water = true; P.lip = false; } }
      P.roll = { sd, ts, stopS, stopT };
      P.tl = stopT; P.rest = { x: dx * stopS, z: dz * stopS };
    } else {
      const vy = v * cl[1], vh = v * cl[2], tl = 2 * vy / G, carry = vh * tl;
      P.fl = { vy, vh, tl, carry };
      const lx = dx * carry, lz = dz * carry;
      P.water = dist(lx, lz, POND.x, POND.z) < POND.r;
      const k = P.water ? 1 : 1.04;
      P.rest = { x: lx * k, z: lz * k };
      P.tl = tl + (P.water ? 0 : 0.6);
    }
    // 場面
    const dc = dist(P.rest.x, P.rest.z, CUP.x, CUP.z);
    let cats;
    if (P.water) cats = 'w';
    else {
      cats = P.lip || dc < 3 ? 'p' : dc < 15 ? 'n' : dc < 60 ? 'm' : dc < 150 ? 'f' : 'x';
      if (c === 1 && p >= 40) cats += 'h';
      if (dz > 0) cats += 'b';
    }
    P.cats = cats;
    // 理由をえらぶ
    const el = [];
    for (let i = 0; i < R.length; i++) { const rc = R[i][2]; for (let j = 0; j < cats.length; j++) if (rc.indexOf(cats[j]) >= 0) { el.push(i); break; } }
    const r = rng(seed ^ Math.imul(c * 7919 + d * 104729 + p * 15485863 + 1, 0x9E3779B1));
    const ri = el.length ? el[Math.floor(r() * el.length)] : -1;
    P.ri = ri;
    const rs = ri >= 0 ? R[ri] : ['none', 'warp', cats, { o: 'portal' }, { delay: 1 }];
    P.type = rs[1];
    const q = rs[4] || {};
    P.q = q;
    P.j = 0.85 + 0.3 * r();       // ばらつき
    // 起きる場所と時刻
    let te = P.tl, E = { x: P.rest.x, y: 0, z: P.rest.z };
    if (P.type === 'bounce' || P.type === 'air') {
      const f = P.type === 'air' ? 0.5 : num(q.f, 0.3, 0.9, 0.6);
      if (c === 0) { const tt = P.roll.stopT * f, s = v * tt - DECEL * tt * tt / 2; te = tt; E = { x: dx * s, y: 0, z: dz * s }; }
      else { const tt = P.fl.tl * f, h = P.fl.vh * tt; te = tt; E = { x: dx * h, y: P.fl.vy * tt - G * tt * tt / 2, z: dz * h }; }
    }
    P.te = te; P.E = E;
    const ec = dist(E.x, E.z, CUP.x, CUP.z);
    P.ec = ec;
    const arc = (k1) => 0.6 + ec / (k1 + 0.08 * ec);
    const S = [];
    const sg = (k, dd, fx) => S.push({ k, d: dd, fx });
    switch (P.type) {
      case 'kick': { const spd = num(q.spd, 0.5, 8, 3); sg('wait', 0, 1); sg('come', 4 / spd, .25); sg('kick', .35, 0); sg('roll', Math.max(.6, ec / 2.2), .25); break; }
      case 'carry': { const spd = num(q.spd, 0.5, 60, 4) * P.j, mv = q.mv || 'walk'; const da = mv === 'fly' ? 14 : mv === 'drive' ? 18 : 6; P.da = da; sg('wait', 0, .6); sg('come', da / spd, .2); sg('pick', .5, 0); sg('go', ec / spd, .6); sg('drop', .6, 0); break; }
      case 'hit': { sg('wait', 0, .5); sg('appear', .8, 0); sg('swing', .3, 0); sg('arc', arc(14), 1); break; }
      case 'bounce': { const h = num(q.h, 0.3, 4, 1); sg('arc', arc(14) * (0.7 + 0.3 * h), 1); break; }
      case 'air': { const spd = num(q.spd, 2, 80, 14) * P.j; sg('grab', .5, 0); sg('fly', ec / spd + .3, 1); sg('drop', .6, 0); break; }
      case 'erupt': { sg('wait', num(q.delay, 0, 3, .8), .8); sg('burst', .4, 0); sg('arc', arc(12), .6); break; }
      case 'roll': { const spd = num(q.spd, 0.3, 8, 2), cv = num(q.curve, -1, 1, 0); sg('wait', 0, .8); sg('roll', ec * (1 + 0.6 * (cv < 0 ? -cv : cv)) / spd, .6); break; }
      case 'cupmove': { const spd = num(q.spd, 0.3, 10, 2); sg('wait', 0, .8); sg('move', ec / spd, .6); sg('drop', .4, 0); break; }
      case 'boss': { const db = dist(BOSS.x, BOSS.z, E.x, E.z); P.db = db; sg('wait', 0, 1); sg('act', 1 + db / 3, .3); sg('push', .4 + ec / 5, .3); break; }
      case 'water': { sg('wait', num(q.delay, 0, 3, 1), .8); sg('emerge', .7, 0); sg('arc', arc(12), .6); break; }
      default: { P.type = 'warp'; sg('wait', num(q.delay, 0, 8, 1), .5); sg('vanish', .8, 0); sg('fall', 1.4, .5); break; }
    }
    let sum = 0, fsum = 0; for (const s of S) { sum += s.d; fsum += s.fx; }
    const Rr = te + sum;
    const T = TMIN + (TMAX - TMIN) * Rr / (Rr + K);
    const A = T - te;
    if (A >= sum) { const ex = A - sum; for (const s of S) s.d = s.d + (fsum > 0 ? ex * s.fx / fsum : ex / S.length); }
    else { const k2 = A / sum; for (const s of S) s.d = s.d * k2; }
    let t0 = te; for (const s of S) { s.t0 = t0; t0 += s.d; }
    P.segs = S; P.T = T; P.ms = Math.round(T * 1000);
    return P;
  }
  // 入力の文字 "c.d.p"
  function parseIn(s) {
    if (typeof s !== 'string' || !/^[0-4]\.\d{1,2}\.\d{1,3}$/.test(s)) return null;
    const [c, d, p] = s.split('.').map(Number);
    if (d > 71 || p > 100) return null;
    return { c, d, p };
  }
  // 記録の確かめ（勝ってしまった記録）
  function check(rec) {
    try {
      if (!rec || rec.v !== V || typeof rec.st !== 'number') return false;
      const o = parseIn(rec.in); if (!o) return false;
      const P = shot(o.c, o.d, o.p, seedOf(rec.st));
      return P.ms === rec.s;
    } catch (e) { return false; }
  }
  // 譲った記録の確かめ：入る前にちゃんと間に合っているか
  function checkYuzu(rec) {
    try {
      if (!rec || rec.v !== V || typeof rec.st !== 'number' || typeof rec.b !== 'number') return false;
      const o = parseIn(rec.in); if (!o) return false;
      const P = shot(o.c, o.d, o.p, seedOf(rec.st));
      return rec.b >= 0 && rec.b <= P.ms - 300;
    } catch (e) { return false; }
  }
  const SG = { V, G, CUP, POND, BOSS, DIR, CLUBS, DECEL, TMIN, TMAX, rng, seedOf, setReasons, shot, parseIn, check, checkYuzu, get R() { return R; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = SG;
  else root.SG = SG;
})(typeof self !== 'undefined' ? self : this);
