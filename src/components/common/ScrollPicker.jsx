import React, { useEffect, useRef } from "react";

export function ScrollPicker({ items, value, onChange, width = "40px" }) {
  const containerRef = useRef(null);
  const itemHeight = 36;
  const isScrollActive = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const idx = items.indexOf(value);
      if (idx >= 0) containerRef.current.scrollTop = idx * itemHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    if (!isScrollActive.current) isScrollActive.current = true;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const idx = Math.round(e.target.scrollTop / itemHeight);
      if (items[idx] !== value && items[idx] !== undefined) {
        onChange(items[idx]);
      }
      isScrollActive.current = false;
    }, 100);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="scroll-picker"
      style={{
        height: `${itemHeight * 3}px`, overflowY: "auto", scrollSnapType: "y mandatory",
        width, background: "var(--bg2)", borderRadius: "8px", border: "1px solid var(--bdr)",
        position: "relative", touchAction: "pan-y"
      }}
    >
      <div style={{ pointerEvents: "none", position: "absolute", top: itemHeight, left: 0, right: 0, height: itemHeight, background: "rgba(13,148,136,.1)", borderTop: "1px solid var(--accent)", borderBottom: "1px solid var(--accent)" }} />
      <div style={{ height: itemHeight }} />
      {items.map(item => (
        <div key={item} style={{ height: `${itemHeight}px`, display: "flex", alignItems: "center", justifyContent: "center", scrollSnapAlign: "center", fontSize: "16px", fontFamily: "var(--mono)", fontWeight: value === item ? 700 : 400, color: value === item ? "var(--txt)" : "var(--muted)" }}>
          {item}
        </div>
      ))}
      <div style={{ height: itemHeight }} />
    </div>
  );
}
