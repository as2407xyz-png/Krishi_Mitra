import { useTranslate } from "../i18n";

const TABS = ["home", "crop", "advisory", "health", "history", "about"];
const LABELS = { home: "navHome", crop: "navCrop", advisory: "navAdvisory", health: "navHealth", history: "navHistory", about: "navAbout" };

export default function Tabs({ lang, active, setActive }) {
  const t = useTranslate(lang);
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab}
          className={"tab-btn" + (active === tab ? " active" : "")}
          onClick={() => setActive(tab)}
        >
          {t(LABELS[tab])}
        </button>
      ))}
    </div>
  );
}
