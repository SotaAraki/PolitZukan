// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
   getAuth,
   createUserWithEmailAndPassword,
   updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// フォーム送信時の処理
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await signUp();
});

// アカウント作成処理（グローバルに定義）
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("displayName").value;

  const errorMessage = document.getElementById("error-message");

  try {
    // Firebase Auth でアカウント作成
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 表示名を設定
    await updateProfile(user, { displayName });

    // Firestore に登録
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName,
      createdAt: new Date()
    });

    alert(`アカウント作成完了！ようこそ ${displayName} さん`);
    window.location.href = "/PZlogin.html";

  } catch (error) {
    console.error(error);
    errorMessage.textContent = "エラー: " + error.message;
  }
}