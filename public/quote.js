window.addEventListener("load", () => {
  const loginBox = document.getElementById("login-container");
  const chatBox = document.getElementById("chat-container");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const showChat = () => {
    chatBox.style.display = "flex";
    loginBox.style.display = "none";
  };

  const showLogin = () => {
    chatBox.style.display = "none";
    loginBox.style.display = "flex";
  };

  if (window.Outseta && Outseta.getUser) {
    Outseta.getUser()
      .then(user => user ? showChat() : showLogin())
      .catch(showLogin);

    Outseta.on("accessToken.set", showChat);
    Outseta.on("accessToken.removed", showLogin);
  }

  loginBtn?.addEventListener("click", () => {
    if (Outseta.toggleLogin) {
      Outseta.toggleLogin();
    } else {
      window.location.href = "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    }
  });

  logoutBtn?.addEventListener("click", () => {
    Outseta.logout().then(() => {
      window.location.href = "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    });
  });
});

async function sendQuote() {
  const input = document.getElementById("userInput").value;
  if (!input.trim()) return alert("Please enter a message.");

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

  // Optional: Send to Make webhook
  await fetch("https://hook.us1.make.com/YOUR-MAKE-WEBHOOK", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, gpt_reply: data.reply })
  });
}
