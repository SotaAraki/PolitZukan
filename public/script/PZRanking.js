import { getFirestore, collectionGroup, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

const container = document.getElementById("ranking-container");

async function loadRanking() {
  container.innerHTML = "読み込み中...";

  const snapshot = await getDocs(collectionGroup(db, "favorites"));
  const counts = {};

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const cardId = docSnap.id;
    const name = data.name || "不明";
    const imageUrl = data.image_url || "";

    if (!counts[cardId]) {
      counts[cardId] = { count: 0, name, image_url: imageUrl };
    }
    counts[cardId].count++;
  });

  const ranking = Object.entries(counts)
  .map(([id, info]) => ({ id, ...info }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

  if (ranking.length === 0) {
    container.textContent = "まだお気に入りが登録されていません";
    return;
  }

  container.innerHTML = "";

  ranking.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = `ranking-card rank-${index + 1}`;

    const badge = document.createElement("div");
    badge.className = "rank-badge";
    if (index === 0) badge.textContent = "🥇 1位";
    else if (index === 1) badge.textContent = "🥈 2位";
    else if (index === 2) badge.textContent = "🥉 3位";
    else badge.textContent = `#${index + 1}`;

    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = item.name;
    img.className = "card-image";

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = item.name;

    const count = document.createElement("div");
    count.className = "card-count";
    count.textContent = `お気に入り数: ${item.count}`;

    card.appendChild(badge);
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(count);

    container.appendChild(card);
  });
}

loadRanking();
