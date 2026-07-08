import { useState } from "react";
import RegionPicker from "./RegionPicker";
import { api } from "../api";
import { useTranslate } from "../i18n";

const SOIL_OPTIONS = ["black", "red", "alluvial", "laterite", "sandy", "mountain"];
const SOIL_KEY = { black: "soilBlack", red: "soilRed", alluvial: "soilAlluvial", laterite: "soilLaterite", sandy: "soilSandy", mountain: "soilMountain" };

export default function CropAdvisor({ lang }) {
  const t = useTranslate(lang);
  const [region, setRegion] = useState(null);
  const [soil, setSoil] = useState("black");
  const [soilAuto, setSoilAuto] = useState(true);
  const [season, setSeason] = useState("kharif");
  const [ph, setPh] = useState(6.8);
  const [rainfall, setRainfall] = useState(750);
  const [groundwater, setGroundwater] = useState(18);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleRegion(r) {
    setRegion(r);
    if (soilAuto) setSoil(r.avgSoil);
  }

  async function runEngine() {
    setLoading(true);
    setError("");
    try {
      const data = await api.cropRecommendation({ soil, ph, rainfall, groundwater, season });
      setResults(data.results);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <section className="view">
      <div className="card">
        <h2>{t("sectionCropTitle")}</h2>
        <p className="sub">{t("sectionCropSub")}</p>

        <RegionPicker lang={lang} onChange={handleRegion} />

        <div className="grid2">
          <div>
            <label>{t("formSeason")}</label>
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="kharif">{t("seasonKharif")}</option>
              <option value="rabi">{t("seasonRabi")}</option>
              <option value="zaid">{t("seasonZaid")}</option>
            </select>
          </div>
          <div>
            <label>{t("formSoilType")}</label>
            <select
              value={soil}
              onChange={(e) => { setSoil(e.target.value); setSoilAuto(false); }}
            >
              {SOIL_OPTIONS.map((s) => (
                <option key={s} value={s}>{t(SOIL_KEY[s])}</option>
              ))}
            </select>
            <div className="small-note">{soilAuto ? t("formSoilAuto") : ""}</div>
          </div>
          <div>
            <label>{t("formPh")}</label>
            <input type="number" min="3" max="10" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} />
          </div>
          <div>
            <label>{t("formRainfall")}</label>
            <input type="number" min="0" max="3000" value={rainfall} onChange={(e) => setRainfall(e.target.value)} />
          </div>
          <div>
            <label>{t("formGroundwater")}</label>
            <input type="number" min="1" max="300" value={groundwater} onChange={(e) => setGroundwater(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={runEngine} disabled={loading}>
          {loading ? <span className="spinner" /> : null} {t("btnRecommend")}
        </button>
        {error && <div className="error-note">{error}</div>}
      </div>

      {results && (
        <div className="card">
          <h2>{t("resultsTitle")}</h2>
          {results.map((r, i) => (
            <div className="crop-result" key={r.crop.id}>
              <span className="rank">{i + 1}</span>
              <h3>{r.crop.name[lang] || r.crop.name.en}</h3>
              <div className="score-bar"><div className="score-fill" style={{ width: r.score + "%" }} /></div>
              <div><b>{t("waterReq")}:</b> {r.crop.waterReq[lang] || r.crop.waterReq.en}</div>
              <div style={{ marginTop: 6 }}>
                <b>{t("whyThisCrop")}:</b>{" "}
                {r.soilOk && <span className="tag">✓ {t("matchSoil")}</span>}
                {r.rainOk && <span className="tag">✓ {t("matchRain")}</span>}
                {r.gwOk && <span className="tag">✓ {t("matchGw")}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
