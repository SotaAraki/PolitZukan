import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// === Firebase設定 ===
const auth = getAuth(app);
const db = getFirestore(app);
const PERSPECTIVE_API_KEY = "AIzaSyCKcUeNPMpKVwDCS2AfXWZHm_keJSiAuGs"; // ←取得したキーを設定

// === DOM要素取得 ===
const urlParams = new URLSearchParams(window.location.search);
const threadId = urlParams.get("id");

const titleEl = document.getElementById("thread-title");
const bodyEl = document.getElementById("thread-body");
const container = document.getElementById("replies-container");
const openRootReply = document.getElementById("open-root-reply");
const replyModal = document.getElementById("reply-modal");
const closeReplyModal = document.getElementById("close-reply-modal");
const modalTextarea = document.getElementById("modal-reply-text");
const modalSubmitButton = document.getElementById("modal-submit-reply");
const deleteThreadButton = document.getElementById("delete-thread-button");

let currentUser = null;
let currentParentId = null;
let threadOwnerUid = null;

// === ログイン状態確認 ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadThread();
    loadReplies();
  } else {
    container.textContent = "ログインが必要です。";
    openRootReply.disabled = true;
  }
});

// === スレッド情報読み込み ===
async function loadThread() {
  const ref = doc(db, "threads", threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    titleEl.textContent = "スレッドが見つかりません";
    return;
  }
  const data = snap.data();
  titleEl.textContent = data.title;
  bodyEl.textContent = data.body || "";
  threadOwnerUid = data.uid;

  if (currentUser && currentUser.uid === threadOwnerUid) {
    if (deleteThreadButton) deleteThreadButton.style.display = "inline-block";
  }
}

// === 返信読み込み ===
async function loadReplies() {
  container.textContent = "読み込み中...";
  const q = query(collection(db, `threads/${threadId}/replies`), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);

  container.innerHTML = "";
  const replies = {};
  const children = {};

  snap.forEach(docSnap => {
    const data = docSnap.data();
    replies[docSnap.id] = { id: docSnap.id, data };
    const parentId = data.parentReplyId || null;
    if (!children[parentId]) children[parentId] = [];
    children[parentId].push(docSnap.id);
  });

  (children[null] || []).forEach(replyId => {
    const reply = replies[replyId];
    const div = createReplyElement(reply, 0, children, replies);
    container.appendChild(div);
  });
}

// === Perspective APIで不適切判定 ===
async function isToxicComment(text) {
  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
    {
      method: "POST",
      body: JSON.stringify({
        comment: { text },
        languages: ["ja"],
        requestedAttributes: { TOXICITY: {} }
      })
    }
  );

  const result = await response.json();
  const score = result.attributeScores.TOXICITY.summaryScore.value;
  console.log("Toxicity score:", score);
  return score > 0.1; // 0.8以上を不適切と判断
}

// === 返信表示UI作成 ===
function createReplyElement(reply, depth, childrenMap, allReplies) {
  const { id, data } = reply;
  const div = document.createElement("div");
  div.className = "reply";
  div.style.marginLeft = `${depth * 20}px`;

  if (data.hidden) {
    div.textContent = "⚠️ この投稿は通報により非表示になっています";
    div.style.color = "#999";
    return div;
  }

  const text = document.createElement("div");
  text.className = "reply-text";
  text.textContent = data.text;

  // スレ主表示
  if (data.uid === threadOwnerUid) {
    const ownerBadge = document.createElement("div");
    ownerBadge.textContent = "スレ主";
    ownerBadge.style.fontSize = "0.75em";
    ownerBadge.style.fontWeight = "bold";
    ownerBadge.style.color = "#FFD700";
    ownerBadge.style.marginBottom = "4px";
    div.appendChild(ownerBadge);
    div.style.border = "1px solid #FFD700";
  }
  div.appendChild(text);

  // アクションボタン
  const actions = document.createElement("div");
  actions.className = "reply-actions";

  // 返信ボタン
  const replyButton = document.createElement("button");
  replyButton.textContent = "返信";
  replyButton.addEventListener("click", () => {
    currentParentId = id;
    replyModal.style.display = "flex";
  });
  actions.appendChild(replyButton);

  // 通報ボタン
  const reportButton = document.createElement("button");
  reportButton.textContent = "⚠️ 通報";
  reportButton.addEventListener("click", async () => {
    if (!currentUser) {
      alert("ログインが必要です。");
      return;
    }

    const replyRef = doc(db, `threads/${threadId}/replies/${id}`);
    // await updateDoc(replyRef, {
    //   reportedCount: (data.reportedCount || 0) + 1,
    //   hidden: (data.reportedCount || 0) + 1 >= 3 // 通報3回で自動非表示
    // });
    await updateDoc(replyRef, {
      reportedCount: (data.reportedCount || 0) + 1
      // hidden は自動では更新しない
    });


    alert("通報しました");
    await loadReplies();
  });
  actions.appendChild(reportButton);

  // 編集・削除ボタン
  if (currentUser && currentUser.uid === data.uid) {
    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.addEventListener("click", async () => {
      const newText = prompt("編集内容を入力してください：", data.text);
      if (newText) {
        const toxic = await isToxicComment(newText);
        if (toxic) {
          alert("不適切な表現が含まれているため編集できません");
          return;
        }
        await updateDoc(doc(db, `threads/${threadId}/replies/${id}`), { text: newText });
        loadReplies();
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", async () => {
      if (confirm("この返信を削除しますか？")) {
        await deleteDoc(doc(db, `threads/${threadId}/replies/${id}`));
        loadReplies();
      }
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
  }

  div.appendChild(actions);

  // 子返信
  const childIds = childrenMap[id] || [];
  if (childIds.length > 0) {
    const toggle = document.createElement("button");
    toggle.textContent = `返信を表示 (${childIds.length}件)`;
    toggle.style.marginTop = "6px";

    const childContainer = document.createElement("div");
    childContainer.style.display = "none";
    childContainer.style.marginTop = "6px";

    toggle.addEventListener("click", () => {
      const isHidden = childContainer.style.display === "none";
      childContainer.style.display = isHidden ? "block" : "none";
      toggle.textContent = isHidden
        ? `返信を隠す (${childIds.length}件)`
        : `返信を表示 (${childIds.length}件)`;
    });

    childIds.forEach(childId => {
      const childReply = allReplies[childId];
      const childDiv = createReplyElement(childReply, depth + 1, childrenMap, allReplies);
      childContainer.appendChild(childDiv);
    });

    div.appendChild(toggle);
    div.appendChild(childContainer);
  }

  return div;
}

// === スレッド削除 ===
deleteThreadButton.addEventListener("click", async () => {
  if (!confirm("このスレッドと全返信を削除しますか？")) return;

  const repliesSnap = await getDocs(collection(db, `threads/${threadId}/replies`));
  await Promise.all(
    repliesSnap.docs.map(docSnap => deleteDoc(doc(db, `threads/${threadId}/replies/${docSnap.id}`)))
  );

  await deleteDoc(doc(db, "threads", threadId));
  alert("スレッドを削除しました");
  window.location.href = "PZOpinions.html";
});

// === 親スレッドへの返信 ===
openRootReply.addEventListener("click", () => {
  currentParentId = null;
  replyModal.style.display = "flex";
});

// === モーダル閉じる ===
closeReplyModal.addEventListener("click", () => {
  replyModal.style.display = "none";
  modalTextarea.value = "";
});

replyModal.addEventListener("click", (e) => {
  if (e.target === replyModal) {
    replyModal.style.display = "none";
    modalTextarea.value = "";
  }
});

// === 返信送信 ===
modalSubmitButton.addEventListener("click", async () => {
  const text = modalTextarea.value.trim();
  if (!text) {
    alert("返信を入力してください");
    return;
  }
  if (!currentUser) {
    alert("ログインが必要です");
    return;
  }

  // === Perspective APIによる不適切判定 ===
  const toxic = await isToxicComment(text);
  if (toxic) {
    alert("不適切な言葉が含まれているため送信できません");
    return;
  }

  await addDoc(collection(db, `threads/${threadId}/replies`), {
    uid: currentUser.uid,
    displayName: currentUser.displayName || "匿名",
    text,
    createdAt: serverTimestamp(),
    parentReplyId: currentParentId || null,
    reportedCount: 0,
    hidden: false
  });

  modalTextarea.value = "";
  replyModal.style.display = "none";
  await loadReplies();
});
