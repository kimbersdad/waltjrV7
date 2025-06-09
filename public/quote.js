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

  // Initial login check
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

  // Login button click
  loginBtn?.addEventListener("click", () => {
    if (window.Outseta?.toggleLogin) {
      Outseta.toggleLogin();
    } else {
      window.location.href = "https://waltjr.outseta.com/auth?widgetMode=login&redirectUrl=https://waltjr.netlify.app/quote.html";
    }
  });

  // Logout button click
  logoutBtn?.addEventListener("click", () => {
    Outseta.logout().then(() => {
      window.location.href = "https://waltjr.netlify.app/quote.html";
    });
  });
});

// ✅ GPT + Webhook Logic
async function sendQuote() {
  const input = document.getElementById("userInput").value;
  const responseBox = document.getElementById("response");

  if (!input.trim()) {
    alert("Please enter a message.");
    return;
  }

  responseBox.textContent = "🧠 Thinking...";

  const user = await Outseta.getUser();
  if (!user) {
    alert("Please log in first.");
    return;
  }

  const payload = {
    person_uid: user.Uid,
    email: user.Email,
    account_uid: user.AccountUid || "",
    company_name: user.Account?.Name || "",
    message: input
  };

  console.log("📤 Sending to GPT:", payload);

  try {
    // GPT backend request
    const res = await fetch("https://waltjrv7.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`GPT fetch failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("🤖 GPT response:", data);

    responseBox.textContent = data.reply || "No reply from GPT.";

    // Make.com webhook (send quote + GPT reply)
    await fetch("https://hook.us2.make.com/cnnrvbj8inymtg58fnua7n36hi13bj37", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, gpt_reply: data.reply })
    });

  } catch (err) {
    console.error("❌ Error in sendQuote:", err);
    responseBox.textContent = "❌ Something went wrong. See console.";
  }
}
