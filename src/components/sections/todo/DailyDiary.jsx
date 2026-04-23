import React, { useState } from "react";
import { Card } from "../../common/Card";

export function DailyDiary({ date, content, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content || "");

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're closing edit mode, reset text to current content if not saved
      setText(content || "");
    } else {
      setText(content || "");
    }
    setIsEditing(!isEditing);
  };

  const handleSaveClick = () => {
    onSave(date, text);
    setIsEditing(false);
  };

  return (
    <Card className="p-14" style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)" }}>✍️ 오늘 나는 작가</div>
        <button 
          onClick={handleToggleEdit}
          style={{ 
            background: "none", border: "none", color: "var(--muted)", 
            cursor: "pointer", fontSize: "14px", padding: "4px",
            opacity: isEditing ? 1 : 0.6
          }}
          title={isEditing ? "취소" : "편집"}
        >
          {isEditing ? "✕" : "✎"}
        </button>
      </div>

      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            className="ta"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="오늘의 하루는 어땠나요? 당신의 이야기를 기록해 보세요."
            style={{ 
              minHeight: "120px", fontSize: "13px", lineHeight: "1.6", 
              width: "100%", padding: "10px", borderRadius: "8px",
              border: "1px solid var(--accent)", background: "var(--bg2)",
              color: "var(--txt)", outline: "none"
            }}
            autoFocus
          />
          <button 
            className="btn-prim" 
            style={{ alignSelf: "flex-end", padding: "6px 16px", fontSize: "12px" }}
            onClick={handleSaveClick}
          >
            저장하기
          </button>
        </div>
      ) : (
        <div 
          onClick={handleToggleEdit}
          style={{ 
            fontSize: "14px", lineHeight: "1.8", color: content ? "var(--txt)" : "var(--muted)",
            whiteSpace: "pre-wrap", cursor: "pointer", minHeight: "60px",
            fontFamily: "'Noto Serif KR', serif", // Option for a literary feel
            padding: "5px 0"
          }}
        >
          {content || "오늘의 특별한 조각을 이곳에 남겨보세요. (클릭하여 작성)"}
        </div>
      )}
    </Card>
  );
}
