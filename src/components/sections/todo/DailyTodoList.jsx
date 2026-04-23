import React from "react";
import { Card } from "../../common/Card";
import { PRIO_COLORS, PRIO_LABELS } from "../../../constants";

export function DailyTodoList({ todos, onToggle, onRemove, onAddClick }) {
  return (
    <Card className="p-14">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)" }}>✦ To-do</div>
        <button className="sm-btn" style={{ fontSize: "11px", padding: "4px 10px" }} onClick={onAddClick}>+</button>
      </div>
      {todos.length === 0 && <div style={{ fontSize: "12px", color: "var(--muted)", padding: "10px 0", textAlign: "center" }}>할 일 없음</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "200px", overflowY: "auto" }}>
        {todos.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: "7px", padding: "7px 8px", background: "var(--bg2)", borderRadius: "8px", opacity: t.done ? .45 : 1 }}>
            <button onClick={() => onToggle(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--accent)", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>{t.done ? "◉" : "○"}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--txt)", wordBreak: "break-word" }}>{t.text}</div>
              <div style={{ fontSize: "10px", color: PRIO_COLORS[t.priority], fontFamily: "var(--mono)", marginTop: "2px" }}>● {PRIO_LABELS[t.priority]}</div>
            </div>
            <button 
              className="rm" 
              onClick={() => onRemove(t.id)}
              style={{ 
                background: "none", border: "none", color: "var(--muted)", 
                cursor: "pointer", fontSize: "14px", padding: "4px", 
                opacity: 0.4, transition: "opacity .2s", marginLeft: "auto" 
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
