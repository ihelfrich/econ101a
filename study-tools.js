// study-tools.js — Pomodoro + Cmd-K palette + reading progress + section tracker
// Designed to attach to any page on the Econ 101A site.

(function(){
  // ── Reading progress bar ───────────────────────────────
  function bindReadingProgress(){
    const bar = document.getElementById("read-progress-bar") || (() => {
      const wrap = document.createElement("div");
      wrap.className = "read-progress";
      const b = document.createElement("div");
      b.className = "read-progress-bar";
      b.id = "read-progress-bar";
      wrap.appendChild(b);
      document.body.insertBefore(wrap, document.body.firstChild);
      return b;
    })();
    function update(){
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive:true });
    window.addEventListener("resize", update);
    update();
  }

  // ── Dark mode (works on every page) ─────────────────────
  function bindDarkMode(){
    const KEY = "econ101a_dark";
    if(localStorage.getItem(KEY) === "1") document.body.classList.add("dark");
    const btn = document.getElementById("dark-toggle");
    if(btn){
      const sync = () => btn.textContent = document.body.classList.contains("dark") ? "☀ Light" : "☾ Dark";
      sync();
      btn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem(KEY, document.body.classList.contains("dark") ? "1" : "0");
        sync();
      });
    }
  }

  // ── Section progress tracker (index.html only — uses section ids) ──
  function bindSectionTracker(){
    const KEY = "econ101a_studied_v1";
    let studied = JSON.parse(localStorage.getItem(KEY) || "{}");
    const sections = document.querySelectorAll(".section[id]");
    if(sections.length === 0) return;
    sections.forEach(s => {
      const id = s.id;
      const titleEl = s.querySelector(".section-title");
      if(!titleEl) return;
      const btn = document.createElement("button");
      btn.className = "studied-toggle" + (studied[id] ? " on" : "");
      btn.title = "Mark this section as studied";
      btn.innerHTML = studied[id] ? "✓ studied" : "○ mark studied";
      btn.addEventListener("click", () => {
        studied[id] = !studied[id];
        if(!studied[id]) delete studied[id];
        localStorage.setItem(KEY, JSON.stringify(studied));
        btn.classList.toggle("on", !!studied[id]);
        btn.innerHTML = studied[id] ? "✓ studied" : "○ mark studied";
        renderOverallProgress();
        renderSidebarHighlights();
      });
      titleEl.appendChild(btn);
    });

    function renderOverallProgress(){
      const total = sections.length;
      const done = Object.keys(studied).length;
      let el = document.getElementById("overall-progress");
      if(!el){
        el = document.createElement("div");
        el.id = "overall-progress";
        el.className = "overall-progress";
        const logo = document.querySelector(".sidebar-logo");
        if(logo) logo.parentNode.insertBefore(el, logo.nextSibling);
      }
      const pct = total ? Math.round(100*done/total) : 0;
      el.innerHTML = `
        <div class="op-row"><span>${done}/${total} sections</span><span>${pct}%</span></div>
        <div class="op-track"><div class="op-fill" style="width:${pct}%"></div></div>
      `;
    }
    function renderSidebarHighlights(){
      document.querySelectorAll(".sidebar nav a[href^='#']").forEach(a => {
        const id = a.getAttribute("href").slice(1);
        a.classList.toggle("studied", !!studied[id]);
      });
    }
    renderOverallProgress();
    renderSidebarHighlights();
  }

  // ── "You are here" sidebar highlight via IntersectionObserver ──
  function bindSidebarActive(){
    const sections = document.querySelectorAll(".section[id]");
    if(sections.length === 0) return;
    const navLinks = {};
    document.querySelectorAll(".sidebar nav a[href^='#']").forEach(a => {
      navLinks[a.getAttribute("href").slice(1)] = a;
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const id = e.target.id;
        const link = navLinks[id];
        if(!link) return;
        if(e.isIntersecting && e.intersectionRatio > 0.3){
          Object.values(navLinks).forEach(l => l.classList.remove("current"));
          link.classList.add("current");
        }
      });
    }, { rootMargin: "-30% 0px -50% 0px", threshold: [0.3] });
    sections.forEach(s => io.observe(s));
  }

  // ── Pomodoro widget ─────────────────────────────────────
  function buildPomodoro(){
    const KEY = "econ101a_pomo";
    const widget = document.createElement("div");
    widget.className = "pomo-widget";
    widget.innerHTML = `
      <button class="pomo-mini" id="pomo-mini" title="Open Pomodoro timer">
        <span class="pomo-mini-icon">⏱</span><span class="pomo-mini-time" id="pomo-mini-time">25:00</span>
      </button>
      <div class="pomo-panel" id="pomo-panel" hidden>
        <div class="pomo-header">
          <strong>Focus session</strong>
          <button class="pomo-close" id="pomo-close" title="Close">×</button>
        </div>
        <div class="pomo-display" id="pomo-display">25:00</div>
        <div class="pomo-phase" id="pomo-phase">Work · Pomodoro 1</div>
        <div class="pomo-controls">
          <button class="pomo-btn" id="pomo-start">Start</button>
          <button class="pomo-btn" id="pomo-pause" disabled>Pause</button>
          <button class="pomo-btn pomo-btn-ghost" id="pomo-reset">Reset</button>
        </div>
        <div class="pomo-settings">
          <label>Work <input type="number" id="pomo-work" min="5" max="90" value="25" step="5"/> min</label>
          <label>Break <input type="number" id="pomo-break" min="1" max="30" value="5" step="1"/> min</label>
          <label>Long break <input type="number" id="pomo-long" min="5" max="60" value="15" step="5"/> min</label>
        </div>
        <div class="pomo-tips">
          <em>Why 25 min?</em> Long enough for deep focus; short enough that starting feels possible. The break is non-negotiable — consolidation needs idle time.
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    let workMin = 25, breakMin = 5, longMin = 15;
    let phase = "work"; // 'work' | 'break' | 'long'
    let pomoCount = 1;
    let secondsLeft = workMin * 60;
    let timer = null;
    let running = false;

    const display = document.getElementById("pomo-display");
    const mini = document.getElementById("pomo-mini-time");
    const phaseEl = document.getElementById("pomo-phase");
    const startBtn = document.getElementById("pomo-start");
    const pauseBtn = document.getElementById("pomo-pause");

    function fmt(s){ const m = Math.floor(s/60); const r = s%60; return `${m}:${String(r).padStart(2,"0")}`; }
    function render(){
      display.textContent = fmt(secondsLeft);
      mini.textContent = fmt(secondsLeft);
      phaseEl.textContent = phase === "work" ? `Work · Pomodoro ${pomoCount}` : phase === "break" ? "Break — step away" : "Long break — really step away";
      document.body.classList.toggle("pomo-running", running);
    }
    function nextPhase(){
      if(phase === "work"){
        if(pomoCount % 4 === 0){ phase = "long"; secondsLeft = longMin * 60; }
        else { phase = "break"; secondsLeft = breakMin * 60; }
      } else {
        phase = "work";
        if(["break"].includes(phase)){} // no-op
        pomoCount += 1;
        secondsLeft = workMin * 60;
      }
      render();
      try { new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=").play(); } catch(e){}
    }
    function tick(){
      secondsLeft -= 1;
      if(secondsLeft <= 0){
        running = false;
        clearInterval(timer); timer = null;
        startBtn.disabled = false; pauseBtn.disabled = true;
        nextPhase();
        return;
      }
      render();
    }
    startBtn.addEventListener("click", () => {
      if(running) return;
      running = true;
      timer = setInterval(tick, 1000);
      startBtn.disabled = true; pauseBtn.disabled = false;
      render();
    });
    pauseBtn.addEventListener("click", () => {
      running = false;
      if(timer){ clearInterval(timer); timer = null; }
      startBtn.disabled = false; pauseBtn.disabled = true;
      render();
    });
    document.getElementById("pomo-reset").addEventListener("click", () => {
      running = false;
      if(timer){ clearInterval(timer); timer = null; }
      phase = "work"; pomoCount = 1;
      secondsLeft = workMin * 60;
      startBtn.disabled = false; pauseBtn.disabled = true;
      render();
    });
    document.getElementById("pomo-work").addEventListener("change", e => {
      workMin = Math.max(5, parseInt(e.target.value)||25);
      if(phase==="work" && !running) secondsLeft = workMin*60;
      render();
    });
    document.getElementById("pomo-break").addEventListener("change", e => { breakMin = Math.max(1, parseInt(e.target.value)||5); });
    document.getElementById("pomo-long").addEventListener("change", e => { longMin = Math.max(5, parseInt(e.target.value)||15); });
    document.getElementById("pomo-mini").addEventListener("click", () => {
      document.getElementById("pomo-panel").hidden = !document.getElementById("pomo-panel").hidden;
    });
    document.getElementById("pomo-close").addEventListener("click", () => {
      document.getElementById("pomo-panel").hidden = true;
    });
    render();
  }

  // ── Command palette (Cmd-K / Ctrl-K) ────────────────────
  const PALETTE_ITEMS = [
    { label:"Main Guide — Preferences", url:"index.html#preferences", kind:"section" },
    { label:"Main Guide — Utility", url:"index.html#utility", kind:"section" },
    { label:"Main Guide — Marshallian demand (UMP)", url:"index.html#ump", kind:"section" },
    { label:"Main Guide — Duality / Hicksian", url:"index.html#duality", kind:"section" },
    { label:"Main Guide — Slutsky equation", url:"index.html#slutsky", kind:"section" },
    { label:"Main Guide — Elasticity & tax incidence", url:"index.html#elasticity", kind:"section" },
    { label:"Main Guide — Intertemporal choice", url:"index.html#intertemporal", kind:"section" },
    { label:"Main Guide — Risk & EU", url:"index.html#risk", kind:"section" },
    { label:"Main Guide — Production & costs", url:"index.html#costs", kind:"section" },
    { label:"Main Guide — Profit maximization", url:"index.html#profit", kind:"section" },
    { label:"Main Guide — Competitive equilibrium", url:"index.html#competitive", kind:"section" },
    { label:"Main Guide — Monopoly", url:"index.html#monopoly", kind:"section" },
    { label:"Main Guide — Oligopoly & game theory", url:"index.html#oligopoly", kind:"section" },
    { label:"Main Guide — Walrasian GE", url:"index.html#ge", kind:"section" },
    { label:"Main Guide — Robinson Crusoe", url:"index.html#crusoe", kind:"section" },
    { label:"Main Guide — Externalities", url:"index.html#externalities", kind:"section" },
    { label:"Main Guide — Adverse selection", url:"index.html#asyminfo", kind:"section" },
    { label:"Main Guide — Behavioral econ", url:"index.html#behavioral", kind:"section" },
    { label:"Main Guide — Formula bank", url:"index.html#formulas", kind:"section" },
    { label:"Main Guide — Pattern atlas", url:"index.html#atlas", kind:"section" },
    { label:"Main Guide — Downloads", url:"index.html#downloads", kind:"section" },
    { label:"Worked Problems → MT2 P1 Vegetables & Salt", url:"problems.html#p1", kind:"problem" },
    { label:"Worked Problems → MT2 P2 Veblen Good", url:"problems.html#p2", kind:"problem" },
    { label:"Worked Problems → MT2 P3 Omar two-period", url:"problems.html#p3", kind:"problem" },
    { label:"Worked Problems → Slutsky decomposition", url:"problems.html#p4", kind:"problem" },
    { label:"Worked Problems → Walrasian GE", url:"problems.html#p5", kind:"problem" },
    { label:"Worked Problems → CARA risk", url:"problems.html#p6", kind:"problem" },
    { label:"Workshop → Partial derivative clinic", url:"workshop.html#m1", kind:"drill" },
    { label:"Workshop → Quasilinear UMP", url:"workshop.html#m2", kind:"drill" },
    { label:"Workshop → Producer theory chain", url:"workshop.html#m3", kind:"drill" },
    { label:"Workshop → GE with linear utility", url:"workshop.html#m4", kind:"drill" },
    { label:"Workshop → CV three methods", url:"workshop.html#m5", kind:"drill" },
    { label:"Workshop → FWT/SWT T/F drill", url:"workshop.html#m6", kind:"drill" },
    { label:"Flashcards — Spaced repetition deck", url:"flashcards.html", kind:"deck" },
    { label:"Flashcards — Exam traps deck", url:"flashcards.html#traps", kind:"deck" },
    { label:"Toggle dark mode", action:"toggle-dark", kind:"action" },
    { label:"Open Pomodoro timer", action:"pomodoro", kind:"action" },
  ];

  function buildPalette(){
    const wrap = document.createElement("div");
    wrap.className = "palette-wrap";
    wrap.id = "palette-wrap";
    wrap.hidden = true;
    wrap.innerHTML = `
      <div class="palette-backdrop" id="palette-backdrop"></div>
      <div class="palette" role="dialog" aria-label="Command palette">
        <input type="text" id="palette-input" placeholder="Jump to section, problem, drill, flashcard deck…  (Esc to close)" autocomplete="off"/>
        <ul class="palette-list" id="palette-list"></ul>
        <div class="palette-foot">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    const input = document.getElementById("palette-input");
    const list = document.getElementById("palette-list");
    const backdrop = document.getElementById("palette-backdrop");
    let filtered = PALETTE_ITEMS;
    let active = 0;

    function open(){
      wrap.hidden = false;
      input.value = "";
      filtered = PALETTE_ITEMS;
      active = 0;
      render();
      setTimeout(() => input.focus(), 10);
    }
    function close(){ wrap.hidden = true; }
    function render(){
      list.innerHTML = filtered.slice(0, 12).map((item, i) => `
        <li class="palette-item ${i===active?'active':''}" data-i="${i}">
          <span class="palette-kind palette-kind-${item.kind}">${item.kind}</span>
          <span class="palette-label">${escapeHTML(item.label)}</span>
        </li>
      `).join("");
      list.querySelectorAll(".palette-item").forEach(li => {
        li.addEventListener("click", () => choose(parseInt(li.dataset.i)));
      });
    }
    function escapeHTML(s){ return s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
    function filter(q){
      const t = q.toLowerCase().trim();
      if(!t){ filtered = PALETTE_ITEMS; }
      else {
        filtered = PALETTE_ITEMS.filter(item => item.label.toLowerCase().includes(t) || item.kind.includes(t));
      }
      active = 0;
      render();
    }
    function choose(i){
      const item = filtered[i];
      if(!item) return;
      close();
      if(item.url){ window.location.href = item.url; }
      else if(item.action === "toggle-dark"){
        document.getElementById("dark-toggle")?.click();
      } else if(item.action === "pomodoro"){
        const panel = document.getElementById("pomo-panel");
        if(panel) panel.hidden = false;
      }
    }
    input.addEventListener("input", e => filter(e.target.value));
    input.addEventListener("keydown", e => {
      if(e.key === "Escape"){ close(); }
      else if(e.key === "ArrowDown"){ e.preventDefault(); active = Math.min(filtered.length - 1, active + 1); render(); }
      else if(e.key === "ArrowUp"){ e.preventDefault(); active = Math.max(0, active - 1); render(); }
      else if(e.key === "Enter"){ e.preventDefault(); choose(active); }
    });
    backdrop.addEventListener("click", close);

    document.addEventListener("keydown", e => {
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        if(wrap.hidden) open(); else close();
      } else if(e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && wrap.hidden){
        e.preventDefault(); open();
      } else if(e.key === "?" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && wrap.hidden){
        e.preventDefault();
        alert("Keyboard shortcuts:\n\n⌘K  /  Ctrl-K  /  /   open command palette\nspace  flip flashcard\n1-4   rate flashcard (again/hard/good/easy)\n←     previous flashcard\n?     show this help");
      }
    });

    // Affordance pill at bottom-right (in addition to keyboard)
    const pill = document.createElement("button");
    pill.className = "palette-pill";
    pill.innerHTML = `<kbd>⌘</kbd><kbd>K</kbd> jump`;
    pill.title = "Open command palette";
    pill.addEventListener("click", open);
    document.body.appendChild(pill);
  }

  // ── Init ───────────────────────────────────────────────
  function start(){
    bindReadingProgress();
    bindDarkMode();
    bindSectionTracker();
    bindSidebarActive();
    buildPomodoro();
    buildPalette();
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
