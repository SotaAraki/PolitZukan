import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const card = document.getElementById('card');
const sfx = document.getElementById('sfx');
const okButton = document.getElementById('okButton');
const voteBox = document.getElementById('voteBox'); // 投票箱
const packWrapper = document.getElementById('packWrapper');
let opened = false;


async function loadRandomCard() {
  const snapshot = await getDocs(collection(db, "politicians"));
  const allCards = snapshot.docs.map(doc => doc.data());
  const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
  return randomCard;
}

// ...（Firebase初期化などそのまま）

packWrapper.addEventListener('click', async () => {
  if (opened) return;

  const user = auth.currentUser;
  if (!user) {
    alert("ガチャを引くにはログインが必要です。ログインページに移動します。");
    window.location.href = "PZlogin.html";
    return;
  }

  opened = true;

  // 投票箱アニメーション
  voteBox.classList.add('show');
  const voteBoxWrapper = document.getElementById('voteBoxWrapper');
  if (voteBoxWrapper) {
    voteBoxWrapper.classList.add('show');
  } else {
    console.warn('voteBoxWrapper が見つかりません');
  }

  setTimeout(() => {
    packWrapper.classList.add('sucked');
  }, 400);

  setTimeout(async () => {
    voteBox.src = './image/投票箱.png';
    sfx.currentTime = 0;
    sfx.play();

    const cardData = await loadRandomCard();
    const imageUrl = cardData.image_url;
    const userId = user.uid;
    const cardId = cardData.id || imageUrl;

    const userCardRef = doc(db, "users", userId, "collection", cardId);
    const snapshot = await getDoc(userCardRef);

    console.log("imageUrl:", imageUrl);

    if (!snapshot.exists()) {
      await setDoc(userCardRef, {
        name: cardData.name,
        image_url: imageUrl,
        obtainedAt: new Date()
      });
    }

    const cardImg = document.getElementById('cardImage');
    console.log(document.getElementById("cardImage").src);

    if (imageUrl) {
      cardImg.src = imageUrl;
      cardImg.style.display = 'block';
      console.log("✅ カード画像セット成功:", cardImg.src);
    } else {
      console.warn("❌ 画像URLが存在しません");
    }


    // 投票箱を非表示に
    voteBox.classList.remove('show');
    voteBoxWrapper.classList.remove('show');

    setTimeout(() => {
      // 表示トリガー（アニメーション）
      card.classList.add('fromBox', 'show');
      console.log("カード要素:", card);

      const openText = document.getElementById('openText');
if (openText) {
  openText.style.display = 'none';
}
    }, 200);

    setTimeout(() => {
      okButton.style.display = 'inline-block';
    }, 1200);
  }, 1200);
});

okButton.addEventListener('click', () => {
  window.location.href = 'PZhome.html';
});

