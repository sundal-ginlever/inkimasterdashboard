import React, { useState } from "react";
import { todayStr } from "../../utils";
import { WeatherCard } from "./home/WeatherCard";
import { RunningChart } from "./home/RunningChart";
import { MemoWidget } from "./home/MemoWidget";
import { RunLogModal } from "../common/RunLogModal";

export function HomeSection({ runLogs, setRunLogs, memos, setMemos, weatherData }) {
  const [runModalDate, setRunModalDate] = useState(null);
  const [selDate] = useState(todayStr());

  return (
    <div className="sec">
      <WeatherCard weather={weatherData} />
      <RunningChart
        runLogs={runLogs}
        onOpenLog={(d) => setRunModalDate(d)}
        selDate={selDate}
      />
      <MemoWidget memos={memos} setMemos={setMemos} />
      {runModalDate && (
        <RunLogModal
          date={runModalDate}
          log={runLogs[runModalDate]}
          onSave={(date, data) => setRunLogs(p => ({ ...p, [date]: data }))}
          onClose={() => setRunModalDate(null)}
        />
      )}
    </div>
  );
}
