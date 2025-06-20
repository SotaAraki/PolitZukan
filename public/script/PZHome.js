import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// import { startFloatingCards } from "./floatingCards.js"; // 共通のアニメーション処理

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {

  // 背景カードをふわふわ動かす処理（共通関数で呼び出す）
  // startFloatingCards();

  // DOM要素取得 ログイン状態による表示切り替え
  const loginSection = document.getElementById("loginSection");
  const logoutSection = document.getElementById("logoutSection");
  const logoutButton = document.getElementById("logoutButton");

  // ログイン状態監視
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // ログイン済み：ログインリンク非表示、ログアウト表示
      if (loginSection) loginSection.style.display = "none";
      if (logoutSection) logoutSection.style.display = "block";
    } else {
      // 未ログイン：ログアウト非表示、ログインリンク表示
      if (loginSection) loginSection.style.display = "block";
      if (logoutSection) logoutSection.style.display = "none";
    }
  });

  // ログアウト処理
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth).then(() => {
        alert("ログアウトしました");
        location.reload();
      }).catch((error) => {
        console.error("ログアウトエラー:", error);
      });
    });
  }
});
