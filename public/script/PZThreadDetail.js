import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

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

let currentUser = null;
let currentParentId = null;
let threadOwnerUid = null;

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
    const delBtn = document.getElementById("delete-thread-button");
    if (delBtn) delBtn.style.display = "inline-block";
  }
}

async function loadReplies() {
  container.textContent = "読み込み中...";
  const q = query(collection(db, `threads/${threadId}/replies`), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);

  container.innerHTML = "";

  // データを整理
  const replies = {};
  const children = {};

  snap.forEach(docSnap => {
    const data = docSnap.data();
    replies[docSnap.id] = { id: docSnap.id, data };
    const parentId = data.parentReplyId || null;
    if (!children[parentId]) children[parentId] = [];
    children[parentId].push(docSnap.id);
  });

  // ルート返信だけ先に表示
  (children[null] || []).forEach(replyId => {
    const reply = replies[replyId];
    const div = createReplyElement(reply, 0, children, replies);
    container.appendChild(div);
  });
}

function createReplyElement(reply, depth, childrenMap, allReplies) {
  const { id, data } = reply;
  const div = document.createElement("div");
  div.className = "reply";
  div.style.marginLeft = `${depth * 20}px`;

  const isThreadOwner = data.uid === threadOwnerUid;

  const text = document.createElement("div");
  text.className = "reply-text";
  text.textContent = data.text;

  if (isThreadOwner) {
    const ownerBadge = document.createElement("div");
    ownerBadge.style.fontSize = "0.75em";
    ownerBadge.style.fontWeight = "bold";
    ownerBadge.style.color = "#FFD700";
    ownerBadge.style.marginBottom = "4px";
    div.appendChild(ownerBadge);
    div.style.border = "1px solid #FFD700";
  }

  div.appendChild(text);

  const actions = document.createElement("div");
  actions.className = "reply-actions";

  const replyButton = document.createElement("button");
  replyButton.textContent = "返信";
  replyButton.addEventListener("click", () => {
    currentParentId = id;
    replyModal.style.display = "flex";
  });
  actions.appendChild(replyButton);

  if (currentUser && currentUser.uid === data.uid) {
    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.addEventListener("click", async () => {
      const newText = prompt("編集内容を入力してください：", data.text);
      if (newText !== null && newText.trim() !== "") {
        await updateDoc(doc(db, `threads/${threadId}/replies/${id}`), {
          text: newText.trim()
        });
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
    toggle.style.background = "rgba(255,255,255,0.1)";
    toggle.style.border = "none";
    toggle.style.color = "#fff";
    toggle.style.padding = "4px 8px";
    toggle.style.cursor = "pointer";
    toggle.style.borderRadius = "4px";
    toggle.style.fontSize = "0.9em";

    const childContainer = document.createElement("div");
    childContainer.style.display = "none";
    childContainer.style.marginTop = "6px";

    toggle.addEventListener("click", () => {
      if (childContainer.style.display === "none") {
        childContainer.style.display = "block";
        toggle.textContent = `返信を隠す (${childIds.length}件)`;
      } else {
        childContainer.style.display = "none";
        toggle.textContent = `返信を表示 (${childIds.length}件)`;
      }
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
const deleteThreadButton = document.getElementById("delete-thread-button");

deleteThreadButton.addEventListener("click", async () => {
  if (!confirm("このスレッドと全返信を削除しますか？")) return;

  // まず全返信を削除
  const repliesSnap = await getDocs(collection(db, `threads/${threadId}/replies`));
  const batchDeletes = [];
  repliesSnap.forEach(docSnap => {
    batchDeletes.push(deleteDoc(doc(db, `threads/${threadId}/replies/${docSnap.id}`)));
  });
  await Promise.all(batchDeletes);

  // スレッド本体を削除
  await deleteDoc(doc(db, "threads", threadId));

  alert("スレッドを削除しました。");
  window.location.href = "PZOpinions.html";
});


// 親スレッドへの返信
openRootReply.addEventListener("click", () => {
  currentParentId = null;
  replyModal.style.display = "flex";
});

// モーダル閉じる
closeReplyModal.addEventListener("click", () => {
  replyModal.style.display = "none";
  modalTextarea.value = "";
});

// 枠外クリックで閉じる
replyModal.addEventListener("click", (e) => {
  if (e.target === replyModal) {
    replyModal.style.display = "none";
    modalTextarea.value = "";
  }
});

// 送信
modalSubmitButton.addEventListener("click", async () => {
  const text = modalTextarea.value.trim();
  if (!text) {
    alert("返信を入力してください。");
    return;
  }
  if (!currentUser) {
    alert("ログインが必要です。");
    return;
  }
  await addDoc(collection(db, `threads/${threadId}/replies`), {
    uid: currentUser.uid,
    displayName: currentUser.displayName || "匿名",
    text,
    createdAt: serverTimestamp(),
    parentReplyId: currentParentId || null
  });
  modalTextarea.value = "";
  replyModal.style.display = "none";
  await loadReplies();
});
