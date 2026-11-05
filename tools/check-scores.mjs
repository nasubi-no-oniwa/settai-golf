// ランキングの記録を、ゲームと同じ計算でやり直して確かめる。合わない記録と sg-remove.txt のIDの記録を消す
import fs from 'fs';
import { createRequire } from 'module';
import { token, api } from './fb.mjs';
const SG = createRequire(import.meta.url)('../sim.js');
const tk = await token();
const ban = new Set((fs.existsSync('sg-remove.txt') ? fs.readFileSync('sg-remove.txt', 'utf8') : '').split(/\s+/).filter(x => /^[A-Za-z0-9]{20,40}$/.test(x)));
let n = 0, rm = 0;
async function sweep(path, ok) {
  const d = JSON.parse(await api('GET', '/sg/' + path + '.json', undefined, tk)) || {};
  for (const [k, v] of Object.entries(d)) {
    n++; let why = '';
    if (ban.has(k)) why = '手で指定';
    else if (!ok(v)) why = '計算が合わない';
    if (why) { rm++; console.log('消す:', path, k, JSON.stringify(v.n || ''), v.s || v.b, why); await api('DELETE', '/sg/' + path + '/' + k + '.json', undefined, tk); }
  }
}
await sweep('all/scores', SG.check);
await sweep('d/scores', SG.check);
await sweep('yuzu', SG.checkYuzu);
console.log('確かめた', n, '件 / 消した', rm, '件');
