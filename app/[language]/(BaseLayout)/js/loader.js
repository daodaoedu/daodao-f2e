
const bar = document.getElementById('bar');
const percentEl = document.getElementById('percent');
const loaderEl = document.getElementById('loader');
const appEl = document.getElementById('app');

function setProgress(p) { // p: 0~1
    const clamped = Math.max(0, Math.min(1, p));
    document.getElementById('bar').style.width = `${clamped * 100  }%`;  // ← 改這行
    document.getElementById('percent').textContent = `${Math.round(clamped * 100)  }%`;
}


function done() {
    setProgress(1);
    // 略做延遲讓 100% 被看見
    setTimeout(() => {
        loaderEl.classList.add('loader--hide');
        appEl.style.transition = 'opacity .3s ease';
        appEl.style.opacity = '1';
    }, 150);
}

// 固定 3.5 秒跑完
function timedProgress(duration = 3500) {
    const t0 = performance.now();
    function tick(now) {
        const t = Math.min(1, (now - t0) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(eased);
        if (t < 1) requestAnimationFrame(tick);
        else done();
    }
    requestAnimationFrame(tick);
}

// 啟用
timedProgress(3500);

// Loader 裡的 Lottie
const loaderAnim = lottie.loadAnimation({
    container: document.getElementById('loader-lottie'), //  loader 的容器
    path: './img/logo-action.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: 'Loader',
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
});