import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

// Firebase 初期化
const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // id属性で取得
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // ログイン成功
      const user = userCredential.user;
      console.log("ログイン成功:", user.email);
      window.location.href = "PZhome.html"; // 遷移先を適宜変更してください
    })
    .catch((error) => {
      // エラー表示
      errorMessage.textContent = error.message;
    });
});

 window.signInWithGoogle = function() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Googleログイン成功:", user.displayName, user.email);
      // 例: ログイン後の画面遷移
      window.location.href = "PZhome.html";
    })
    .catch((error) => {
      console.error("Googleログインエラー:", error.message);
    });
};