/* =========================================================
   sidebar.js — 左側固定選單（單元進度：分頁標籤樣式）
   樣式參考：上方圓弧虛線分頁標籤＋圓環圖示，目前單元整格填色
   ========================================================= */
(function () {
  const D = window.DECK;

  // 每個單元包含哪些頁
  const pagesOf = D.chapters.map((_, c) =>
    D.slides.map((s, i) => (i > 0 && s.ch === c ? i : -1)).filter((i) => i >= 0)
  );

  let el, items, toggleBtn, nowNo, nowName, nowDots;
  let toneCall = null;
  let indicator = null;
  let indicatorTl = null;
  let currentCh = -1;

  function build(onJump) {
    el = document.getElementById("sidebar");
    el.innerHTML = `
      <button class="sidebar__brand" data-jump="0" aria-label="回到封面">
        <span class="brand__mark">${D.title}</span>
        <span class="sidebar__tagline">關稅下的產線新布局</span>
      </button>
      <!-- 手機版上方列：目前單元＋頁面小圓點＋選單按鈕（桌機隱藏，見 css/mobile.css） -->
      <div class="sidebar__now" aria-hidden="true">
        <span class="sidebar__now-no num">01</span>
        <span class="sidebar__now-name">背景與目的</span>
        <span class="sidebar__now-dots"></span>
      </div>
      <button class="sidebar__toggle" type="button" aria-label="開啟單元選單" aria-expanded="false"><i></i><i></i><i></i></button>
      <ol class="tabs">
        ${D.chapters
          .map(
            (c, k) => `
          <li class="tab" data-ch="${k}">
            <button class="tab__btn" data-jump="${pagesOf[k][0]}" aria-label="第 ${c.no} 單元：${c.zh}">
              <span class="tab__ring" aria-hidden="true"></span>
              <span class="tab__name">${c.zh}</span>
              <span class="tab__no">${c.no}</span>
            </button>
            <span class="tab__dots">
              ${pagesOf[k]
                .map((p) => `<button class="tab__dot" data-jump="${p}" aria-label="第 ${p + 1} 頁"></button>`)
                .join("")}
            </span>
          </li>`
          )
          .join("")}
        <li class="tabs__indicator" aria-hidden="true"></li>
      </ol>`;

    items = [...el.querySelectorAll(".tab")];
    indicator = el.querySelector(".tabs__indicator");
    toggleBtn = el.querySelector(".sidebar__toggle");
    nowNo = el.querySelector(".sidebar__now-no");
    nowName = el.querySelector(".sidebar__now-name");
    nowDots = el.querySelector(".sidebar__now-dots");

    el.addEventListener("click", (e) => {
      if (e.target.closest(".sidebar__toggle")) return setOpen(!el.classList.contains("is-open"));
      const b = e.target.closest("[data-jump]");
      if (b) {
        setOpen(false);
        onJump(Number(b.dataset.jump));
      }
    });
  }

  /* 手機版：單元選單以下拉抽屜開關 */
  function setOpen(open) {
    if (!el) return;
    el.classList.toggle("is-open", open);
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.setAttribute("aria-label", open ? "關閉單元選單" : "開啟單元選單");
    // 抽屜打開後才量得到頁籤位置，重新對齊指示塊
    if (open && currentCh >= 0) gsap.set(indicator, { top: items[currentCh].offsetTop, height: items[currentCh].offsetHeight });
  }

  function update(index, instant) {
    if (index < 1) return;
    const ch = D.slides[index].ch;

    // 頁面小圓點、已完成狀態：立即更新
    items.forEach((it, k) => {
      it.classList.toggle("is-done", k < ch);
      it.querySelectorAll(".tab__dot").forEach((d) => {
        const p = Number(d.dataset.jump);
        d.classList.toggle("is-seen", p < index);
        d.classList.toggle("is-here", p === index);
      });
    });

    // 手機版上方列：目前單元名稱與頁面小圓點
    const chap = D.chapters[ch];
    nowNo.textContent = chap.no;
    nowName.textContent = chap.zh;
    nowDots.innerHTML = pagesOf[ch]
      .map((p) => `<i class="${p === index ? "is-here" : p < index ? "is-seen" : ""}"></i>`)
      .join("");

    // 目前頁籤的底色跟右側頁面一致：章節開場頁（深藍）用深色，其他內容頁用白色
    const tone = D.slides[index].type === "chapter" ? "dark" : "light";
    const setCurrent = () => {
      items.forEach((it, k) => {
        it.classList.toggle("is-current", k === ch);
        // 目前頁籤上下相鄰的頁籤：右端虛線淡出，不會伸進反向圓角
        it.classList.toggle("is-near", Math.abs(k - ch) === 1);
        it.querySelector(".tab__btn").toggleAttribute("aria-current", k === ch);
      });
      el.dataset.tone = tone;
    };

    // 滑動指示塊：只有一個，從舊頁籤「流」到新頁籤 —— 先往目標方向拉長蓋住兩格，再收回到新頁籤
    // 文字顏色與底色在拉到最長（兩格都被蓋住）時才切換，不會出現殘影
    const toTop = items[ch].offsetTop;
    const tabH = items[ch].offsetHeight || 60;
    if (indicatorTl) indicatorTl.kill();
    if (toneCall) toneCall.kill();
    if (instant || currentCh < 0 || window.Motion?.RM) {
      gsap.set(indicator, { top: toTop, height: tabH });
      setCurrent();
    } else if (ch === currentCh) {
      // 同一單元內換頁：指示塊不動，只更新顏色（等新頁面滑進來一半）
      toneCall = gsap.delayedCall(0.45, setCurrent);
    } else {
      const fromTop = parseFloat(indicator.style.top) || items[currentCh].offsetTop;
      const span = Math.abs(toTop - fromTop) + tabH;
      indicatorTl = gsap
        .timeline()
        .to(indicator, { top: Math.min(fromTop, toTop), height: span, duration: 0.38, ease: "power2.in" })
        .add(setCurrent)
        .to(indicator, { top: toTop, height: tabH, duration: 0.55, ease: "elastic.out(0.7, 0.85)" });
    }
    currentCh = ch;
  }

  window.Sidebar = { build, update, setOpen, el: () => el, isOpen: () => !!el && el.classList.contains("is-open") };
})();
