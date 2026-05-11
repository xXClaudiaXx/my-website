# 每日當沖策略助手

這個單頁工具已支援：
- **09:00–09:03 自動抓報價/成交量**（輸入候選股票代號）
- **自動計算快篩分數**
- **選出前 3 檔並給建議買賣價**
- **收盤後可儲存復盤報表**（localStorage）
- 多次買入/賣出當沖損益計算（含手續費、證交稅）

## 免費可串接 API（含完整網址）

> 先說結論：台股「完全免費且官方穩定」的**券商下單 API 幾乎沒有公開無門檻方案**，通常都需要開戶審核。若先做策略與盤中觀測，可先用公開行情 API；要正式下單再接券商 API。

### 1) Yahoo Finance Quote API（盤中行情，非官方）
- 範例 URL：
  - https://query1.finance.yahoo.com/v7/finance/quote?symbols=2330.TW,2317.TW
- 用途：盤中快速抓成交價、成交量等欄位，適合 09:00–09:03 快篩。

### 2) Yahoo Finance Chart API（分K/歷史，非官方）
- 完整網址：
  - https://query1.finance.yahoo.com/v8/finance/chart/2330.TW?interval=1m&range=1d
- 用途：收盤後回測、日資料校正、復盤報表補資料。

## 券商 API（通常需開戶，不一定免費）
以下是常見入口（需自行確認最新方案與費率）：
- 永豐 Shioaji 文件入口：https://sinotrade.github.io/
- 富果 Fugle 開發者入口：https://developer.fugle.tw/

## 使用方式
1. 開啟 `index.html`
2. 在第一區輸入候選代號，按「抓取並評分」
3. 盤中持續新增買賣交易
4. 收盤按「儲存今日復盤」保留紀錄
