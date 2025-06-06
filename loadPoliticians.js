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

async function loadPoliticians() {
  const querySnapshot = await getDocs(collection(db, "politicians"));
  const container = document.getElementById("politician-list");

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement("div");
    card.innerHTML = `
      <h3>${data.name}</h3>
      <img src="${data.image_url}" alt="${data.name}" width="150">
      <p>${data.description}</p>
    `;
    container.appendChild(card);
  });
}

loadPoliticians();
