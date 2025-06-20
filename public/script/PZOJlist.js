import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

//Firebaseプロジェクトの設定
const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentPage = 1;
const cardsPerPage = 8;
let politicians = [];
let currentUserId = null;

async function loadPoliticians() {
  const querySnapshot = await getDocs(collection(db, "politicians"));
  politicians = querySnapshot.docs.map(doc => doc.data());
  renderPage(currentPage);
}

async function checkCardOwnership(userId, cardId) {
  const ref = doc(db, "users", userId, "collection", cardId);
  const snap = await getDoc(ref);
  return snap.exists();
}

async function renderPage(page) {
  const container = document.getElementById("politician-list");
  container.innerHTML = "";

  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const pageItems = politicians.slice(start, end);

  for (const data of pageItems) {
    const card = document.createElement("div");
    const img = document.createElement("img");
    img.src = data.image_url;
    img.alt = data.name;
    img.style.cursor = "pointer";

    // 画像クリックでモーダル表示
    img.addEventListener("click", async () => {
      document.getElementById("popup-name").textContent = data.name;
      document.getElementById("popup-image").src = data.image_url;
      document.getElementById("popup-description").textContent = data.description || "";

      const hobbyElement = document.getElementById("popup-hobby");
      const cardId = data.id || data.image_url;
      const hasCard = currentUserId ? await checkCardOwnership(currentUserId, cardId) : false;

      if (hasCard) {
        hobbyElement.textContent = `趣味: ${data.hobbies}`;
        hobbyElement.style.display = "block";
      } else {
        hobbyElement.textContent = "カードを所持していません";
        hobbyElement.style.display = "block";
      }

      const list = document.getElementById("achievements-list");
      list.innerHTML = "";
      if (data.achievements && Array.isArray(data.achievements)) {
        data.achievements.forEach(a => {
          const item = document.createElement("li");
          item.textContent = `${a.year}年：${a.event} - ${a.detail}`;
          list.appendChild(item);
        });
      }

      document.getElementById("popup").style.display = "block";
    });

    card.appendChild(img);
    container.appendChild(card);
  }

  document.getElementById("pageInfo").textContent = `${page} / ${Math.ceil(politicians.length / cardsPerPage)}`;
}

window.changePage = function (direction) {
  const maxPage = Math.ceil(politicians.length / cardsPerPage);
  const newPage = currentPage + direction;

  if (newPage >= 1 && newPage <= maxPage) {
    currentPage = newPage;
    renderPage(currentPage);
  }
};

// 閉じるボタン
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("popup").style.display = "none";
  });
  loadPoliticians();
  
});
