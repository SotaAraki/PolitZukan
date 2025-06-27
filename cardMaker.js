// 入力内容の反映
document.getElementById('circleText').addEventListener('input', function () {
  document.getElementById('circle').textContent = this.value || '白';
});

document.getElementById('nameText').addEventListener('input', function () {
  document.getElementById('name').textContent = this.value || '名前';
});

document.getElementById('skillText').addEventListener('input', function () {
  document.getElementById('skill').textContent = this.value || '技名';
});

document.getElementById('footerText').addEventListener('input', function () {
  document.getElementById('footer').textContent = this.value || 'S56';
});

// 画像アップロード → 背景として設定
document.getElementById('imageInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    // 背景画像セット
    document.getElementById('cardBackground').style.backgroundImage = `url(${e.target.result})`;
  };
  reader.readAsDataURL(file);
});

// 背景画像の位置・サイズの初期値（%）
let posX = 50;
let posY = 50;
let scale = 100;

const background = document.getElementById('cardBackground');

// 背景画像の表示位置とサイズを更新する関数
function updateBackground() {
  // background-position: X% Y%
  background.style.backgroundPosition = `${posX}% ${posY}%`;

  // background-size: scale% auto (縦横比維持のためauto)
  background.style.backgroundSize = `${scale}% auto`;
}

// スライダーイベント設定（X位置）
document.getElementById('posXRange').addEventListener('input', (e) => {
  posX = e.target.value;
  updateBackground();
});

// スライダーイベント設定（Y位置）
document.getElementById('posYRange').addEventListener('input', (e) => {
  posY = e.target.value;
  updateBackground();
});

// スライダーイベント設定（拡大縮小）
document.getElementById('scaleRange').addEventListener('input', (e) => {
  scale = e.target.value;
  updateBackground();
});

// 初期化で一度反映
updateBackground();

// ダウンロード処理
document.getElementById('downloadBtn').addEventListener('click', function () {
  const card = document.getElementById('card');
  html2canvas(card, {
    scale: 2,
    useCORS: true
  }).then((canvas) => {
    const link = document.createElement('a');

    // 入力された名前を取得して、空なら "card" を使用
    const nameInput = document.getElementById('nameText').value.trim();
    const fileName = nameInput !== '' ? `${nameInput}card.png` : 'card.png';

    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

