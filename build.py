# 組み立て：engine.js ＋ 理由の一覧 → sim.js、src/*.html|js → index.html
import json,glob,sys
parts=sorted(glob.glob('reasons/part_*.json'))
R=[]
for p in parts:R+=json.load(open(p,encoding='utf8'))
if not R or '--test' in sys.argv:
  R=json.load(open('reasons/test.json',encoding='utf8'))
eng=open('engine.js',encoding='utf8').read()
assert 'let R = [];' in eng
js=json.dumps(R,ensure_ascii=False,separators=(',',':')).replace('],[','],\n[')
open('sim.js','w',encoding='utf8').write(eng.replace('let R = [];','let R = '+js+';'))
src='src/'
order=['head.html','a_text.js','b_world.js','c_actors.js','d_timeline.js','e_flow.js','f_rank.js','g_main.js']
open('index.html','w',encoding='utf8').write(''.join(open(src+p,encoding='utf8').read() for p in order))
print('理由',len(R),'件')
