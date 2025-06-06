document.addEventListener("DOMContentLoaded", () => {
  const loginBox = document.getElementById("login-container");
  const chatBox = document.getElementById("chat-container");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const showChat = () => {
    chatBox.style.display = "block";
    loginBox.style.display = "none";
  };

  const showLogin = () => {
    chatBox.style.display = "none";
    loginBox.style.display = "flex";
  };

  // Check user
  Outseta.getUser()
    .then(user => user ? showChat() : showLogin())
    .catch(showLogin);

  Outseta.on("accessToken.set", showChat);
  Outseta.on("accessToken.removed", showLogin);

  loginBtn?.addEventListener("click", () => {
    Outseta.toggleLogin?.() || window.location.href = "https://waltjr.outseta.com/auth?widgetMode=login";
  });

  logoutBtn?.addEventListener("click", () => Outseta.logout());
});

// Send quote function (just example logic)
async function sendQuote() {
  const input = document.getElementById("userInput").value;
  const user = await Outseta.getUser();
  if (!user) return alert("You must be logged in.");

  const payload = {
    person_uid: user.Uid,
    email: user.Email,
    account_uid: user.AccountUid,
    company_name: user.Account?.Name || "",
    message: input
  };

  const res = await fetch("https://waltjrv7.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  document.getElementById("response").textContent = data.reply;
}
