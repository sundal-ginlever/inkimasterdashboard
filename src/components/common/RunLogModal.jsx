import React, { useState, useRef } from "react";
import { Modal } from "./Modal";
import { ScrollPicker } from "./ScrollPicker";
import { resizeImage } from "../../utils/imageResizer";

// Static picker items (created once, never recreated)
const H_ITEMS = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0"));
const M_ITEMS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const S_ITEMS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const D_ITEMS = Array.from({ length: 10 }, (_, i) => String(i));

export function RunLogModal({ date, log, onSave, onClose }) {
  const [imgSrc, setImgSrc] = useState(log?.image || "");

  const [h, setH] = useState(() => (log?.time || "00:00:00").split(":")[0]);
  const [m, setM] = useState(() => (log?.time || "00:00:00").split(":")[1] || "00");
  const [s, setS] = useState(() => (log?.time || "00:00:00").split(":")[2] || "00");

  const [dArr, setDArr] = useState(() => {
    let d = String(log?.distance || 0);
    return d.padStart(4, "0").split("").slice(-4);
  });

  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const resized = await resizeImage(ev.target.result, 800, 800, 0.7);
        setImgSrc(resized);
      } catch (err) {
        console.error("Image resize failed:", err);
        setImgSrc(ev.target.result); // Fallback to original if resize fails
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    onSave(date, { image: imgSrc || null, time: `${h}:${m}:${s}`, distance: Number(dArr.join("")) || 0 });
    onClose();
  };



  return (
    <Modal title={`🏃 런닝 기록 · ${date}`} isOpen={true} onClose={onClose}>
      <div
        onClick={() => fileRef.current.click()}
        style={{ width: "100%", aspectRatio: "1", borderRadius: "10px", overflow: "hidden", cursor: "pointer", border: "2px dashed var(--bdr)", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", maxHeight: "200px", marginBottom: "16px" }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt="run" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>📷</div>
            <div style={{ fontSize: "12px" }}>삼성헬스 이미지 업로드</div>
            <div style={{ fontSize: "10px", marginTop: "2px", fontFamily: "var(--mono)" }}>1440×1440 권장</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>
      {imgSrc && <button style={{ fontSize: "11px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginTop: "-12px", marginBottom: "12px", display: "block" }} onClick={() => setImgSrc("")}>이미지 제거</button>}

      <div style={{ marginBottom: "12px", fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>런닝 시간</div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <ScrollPicker items={H_ITEMS} value={h} onChange={setH} width="60px" />
        <span style={{ fontFamily: "var(--mono)", color: "var(--txt)", fontWeight: 700 }}>:</span>
        <ScrollPicker items={M_ITEMS} value={m} onChange={setM} width="60px" />
        <span style={{ fontFamily: "var(--mono)", color: "var(--txt)", fontWeight: 700 }}>:</span>
        <ScrollPicker items={S_ITEMS} value={s} onChange={setS} width="60px" />
      </div>

      <div style={{ marginBottom: "12px", fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>런닝 거리 (km)</div>
      <div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        {dArr.slice(0, 2).map((v, i) => (
          <ScrollPicker key={i} items={D_ITEMS} value={v} onChange={(val) => {
            setDArr(p => { const r = [...p]; r[i] = val; return r; })
          }} width="36px" />
        ))}
        <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--txt)", margin: "0 2px" }}>.</span>
        {dArr.slice(2).map((v, i) => (
          <ScrollPicker key={i + 2} items={D_ITEMS} value={v} onChange={(val) => {
            setDArr(p => { const r = [...p]; r[i + 2] = val; return r; })
          }} width="36px" />
        ))}
        <span style={{ fontFamily: "var(--mono)", color: "var(--txt)", fontWeight: 700, marginLeft: "8px", fontSize: "14px" }}>km</span>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
        <button className="btn-prim" style={{ flex: 1 }} onClick={save}>저장</button>
        <button className="btn-ghost" onClick={onClose}>취소</button>
      </div>
    </Modal>
  );
}
