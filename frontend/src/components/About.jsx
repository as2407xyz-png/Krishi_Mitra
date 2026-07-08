import { useTranslate } from "../i18n";

export default function About({ lang }) {
  const t = useTranslate(lang);
  return (
    <section className="view">
      <div className="card">
        <h2>{t("aboutTitle")}</h2>
        <div className="about-box">
          <p>{t("aboutP1")}</p>
          <p>{t("aboutP2")}</p>
          <p>{t("aboutP3")}</p>
        </div>
      </div>
    </section>
  );
}
