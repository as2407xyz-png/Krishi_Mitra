// Nationwide states & districts reference data.
//
// Source: a community-maintained India states/districts dataset, patched
// against official sources for the three most significant recent
// reorganisations (Telangana's 33 districts, Andhra Pradesh's 2022/2025
// 28-district structure, and the Jammu & Kashmir / Ladakh UT split).
// State governments periodically rename or split districts further —
// verify against your state government portal before relying on this
// for anything official.
//
// avgSoil is a broad agro-climatic *regional* default (alluvial, black,
// red, laterite, sandy, or mountain) meant only to pre-fill the crop
// recommendation form sensibly — it is not district-level soil survey
// data. Swap in ICAR/SoilGrids/state soil health card data for production.
const fs = require("fs");
const path = require("path");

const STATES = JSON.parse(fs.readFileSync(path.join(__dirname, "states_districts.json"), "utf8"));

function listStates() {
  return STATES.map((s) => ({ id: s.id, name: s.name, avgSoil: s.avgSoil, districtCount: s.districts.length }));
}

function listDistricts(stateId) {
  const state = STATES.find((s) => s.id === stateId);
  if (!state) return null;
  return { state: { id: state.id, name: state.name, avgSoil: state.avgSoil }, districts: state.districts };
}

function findDistrict(districtId) {
  for (const s of STATES) {
    const d = s.districts.find((x) => x.id === districtId);
    if (d) return { district: d, state: { id: s.id, name: s.name, avgSoil: s.avgSoil } };
  }
  return null;
}

// Real, verified national helpline — used as the default contact for every
// district. Telangana additionally has the state's own Rythu Seva Kendra /
// Rythu Vedika network; we surface that as extra context where relevant
// since it's a well-documented state scheme, without inventing individual
// office phone numbers we can't verify.
const KISAN_CALL_CENTRE = "1800-180-1551 (Kisan Call Centre, toll-free, 22 languages)";

function contactFor(stateId) {
  if (stateId === "telangana") {
    return {
      primary: KISAN_CALL_CENTRE,
      note: "Also visit your local Rythu Seva Kendra / Rythu Vedika for in-person follow-up.",
    };
  }
  return {
    primary: KISAN_CALL_CENTRE,
    note: "Also visit your nearest Krishi Vigyan Kendra (KVK) or state Department of Agriculture office for in-person follow-up.",
  };
}

module.exports = { STATES, listStates, listDistricts, findDistrict, contactFor };
