import { auth, observeAuth } from "./authUtils.js";
import { getAllPoliticians, checkUserHasCard } from "./dbUtils.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore();

let currentPage = 1;
const cardsPerPage = 8;
let politicians = [];
let currentUserId = null;
let ownedCardIds = new Set();
let favoriteCardIds = new Set();

async function loadPoliticians() {
  politicians = await getAllPoliticians();
  renderPage(currentPage);
}

async function loadUserCollection(userId) {
  ownedCardIds.clear();
  const snapshot = await getDocs(collection(db, `users/${userId}/collection`));
  snapshot.forEach(doc => {
    ownedCardIds.add(doc.id);
  });

  // お気に入りも取得
  const favSnap = await getDocs(collection(db, `users/${userId}/favorites`));
  favSnap.forEach(doc => {
    favoriteCardIds.add(doc.id);
  });
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
    const cardId = data.id || data.image_url;

    // グレーかどうか
    if (!ownedCardIds.has(cardId)) {
      img.style.filter = "grayscale(100%)";
    }

    img.addEventListener("click", async () => {
      document.getElementById("popup-name").textContent = data.name;
      document.getElementById("popup-image").src = data.image_url;
      document.getElementById("popup-description").textContent = data.description || "";

      const hobbyElement = document.getElementById("popup-hobby");
      if (ownedCardIds.has(cardId)) {
        hobbyElement.textContent = `趣味: ${data.hobbies}`;
      } else {
        hobbyElement.textContent = "カードを所持していません";
      }
      hobbyElement.style.display = "block";
      // 実績リスト
      const list = document.getElementById("achievements-list");
      list.innerHTML = "";
      if (Array.isArray(data.achievements) && data.achievements.length > 0) {
        list.parentElement.style.display = "block";
        data.achievements.forEach(a => {
          const item = document.createElement("li");
          item.textContent = `${a.year}年：${a.event} - ${a.detail}`;
          list.appendChild(item);
        });
      } else {
        list.parentElement.style.display = "none";
      }

      const favButton = document.getElementById("favorite-button");
      if (favoriteCardIds.has(cardId)) {
        favButton.textContent = "お気に入り解除";
        favButton.onclick = () => removeFavorite(cardId);
      } else {
        favButton.textContent = "お気に入り登録";
        favButton.onclick = () => addFavorite(cardId, data);
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

async function addFavorite(cardId, data) {
  if (!currentUserId) return;
  await setDoc(doc(db, `users/${currentUserId}/favorites/${cardId}`), {
    createdAt: new Date(),
    name: data.name,
    image_url: data.image_url // ←これが超重要
  });
  favoriteCardIds.add(cardId);
  document.getElementById("popup").style.display = "none";
  renderPage(currentPage);
}


async function removeFavorite(cardId) {
  if (!currentUserId) return;
  await deleteDoc(doc(db, `users/${currentUserId}/favorites/${cardId}`));
  favoriteCardIds.delete(cardId);
  alert(`お気に入りを解除しました`);
  document.getElementById("popup").style.display = "none";
  renderPage(currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("popup").style.display = "none";
  });

  observeAuth(async (user) => {
    if (user) {
      currentUserId = user.uid;
      await loadUserCollection(user.uid);
    } else {
      currentUserId = null;
      ownedCardIds.clear();
      favoriteCardIds.clear();
    }
    loadPoliticians();
  });
});
