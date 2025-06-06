const express = require("express");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public")); // Serve quote.html + quote.js

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🧠 Chat route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Walt Jr., an expert signage quoting assistant. Ask questions and give pricing logic."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ reply: "❌ Error getting response from Walt Jr." });
  }
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Walt Jr. is alive");
});

app.listen(port, () => {
  console.log(`✅ Walt Jr. backend running at http://localhost:${port}`);
});
