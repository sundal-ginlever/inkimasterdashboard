import React from "react";
import { Card } from "../../common/Card";
import { todayStr, resolveHabitNames } from "../../../utils";
import { DEF_HABIT_NAMES } from "../../../constants";

export function MonthlyCalendar({ calY, calM, onPrevMonth, onNextMonth, calInfo, todos, habitChecks, habitHistory, runLogs, selDate, onDateClick }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <button className="icon-btn" onClick={onPrevMonth}>‹</button>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--txt)" }}>{calY}년 {calM + 1}월</div>
        <button className="icon-btn" onClick={onNextMonth}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "4px" }}>
        {["월", "화", "수", "목", "금", "토", "일"].map(d => <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)", padding: "3px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "3px" }}>
        {Array.from({ length: calInfo.first }).map((_, i) => <div key={"e" + i} />)}
        {Array.from({ length: calInfo.days }).map((_, i) => {
          const day = i + 1;
          const ds = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const tc = (todos || []).filter(t => t.date === ds).length;
          const dc = (todos || []).filter(t => t.date === ds && t.done).length;
          const hc = (habitChecks[ds] || []).filter(Boolean).length;
          const hasRun = !!(runLogs[ds]?.time || runLogs[ds]?.image);
          const isToday = ds === todayStr(), isSel = ds === selDate;
          const thumb = runLogs[ds]?.image;
          return (
            <div key={day} onClick={() => onDateClick(ds)}
              style={{
                padding: "4px 2px", borderRadius: "8px", textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden",
                background: isSel ? "rgba(13,148,136,.12)" : isToday ? "rgba(13,148,136,.05)" : "transparent",
                border: isSel ? "1px solid var(--accent)" : isToday ? "1px solid rgba(13,148,136,.3)" : "1px solid transparent", transition: "all .15s", minHeight: "52px"
              }}>
              {thumb && <img src={thumb} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .18, borderRadius: "7px" }} />}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: isToday || isSel ? 700 : 400, color: isSel ? "var(--accent)" : isToday ? "var(--accent)" : "var(--txt)" }}>{day}</div>
                {hasRun && <div style={{ fontSize: "10px", color: "var(--accent)" }}>🏃</div>}
                {tc > 0 && <div style={{ fontSize: "8px", color: dc === tc ? "#10b981" : "#f59e0b", fontFamily: "var(--mono)" }}>{dc}/{tc}✓</div>}
                {hc > 0 && <div style={{ fontSize: "8px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{hc}/{resolveHabitNames(habitHistory || {}, DEF_HABIT_NAMES, ds).length}🎯</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--muted)", textAlign: "center", fontFamily: "var(--mono)" }}>날짜 클릭 → 일일 기록</div>
    </Card>
  );
}
