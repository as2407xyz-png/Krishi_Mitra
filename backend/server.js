require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const cropRoutes = require("./routes/crop");
const advisoryRoutes = require("./routes/advisory");
const diagnoseRoutes = require("./routes/diagnose");
const chatRoutes = require("./routes/chat");
const ticketRoutes = require("./routes/tickets");
const regionRoutes = require("./routes/regions");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/regions", regionRoutes);
app.use("/api/crop-recommendation", cropRoutes);
app.use("/api/advisory", advisoryRoutes);
app.use("/api/diagnose", diagnoseRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tickets", ticketRoutes);

// Serve the built frontend (see frontend/README) if present, so the whole
// app can run as a single deployable service.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get(/^\/(?!api).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Krishi Mitra backend listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY is not set — AI diagnosis and Voice Help will not work until it's added to backend/.env");
  }
});
