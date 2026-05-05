import React, { useState, useMemo, useEffect, useRef } from "react";
import { todayStr, resolveHabitNames } from "../../utils";
import { DEF_HABIT_NAMES, DEFAULT_RUN_IMG } from "../../constants";
import { Card } from "../common/Card";
import { Modal } from "../common/Modal";
import { RunLogModal } from "../common/RunLogModal";
import { HabitTracker } from "./todo/HabitTracker";
import { DailyTodoList } from "./todo/DailyTodoList";
import { WeeklyTimelog } from "./todo/WeeklyTimelog";
import { DailyDiary } from "./todo/DailyDiary";
import { MonthlyCalendar } from "./todo/MonthlyCalendar";
import { exportDailyRecord } from "../../utils/exportUtils";

export function TodoSection({ 
  todos, setTodos, 
  timelogs, setTimelogs, 
  habitHistory, setHabitHistory, 
  habitChecks, setHabitChecks, 
  runLogs, setRunLogs,
  diary, setDiary
}) {
  const [view, setView] = useState("daily");
  const [selDate, setSelDate] = useState(todayStr());
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState(""); 
  const [prio, setPrio] = useState("medium");
  const [editCell, setEditCell] = useState(null); 
  const [cellVal, setCellVal] = useState("");
  const [runModalDate, setRunModalDate] = useState(null);

  // calendar
  const [calY, setCalY] = useState(() => new Date().getFullYear());
  const [calM, setCalM] = useState(() => new Date().getMonth());
  const calInfo = useMemo(() => ({ 
    first: (new Date(calY, calM, 1).getDay() + 6) % 7, 
    days: new Date(calY, calM + 1, 0).getDate() 
  }), [calY, calM]);

  const MAX_HABITS = 10;
  const habitNamesForDate = useMemo(() => {
    const names = resolveHabitNames(habitHistory || {}, DEF_HABIT_NAMES || [], selDate);
    return Array.isArray(names) ? names : (DEF_HABIT_NAMES || []);
  }, [habitHistory, selDate]);

  const todayChecks = useMemo(() => {
    const checks = habitChecks[selDate];
    if (Array.isArray(checks)) return checks;
    return Array(habitNamesForDate.length).fill(false);
  }, [habitChecks, selDate, habitNamesForDate]);

  // Rollover logic: move unfinished todos from previous days (runs once on mount)
  const hasRolledOver = useRef(false);
  useEffect(() => {
    if (hasRolledOver.current) return;
    if (selDate !== todayStr() || todos.length === 0) return;

    const hasPastUnfinished = todos.some(t => t.date < selDate && !t.done);
    if (!hasPastUnfinished) return;

    hasRolledOver.current = true;
    setTodos(p => p.map(t => 
      (t.date < selDate && !t.done) ? { ...t, date: selDate } : t
    ));
  }, [selDate, setTodos]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCheck = (i, val) => {
    setHabitChecks(p => {
      const current = p[selDate] || [];
      const next = [...current];
      while (next.length < habitNamesForDate.length) next.push(false);
      next[i] = val;
      return { ...p, [selDate]: next };
    });
  };

  const addHabit = () => {
    if (habitNamesForDate.length >= MAX_HABITS) return;
    const newNames = [...habitNamesForDate, ""];
    setHabitHistory(p => ({ ...p, [selDate]: newNames }));
  };

  const removeHabit = (idx) => {
    const newNames = habitNamesForDate.filter((_, i) => i !== idx);
    setHabitHistory(p => ({ ...p, [selDate]: newNames }));
    // Also update current checks to prevent misalignment
    setHabitChecks(p => {
      const current = p[selDate] || Array(habitNamesForDate.length).fill(false);
      return { ...p, [selDate]: current.filter((_, i) => i !== idx) };
    });
  };

  const [editHabitIdx, setEditHabitIdx] = useState(null); 
  const [habitInput, setHabitInput] = useState("");
  const saveHabitName = () => {
    if (editHabitIdx === null) return;
    const newNames = [...habitNamesForDate];
    newNames[editHabitIdx] = habitInput;
    setHabitHistory(p => {
      const n = { ...p };
      n[selDate] = [...newNames];
      Object.keys(n).forEach(d => {
        if (d > selDate) n[d] = [...n[d].slice(0, editHabitIdx), habitInput, ...n[d].slice(editHabitIdx + 1)];
      });
      return n;
    });
    setEditHabitIdx(null); setHabitInput("");
  };

  const dayTodos = useMemo(() => {
    if (!Array.isArray(todos)) return [];
    return todos.filter(t => t && t.date === selDate);
  }, [todos, selDate]);
  const doneCnt = dayTodos.filter(t => t.done).length;
  const addTodo = () => { 
    if (!text.trim()) return; 
    setTodos(p => [...p, { id: Date.now(), text: text.trim(), done: false, priority: prio, date: selDate }]); 
    setText(""); 
    setShowModal(false); 
  };
  const toggleTodo = id => setTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTodo = id => setTodos(p => p.filter(t => t.id !== id));

  const getLog = (date, hour, slot) => (timelogs[date]?.[hour]?.[slot]) || "";
  const saveCell = () => {
    if (!editCell) return;
    const { date, hour, slot } = editCell;
    setTimelogs(p => ({
      ...p,
      [date]: {
        ...(p[date] || {}),
        [hour]: {
          ...(p[date]?.[hour] || { 0: "", 15: "", 30: "", 45: "" }),
          [slot]: cellVal
        }
      }
    }));
    setEditCell(null); setCellVal("");
  };

  const nav = (d) => { const dt = new Date(selDate); dt.setDate(dt.getDate() + d); setSelDate(todayStr(dt)); };

  const runLog = runLogs[selDate];

  return (
    <div className="sec">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[["daily", "📋 일일 기록"], ["calendar", "📅 캘린더"]].map(([v, l]) => (
            <button key={v} className={`pill${view === v ? " on" : ""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
        {view === "daily" && (
          <div style={{ display: "flex", gap: "4px" }}>
            <button className="sm-btn" style={{ background: "var(--bg2)", color: "var(--txt)" }} onClick={() => exportDailyRecord.pdf(selDate, "daily-record-to-export")}>PDF</button>
            <button className="sm-btn" style={{ background: "var(--bg2)", color: "var(--txt)" }} onClick={() => exportDailyRecord.csv(selDate, { todos: dayTodos, habits: habitNamesForDate.map((name, i) => ({ name, done: todayChecks[i] })), timelogs: timelogs[selDate] || {}, diary: diary[selDate] })}>CSV</button>
            <button className="sm-btn" style={{ background: "var(--bg2)", color: "var(--txt)" }} onClick={() => exportDailyRecord.json(selDate, { todos: dayTodos, habits: habitNamesForDate.map((name, i) => ({ name, done: todayChecks[i] })), timelogs: timelogs[selDate] || {}, diary: diary[selDate], runLog: runLogs[selDate] })}>JSON</button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", padding: "10px 14px", boxShadow: "var(--sh)" }}>
        <button className="icon-btn" onClick={() => nav(-1)}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--txt)" }}>{selDate.replace(/-/g, ".")}</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)", marginTop: "2px" }}>
            {["일", "월", "화", "수", "목", "금", "토"][new Date(selDate).getDay()]}요일 · To-do {doneCnt}/{dayTodos.length}
          </div>
        </div>
        <button className="icon-btn" onClick={() => nav(1)}>›</button>
      </div>

      {view === "daily" && (
        <div id="daily-record-to-export" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <HabitTracker 
              habitNames={habitNamesForDate} 
              habitChecks={todayChecks} 
              setCheck={setCheck}
              onEditName={(i, name) => { setEditHabitIdx(i); setHabitInput(name); }}
              onAdd={addHabit}
              onRemove={removeHabit}
              isToday={selDate === todayStr()}
              maxHabits={MAX_HABITS}
            />
            <DailyTodoList 
              todos={dayTodos} 
              onToggle={toggleTodo} 
              onRemove={removeTodo} 
              onAddClick={() => setShowModal(true)} 
            />
          </div>

          <WeeklyTimelog 
            selDate={selDate} 
            getLog={getLog} 
            onCellClick={(date, hour, slot, val) => { 
              if (slot === "_checked") {
                setTimelogs(p => ({
                  ...p,
                  [date]: {
                    ...(p[date] || {}),
                    [hour]: {
                      ...(p[date]?.[hour] || { 0: "", 15: "", 30: "", 45: "" }),
                      _checked: val
                    }
                  }
                }));
              } else {
                setEditCell({ date, hour, slot }); 
                setCellVal(val); 
              }
            }} 
          />

          <DailyDiary 
            date={selDate} 
            content={diary[selDate]} 
            onSave={(date, text) => setDiary(p => ({ ...p, [date]: text }))}
          />

          <Card className="p-14">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)" }}>🏃 런닝 기록 <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>· {selDate}</span></div>
              <button className="sm-btn" onClick={() => setRunModalDate(selDate)}>편집</button>
            </div>
            {runLog ? (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "1px solid var(--bdr)" }}>
                  {runLog.image
                    ? <img src={runLog.image} alt="run" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🏃</div>
                  }
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: "2px" }}>RUNNING TIME</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--mono)", color: "var(--accent)" }}>{runLog.time || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: "2px" }}>DISTANCE</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--mono)", color: "var(--txt)" }}>{runLog.distance ? `${(Number(runLog.distance)/100).toFixed(2)} km` : "—"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, opacity: .4, border: "1px solid var(--bdr)" }}>
                  <img src={DEFAULT_RUN_IMG} alt="미달성" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>런닝 기록이 없습니다.<br /><span style={{ fontSize: "11px" }}>편집 버튼으로 기록을 추가하세요.</span></div>
              </div>
            )}
          </Card>
        </div>
      )}

      {view === "calendar" && (
        <MonthlyCalendar 
          calY={calY} calM={calM} 
          onPrevMonth={() => { if (calM === 0) { setCalM(11); setCalY(y => y - 1); } else setCalM(m => m - 1); }}
          onNextMonth={() => { if (calM === 11) { setCalM(0); setCalY(y => y + 1); } else setCalM(m => m + 1); }}
          calInfo={calInfo}
          todos={todos}
          habitChecks={habitChecks}
          habitHistory={habitHistory}
          runLogs={runLogs}
          selDate={selDate}
          onDateClick={(ds) => { setSelDate(ds); setView("daily"); }}
        />
      )}

      {showModal && (
        <Modal title="할 일 추가" isOpen={true} onClose={() => setShowModal(false)}>
           <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>내용</div>
            <input className="inp" placeholder="할 일 입력" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} autoFocus />
           </div>
           <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>우선순위</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["high", "🔴 높음"], ["medium", "🟡 보통"], ["low", "🟢 낮음"]].map(([v, l]) => (
                <button key={v} className={`prio-btn${prio === v ? " on" : ""}`} onClick={() => setPrio(v)}>{l}</button>
              ))}
            </div>
           </div>
           <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={addTodo}>추가</button>
            <button className="btn-ghost" onClick={() => setShowModal(false)}>취소</button>
           </div>
        </Modal>
      )}

      {editCell && (
        <Modal title="타임로그 편집" isOpen={true} onClose={() => setEditCell(null)}>
          <textarea 
            className="ta" 
            value={cellVal} 
            onChange={e => setCellVal(e.target.value)} 
            autoFocus 
            rows={3}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={saveCell}>저장</button>
            <button className="btn-ghost" onClick={() => setEditCell(null)}>취소</button>
          </div>
        </Modal>
      )}

      {runModalDate && (
        <RunLogModal
          date={runModalDate}
          log={runLogs[runModalDate]}
          onSave={(date, data) => setRunLogs(p => ({ ...p, [date]: data }))}
          onClose={() => setRunModalDate(null)}
        />
      )}

      {editHabitIdx !== null && (
        <Modal title="습관 편집" isOpen={true} onClose={() => setEditHabitIdx(null)}>
          <input className="inp" value={habitInput} autoFocus onChange={e => setHabitInput(e.target.value)} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={saveHabitName}>저장</button>
            <button className="btn-ghost" onClick={() => setEditHabitIdx(null)}>취소</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
