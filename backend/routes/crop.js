const express = require("express");
const { CROPS } = require("../data/crops");
const { findDistrict } = require("../data/regions");

const router = express.Router();

// POST /api/crop-recommendation
// body: { soil, ph, rainfall, groundwater, season, districtId? }
// If `soil` is omitted but `districtId` is given, the district's regional
// average soil type is used as a sensible default.
router.post("/", (req, res) => {
  let { soil, ph, rainfall, groundwater, season, districtId } = req.body;

  if (!soil && districtId) {
    const found = findDistrict(districtId);
    if (found) soil = found.state.avgSoil;
  }

  const phNum = Number(ph);
  const rainNum = Number(rainfall);
  const gwNum = Number(groundwater);

  if (!soil || !season || Number.isNaN(phNum) || Number.isNaN(rainNum) || Number.isNaN(gwNum)) {
    return res.status(400).json({ error: "soil, ph, rainfall, groundwater and season are all required." });
  }

  const scored = CROPS.map((crop) => {
    if (!crop.season.includes(season)) return null;

    let score = 0;
    const soilOk = crop.soils.includes(soil);
    score += soilOk ? 30 : 8;

    const phMid = (crop.phMin + crop.phMax) / 2;
    const phRange = (crop.phMax - crop.phMin) / 2;
    const phDist = Math.abs(phNum - phMid);
    score += Math.max(0, 25 - (phDist / phRange) * 25);

    const rainOk = rainNum >= crop.rainMin && rainNum <= crop.rainMax;
    if (rainOk) {
      score += 25;
    } else {
      const dist = rainNum < crop.rainMin ? crop.rainMin - rainNum : rainNum - crop.rainMax;
      score += Math.max(0, 25 - dist / 40);
    }

    const gwOk = gwNum <= crop.gwMax;
    if (gwOk) {
      score += 20;
    } else {
      score += Math.max(0, 20 - (gwNum - crop.gwMax) / 5);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    return { crop, score, soilOk, rainOk, gwOk };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  res.json({ results: scored });
});

module.exports = router;
