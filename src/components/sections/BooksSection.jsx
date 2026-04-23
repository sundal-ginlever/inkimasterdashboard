import React, { useState } from "react";
import { BOOK_SC } from "../../constants";
import { StatCard } from "../common/Card";
import { Modal } from "../common/Modal";

export function BooksSection({ books, setBooks }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", author: "", status: "읽고 싶음", finishDate: "", readCount: "0", note: "", rating: 0 });
  
  const done = books.filter(b => b.status === "완독").length;
  const reading = books.filter(b => b.status === "읽는 중").length;
  
  const update = () => { 
    if (!form.title) return; 
    setBooks(p => p.map(b => {
      if (b.id !== editId) return b;
      const updated = { ...form };
      if (!updated.finishDate) delete updated.finishDate;
      if (!updated.readCount || Number(updated.readCount) === 0) delete updated.readCount;
      else updated.readCount = Number(updated.readCount);
      if (!updated.rating || updated.rating === 0) delete updated.rating;
      if (!updated.note) delete updated.note;
      return updated;
    })); 
    setEditId(null); 
  };
  
  const remove = id => setBooks(p => p.filter(b => b.id !== id));
  const openEdit = (b) => { setForm(b); setEditId(b.id); };

  return (
    <div className="sec">
      <div className="stats-row">
        <StatCard label="완독" value={done} />
        <StatCard label="읽는 중" value={reading} />
        <StatCard label="읽고 싶음" value={books.length - done - reading} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {books.map(b => (
          <div key={b.id} onClick={() => openEdit(b)} style={{ cursor: "pointer", display: "flex", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", overflow: "hidden", position: "relative", boxShadow: "var(--sh)" }}>
            <div style={{ width: "4px", background: BOOK_SC[b.status], flexShrink: 0 }} />
            <div style={{ flex: 1, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--txt)" }}>{b.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>{b.author}</div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "var(--mono)", color: BOOK_SC[b.status], whiteSpace: "nowrap" }}>{b.status}</span>
              </div>
              {b.note && <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>✎ {b.note}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  {b.finishDate && <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>📅 {b.finishDate}</span>}
                  {b.readCount > 0 && <span style={{ fontSize: "11px", color: "#0ea5e9", fontFamily: "var(--mono)" }}>🔄 {b.readCount}회독</span>}
                </div>
                <div>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= b.rating ? "#f59e0b" : "#d1d5db", fontSize: "13px" }}>★</span>)}</div>
              </div>
            </div>
            <button className="rm" style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }} onClick={(e) => { e.stopPropagation(); remove(b.id); }}>✕</button>
          </div>
        ))}
      </div>
      {editId && (
        <Modal title="도서 수정" isOpen={true} onClose={() => setEditId(null)}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>제목</div>
            <input className="inp" placeholder="책 제목" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>저자</div>
            <input className="inp" placeholder="저자명" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>독서 상태</div>
            <select className="sel" style={{ width: "100%" }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>읽고 싶음</option>
              <option>읽는 중</option>
              <option>완독</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>완독일자</div>
              <input className="inp" type="date" value={form.finishDate} onChange={e => setForm({ ...form, finishDate: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>완독 횟수</div>
              <input className="inp" type="number" min="0" placeholder="1" value={form.readCount} onChange={e => setForm({ ...form, readCount: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>별점</div>
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setForm({ ...form, rating: s })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: s <= form.rating ? "#f59e0b" : "#d1d5db" }}>★</button>)}
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>메모(선택)</div>
            <input className="inp" placeholder="간단한 메모" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={update}>저장</button>
            <button className="btn-ghost" onClick={() => setEditId(null)}>취소</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
