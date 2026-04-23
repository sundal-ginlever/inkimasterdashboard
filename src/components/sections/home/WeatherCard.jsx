import React from "react";

export function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="weather-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: "4px" }}>{weather.city} · {weather.condition}</div>
          <div style={{ fontSize: "50px", fontWeight: 700, lineHeight: 1, fontFamily: "var(--mono)", color: "var(--txt)" }}>{weather.temp}<span style={{ fontSize: "22px", color: "var(--muted)" }}>°C</span></div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>체감 {weather.feels}°C</div>
        </div>
        <div style={{ fontSize: "52px", lineHeight: 1 }}>{weather.icon}</div>
      </div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
        {[`💧 ${weather.humidity}%`, `💨 ${weather.wind}m/s`, `☀ UV ${weather.uv}`].map((t, i) => (
          <span key={i} style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", borderTop: "1px solid var(--bdr)", paddingTop: "12px" }}>
        {weather.forecast.map((f, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{f.day}</div>
            <div style={{ fontSize: "17px" }}>{f.icon}</div>
            <div style={{ fontSize: "12px", fontWeight: 600, fontFamily: "var(--mono)", color: "var(--txt)" }}>{f.high}°</div>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{f.low}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
