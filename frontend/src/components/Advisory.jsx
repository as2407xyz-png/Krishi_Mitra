import { useState } from "react";
import RegionPicker from "./RegionPicker";
import { useTranslate } from "../i18n";
import { api } from "../api";

const DAY_NAMES = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
  te: ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"],
  ta: ["ஞாயி", "திங்", "செவ்", "புத", "வியா", "வெள்", "சனி"],
  kn: ["ಭಾನು", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"],
  mr: ["रवि", "सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि"],
};

function rainIcon(mm) {
  return mm === 0 ? "☀️" : mm < 3 ? "🌤️" : mm < 12 ? "🌦️" : "⛈️";
}

export default function Advisory({ lang }) {
  const t = useTranslate(lang);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function handleRegion(r) {
    setError("");
    try {
      const res = await api.advisory(r.districtId);
      setData(res);
    } catch (e) {
      setError(e.message);
      setData(null);
    }
  }

  return (
    <section className="view">
      <div className="card">
        <h2>{t("sectionAdvisoryTitle")}</h2>
        <p className="sub">{t("sectionAdvisorySub")}</p>
        <RegionPicker lang={lang} onChange={handleRegion} />
      </div>

      {error && <div className="card"><div className="error-note">{error}</div></div>}

      {data && (
        <>
          <div className="card">
            <h2>{t("forecastLabel")}</h2>
            <div className="forecast-row">
              {data.days.map((d) => (
                <div className="day-chip" key={d.date}>
                  <div className="d">{DAY_NAMES[lang][d.dayOfWeek]}</div>
                  <div className="icon">{rainIcon(d.mm)}</div>
                  <div className="mm">{d.mm}mm</div>
                </div>
              ))}
            </div>
          </div>

          {data.isDrySpell ? (
            <div className="alert-banner danger">
              <span className="icon">⚠️</span>
              <div>
                <strong>{t("dryspellAlertTitle")}</strong><br />
                {lang === "en"
                  ? `No significant rain expected for ${data.maxDryStreak} consecutive days. Irrigate as per crop stage and avoid top-dressing fertilizer until rain returns.`
                  : ({
                      hi: `अगले ${data.maxDryStreak} दिनों तक बारिश की संभावना नहीं। फ़सल की अवस्था अनुसार सिंचाई करें व बारिश लौटने तक ऊपरी खाद न दें।`,
                      te: `వరుసగా ${data.maxDryStreak} రోజులు వర్షం అవకాశం లేదు. పంట దశ ప్రకారం నీటిపారుదల చేయండి, వర్షం వచ్చే వరకు పైపాటు ఎరువులు వేయవద్దు.`,
                      ta: `தொடர்ந்து ${data.maxDryStreak} நாட்கள் மழை இல்லை. பயிர் நிலைக்கேற்ப நீர்ப்பாசனம் செய்யவும், மழை வரும் வரை மேல் உரம் இடாதீர்கள்.`,
                      kn: `ಸತತ ${data.maxDryStreak} ದಿನ ಮಳೆ ಇಲ್ಲ. ಬೆಳೆ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ನೀರಾವರಿ ಮಾಡಿ, ಮಳೆ ಬರುವವರೆಗೆ ಮೇಲ್ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ.`,
                      mr: `सलग ${data.maxDryStreak} दिवस पाऊस नाही. पीक अवस्थेनुसार सिंचन करा, पाऊस येईपर्यंत वरखत देऊ नका.`,
                    })[lang]}
              </div>
            </div>
          ) : (
            <div className="alert-banner ok">
              <span className="icon">✅</span>
              <div><strong>{t("allClearTitle")}</strong><br />{t("allClearBody")}</div>
            </div>
          )}

          <div className="card">
            <h2>{t("irrigationTip")}</h2>
            <p>{data.isDrySpell ? t("irrigDry") : t("irrigOk")}</p>
          </div>
          <div className="card">
            <h2>{t("fertilizerTip")}</h2>
            <p>{data.isDrySpell ? t("fertDry") : t("fertOk")}</p>
          </div>
        </>
      )}
    </section>
  );
}
