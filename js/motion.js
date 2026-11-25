/* =========================================================
   motion.js — 換頁轉場與進場動畫（設計規範 §7）
   ========================================================= */
(function () {
  // 系統設定「減少動態」或網址加 ?static 時，關閉動畫（方便檢查版面、列印）
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);
  const EASE_PAGE = "power3.inOut"; // ≈ cubic-bezier(.76,0,.24,1)
  const EASE_OUT = "expo.out";      // ≈ cubic-bezier(.16,1,.3,1)
  const DUR = 1.0;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const cover = $("#cover");
  const deck = $("#deck");
  const wipe = $("#wipe");
  const stripes = $$(".wipe__stripe", wipe); // navy, red
  // 進場頁前緣的陰影，加強「從右往左滑入、疊在上面」的層次感
  const edgeShadow = (dir) =>
    dir > 0 ? "-60px 0 120px rgba(6,31,62,0.28)" : "60px 0 120px rgba(6,31,62,0.28)";
  gsap.set(stripes, { x: 0, xPercent: 101, visibility: "visible" });

  // 左側選單收起／展開的位置：桌機往左收 280px；手機版是上方列，往上收
  const M = () => !!(window.Stage && Stage.mobile);
  const SIDE_OUT = () => (M() ? { x: 0, yPercent: -100 } : { x: -280, yPercent: 0 });
  const SIDE_IN = { x: 0, yPercent: 0 };
  // 依序滑入／滑出的選單項目：桌機＝品牌＋各單元頁籤；手機＝上方列的品牌、目前單元、選單按鈕
  const sideItems = (sidebar) =>
    M()
      ? [".sidebar__brand", ".sidebar__now", ".sidebar__toggle"].map((q) => $(q, sidebar)).filter(Boolean)
      : [$(".sidebar__brand", sidebar), ...$$(".tab", sidebar)].filter(Boolean);

  /* ---------- 進場動畫 A5～A9 ---------- */
  function enter(el) {
    if (!el) return gsap.timeline();
    if (el._tl) el._tl.progress(1).kill();
    const tl = gsap.timeline();
    el._tl = tl;
    if (RM) {
      $$(".count", el).forEach((c) => (c.textContent = parseFloat(c.dataset.to).toFixed(parseInt(c.dataset.dec || "0", 10))));
      return tl;
    }

    const inGlass = (n) => !!n.closest(".glass");

    // 背景巨型字
    const ghost = $(".ghost-word", el);
    if (ghost) tl.from(ghost, { opacity: 0, duration: 1.2, ease: "power2.out" }, 0);

    // 色塊漂入
    $$(".blob", el).forEach((b, k) =>
      tl.from(b, { scale: 0.4, opacity: 0, duration: 1.6, ease: EASE_OUT }, 0.05 + k * 0.1)
    );

    // 標題逐字浮現（A5）
    $$(".split", el)
      .filter((n) => !inGlass(n))
      .forEach((n, k) => {
        tl.from($$(".ch", n), { yPercent: 110, opacity: 0, rotate: 6, duration: 0.9, ease: EASE_OUT, stagger: 0.03 }, 0.08 + k * 0.12);
      });

    // 一般淡入上移
    const fx = $$(".fx", el).filter((n) => !inGlass(n));
    if (fx.length) tl.from(fx, { y: 24, opacity: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.08 }, 0.15);

    // 長條展開
    const grow = $$(".fx-grow", el);
    if (grow.length) tl.from(grow, { scaleX: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.025 }, 0.35);

    // 彈出
    const pop = $$(".fx-pop", el);
    if (pop.length) tl.from(pop, { scale: 0.5, opacity: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "back.out(1.8)", stagger: 0.12 }, 0.5);

    // 點陣地圖亮起
    const dots = $$(".fx-dot", el);
    if (dots.length) tl.from(dots, { opacity: 0, duration: 0.4, stagger: { amount: 0.9, from: "random" } }, 0.2);

    // 航線繪製（A8）
    $$(".draw", el).forEach((p, k) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.6 + k * 0.5);
    });

    // 數字跑動（A7）
    $$(".count", el).forEach((c) => {
      const to = parseFloat(c.dataset.to);
      const dec = parseInt(c.dataset.dec || "0", 10);
      const o = { v: 0 };
      c.textContent = (0).toFixed(dec);
      tl.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => (c.textContent = o.v.toFixed(dec)) }, 0.5);
    });

    // 霧面玻璃：由左往右揭開 → 光澤掃過 → 名字浮現
    const glass = $(".glass", el);
    if (glass) {
      tl.fromTo(
        glass,
        { clipPath: "inset(0% 100% 0% 0% round 28px)", y: 40, opacity: 0 },
        { clipPath: "inset(0% 0% 0% 0% round 28px)", y: 0, opacity: 1, duration: 1.1, ease: EASE_OUT },
        0.3
      );
      tl.from($$(".glass__top, .glass__role, .glass__foot", glass), { y: 16, opacity: 0, duration: 0.7, ease: EASE_OUT, stagger: 0.08 }, 0.6);
      const name = $(".glass__name", glass);
      if (name) tl.from($$(".ch", name), { yPercent: 100, opacity: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.06 }, 0.7);
      const sheen = $(".glass__sheen", glass);
      tl.fromTo(sheen, { xPercent: -160 }, { xPercent: 360, duration: 1.4, ease: "power2.inOut" }, 0.9);
    }

    return tl;
  }

  /* ---------- 頁面顯示工具 ---------- */
  function show(el) {
    el.classList.add("is-active");
    gsap.set(el, { xPercent: 0, scale: 1, filter: "brightness(1)", zIndex: 2 });
  }
  function hide(el) {
    if (el._tl) el._tl.progress(1).kill();
    el.classList.remove("is-active");
    gsap.set(el, { clearProps: "transform,filter,zIndex" });
    const g = $(".ghost-word", el);
    if (g) gsap.set(g, { x: 0, y: 0 });
  }

  /* ---------- A1 垂直換頁：封面 ↔ 第 2 頁 ---------- */
  function vertical(toEl, fromEl, down) {
    const sidebar = $("#sidebar");
    const tl = gsap.timeline({ defaults: { duration: RM ? 0.3 : DUR * 1.1, ease: EASE_PAGE } });
    const coverGhost = $(".cover__ghost");

    if (down) {
      show(toEl);
      if (RM) {
        tl.set(deck, { yPercent: 0 }).set(sidebar, SIDE_IN).fromTo(deck, { opacity: 0 }, { opacity: 1 }).set(cover, { yPercent: -100 });
        return tl;
      }
      tl.to(cover, { yPercent: -100 }, 0)
        .to(coverGhost, { y: 360 }, 0)
        .fromTo(deck, { yPercent: 100 }, { yPercent: 0 }, 0)
        .fromTo(sidebar, SIDE_OUT(), { ...SIDE_IN, duration: 0.9 }, 0.1)
        .add(enter(toEl), 0.55);
      // 左側選單項目：品牌 → 各單元頁籤（目前單元的底色指示塊跟著第一格）→ 頁碼，一個接一個從左側滑入定位
      const tabs = $$(".tab", sidebar);
      const indicator = $(".tabs__indicator", sidebar);
      const curIdx = Math.max(0, tabs.findIndex((t) => t.classList.contains("is-current")));
      const seq = sideItems(sidebar);
      const STEP = 0.06;
      const START = 0.45;
      tl.fromTo(
        seq,
        { x: -180, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: STEP, clearProps: "transform,opacity" },
        START
      );
      if (indicator && !M())
        tl.fromTo(
          indicator,
          { x: -180, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity" },
          START + STEP * (curIdx + 1)
        );
    } else {
      if (RM) {
        tl.set(cover, { yPercent: 0 }).set(deck, { yPercent: 100 }).add(() => hide(fromEl));
        return tl;
      }
      // 與進場相反：頁碼 → 頁籤（由下往上）→ 品牌，一個接一個往左滑出，接著選單底板退出、封面從上方回來
      const tabs = $$(".tab", sidebar);
      const indicator = $(".tabs__indicator", sidebar);
      const curIdx = Math.max(0, tabs.findIndex((t) => t.classList.contains("is-current")));
      const seq = sideItems(sidebar).reverse();
      const STEP = 0.045;
      const OUT = { x: -180, opacity: 0, duration: 0.5, ease: "power3.in" };
      tl.to(seq, { ...OUT, stagger: STEP }, 0);
      // 指示塊跟著目前頁籤一起滑出（目前頁籤在反向序列中的位置）
      if (indicator && !M()) tl.to(indicator, OUT, STEP * (tabs.length - curIdx));
      const back = 0.35;
      tl.to(deck, { yPercent: 100 }, back)
        .to(sidebar, { ...SIDE_OUT(), duration: 0.8 }, back + 0.3)
        .to(cover, { yPercent: 0 }, back)
        .fromTo(coverGhost, { y: 360 }, { y: 0 }, back)
        .add(() => {
          hide(fromEl);
          // 選單已移出畫面，清掉滑出時留下的位移與透明度，下次進場重新播放
          gsap.set([...seq, indicator].filter(Boolean), { clearProps: "transform,opacity" });
        })
        .add(enterCover(), back + 0.6);
    }
    return tl;
  }

  /* ---------- A2 水平換頁（同章節） ---------- */
  function slide(fromEl, toEl, dir) {
    const tl = gsap.timeline({ defaults: { duration: RM ? 0.3 : DUR, ease: EASE_PAGE } });
    if (RM) {
      show(toEl);
      tl.fromTo(toEl, { opacity: 0 }, { opacity: 1 }).add(() => hide(fromEl));
      return tl;
    }
    toEl.classList.add("is-active");
    gsap.set(toEl, { xPercent: 100 * dir, scale: 1, filter: "brightness(1)", zIndex: 3, boxShadow: edgeShadow(dir) });
    gsap.set(fromEl, { zIndex: 1 });
    const gIn = $(".ghost-word", toEl);
    const gOut = $(".ghost-word", fromEl);

    // 新頁由右往左滑入、疊在上面；舊頁往左退後並變暗
    tl.to(fromEl, { xPercent: -30 * dir, scale: 0.92, filter: "brightness(0.55)" }, 0)
      .to(toEl, { xPercent: 0 }, 0);
    // A4 巨型字反向視差
    if (gIn) tl.fromTo(gIn, { x: -520 * dir }, { x: 0, duration: DUR * 1.4, ease: "power3.out" }, 0);
    if (gOut) tl.to(gOut, { x: 380 * dir }, 0);
    tl.add(enter(toEl), 0.45).add(() => {
      hide(fromEl);
      gsap.set(toEl, { boxShadow: "none" });
    }, DUR);
    return tl;
  }

  /* ---------- A3 跨單元：藍色層、紅色層、新頁依序由右往左滑入疊上 ---------- */
  /* 跨單元：往下換頁 —— 藍色層（單元編號與名稱）→ 紅色層 → 新頁，依序由下往上疊入；
     舊頁往上退後變暗。往回翻（上一單元）時方向相反，由上往下疊入 */
  const edgeShadowV = (dir) =>
    dir > 0 ? "0 -60px 120px rgba(6,31,62,0.28)" : "0 60px 120px rgba(6,31,62,0.28)";

  function flag(fromEl, toEl, dir, chapter) {
    if (RM) return slide(fromEl, toEl, dir);
    $(".wipe__no", wipe).textContent = chapter.no;
    $(".wipe__en", wipe).textContent = chapter.en;
    $(".wipe__zh", wipe).textContent = chapter.zh;
    const label = $(".wipe__label", wipe);
    const navy = stripes[0];
    const red = stripes[1];
    const gIn = $(".ghost-word", toEl);

    toEl.classList.add("is-active");
    gsap.set(toEl, { xPercent: 0, yPercent: 100 * dir, scale: 1, filter: "brightness(1)", zIndex: 200, boxShadow: edgeShadowV(dir) });
    gsap.set(fromEl, { zIndex: 1 });
    gsap.set(stripes, { xPercent: 0, yPercent: 100 * dir, boxShadow: edgeShadowV(dir) });
    gsap.set(label, { y: 160 * dir, opacity: 0 });
    if (gIn) gsap.set(gIn, { y: -260 * dir });

    const tl = gsap.timeline({ defaults: { ease: EASE_PAGE } });
    tl.to(fromEl, { yPercent: -30 * dir, scale: 0.9, filter: "brightness(0.5)", duration: 1.3 }, 0)
      .to(navy, { yPercent: 0, duration: 0.85 }, 0)
      .to(label, { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT }, 0.3)
      .to(red, { yPercent: 0, duration: 0.85 }, 0.2)
      .to(toEl, { yPercent: 0, duration: 0.95 }, 0.4);
    if (gIn) tl.to(gIn, { y: 0, duration: 1.5, ease: "power3.out" }, 0.4);
    tl.add(enter(toEl), 0.85).add(() => {
      hide(fromEl);
      gsap.set(stripes, { xPercent: 101, yPercent: 0, boxShadow: "none" });
      gsap.set(toEl, { zIndex: 3, boxShadow: "none" });
    }, 1.4);
    return tl;
  }

  /* ---------- 封面進場 ---------- */
  function enterCover() {
    if (cover._tl) cover._tl.progress(1).kill();
    const tl = gsap.timeline();
    cover._tl = tl;
    if (RM) {
      // 系統開啟「減少動態」時略過進場動畫，但地球儀仍持續自轉（?static 檢查模式除外）
      if (!/[?&]static\b/.test(location.search) && window.Globe) Globe.startAutoRotate();
      return tl;
    }
    tl.from(".cover__ghost", { xPercent: -8, opacity: 0, duration: 1.6, ease: EASE_OUT }, 0);
    $$(".split", cover).forEach((n, k) =>
      tl.from($$(".ch", n), { yPercent: 110, opacity: 0, rotate: 8, duration: 1, ease: EASE_OUT, stagger: 0.045 }, 0.1 + k * 0.25)
    );
    tl.from($$(".fx", cover), { y: 24, opacity: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08 }, 0.3);
    // 左下角人物：潑墨炸開 → 人物由下往上冒出 → 膠帶貼上
    tl.from(".cover__splat", { scale: 0.2, opacity: 0, transformOrigin: "50% 60%", duration: 0.7, ease: "back.out(2.2)" }, 0.5)
      .from(".cover__person", { yPercent: 60, rotate: -6, opacity: 0, transformOrigin: "50% 100%", duration: 1.1, ease: EASE_OUT }, 0.65)
      .from(".cover__tape", { y: -40, rotate: -40, opacity: 0, duration: 0.6, ease: "back.out(2)" }, 1.2);
    tl.from($$(".route__globe", cover), { scale: 0.6, opacity: 0, transformOrigin: "50% 50%", duration: 1.4, ease: EASE_OUT, stagger: 0.1 }, 0.2);
    // 地球儀：球體淡入，同時從大西洋一側轉到亞洲（js/globe.js）
    const globeSvg = $(".globe", cover);
    if (globeSvg) tl.from(globeSvg, { scale: 0.85, opacity: 0, transformOrigin: "50% 50%", duration: 1.4, ease: EASE_OUT }, 0.1);
    if (window.Globe) tl.add(Globe.spinIn(2.4), 0.1);
    // 地球轉定位後才畫航線、跳出標記
    $$(".draw", cover).forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, visibility: "hidden" });
      tl.set(p, { visibility: "visible" }, 2.0).to(p, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 2.0);
    });
    tl.from($$(".fx-pop", cover), { scale: 0.4, opacity: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "back.out(1.8)", stagger: 0.15 }, 1.8);
    tl.from(".scroll-hint", { opacity: 0, y: -10, duration: 0.8 }, 1.6);
    // 航線畫完後開始持續自轉（滑鼠移到地球上會停）
    if (window.Globe) tl.add(() => Globe.startAutoRotate(), 3.2);
    return tl;
  }

  /* ---------- 玻璃隨滑鼠微傾 ---------- */
  function tilt(el, nx, ny) {
    const g = el && $(".glass", el);
    if (!g || RM) return;
    gsap.to(g, { rotationY: nx * 7, rotationX: -ny * 7, transformPerspective: 1400, duration: 0.9, ease: "power2.out" });
    $$(".blob", el).forEach((b, k) => gsap.to(b, { x: nx * (30 + k * 20), y: ny * (30 + k * 20), duration: 1.4, ease: "power2.out" }));
  }

  window.Motion = { enter, enterCover, vertical, slide, flag, show, hide, tilt, RM, SIDE_OUT, SIDE_IN };
})();
