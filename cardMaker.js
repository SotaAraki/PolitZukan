// テキスト反映処理
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

// 背景画像読み込み
document.getElementById('bgInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('cardBackground').style.backgroundImage = `url(${e.target.result})`;
  };
  reader.readAsDataURL(file);
});

// 人物画像読み込み
document.getElementById('imageInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const personImage = document.getElementById('personImage');
    personImage.src = e.target.result;
    updatePersonImage(); // 調整反映
  };
  reader.readAsDataURL(file);
});

// 人物画像の位置・サイズ調整
let posX = 50;
let posY = 50;
let scale = 100;

function updatePersonImage() {
  const image = document.getElementById('personImage');
  image.style.left = `${posX}%`;
  image.style.top = `${posY}%`;
  image.style.width = `${scale}%`;
}

document.getElementById('posXRange').addEventListener('input', (e) => {
  posX = e.target.value;
  updatePersonImage();
});

document.getElementById('posYRange').addEventListener('input', (e) => {
  posY = e.target.value;
  updatePersonImage();
});

document.getElementById('scaleRange').addEventListener('input', (e) => {
  scale = e.target.value;
  updatePersonImage();
});

updatePersonImage();

// カード保存（ID_名前card.png）
document.getElementById('downloadBtn').addEventListener('click', function () {
  const card = document.getElementById('card');
  html2canvas(card, {
    scale: 2,
    useCORS: true
  }).then((canvas) => {
    const nameInput = document.getElementById('nameText').value.trim();
    const idInput = document.getElementById('idText').value.trim();
    const fileName = `${idInput || 'ID'}_${nameInput || 'card'}card.png`;

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});
