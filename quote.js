// Walt Jr. Chat frontend logic
// Rewritten for event‑driven Outseta auth + stable payloads

document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const inputField  = document.getElementById("input");
  const sendBtn     = document.getElementById("send-btn");
  const chatbox     = document.getElementById("chatbox");

  const loginBox    = document.getElementById("login-container");
  const loginBtn    = document.getElementById("login-btn");
  const logoutBtn   = document.getElementById("logout-btn");

  /* ---------- helpers ---------- */
  const showChat  = () => { chatbox.style.display = "block"; loginBox.style.display = "none"; };
  const showLogin = () => { chatbox.style.display = "none";  loginBox.style.display = "flex"; };

  /* ---------- auth check on load ---------- */
  Outseta.getUser()
                  .then(u => u ? showChat() : showLogin())
}
  /* ---------- auth events ---------- */
  Outseta.on("accessToken.set",     showChat);
  Outseta.on("accessToken.removed", showLogin);

  /* ---------- buttons ---------- */
        //
  loginBtn?.addEventListener("click", () => {
    window.location.href = "https://waltjr.outseta.com/auth?widgetMode=login";
  });
  function addMessage(content, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;

    const user = await Outseta.getUser();
    if (!user) { alert("Please log in first"); return; }

    addMessage(message, "user");
    inputField.value = "";

    // build payload
    const payload = {
      person_uid:   user.Uid,
      email:        user.Email,
      account_uid:  user.AccountUid,
      company_name: user.Account?.Name || "",
      message
    };

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      addMessage(data.reply, "assistant");

      // forward to Make.com
      await fetch("https://hook.us1.make.com/XXXXXXXX", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, gpt_reply: data.reply })
      });
    } catch (err) {
      console.error(err);
      addMessage("Sorry, something went wrong.", "error");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputField.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
/* ---------- login button (runs only after full page load) ---------- */
window.addEventListener("load", () => {
  loginBtn?.addEventListener("click", () => {
    if (window.Outseta && typeof Outseta.toggleLogin === "function") {
      Outseta.toggleLogin();                 // open widget
    } else {
      // Fallback: direct to hosted login
      window.location.href =
        "https://waltjr.outseta.com/auth?widgetMode=login";
    }
  });
});
