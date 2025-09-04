import { observeAuth, auth } from "./authUtils.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const logoutSection = document.getElementById("logoutSection");
  const logoutButton = document.getElementById("logoutButton");
  const adminSection = document.getElementById("admin-section"); // ★追加

  observeAuth(async (user) => {
    if (user) {
      if (loginSection) loginSection.style.display = "none";
      if (logoutSection) logoutSection.style.display = "block";

      // ★ 管理者判定
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().isAdmin) {
          if (adminSection) adminSection.style.display = "block";
        }
      } catch (err) {
        console.error("管理者チェック失敗:", err);
      }

    } else {
      if (loginSection) loginSection.style.display = "block";
      if (logoutSection) logoutSection.style.display = "none";
      if (adminSection) adminSection.style.display = "none"; // 未ログイン時は隠す
    }
  });

  const adminImage = document.getElementById("admin-image-link");
if (adminImage) {
  adminImage.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}


  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth).then(() => {
        alert("ログアウトしました");
        location.reload();
      });
    });
  }
});
