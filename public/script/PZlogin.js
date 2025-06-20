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
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// Firebase 初期化
const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


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

      onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          console.log("ログイン中のユーザーID:", uid);
        }
      });

      window.location.href = "PZHome.html"; // 遷移先を適宜変更してください
    })
    .catch((error) => {
      // エラー表示
      errorMessage.textContent = error.message;
    });
});

window.signInWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Firestore にユーザー情報を保存（初回ログインのみ）
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        createdAt: new Date()
      });
      console.log("Firestore にユーザー登録:", user.displayName);
    }

    // ログイン後の画面遷移
    window.location.href = "PZHome.html";
  } catch (error) {
    console.error("Googleログインエラー:", error.message);
    errorMessage.textContent = "Googleログインに失敗しました";
  }
}
