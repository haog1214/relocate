/* =========================================================
   stage.js — 畫布等比滿版（響應式）
   桌機／橫向：
   - 寬度固定以 1920 設計，依視窗寬度等比縮放 → 永遠滿版寬
   - 高度依視窗比例自動調整（設計高度 = 視窗高 ÷ 縮放比），
     所以 16:9 以外的螢幕也不會留左右黑邊
   - 視窗比例極端時（設計高度超出 860～1440）才退回完整顯示並留邊
   手機直向（RWD）：
   - 視窗寬高比 < 0.85 時切換為手機版面（<html class="is-mobile">，樣式見 css/mobile.css）
   - 設計寬度約 360～480，手機以 1:1 顯示，平板直向等比放大；高度＝視窗高度
   - 旋轉手機在兩種版面間切換時重新載入（網址保留目前頁碼）
   ========================================================= */
(function () {
  const W = 1920;
  const H_MIN = 860;
  const H_MAX = 1440;
  const M_MIN = 360; // 手機版最小設計寬度（更窄的手機等比縮小）
  const M_MAX = 480; // 手機版最大設計寬度（更寬的平板等比放大）
  const stage = document.getElementById("stage");
  const root = document.documentElement;
  let raf = 0;

  const isMobile = () => window.innerWidth / window.innerHeight < 0.85;

  function fit() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = isMobile();

    // 版面模式改變（例如手機轉向）→ 重新載入，讓轉場與選單位置重新計算
    if (window.Stage.ready && mobile !== window.Stage.mobile) {
      location.reload();
      return;
    }

    let s, w, h;
    if (mobile) {
      s = vw < M_MIN ? vw / M_MIN : vw > M_MAX ? vw / M_MAX : 1;
      w = vw / s;
      h = vh / s;
    } else {
      w = W;
      s = vw / W;
      h = vh / s;
      if (h < H_MIN || h > H_MAX) {
        h = Math.min(H_MAX, Math.max(H_MIN, h));
        s = Math.min(vw / W, vh / h);
      }
    }
    root.classList.toggle("is-mobile", mobile);
    stage.style.setProperty("--stage-w", `${Math.round(w)}px`);
    stage.style.setProperty("--stage-h", `${Math.round(h)}px`);
    stage.style.setProperty("--scale", s.toFixed(5));
    Object.assign(window.Stage, { scale: s, W: w, H: h, mobile, ready: true });
  }

  window.Stage = { scale: 1, W, H: 1080, mobile: false, ready: false, fit };

  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fit);
  });
  fit();
})();
