// Sanitize helper – strips control characters and newlines
function sanitize(str) {
  return String(str)
    .replace(/[\u0000-\u001F\u007F]/g, "")  // remove control chars
    .replace(/\r?\n|\r/g, " ")              // replace newlines
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

  if (window.Outseta && Outseta.getUser) {
    Outseta.getUser()
      .then(user => user ? showChat() : showLogin())
      .catch(showLogin);

    Outseta.on("accessToken.set", showChat);
    Outseta.on("accessToken.removed", showLogin);
  } else {
    showLogin();
  }

  loginBtn?.addEventListener("click", () => {
    if (window.Outseta && typeof Outseta.toggleLogin === "function") {
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

async function sendQuote() {
  const inputRaw = document.getElementById("userInput").value;
  const input = sanitize(inputRaw);
  if (!input) return alert("Please enter a message.");

  const user = await Outseta.getUser();
  if (!user) return alert("You must be logged in.");

  const payload = {
    person_uid: sanitize(user.Uid),
    email: sanitize(user.Email),
    account_uid: sanitize(user.AccountUid),
    company_name: sanitize(user.Account?.Name || ""),
    message: input
  };

  // Ask GPT for reply
  const res = await fetch("https://waltjrv7.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const reply = sanitize(data.reply);
  document.getElementById("response").textContent = reply;

  // Try to send to Make with debug
  try {
    const makePayload = { ...payload, gpt_reply: reply };
    const json = JSON.stringify(makePayload);

    console.log("✅ JSON looks good:", json);

    await fetch("https://hook.us2.make.com/lxfsipcjp97stuv689jw4mph8e1zyiv8", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json
    });
  } catch (err) {
    console.error("❌ JSON.stringify failed!", err);
    console.log("🧪 Payload object:", payload);
    console.log("🧪 GPT reply:", reply);
    alert("🚨 JSON Error: " + err.message + "\nCheck console for details.");
  }
}
