// Minimal file-backed JSON store.
// This keeps the demo dependency-free and easy to run anywhere Node runs.
// For a real production deployment, swap this module for Postgres/MongoDB —
// every function here is small enough to reimplement against a real DB
// without touching the routes that call it.
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "tickets.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (e) {
    return [];
  }
}

function save(records) {
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2));
}

function addTicket(ticket) {
  const records = load();
  records.unshift(ticket);
  save(records);
  return ticket;
}

function getTickets() {
  return load();
}

module.exports = { addTicket, getTickets };
