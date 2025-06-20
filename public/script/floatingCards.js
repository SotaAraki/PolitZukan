/*
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
html内に以下のコードを追加
<!-- 背景を動かす処理 -->
<script type="module" src="script/floatingCards.js"></script>
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
*/


// 背景カードの画像パスと枚数（必要に応じて変更可能）
// 表示するカード画像のファイルパス
const cardImages = [
  "image/ojisan.webp",
  "image/ojisan2.webp",
  "image/ojisan3.webp",
  "image/石破茂.png"
];
const cardCount = 6;                       // 表示するカードの枚数

// 背景カードの親要素とカード要素を作成する関数
function createBackgroundCards() {
  const container = document.createElement("div");  // 背景カードをまとめる親divを作成
  container.className = "background-cards";          // CSSクラス名を設定（スタイル適用用）

  // 指定枚数分のカード画像要素を作成し、親に追加していく
  for (let i = 0; i < cardCount; i++) {
    const img = document.createElement("img");       // img要素を作成

    // ランダムに画像を選ぶ（被りOK）
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    img.src = cardImages[randomIndex];

    //img.src = cardImageSrc;                           // 画像のパスをセット
    img.alt = `カード${i + 1}`;                       // 代替テキスト（アクセシビリティ用）
    img.className = "bg-card";                        // CSSクラス名を設定（浮遊アニメ用）
    container.appendChild(img);                       // 親divにカード画像を追加
  }

  // body要素の先頭に、背景カードをまとめたdivを追加
  // なるべくbody内の上の方に追加して、コンテンツより後ろ（背景）になるようにする
  document.body.insertBefore(container, document.body.firstChild);
}

// カードの浮遊アニメーションを開始する関数（exportされ外部からも呼べる）
// ここでカードの初期位置決めと微小な動きの繰り返し処理を設定する
export function startFloatingCards() {
  // 背景カードのすべてのimg要素を取得
  const cards = document.querySelectorAll('.bg-card');

  cards.forEach((card) => {
    // 画面内のランダムな初期位置を設定（120pxの余裕を残す）
    const startX = Math.random() * (window.innerWidth - 120);
    const startY = Math.random() * (window.innerHeight - 120);
    card.style.left = `${startX}px`;  // 左位置をセット
    card.style.top = `${startY}px`;   // 上位置をセット

    // 位置の基準点を保存（この点を中心に小刻みに動く）
    let originX = startX;
    let originY = startY;

    // 現在のx,y座標（位置）を保存
    let x = startX;
    let y = startY;

    // x,y方向の移動速度（dx, dy）をランダムに決定（-0.2〜+0.2程度）
    let dx = (Math.random() - 0.5) * 0.4;
    let dy = (Math.random() - 0.5) * 0.4;

    // アニメーション用の再帰関数
    function animate() {
      // 位置を速度分だけ移動
      x += dx;
      y += dy;

      // 基準点から20px以上離れたら移動方向を反転して往復運動にする
      if (Math.abs(x - originX) > 20) dx *= -1;
      if (Math.abs(y - originY) > 20) dy *= -1;

      // カードのCSSのleft, topを更新して画面上の位置を変える
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      // 次のフレームでanimate関数を呼び続ける（ループ処理）
      requestAnimationFrame(animate);
    }

    // 最初の1回だけ呼び出しアニメ開始
    animate();
  });
}

// CSSスタイルを文字列で定義（JS内に埋め込み）
// 背景カードとカード画像の基本スタイルをここにまとめて書いている
const cardStyle = `
  .background-cards {
    position: absolute;     /* 背景として固定配置 */
    width: 100%;            /* 画面全体を覆う */
    height: 100%;
    pointer-events: none;   /* 背景にしてクリックなどのイベントは無効 */
    z-index: 0;             /* 他のコンテンツより背面に配置 */
  }

  .bg-card {
    position: absolute;     /* 個々のカードは自由に動かせる */
    width: 100px;           /* カードの幅を固定 */
    height: auto;           /* 高さは画像の比率で自動調整 */
    opacity: 0.65;          /* 半透明にして背景感を出す */
    z-index: 0;             /* 背景として最背面 */
    transition: transform 0.1s linear; /* 変形のスムーズな切り替え */
  }
`;

// <style> タグを新規作成し、上記CSSスタイルをセット
const styleTag = document.createElement('style');
styleTag.textContent = cardStyle;

// <head>内に<style>タグを追加し、ページ全体にCSSを適用
document.head.appendChild(styleTag);

// DOMが完全に読み込まれたタイミングで実行
document.addEventListener("DOMContentLoaded", () => {
  createBackgroundCards();  // 背景カードの要素を生成して画面に追加
  startFloatingCards();     // 背景カードの浮遊アニメをスタート
});
