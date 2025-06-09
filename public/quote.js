console.log("✨ quote.js is running");

window.addEventListener("load", () => {
  const loginBox = document.getElementById("login-container");
  const chatBox = document.getElementById("chat-container");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const showChat = () => {
    chatBox.style.display = "flex";
    loginBox.style.display = "none";
    console.log("✅ Showing chat container");
  };

  const showLogin = () => {
    chatBox.style.display = "none";
    loginBox.style.display = "flex";
    console.log("✅ Showing login container");
  };

  if (window.Outseta && Outseta.getUser) {
    Outseta.getUser()
      .then(user => user ? showChat() : showLogin())
      .catch(showLogin);

    Outseta.on("accessToken.set", showChat);
    Outseta.on("accessToken.removed", showLogin);
  } else {
    console.warn("⚠️ Outseta not ready");
    showLogin();
  }

  loginBtn?.addEventListener("click", () => {
    if (window.Outseta?.toggleLogin) {
      Outseta.toggleLogin();
    } else {
      window.location.href =
        "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    }
  });

  logoutBtn?.addEventListener("click", () => {
    Outseta.logout().then(() => {
      window.location.href =
        "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    });
  });
});
