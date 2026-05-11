const TAX_RATE = 0.003;
const FEE_RATE = 0.001425;
const DAY_TRADE_TAX_DISCOUNT = 0.5;
const SHARES_PER_LOT = 1000;

const symbolsInputEl = document.getElementById('symbolsInput');
const scanBtn = document.getElementById('scanBtn');
const scanStatusEl = document.getElementById('scanStatus');
const scanTbody = document.getElementById('scanTbody');

const costPriceEl = document.getElementById('costPrice');
const lotSizeEl = document.getElementById('lotSize');
const calcRefBtn = document.getElementById('calcRefBtn');
const referenceResultEl = document.getElementById('referenceResult');

const sideEl = document.getElementById('side');
const priceEl = document.getElementById('price');
const lotsEl = document.getElementById('lots');
const addTradeBtn = document.getElementById('addTradeBtn');
const resetBtn = document.getElementById('resetBtn');
const tradeTbody = document.getElementById('tradeTbody');
const summaryEl = document.getElementById('summary');

const saveReviewBtn = document.getElementById('saveReviewBtn');
const reviewStatusEl = document.getElementById('reviewStatus');
const reviewTbody = document.getElementById('reviewTbody');

let trades = [];
let summarySnapshot = null;

scanBtn.addEventListener('click', scanSymbols);
calcRefBtn.addEventListener('click', calcReference);
addTradeBtn.addEventListener('click', addTrade);
resetBtn.addEventListener('click', () => {
  trades = [];
  renderTrades();
});
saveReviewBtn.addEventListener('click', saveReview);

renderReviewTable();

async function scanSymbols() {
  const symbols = symbolsInputEl.value.split(',').map((s) => s.trim()).filter(Boolean);
  if (!symbols.length) {
    scanStatusEl.textContent = '請先輸入候選股票代號。';
    return;
  }

  const yahooSymbols = symbols.map((s) => `${s}.TW`).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSymbols)}`;
  scanStatusEl.textContent = '抓取中...';

  try {
    const res = await fetch(url);
    const data = await res.json();
    const list = (data.quoteResponse?.result || []).map((item) => {
      const lastPrice = Number(item.regularMarketPrice || item.regularMarketOpen || 0);
      const openPrice = Number(item.regularMarketOpen || 0);
      const volume = Number(item.regularMarketVolume || 0);
      const changePct = openPrice > 0 ? ((lastPrice - openPrice) / openPrice) * 100 : 0;
      const volumeScore = Math.min(volume / 50, 40);
      const momentumScore = Math.max(0, 30 - Math.abs(changePct - 1.2) * 8);
      const liquidityScore = lastPrice > 0 ? 30 : 0;
      const score = volumeScore + momentumScore + liquidityScore;
      return {
        symbol: String(item.symbol || '').replace('.TW',''),
        name: item.longName || item.shortName || item.symbol,
        lastPrice,
        volume,
        changePct,
        score,
        buy: lastPrice * 0.998,
        sell: lastPrice * 1.012
      };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    renderScan(list);
    scanStatusEl.textContent = `完成：已評分 ${symbols.length} 檔，顯示前 3 檔。`;
  } catch (err) {
    scanStatusEl.textContent = `抓取失敗：${err.message}`;
  }
}

function renderScan(list) {
  scanTbody.innerHTML = '';
  list.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx + 1}</td><td>${item.symbol}</td><td>${item.name}</td><td>${item.lastPrice.toFixed(2)}</td><td>${item.volume.toLocaleString()}</td><td>${item.changePct.toFixed(2)}</td><td>${item.score.toFixed(1)}</td><td>${item.buy.toFixed(2)}</td><td>${item.sell.toFixed(2)}</td>`;
    scanTbody.appendChild(tr);
  });
}

function calcReference() { /* unchanged core logic */
  const costPrice = Number(costPriceEl.value);
  const lots = Number(lotSizeEl.value);
  if (!costPrice || !lots) {
    referenceResultEl.textContent = '請先輸入成本與張數。';
    return;
  }

  const breakEvenPrice = costPrice * (1 + FEE_RATE) / (1 - FEE_RATE - TAX_RATE * DAY_TRADE_TAX_DISCOUNT);
  const twoPctPrice = costPrice * 1.02;
  const predictedBestSellPrice = costPrice * 1.012;
  const predictedBestSellPct = ((predictedBestSellPrice - costPrice) / costPrice) * 100;

  referenceResultEl.innerHTML = `
    <p>兩平價（含手續費+當沖稅）：<strong>${breakEvenPrice.toFixed(2)}</strong> 元</p>
    <p>2% 價：<strong>${twoPctPrice.toFixed(2)}</strong> 元</p>
    <p>預測最佳賣價：<strong>${predictedBestSellPrice.toFixed(2)}</strong> 元（${predictedBestSellPct.toFixed(2)}%）</p>
    <p>參考部位：${lots} 張（${(lots * SHARES_PER_LOT).toLocaleString()} 股）</p>
  `;
}

function addTrade() {
  const side = sideEl.value;
  const price = Number(priceEl.value);
  const lots = Number(lotsEl.value);
  if (!price || !lots) return;
  trades.push({ side, price, lots });
  priceEl.value = '';
  lotsEl.value = '';
  renderTrades();
}

function renderTrades() {
  tradeTbody.innerHTML = '';
  let buyAmount = 0, sellAmount = 0, totalBuyLots = 0, totalSellLots = 0;

  trades.forEach((t, idx) => {
    const amount = t.price * t.lots * SHARES_PER_LOT;
    if (t.side === 'buy') { buyAmount += amount; totalBuyLots += t.lots; }
    else { sellAmount += amount; totalSellLots += t.lots; }

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx + 1}</td><td>${t.side === 'buy' ? '買入' : '賣出'}</td><td>${t.price.toFixed(2)}</td><td>${t.lots}</td><td>${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>`;
    tradeTbody.appendChild(tr);
  });

  const buyFee = buyAmount * FEE_RATE;
  const sellFee = sellAmount * FEE_RATE;
  const sellTax = sellAmount * TAX_RATE * DAY_TRADE_TAX_DISCOUNT;
  const grossProfit = sellAmount - buyAmount;
  const netProfit = grossProfit - buyFee - sellFee - sellTax;
  const matchedLots = Math.min(totalBuyLots, totalSellLots);

  summarySnapshot = { buyAmount, sellAmount, netProfit, matchedLots };
  summaryEl.innerHTML = `
    <p>總買入金額：${buyAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
    <p>總賣出金額：${sellAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
    <p>配對完成張數：${matchedLots} 張</p>
    <p>手續費（買+賣）：${(buyFee + sellFee).toFixed(0)} 元；證交稅：${sellTax.toFixed(0)} 元</p>
    <p>毛利：${grossProfit.toFixed(0)} 元；<strong>淨利：${netProfit.toFixed(0)} 元</strong></p>
  `;
}

function saveReview() {
  if (!summarySnapshot) {
    reviewStatusEl.textContent = '請先新增交易紀錄再儲存。';
    return;
  }
  const records = JSON.parse(localStorage.getItem('dayTradeReviews') || '[]');
  records.unshift({
    date: new Date().toISOString().slice(0, 10),
    ...summarySnapshot
  });
  localStorage.setItem('dayTradeReviews', JSON.stringify(records.slice(0, 60)));
  reviewStatusEl.textContent = '已儲存今日復盤。';
  renderReviewTable();
}

function renderReviewTable() {
  const records = JSON.parse(localStorage.getItem('dayTradeReviews') || '[]');
  reviewTbody.innerHTML = '';
  records.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${Math.round(r.buyAmount).toLocaleString()}</td><td>${Math.round(r.sellAmount).toLocaleString()}</td><td>${Math.round(r.netProfit).toLocaleString()}</td><td>${r.matchedLots}</td>`;
    reviewTbody.appendChild(tr);
  });
}
