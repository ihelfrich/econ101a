/* ============================================================
   Econ 101A Interactive Guide — app.js
   ============================================================ */

// ── Tier tab switching ────────────────────────────────────────
function switchTier(btn) {
  const tier  = btn.getAttribute('data-tier');
  const group = btn.getAttribute('data-group');
  const section = btn.closest('.section');
  // Deactivate all tabs/panels in this group
  section.querySelectorAll(`.tier-tab[data-group="${group}"]`).forEach(t => t.classList.remove('active'));
  section.querySelectorAll(`.tier-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
  // Activate selected
  btn.classList.add('active');
  const target = section.querySelector(`.tier-panel[data-group="${group}"][data-tier="${tier}"]`);
  if (target) target.classList.add('active');
  if (window.MathJax) MathJax.typesetPromise();
}

// ── Dark mode toggle ──────────────────────────────────────────
function initDarkMode() {
  const btn = document.getElementById('dark-toggle');
  if (!btn) return;
  // Persist across reloads
  if (localStorage.getItem('darkMode') === '1') document.body.classList.add('dark');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark') ? '1' : '0');
  });
}

// ── Scroll reveal (Intersection Observer) ─────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.section').forEach(s => obs.observe(s));
}

// ── Active sidebar link on scroll ────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.sidebar a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) current = s.id; });
    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) a.classList.add('active');
    });
  }, { passive: true });
}

// ── Slider helper ─────────────────────────────────────────────
function wireSlider(id, onChange) {
  const el   = document.getElementById(id);
  if (!el) return;
  const disp = document.getElementById(id + '-v');
  if (disp) disp.textContent = parseFloat(el.value).toFixed(2).replace(/\.?0+$/, '') || el.value;
  el.addEventListener('input', () => {
    const val = parseFloat(el.value);
    if (disp) disp.textContent = isNaN(val) ? el.value : (val % 1 === 0 ? val : val.toFixed(2));
    onChange();
  });
}

function sliderVal(id) { return parseFloat(document.getElementById(id)?.value ?? 0); }

// ── Hero Three.js sliders ────────────────────────────────────
function initHeroSliders() {
  function updateThree() {
    if (typeof window._three_updateSurface === 'function') {
      window._three_updateSurface(
        sliderVal('h-alpha'),
        sliderVal('h-px'),
        1,                   // py fixed at 1
        sliderVal('h-m')
      );
    }
  }
  wireSlider('h-alpha', updateThree);
  wireSlider('h-px',    updateThree);
  wireSlider('h-m',     updateThree);
}

// ── Budget / IC sliders ───────────────────────────────────────
function initBudgetICSliders() {
  function update() {
    if (typeof window._budgetIC_update === 'function') {
      window._budgetIC_update(
        sliderVal('bic-alpha'),
        sliderVal('bic-m'),
        sliderVal('bic-px'),
        sliderVal('bic-py')
      );
    }
  }
  ['bic-alpha', 'bic-m', 'bic-px', 'bic-py'].forEach(id => wireSlider(id, update));
}

// ── Slutsky animation sliders ─────────────────────────────────
function initSlutskySliders() {
  function update() {
    if (typeof window._slutsky_update === 'function') {
      window._slutsky_update(
        sliderVal('sl2-alpha'),
        sliderVal('sl2-m'),
        sliderVal('sl2-py'),
        sliderVal('sl2-px0'),
        sliderVal('sl2-px1')
      );
    }
  }
  ['sl2-alpha', 'sl2-m', 'sl2-py', 'sl2-px0', 'sl2-px1'].forEach(id => wireSlider(id, update));
}

// ── Edgeworth box sliders ─────────────────────────────────────
function initEdgeworthSliders() {
  function update() {
    if (typeof window._edgeworth_update === 'function') {
      window._edgeworth_update(
        sliderVal('ew-aA'),
        sliderVal('ew-aB'),
        sliderVal('ew-wx'),
        sliderVal('ew-wy')
      );
    }
  }
  ['ew-aA', 'ew-aB', 'ew-wx', 'ew-wy'].forEach(id => wireSlider(id, update));
}

// ── Supply-Demand / Tax sliders ───────────────────────────────
function initSupplyDemandSliders() {
  function update() {
    if (typeof window._supplyDemand_update === 'function') {
      window._supplyDemand_update(
        sliderVal('sd-a'),
        sliderVal('sd-b'),
        sliderVal('sd-s'),
        sliderVal('sd-t')
      );
    }
  }
  ['sd-a', 'sd-b', 'sd-s', 'sd-t'].forEach(id => wireSlider(id, update));
}

// ── Cournot sliders ───────────────────────────────────────────
function initCournotSliders() {
  function update() {
    if (typeof window._cournot_update === 'function') {
      window._cournot_update(
        sliderVal('co2-a'),
        sliderVal('co2-b'),
        sliderVal('co2-c')
      );
    }
  }
  ['co2-a', 'co2-b', 'co2-c'].forEach(id => wireSlider(id, update));
}

// ── Format numbers ────────────────────────────────────────────
function fmt(n, dp = 4) {
  if (!isFinite(n)) return 'undefined';
  return parseFloat(n.toFixed(dp)).toString();
}

// ── Calculator: Cobb-Douglas Demand ──────────────────────────
function calcCobbDouglas() {
  const alpha = parseFloat(document.getElementById('cd-alpha').value);
  const m     = parseFloat(document.getElementById('cd-m').value);
  const px    = parseFloat(document.getElementById('cd-px').value);
  const py    = parseFloat(document.getElementById('cd-py').value);
  if ([alpha,m,px,py].some(isNaN) || px<=0 || py<=0 || m<=0 || alpha<=0 || alpha>=1) {
    showResult('cd-result', '⚠ Please enter valid positive values with 0 < α < 1.');
    return;
  }
  const xstar = alpha * m / px;
  const ystar = (1 - alpha) * m / py;
  const u     = Math.pow(xstar, alpha) * Math.pow(ystar, 1 - alpha);
  const v     = m * Math.pow(alpha, alpha) * Math.pow(1 - alpha, 1 - alpha) / (Math.pow(px, alpha) * Math.pow(py, 1 - alpha));
  const e     = u * Math.pow(px, alpha) * Math.pow(py, 1 - alpha) / (Math.pow(alpha, alpha) * Math.pow(1 - alpha, 1 - alpha));

  showResult('cd-result',
    `<strong>Marshallian demands:</strong><br>
    $x^*(p_x,p_y,m) = \\frac{\\alpha m}{p_x} = \\frac{${alpha}\\cdot${m}}{${px}} = ${fmt(xstar)}$<br>
    $y^*(p_x,p_y,m) = \\frac{(1-\\alpha)m}{p_y} = \\frac{${1-alpha}\\cdot${m}}{${py}} = ${fmt(ystar)}$<br><br>
    <strong>Spending shares:</strong> $p_x x^* = ${fmt(px*xstar)}$ (${(alpha*100).toFixed(0)}% of income), $p_y y^* = ${fmt(py*ystar)}$ (${((1-alpha)*100).toFixed(0)}% of income)<br>
    <strong>Utility achieved:</strong> $u = ${fmt(u)}$<br>
    <strong>Indirect utility:</strong> $v(p,m) = ${fmt(v)}$<br>
    <strong>Expenditure to achieve $u$:</strong> $e(p,u) = ${fmt(e)}$ ✓ (equals $m = ${m}$)`
  );
}

// ── Calculator: Slutsky Decomposition ────────────────────────
function calcSlutsky() {
  const alpha = parseFloat(document.getElementById('sl-alpha').value);
  const m     = parseFloat(document.getElementById('sl-m').value);
  const py    = parseFloat(document.getElementById('sl-py').value);
  const px0   = parseFloat(document.getElementById('sl-px0').value);
  const px1   = parseFloat(document.getElementById('sl-px1').value);
  if ([alpha,m,py,px0,px1].some(isNaN)) { showResult('sl-result','⚠ Invalid inputs.'); return; }

  const x0 = alpha * m / px0;
  const x1 = alpha * m / px1;
  const TE  = x1 - x0;

  const y0  = (1 - alpha) * m / py;
  const u0  = Math.pow(x0, alpha) * Math.pow(y0, 1 - alpha);

  const kappa = Math.pow(alpha, alpha) * Math.pow(1 - alpha, 1 - alpha);
  const e_new = u0 * Math.pow(px1, alpha) * Math.pow(py, 1 - alpha) / kappa;

  const xH  = alpha * e_new / px1;
  const SE  = xH - x0;
  const IE  = x1 - xH;

  showResult('sl-result',
    `<strong>Initial:</strong> $x^* = ${fmt(x0)}$, $y^* = ${fmt(y0)}$, $u_0 = ${fmt(u0)}$<br>
    <strong>Final (Marshallian):</strong> $x^* = ${fmt(x1)}$<br><br>
    <strong>Total Effect (TE):</strong> $${fmt(TE)}$<br>
    <strong>Compensated income:</strong> $m' = e(p_x^1, p_y, u_0) = ${fmt(e_new)}$<br>
    <strong>Hicksian demand at new prices:</strong> $h_x = ${fmt(xH)}$<br><br>
    <strong>Substitution Effect (SE):</strong> $${fmt(SE)}$ (always ≤ 0 ✓)<br>
    <strong>Income Effect (IE):</strong> $${fmt(IE)}$<br>
    <strong>Check: SE + IE =</strong> $${fmt(SE)} + ${fmt(IE)} = ${fmt(SE+IE)}$ ≈ TE = $${fmt(TE)}$ ✓<br>
    <em>${IE < 0 ? 'Normal good: IE reinforces SE.' : IE > 0 ? 'Inferior good: IE offsets SE.' : 'Zero income effect (quasilinear).'}</em>`
  );
}

// ── Calculator: Tax Incidence ─────────────────────────────────
function calcTaxIncidence() {
  const es = parseFloat(document.getElementById('ti-es').value);
  const ed = parseFloat(document.getElementById('ti-ed').value);
  const t  = parseFloat(document.getElementById('ti-t').value);
  if ([es,ed,t].some(isNaN) || es <= 0 || ed >= 0) {
    showResult('ti-result','⚠ Supply elasticity must be > 0, demand elasticity must be < 0.');
    return;
  }
  const consShare = es / (es - ed);
  const prodShare = -ed / (es - ed);
  const dpc = consShare * t;
  const dpp = prodShare * t;

  showResult('ti-result',
    `<strong>Formula:</strong> $dp^*/dt = \\varepsilon_S / (\\varepsilon_S - \\varepsilon_D)$<br><br>
    <strong>Consumer bears:</strong> ${(consShare*100).toFixed(1)}% → price rises by $${fmt(dpc,2)}$<br>
    <strong>Producer bears:</strong> ${(prodShare*100).toFixed(1)}% → net price falls by $${fmt(dpp,2)}$<br>
    <strong>Total tax:</strong> $${fmt(dpc+dpp,2)} = ${t}$ ✓<br><br>
    <em>${consShare > 0.5 ? 'Consumers bear more (demand more inelastic).' : consShare < 0.5 ? 'Producers bear more (supply more inelastic).' : 'Tax split 50/50 (equal elasticities).'}</em>`
  );
}

// ── Calculator: Euler Equation (Log Utility) ─────────────────
function calcEuler() {
  const beta = parseFloat(document.getElementById('eu-beta').value);
  const r    = parseFloat(document.getElementById('eu-r').value);
  const W    = parseFloat(document.getElementById('eu-w').value);
  if ([beta,r,W].some(isNaN) || beta<=0 || beta>1 || W<=0) {
    showResult('eu-result','⚠ Invalid inputs.'); return;
  }
  const ratio = beta * (1 + r);
  const c0 = W / (1 + beta);
  const c1 = ratio * c0;

  showResult('eu-result',
    `<strong>Euler equation:</strong> $u'(c_0) = \\beta(1+r)u'(c_1)$ → $c_1/c_0 = ${fmt(ratio,4)}$<br><br>
    <strong>Optimal $c_0$:</strong> $${fmt(c0,4)}$<br>
    <strong>Optimal $c_1$:</strong> $${fmt(c1,4)}$<br>
    <strong>Check PV:</strong> $c_0 + c_1/(1+r) = ${fmt(c0 + c1/(1+r), 4)} \\approx ${W}$ ✓<br><br>
    <em>${ratio > 1 ? 'β(1+r) > 1: consumption grows — save today.' : ratio < 1 ? 'β(1+r) < 1: consumption falls — spend today.' : 'β(1+r) = 1: flat consumption profile.'}</em>`
  );
}

// ── Calculator: CARA Certainty Equivalent ────────────────────
function calcCARA() {
  const gamma  = parseFloat(document.getElementById('cara-g').value);
  const W0     = parseFloat(document.getElementById('cara-w0').value);
  const mu     = parseFloat(document.getElementById('cara-mu').value);
  const sigma2 = parseFloat(document.getElementById('cara-var').value);
  const I      = parseFloat(document.getElementById('cara-I').value);
  if ([gamma,W0,mu,sigma2,I].some(isNaN) || gamma<=0 || sigma2<0) {
    showResult('cara-result','⚠ Invalid inputs.'); return;
  }
  const riskPremium = (gamma / 2) * sigma2;
  const CE = W0 + mu - riskPremium;
  const invest = CE >= W0 + I;

  showResult('cara-result',
    `<strong>Formula:</strong> $CE = W_0 + \\mu - \\frac{\\gamma}{2}\\sigma^2$<br><br>
    <strong>Risk premium:</strong> $\\frac{\\gamma}{2}\\sigma^2 = \\frac{${gamma}}{2}\\cdot${sigma2} = ${fmt(riskPremium,4)}$<br>
    <strong>Certainty equivalent:</strong> $CE = ${W0} + ${mu} - ${fmt(riskPremium,4)} = ${fmt(CE,4)}$<br>
    <strong>Expected wealth:</strong> $E[W] = W_0 + \\mu = ${W0+mu}$<br><br>
    <strong>Investment decision:</strong> Invest iff $CE \\geq W_0 + I = ${W0+I}$<br>
    → $CE = ${fmt(CE,2)}$ ${invest ? '≥' : '<'} ${W0+I}: <strong>${invest ? '✅ INVEST' : '❌ DO NOT INVEST'}</strong><br><br>
    <em>Condition: $\\mu - \\frac{\\gamma}{2}\\sigma^2 \\geq I$ → ${fmt(mu-riskPremium,2)} ${invest? '≥' : '<'} ${I}</em>`
  );
}

// ── Calculator: Monopoly ──────────────────────────────────────
function calcMonopoly() {
  const a = parseFloat(document.getElementById('mn-a').value);
  const b = parseFloat(document.getElementById('mn-b').value);
  const c = parseFloat(document.getElementById('mn-c').value);
  if ([a,b,c].some(isNaN) || b<=0 || a<=c) {
    showResult('mn-result','⚠ Need a > c and b > 0.'); return;
  }
  const Qm  = (a - c) / (2 * b);
  const Pm  = a - b * Qm;
  const pim = (Pm - c) * Qm;
  const Qc  = (a - c) / b;
  const Pc  = c;
  const DWL = 0.5 * (Pm - Pc) * (Qc - Qm);
  const CS_m = 0.5 * (a - Pm) * Qm;
  const Lerner = (Pm - c) / Pm;

  showResult('mn-result',
    `<strong>Monopoly:</strong> $MR = a - 2bQ = MC = c$<br>
    $Q^M = ${fmt(Qm)}$, $P^M = ${fmt(Pm)}$, $\\pi^M = ${fmt(pim)}$<br>
    <strong>Lerner Index:</strong> $(P-MC)/P = ${fmt(Lerner,4)}$ (markup = ${(Lerner*100).toFixed(1)}%)<br><br>
    <strong>Competitive benchmark:</strong> $Q^C = ${fmt(Qc)}$, $P^C = ${fmt(Pc)}$<br>
    <strong>Consumer surplus (monopoly):</strong> $CS = ${fmt(CS_m)}$<br>
    <strong>Deadweight loss:</strong> $DWL = ${fmt(DWL)}$ (welfare triangle)`
  );
  drawMonopolyChart(a, b, c, Qm, Pm, Qc);
}

function drawMonopolyChart(a, b, c, Qm, Pm, Qc) {
  const canvas = document.getElementById('mn-chart');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = canvas.width, H = canvas.height;
  const pad = { l:50, r:20, t:20, b:40 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;

  const Qmax = Qc * 1.15;
  const Pmax = a * 1.05;

  function tx(q) { return pad.l + (q / Qmax) * cW; }
  function ty(p) { return pad.t + cH - (p / Pmax) * cH; }

  ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t+cH); ctx.lineTo(pad.l+cW, pad.t+cH); ctx.stroke();

  ctx.strokeStyle = '#003262'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let q = 0; q <= Qmax; q += Qmax/200) {
    const p = a - b * q;
    if (p < 0) break;
    q === 0 ? ctx.moveTo(tx(q), ty(p)) : ctx.lineTo(tx(q), ty(p));
  }
  ctx.stroke();

  ctx.strokeStyle = '#1e64b4'; ctx.lineWidth = 2; ctx.setLineDash([5,4]);
  ctx.beginPath();
  for (let q = 0; q <= Qmax; q += Qmax/200) {
    const mr = a - 2 * b * q;
    if (q === 0) ctx.moveTo(tx(q), ty(Math.max(mr, 0)));
    else if (mr >= 0) ctx.lineTo(tx(q), ty(mr));
  }
  ctx.stroke(); ctx.setLineDash([]);

  ctx.strokeStyle = '#007840'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(tx(0), ty(c)); ctx.lineTo(tx(Qmax), ty(c)); ctx.stroke();

  ctx.fillStyle = 'rgba(180,30,30,0.15)';
  ctx.beginPath();
  ctx.moveTo(tx(Qm), ty(Pm));
  ctx.lineTo(tx(Qm), ty(c));
  ctx.lineTo(tx(Qc), ty(c));
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = '#aaa'; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(tx(Qm), ty(Pm)); ctx.lineTo(tx(Qm), ty(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx(Qm), ty(Pm)); ctx.lineTo(tx(0), ty(Pm)); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#003262';
  ctx.beginPath(); ctx.arc(tx(Qm), ty(Pm), 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#007840';
  ctx.beginPath(); ctx.arc(tx(Qc), ty(c), 5, 0, Math.PI*2); ctx.fill();

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#003262'; ctx.fillText('Demand', tx(Qmax*0.05), ty(a - b*Qmax*0.05) - 6);
  ctx.fillStyle = '#1e64b4'; ctx.fillText('MR', tx(Qmax*0.05), ty(a - 2*b*Qmax*0.05) - 6);
  ctx.fillStyle = '#007840'; ctx.fillText('MC', tx(Qmax*0.92), ty(c) - 6);
  ctx.fillStyle = '#333';
  ctx.fillText('Q^M=' + fmt(Qm,1), tx(Qm)-2, ty(0)+14);
  ctx.fillText('Q^C=' + fmt(Qc,1), tx(Qc)-2, ty(0)+14);
  ctx.fillText('P^M=' + fmt(Pm,1), 2, ty(Pm)+4);
  ctx.fillStyle = '#b41e1e';
  ctx.fillText('DWL', tx(Qm + (Qc-Qm)*0.5) - 10, ty(c + (Pm-c)*0.4));
  ctx.fillStyle = '#555';
  ctx.fillText('Q', pad.l+cW-10, pad.t+cH+16);
  ctx.fillText('P', pad.l-12, pad.t+8);
}

// ── Calculator: Oligopoly (Cournot + Stackelberg) ────────────
function calcOligopoly() {
  const a = parseFloat(document.getElementById('co-a').value);
  const b = parseFloat(document.getElementById('co-b').value);
  const c = parseFloat(document.getElementById('co-c').value);
  const n = parseInt(document.getElementById('co-n').value);
  if ([a,b,c,n].some(isNaN) || b<=0 || a<=c || n<1) {
    showResult('co-result','⚠ Need a > c, b > 0, n ≥ 1.'); return;
  }
  const q_c  = (a - c) / (b * (n + 1));
  const Q_c  = n * q_c;
  const P_c  = a - b * Q_c;
  const pi_c = (P_c - c) * q_c;

  const q1_s  = (a - c) / (2 * b);
  const q2_s  = (a - c) / (4 * b);
  const Q_s   = q1_s + q2_s;
  const P_s   = a - b * Q_s;
  const pi1_s = (P_s - c) * q1_s;
  const pi2_s = (P_s - c) * q2_s;

  const Q_comp = (a - c) / b;
  const P_comp = c;
  const Q_m = (a - c) / (2 * b);
  const P_m = a - b * Q_m;
  const pi_m = (P_m - c) * Q_m;

  showResult('co-result',
    `<strong>Cournot NE (${n} symmetric firms):</strong><br>
    $q^* = \\frac{a-c}{b(n+1)} = ${fmt(q_c)}$ per firm, $Q^* = ${fmt(Q_c)}$<br>
    $P^* = ${fmt(P_c)}$, $\\pi^*_{\\text{each}} = ${fmt(pi_c)}$<br><br>
    <strong>Stackelberg (2 firms, firm 1 leads):</strong><br>
    $q_1^* = ${fmt(q1_s)}$, $q_2^* = ${fmt(q2_s)}$, $P^* = ${fmt(P_s)}$<br>
    $\\pi_1 = ${fmt(pi1_s)}$ (leader), $\\pi_2 = ${fmt(pi2_s)}$ (follower)<br><br>
    <strong>Benchmarks:</strong><br>
    Monopoly: $P = ${fmt(P_m)}$, $\\pi = ${fmt(pi_m)}$<br>
    Competitive: $P = ${fmt(P_comp)}$, $Q = ${fmt(Q_comp)}$<br><br>
    <em>Bertrand (homogeneous goods): $P = MC = ${c}$, $\\pi = 0$</em>`
  );
}

// ── Calculator: Walrasian GE ──────────────────────────────────
function calcGE() {
  const alpha = parseFloat(document.getElementById('ge-alpha').value);
  const beta  = parseFloat(document.getElementById('ge-beta').value);
  const wAx   = parseFloat(document.getElementById('ge-wax').value);
  const wBy   = parseFloat(document.getElementById('ge-wby').value);

  if ([alpha,beta,wAx,wBy].some(isNaN) || wAx<=0 || wBy<=0 || alpha<=0 || alpha>=1 || beta<=0 || beta>=1) {
    showResult('ge-result','⚠ Check inputs: endowments > 0, shares in (0,1).'); return;
  }

  const px = (beta * wBy) / ((1 - alpha) * wAx);
  const mA = px * wAx;
  const mB = wBy;
  const xA = alpha * mA / px;
  const yA = (1 - alpha) * mA;
  const xB = beta * mB / px;
  const yB = (1 - beta) * mB;
  const xTotal = xA + xB;
  const yTotal = yA + yB;

  showResult('ge-result',
    `<strong>Equilibrium price:</strong> $p_x^* = \\frac{\\beta\\omega_{By}}{(1-\\alpha)\\omega_{Ax}} = ${fmt(px,4)}$, $p_y = 1$<br><br>
    <strong>Incomes:</strong> $m^A = p_x\\omega_{Ax} = ${fmt(mA,4)}$, $m^B = \\omega_{By} = ${fmt(mB,4)}$<br><br>
    <strong>Consumer A allocation:</strong> $(x_A, y_A) = (${fmt(xA,4)}, ${fmt(yA,4)})$<br>
    <strong>Consumer B allocation:</strong> $(x_B, y_B) = (${fmt(xB,4)}, ${fmt(yB,4)})$<br><br>
    <strong>Market clearing check:</strong><br>
    $x_A + x_B = ${fmt(xTotal,4)} = \\omega_{Ax} = ${wAx}$ ${Math.abs(xTotal-wAx)<0.0001?'✓':'⚠'}<br>
    $y_A + y_B = ${fmt(yTotal,4)} = \\omega_{By} = ${wBy}$ ${Math.abs(yTotal-wBy)<0.0001?'✓':'⚠'}`
  );
}

// ── Calculator: Pigouvian Tax ─────────────────────────────────
function calcPigouvian() {
  const p = parseFloat(document.getElementById('pig-p').value);
  const a = parseFloat(document.getElementById('pig-a').value);
  const d = parseFloat(document.getElementById('pig-d').value);

  if ([p,a,d].some(isNaN) || p<=0 || a<=0 || d<0) {
    showResult('pig-result','⚠ Invalid inputs.'); return;
  }
  const qP    = p / a;
  const qS    = p / (a + d);
  const tstar = d * qS;
  const DWL2  = ((a+d)*qP*qP/2 - p*qP) - ((a+d)*qS*qS/2 - p*qS);

  showResult('pig-result',
    `<strong>Private equilibrium:</strong> $p = C'(q^P) = aq^P$ → $q^P = ${fmt(qP,4)}$<br>
    <strong>Social optimum:</strong> $p = (a+d)q^S$ → $q^S = ${fmt(qS,4)}$<br>
    <strong>Optimal Pigouvian tax:</strong> $t^* = D'(q^S) = d\\cdot q^S = ${fmt(tstar,4)}$<br><br>
    <strong>Overproduction:</strong> $q^P - q^S = ${fmt(qP-qS,4)}$<br>
    <strong>Deadweight loss (without tax):</strong> $DWL \\approx ${fmt(Math.abs(DWL2),4)}$`
  );
}

// ── Shared result display ─────────────────────────────────────
function showResult(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  el.classList.add('show');
  if (window.MathJax) MathJax.typesetPromise([el]);
}

// ── Formula Bank ──────────────────────────────────────────────
const FORMULAS = [
  { name: 'MRS (general)',           expr: '$\\text{MRS}_{xy} = u_x / u_y$',                       tag: 'Consumer' },
  { name: 'MRS = price ratio',       expr: '$u_x/u_y = p_x/p_y$ at interior optimum',               tag: 'Consumer' },
  { name: 'Cobb-Douglas demand',     expr: '$x^* = \\alpha m/p_x,\\; y^* = (1-\\alpha)m/p_y$',      tag: 'Consumer' },
  { name: "Roy's Identity",          expr: '$x^* = -(\\partial v/\\partial p_x)/(\\partial v/\\partial m)$', tag: 'Duality' },
  { name: "Shephard's Lemma (consumer)", expr: '$\\partial e(p,\\bar u)/\\partial p_x = h_x(p,\\bar u)$', tag: 'Duality' },
  { name: 'Duality identity',        expr: '$e(p, v(p,m)) = m$;\\; v(p, e(p,\\bar u))=\\bar u$',    tag: 'Duality' },
  { name: 'Slutsky equation',        expr: '$\\partial x^*/\\partial p_x = \\partial h/\\partial p_x - x^*\\cdot\\partial x^*/\\partial m$', tag: 'Slutsky' },
  { name: 'Slutsky matrix (NSD)',    expr: '$v^\\top S v \\leq 0$ for all $v$; $S_{ij} = \\partial h_i/\\partial p_j$', tag: 'Slutsky' },
  { name: 'Euler equation',          expr: "$u'(c_0) = \\beta(1+r)u'(c_1)$",                       tag: 'Intertemporal' },
  { name: 'Consumption growth (log)',expr: '$c_1/c_0 = \\beta(1+r)$',                               tag: 'Intertemporal' },
  { name: 'CARA certainty equivalent', expr: '$CE = W_0 + \\mu - (\\gamma/2)\\sigma^2$',           tag: 'Risk' },
  { name: 'Arrow-Pratt ARA',         expr: "$A(w) = -u''(w)/u'(w)$",                               tag: 'Risk' },
  { name: "Jensen's Inequality",     expr: '$E[u(X)] \\leq u(E[X])$ for concave $u$',               tag: 'Risk' },
  { name: 'MRTS = input price ratio',expr: '$f_L/f_K = w/r$ at cost minimum',                       tag: 'Producer' },
  { name: "Shephard's Lemma (firm)", expr: '$\\partial c(w,r,q)/\\partial w = L^c$',                tag: 'Producer' },
  { name: 'Competitive FOC',         expr: '$p = MC(q^*)$',                                         tag: 'Competitive' },
  { name: 'IFT comparative static',  expr: '$\\partial x^*/\\partial \\alpha = -F_\\alpha/F_x$',   tag: 'IFT' },
  { name: 'Tax incidence (IFT)',     expr: '$dp^*/dt = \\varepsilon_S/(\\varepsilon_S - \\varepsilon_D)$', tag: 'IFT' },
  { name: "Hotelling's Lemma",       expr: '$\\partial \\pi^*(p,w)/\\partial p = y^*(p,w)$',        tag: 'Producer' },
  { name: 'MR = MC (monopoly)',      expr: '$P(1 + 1/\\varepsilon) = MC$',                          tag: 'Monopoly' },
  { name: 'Lerner Index',            expr: '$(P - MC)/P = 1/|\\varepsilon|$',                       tag: 'Monopoly' },
  { name: 'Cournot NE quantity',     expr: '$q^* = (a-c)/[b(n+1)]$',                               tag: 'Oligopoly' },
  { name: 'Cournot NE price',        expr: '$P^* = (a + nc)/(n+1)$',                               tag: 'Oligopoly' },
  { name: 'Stackelberg leader',      expr: '$q_1^* = (a-c)/(2b)$',                                 tag: 'Oligopoly' },
  { name: 'Walrasian clearing',      expr: '$\\sum_i x_i^*(p) = \\sum_i \\omega_i$',               tag: 'GE' },
  { name: "Walras' Law",             expr: '$\\sum_j p_j \\cdot z_j(p) = 0$ where $z_j$ = excess demand', tag: 'GE' },
  { name: 'Contract curve',          expr: '$\\text{MRS}^A = \\text{MRS}^B$',                      tag: 'GE' },
  { name: 'Robinson Crusoe equil.',  expr: "$\\text{MRS}_{\\ell c} = w/p = f'(L^*)$",              tag: 'GE' },
  { name: 'Pigouvian tax',           expr: "$t^* = D'(q^S)$ (MED at social optimum)",              tag: 'Externalities' },
  { name: 'Samuelson condition',     expr: '$\\sum_i MB_i = MC_G$ (public good)',                   tag: 'Public Goods' },
  { name: 'Lemons threshold',        expr: '$q^* = (c_H - v_L)/(v_H - v_L)$; market fails if $q < q^*$', tag: 'Info' },
  { name: 'Quasi-hyperbolic discount', expr: '$U_t = u_t + \\beta\\sum_{s>t}\\delta^{s-t}u_s$',   tag: 'Behavioral' },
];

function buildFormulaBank() {
  const container = document.getElementById('formula-table');
  if (!container) return;
  container.innerHTML = FORMULAS.map(f =>
    `<div class="formula-row" data-name="${f.name.toLowerCase()}" data-tag="${f.tag.toLowerCase()}">
      <span class="f-name">${f.name}</span>
      <span class="f-expr">${f.expr}</span>
      <span class="f-tag">${f.tag}</span>
    </div>`
  ).join('');
  if (window.MathJax) MathJax.typesetPromise([container]);

  // Search wiring — try both id variants
  const searchEl = document.getElementById('formula-search') || document.querySelector('.search-input');
  if (searchEl) {
    searchEl.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      container.querySelectorAll('.formula-row').forEach(row => {
        const match = row.dataset.name.includes(q) || row.dataset.tag.includes(q) || row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
      });
    });
  }
}

// ── Pattern Atlas ─────────────────────────────────────────────
const ATLAS = [
  { trigger: '"Derive demand" / "UMP"',        tool: 'Set up Lagrangian: $\\mathcal{L} = u - \\lambda(px-m)$. FOCs → $\\text{MRS}=p_x/p_y$ → solve tangency + budget.' },
  { trigger: '"Hicksian demand" / "compensated demand"', tool: "EMP Lagrangian OR apply Shephard's Lemma to $e(p,\\bar{u})$: $h_x = \\partial e/\\partial p_x$." },
  { trigger: '"Decompose price effect" / "SE and IE"', tool: 'Slutsky: TE = SE + IE. Find Hicksian $h_x$ at new prices with old utility → SE = $h_x - x_0^*$, IE = $x_1^* - h_x$.' },
  { trigger: '"Welfare of price change"',       tool: 'CV = $e(p^1,u^0) - m$. EV = $m - e(p^0,u^1)$. For small changes: $\\Delta CS \\approx$ area under Marshallian demand.' },
  { trigger: '"General equilibrium" / "Walrasian"', tool: '4-step: (1) Marshallian demands (2) normalize $p_y=1$ (3) market clearing for $x$ → solve $p_x^*$ (4) recover allocations.' },
  { trigger: '"Pareto optimal" / "contract curve"', tool: 'Set $\\text{MRS}^A = \\text{MRS}^B$. Substitute $x_B = \\bar\\omega_x - x_A$, $y_B = \\bar\\omega_y - y_A$ to get the contract curve equation.' },
  { trigger: '"Nash Equilibrium" / "Cournot"',  tool: "Write firm $i$'s FOC as best-response $q_i^R(q_{-i})$. Solve simultaneously for symmetric NE: $q^* = (a-c)/[b(n+1)]$." },
  { trigger: '"Stackelberg" / "leader-follower"', tool: "Backward induction: (1) firm 2's reaction $q_2^R(q_1)$ (2) firm 1 plugs $q_2^R$ into its profit and maximizes → $q_1^* = (a-c)/(2b)$." },
  { trigger: '"Prove monotone comparative static" / "how does x* change with α"', tool: 'IFT on FOC: define $F(x^*,\\alpha)=0$, compute $\\partial x^*/\\partial\\alpha = -F_\\alpha/F_{x^*}$. SOC ensures $F_{x^*} \\neq 0$.' },
  { trigger: '"CARA utility" + "Normal distribution"', tool: 'MGF trick: $E[e^{-\\gamma\\tilde{X}}]=e^{-\\gamma\\mu+\\gamma^2\\sigma^2/2}$. Then $CE = W_0 + \\mu - (\\gamma/2)\\sigma^2$.' },
  { trigger: '"Euler equation" / "intertemporal"', tool: 'FOC on $u(c_0)+\\beta u(c_1)$ s.t. budget: $u\'(c_0) = \\beta(1+r)u\'(c_1)$. Log utility → $c_1/c_0 = \\beta(1+r)$.' },
  { trigger: '"Robinson Crusoe" / "production economy"', tool: "Planner: $MRS_{\\ell c} = f'(L)$. Decentralize: firm sets $f'(L)=w/p$, consumer sets $U_\\ell/U_c = w/p$. Both give same condition → FWT." },
  { trigger: '"Lemons" / "adverse selection"',   tool: 'Compute buyer WTP $\\mu = qv_H + (1-q)v_L$. Check if $\\mu \\geq c_H$ (threshold $q^* = (c_H-v_L)/(v_H-v_L)$). If $q < q^*$: lemons equilibrium.' },
  { trigger: '"Pigouvian tax" / "externality optimum"', tool: "Find $q^S$ from social FOC: $p = C'(q^S) + D'(q^S)$. Set $t^* = D'(q^S)$. Evaluate MED at $q^S$, not $q^P$." },
  { trigger: '"Second-order condition" / "verify maximum"', tool: 'Compute Hessian of objective. For a max: diagonal elements $< 0$ (diminishing returns); for unconstrained: Hessian NSD.' },
  { trigger: '"Envelope theorem"',               tool: "$dV^*/d\\alpha = \\partial\\mathcal{L}/\\partial\\alpha|_{\\text{optimum}}$. No need to account for how $x^*$ changes — it's already been optimized." },
  { trigger: '"Expenditure function" / "minimum cost"', tool: 'EMP → $e(p,\\bar{u})$. Duality: $e(p,v(p,m))=m$. Shephard\'s lemma gives Hicksian demands. For CD: $e = \\bar{u}\\cdot p_x^\\alpha p_y^{1-\\alpha}/\\kappa$.' },
  { trigger: '"Tax incidence" / "who bears the tax"', tool: 'IFT on $D(p)=S(p-t)$: $dp^*/dt = \\varepsilon_S/(\\varepsilon_S-\\varepsilon_D)$. Consumer share = $\\varepsilon_S/(\\varepsilon_S-\\varepsilon_D)$. More inelastic side bears more.' },
  { trigger: '"Time inconsistency" / "present bias"', tool: 'Write $\\beta$-$\\delta$ utility: $U = u_0 + \\beta\\sum_{t>0}\\delta^t u_t$. Compare $t=0$ plan vs. $t=1$ reoptimized plan. Identify conflict → commitment device.' },
  { trigger: '"3rd degree price discrimination"', tool: 'Separate markets: $MR_1=MC$ and $MR_2=MC$ → $MR_1=MR_2=MC$. Higher price to inelastic market. Check $MR_i(0) \\geq MC$ for each market to be served.' },
];

function buildAtlas() {
  const grid = document.getElementById('atlas-grid');
  if (!grid) return;
  grid.innerHTML = ATLAS.map((item, i) =>
    `<div class="atlas-card" onclick="revealAtlas(${i})">
      <div class="atlas-trigger">
        <div class="alabel">When you see…</div>
        ${item.trigger}
      </div>
      <div class="reveal-hint">click to reveal →</div>
      <div class="atlas-tool" id="atlas-tool-${i}">${item.tool}</div>
    </div>`
  ).join('');
}

function revealAtlas(i) {
  const tool = document.getElementById('atlas-tool-' + i);
  if (!tool) return;
  const hint = tool.previousElementSibling;
  if (tool.classList.contains('show')) {
    tool.classList.remove('show');
    hint.textContent = 'click to reveal →';
  } else {
    tool.classList.add('show');
    hint.textContent = 'click to hide ↑';
    if (window.MathJax) MathJax.typesetPromise([tool]);
  }
}

// ── Mobile sidebar toggle ─────────────────────────────────────
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (!menuBtn || !sidebar) return;
  menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  // Close on nav link click
  document.querySelectorAll('.sidebar a').forEach(a =>
    a.addEventListener('click', () => sidebar.classList.remove('open'))
  );
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildFormulaBank();
  buildAtlas();
  initDarkMode();
  initScrollReveal();
  initScrollSpy();
  initMobileMenu();

  // D3 sliders wire immediately (D3 is a regular script, init'd before DOMContentLoaded fires)
  initBudgetICSliders();
  initSlutskySliders();
  initEdgeworthSliders();
  initSupplyDemandSliders();
  initCournotSliders();

  // Three.js is a module — its init fires async. We poll briefly for readiness.
  let tries = 0;
  const heroInterval = setInterval(() => {
    tries++;
    if (typeof window._three_updateSurface === 'function' || tries > 40) {
      clearInterval(heroInterval);
      initHeroSliders();
    }
  }, 150);
});
