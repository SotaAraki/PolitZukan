import { auth } from "./authUtils.js";
import { getAllPoliticians, getLastGachaTime, setGachaTimestamp, saveUserCard } from "./dbUtils.js";

const card = document.getElementById('card');
const sfx = document.getElementById('sfx');
const okButton = document.getElementById('okButton');
const voteBox = document.getElementById('voteBox');
const packWrapper = document.getElementById('packWrapper');
let opened = false;

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function getTimeRemaining(lastTime) {
  const now = new Date();
  const diff = SIX_HOURS_MS - (now - lastTime);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { hours, minutes };
}

packWrapper.addEventListener('click', async () => {
  if (opened) return;

  const user = auth.currentUser;
  if (!user) {
    alert("ガチャを引くにはログインが必要です。ログインページに移動します。");
    window.location.href = "PZlogin.html";
    return;
  }

  const lastTime = await getLastGachaTime(user.uid);
  if (lastTime && new Date() - lastTime < SIX_HOURS_MS) {
    const { hours, minutes } = getTimeRemaining(lastTime);
    alert(`次のガチャは ${hours}時間${minutes}分後に引けます。`);
    return;
  }

  opened = true;
  await setGachaTimestamp(user.uid);

  voteBox.classList.add('show');
  setTimeout(() => {
    packWrapper.classList.add('sucked');
  }, 400);

  setTimeout(async () => {
    voteBox.src = './image/投票箱.png';
    sfx.currentTime = 0;
    sfx.play();

    const cards = await getAllPoliticians();
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    await saveUserCard(user.uid, randomCard);

    const cardImg = document.getElementById('cardImage');
    cardImg.src = randomCard.image_url;
    cardImg.style.display = 'block';

    voteBox.classList.remove('show');

    setTimeout(() => {
      card.classList.add('fromBox', 'show');
      document.getElementById('openText').style.display = 'none';
    }, 200);

    setTimeout(() => {
      okButton.style.display = 'inline-block';
    }, 1200);
  }, 1200);
});

okButton.addEventListener('click', () => {
  window.location.href = 'PZHome.html';
});
