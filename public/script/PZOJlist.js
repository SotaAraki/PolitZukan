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

let currentPage = 1;
const cardsPerPage = 8;
let politicians = [];

async function loadPoliticians() {
  const querySnapshot = await getDocs(collection(db, "politicians"));
  politicians = querySnapshot.docs.map(doc => doc.data());
  renderPage(currentPage);
}

function renderPage(page) {
  const container = document.getElementById("politician-list");
  container.innerHTML = "";

  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const pageItems = politicians.slice(start, end);

  pageItems.forEach(data => {
    const card = document.createElement("div");
    const img = document.createElement("img");
    img.src = data.image_url;
    img.alt = data.name;
    img.style.cursor = "pointer";

    // 画像クリックでモーダル表示
    img.addEventListener("click", () => {
      document.getElementById("popup-name").textContent = data.name;
      document.getElementById("popup-image").src = data.image_url;
      document.getElementById("popup-description").textContent = data.description || "";
      // ガチャで当てたか確認
      const gotHobby = localStorage.getItem(`gotHobby_${data.image_url}`) === "true";
      const hobbyElement = document.getElementById("popup-hobby");

      if (gotHobby) {
        hobbyElement.textContent = `趣味: ${data.hobbies}`;
        hobbyElement.style.display = "block";
      } else {
        hobbyElement.textContent = "";
        hobbyElement.style.display = "none";
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
  });

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
});

loadPoliticians();
