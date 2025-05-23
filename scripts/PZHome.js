document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.bg-card');

  cards.forEach((card) => {
    // 初期位置を設定
    const startX = Math.random() * (window.innerWidth - 120);
    const startY = Math.random() * (window.innerHeight - 120);
    card.style.left = `${startX}px`;
    card.style.top = `${startY}px`;

    // 保存用
    let originX = startX;
    let originY = startY;

    // 現在位置
    let x = startX;
    let y = startY;

    // ランダムな速度・方向
    let dx = (Math.random() - 0.5) * 0.4;
    let dy = (Math.random() - 0.5) * 0.4;

    function animate() {
      // 新しい位置
      x += dx;
      y += dy;

      // ±20px以内かチェック（超えたら逆方向）
      if (Math.abs(x - originX) > 20) dx *= -1;
      if (Math.abs(y - originY) > 20) dy *= -1;

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      requestAnimationFrame(animate);
    }

    animate();
  });
});
