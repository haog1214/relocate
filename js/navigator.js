/* =========================================================
   navigator.js — 換頁邏輯、輸入處理、網址同步（設計規範 §4）
   ========================================================= */
(function () {
  const D = window.DECK;
  const TOTAL = D.slides.length;
  const LOCK_EXTRA = 200;   // 轉場結束後再鎖定的毫秒數
  const WHEEL_MIN = 40;     // 滾輪累積門檻
  const WHEEL_QUIET = 180;  // 換頁後需停頓多久才接受下一次滾輪（避免觸控板慣性連翻）
  const SWIPE_MIN = 50;

  Render.build();

  const coverEl = document.getElementById("cover");
  const slideEls = [coverEl, ...document.querySelectorAll("#slides .slide")];
  const live = document.getElementById("live");

  let cur = 0;
  let busy = false;

  const chapterOf = (i) => (i === 0 ? -1 : D.slides[i].ch);

  function announce(i) {
    live.textContent = i === 0 ? "第 1 頁：封面" : `第 ${i + 1} 頁，共 ${TOTAL} 頁：${Render.topic(D.slides[i])}`;
  }

  function go(n) {
    n = Math.max(0, Math.min(TOTAL - 1, n));
    if (busy || n === cur) return;
    Sidebar.setOpen(false);
    busy = true;
    const from = cur;
    const fromEl = slideEls[from];
    const toEl = slideEls[n];
    const dir = n > from ? 1 : -1;
    cur = n;

    // lock：轉場本身需要的秒數（不含進場動畫）
    let lock;
    if (from === 0) { Motion.vertical(toEl, null, true); lock = 1.15; }
    else if (n === 0) { Motion.vertical(coverEl, fromEl, false); lock = 1.5; }
    else if (chapterOf(from) !== chapterOf(n)) { Motion.flag(fromEl, toEl, dir, D.chapters[chapterOf(n)]); lock = 1.4; }
    else { Motion.slide(fromEl, toEl, dir); lock = 1.0; }
    if (Motion.RM) lock = 0.35;

    if (n > 0) Sidebar.update(n);
    history.replaceState(null, "", `#/${n + 1}`);
    announce(n);

    setTimeout(() => (busy = false), lock * 1000 + LOCK_EXTRA);
  }

  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  /* ---------- 初始狀態 ---------- */
  function jumpTo(n) {
    n = Math.max(0, Math.min(TOTAL - 1, n));
    slideEls.forEach((el, i) => i > 0 && Motion.hide(el));
    cur = n;
    if (n === 0) {
      gsap.set(document.getElementById("deck"), { yPercent: 100 });
      gsap.set("#sidebar", Motion.SIDE_OUT());
      gsap.set(coverEl, { yPercent: 0 });
      Motion.enterCover();
    } else {
      gsap.set(coverEl, { yPercent: -100 });
      gsap.set(document.getElementById("deck"), { yPercent: 0 });
      gsap.set("#sidebar", Motion.SIDE_IN);
      Motion.show(slideEls[n]);
      Sidebar.update(n, true);
      Motion.enter(slideEls[n]);
    }
    announce(n);
  }

  function fromHash() {
    const m = location.hash.match(/^#\/(\d+)/);
    return m ? Number(m[1]) - 1 : 0;
  }

  Sidebar.build((n) => go(n));

  const start = () => jumpTo(fromHash());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();

  window.addEventListener("hashchange", () => {
    const n = fromHash();
    if (n !== cur) go(n);
  });

  /* ---------- 滾輪／觸控板 ---------- */
  let acc = 0;
  let lastWheel = 0;
  let needQuiet = false;
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (needQuiet) {
        if (gap < WHEEL_QUIET) return;
        needQuiet = false;
      }
      if (busy) return;
      if (gap > 200) acc = 0;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      acc += d;
      if (Math.abs(acc) >= WHEEL_MIN) {
        acc > 0 ? next() : prev();
        acc = 0;
        needQuiet = true;
      }
    },
    { passive: false }
  );

  /* ---------- 觸控 ---------- */
  let tx = 0, ty = 0;
  window.addEventListener("touchstart", (e) => { if (Sidebar.isOpen()) { tx = NaN; return; } tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    // 手機版單元選單打開時，滑動不換頁（以免點選選單時誤翻）
    if (Number.isNaN(tx) || Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
    if (Math.abs(dy) > Math.abs(dx)) dy < 0 ? next() : prev();
    else dx < 0 ? next() : prev();
  });

  /* ---------- 鍵盤 ---------- */
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
      case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowUp":
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case " ":
        e.preventDefault(); e.shiftKey ? prev() : next(); break;
      case "Home":
        e.preventDefault(); go(0); break;
      case "End":
        e.preventDefault(); go(TOTAL - 1); break;
      case "Escape":
        Sidebar.setOpen(false); break;
      case "f":
      case "F":
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
    }
  });

  /* ---------- 滑鼠：玻璃微傾 ---------- */
  window.addEventListener("mousemove", (e) => {
    if (cur === 0) return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    Motion.tilt(slideEls[cur], nx, ny);
  });

  window.Nav = { go, next, prev, get current() { return cur; } };
})();
