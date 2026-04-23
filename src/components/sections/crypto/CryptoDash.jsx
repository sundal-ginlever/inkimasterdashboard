import React, { useState, useEffect, useMemo } from 'react';
import { StatCard } from '../../common/Card';
import { Modal } from '../../common/Modal';
import { CHAINS, fetchCryptoPrices, getWalletBalances } from '../../../utils/cryptoApi';

export function CryptoDash({ cryptoWallets, setCryptoWallets, cryptoBalances, setCryptoBalances, cryptoTrackedTokens, setCryptoTrackedTokens }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageTracked, setShowManageTracked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({ chain: 'BTC', address: '', alias: '' });
  const [prices, setPrices] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    const gIds = cryptoTrackedTokens.map(t => t.gecko_id).filter(Boolean);
    if (gIds.length === 0) return;
    fetchCryptoPrices(gIds).then(setPrices);
    const timer = setInterval(() => fetchCryptoPrices(gIds).then(setPrices), 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, [cryptoTrackedTokens]);

  useEffect(() => {
    const lastSync = localStorage.getItem('last_crypto_sync');
    if (lastSync) {
      const diff = Date.now() - parseInt(lastSync, 10);
      const fourHours = 4 * 60 * 60 * 1000;
      if (diff < fourHours) setCooldownRemaining(fourHours - diff);
    }
  }, []);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => setCooldownRemaining(p => Math.max(0, p - 1000)), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data.coins?.slice(0, 8) || []);
      } catch (e) {} finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const aggregated = useMemo(() => {
    const map = {}; 
    cryptoTrackedTokens.forEach(t => {
      if (!t.gecko_id) return;
      map[t.gecko_id] = { ...t, total: 0, wallets: [] };
    });

    cryptoBalances.forEach(b => {
      const symbol = b.symbol.toUpperCase();
      const tracked = cryptoTrackedTokens.find(t => t.symbol === symbol);
      if (!tracked || !tracked.gecko_id) return;

      const wallet = cryptoWallets.find(w => w.id === b.wallet_id);
      if (!wallet) return;

      const amt = Number(b.amount) || 0;
      map[tracked.gecko_id].total += amt;
      map[tracked.gecko_id].wallets.push({ ...wallet, amount: amt });
    });
    return map;
  }, [cryptoWallets, cryptoBalances, cryptoTrackedTokens]);

  const totalValue = useMemo(() => {
    let sum = 0;
    Object.entries(aggregated).forEach(([gId, data]) => {
      if (prices[gId]) sum += data.total * prices[gId];
    });
    return sum;
  }, [aggregated, prices]);

  const addWallet = () => {
    if (!form.address.trim()) return;
    const newWallet = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      chain: form.chain,
      address: form.address.trim(),
      alias: form.alias.trim() || '내 지갑'
    };
    setCryptoWallets(prev => [...prev, newWallet]);
    setShowAddModal(false);
    setForm({ chain: 'BTC', address: '', alias: '' });
  };

  const removeWallet = (id) => {
    if (window.confirm("지갑을 삭제하시겠습니까?")) {
      setCryptoWallets(prev => prev.filter(w => w.id !== id));
      setCryptoBalances(prev => prev.filter(b => b.wallet_id !== id));
    }
  };

  const handleSync = async () => {
    if (cooldownRemaining > 0 || syncing) return;
    setSyncing(true);
    try {
      const moralisKey = process.env.REACT_APP_MORALIS_API_KEY || '';
      const allNewBalances = [];
      const results = await Promise.allSettled(cryptoWallets.map(w => getWalletBalances(w, moralisKey)));
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          result.value.forEach(b => {
            allNewBalances.push({
              id: Date.now() + Math.floor(Math.random() * 1000000000),
              wallet_id: cryptoWallets[idx].id,
              symbol: b.symbol,
              amount: b.amount,
              last_updated: new Date().toISOString()
            });
          });
        }
      });
      setCryptoBalances(prev => {
        const walletIds = cryptoWallets.map(w => w.id);
        const filtered = prev.filter(b => !walletIds.includes(b.wallet_id));
        return [...filtered, ...allNewBalances];
      });
      localStorage.setItem('last_crypto_sync', Date.now().toString());
      setCooldownRemaining(4 * 60 * 60 * 1000);
      const gIds = cryptoTrackedTokens.map(t => t.gecko_id).filter(Boolean);
      const latestPrices = await fetchCryptoPrices(gIds);
      setPrices(latestPrices);
    } catch (e) { alert("동기화 중 오류가 발생했습니다."); } finally { setSyncing(false); }
  };

  const addTrackedToken = (coin) => {
    if (cryptoTrackedTokens.length >= 20) {
      alert("토큰은 최대 20개까지만 등록 가능합니다.");
      return;
    }
    const sym = coin.symbol.toUpperCase();
    if (cryptoTrackedTokens.find(t => t.gecko_id === coin.id)) return;
    
    // id를 timestamp로 설정하여 Supabase에서 임시 ID로 인식하게 함
    // 실제 식별은 gecko_id로 수행
    setCryptoTrackedTokens([...cryptoTrackedTokens, { 
      id: Date.now() + Math.floor(Math.random() * 1000), 
      gecko_id: coin.id, 
      symbol: sym, 
      name: coin.name, 
      thumb: coin.thumb 
    }]);
    setSearchQuery("");
  };

  const removeTrackedToken = (dbId) => {
    setCryptoTrackedTokens(cryptoTrackedTokens.filter(t => t.id !== dbId));
  };

  const formatCD = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 3600)}시간 ${Math.floor((s % 3600) / 60)}분`;
  };

  const tokensArr = Object.entries(aggregated).sort((a, b) => {
    const valA = a[1].total * (prices[a[0]] || 0);
    const valB = b[1].total * (prices[b[0]] || 0);
    return valB - valA;
  });

  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
        <button className="sm-btn" onClick={() => setShowManageTracked(true)}>⚙ 토큰 관리</button>
        <div style={{ flex: 1 }}></div>
        {cooldownRemaining > 0 && <div style={{ fontSize: "11px", color: "var(--muted)", marginRight: "8px" }}>{formatCD(cooldownRemaining)} 남음</div>}
        <button className="sm-btn" onClick={handleSync} disabled={cooldownRemaining > 0 || syncing} style={{ opacity: (cooldownRemaining > 0 || syncing) ? 0.5 : 1 }}>
          {syncing ? "..." : "동기화 ↻"}
        </button>
        <button className="sm-btn" onClick={() => setShowAddModal(true)}>+ 지갑</button>
      </div>
      
      <div className="stats-row">
        <StatCard label="총 평가 자산" value={`${(totalValue / 10000).toFixed(0)}만`} />
        <StatCard label="추적" value={`${cryptoTrackedTokens.length}/20`} />
        <StatCard label="보유 자산" value={`${tokensArr.filter(t => t[1].total > 0).length}종`} />
      </div>

      <div className="crypto-grid">
        {tokensArr.map(([gId, data]) => {
          const isExp = expandedId === gId;
          const price = prices[gId] || 0;
          const val = data.total * price;
          const chainConf = CHAINS.find(c => c.id === data.symbol);

          return (
            <React.Fragment key={gId}>
              <div 
                className={`token-tile${isExp ? " active" : ""}`} 
                onClick={() => setExpandedId(isExp ? null : gId)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "28px" }}>{data.thumb ? <img src={data.thumb} alt={data.symbol} style={{ width: "24px", height: "24px", borderRadius: "50%" }} /> : (chainConf?.icon || "🪙")}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)" }}>{data.symbol}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)", marginBottom: "2px" }}>
                    ₩ {val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)" }}>
                    {data.total > 0.001 ? data.total.toLocaleString(undefined, { maximumFractionDigits: 4 }) : data.total.toFixed(6)}
                  </div>
                </div>
              </div>

              {isExp && (
                <div className="token-detail-expanded">
                  <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px", color: "var(--accent)" }}>{data.name} 상세 지갑 현황</div>
                  {data.wallets.length === 0 ? (
                    <div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "center", padding: "10px" }}>연동된 지갑에 잔고가 없습니다.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {data.wallets.map((w, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", borderBottom: "1px dashed var(--bdr)", paddingBottom: "6px" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{w.alias} <span style={{ fontSize: "9px", opacity: 0.6 }}>({w.chain})</span></div>
                            <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{w.address.slice(0, 8)}...</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                              {w.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </div>
                            <button className="rm" onClick={() => removeWallet(w.id)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {showManageTracked && (
        <Modal title="관심 토큰 관리" isOpen={true} onClose={() => setShowManageTracked(false)}>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
            토큰을 검색하여 추가하세요. (최대 20개)
          </div>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input className="inp" placeholder="예: Solana, DOGE" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
            {searchQuery && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px", marginTop: "4px", boxShadow: "0 4px 12px rgba(0,0,0,.1)", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                {searching ? <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>검색 중...</div> : searchResults.length === 0 ? <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>결과 없음</div> : (
                  searchResults.map(s => (
                    <div key={s.id} className="search-item" onClick={() => addTrackedToken(s)}>
                      <img src={s.thumb} alt={s.symbol} style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                      <div style={{ flex: 1, fontSize: "12px", fontWeight: 600 }}>{s.name} <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 400 }}>{s.symbol}</span></div>
                      <div style={{ fontSize: "11px", color: "var(--accent)" }}>+ 추가</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {cryptoTrackedTokens.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg2)", padding: "4px 10px", borderRadius: "20px", border: "1px solid var(--bdr)", fontSize: "12px" }}>
                {t.thumb && <img src={t.thumb} alt={t.symbol} style={{ width: "14px", height: "14px", borderRadius: "50%" }} />}
                <span style={{ fontWeight: 600 }}>{t.symbol}</span>
                <span onClick={() => removeTrackedToken(t.id)} style={{ cursor: "pointer", opacity: 0.5 }}>✕</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button className="btn-ghost" onClick={() => setShowManageTracked(false)}>닫기</button>
          </div>
        </Modal>
      )}

      {showAddModal && (
        <Modal title="새 지갑 연동" isOpen={true} onClose={() => setShowAddModal(false)}>
           <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>네트워크</div>
            <select className="sel" style={{ width: "100%" }} value={form.chain} onChange={e => setForm({ ...form, chain: e.target.value })}>
              {CHAINS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>지갑 주소</div>
            <input className="inp" placeholder="0x..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} autoFocus />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>별칭</div>
            <input className="inp" placeholder="내 지갑" value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-prim" style={{ flex: 1 }} onClick={addWallet}>연동</button>
            <button className="btn-ghost" onClick={() => setShowAddModal(false)}>취소</button>
          </div>
        </Modal>
      )}
    </>
  );
}
