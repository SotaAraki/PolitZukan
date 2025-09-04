import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { checkPartyCompletion } from "./achievement.js";  // ←追加

const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function displayTitles(userId) {
  const achRef = doc(db, "users", userId, "achievements");
  const achSnap = await getDoc(achRef);
  const titleArea = document.getElementById("titleArea");

  if (achSnap.exists()) {
    const data = achSnap.data();
    titleArea.innerHTML = "";

    let hasTitle = false;
    for (const [party, completed] of Object.entries(data)) {
      if (completed) {
        hasTitle = true;
        const span = document.createElement("span");
        span.className = "gold-title";
        span.textContent = `${party}コンプリート`;
        titleArea.appendChild(span);
      }
    }
    if (!hasTitle) {
      titleArea.textContent = "まだ称号はありません";
    }
  } else {
    titleArea.textContent = "まだ称号はありません";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await checkPartyCompletion(user.uid);  // 共通モジュールを使用
    await displayTitles(user.uid);
  } else {
    alert("ログインしてください");
    window.location.href = "PZlogin.html";
  }
});
