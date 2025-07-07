// script/authUtils.js
import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth(app);

/**
 * ログイン状態を監視する共通関数
 * @param {(user: import("firebase-auth").User|null) => void} callback
 * @param {{redirectIfLoggedOut?: string}} [options]
 */
export function observeAuth(callback, { redirectIfLoggedOut } = {}) {
  onAuthStateChanged(auth, (user) => {
    if (!user && redirectIfLoggedOut) {
      window.location.href = redirectIfLoggedOut;
      return;
    }
    callback(user);
  });
}

export { auth };
