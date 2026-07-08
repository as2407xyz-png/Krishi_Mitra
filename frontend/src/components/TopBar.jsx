import { LANGS, useTranslate } from "../i18n";

export default function TopBar({ lang, setLang }) {
  const t = useTranslate(lang);
  return (
    <div className="topbar">
      <div className="brand"><span className="leaf">🌾</span><span>{t("appName")}</span></div>
      <div className="topbar-spacer" />
      <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
