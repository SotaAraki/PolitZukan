import { app } from "./firebase.js";
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

const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await signUp();
});

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("displayName").value;
  const errorMessage = document.getElementById("error-message");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName,
      createdAt: new Date()
    });

    window.location.href = "/PZlogin.html";
  } catch (error) {
    errorMessage.textContent = "エラー: " + error.message;
  }
}
