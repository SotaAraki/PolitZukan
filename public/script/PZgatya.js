import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leftHalf = document.getElementById('leftHalf');
const rightHalf = document.getElementById('rightHalf');
const card = document.getElementById('card');
const sfx = document.getElementById('sfx');
const blood = document.getElementById('bloodSplash');
const okButton = document.getElementById('okButton');
let opened = false;

async function loadRandomCard() {
  const snapshot = await getDocs(collection(db, "politicians"));
  const allCards = snapshot.docs.map(doc => doc.data());
  const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
  return randomCard;
}

document.getElementById('packWrapper').addEventListener('click', async () => {
  if (opened) return;
  opened = true;

  leftHalf.classList.add('openedLeft');
  rightHalf.classList.add('openedRight');

  blood.classList.add('show');
  setTimeout(() => blood.classList.remove('show'), 1000);

  setTimeout(() => {
    sfx.currentTime = 0;
    sfx.play();
  }, 300);

  const cardData = await loadRandomCard();
  const imageUrl = cardData.image_url;

  card.style.backgroundImage = `url(${imageUrl})`;
  localStorage.setItem(`gotHobby_${imageUrl}`, "true");

  setTimeout(() => {
    card.classList.add('show');
  }, 700);

  setTimeout(() => {
    okButton.style.display = 'inline-block';
  }, 1200);
});

okButton.addEventListener('click', () => {
  window.location.href = 'PZhome.html';
});
