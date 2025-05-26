/*
jsに以下を追加
上のimportの部分に追加↓
// 共通のアニメーション処理
import { startFloatingCards } from "./floatingCards.js";

これをどこかしらに追加↓
// 背景カードをふわふわ動かす処理（共通関数で呼び出す）
document.addEventListener("DOMContentLoaded", () => {
  startFloatingCards(); // 共通処理を呼び出す
});

htmlに以下を追加
body内に追加↓
<!-- 背景カード画像を複数散らす -->
<div class="background-cards">
    <img src="image/ojisan.webp" class="bg-card" alt="カード1">
    <img src="image/ojisan.webp" class="bg-card" alt="カード2">
    <img src="image/ojisan.webp" class="bg-card" alt="カード3">
    <img src="image/ojisan.webp" class="bg-card" alt="カード4">
    <img src="image/ojisan.webp" class="bg-card" alt="カード5">
    <img src="image/ojisan.webp" class="bg-card" alt="カード6">
</div>

下のscript内に追加して読み込み↓
<script type="module" src="script/floatingCards.js"></script>
*/


// カードを浮かせる処理
export function startFloatingCards() {
  const cards = document.querySelectorAll('.bg-card');
  cards.forEach((card) => {
    const startX = Math.random() * (window.innerWidth - 120);
    const startY = Math.random() * (window.innerHeight - 120);
    card.style.left = `${startX}px`;
    card.style.top = `${startY}px`;

    let originX = startX;
    let originY = startY;
    let x = startX;
    let y = startY;
    let dx = (Math.random() - 0.5) * 0.4;
    let dy = (Math.random() - 0.5) * 0.4;

    function animate() {
      x += dx;
      y += dy;

      if (Math.abs(x - originX) > 20) dx *= -1;
      if (Math.abs(y - originY) > 20) dy *= -1;

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      requestAnimationFrame(animate);
    }

    animate();
  });
}
