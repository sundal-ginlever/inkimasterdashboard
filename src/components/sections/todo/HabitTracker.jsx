import React from "react";
import { Card } from "../../common/Card";

export function HabitTracker({ habitNames, habitChecks, setCheck, onEditName, onAdd, onRemove, maxHabits }) {
  return (
    <Card className="p-14">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)", display: "flex", alignItems: "center", gap: "5px" }}>🎯 Habit</div>
        <button 
          className="sm-btn" 
          onClick={onAdd}
          disabled={habitNames.length >= maxHabits}
          style={{ fontSize: "11px", padding: "2px 8px", opacity: habitNames.length >= maxHabits ? 0.3 : 1 }}
        >
          +
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {habitNames.map((name, i) => (
          <div key={i} className="habit-item" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <button
              onClick={() => setCheck(i, !habitChecks[i])}
              style={{ 
                width: 18, height: 18, borderRadius: 4, 
                border: `2px solid ${habitChecks[i] ? "var(--accent)" : "var(--bdr)"}`, 
                background: habitChecks[i] ? "var(--accent)" : "transparent", 
                flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" 
              }}
            >
              {habitChecks[i] && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
            </button>
            <span
              onClick={() => onEditName(i, name)}
              style={{ 
                fontSize: "12px", 
                color: habitChecks[i] ? "var(--muted)" : "var(--txt)", 
                textDecoration: habitChecks[i] ? "line-through" : "none", 
                cursor: "text", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}
            >{name || <span style={{ color: "var(--bdr)" }}>항목...</span>}</span>
            <button 
              onClick={() => onRemove(i)}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "12px", padding: "2px", opacity: 0.5 }}
              className="rm-habit"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
