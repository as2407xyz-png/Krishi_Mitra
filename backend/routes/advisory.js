const express = require("express");
const { findDistrict } = require("../data/regions");

const router = express.Router();

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Simple string hash so every district (not just an indexed array position)
// gets a stable, distinct forecast seed.
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// GET /api/advisory/:districtId
// Returns a 7-day forecast seeded by district + date, so results are
// stable for a given day but vary district to district.
// Swap this generator for a real IMD / district-level weather API call
// when moving to production.
router.get("/:districtId", (req, res) => {
  const { districtId } = req.params;
  const found = findDistrict(districtId);
  if (!found) return res.status(404).json({ error: "Unknown district." });

  const seedBase = hashCode(districtId) % 1000;
  const today = new Date();
  let dryStreak = 0;
  let maxDryStreak = 0;
  const days = [];

  for (let i = 0; i < 7; i++) {
    const seed = (seedBase + 1) * 97 + i * 13 + today.getDate();
    const r = seededRandom(seed);
    const mm = Math.round(r * r * 30); // skewed toward low rainfall, occasional bursts
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ date: d.toISOString().slice(0, 10), dayOfWeek: d.getDay(), mm });
    if (mm < 2) {
      dryStreak++;
      maxDryStreak = Math.max(maxDryStreak, dryStreak);
    } else {
      dryStreak = 0;
    }
  }

  const isDrySpell = maxDryStreak >= 4;
  res.json({ district: found.district, state: found.state, days, isDrySpell, maxDryStreak });
});

module.exports = router;
