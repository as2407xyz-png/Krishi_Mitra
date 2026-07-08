import { useEffect, useState } from "react";
import { useTranslate } from "../i18n";
import { api } from "../api";

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function History({ lang, refreshKey }) {
  const t = useTranslate(lang);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.tickets().then((d) => setTickets(d.tickets)).catch(() => setTickets([]));
  }, [refreshKey]);

  return (
    <section className="view">
      <div className="card">
        <h2>{t("sectionHistoryTitle")}</h2>
        <p className="sub">{t("sectionHistorySub")}</p>
        {tickets.length === 0 ? (
          <p className="sub">{t("noHistory")}</p>
        ) : (
          tickets.map((r) => (
            <div className="hist-item" key={r.id}>
              <b>{r.id}</b> · {r.cropName} · {r.district.name}, {r.state.name} · <span className="small-note">{new Date(r.createdAt).toLocaleString()}</span><br />
              {r.diagnosis.diagnosis}<br />
              <span className={"badge " + r.diagnosis.urgency}>{t("urgencyLabel")}: {t("level" + cap(r.diagnosis.urgency))}</span>
              <div className="sms-preview">📱 {t("smsSentTo")} {r.phone}: "{r.sms}"</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
