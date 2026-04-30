/* global BigInt */
export const CHAINS = [
  { id: "BTC", name: "Bitcoin", icon: "₿", decimals: 8, geckoId: "bitcoin" },
  { id: "ETH", name: "Ethereum", icon: "♦", decimals: 18, geckoId: "ethereum" },
  { id: "SOL", name: "Solana", icon: "◎", decimals: 9, geckoId: "solana" },
  { id: "SUI", name: "Sui", icon: "💧", decimals: 9, geckoId: "sui" },
  { id: "APT", name: "Aptos", icon: "🅐", decimals: 8, geckoId: "aptos" },
  { id: "KAIA", name: "Kaia", icon: "🅚", decimals: 18, geckoId: "klay-token" },
];

/**
 * 토큰 정보 (가격 조회를 위함)
 */
export const EXTRA_TOKENS = [
  { id: "USDT", geckoId: "tether" },
  { id: "USDC", geckoId: "usd-coin" },
];

/**
 * 등록된 토큰 ID들의 최신 가격을 가져옵니다.
 */
export async function fetchCryptoPrices(ids = []) {
  if (!ids || ids.length === 0) return {};
  try {
    const idsStr = ids.join(",");
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsStr}&vs_currencies=krw`);
    const data = await res.json();
    
    const prices = {};
    if (data) {
      Object.entries(data).forEach(([id, val]) => {
        if (val && val.krw) {
          prices[id] = val.krw;
        }
      });
    }
    return prices;
  } catch (error) {
    console.error("가격 동기화 실패:", error);
    return {};
  }
}

/**
 * 지갑 잔고 조회 (멀티 자산 지원)
 * @returns {Promise<Array<{symbol: string, amount: string}>>}
 */
export async function getWalletBalances(wallet, moralisKey) {
  const { chain, address } = wallet;
  const balances = [];

  try {
    switch (chain) {
      case 'BTC': {
        const res = await fetch(`https://mempool.space/api/address/${address}`);
        const data = await res.json();
        const funded = BigInt(data.chain_stats.funded_txo_sum || 0);
        const spent = BigInt(data.chain_stats.spent_txo_sum || 0);
        const bal = funded - spent;
        balances.push({ symbol: 'BTC', amount: (Number(bal) / 1e8).toString() });
        break;
      }
      
      case 'ETH': {
        // Native ETH
        let ethBal = "0";
        if (moralisKey) {
          try {
            const res = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=eth`, {
              headers: { 'X-API-Key': moralisKey, 'accept': 'application/json' }
            });
            const data = await res.json();
            if (data.balance) ethBal = (Number(BigInt(data.balance)) / 1e18).toString();
          } catch(e) {}
        }
        if (ethBal === "0") {
          const res = await fetch(`https://eth.llamarpc.com`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [address, "latest"]})
          });
          const data = await res.json();
          ethBal = (Number(BigInt(data.result || "0x0")) / 1e18).toString();
        }
        balances.push({ symbol: 'ETH', amount: ethBal });

        // ERC20 Tokens (Moralis only)
        if (moralisKey) {
          try {
            const res = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=eth`, {
              headers: { 'X-API-Key': moralisKey, 'accept': 'application/json' }
            });
            const tokens = await res.json();
            if (Array.isArray(tokens)) {
              tokens.forEach(t => {
                if (!t.possible_spam && Number(t.balance) > 0) {
                  const amount = (Number(BigInt(t.balance)) / Math.pow(10, t.decimals)).toString();
                  if (Number(amount) > 0.01) { // 0.01개 미만은 스팸/잔여물로 간주해 무시
                    balances.push({ symbol: t.symbol, amount });
                  }
                }
              });
            }
          } catch(e) {}
        }
        break;
      }
      
      case 'SOL': {
        // Native SOL
        let solBal = "0";
        if (moralisKey) {
          try {
            const res = await fetch(`https://solana-gateway.moralis.io/account/mainnet/${address}/balance`, {
              headers: { 'X-API-Key': moralisKey, 'accept': 'application/json' }
            });
            const data = await res.json();
            if (data.solana) solBal = data.solana;
          } catch(e) {}
        }
        if (solBal === "0") {
          const res = await fetch("https://api.mainnet-beta.solana.com", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address]})
          });
          const data = await res.json();
          solBal = (Number(data.result?.value || 0) / 1e9).toString();
        }
        balances.push({ symbol: 'SOL', amount: solBal });

        // SPL Tokens (Moralis)
        if (moralisKey) {
          try {
            const res = await fetch(`https://solana-gateway.moralis.io/account/mainnet/${address}/tokens`, {
              headers: { 'X-API-Key': moralisKey, 'accept': 'application/json' }
            });
            const tokens = await res.json();
            if (Array.isArray(tokens)) {
              tokens.forEach(t => {
                if (Number(t.amount) > 0) {
                  balances.push({ symbol: t.symbol, amount: t.amount });
                }
              });
            }
          } catch(e) {}
        }
        break;
      }

      case 'SUI': {
        const res = await fetch("https://fullnode.mainnet.sui.io:443", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "suix_getAllBalances", params: [address] })
        });
        const data = await res.json();
        if (data.result && Array.isArray(data.result)) {
          data.result.forEach(b => {
            const amount = b.totalBalance;
            let symbol = "SUI";
            let decimals = 9;
            
            if (b.coinType !== "0x2::sui::SUI") {
              const parts = b.coinType.split("::");
              symbol = parts[parts.length - 1].toUpperCase();
              // USDC/USDT 등 주요 토큰 소수점 처리 (수이 메인넷 표준)
              if (symbol.includes("USDC") || symbol.includes("USDT")) decimals = 6;
              else decimals = 9; // 기본값
            }
            
            const val = (Number(BigInt(amount)) / Math.pow(10, decimals)).toString();
            if (Number(val) > 0) {
              balances.push({ symbol, amount: val });
            }
          });
        }
        break;
      }

      case 'APT': {
        // AptosCoin
        const res = await fetch(`https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);
        if (res.ok) {
          const data = await res.json();
          const octas = data.data?.coin?.value || "0";
          balances.push({ symbol: 'APT', amount: (Number(BigInt(octas)) / 1e8).toString() });
        }
        break;
      }

      case 'KAIA': {
        const res = await fetch("https://public-en.node.kaia.io", { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "kaia_getBalance", params: [address, "latest"]})
        });
        const data = await res.json();
        let bal = "0";
        if (data.result) bal = (Number(BigInt(data.result)) / 1e18).toString();
        else {
          const res2 = await fetch("https://public-node-api.klaytnapi.com/v1/cypress", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "klay_getBalance", params: [address, "latest"]})
          });
          const data2 = await res2.json();
          bal = (Number(BigInt(data2.result || "0x0")) / 1e18).toString();
        }
        balances.push({ symbol: 'KAIA', amount: bal });
        break;
      }

      default: break;
    }
  } catch (err) {
    console.error(`Error fetching balances for ${chain} (${address}):`, err);
  }
  
  return balances;
}

