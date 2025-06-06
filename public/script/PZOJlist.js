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
  container.innerHTML = ""; // 一度クリア

  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const pageItems = politicians.slice(start, end);

  pageItems.forEach(data => {
    const card = document.createElement("div");
    card.innerHTML = `
      <img src="${data.image_url}" alt="${data.name}">
    `;
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

loadPoliticians();
