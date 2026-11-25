/* =========================================================
   render.js — 依 data/slides.js 產生第 2 頁以後的頁面
   ========================================================= */
(function () {
  const D = window.DECK;
  const TOTAL = D.slides.length;
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const owner = (s) => s.owner || (D.chapters[s.ch] && D.chapters[s.ch].owner) || "未指定";
  const topic = (s) => s.title || (D.chapters[s.ch] && D.chapters[s.ch].zh) || "";

  /* ---------- 共用片段 ---------- */
  const bar = (w, cls = "") => `<span class="bar fx-grow ${cls}" style="width:${w}px"></span>`;

  function heading(s, i) {
    const ch = D.chapters[s.ch];
    return `
      <header class="head">
        <p class="t-label head__label fx">CHAPTER ${ch.no}<span class="head__sep"></span>P.${pad(i + 1)}</p>
        <h1 class="t-h1 split">${esc(s.en)}</h1>
        <h2 class="t-h2 split">${esc(s.title)}</h2>
      </header>`;
  }

  function glass(s, i, dark) {
    const ch = D.chapters[s.ch];
    const name = owner(s);
    const long = [...name].length > 4 ? " glass__name--long" : "";
    return `
      <aside class="glass${dark ? " glass--dark" : ""}" aria-label="本頁負責人：${esc(owner(s))}">
        <div class="glass__sheen"></div>
        <div class="glass__top">
          <span class="t-label">PAGE <b class="num">${pad(i + 1)}</b> / ${TOTAL}</span>
          <span class="t-label">CH.${ch.no} ${esc(ch.en)}</span>
        </div>
        <div class="glass__body">
          <p class="t-label glass__role">IN CHARGE<span class="glass__role-zh">負責人</span></p>
          <p class="glass__name${long} split">${esc(name)}</p>
        </div>
        <div class="glass__foot">
          <div>
            <p class="glass__topic-label">本頁主題</p>
            <p class="glass__topic">${esc(topic(s))}</p>
          </div>
          <span class="status"><i></i>內容製作中</span>
        </div>
      </aside>`;
  }

  function blobs(i, dark) {
    // 每頁位置略有不同，讓霧面玻璃後方有不一樣的色彩
    const v = i % 3;
    const pos = [
      ["1180px 420px", "1460px 760px"],
      ["1320px 360px", "1050px 820px"],
      ["1050px 440px", "1420px 820px"],
    ][v];
    const [a, b] = pos;
    const [ax, ay] = a.split(" ");
    const [bx, by] = b.split(" ");
    return `
      <div class="blob ${dark ? "blob--red" : "blob--navy"}" style="left:${ax};top:${ay}" aria-hidden="true"></div>
      <div class="blob ${dark ? "blob--sky" : "blob--red"} blob--s" style="left:${bx};top:${by}" aria-hidden="true"></div>`;
  }

  const ghost = (word) => `<div class="ghost-word" aria-hidden="true">${esc(word)}</div>`;

  /* ---------- 各頁型的示意內容（霧面玻璃後方） ---------- */
  const PH = {
    stats() {
      const cards = [
        { to: 25, dec: 0, unit: "%", tone: "neg", arrow: "↑" },
        { to: 46, dec: 0, unit: "%", tone: "pos", arrow: "↓" },
        { to: 18.5, dec: 1, unit: "M", tone: "pos", arrow: "↑" },
      ];
      return `<div class="ph ph-stats">${cards
        .map(
          (c, k) => `
        <div class="stat-card stat-card--${c.tone} fx">
          <span class="stat-card__bar fx-grow"></span>
          <p class="t-label stat-card__tag">示意數據 0${k + 1}</p>
          <p class="t-stat num"><span class="count" data-to="${c.to}" data-dec="${c.dec}">0</span><small>${c.unit}</small><em>${c.arrow}</em></p>
          ${bar(260)}${bar(180)}
        </div>`
        )
        .join("")}</div>`;
    },

    statement() {
      return `
        <div class="ph ph-statement">
          <span class="ph-statement__quote fx" aria-hidden="true">“</span>
          <div class="ph-statement__lines">${bar(620, "bar--thick")}${bar(560, "bar--thick")}${bar(420, "bar--thick")}</div>
          <div class="ph-statement__num fx-pop"><span class="num count" data-to="3" data-dec="0">0</span><small>KEY POINTS</small></div>
        </div>`;
    },

    compare() {
      const rows = [0, 1, 2, 3, 4];
      return `
        <div class="ph compare-table fx">
          <div class="compare-table__row compare-table__row--head">
            <span>ITEM</span><span>BEFORE</span><span>AFTER · TH</span><span>DIFF</span>
          </div>
          ${rows
            .map(
              (r) => `
          <div class="compare-table__row">
            <span>${bar(140 + (r % 2) * 40)}</span>
            <span>${bar(120, "bar--gray")}</span>
            <span>${bar(150, "bar--navy")}</span>
            <span class="diff ${r % 3 === 1 ? "diff--neg" : "diff--pos"}">${r % 3 === 1 ? "↑" : "↓"} ${bar(60, r % 3 === 1 ? "bar--red" : "bar--navy")}</span>
          </div>`
            )
            .join("")}
        </div>`;
    },

    timeline() {
      const phases = ["評估", "選址", "建廠", "試產", "量產"];
      return `
        <div class="ph timeline">
          <div class="timeline__axis"><span class="timeline__done fx-grow"></span></div>
          ${phases
            .map(
              (p, k) => `
            <div class="timeline__node ${k === 2 ? "is-current" : k < 2 ? "is-done" : ""} fx" style="left:${k * 25}%">
              <span class="t-label timeline__phase">PHASE ${pad(k + 1)}</span>
              <span class="timeline__dot"></span>
              <span class="t-h3 timeline__name">${p}</span>
              ${bar(150)}
            </div>`
            )
            .join("")}
        </div>`;
    },

    qa() {
      return `
        <div class="ph qa">
          ${[0, 1, 2, 3]
            .map(
              (k) => `
          <div class="qa__item ${k === 0 ? "is-open" : ""} fx">
            <div class="qa__q"><span class="qa__mark">Q</span>${bar(420 - k * 40)}<span class="qa__toggle">${k === 0 ? "−" : "+"}</span></div>
            ${k === 0 ? `<div class="qa__a"><span class="qa__mark qa__mark--a">A</span><div>${bar(560)}${bar(480)}</div></div>` : ""}
          </div>`
            )
            .join("")}
        </div>`;
    },

    closing() {
      return `
        <div class="ph ph-closing">
          ${[1, 2, 3]
            .map(
              (k) => `
          <div class="ph-closing__pt fx">
            <span class="num ph-closing__no">${pad(k)}</span>
            <div>${bar(380, "bar--thick")}${bar(300)}</div>
          </div>`
            )
            .join("")}
          <div class="badge-circle badge-circle--red ph-closing__badge fx-pop"><span class="t-label">DECISION</span><strong>GO</strong></div>
        </div>`;
    },
  };

  /* ---------- 頁面組裝 ---------- */
  function chapterSlide(s, i) {
    const ch = D.chapters[s.ch];
    return `
      <div class="chapter__no" aria-hidden="true">${ch.no}</div>
      ${blobs(i, true)}
      <div class="chapter__text">
        <p class="t-label chapter__label fx">CHAPTER ${ch.no}</p>
        <h1 class="t-display split">${esc(ch.en)}</h1>
        <h2 class="t-h2 split">${esc(ch.zh)}</h2>
        <p class="t-lead chapter__lead fx">${esc(s.lead || "")}</p>
      </div>
      ${glass(s, i, true)}`;
  }

  function endSlide(s, i) {
    return `
      ${ghost(s.ghost || "THANKS")}
      ${blobs(i, false)}
      <div class="end__text">
        <p class="t-label head__label fx">FIN.<span class="head__sep"></span>P.${pad(i + 1)}</p>
        <h1 class="t-display split">${esc(s.en)}</h1>
        <h2 class="t-h2 split">${esc(s.title)}</h2>
        <p class="t-lead end__lead fx">Q &amp; A</p>
      </div>
      ${glass(s, i, false)}`;
  }

  function contentSlide(s, i) {
    const ph = PH[s.type] ? PH[s.type]() : "";
    return `
      ${ghost(s.ghost || s.en)}
      ${blobs(i, false)}
      ${heading(s, i)}
      ${ph}
      ${glass(s, i, false)}
      <p class="source fx">資料來源：待補（示意畫面）</p>`;
  }

  function build() {
    const host = document.getElementById("slides");
    const wipe = document.getElementById("wipe");
    const frag = document.createDocumentFragment();

    D.slides.forEach((s, i) => {
      if (i === 0) return; // 封面寫在 index.html
      const el = document.createElement("section");
      el.className = `slide slide--${s.type}`;
      el.dataset.index = i;
      el.dataset.chapter = s.ch;
      el.setAttribute("aria-label", `第 ${i + 1} 頁，共 ${TOTAL} 頁：${topic(s)}`);
      el.innerHTML =
        s.type === "chapter" ? chapterSlide(s, i) : s.type === "end" ? endSlide(s, i) : contentSlide(s, i);
      frag.appendChild(el);
    });
    host.insertBefore(frag, wipe);

    // 封面地球儀
    const slot = document.querySelector("#cover .globe-slot");
    if (slot && window.Globe) Globe.mount(slot); // 見 js/globe.js

    splitText(document);
  }

  /* 拆字：英文以字母、中文以單字為單位 */
  function splitText(root) {
    root.querySelectorAll(".split").forEach((el) => {
      if (el.dataset.split) return;
      const text = el.textContent;
      el.setAttribute("aria-label", text);
      el.innerHTML = [...text]
        .map((c) => (c === " " ? `<span class="ch ch--sp" aria-hidden="true">&nbsp;</span>` : `<span class="ch" aria-hidden="true">${esc(c)}</span>`))
        .join("");
      el.dataset.split = "1";
    });
  }

  window.Render = { build, TOTAL, topic };
})();
