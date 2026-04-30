import { useState, useEffect, useRef } from "react";
import "./App.css";

import { 
  TABS, 
  DEF_TODOS,
  DEF_TIMELOGS,
  DEF_HABIT_HISTORY,
  DEF_HABIT_CHECKS,
  DEF_RUN_LOGS,
  DEF_ASSETS,
  DEF_LEDGER,
  DEF_BOOKS,
  DEF_MEMOS,
  WEATHER_DEFAULTS,
  WMO_CODES
} from "./constants";
import { useSupabaseStore } from "./hooks/useSupabaseStore";
import { getWeatherInfo } from "./utils";
import { supabase } from "./lib/supabase";
import { Auth } from "./components/auth/Auth";

// Section Components
import { RecordTab } from "./components/sections/RecordTab";
import { HomeSection } from "./components/sections/HomeSection";
import { TodoSection } from "./components/sections/TodoSection";
import { AssetsSection } from "./components/sections/AssetsSection";
import { BooksSection } from "./components/sections/BooksSection";

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("record");
  const [time, setTime] = useState(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user;

  const [todos, setTodos] = useSupabaseStore("d_todos", DEF_TODOS, user);
  const [timelogs, setTimelogs] = useSupabaseStore("d_timelogs", DEF_TIMELOGS, user);
  const [habitHistory, setHabitHistory] = useSupabaseStore("d_habit_history", DEF_HABIT_HISTORY, user);
  const [habitChecks, setHabitChecks] = useSupabaseStore("d_habit_checks", DEF_HABIT_CHECKS, user);
  const [runLogs, setRunLogs] = useSupabaseStore("d_run_logs", DEF_RUN_LOGS, user);
  const [assets, setAssets] = useSupabaseStore("d_assets", DEF_ASSETS, user);
  const [ledger, setLedger] = useSupabaseStore("d_ledger", DEF_LEDGER, user);
  const [books, setBooks] = useSupabaseStore("d_books", DEF_BOOKS, user);
  const [memos, setMemos] = useSupabaseStore("d_memos", DEF_MEMOS, user);
  const [diary, setDiary] = useSupabaseStore("d_diary", {}, user);
  const [bookmarks, setBookmarks] = useSupabaseStore("d_bookmarks", [], user);
  const [cryptoWallets, setCryptoWallets] = useSupabaseStore("d_crypto_wallets", [], user);
  const [cryptoBalances, setCryptoBalances] = useSupabaseStore("d_crypto_balances", [], user);
  const [cryptoTrackedTokens, setCryptoTrackedTokens] = useSupabaseStore("d_crypto_tracked_tokens", [
    { gecko_id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { gecko_id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { gecko_id: "tether", symbol: "USDT", name: "Tether" },
    { gecko_id: "usd-coin", symbol: "USDC", name: "USDC" },
    { gecko_id: "sui", symbol: "SUI", name: "Sui" }
  ], user);
  const [weather, setWeather] = useState(WEATHER_DEFAULTS);

  useEffect(() => {
    async function fetchWeather() {
      try {
        let lat = 37.566; let lon = 126.978; let city = "서울";
        try {
          const locRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
          const locData = await locRes.json();
          lat = locData.latitude;
          lon = locData.longitude;
          city = locData.city || "현재 위치";
        } catch (e) {
          console.log("위치 정보를 가져오지 못했습니다. 기본값(서울)을 사용합니다.", e);
        }
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`);
        const data = await res.json();
        const curInfo = getWeatherInfo(data.current.weather_code, WMO_CODES);
        const newWeather = {
          city,
          temp: Math.round(data.current.temperature_2m),
          feels: Math.round(data.current.apparent_temperature),
          condition: curInfo.c,
          icon: curInfo.i,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          uv: data.daily.uv_index_max[0] ? Math.round(data.daily.uv_index_max[0]) : 0,
          forecast: []
        };
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
        for (let i = 0; i < 5; i++) {
          const date = new Date(data.daily.time[i]);
          let dayLabel = dayNames[date.getDay()];
          if (i === 0) dayLabel = "오늘";
          else if (i === 1) dayLabel = "내일";
          const dailyInfo = getWeatherInfo(data.daily.weather_code[i], WMO_CODES);
          newWeather.forecast.push({
            day: dayLabel,
            icon: dailyInfo.i,
            high: Math.round(data.daily.temperature_2m_max[i]),
            low: Math.round(data.daily.temperature_2m_min[i])
          });
        }
        setWeather(newWeather);
      } catch (err) {
        console.error("날씨 정보 업데이트 실패:", err);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 1000 * 60 * 30); // Refresh every 30 mins
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = time.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
  const clock = time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 75; // Even more sensitive per user request

    if (Math.abs(distance) > swipeThreshold) {
      const currentIndex = TABS.findIndex(t => t.id === tab);
      if (distance > 0) {
        if (currentIndex < TABS.length - 1) setTab(TABS[currentIndex + 1].id);
      } else {
        if (currentIndex > 0) setTab(TABS[currentIndex - 1].id);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!session) return <Auth />;

  const handleLogout = () => supabase.auth.signOut();
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || "나의 공간";

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName.trim() === userName) {
      setIsEditingName(false);
      return;
    }
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: newName.trim() }
      });
      if (error) throw error;
      if (data?.user) {
        setSession(prev => ({ ...prev, user: data.user }));
      }
      setIsEditingName(false);
    } catch (err) {
      alert("닉네임 변경 실패: " + err.message);
    }
  };

  return (
    <div className="app">
      <header className="hdr">
        <div>
          <div className="hdr-lbl">Personal Dashboard · {userName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  autoFocus
                  className="inp" 
                  style={{ width: '100px', fontSize: '14px', padding: '2px 6px', margin: 0, height: '24px' }}
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleNameUpdate(); else if (e.key === 'Escape') setIsEditingName(false); }}
                />
                <button onClick={handleNameUpdate} className="sm-btn" style={{ fontSize: '10px', padding: '2px 6px', height: '24px' }}>저장</button>
                <button onClick={() => setIsEditingName(false)} className="sm-btn" style={{ fontSize: '10px', padding: '2px 6px', height: '24px', background: 'transparent' }}>취소</button>
              </div>
            ) : (
              <div className="hdr-name">
                {userName}
                <span 
                  onClick={() => { setNewName(userName); setIsEditingName(true); }}
                  style={{ cursor: 'pointer', marginLeft: '4px', opacity: 0.8 }}
                  title="닉네임 변경"
                >✦</span>
              </div>
            )}
            <button onClick={handleLogout} className="sm-btn" style={{ fontSize: '10px', padding: '2px 8px', opacity: 0.7 }}>로그아웃</button>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "17px", color: "var(--accent)", letterSpacing: ".04em" }}>{clock}</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>{today}</div>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="ti">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="content" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {tab === "record" && (
          <RecordTab 
            setTodos={setTodos} 
            setAssets={setAssets} 
            setBooks={setBooks} 
            setMemos={setMemos} 
            setLedger={setLedger}
            bookmarks={bookmarks}
            setBookmarks={setBookmarks}
          />
        )}
        {tab === "todo" && (
          <TodoSection 
            todos={todos} setTodos={setTodos} 
            timelogs={timelogs} setTimelogs={setTimelogs} 
            habitHistory={habitHistory} setHabitHistory={setHabitHistory} 
            habitChecks={habitChecks} setHabitChecks={setHabitChecks} 
            runLogs={runLogs} setRunLogs={setRunLogs} 
            diary={diary} setDiary={setDiary}
          />
        )}
        {tab === "home" && (
          <HomeSection 
            runLogs={runLogs} setRunLogs={setRunLogs} 
            memos={memos} setMemos={setMemos} 
            weatherData={weather}
            habitHistory={habitHistory}
            habitChecks={habitChecks}
          />
        )}
        {tab === "assets" && (
          <AssetsSection 
            assets={assets} setAssets={setAssets} 
            ledger={ledger} setLedger={setLedger} 
            cryptoWallets={cryptoWallets} setCryptoWallets={setCryptoWallets}
            cryptoBalances={cryptoBalances} setCryptoBalances={setCryptoBalances}
            cryptoTrackedTokens={cryptoTrackedTokens} setCryptoTrackedTokens={setCryptoTrackedTokens}
          />
        )}
        {tab === "books" && (
          <BooksSection 
            books={books} 
            setBooks={setBooks} 
          />
        )}
      </main>
    </div>
  );
}
