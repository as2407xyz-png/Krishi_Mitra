const express = require("express");
const { listStates, listDistricts } = require("../data/regions");

const router = express.Router();

// GET /api/regions/states
router.get("/states", (req, res) => {
  res.json({ states: listStates() });
});

// GET /api/regions/districts/:stateId
router.get("/districts/:stateId", (req, res) => {
  const result = listDistricts(req.params.stateId);
  if (!result) return res.status(404).json({ error: "Unknown state." });
  res.json(result);
});

module.exports = router;
