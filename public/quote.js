const questions = [
  "What size banner do you need? (e.g., 3x5 ft)",
  "What material would you like? (vinyl, mesh, fabric, etc.)",
  "Will you provide artwork, or do you need design help?",
  "Are there specific colors or full-color printing required?",
  "How many banners do you need?",
  "Do you need grommets, pole pockets, or hems?",
  "Will the banner be used indoors or outdoors?",
  "When do you need the banner by?",
  "Where should it be shipped or picked up?"
];

let currentStep = 0;
let quoteData = {};

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text;
  document.getElementById("chat-log").appendChild(msg);
  document.getElementById("chat-log").scrollTop = document.getElementById("chat-log").scrollHeight;
}

function handleInput() {
  const input = document.getElementById("userInput");
  const value = input.value.trim();
  if (!value) return;

  addMessage(value, "user");
  const key = questions[currentStep].split(" ")[0].toLowerCase();
  quoteData[key] = value;

  input.value = "";
  currentStep++;

  if (currentStep < questions.length) {
    setTimeout(() => addMessage(questions[currentStep], "bot"), 300);
  } else {
    sendQuote();
  }
}

function startChat() {
  addMessage("👋 Hi, I'm Walt Jr. Let's build your banner quote step-by-step.", "bot");
  addMessage(questions[currentStep], "bot");
}

async function sendQuote() {
  addMessage("📦 Got it. Generating your quote now...", "bot");

  try {
    const res = await fetch("https://waltjrv7.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: Object.values(quoteData).join("\n") })
    });
    const data = await res.json();
    addMessage(data.reply, "bot");

    await fetch("https://hook.us2.make.com/cnnrvbj8inymtg58fnua7n36hi13bj37", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quoteData)
    });

  } catch (err) {
    addMessage("❌ There was a problem generating your quote. Please try again.", "bot");
    console.error(err);
  }
}

startChat();
