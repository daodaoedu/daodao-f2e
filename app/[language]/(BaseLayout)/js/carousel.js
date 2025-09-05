// carousel.js
// 用法：在 HTML 底部引入 <script src="carousel.js" defer></script>
// 需要的 HTML 結構：.carousel > .functions-cards > .functions-cards-item...

(function initCarousels(selector = '.carousel .functions-cards') {
  const tracks = document.querySelectorAll(selector);
  if (!tracks.length) return;

  tracks.forEach((track) => {
    // 避免圖片被原生拖走或選取
    track.querySelectorAll('img').forEach((img) => {
      img.draggable = false;
      img.style.userSelect = 'none';
      img.style.webkitUserDrag = 'none';
    });

    // 計算「一步」距離 = 卡片寬 + gap
    const getStep = () => {
      const first = track.querySelector('.functions-cards-item');
      if (!first) return 0;
      const rectW = first.getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return rectW + gap;
    };

    // 最大索引（最後一頁）
    const maxIndex = () => {
      const step = getStep();
      if (!step) return 0;
      const totalScrollable = track.scrollWidth - track.clientWidth;
      return Math.max(0, Math.round(totalScrollable / step));
    };

    let dragging = false;
    let startX = 0;
    let lastX = 0;
    let startLeft = 0;
    let startIndex = 0;
    let pointerId = null;
    let movedPx = 0;

    const enableNoSnap = () => { track.style.scrollSnapType = 'none'; };
    const disableNoSnap = () => { track.style.scrollSnapType = ''; };

    const onPointerDown = (e) => {
      // 只處理左鍵或觸控/手寫筆
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (pointerId !== null) return;

      pointerId = e.pointerId;
      track.setPointerCapture(pointerId);

      dragging = true;
      movedPx = 0;
      startX = e.clientX;
      lastX = e.clientX;
      startLeft = track.scrollLeft;

      const step = getStep();
      startIndex = step ? Math.round(startLeft / step) : 0;

      enableNoSnap();
      track.classList.add('dragging');
      document.body.style.userSelect = 'none';
    };

    const onPointerMove = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      lastX = e.clientX;
      movedPx = Math.max(movedPx, Math.abs(dx));
      track.scrollLeft = startLeft - dx;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;

      const step = getStep();
      const maxIdx = maxIndex();

      // 邊界 & 保護
      if (!step) {
        pointerId = null;
        track.classList.remove('dragging');
        disableNoSnap();
        document.body.style.userSelect = '';
        return;
      }

      const dx = lastX - startX; // >0 往右拖、<0 往左拖
      const DRAG_TRIGGER = 2;    // 認定「有拖動」的最小像素（避免抖動）

      let targetIndex = startIndex;
      if (Math.abs(dx) >= DRAG_TRIGGER) {
        // 只要有拖動：往右拖 → 上一張；往左拖 → 下一張
        targetIndex = startIndex + (dx > 0 ? -1 : 1);
        targetIndex = Math.max(0, Math.min(maxIdx, targetIndex));
      }

      const targetLeft = targetIndex * step;
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });

      pointerId = null;
      track.classList.remove('dragging');
      disableNoSnap();
      document.body.style.userSelect = '';
    };

    const onPointerUp = (e) => { if (e.pointerId === pointerId) endDrag(); };
    const onPointerCancel = (e) => { if (e.pointerId === pointerId) endDrag(); };
    const onLostCapture = () => endDrag();

    // 避免拖曳後誤觸 click（有移動超過 5px 就吃掉點擊）
    const swallowClickIfDragged = (e) => {
      if (movedPx > 5) e.preventDefault();
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerCancel);
    track.addEventListener('lostpointercapture', onLostCapture);
    track.addEventListener('click', swallowClickIfDragged, true);
  });
})();
