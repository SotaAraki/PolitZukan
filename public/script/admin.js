import { app } from "./firebase.js";
import {
  getFirestore,
  collectionGroup,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase 初期化
const db = getFirestore(app);
const auth = getAuth(app);
const tbody = document.getElementById("report-table-body");

// =========================
// ✅ Admin チェック
// =========================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("ログインしてください");
    window.location.href = "PZlogin.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().isAdmin) {
      alert("このページにアクセスする権限がありません");
      window.location.href = "PZHome.html";
      return;
    }

    // ✅ Admin 通過 → 通報一覧を読み込み
    loadReportedComments();
  } catch (error) {
    console.error("管理者チェックエラー:", error);
    alert("管理者情報の確認中にエラーが発生しました");
  }
});

// =========================
// 🔍 通報コメント読み込み
// =========================
async function loadReportedComments() {
  tbody.innerHTML = "<tr><td colspan='6'>読み込み中...</td></tr>";

  const q = query(
    collectionGroup(db, "replies"),
    orderBy("reportedCount", "desc")
  );

  const qSnap = await getDocs(q);

  tbody.innerHTML = "";

  if (qSnap.empty) {
    tbody.innerHTML = "<tr><td colspan='6'>通報されたコメントはありません</td></tr>";
    return;
  }

  qSnap.forEach(docSnap => {
    const data = docSnap.data();

    // 通報数1以上のみ表示
    if (data.reportedCount && data.reportedCount > 0) {
      const tr = document.createElement("tr");
      tr.dataset.hidden = data.hidden;

      tr.innerHTML = `
        <td>${docSnap.ref.parent.parent.id}</td>
        <td>${docSnap.id}</td>
        <td>${data.text}</td>
        <td>${data.reportedCount}</td>
        <td>${data.hidden ? "非表示" : "表示中"}</td>
        <td>
          <button data-action="toggle" data-path="${docSnap.ref.path}" data-hidden="${data.hidden}">
            ${data.hidden ? "復活" : "非表示"}
          </button>
          <button data-action="delete" data-path="${docSnap.ref.path}">削除</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });

  console.log("▶️ 通報返信件数:", qSnap.size);
}

// =========================
// ⚙️ ボタン操作イベント
// =========================
tbody.addEventListener("click", async (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const button = e.target;
  const action = button.dataset.action;
  const path = button.dataset.path;

  button.disabled = true;

  try {
    if (action === "toggle") {
      const hidden = button.dataset.hidden === "true";
      await updateDoc(doc(db, path), { hidden: !hidden });
      alert(hidden ? "復活しました" : "非表示にしました");
    }

    if (action === "delete") {
      if (confirm("本当に削除しますか？")) {
        await deleteDoc(doc(db, path));
        alert("削除しました");
      }
    }

    await loadReportedComments(); // 再読み込み
  } catch (err) {
    console.error("操作エラー:", err);
    alert("操作に失敗しました");
  } finally {
    button.disabled = false;
  }
});
