import React from "react";

export function Card({ children, className = "", title, headerRight }) {
  return (
    <div className={`card ${className}`}>
      {(title || headerRight) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          {title && <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>{title}</span>}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, trend, onClick }) {
  return (
    <div className="card" style={{ padding: "12px", cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "12px" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--txt)" }}>{value}</div>
      {(sub || trend) && (
        <div style={{ fontSize: "10px", marginTop: "2px", display: trend ? "flex" : "block", gap: "3px" }}>
          {trend && <span style={{ color: trend.startsWith("+") ? "#059669" : "#dc2626", fontWeight: 600 }}>{trend}</span>}
          <span style={{ color: "var(--muted)" }}>{sub}</span>
        </div>
      )}
    </div>
  );
}
