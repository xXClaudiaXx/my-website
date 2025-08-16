// 狀態
let answer = getRandomAnswer();
let finished = false;

// DOM
const hintEl   = document.getElementById('hint');
const gridEl   = document.getElementById('grid');
const applesEl = document.getElementById('apples');
const resetBtn = document.getElementById('resetBtn');
const themeBtn = document.getElementById('themeToggle');

// 初始化：綁定所有數字按鈕
document.querySelectorAll('.num').forEach(btn => {
  btn.addEventListener('click', () => onGuess(parseInt(btn.dataset.n, 10)));
});

// 重新開始
resetBtn.addEventListener('click', () => resetGame());

// 深色模式切換（記錄到 localStorage）
themeBtn.addEventListener('click', () => {
  const dark = document.body.dataset.theme === 'dark';
  document.body.dataset.theme = dark ? '' : 'dark';
  localStorage.setItem('theme', document.body.dataset.theme || 'light');
});
applySavedTheme();

// ------ 邏輯 ------

function getRandomAnswer(){
  return Math.floor(Math.random() * 9) + 1; // 1~9
}

function onGuess(n){
  if (finished) return;

  if (n > answer) {
    hintEl.textContent = `太大了，再猜一次！（${n} 大於答案）`;
    flashButton(n, 'down'); // 給點視覺提示
  } else if (n < answer) {
    hintEl.textContent = `太小了，再猜一次！（${n} 小於答案）`;
    flashButton(n, 'up');
  } else {
    hintEl.textContent = `恭喜答對！答案是 ${answer} 🎉`;
    showApples(answer);
    lockButtons(true);
    finished = true;
  }
}

function showApples(count){
  applesEl.innerHTML = '';
  applesEl.setAttribute('aria-hidden', 'false');
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'apple';
    span.textContent = '🍎';
    applesEl.appendChild(span);
  }
}

function lockButtons(disabled){
  document.querySelectorAll('.num').forEach(b => b.disabled = disabled);
}

function resetGame(){
  answer = getRandomAnswer();
  finished = false;
  hintEl.textContent = '請開始猜！';
  applesEl.innerHTML = '';
  applesEl.setAttribute('aria-hidden', 'true');
  lockButtons(false);
}

// 小小視覺提示：按錯時讓比答案大的/小的數字閃一下
function flashButton(n, dir){
  const btn = document.querySelector(`.num[data-n="${n}"]`);
  if (!btn) return;
  const original = btn.style.backgroundColor;
  // 提示色：太大→淡珊瑚、太小→淡薄荷
  btn.style.backgroundColor = dir === 'down' ? 'rgba(255,126,95,.18)' : 'rgba(58,214,196,.18)';
  setTimeout(() => { btn.style.backgroundColor = ''; }, 220);
}

// 載入主題偏好
function applySavedTheme(){
  const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
  if (saved === 'dark') document.body.dataset.theme = 'dark';
}
