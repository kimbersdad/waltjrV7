function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text;
  document.getElementById("chat-log").appendChild(msg);
  document.getElementById("chat-log").scrollTop =
    document.getElementById("chat-log").scrollHeight;
}

async function handleInput() {
  const input = document.getElementById("userInput");
  const value = input.value.trim();
  if (!value) return;

  addMessage(value, "user");
  input.value = "";

  try {
    const res = await fetch("https://hook.us2.make.com/cnnrvbj8inymtg58fnua7n36hi13bj37", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: value })
    });

  try {
  const data = await res.json();
  addMessage(data.reply || "🧠 Walt Jr. is thinking...", "bot");
} catch (err) {
  console.warn("Fallback triggered, no JSON reply:", err);
  addMessage("📨 Your response has been received. A team member or Walt Jr. will reply shortly.", "bot");
}
}

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("userInput");
  inputBox.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleInput();
    }
  });

  addMessage("Hi, this is Walt Jr. Your favorite estimating tool! How can I help you today?", "bot");
});
