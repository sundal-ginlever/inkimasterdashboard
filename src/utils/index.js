
/**
 * Returns today's date string in YYYY-MM-DD format (KST adjusted)
 */
export const todayStr = (d = new Date()) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

/**
 * Resolves habit names for a specific date based on snapshots in history
 */
export function resolveHabitNames(history, baseNames, forDate) {
  const validDates = Object.keys(history).filter(d => d <= forDate).sort();
  if (validDates.length === 0) return [...baseNames];
  const latestDate = validDates[validDates.length - 1];
  return history[latestDate];
}

/**
 * Maps WMO code to weather condition and icon
 */
export const getWeatherInfo = (code, wmoCodes) => {
    return wmoCodes[code] || { c: "알 수 없음", i: "❓" };
};
