
// ① 想顯示的字串們（依序輪播）
const LINES = [
  '看看別人怎麼做',
  '參考成功案例',
  '從作品得到靈感',
  '把方法帶回你的計畫',
];

// ② 速度設定（毫秒）
const TYPE_SPEED  = 120;   // 打字速度（每字）
const PAUSE_DONE  = 1900; // 打完停留
const ERASE_SPEED = 100;   // 退格速度
const PAUSE_NEXT  = 200;  // 換句前的間隔

const el  = document.getElementById('type-animation');
const box = el;

// ——— 先量測「最寬的一句」，把氣泡寬度固定住，避免抖動 ———
function fitBubbleWidth(){
  const probe = document.createElement('span');
  probe.style.cssText = `
    position:absolute; visibility:hidden; white-space:nowrap;
    font:${getComputedStyle(el).font};
  `;
  document.body.appendChild(probe);
  let max = 0;
  for (const s of LINES){
    probe.textContent = s;
    max = Math.max(max, probe.getBoundingClientRect().width);
  }
  document.body.removeChild(probe);
  // 加上內邊距與邊框（與 .bubble 的 padding/border 對應）
  const styles = getComputedStyle(box);
  const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const borderX = parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth);
  box.style.width = `${Math.ceil(max + padX + borderX)  }px`;
}

async function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

async function type(text){
  for (let i = 1; i <= text.length; i++){
    el.textContent = text.slice(0, i);
    await wait(TYPE_SPEED);
  }
}

async function erase(){
  while (el.textContent.length){
    el.textContent = el.textContent.slice(0, -1);
    await wait(ERASE_SPEED);
  }
}

async function start(){
  fitBubbleWidth();
  while(true){
    for (const s of LINES){
      await type(s);
      await wait(PAUSE_DONE);
      await erase();
      await wait(PAUSE_NEXT);
    }
  }
}

// 進到視窗才啟動（效能友善）
const io = new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){ start(); io.disconnect(); }
},{ threshold: 0.2 });
io.observe(box);
