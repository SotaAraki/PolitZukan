import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const container = document.getElementById("opinions-container");
const submitButton = document.getElementById("submit-opinion");
const textarea = document.getElementById("opinion-text");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadOpinions();
  } else {
    container.textContent = "ログインが必要です。";
    submitButton.disabled = true;
  }
});

async function loadOpinions() {
  container.textContent = "読み込み中...";
  const q = query(collection(db, "opinions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  container.innerHTML = "";
  snap.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "opinion";

    const author = document.createElement("div");
    author.className = "opinion-author";
    author.textContent = data.displayName || "匿名";

    const text = document.createElement("div");
    text.className = "opinion-text";
    text.textContent = data.text;

    div.appendChild(author);
    div.appendChild(text);
    container.appendChild(div);
  });
}

submitButton.addEventListener("click", async () => {
  const text = textarea.value.trim();
  if (!text) {
    alert("意見を入力してください。");
    return;
  }
  if (!currentUser) {
    alert("ログインが必要です。");
    return;
  }
  await addDoc(collection(db, "opinions"), {
    uid: currentUser.uid,
    displayName: currentUser.displayName || "匿名",
    text,
    createdAt: serverTimestamp()
  });
  textarea.value = "";
  await loadOpinions();
});
