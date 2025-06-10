// Sanitize helper – strips control characters and newlines
function sanitize(str) {
  return str
    ?.replace(/[\u0000-\u001F\u007F]/g, "")  // remove control chars
    .replace(/\r?\n|\r/g, " ")              // newlines to space
    .trim();
}

window.addEventListener("load", () => {
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

  // Wait for Outseta to load, then check login state
  if (window.Outseta && Outseta.getUser) {
    Outseta.getUser()
      .then(user => user ? showChat() : showLogin())
      .catch(showLogin);

    Outseta.on("accessToken.set", showChat);
    Outseta.on("accessToken.removed", showLogin);
  } else {
    showLogin();
  }

  // Login button
  loginBtn?.addEventListener("click", () => {
    if (window.Outseta && typeof Outseta.toggleLogin === "function") {
      Outseta.toggleLogin();
    } else {
      window.location.href =
        "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    }
  });

  // Logout button – redirect back to login screen
  logoutBtn?.addEventListener("click", () => {
    Outseta.logout().then(() => {
      window.location.href =
        "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    });
  });
});

// Send quote to backend and webhook
async function sendQuote() {
  const inputRaw = document.getElementById("userInput").value;
  const input = sanitize(inputRaw);
  if (!input) return alert("Please enter a message.");

  const user = await Outseta.getUser();
  if (!user) return alert("You must be logged in.");

  const payload = {
    person_uid: user.Uid,
    email: user.Email,
    account_uid: user.AccountUid,
    company_name: user.Account?.Name || "",
    message: input
  };

  // Send to GPT backend
  const res = await fetch("https://waltjrv7.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const reply = sanitize(data.reply);
  document.getElementById("response").textContent = reply;

  // Forward to Make webhook
  await fetch("https://hook.us1.make.com/YOUR-MAKE-WEBHOOK", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, gpt_reply: reply })
  });
}
