import { useRef, useState } from "react";
import { useTranslate } from "../i18n";
import { api } from "../api";

function getRecognition(lang) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", mr: "mr-IN" }[lang] || "en-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  const langMap = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", mr: "mr-IN" };
  utter.lang = langMap[lang] || "en-IN";
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang === utter.lang) || voices.find((v) => v.lang && v.lang.startsWith(lang));
  if (match) utter.voice = match;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function VoiceHelp({ lang, open, onClose }) {
  const t = useTranslate(lang);
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const logRef = useRef(null);

  function startMic() {
    const rec = getRecognition(lang);
    if (!rec) return;
    setRecording(true);
    rec.start();
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const data = await api.chat(next, lang);
      const withReply = [...next, { role: "assistant", content: data.reply }];
      setMessages(withReply);
      speak(data.reply, lang);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't reach the assistant right now." }]);
    }
    setSending(false);
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <strong>{t("voiceHelpTitle")}</strong>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="chat-log" ref={logRef}>
          {messages.map((m, i) => (
            <div className={"bubble " + (m.role === "user" ? "user" : "ai")} key={i}>{m.content}</div>
          ))}
          {sending && <div className="bubble ai">…</div>}
        </div>
        <div className="modal-foot">
          <button className={"mic-btn" + (recording ? " recording" : "")} onClick={startMic}>🎙️</button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={t("askPlaceholder")}
            style={{ margin: 0, flex: 1 }}
          />
          <button className="btn btn-primary" onClick={send} disabled={sending}>{t("sendBtn")}</button>
        </div>
      </div>
    </div>
  );
}
