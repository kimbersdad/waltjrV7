console.log("✨ quote.js is running");

window.addEventListener("load", () => {
  const loginBox = document.getElementById("login-container");
  const loginBtn = document.getElementById("login-btn");

  loginBox.style.display = "flex";

  loginBtn?.addEventListener("click", () => {
    alert("Login button clicked!");
  });
});

