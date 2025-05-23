// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// Firebase 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//ログイン処理
window.signUp = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("アカウント作成成功！");
      window.location.href = "PZlogin.html";
    })
    .catch((error) => {
      alert("エラー：" + error.message);
    });
};

// window.signInWithGoogle() = function () {
  
// };
