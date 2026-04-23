import React, { useState } from "react";
import { todayStr } from "../../utils";
import { RECORD_TYPES, MEMO_TAGS, EXPENSE_CATS, INCOME_CATS, PRIO_COLORS } from "../../constants";
import { Card } from "../common/Card";
import { Modal } from "../common/Modal";

export function RecordTab({ setTodos, setAssets, setBooks, setMemos, setLedger, bookmarks = [], setBookmarks }) {
  const [type, setType] = useState("memo");
  const [saved, setSaved] = useState(false);
  
  // Bookmark form
  const [bmModal, setBmModal] = useState(false);
  const [bmUrl, setBmUrl] = useState("");
  const [bmTitle, setBmTitle] = useState("");
  const [bmLoading, setBmLoading] = useState(false);
  const [bmThumb, setBmThumb] = useState("");

  const handleFetchMeta = async () => {
    if (!bmUrl) return;
    setBmLoading(true);
    try {
      let urlStr = bmUrl;
      if (!urlStr.startsWith("http")) urlStr = "https://" + urlStr;
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(urlStr)}`);
      const data = await res.json();
      if (data.status === 'success') {
        const d = data.data;
        if (!bmTitle) setBmTitle(d.title || "");
        if (!bmThumb) setBmThumb(d.image?.url || d.logo?.url || "");
      }
    } catch (e) {
      console.log("Failed to fetch metadata", e);
    } finally {
      setBmLoading(false);
    }
  };

  const handleSaveBookmark = () => {
    if (!bmUrl) return;
    let urlStr = bmUrl;
    if (!urlStr.startsWith("http")) urlStr = "https://" + urlStr;
    setBookmarks(p => [{
      id: Date.now(),
      url: urlStr,
      title: bmTitle,
      image: bmThumb,
      date: todayStr()
    }, ...p]);
    setBmUrl("");
    setBmTitle("");
    setBmThumb("");
    setBmModal(false);
  };
  
  // Memo form
  const [mContent, setMContent] = useState(""); 
  const [mTag, setMTag] = useState(MEMO_TAGS[0]);
  
  // Todo form
  const [tText, setTText] = useState(""); 
  const [tPrio, setTPrio] = useState("medium"); 
  const [tDate, setTDate] = useState(todayStr());
  
  // Asset form
  const [aName, setAName] = useState(""); 
  const [aAmt, setAAmt] = useState(""); 
  const [aChg, setAChg] = useState(""); 
  const [aIcon, setAIcon] = useState("💼");
  
  // Book form
  const [bTitle, setBTitle] = useState(""); 
  const [bAuthor, setBAuthor] = useState(""); 
  const [bStatus, setBStatus] = useState("읽고 싶음");
  const [bFinish, setBFinish] = useState(""); 
  const [bCount, setBCount] = useState("0"); 
  const [bRating, setBRating] = useState(0); 
  const [bNote, setBNote] = useState("");
  
  // Ledger form
  const [lType, setLType] = useState("expense"); 
  const [lAmt, setLAmt] = useState(""); 
  const [lCat, setLCat] = useState(EXPENSE_CATS[0]); 
  const [lNote, setLNote] = useState(""); 
  const [lDate, setLDate] = useState(todayStr());

  const cur = RECORD_TYPES.find(r => r.value === type);
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };
  
  const handleSave = () => {
    const now = new Date(); 
    const ds = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    
    if (type === "memo") { 
      if (!mContent.trim()) return; 
      setMemos(p => [{ id: Date.now(), content: mContent.trim(), tag: mTag, date: ds }, ...p]); 
      setMContent(""); 
    }
    else if (type === "todo") { 
      if (!tText.trim()) return; 
      setTodos(p => [...p, { id: Date.now(), text: tText.trim(), done: false, priority: tPrio, date: tDate }]); 
      setTText(""); 
    }
    else if (type === "asset") { 
      if (!aName || !aAmt) return; 
      setAssets(p => [...p, { id: Date.now(), name: aName, amount: Number(aAmt), change: Number(aChg) || 0, icon: aIcon }]); 
      setAName(""); setAAmt(""); setAChg(""); 
    }
    else if (type === "book") { 
      if (!bTitle) return; 
      const newBook = { id: Date.now(), title: bTitle, author: bAuthor, status: bStatus };
      if (bFinish) newBook.finishDate = bFinish;
      if (Number(bCount) > 0) newBook.readCount = Number(bCount);
      if (bRating > 0) newBook.rating = bRating;
      if (bNote) newBook.note = bNote;
      
      setBooks(p => [...p, newBook]); 
      setBTitle(""); setBAuthor(""); setBFinish(""); setBCount("0"); setBRating(0); setBNote(""); 
    }
    else if (type === "ledger") { 
      if (!lAmt) return; 
      setLedger(p => [{ id: Date.now(), type: lType, amount: Number(lAmt), cat: lCat, note: lNote, date: lDate }, ...p]); 
      setLAmt(""); setLNote(""); 
    }
    flash();
  };

  const Lbl = ({ children }) => <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>{children}</div>;

  return (
    <div className="sec">
      <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
        {RECORD_TYPES.map(r => (
          <button 
            key={r.value} 
            className={`type-pill${type === r.value ? " on" : ""}`} 
            style={type === r.value ? { borderColor: r.color, color: r.color, background: `${r.color}18` } : {}} 
            onClick={() => setType(r.value)}
          >{r.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--muted)", fontFamily: "var(--mono)", borderTop: "1px solid var(--bdr)", paddingTop: "12px" }}>
        <span style={{ color: cur.color }}>●</span>{cur.label} 추가
      </div>
      <Card style={{ gap: "18px", display: "flex", flexDirection: "column" }}>
        {type === "memo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <textarea className="ta" placeholder="메모 내용..." value={mContent} onChange={e => setMContent(e.target.value)} rows={4} autoFocus />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Lbl>태그</Lbl>
              <select className="sel" value={mTag} onChange={e => setMTag(e.target.value)}>
                {MEMO_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
        {type === "todo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input className="inp" placeholder="할 일 내용" value={tText} onChange={e => setTText(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Lbl>날짜</Lbl>
              <input className="inp" type="date" value={tDate} onChange={e => setTDate(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[["high", "🔴 높음"], ["medium", "🟡 보통"], ["low", "🟢 낮음"]].map(([v, l]) => (
                <button 
                  key={v} 
                  className={`prio-btn${tPrio === v ? " on" : ""}`} 
                  style={tPrio === v ? { borderColor: PRIO_COLORS[v], color: PRIO_COLORS[v], background: `${PRIO_COLORS[v]}18` } : {}} 
                  onClick={() => setTPrio(v)}
                >{l}</button>
              ))}
            </div>
          </div>
        )}
        {type === "asset" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <select className="sel" value={aIcon} onChange={e => {
                const icon = e.target.value;
                setAIcon(icon);
                const mapping = {
                  "💼": "입출금", "📈": "국내주식", "🏦": "예·적금", "🌐": "해외주식", 
                  "💵": "현금", "🏠": "부동산", "💎": "가상자산", "📊": "펀드", 
                  "🪙": "기타자산", "💳": "연금"
                };
                if (mapping[icon] && (!aName || Object.values(mapping).includes(aName))) {
                  setAName(mapping[icon]);
                }
              }} style={{ width: "120px" }}>
                {[
                  ["💼", "💼 입출금"], ["📈", "📈 국내주식"], ["🏦", "🏦 예·적금"], ["🌐", "🌐 해외주식"], 
                  ["💵", "💵 현금"], ["🏠", "🏠 부동산"], ["💎", "💎 가상자산"], ["📊", "📊 펀드"], 
                  ["🪙", "🪙 기타자산"], ["💳", "💳 연금"]
                ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input className="inp" style={{ flex: 1 }} placeholder="자산명" value={aName} onChange={e => setAName(e.target.value)} autoFocus />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input className="inp" style={{ flex: 2 }} type="number" placeholder="금액(원)" value={aAmt} onChange={e => setAAmt(e.target.value)} />
              <input className="inp" style={{ flex: 1 }} type="number" placeholder="등락%" value={aChg} onChange={e => setAChg(e.target.value)} />
            </div>
          </div>
        )}
        {type === "book" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input className="inp" placeholder="책 제목" value={bTitle} onChange={e => setBTitle(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: "8px" }}>
              <input className="inp" style={{ flex: 1 }} placeholder="저자" value={bAuthor} onChange={e => setBAuthor(e.target.value)} />
              <select className="sel" value={bStatus} onChange={e => setBStatus(e.target.value)}>
                <option>읽고 싶음</option>
                <option>읽는 중</option>
                <option>완독</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1 }}>
                <Lbl>완독일자</Lbl>
                <input className="inp" type="date" value={bFinish} onChange={e => setBFinish(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <Lbl>완독 횟수</Lbl>
                <input className="inp" type="number" min="0" placeholder="1" value={bCount} onChange={e => setBCount(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setBRating(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: s <= bRating ? "#f59e0b" : "#d1d5db" }}>★</button>)}
            </div>
            <input className="inp" placeholder="메모(선택)" value={bNote} onChange={e => setBNote(e.target.value)} />
          </div>
        )}
        {type === "ledger" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["expense", "💸 지출"], ["income", "💰 수입"]].map(([v, l]) => (
                <button 
                  key={v} 
                  className={`prio-btn${lType === v ? " on" : ""}`} 
                  style={lType === v ? { borderColor: v === "income" ? "#10b981" : "#ef4444", color: v === "income" ? "#10b981" : "#ef4444", background: v === "income" ? "#10b98118" : "#ef444418" } : {}} 
                  onClick={() => { setLType(v); setLCat(v === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0]); }}
                >{l}</button>
              ))}
            </div>
            <select className="sel" style={{ width: "100%" }} value={lCat} onChange={e => setLCat(e.target.value)}>
              {(lType === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="inp" type="number" placeholder="금액(원)" value={lAmt} onChange={e => setLAmt(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: "8px" }}>
              <input className="inp" style={{ flex: 1 }} placeholder="메모(선택)" value={lNote} onChange={e => setLNote(e.target.value)} />
              <input className="inp" type="date" value={lDate} onChange={e => setLDate(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
        )}
      </Card>
      <button className="record-save" onClick={handleSave} style={saved ? { background: "#10b981", color: "#fff" } : {}}>{saved ? "✓ 저장됨" : `${cur.label} 저장`}</button>

      {/* Bookmarks Section */}
      <div style={{ marginTop: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--txt)" }}>즐겨찾기 보드</div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "10px" 
        }}>
          {/* Add Button Tile */}
          <div 
            onClick={() => setBmModal(true)}
            style={{ 
              aspectRatio: "1/1", 
              borderRadius: "12px", 
              background: "var(--card)", 
              border: "1px dashed var(--bdr)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "32px",
              color: "var(--muted)",
              transition: "transform 0.1s"
            }}
            onPointerDown={e => e.currentTarget.style.transform = "scale(0.96)"}
            onPointerUp={e => e.currentTarget.style.transform = "scale(1)"}
            onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >+</div>
          
          {/* Bookmark Tiles */}
          {bookmarks.map(b => (
            <a 
              key={b.id} 
              href={b.url} 
              target="_blank" 
              rel="noreferrer"
              style={{
                aspectRatio: "1/1", 
                borderRadius: "12px", 
                background: b.image ? `url(${b.image}) center/cover` : "var(--card)",
                border: "1px solid var(--bdr)",
                position: "relative",
                overflow: "hidden",
                display: "block",
                textDecoration: "none",
                transition: "transform 0.1s"
              }}
              onPointerDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onPointerUp={e => e.currentTarget.style.transform = "scale(1)"}
              onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                padding: "24px 8px 8px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {b.title || b.url}
              </div>
            </a>
          ))}
        </div>
      </div>

      {bmModal && (
        <Modal title="즐겨찾기 추가" isOpen={true} onClose={() => setBmModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>URL</div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input className="inp" style={{ flex: 1 }} placeholder="example.com" value={bmUrl} onChange={e => setBmUrl(e.target.value)} autoFocus />
                <button className="btn-prim" onClick={handleFetchMeta} disabled={bmLoading} style={{ whiteSpace: "nowrap" }}>
                  {bmLoading ? "..." : "정보가져오기"}
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>제목 (선택)</div>
              <input className="inp" placeholder="사이트 제목" value={bmTitle} onChange={e => setBmTitle(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>썸네일 이미지 (선택)</div>
              <input className="inp" placeholder="이미지 주소 URL" value={bmThumb} onChange={e => setBmThumb(e.target.value)} />
            </div>
            {bmThumb && (
              <div style={{ marginTop: "8px", height: "120px", borderRadius: "8px", background: `url(${bmThumb}) center/cover`, border: "1px solid var(--bdr)" }} />
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={handleSaveBookmark}>저장</button>
            <button className="btn-ghost" onClick={() => setBmModal(false)}>취소</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
