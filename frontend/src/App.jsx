import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Tabs from "./components/Tabs";
import Home from "./components/Home";
import CropAdvisor from "./components/CropAdvisor";
import Advisory from "./components/Advisory";
import Health from "./components/Health";
import History from "./components/History";
import About from "./components/About";
import VoiceHelp from "./components/VoiceHelp";
import { useTranslate } from "./i18n";
import { api } from "./api";

export default function App() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("home");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [historyKey, setHistoryKey] = useState(0);
  const t = useTranslate(lang);

  useEffect(() => {
    api.tickets().then((d) => setTicketCount(d.tickets.length)).catch(() => {});
  }, [historyKey]);

  function handleTicketRaised() {
    setTicketCount((c) => c + 1);
    setHistoryKey((k) => k + 1);
  }

  return (
    <div className="terrace-bg">
      <TopBar lang={lang} setLang={setLang} />
      <Tabs lang={lang} active={tab} setActive={setTab} />
      <main>
        {tab === "home" && (
          <Home lang={lang} goTo={setTab} openVoice={() => setVoiceOpen(true)} ticketCount={ticketCount} />
        )}
        {tab === "crop" && <CropAdvisor lang={lang} />}
        {tab === "advisory" && <Advisory lang={lang} />}
        {tab === "health" && <Health lang={lang} onTicketRaised={handleTicketRaised} />}
        {tab === "history" && <History lang={lang} refreshKey={historyKey} />}
        {tab === "about" && <About lang={lang} />}
      </main>

      <button className="fab" onClick={() => setVoiceOpen(true)}>🎙️ {t("navVoiceHelp")}</button>
      <VoiceHelp lang={lang} open={voiceOpen} onClose={() => setVoiceOpen(false)} />

      <div className="footer">{t("footerNote")}</div>
    </div>
  );
}
