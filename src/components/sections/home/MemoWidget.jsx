import React, { useState } from "react";
import { Card } from "../../common/Card";
import { MEMO_TAGS } from "../../../constants";

export function MemoWidget({ memos, setMemos }) {
  const [input, setInput] = useState("");
  const [tag, setTag] = useState(MEMO_TAGS[0]);
  const [filter, setFilter] = useState("전체");

  const filtered = filter === "전체" ? memos : memos.filter(m => m.tag === filter);

  const remove = id => setMemos(p => p.filter(m => m.id !== id));
  const add = () => {
    if (!input.trim()) return;
    const now = new Date();
    const date = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    setMemos(p => [{ id: Date.now(), content: input.trim(), tag, date }, ...p]);
    setInput("");
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--txt)" }}>메모</div>
        <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)", background: "var(--bg2)", padding: "2px 10px", borderRadius: "100px", border: "1px solid var(--bdr)" }}>{memos.length}개</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        <textarea
          className="ta"
          placeholder="새 메모 입력..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={2}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            className="sel"
            style={{ flex: 1 }}
            value={tag}
            onChange={e => setTag(e.target.value)}
          >
            {MEMO_TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
          <button className="btn-prim sm" onClick={add}>저장</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {["전체", ...MEMO_TAGS].map(t => (
          <button
            key={t}
            className={`pill${filter === t ? " on" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {filtered.map(m => (
          <div key={m.id} className="memo-tile">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 600 }}>{m.tag}</span>
              </div>
              <button className="rm" onClick={() => remove(m.id)}>✕</button>
            </div>
            <div style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--txt)", wordBreak: "break-word", flex: 1 }}>{m.content}</div>
            <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)", marginTop: "8px" }}>{m.date}</div>
          </div>
        ))}
        {!filtered.length && <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--muted)", fontSize: "13px", padding: "20px" }}>메모가 없습니다</div>}
      </div>
    </Card>
  );
}
