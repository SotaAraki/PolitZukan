import { observeAuth, auth } from "./authUtils.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const logoutSection = document.getElementById("logoutSection");
  const logoutButton = document.getElementById("logoutButton");

  observeAuth((user) => {
    if (user) {
      if (loginSection) loginSection.style.display = "none";
      if (logoutSection) logoutSection.style.display = "block";
    } else {
      if (loginSection) loginSection.style.display = "block";
      if (logoutSection) logoutSection.style.display = "none";
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth).then(() => {
        alert("ログアウトしました");
        location.reload();
      });
    });
  }
});
