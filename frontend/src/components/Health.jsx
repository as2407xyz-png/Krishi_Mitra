import { useRef, useState } from "react";
import RegionPicker from "./RegionPicker";
import { useTranslate } from "../i18n";
import { api } from "../api";
import { CROPS } from "../crops.data";

function getRecognition(lang) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", mr: "mr-IN" }[lang] || "en-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

export default function Health({ lang, onTicketRaised }) {
  const t = useTranslate(lang);
  const [region, setRegion] = useState(null);
  const [cropId, setCropId] = useState(CROPS[0].id);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [recording, setRecording] = useState(false);
  const [micStatus, setMicStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [ticket, setTicket] = useState(null);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function startMic() {
    const rec = getRecognition(lang);
    if (!rec) {
      setMicStatus("Voice input not supported in this browser.");
      return;
    }
    setRecording(true);
    setMicStatus("🎙️ Listening…");
    rec.start();
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript((prev) => (prev ? prev + " " : "") + text);
    };
    rec.onerror = () => setMicStatus("Could not capture audio — please type instead.");
    rec.onend = () => {
      setRecording(false);
      setMicStatus("");
    };
  }

  async function runDiagnosis() {
    if (!transcript.trim() && !photo) {
      setError(t("describePlaceholder"));
      return;
    }
    setLoading(true);
    setError("");
    setDiagnosis(null);
    setTicket(null);
    const crop = CROPS.find((c) => c.id === cropId);
    const form = new FormData();
    if (photo) form.append("photo", photo);
    form.append("cropId", cropId);
    form.append("transcript", transcript);
    form.append("lang", lang);
    try {
      const data = await api.diagnose(form);
      setDiagnosis({ ...data.diagnosis, cropName: crop.name[lang] || crop.name.en });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function sendTicket() {
    if (!region || !diagnosis) return;
    try {
      const data = await api.raiseTicket({
        districtId: region.districtId,
        cropName: diagnosis.cropName,
        phone,
        diagnosis,
      });
      setTicket(data.ticket);
      onTicketRaised && onTicketRaised(data.ticket);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="view">
      <div className="card">
        <h2>{t("sectionHealthTitle")}</h2>
        <p className="sub">{t("sectionHealthSub")}</p>

        <RegionPicker lang={lang} onChange={setRegion} />

        <label>{t("cropTypeLabel")}</label>
        <select value={cropId} onChange={(e) => setCropId(e.target.value)}>
          {CROPS.map((c) => (
            <option key={c.id} value={c.id}>{c.name[lang] || c.name.en}</option>
          ))}
        </select>

        <label>{t("uploadPhoto")}</label>
        <div className="upload-box" onClick={() => fileRef.current.click()}>
          <div>{t("uploadHint")}</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          {photoPreview && <img src={photoPreview} alt="preview" />}
        </div>

        <label style={{ marginTop: 14 }}>{t("transcriptLabel")}</label>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={t("describePlaceholder")}
          />
          <button className={"mic-btn" + (recording ? " recording" : "")} onClick={startMic} title="Voice">🎙️</button>
        </div>
        <div className="small-note">{micStatus}</div>

        <label>{t("phoneLabel")}</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <button className="btn btn-primary" onClick={runDiagnosis} disabled={loading}>
          {loading ? <span className="spinner" /> : null} {t("btnDiagnose")}
        </button>
        {error && <div className="error-note">{error}</div>}
      </div>

      {diagnosis && (
        <div className="card">
          <h2>{t("diagnosisResult")}</h2>
          <div className="diag-card">
            <p><b>{diagnosis.cropName}:</b> {diagnosis.diagnosis}</p>
            <p>
              <span className={"badge " + diagnosis.confidence}>{t("confidenceLabel")}: {t("level" + cap(diagnosis.confidence))}</span>{" "}
              <span className={"badge " + diagnosis.urgency}>{t("urgencyLabel")}: {t("level" + cap(diagnosis.urgency))}</span>
            </p>
            <p><b>{t("actionLabel")}:</b> {diagnosis.action}</p>
            {!ticket && (
              <button className="btn btn-primary" onClick={sendTicket}>📨 {t("btnSendRSK")}</button>
            )}
          </div>
          {ticket && (
            <div className="card" style={{ marginTop: 12 }}>
              <p>✅ {t("rskSentMsg")} <b>{ticket.id}</b></p>
              <p className="small-note">{t("rskContact")}: {ticket.contact.primary} — {ticket.contact.note}</p>
              <div className="sms-preview">📱 {t("smsSentTo")} {ticket.phone}:<br />"{ticket.sms}"</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
