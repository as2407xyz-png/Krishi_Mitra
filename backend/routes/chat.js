const express = require("express");

const router = express.Router();
const LANG_NAMES = { en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", mr: "Marathi" };

// POST /api/chat
// body: { messages: [{role, content}, ...], lang }
router.post("/", async (req, res) => {
  const { messages, lang } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages[] is required." });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Set it in backend/.env to enable Voice Help.",
    });
  }

  const languageName = LANG_NAMES[lang] || "English";
  const systemPrompt = `You are Krishi Sahayak, a warm, practical agricultural assistant for small and marginal farmers in Telangana, India. Answer clearly and concisely (3-5 sentences max unless asked for more detail), in ${languageName} only. Cover crop choice, irrigation, fertilizer, pest/disease, weather, and government schemes like Rythu Bandhu or Rythu Seva Kendra services when relevant. If a question needs an in-person expert or lab test, say so plainly and suggest visiting the local Rythu Seva Kendra.`;

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic API error:", apiRes.status, errText);
      return res.status(502).json({ error: "Assistant service returned an error." });
    }

    const data = await apiRes.json();
    const reply = (data.content || []).map((b) => b.text || "").join("").trim();
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reach the assistant service." });
  }
});

module.exports = router;
