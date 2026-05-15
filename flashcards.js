// flashcards.js — Leitner spaced repetition for Econ 101A
// Boxes 1..5. Intervals (days): 0, 2, 4, 8, 16. Wrong → back to box 1.

(function(){
  const STORAGE_KEY = "econ101a_leitner_v1";
  const DAY_MS = 86400000;
  const INTERVALS = { 1:0, 2:2, 3:4, 4:8, 5:16 };

  const deckLabels = {
    consumer:"Consumer", duality:"Duality", slutsky:"Slutsky/CV",
    risk:"Risk", producer:"Producer", markets:"Markets", ge:"GE", traps:"Trap"
  };
  const typeLabels = {
    def:"definition", formula:"formula", theorem:"theorem", pattern:"pattern", trap:"⚠ trap"
  };

  let state = loadState();
  let activeDeck = "all";
  let activeMode = "spaced";
  let queue = [];
  let current = null;
  let history = []; // for "previous"

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return initState();
      const parsed = JSON.parse(raw);
      // Ensure every card in current deck has an entry
      window.FC_DECK.forEach(c => {
        if(!parsed.cards[c.id]){
          parsed.cards[c.id] = { box:1, due:0, lastSeen:0, attempts:0, correct:0 };
        }
      });
      return parsed;
    } catch(e){ return initState(); }
  }
  function initState(){
    const cards = {};
    window.FC_DECK.forEach(c => {
      cards[c.id] = { box:1, due:0, lastSeen:0, attempts:0, correct:0 };
    });
    return { cards, sessionsStarted: 0 };
  }
  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function cardDeck(c){ return c.deck; }

  function buildQueue(){
    const now = Date.now();
    const inDeck = c => activeDeck === "all" || c.deck === activeDeck;
    let pool;
    if(activeMode === "cram"){
      pool = window.FC_DECK.filter(inDeck);
    } else if(activeMode === "weak"){
      pool = window.FC_DECK.filter(c => inDeck(c) && state.cards[c.id].box <= 2);
    } else {
      pool = window.FC_DECK.filter(c => inDeck(c) && state.cards[c.id].due <= now);
    }
    // Shuffle (interleaving > blocking for retention)
    for(let i = pool.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    queue = pool;
  }

  function nextCard(){
    history.push(current);
    if(queue.length === 0){
      current = null;
      renderEmpty();
      return;
    }
    current = queue.shift();
    renderCard();
  }

  function rate(level){
    if(!current) return;
    const s = state.cards[current.id];
    s.attempts += 1;
    s.lastSeen = Date.now();
    if(level === "again"){
      s.box = 1;
    } else if(level === "hard"){
      s.box = Math.max(1, s.box); // stay
      s.correct += 1;
    } else if(level === "good"){
      s.box = Math.min(5, s.box + 1);
      s.correct += 1;
    } else if(level === "easy"){
      s.box = Math.min(5, s.box + 2);
      s.correct += 1;
    }
    s.due = Date.now() + INTERVALS[s.box] * DAY_MS;
    saveState();
    renderStats();
    nextCard();
  }

  function renderCard(){
    document.getElementById("fc-empty").hidden = true;
    document.getElementById("fc-card").hidden = false;
    const s = state.cards[current.id];
    document.getElementById("fc-deck-badge").textContent = deckLabels[current.deck] || current.deck;
    document.getElementById("fc-deck-badge").dataset.deck = current.deck;
    document.getElementById("fc-box-badge").textContent = "Box " + s.box;
    document.getElementById("fc-box-badge").dataset.box = s.box;
    document.getElementById("fc-type-badge").textContent = typeLabels[current.type] || current.type;
    document.getElementById("fc-type-badge").dataset.type = current.type;
    document.getElementById("fc-card-front").innerHTML = current.front;
    document.getElementById("fc-card-back").innerHTML = current.back;
    document.getElementById("fc-card-back").hidden = true;
    document.getElementById("fc-card-actions").hidden = false;
    document.getElementById("fc-card-rate").hidden = true;
    if(window.MathJax && MathJax.typesetPromise){
      MathJax.typesetPromise([document.getElementById("fc-card")]);
    }
  }
  function flip(){
    document.getElementById("fc-card-back").hidden = false;
    document.getElementById("fc-card-actions").hidden = true;
    document.getElementById("fc-card-rate").hidden = false;
    if(window.MathJax && MathJax.typesetPromise){
      MathJax.typesetPromise([document.getElementById("fc-card-back")]);
    }
  }
  function renderEmpty(){
    document.getElementById("fc-card").hidden = true;
    document.getElementById("fc-empty").hidden = false;
  }
  function renderStats(){
    const now = Date.now();
    let due = 0, known = 0, learning = 0, total = 0;
    const boxCounts = {1:0,2:0,3:0,4:0,5:0};
    window.FC_DECK.forEach(c => {
      if(activeDeck !== "all" && c.deck !== activeDeck) return;
      total += 1;
      const s = state.cards[c.id];
      boxCounts[s.box] += 1;
      if(s.due <= now) due += 1;
      if(s.box === 5) known += 1;
      if(s.box <= 2) learning += 1;
    });
    document.getElementById("stat-due").textContent = due;
    document.getElementById("stat-known").textContent = known;
    document.getElementById("stat-learning").textContent = learning;
    document.getElementById("stat-total").textContent = total;
    for(let i=1;i<=5;i++) document.getElementById("bx"+i).textContent = boxCounts[i];
    // weighted mastery: each box contributes (box-1)/4
    let mastered = 0;
    for(let i=1;i<=5;i++) mastered += boxCounts[i] * (i-1) / 4;
    const pct = total ? Math.round(100 * mastered / total) : 0;
    document.getElementById("fc-progress-fill").style.width = pct + "%";
    document.getElementById("fc-progress-fill").textContent = pct ? pct + "% mastered" : "";
  }

  function setDeck(deck){
    activeDeck = deck;
    document.querySelectorAll(".deck-link").forEach(a => {
      a.classList.toggle("active", a.dataset.deck === deck);
    });
    buildQueue();
    renderStats();
    nextCard();
  }
  function setMode(mode){
    activeMode = mode;
    document.querySelectorAll(".mode-link").forEach(a => {
      a.classList.toggle("active", a.dataset.mode === mode);
    });
    buildQueue();
    nextCard();
  }
  function prev(){
    if(history.length === 0) return;
    const last = history.pop();
    if(!last) return;
    if(current) queue.unshift(current);
    current = last;
    renderCard();
  }

  function bind(){
    document.querySelectorAll(".deck-link").forEach(a => {
      a.addEventListener("click", e => { e.preventDefault(); setDeck(a.dataset.deck); });
    });
    document.querySelectorAll(".mode-link").forEach(a => {
      a.addEventListener("click", e => { e.preventDefault(); setMode(a.dataset.mode); });
    });
    document.querySelectorAll("[data-mode]").forEach(a => {
      if(!a.classList.contains("mode-link")){
        a.addEventListener("click", e => { e.preventDefault(); setMode(a.dataset.mode); });
      }
    });
    document.getElementById("fc-flip").addEventListener("click", flip);
    document.querySelectorAll("#fc-card-rate .fc-btn").forEach(b => {
      b.addEventListener("click", () => rate(b.dataset.rate));
    });
    const reset = document.getElementById("fc-reset-progress");
    if(reset) reset.addEventListener("click", () => {
      if(confirm("Reset all spaced-repetition progress? This wipes box assignments and review dates.")){
        state = initState();
        saveState();
        buildQueue();
        renderStats();
        nextCard();
      }
    });
    document.addEventListener("keydown", e => {
      if(e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const backHidden = document.getElementById("fc-card-back").hidden;
      if(e.key === " "){
        e.preventDefault();
        if(backHidden) flip();
      } else if(!backHidden && ["1","2","3","4"].includes(e.key)){
        const map = {"1":"again","2":"hard","3":"good","4":"easy"};
        rate(map[e.key]);
      } else if(e.key === "ArrowLeft"){
        prev();
      }
    });
  }

  function start(){
    bind();
    buildQueue();
    renderStats();
    nextCard();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
