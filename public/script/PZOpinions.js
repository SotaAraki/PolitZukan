import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const container = document.getElementById("threads-container");
const openDialog = document.getElementById("open-thread-dialog");
const modal = document.getElementById("thread-modal");
const closeModal = document.getElementById("close-thread-modal");
const submitButton = document.getElementById("submit-thread");
const titleInput = document.getElementById("thread-title");
const bodyInput = document.getElementById("thread-body");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadThreads();
  } else {
    container.textContent = "ログインが必要です。";
    openDialog.disabled = true;
  }
});

async function loadThreads() {
  container.textContent = "読み込み中...";
  const q = query(collection(db, "threads"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  container.innerHTML = "";
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "thread";

    const title = document.createElement("div");
    title.className = "thread-title";
    title.textContent = data.title;

    const body = document.createElement("div");
    body.textContent = data.body || "";

    const count = document.createElement("div");
    count.textContent = "読み込み中...";

    // 件数を取得
    const repliesSnap = await getDocs(collection(db, `threads/${docSnap.id}/replies`));
    const replyCount = repliesSnap.size;
    count.textContent = `👥 返信：${replyCount}件`;

    div.appendChild(title);
    div.appendChild(body);
    div.appendChild(count);

    div.style.cursor = "pointer";
    div.addEventListener("click", () => {
      window.location.href = `PZThreadDetail.html?id=${docSnap.id}`;
    });

    container.appendChild(div);
  }
}


// モーダル表示
openDialog.addEventListener("click", () => {
  modal.style.display = "flex";
});

// 閉じる
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  titleInput.value = "";
  bodyInput.value = "";
});

// 作成
submitButton.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title) {
    alert("タイトルを入力してください。");
    return;
  }
  if (!currentUser) {
    alert("ログインが必要です。");
    return;
  }
  await addDoc(collection(db, "threads"), {
    uid: currentUser.uid,
    displayName: currentUser.displayName || "匿名",
    title,
    body,
    createdAt: serverTimestamp()
  });
  modal.style.display = "none";
  titleInput.value = "";
  bodyInput.value = "";
  await loadThreads();
});
