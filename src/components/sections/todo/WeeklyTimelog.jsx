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
              {[0, 15, 30, 45].map(s => <th key={s} style={{ padding: "5px 8px", color: "var(--muted)", fontFamily: "var(--mono)", fontWeight: 500, textAlign: "left" }}>{s}분</th>)}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(h => (
              <tr key={h} style={{ borderBottom: "1px solid var(--bdr)" }}>
                <td style={{ padding: "3px 8px", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "10px", whiteSpace: "nowrap" }}>{String(h).padStart(2, "0")}시</td>
                {[0, 15, 30, 45].map(s => {
                  const val = getLog(selDate, h, s);
                  return (
                    <td key={s} style={{ padding: "2px 3px", minWidth: "60px" }}>
                      <div className="time-cell" onClick={() => onCellClick(selDate, h, s, val)}>
                        {val || <span style={{ color: "var(--bdr)" }}>—</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
