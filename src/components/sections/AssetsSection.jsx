import React, { useState, useMemo } from "react";
import { todayStr } from "../../utils";
import { EXPENSE_CATS, INCOME_CATS } from "../../constants";
import { StatCard } from "../common/Card";
import { Modal } from "../common/Modal";
import { CryptoDash } from "./crypto/CryptoDash";
import { exportMonthlyLedger } from "../../utils/exportUtils";

export function AssetsSection({ assets, setAssets, ledger, setLedger, cryptoWallets, setCryptoWallets, cryptoBalances, setCryptoBalances, cryptoTrackedTokens, setCryptoTrackedTokens }) {
  const [sub, setSub] = useState("ledger");
  return (
    <div className="sec">
      <div style={{ display: "flex", gap: "6px" }}>
        {[["ledger", "💳 가계부"], ["assets", "◈ 자산 현황"], ["crypto", "🪙 가상자산"]].map(([v, l]) => (
          <button key={v} className={`pill${sub === v ? " on" : ""}`} onClick={() => setSub(v)}>{l}</button>
        ))}
      </div>
      {sub === "ledger" && <LedgerDash ledger={ledger} setLedger={setLedger} />}
      {sub === "assets" && <AssetsDash assets={assets} setAssets={setAssets} />}
      {sub === "crypto" && <CryptoDash cryptoWallets={cryptoWallets} setCryptoWallets={setCryptoWallets} cryptoBalances={cryptoBalances} setCryptoBalances={setCryptoBalances} cryptoTrackedTokens={cryptoTrackedTokens} setCryptoTrackedTokens={setCryptoTrackedTokens} />}
    </div>
  );
}

function AssetsDash({ assets, setAssets }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", amount: "", icon: "💼", change: "" });
  const total = assets.reduce((s, a) => s + a.amount, 0);
  
  const update = () => { 
    if (!form.name || !form.amount) return; 
    setAssets(p => p.map(a => a.id === editId ? { ...form, id: editId, amount: Number(form.amount), change: Number(form.change) || 0 } : a)); 
    setEditId(null); 
  };
  
  const remove = id => setAssets(p => p.filter(a => a.id !== id));
  const openEdit = (a) => { setForm(a); setEditId(a.id); };

  return (
    <>
      <div className="stats-row">
        <StatCard label="총 자산" value={`${(total / 10000).toFixed(0)}만`} />
        <StatCard label="항목" value={assets.length} />
        <StatCard label="수익 항목" value={assets.filter(a => a.change > 0).length} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {assets.map(a => (
          <div key={a.id} onClick={() => openEdit(a)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", padding: "12px 14px", boxShadow: "var(--sh)" }}>
            <div style={{ fontSize: "22px", flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "2px" }}>{a.name}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--mono)", color: "var(--txt)" }}>{a.amount.toLocaleString()}원</div>
              <div style={{ fontSize: "11px", fontFamily: "var(--mono)", color: a.change > 0 ? "#10b981" : a.change < 0 ? "#ef4444" : "var(--muted)" }}>{a.change > 0 ? "+" : ""}{a.change}%</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", minWidth: "50px" }}>
              <div style={{ height: "4px", background: "var(--accent)", borderRadius: "4px", width: `${Math.round((a.amount / (total || 1)) * 100)}%`, maxWidth: "50px" }} />
              <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{Math.round((a.amount / (total || 1)) * 100)}%</span>
            </div>
            <button className="rm" onClick={(e) => { e.stopPropagation(); remove(a.id); }}>✕</button>
          </div>
        ))}
      </div>
      {editId && (
        <Modal title="자산 수정" isOpen={true} onClose={() => setEditId(null)}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>아이콘</div>
            <select className="sel" style={{ width: "100%" }} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}>
              {["💼", "📈", "🏦", "🌐", "💵", "🏠", "💎", "📊", "🪙", "💳"].map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>자산명</div>
            <input className="inp" placeholder="예: 해외 ETF" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>금액(원)</div>
            <input className="inp" type="number" placeholder="5000000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>등락률(%)</div>
            <input className="inp" type="number" placeholder="2.5" value={form.change} onChange={e => setForm({ ...form, change: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={update}>저장</button>
            <button className="btn-ghost" onClick={() => setEditId(null)}>취소</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function LedgerDash({ ledger, setLedger }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ type: "expense", amount: "", cat: EXPENSE_CATS[0], note: "", date: todayStr() });
  const [filter, setFilter] = useState("all");
  const [selMonth, setSelMonth] = useState(() => todayStr().slice(0, 7));
  
  const months = useMemo(() => { 
    const s = new Set(ledger.map(l => l.date.slice(0, 7))); 
    s.add(todayStr().slice(0, 7)); 
    return Array.from(s).sort().reverse(); 
  }, [ledger]);
  
  const monthly = ledger.filter(l => l.date.startsWith(selMonth));
  const filtered = filter === "all" ? monthly : monthly.filter(l => l.type === filter);
  const totalIn = monthly.filter(l => l.type === "income").reduce((s, l) => s + l.amount, 0);
  const totalEx = monthly.filter(l => l.type === "expense").reduce((s, l) => s + l.amount, 0);
  
  const save = () => { 
    if (!form.amount) return; 
    setLedger(p => [{ id: Date.now(), ...form, amount: Number(form.amount) }, ...p]); 
    setForm({ type: "expense", amount: "", cat: EXPENSE_CATS[0], note: "", date: todayStr() }); 
    setShow(false); 
  };
  
  const remove = id => setLedger(p => p.filter(l => l.id !== id));

  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <select className="sel" value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ flex: 1 }}>
          {months.map(m => <option key={m} value={m}>{m.replace("-", "년 ")}월</option>)}
        </select>
        <div style={{ display: "flex", gap: "4px" }}>
          <button className="sm-btn" style={{ background: "var(--bg2)", color: "var(--txt)" }} onClick={() => exportMonthlyLedger.pdf(selMonth, "ledger-to-export")}>PDF</button>
          <button className="sm-btn" style={{ background: "var(--bg2)", color: "var(--txt)" }} onClick={() => exportMonthlyLedger.csv(selMonth, monthly)}>CSV</button>
          <button className="sm-btn" style={{ background: "var(--bg2)", color: "var(--txt)" }} onClick={() => exportMonthlyLedger.json(selMonth, monthly)}>JSON</button>
        </div>
        <button className="sm-btn" onClick={() => setShow(true)}>+ 기록</button>
      </div>
      <div id="ledger-to-export" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="stats-row">
          <StatCard label="수입" value={`${(totalIn / 1000).toFixed(2)}천`} />
          <StatCard label="지출" value={`${(totalEx / 1000).toFixed(2)}천`} />
          <StatCard label="잔액" value={`${((totalIn - totalEx) / 1000).toFixed(2)}천`} />
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          {[["all", "전체"], ["income", "수입"], ["expense", "지출"]].map(([v, l]) => (
            <button key={v} className={`pill${filter === v ? " on" : ""}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {!filtered.length && <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "13px", padding: "24px" }}>기록이 없습니다</div>}
          {filtered.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "12px", padding: "10px 14px", boxShadow: "var(--sh)" }}>
              <div style={{ fontSize: "20px", flexShrink: 0 }}>{l.cat.split(" ")[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--txt)" }}>{l.cat.replace(/^\S+\s/, "")}{l.note ? ` · ${l.note}` : ""}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)", marginTop: "1px" }}>{l.date}</div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--mono)", color: l.type === "income" ? "#10b981" : "#ef4444", flexShrink: 0 }}>
                {l.type === "income" ? "+" : "-"}{(l.amount / 1000).toFixed(2)}천
              </div>
              <button className="rm" onClick={() => remove(l.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      {show && (
        <Modal title="가계부 기록" isOpen={true} onClose={() => setShow(false)}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>구분</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["expense", "💸 지출"], ["income", "💰 수입"]].map(([v, l]) => (
                <button key={v} className={`prio-btn${form.type === v ? " on" : ""}`} onClick={() => setForm({ ...form, type: v, cat: v === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0] })}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>카테고리</div>
            <select className="sel" style={{ width: "100%" }} value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}>
              {(form.type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>금액(원)</div>
            <input className="inp" type="number" placeholder="15000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} autoFocus />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>메모(선택)</div>
            <input className="inp" placeholder="점심, 교통비 등" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>날짜</div>
            <input className="inp" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button className="btn-prim" style={{ flex: 1, opacity: form.amount ? 1 : 0.4, cursor: form.amount ? "pointer" : "not-allowed" }} disabled={!form.amount} onClick={save}>저장</button>
            <button className="btn-ghost" onClick={() => setShow(false)}>취소</button>
          </div>
        </Modal>
      )}
    </>
  );
}
