// 取得元素
const wrapper  = document.getElementById('tableWrapper');
const form     = document.getElementById('rangeForm');
const btn09    = document.getElementById('btn09');
const btn19    = document.getElementById('btn19');
const btnApply = document.getElementById('btnApply');
const btnPrint = document.getElementById('btnPrint');
const inputS   = document.getElementById('start');
const inputE   = document.getElementById('end');
const hint     = document.getElementById('rangeHint');

/**
 * 以 <table> 產生乘法表
 * @param {number} start 起始整數（可為負數）
 * @param {number} end   結束整數（可為負數）
 */
function renderTable(start = 1, end = 9) {
  // 轉為整數；允許任何整數（負數／超大皆可）
  start = parseInt(start, 10);
  end   = parseInt(end,   10);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    wrapper.innerHTML = `<div style="padding:16px;text-align:center;color:#6C8592">請輸入整數</div>`;
    return;
  }
  // 保證 start <= end
  if (start > end) [start, end] = [end, start];

  // 範圍提示
  hint.textContent = `目前範圍：${start} ～ ${end}`;

  // 產生表格字串
  let html = '<table><tbody>';
  for (let a = start; a <= end; a++) {
    html += '<tr>';
    for (let b = start; b <= end; b++) {
      html += `<td tabindex="0">${a} × ${b} = ${a * b}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';

  wrapper.innerHTML = html;
}

// 快速鍵：0～9、1～9
btn09.addEventListener('click', () => {
  inputS.value = 0; inputE.value = 9;
  renderTable(0, 9);
  setPrimary(btn09);
});
btn19.addEventListener('click', () => {
  inputS.value = 1; inputE.value = 9;
  renderTable(1, 9);
  setPrimary(btn19);
});

// 表單提交（套用）
form.addEventListener('submit', (e) => {
  e.preventDefault();
  renderTable(inputS.value, inputE.value);
  // 自訂範圍時取消兩顆快速鍵的高亮
  btn09.classList.remove('primary');
  btn19.classList.remove('primary');
});

// 列印 / 存 PDF
btnPrint.addEventListener('click', () => window.print());

// 切換 primary 樣式的小工具
function setPrimary(which){
  [btn09, btn19].forEach(b => b.classList.remove('primary'));
  which.classList.add('primary');
}

