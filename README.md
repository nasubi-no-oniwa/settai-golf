# 接待ゴルフ

最終ホール。部長に勝たせないといけないのに、どう打っても入ってしまう。入るまでの時間が長いほど上。

遊ぶ：https://nasubi-no-oniwa.github.io/settai-golf/

- `index.html` … ゲーム本体（`src/` の部品を `python3 build.py` で組み立てたもの）
- `sim.js` … 打った球の計算と、入る理由の一覧（ゲームと記録の確認で同じものを使う）。`engine.js` と `reasons/part_*.json` から組み立てる
- 理由の並びを変えると昔の記録の計算が合わなくなるので、公開後は理由を足すときも `engine.js` の版（V）を上げて古い並びを残すこと
- `database.rules.sg.json` … ランキングのルール。GitHub に上げると自動で ft-green の `sg` に反映（ほかのゲームのルールはそのまま）
- `sg-remove.txt` … 消したい記録のIDを1行ずつ書いて上げると、その記録を消す
- 記録の確認は10分ごとに自動で動き、計算が合わない記録を消す
