import { useTranslate } from "../i18n";

export default function Home({ lang, goTo, openVoice, ticketCount, districtCount }) {
  const t = useTranslate(lang);
  return (
    <section className="view">
      <div className="hero">
        <h1>{t("heroTitle")}</h1>
        <p>{t("heroSubtitle")}</p>
        <div className="stats">
          <div className="stat"><b>3</b>{t("statModules")}</div>
          <div className="stat"><b>6</b>{t("statLangs")}</div>
          <div className="stat"><b>{districtCount || "739"}</b>{t("statDistricts")}</div>
          <div className="stat"><b>{ticketCount}</b>{t("statTickets")}</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>🌱 {t("navCrop")}</h2>
          <p className="sub">{t("homeCropDesc")}</p>
          <button className="btn btn-primary" onClick={() => goTo("crop")}>{t("btnOpen")}</button>
        </div>
        <div className="card">
          <h2>⛅ {t("navAdvisory")}</h2>
          <p className="sub">{t("homeAdvisoryDesc")}</p>
          <button className="btn btn-primary" onClick={() => goTo("advisory")}>{t("btnOpen")}</button>
        </div>
        <div className="card">
          <h2>📷 {t("navHealth")}</h2>
          <p className="sub">{t("homeHealthDesc")}</p>
          <button className="btn btn-primary" onClick={() => goTo("health")}>{t("btnOpen")}</button>
        </div>
        <div className="card">
          <h2>🎙️ {t("navVoiceHelp")}</h2>
          <p className="sub">{t("homeVoiceDesc")}</p>
          <button className="btn btn-accent" onClick={openVoice}>{t("btnAsk")}</button>
        </div>
      </div>
    </section>
  );
}
