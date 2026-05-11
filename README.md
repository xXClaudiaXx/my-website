# 每日當沖策略助手（Yahoo Quote API 版）

你要的版本已經是：**直接抓 Yahoo Finance Quote API**。

## 目前抓的 API（完整網址）
- 多檔即時報價：
  - `https://query1.finance.yahoo.com/v7/finance/quote?symbols=2330.TW,2317.TW,2454.TW`
- 分K/歷史（可做盤後復盤補資料）：
  - `https://query1.finance.yahoo.com/v8/finance/chart/2330.TW?interval=1m&range=1d`

> 程式內會把你輸入的代號（例如 `2330,2317`）自動轉成 `2330.TW,2317.TW` 後查詢。

---

## 我要去哪裡看這個小程式？

### 方法 A：直接雙擊（最簡單）
1. 到專案資料夾找到 `index.html`
2. 直接雙擊，用瀏覽器開啟

### 方法 B：本機伺服器（建議，穩定）
有些瀏覽器對 `file://` 會限制跨網域請求（CORS），若你遇到抓不到資料，請改用：

```bash
python3 -m http.server 8080
```

然後打開：
- `http://localhost:8080`

---

## 可以存成單機版嗎？
可以，這個專案本來就是**純前端單機版**（`index.html + script.js + style.css`）。

### 單機版特性
- 不用安裝資料庫
- 不用後端
- 交易紀錄/復盤資料存在瀏覽器 `localStorage`

### 你只要保存這三個檔案就能帶走
- `index.html`
- `script.js`
- `style.css`

放在同一個資料夾，任何電腦都可離線開 UI（但要抓 Yahoo 即時資料仍需網路）。

---


## 如果出現「抓取失敗：Failed to fetch」
常見原因是 Yahoo Finance 對瀏覽器跨網域（CORS）限制。

你可以這樣做：
1. 不要用 `file://`，改用本機伺服器：`python3 -m http.server 8080`
2. 開 `http://localhost:8080`
3. 新版程式會先直連 Yahoo，失敗時自動改用 `https://corsproxy.io/` 代理重試

## 已做功能
- 09:00–09:03 候選股快篩
- Yahoo Quote API 自動抓價量
- 自動計分、前 3 名、建議買賣價
- 多次買入/賣出損益（含手續費、證交稅）
- 收盤儲存復盤報表（localStorage）

## 使用方式
1. 開啟 `index.html`
2. 輸入候選代號（例：`2330,2317,2454`）
3. 按「抓取並評分」
4. 盤中新增買賣交易
5. 收盤按「儲存今日復盤」
