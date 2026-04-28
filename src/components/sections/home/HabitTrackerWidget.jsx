import React, { useMemo } from "react";
import { Card } from "../../common/Card";
import { DAYS, DEF_HABIT_NAMES } from "../../../constants";
import { todayStr, resolveHabitNames } from "../../../utils";

export function HabitTrackerWidget({ habitHistory, habitChecks, selDate }) {
  const weekDates = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // Mon = 0
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dow + i);
      return todayStr(d);
    });
  }, []);

  // Use today's habits as the reference list for the week
  const currentHabits = useMemo(() => {
    return resolveHabitNames(habitHistory, DEF_HABIT_NAMES, todayStr());
  }, [habitHistory]);

  const stats = useMemo(() => {
    let totalChecks = 0;
    let possibleChecks = currentHabits.length * 7;
    
    weekDates.forEach(date => {
      const checks = habitChecks[date] || [];
      totalChecks += checks.filter(c => c === true).length;
    });

    return { totalChecks, possibleChecks };
  }, [weekDates, habitChecks, currentHabits]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--txt)", marginBottom: "2px" }}>✨ 주간 습관 추적</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>이번 주 · 총 {stats.totalChecks}회 달성</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--muted)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}></span>달성
          <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid var(--bdr)", display: "inline-block", marginLeft: 4 }}></span>미달
        </div>
      </div>

      <div style={{ overflowX: "auto", margin: "0 -4px", padding: "0 4px" }}>
        <div style={{ minWidth: "300px" }}>
          {/* Header Row: Days */}
          <div style={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>HABITS</div>
            {DAYS.map((day, i) => (
              <div 
                key={day} 
                style={{ 
                  fontSize: "10px", 
                  textAlign: "center", 
                  color: weekDates[i] === todayStr() ? "var(--accent)" : "var(--muted)",
                  fontWeight: weekDates[i] === todayStr() ? 700 : 400,
                  fontFamily: "var(--mono)"
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Habit Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentHabits.map((name, hIdx) => (
              <div key={`${name}-${hIdx}`} style={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)", gap: "8px", alignItems: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                  {name || `습관 ${hIdx + 1}`}
                </div>
                {weekDates.map((date, dIdx) => {
                  const checks = habitChecks[date] || [];
                  const isChecked = checks[hIdx] === true;
                  const isToday = date === todayStr();

                  return (
                    <div key={date} style={{ display: "flex", justifyContent: "center" }}>
                      <div 
                        style={{ 
                          width: "14px", 
                          height: "14px", 
                          borderRadius: "50%", 
                          background: isChecked ? "var(--accent)" : "transparent",
                          border: isChecked ? "none" : `1.5px solid ${isToday ? "rgba(13,148,136,.3)" : "var(--bdr)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all .2s ease",
                          boxShadow: isChecked ? "0 2px 4px rgba(13,148,136,.2)" : "none"
                        }}
                      >
                        {isChecked && <div style={{ width: "4px", height: "4px", background: "#fff", borderRadius: "50%" }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--bg2)", display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)" }}>
          PROGRESS: {Math.round((stats.totalChecks / (stats.possibleChecks || 1)) * 100)}%
        </div>
      </div>
    </Card>
  );
}
