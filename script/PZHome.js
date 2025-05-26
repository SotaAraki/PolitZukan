import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
  // 背景カードのアニメーション
  const cards = document.querySelectorAll('.bg-card');
  cards.forEach((card) => {
    const startX = Math.random() * (window.innerWidth - 120);
    const startY = Math.random() * (window.innerHeight - 120);
    card.style.left = `${startX}px`;
    card.style.top = `${startY}px`;

    let originX = startX;
    let originY = startY;
    let x = startX;
    let y = startY;
    let dx = (Math.random() - 0.5) * 0.4;
    let dy = (Math.random() - 0.5) * 0.4;

    function animate() {
      x += dx;
      y += dy;

      if (Math.abs(x - originX) > 20) dx *= -1;
      if (Math.abs(y - originY) > 20) dy *= -1;

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      requestAnimationFrame(animate);
    }

    animate();
  });

  // DOM要素取得
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
