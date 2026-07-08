import { useEffect, useState } from "react";
import { api } from "../api";
import { useTranslate } from "../i18n";

// Cascading State -> District picker used by Crop Advisor, Advisory, and
// Crop Health tabs. Calls onChange({ stateId, districtId, avgSoil }) whenever
// a full state+district selection is made.
export default function RegionPicker({ lang, onChange, defaultStateId = "telangana" }) {
  const t = useTranslate(lang);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [stateId, setStateId] = useState(defaultStateId);
  const [districtId, setDistrictId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.states().then((d) => {
      setStates(d.states);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!stateId) return;
    api.districts(stateId).then((d) => {
      setDistricts(d.districts);
      const first = d.districts[0];
      setDistrictId(first ? first.id : "");
    });
  }, [stateId]);

  useEffect(() => {
    if (!districtId) return;
    const st = states.find((s) => s.id === stateId);
    onChange({ stateId, districtId, avgSoil: st ? st.avgSoil : "alluvial" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId]);

  return (
    <div className="grid2">
      <div>
        <label>{t("formState")}</label>
        <select value={stateId} onChange={(e) => setStateId(e.target.value)} disabled={loading}>
          {states.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>{t("formDistrict")}</label>
        <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} disabled={!districts.length}>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
