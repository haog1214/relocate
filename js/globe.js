/* =========================================================
   globe.js — 封面地球儀（地圖只出現在封面）
   線框地球：正面實心陸地＋經緯線，背面陸地與經緯線以淡色透視
   航線：TAIWAN（台中）→ THAILAND（曼谷），英文標示
   依賴：d3-geo、topojson-client、data/world.js
   ========================================================= */
(function () {
  const W = window.WORLD_TOPO;
  if (!W || !window.d3 || !window.topojson) return;

  const SIZE = 760;
  const R = 330;
  const C = SIZE / 2;
  // 最終視角中心（經度、緯度）：地球儀只露出左上 3/4，
  // 視角中心放在台灣東南方的太平洋，台灣與泰國才會落在可見的左上區域
  const FINAL = [140, 0];
  const START = [FINAL[0] - 150, 5]; // 進場起始視角：從大西洋一側轉過來
  const TAICHUNG = [120.68, 24.15];
  const BANGKOK = [100.5, 13.75];

  const feats = topojson.feature(W, W.objects.countries).features;
  const fc = (list) => ({ type: "FeatureCollection", features: list });
  const all = fc(feats);
  const others = fc(feats.filter((f) => f.id !== "764" && f.id !== "158"));
  const thailand = fc(feats.filter((f) => f.id === "764"));
  const taiwan = fc(feats.filter((f) => f.id === "158"));
  const grid = d3.geoGraticule().step([15, 15])();

  // 正面：一般正射投影；背面：以對蹠點為中心再左右鏡射，得到「透過球體看到背面」的位置
  const front = d3.geoOrthographic().scale(R).translate([C, C]).clipAngle(90).precision(0.4);
  const back = d3.geoOrthographic().scale(R).translate([C, C]).clipAngle(90).precision(0.4).reflectX(true);
  const pf = d3.geoPath(front);
  const pb = d3.geoPath(back);

  let el = null;
  const $ = (s) => el.svg.querySelector(s);

  function mount(host) {
    host.innerHTML = `
      <svg class="route globe" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" aria-hidden="true">
        <circle class="globe__orbit route__globe" cx="${C}" cy="${C}" r="${R + 32}"/>
        <circle class="globe__sphere" cx="${C}" cy="${C}" r="${R}"/>
        <path class="globe__back"/>
        <path class="globe__grid globe__grid--back"/>
        <path class="globe__land"/>
        <path class="globe__land globe__land--tw"/>
        <path class="globe__land globe__land--th"/>
        <path class="globe__grid globe__grid--front"/>
        <circle class="globe__rim" cx="${C}" cy="${C}" r="${R}"/>
        <path class="route__arc route__arc--move draw"/>
        <!-- 外層 g 負責定位（隨地球轉動），內層 g 負責彈出動畫，避免 transform 互相覆蓋 -->
        <g data-pt="tw">
          <g class="route__pt fx-pop">
            <circle r="7" class="pt pt--from"/>
            <text x="16" y="-4" class="pt__label pt__label--from">TAIWAN</text>
            <text x="16" y="15" class="pt__sub">TAICHUNG</text>
          </g>
        </g>
        <g data-pt="th">
          <g class="route__pt fx-pop">
            <circle r="20" class="pulse"/>
            <circle r="9" class="pt pt--new"/>
            <text x="-18" y="34" text-anchor="end" class="pt__label pt__label--new">THAILAND</text>
            <text x="-18" y="54" text-anchor="end" class="pt__sub">BANGKOK</text>
          </g>
        </g>
      </svg>`;
    el = { svg: host.querySelector("svg") };
    el.back = $(".globe__back");
    el.gridBack = $(".globe__grid--back");
    el.land = $(".globe__land:not(.globe__land--tw):not(.globe__land--th)");
    el.tw = $(".globe__land--tw");
    el.th = $(".globe__land--th");
    el.gridFront = $(".globe__grid--front");
    el.arc = $(".route__arc");
    el.ptTw = $('[data-pt="tw"]');
    el.ptTh = $('[data-pt="th"]');
    draw(FINAL[0], FINAL[1]);
    bindHover();
  }

  let view = [FINAL[0], FINAL[1]]; // 目前視角

  function draw(lon, lat) {
    if (!el) return;
    view = [lon, lat];
    front.rotate([-lon, -lat]);
    back.rotate([-(lon + 180), lat]);
    el.back.setAttribute("d", pb(all) || "");
    el.gridBack.setAttribute("d", pb(grid) || "");
    el.land.setAttribute("d", pf(others) || "");
    el.tw.setAttribute("d", pf(taiwan) || "");
    el.th.setAttribute("d", pf(thailand) || "");
    el.gridFront.setAttribute("d", pf(grid) || "");

    const [tx, ty] = front(TAICHUNG);
    const [bx, by] = front(BANGKOK);
    el.ptTw.setAttribute("transform", `translate(${tx.toFixed(1)} ${ty.toFixed(1)})`);
    el.ptTh.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
    const qx = (tx + bx) / 2 - 10; // 弧線往左上拱起
    const qy = Math.min(ty, by) - 70;
    el.arc.setAttribute("d", `M${tx.toFixed(1)} ${ty.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);

    // 轉到背面時隱藏標記與航線（距視角中心超過 90° 即在背面）
    const center = [lon, lat];
    const twBack = d3.geoDistance(TAICHUNG, center) > Math.PI / 2 - 0.05;
    const thBack = d3.geoDistance(BANGKOK, center) > Math.PI / 2 - 0.05;
    el.ptTw.style.visibility = twBack ? "hidden" : "";
    el.ptTh.style.visibility = thBack ? "hidden" : "";
    el.arc.style.opacity = twBack || thBack ? "0" : "";
  }

  /* 持續水平自轉（繞地軸由西向東轉），滑鼠移到地球上時停止，移開後繼續 */
  const SPEED = 360 / 40; // 每秒幾度：40 秒轉一圈
  let spinning = false;
  let hover = false;
  let intro = false; // 進場轉動期間不自轉
  function tick(time, deltaTime) {
    if (!spinning || hover || intro) return;
    if (window.Nav && Nav.current !== 0) return; // 不在封面時不轉，省效能
    let lon = view[0] - SPEED * (deltaTime / 1000);
    if (lon < -180) lon += 360;
    draw(lon, view[1]);
  }
  function startAutoRotate() {
    if (!el) return;
    // 航線畫完後移除虛線設定，弧線長度隨轉動改變時才不會被截斷
    gsap.set(el.arc, { clearProps: "strokeDasharray,strokeDashoffset,visibility" });
    if (spinning) return;
    spinning = true;
    gsap.ticker.add(tick);
  }
  // 只有滑鼠真的在「球體」上才停止（不是整個方形範圍），其他時候持續自轉
  function bindHover() {
    const sphere = $(".globe__sphere");
    sphere.addEventListener("mouseenter", () => (hover = true));
    sphere.addEventListener("mouseleave", () => (hover = false));
  }

  /* 轉回初始視角（NEW BASE THAILAND 按鈕）：走最短的方向轉回去，停 3 秒後再繼續自轉 */
  let resetTween = null;
  let holdCall = null;
  function resetView() {
    if (!el) return;
    if (resetTween) resetTween.kill();
    if (holdCall) holdCall.kill();
    const o = { lon: view[0], lat: view[1] };
    const d = ((((FINAL[0] - o.lon) % 360) + 540) % 360) - 180; // 最短轉動角度
    intro = true;
    resetTween = gsap.to(o, {
      lon: o.lon + d,
      lat: FINAL[1],
      duration: 1.4,
      ease: "power3.inOut",
      onUpdate: () => draw(o.lon, o.lat),
      onComplete: () => {
        draw(FINAL[0], FINAL[1]);
        holdCall = gsap.delayedCall(3, () => (intro = false));
      },
    });
  }
  const badge = document.querySelector(".cover__badge");
  if (badge) badge.addEventListener("click", resetView);

  /* 進場：地球從大西洋一側轉到亞洲 */
  function spinIn(duration = 2.4) {
    const o = { lon: START[0], lat: START[1] };
    intro = true;
    draw(o.lon, o.lat);
    return gsap.to(o, {
      lon: FINAL[0],
      lat: FINAL[1],
      duration,
      ease: "power3.out",
      onUpdate: () => draw(o.lon, o.lat),
      onComplete: () => (intro = false),
    });
  }

  window.Globe = { mount, draw, spinIn, startAutoRotate, resetView, FINAL };
})();
