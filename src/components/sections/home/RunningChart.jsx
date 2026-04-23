import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../../common/Card";
import { DAYS, DEFAULT_RUN_IMG } from "../../../constants";
import { todayStr } from "../../../utils";

export function RunningChart({ runLogs, onOpenLog, selDate }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 300);
    return () => clearTimeout(t);
  }, []);

  const weekDates = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // Mon = 0
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dow + i);
      return todayStr(d);
    });
  }, []);

  const maxMin = 120;
  const totalMin = weekDates.reduce((s, d) => {
    const t = runLogs[d]?.time || "";
    if (!t) return s;
    const parts = t.split(":").map(Number);
    return s + (parts[0] || 0) * 60 + (parts[1] || 0) + (parts[2] ? parts[2] / 60 : 0);
  }, 0);

  const getMin = (dateStr) => {
    const t = runLogs[dateStr]?.time || "";
    if (!t) return 0;
    const parts = t.split(":").map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0) + ((parts[2] || 0) / 60);
  };

  // Helper to format distance as 000.00 km
  const formatDistance = (m) => {
    if (!m) return "";
    // Actually, if it was 5 digits in meters (e.g. 05000 is 5km), then 50.00 km? Let's re-read.
    // "현재 5자리로 되어 있는 항목에 뒤에서 2번째 자리에 소수점을 넣어주고 m 표시는 km로 변경"
    // If input is 05000 (meters), then 050.00 (km)? That's a lot. 
    // Wait, 5000m is 5km. If they want 005.00 km, that's what I'll do.
    return `${(Number(m) / 100).toFixed(2).padStart(5, "0")} km`;
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--txt)", marginBottom: "2px" }}>🏃 주간 런닝 기록</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>이번 주 · 총 {totalMin.toFixed(0)}분</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--muted)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)", display: "inline-block" }}></span>달성
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--bdr)", display: "inline-block", marginLeft: 4 }}></span>미달
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "5px", marginBottom: "12px" }}>
        {weekDates.map((d, i) => {
          const log = runLogs[d];
          const hasRun = log?.image || log?.time;
          const dayLabel = DAYS[i];
          const isToday = d === todayStr();
          const isSel = d === selDate;
          return (
            <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
              <div
                onClick={() => { onOpenLog(d); }}
                style={{
                  width: "100%", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", cursor: "pointer",
                  border: isSel ? "2px solid var(--accent)" : isToday ? "2px solid rgba(13,148,136,.4)" : "2px solid var(--bdr)",
                  background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", transition: "border-color .15s",
                }}
              >
                {hasRun && log?.image ? (
                  <img src={log.image} alt={d} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <img src={DEFAULT_RUN_IMG} alt={hasRun ? "달성(이미지없음)" : "미달성"} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hasRun ? 1 : .35 }} />
                )}
                {hasRun && <div style={{ position: "absolute", bottom: 2, right: 3, fontSize: "8px", background: "rgba(13,148,136,.85)", color: "#fff", borderRadius: "3px", padding: "1px 4px", fontFamily: "var(--mono)" }}>✓</div>}
              </div>
              <div style={{ fontSize: "10px", color: isToday ? "var(--accent)" : "var(--muted)", fontFamily: "var(--mono)", fontWeight: isToday ? 700 : 400 }}>{dayLabel}</div>
              {log?.distance && <div style={{ fontSize: "9px", color: "var(--accent)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>{formatDistance(log.distance)}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "80px", marginBottom: "6px", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(30 / maxMin) * 100}%`, borderTop: "1px dashed rgba(13,148,136,.3)", pointerEvents: "none", zIndex: 1 }} />
        {weekDates.map((d, i) => {
          const mins = getMin(d);
          const pct = anim ? Math.min((mins / maxMin) * 100, 100) : 0;
          const hasRun = !!(runLogs[d]?.time || runLogs[d]?.image);
          const col = hasRun ? "var(--accent)" : "rgba(0,0,0,0)";
          return (
            <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", cursor: "pointer" }} onClick={() => onOpenLog(d)}>
              <div style={{ width: "100%", border: hasRun ? `1.5px solid ${col}` : "1.5px solid var(--bdr)", borderBottom: "none", background: "transparent", height: `${Math.max(pct, hasRun ? 8 : 3)}%`, borderRadius: "3px 3px 0 0", transition: `height .65s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {hasRun && <span style={{ fontSize: "10px", fontWeight: 600, fontFamily: "var(--mono)", color: col, transform: "scale(0.85)" }}>{mins.toFixed(0)}분</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)", textAlign: "center" }}>썸네일 클릭으로 런닝 데이터 입력</div>
    </Card>
  );
}
