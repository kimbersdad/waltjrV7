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
    account_uid: user.AccountUid || "",
    company_name: user.Account?.Name || "",
    message: input
  };

  console.log("📤 Sending payload:", payload);

  try {
    const res = await fetch("https://waltjrv7.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Backend error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log("🤖 GPT response:", data);

    if (data.reply) {
      document.getElementById("response").textContent = data.reply;
    } else {
      document.getElementById("response").textContent = "No reply received.";
    }

    // ✅ Make webhook - replace this with your actual webhook URL
    await fetch("https://hook.us1.make.com/YOUR-REAL-MAKE-WEBHOOK", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, gpt_reply: data.reply })
    });

  } catch (err) {
    console.error("❌ Error in sendQuote:", err);
    document.getElementById("response").textContent = "Error sending quote. Check console.";
  }
}

