// All calls go through the same origin (`/api/...`). In dev, Vite proxies
// `/api` to the backend (see vite.config.js). In production, the backend
// serves the built frontend itself, so no base URL is needed either way.
const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch (e) {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  states: () => fetch(`${BASE}/regions/states`).then(handle),
  districts: (stateId) => fetch(`${BASE}/regions/districts/${stateId}`).then(handle),

  cropRecommendation: (payload) =>
    fetch(`${BASE}/crop-recommendation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  advisory: (districtId) => fetch(`${BASE}/advisory/${districtId}`).then(handle),

  diagnose: (formData) =>
    fetch(`${BASE}/diagnose`, { method: "POST", body: formData }).then(handle),

  raiseTicket: (payload) =>
    fetch(`${BASE}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  tickets: () => fetch(`${BASE}/tickets`).then(handle),

  chat: (messages, lang) =>
    fetch(`${BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, lang }),
    }).then(handle),
};
