import React from "react";
import { Card } from "../../common/Card";

export function WeeklyTimelog({ selDate, getLog, onCellClick }) {
  const HOURS = Array.from({ length: 20 }, (_, i) => i + 4);

  return (
    <Card className="p-14">
      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)", marginBottom: "10px" }}>⏱ Time Log</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", minWidth: "300px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
              <th style={{ padding: "5px 8px", color: "var(--muted)", fontFamily: "var(--mono)", fontWeight: 500, textAlign: "left", width: "42px" }}>Time</th>
              <th style={{ width: "30px", padding: "5px 4px" }}></th>
              {[0, 15, 30, 45].map(s => <th key={s} style={{ padding: "5px 8px", color: "var(--muted)", fontFamily: "var(--mono)", fontWeight: 500, textAlign: "left" }}>{s}분</th>)}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(h => {
              const isChecked = getLog(selDate, h, "_checked");
              return (
                <tr key={h} style={{ borderBottom: "1px solid var(--bdr)", background: isChecked ? "rgba(var(--accent-rgb), 0.03)" : "transparent" }}>
                  <td style={{ padding: "3px 8px", color: isChecked ? "var(--accent)" : "var(--muted)", fontFamily: "var(--mono)", fontSize: "10px", whiteSpace: "nowrap", fontWeight: isChecked ? 700 : 400 }}>
                    {String(h).padStart(2, "0")}시
                  </td>
                  <td style={{ padding: "3px 4px", textAlign: "center" }}>
                    <button 
                      onClick={() => onCellClick(selDate, h, "_checked", !isChecked)}
                      style={{ 
                        background: isChecked ? "var(--accent)" : "rgba(255,255,255,0.05)", 
                        border: `1px solid ${isChecked ? "var(--accent)" : "var(--bdr)"}`, 
                        borderRadius: "4px",
                        width: "18px",
                        height: "18px",
                        cursor: "pointer", 
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px", 
                        fontWeight: "900",
                        color: isChecked ? "white" : "var(--muted)",
                        opacity: isChecked ? 1 : 0.5,
                        transition: "all 0.2s",
                        padding: 0
                      }}
                      title={isChecked ? "완료됨" : "미완료"}
                    >
                      {isChecked ? "V" : "X"}
                    </button>
                  </td>
                  {[0, 15, 30, 45].map(s => {
                    const val = getLog(selDate, h, s);
                    return (
                      <td key={s} style={{ padding: "2px 3px", minWidth: "60px" }}>
                        <div className="time-cell" onClick={() => onCellClick(selDate, h, s, val)} style={{ color: isChecked ? "var(--txt)" : "var(--muted)" }}>
                          {val || <span style={{ color: "var(--bdr)" }}>—</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
