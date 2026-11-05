// 接待ゴルフ：打った球の計算（ゲームと記録の確認で同じものを使う）
// 足す・引く・かける・わる・平方根だけで計算するので、どの端末でも同じ「入るまでの時間」になる
(function (root) {
  const V = 1;                    // 計算の版（理由の並びを変えるときは版を上げる）
  const G = 9.8;
  const CUP = { x: 0, z: -5 };    // カップ（打つ場所から5m先）
  const POND = { x: -7, z: -6, r: 3.5 };
  const BOSS = { x: 1.6, z: -5.7 };
  const TMIN = 10, TMAX = 60, K = 18;
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

  let R = [];                     // 理由の一覧（setReasons で入れる）
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
