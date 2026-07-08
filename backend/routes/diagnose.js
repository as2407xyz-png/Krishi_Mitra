const express = require("express");
const multer = require("multer");
const { CROPS } = require("../data/crops");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const LANG_NAMES = { en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", mr: "Marathi" };

// POST /api/diagnose  (multipart/form-data: photo?, cropId, transcript, lang)
router.post("/", upload.single("photo"), async (req, res) => {
  const { cropId, transcript, lang } = req.body;
  const crop = CROPS.find((c) => c.id === cropId);

  if (!crop) return res.status(400).json({ error: "Unknown crop." });
  if (!transcript && !req.file) {
    return res.status(400).json({ error: "Provide a photo, a description, or both." });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Set it in backend/.env to enable AI diagnosis.",
    });
  }

  const languageName = LANG_NAMES[lang] || "English";
  const cropName = crop.name[lang] || crop.name.en;

  const systemPrompt = `You are an agricultural extension expert helping small farmers in Telangana, India diagnose crop problems from a photo and/or description. Respond ONLY with strict JSON, no markdown fences, no preamble, in this exact shape:
{"diagnosis":"...","confidence":"low|medium|high","urgency":"low|medium|high","action":"..."}
All text values must be written in ${languageName}. Keep "diagnosis" to one short sentence naming the likely issue. Keep "action" to 2-3 short concrete sentences a smallholder farmer can act on today. Be genuinely careful and calibrated — if the evidence is thin, say confidence is low and recommend showing it to the local Rythu Seva Kendra officer.`;

  const userContent = [];
  if (req.file) {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: req.file.mimetype || "image/jpeg", data: req.file.buffer.toString("base64") },
    });
  }
  userContent.push({
    type: "text",
    text: `Crop: ${cropName}. Farmer's description: ${transcript || "(no text description, see photo)"}`,
  });

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
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic API error:", apiRes.status, errText);
      return res.status(502).json({ error: "AI diagnosis service returned an error." });
    }

    const data = await apiRes.json();
    let text = (data.content || []).map((b) => b.text || "").join("").trim();
    text = text.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = {
        diagnosis: text.slice(0, 180) || "Unable to parse AI response.",
        confidence: "low",
        urgency: "medium",
        action: "Please consult your Rythu Seva Kendra officer for confirmation.",
      };
    }

    res.json({ diagnosis: parsed, crop: { id: crop.id, name: crop.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reach the AI diagnosis service." });
  }
});

module.exports = router;
