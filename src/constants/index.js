

/* ════════ DEFAULT RUNNING IMAGE ════ */
export const DEFAULT_RUN_IMG = "/default_snail.png";

/* ════════ TABS ════════ */
export const TABS = [
  { id: "record", label: "기록", icon: "✏" },
  { id: "home", label: "홈", icon: "⌂" },
  { id: "todo", label: "할 일", icon: "✦" },
  { id: "assets", label: "자산", icon: "◈" },
  { id: "books", label: "독서", icon: "▣" },
];

/* ════════ RECORD TYPES ════════ */
export const RECORD_TYPES = [
  { value: "memo", label: "📝 메모", color: "#0D9488" },
  { value: "todo", label: "✦ 할 일", color: "#0ea5e9" },
  { value: "asset", label: "◈ 자산", color: "#f59e0b" },
  { value: "book", label: "▣ 독서", color: "#8b5cf6" },
  { value: "ledger", label: "💳 가계부", color: "#ef4444" },
];

/* ════════ DEFAULTS ════════ */
export const DEF_TODOS = [
  { id: 1, text: "분기 보고서 작성", done: false, priority: "high", date: "2026-03-28" },
  { id: 2, text: "운동 30분", done: true, priority: "medium", date: "2026-03-28" },
  { id: 3, text: "독서 1시간", done: false, priority: "low", date: "2026-03-28" },
];
export const DEF_TIMELOGS = {};
export const DEF_HABIT_NAMES = ["모닝루틴", "독서 15분+", "런닝 5km+", "TBD1", "TBD2"];
export const DEF_HABIT_HISTORY = {};
export const DEF_HABIT_CHECKS = {};
export const DEF_ASSETS = [
  { id: 1, name: "국내 주식", amount: 12800000, change: 3.2, icon: "📈" },
  { id: 2, name: "예·적금", amount: 34500000, change: 0.8, icon: "🏦" },
  { id: 3, name: "ETF", amount: 8200000, change: -1.1, icon: "🌐" },
  { id: 4, name: "현금", amount: 5100000, change: 0, icon: "💵" },
];
export const DEF_LEDGER = [
  { id: 1, type: "expense", amount: 12000, cat: "🍚 식비", note: "점심", date: "2026-03-28" },
  { id: 2, type: "income", amount: 3500000, cat: "💰 급여", note: "3월 급여", date: "2026-03-25" },
  { id: 3, type: "expense", amount: 4500, cat: "☕ 카페", note: "아메리카노", date: "2026-03-27" },
];
export const DEF_BOOKS = [
  { id: 1, title: "파친코", author: "이민진", status: "완독", rating: 5, finishDate: "2026-03-20", readCount: 1, note: "깊은 감동" },
  { id: 2, title: "도둑맞은 집중력", author: "요한 하리", status: "읽는 중", rating: 4, finishDate: "", readCount: 0, note: "진행중" },
  { id: 3, title: "클루지", author: "게리 마커스", status: "읽고 싶음", rating: 0, finishDate: "", readCount: 0, note: "" },
];
export const DEF_MEMOS = [
  { id: 1, content: "Q2 목표 재검토 필요", tag: "📌 중요", date: "03.25" },
  { id: 2, content: "독서 방법: 챕터 요약 후 키워드 3개", tag: "💡 아이디어", date: "03.24" },
  { id: 3, content: "4월 제주 여행 숙소 예약 확인", tag: "📅 일정", date: "03.23" },
  { id: 4, content: "운동 루틴 변경 검토", tag: "🔖 참고", date: "03.22" },
];
export const DEF_RUN_LOGS = {};

/* ════════ CATEGORIES ════════ */

export const EXPENSE_CATS = ["🍚 식비", "🏠 주거/통신", "🚌 교통", "☕ 카페", "👕 쇼핑", "🩺 의료", "🧗 여가", "📦 기타"];
export const INCOME_CATS = ["💰 급여", "💸 부수입", "🧧 용돈", "📈 투자수익", "📦 기타"];
export const MEMO_TAGS = ["📌 중요", "💡 아이디어", "📅 일정", "🔖 참고", "📦 일반"];
export const BOOK_SC = { "읽고 싶음": "#94a3b8", "읽는 중": "#0ea5e9", "완독": "#0D9488" };

/* ════════ PRIORITY ════════ */
export const PRIO_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
export const PRIO_LABELS = { high: "🔴 높음", medium: "🟡 보통", low: "🟢 낮음" };

/* ════════ CALENDAR ════════ */
export const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

/* ════════ WEATHER ════════ */
export const WEATHER_DEFAULTS = { city: "서울", temp: 0, feels: 0, condition: "맑음", icon: "☀️", humidity: 0, wind: 0, uv: 0, forecast: [] };
export const WMO_CODES = {
  0: { c: "맑음", i: "☀️" },
  1: { c: "대체로 맑음", i: "🌤️" },
  2: { c: "구름 조금", i: "⛅" },
  3: { c: "흐림", i: "☁️" },
  45: { c: "안개", i: "🌫️" }, 48: { c: "안개", i: "🌫️" },
  51: { c: "이슬비", i: "🌦️" }, 53: { c: "이슬비", i: "🌦️" }, 55: { c: "이슬비", i: "🌦️" },
  56: { c: "진눈깨비", i: "🌨️" }, 57: { c: "진눈깨비", i: "🌨️" },
  61: { c: "비", i: "🌧️" }, 63: { c: "비", i: "🌧️" }, 65: { c: "비", i: "🌧️" },
  66: { c: "비/눈", i: "🌧️" }, 67: { c: "비/눈", i: "🌧️" },
  71: { c: "눈", i: "❄️" }, 73: { c: "눈", i: "❄️" }, 75: { c: "눈", i: "❄️" },
  77: { c: "싸락눈", i: "❄️" },
  80: { c: "소나기", i: "🌧️" }, 81: { c: "소나기", i: "🌧️" }, 82: { c: "소나기", i: "🌧️" },
  85: { c: "눈보라", i: "❄️" }, 86: { c: "눈보라", i: "❄️" },
  95: { c: "천둥번개", i: "⛈️" }, 96: { c: "천둥번개", i: "⛈️" }, 99: { c: "천둥번개", i: "⛈️" },
};
