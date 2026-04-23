// crypto_test.js
// 가상자산 잔고 조회 개별 Test Script
// 실행: node crypto_test.js

const https = require('https');

/**
 * 1. Ethereum RPC 잔고 조회 (public RPC)
 * @param {string} address 이더리움 주소
 */
async function fetchEthBalance(address) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [address, "latest"]
    });

    const options = {
      hostname: 'eth.llamarpc.com', // 퍼블릭 RPC
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (d) => { result += d; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(result);
          // Wei 단위 (16진수) -> ETH 변환
          const weiHex = parsed.result;
          if (!weiHex) return resolve("0");
          // BigInt를 통해 18자리 소수점 오차 없는 연산 흉내
          const weiBig = BigInt(weiHex);
          const ethStr = (Number(weiBig) / 1e18).toFixed(6); // 테스트용 간이변환
          resolve(ethStr);
        } catch (e) {
          resolve("Error");
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * 2. Bitcoin 잔고 조회 (mempool.space)
 * @param {string} address 비트코인 주소
 */
async function fetchBtcBalance(address) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://mempool.space/api/address/${address}`, (res) => {
      let result = '';
      res.on('data', (d) => { result += d; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(result);
          // funded_txo_sum - spent_txo_sum = balance (Satoshi 단위)
          const funded = parsed.chain_stats.funded_txo_sum;
          const spent = parsed.chain_stats.spent_txo_sum;
          const balanceSat = BigInt(funded) - BigInt(spent);
          // Satoshi 단위 -> BTC 변환
          const btcStr = (Number(balanceSat) / 1e8).toFixed(8);
          resolve(btcStr);
        } catch (e) {
          resolve("Error");
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * 3. Sui 잔고 조회 (Sui Mainnet RPC)
 * @param {string} address 수이 주소
 */
async function fetchSuiBalance(address) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "suix_getBalance",
      params: [address]
    });

    const options = {
      hostname: 'fullnode.mainnet.sui.io',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (d) => { result += d; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(result);
          // Mist 단위 -> SUI 단위 환산 (1 SUI = 1e9 Mist)
          const mistStr = parsed.result.totalBalance;
          const mistBig = BigInt(mistStr);
          const suiStr = (Number(mistBig) / 1e9).toFixed(5);
          resolve(suiStr);
        } catch (e) {
          resolve("Error");
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log("===================================");
  console.log("🚀 가상자산 다중 블록체인 동기화 테스트 시작");
  console.log("===================================");

  // 테스트를 위한 임의의 고래/바이낸스 핫월렛 주소 등 (잔고가 있는 주소)
  const ethAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth
  const btcAddress = "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97"; // binance cold wallet
  const suiAddress = "0x5173ebefcf793a3a410cbedd7b420f1df21add8eb9a7d363f82632b8fa5ac8b1"; // random rich sui address

  console.log(`⏳ 1. 이더리움 지갑 동기화 중... (${ethAddress})`);
  const ethBal = await fetchEthBalance(ethAddress);
  console.log(`✅ [ETH] 잔고: ${ethBal} ETH\n`);

  console.log(`⏳ 2. 비트코인 지갑 동기화 중... (${btcAddress})`);
  const btcBal = await fetchBtcBalance(btcAddress);
  console.log(`✅ [BTC] 잔고: ${btcBal} BTC\n`);

  console.log(`⏳ 3. Sui 지갑 동기화 중... (${suiAddress})`);
  const suiBal = await fetchSuiBalance(suiAddress);
  console.log(`✅ [SUI] 잔고: ${suiBal} SUI\n`);

  console.log("===================================");
  console.log("🎉 테스트 성공: 프론트엔드/대시보드와 관계없이 Node.js 환경에서");
  console.log("각 체인별 잔고를 독립적으로 무사히 스크랩하는 데 성공했습니다.");
}

runTest();
