const express = require("express");
const { nanoid } = require("nanoid");
const { findDistrict, contactFor } = require("../data/regions");
const { addTicket, getTickets } = require("../db/store");

const router = express.Router();

// POST /api/tickets
// body: { districtId, cropName, phone, diagnosis: {diagnosis,confidence,urgency,action} }
router.post("/", (req, res) => {
  const { districtId, cropName, phone, diagnosis } = req.body;
  const found = findDistrict(districtId);
  if (!found) return res.status(400).json({ error: "Unknown district." });
  if (!diagnosis || !diagnosis.diagnosis) return res.status(400).json({ error: "diagnosis is required." });

  const contact = contactFor(found.state.id);
  const smsText = `[Krishi Mitra] ${cropName}: ${diagnosis.diagnosis} Action: ${diagnosis.action}`.slice(0, 300);

  const ticket = {
    id: "KM-" + nanoid(8).toUpperCase(),
    createdAt: new Date().toISOString(),
    district: found.district,
    state: found.state,
    cropName,
    phone: phone || null,
    diagnosis,
    contact,
    sms: smsText,
  };
  addTicket(ticket);
  res.status(201).json({ ticket });
});

// GET /api/tickets
router.get("/", (req, res) => {
  res.json({ tickets: getTickets() });
});

module.exports = router;
